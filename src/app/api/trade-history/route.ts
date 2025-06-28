import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') // 'all', 'filled', 'pending', 'cancelled'
    const type = searchParams.get('type') // 'all', 'buy', 'sell'
    const side = searchParams.get('side') // 'all', 'YES', 'NO'
    const dateRange = searchParams.get('dateRange') // '1d', '7d', '30d', '90d', 'all'
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const search = searchParams.get('search') || ''

    // Base query for orders with market information
    let query = supabase
      .from('orders')
      .select(`
        id,
        user_id,
        market_id,
        side,
        quantity,
        price,
        filled_quantity,
        status,
        order_type,
        created_at,
        updated_at,
        markets (
          title,
          category,
          status,
          resolution_date
        )
      `)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .limit(limit)
      .range(offset, offset + limit - 1)

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId)
    }
    // For testing purposes, if no userId is provided, we'll fetch all orders
    // In production, you'd want to require authentication and filter by the authenticated user

    if (status && status !== 'all') {
      if (status === 'filled') {
        query = query.gt('filled_quantity', 0)
      } else {
        query = query.eq('status', status)
      }
    }

    if (side && side !== 'all') {
      query = query.eq('side', side.toUpperCase())
    }

    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const days = parseInt(dateRange.replace('d', ''))
      const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      query = query.gte('created_at', dateThreshold.toISOString())
    }

    // Search filter - we'll do this client-side for now due to PostgREST limitations with nested searches
    // if (search) {
    //   query = query.like('markets.title', `%${search}%`)
    // }

    const { data: orders, error, count } = await query

    if (error) {
      console.error('Error fetching trade history:', error)
      console.error('Error details:', { code: error.code, message: error.message, details: error.details })
      return NextResponse.json({ 
        error: 'Failed to fetch trade history', 
        details: error.message 
      }, { status: 500 })
    }

    console.log(`Fetched ${(orders || []).length} orders successfully`)

    // Transform orders data to trade history format
    let transformedTrades = (orders || []).map(order => {
      const market = order.markets
      const isPartiallyFilled = (order.filled_quantity || 0) > 0 && (order.filled_quantity || 0) < (order.quantity || 0)
      const isFilled = (order.filled_quantity || 0) > 0
      const actualQuantity = order.filled_quantity || order.quantity || 0
      const actualTotal = ((order.price || 0) * actualQuantity) / 100
      const fees = actualTotal * 0.01 // Calculate 1% fee
      const netAmount = actualTotal + fees

      return {
        id: order.id,
        marketId: order.market_id,
        marketTitle: market?.title || 'Unknown Market',
        category: market?.category || 'other',
        type: 'buy' as const, // All orders in our system are buy orders
        side: (order.side || 'YES').toLowerCase() as 'yes' | 'no',
        quantity: actualQuantity,
        price: order.price || 0,
        total: actualTotal,
        fees: fees,
        netAmount: netAmount,
        timestamp: new Date(order.created_at || Date.now()),
        status: isFilled ? 'completed' : (
          order.status === 'cancelled' ? 'cancelled' : 'pending'
        ),
        orderType: (order.order_type || 'market').toLowerCase() as 'market' | 'limit',
        pnl: isFilled ? 0 : undefined, // TODO: Calculate P&L based on current market price
        pnlPercent: isFilled ? 0 : undefined,
        executionTime: isFilled ? Math.random() * 2 : 0, // Mock execution time for now
        liquidityProvider: false,
        isPartiallyFilled,
        originalQuantity: order.quantity || 0,
        filledQuantity: order.filled_quantity || 0,
        marketStatus: market?.status || 'active',
        resolutionDate: market?.resolution_date ? new Date(market.resolution_date) : null
      }
    })

    // Apply client-side search filter if provided
    if (search) {
      transformedTrades = transformedTrades.filter(trade => 
        trade.marketTitle.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Calculate trade statistics
    const completedTrades = transformedTrades.filter(trade => trade.status === 'completed')
    const totalVolume = completedTrades.reduce((sum, trade) => sum + trade.total, 0)
    const totalFees = completedTrades.reduce((sum, trade) => sum + trade.fees, 0)
    const totalPnL = completedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
    const winningTrades = completedTrades.filter(trade => (trade.pnl || 0) > 0)
    
    const stats = {
      totalTrades: transformedTrades.length,
      completedTrades: completedTrades.length,
      pendingTrades: transformedTrades.filter(t => t.status === 'pending').length,
      cancelledTrades: transformedTrades.filter(t => t.status === 'cancelled').length,
      totalVolume,
      totalFees,
      totalPnL,
      winRate: completedTrades.length > 0 ? (winningTrades.length / completedTrades.length) * 100 : 0,
      avgTradeSize: completedTrades.length > 0 ? totalVolume / completedTrades.length : 0,
      bestTrade: completedTrades.length > 0 ? Math.max(...completedTrades.map(t => t.pnl || 0)) : 0,
      worstTrade: completedTrades.length > 0 ? Math.min(...completedTrades.map(t => t.pnl || 0)) : 0,
      avgExecutionTime: completedTrades.length > 0 
        ? completedTrades.reduce((sum, trade) => sum + trade.executionTime, 0) / completedTrades.length 
        : 0
    }

    const response = {
      trades: transformedTrades,
      stats,
      pagination: {
        total: count || transformedTrades.length,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Trade history API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 