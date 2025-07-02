import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const marketId = searchParams.get('market_id')
    
    if (!marketId) {
      return NextResponse.json({ error: 'market_id is required' }, { status: 400 })
    }

    // Verify market exists
    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select('*')
      .eq('id', marketId)
      .single()

    if (marketError || !market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }

    // Fetch active orders for the market (orderbook)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('market_id', marketId)
      .eq('status', 'open')
      .order('price', { ascending: false }) // YES orders: highest price first, NO orders: lowest price first

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return NextResponse.json({ error: 'Failed to fetch orderbook' }, { status: 500 })
    }

    // Get unique user IDs from orders to fetch usernames
    const userIds = [...new Set((orders || []).map(order => order.user_id))]
    
    // Fetch usernames for all users with orders
    const { data: userBalances, error: usersError } = await supabase
      .from('user_balances')
      .select('user_id, username')
      .in('user_id', userIds)

    if (usersError) {
      console.error('Error fetching user data:', usersError)
    }

    // Create a mapping of user_id to username
    const userMap = new Map((userBalances || []).map(user => [user.user_id, user.username || 'Anonymous']))

    // Separate YES and NO orders (only include orders with remaining quantity)
    const yesOrders = (orders || [])
      .filter(order => order.side === 'YES' && order.quantity > order.filled_quantity)
      .sort((a, b) => b.price - a.price) // Highest price first for YES

    const noOrders = (orders || [])
      .filter(order => order.side === 'NO' && order.quantity > order.filled_quantity)
      .sort((a, b) => a.price - b.price) // Lowest price first for NO

    // Group orders by price level for YES side
    const yesBids = yesOrders.reduce((acc, order) => {
      const remainingQuantity = order.quantity - order.filled_quantity
      const existing = acc.find(bid => bid.price === order.price)
      
      if (existing) {
        existing.quantity += remainingQuantity
        existing.orders.push({
          id: order.id,
          quantity: remainingQuantity,
          username: userMap.get(order.user_id) || 'Anonymous'
        })
      } else {
        acc.push({
          price: order.price,
          quantity: remainingQuantity,
          orders: [{
            id: order.id,
            quantity: remainingQuantity,
            username: userMap.get(order.user_id) || 'Anonymous'
          }]
        })
      }
      return acc
    }, [] as Array<{
      price: number
      quantity: number
      orders: Array<{ id: string, quantity: number, username: string }>
    }>)

    // Group orders by price level for NO side
    const noAsks = noOrders.reduce((acc, order) => {
      const remainingQuantity = order.quantity - order.filled_quantity
      const existing = acc.find(ask => ask.price === order.price)
      
      if (existing) {
        existing.quantity += remainingQuantity
        existing.orders.push({
          id: order.id,
          quantity: remainingQuantity,
          username: userMap.get(order.user_id) || 'Anonymous'
        })
      } else {
        acc.push({
          price: order.price,
          quantity: remainingQuantity,
          orders: [{
            id: order.id,
            quantity: remainingQuantity,
            username: userMap.get(order.user_id) || 'Anonymous'
          }]
        })
      }
      return acc
    }, [] as Array<{
      price: number
      quantity: number
      orders: Array<{ id: string, quantity: number, username: string }>
    }>)

    // Fetch recent trades for this market
    const { data: recentTrades, error: tradesError } = await supabase
      .from('trades')
      .select(`
        *,
        yes_orders:yes_order_id (
          price
        ),
        no_orders:no_order_id (
          price
        )
      `)
      .eq('market_id', marketId)
      .order('created_at', { ascending: false })
      .limit(20)

    const trades = recentTrades?.map(trade => ({
      id: trade.id,
      quantity: trade.quantity,
      price: trade.yes_orders?.price || trade.no_orders?.price || 0,
      timestamp: trade.created_at,
      side: trade.winner_side as 'YES' | 'NO' | null
    })) || []

    // Calculate market statistics
    const totalYesQuantity = yesBids.reduce((sum, bid) => sum + bid.quantity, 0)
    const totalNoQuantity = noAsks.reduce((sum, ask) => sum + ask.quantity, 0)
    const totalOrderbookVolume = totalYesQuantity + totalNoQuantity

    // Best bid/ask prices
    const bestYesBid = yesBids.length > 0 ? yesBids[0].price : null
    const bestNoAsk = noAsks.length > 0 ? noAsks[0].price : null

    // Calculate current market price based on volume
    const totalVolume = market.total_yes_volume + market.total_no_volume
    const currentPrice = totalVolume > 0 
      ? Math.round((market.total_yes_volume / totalVolume) * 100) 
      : 50

    // Calculate spread
    const spread = bestYesBid && bestNoAsk 
      ? Math.abs(bestYesBid - (100 - bestNoAsk))
      : null

    // Calculate 24h volume and price change
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { data: dayTrades, error: dayTradesError } = await supabase
      .from('trades')
      .select('quantity, yes_orders:yes_order_id(price), no_orders:no_order_id(price)')
      .eq('market_id', marketId)
      .gte('created_at', oneDayAgo.toISOString())

    const volume24h = dayTrades?.reduce((sum, trade) => sum + trade.quantity, 0) || 0
    
    // Get price from 24h ago for price change calculation
    const { data: oldTrade } = await supabase
      .from('trades')
      .select('yes_orders:yes_order_id(price), no_orders:no_order_id(price)')
      .eq('market_id', marketId)
      .lte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const priceChange24h = oldTrade 
      ? currentPrice - (oldTrade.yes_orders?.price || oldTrade.no_orders?.price || currentPrice)
      : 0

    const orderbookData = {
      marketId,
      marketInfo: {
        title: market.title,
        category: market.category,
        status: market.status,
        resolutionDate: market.resolution_date,
        currentPrice,
        volume24h,
        priceChange24h,
        totalVolume: market.total_yes_volume + market.total_no_volume,
        yesVolume: market.total_yes_volume,
        noVolume: market.total_no_volume
      },
      orderbook: {
        yesBids, // Buying YES shares (supporting the outcome)
        noAsks,  // Selling NO shares (also supporting YES outcome)
        bestYesBid,
        bestNoAsk,
        spread,
        totalYesQuantity,
        totalNoQuantity,
        totalOrderbookVolume
      },
      recentTrades: trades,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(orderbookData)

  } catch (error) {
    console.error('Orderbook API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}