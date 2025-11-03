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
    
    // Fetch user profiles for all users with orders
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds)

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError)
    }

    // Create a mapping of user_id to display name
    const userMap = new Map((profiles || []).map(profile => [
      profile.id, 
      profile.full_name || profile.email?.split('@')[0] || 'Anonymous'
    ]))

    // Separate YES and NO orders (only include orders with remaining quantity)
    const yesOrders = (orders || [])
      .filter(order => order.side === 'YES' && order.quantity > (order.filled_quantity || 0))
      .sort((a, b) => b.price - a.price) // Highest price first for YES

    const noOrders = (orders || [])
      .filter(order => order.side === 'NO' && order.quantity > (order.filled_quantity || 0))
      .sort((a, b) => a.price - b.price) // Lowest price first for NO

    // Group orders by price level for YES side
    const yesBids = yesOrders.reduce((acc, order) => {
      const remainingQuantity = order.quantity - (order.filled_quantity || 0)
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
      const remainingQuantity = order.quantity - (order.filled_quantity || 0)
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
      .select('*')
      .eq('market_id', marketId)
      .order('created_at', { ascending: false })
      .limit(20)

    // Fetch order prices separately for trades
    const tradeIds = recentTrades?.map(t => t.id) || []
    const { data: yesOrderPrices } = tradeIds.length > 0 ? await supabase
      .from('orders')
      .select('id, price')
      .in('id', recentTrades?.map(t => t.yes_order_id).filter(Boolean) || []) : { data: null }
    
    const { data: noOrderPrices } = tradeIds.length > 0 ? await supabase
      .from('orders')
      .select('id, price')
      .in('id', recentTrades?.map(t => t.no_order_id).filter(Boolean) || []) : { data: null }

    const yesOrderMap = new Map((yesOrderPrices || []).map(order => [order.id, order.price]))
    const noOrderMap = new Map((noOrderPrices || []).map(order => [order.id, order.price]))

    const trades = recentTrades?.map(trade => ({
      id: trade.id,
      quantity: trade.quantity,
      price: yesOrderMap.get(trade.yes_order_id) || noOrderMap.get(trade.no_order_id) || trade.price || 0,
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
    const totalYesVolume = market.total_yes_volume || 0
    const totalNoVolume = market.total_no_volume || 0
    const totalVolume = totalYesVolume + totalNoVolume
    const currentPrice = totalVolume > 0 
      ? Math.round((totalYesVolume / totalVolume) * 100) 
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
      .select('quantity, price')
      .eq('market_id', marketId)
      .gte('created_at', oneDayAgo.toISOString())

    const volume24h = dayTrades?.reduce((sum, trade) => sum + trade.quantity, 0) || 0
    
    // Get price from 24h ago for price change calculation
    const { data: oldTrade } = await supabase
      .from('trades')
      .select('price')
      .eq('market_id', marketId)
      .lte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const priceChange24h = oldTrade?.price 
      ? currentPrice - oldTrade.price
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
        totalVolume: totalYesVolume + totalNoVolume,
        yesVolume: totalYesVolume,
        noVolume: totalNoVolume
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