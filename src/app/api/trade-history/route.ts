import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedUser, validateInput } from '@/lib/auth'

async function tradeHistoryHandler(request: NextRequest, user: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Cap at 100
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') // 'all', 'filled', 'pending', 'cancelled'
    const type = searchParams.get('type') // 'all', 'buy', 'sell'
    const side = searchParams.get('side') // 'all', 'YES', 'NO'
    const dateRange = searchParams.get('dateRange') // '1d', '7d', '30d', '90d', 'all'
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const search = searchParams.get('search') || ''

    // Validate sortBy parameter
    const allowedSortFields = ['created_at', 'updated_at', 'price', 'quantity', 'filled_quantity']
    if (!allowedSortFields.includes(sortBy)) {
      return NextResponse.json({ 
        error: `Invalid sortBy field. Allowed values: ${allowedSortFields.join(', ')}` 
      }, { status: 400 })
    }

    // Validate sortOrder parameter
    if (!['asc', 'desc'].includes(sortOrder)) {
      return NextResponse.json({ 
        error: 'Invalid sortOrder. Must be asc or desc' 
      }, { status: 400 })
    }

    // Base query for orders with market information
    let query = supabaseAdmin
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
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    // Apply status filter
    if (status && status !== 'all') {
      if (status === 'filled') {
        query = query.gt('filled_quantity', 0)
      } else {
        query = query.eq('status', status)
      }
    }

    // Apply side filter
    if (side && side !== 'all') {
      query = query.eq('side', side)
    }

    // Apply date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (dateRange) {
        case '1d':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0) // Beginning of time
      }

      query = query.gte('created_at', startDate.toISOString())
    }

    const { data: orders, error, count } = await query

    if (error) {
      console.error('Error fetching trade history:', error)
      return NextResponse.json({ error: 'Failed to fetch trade history' }, { status: 500 })
    }

    // Transform orders to trade history format
    let trades = (orders || []).map(order => ({
      id: order.id,
      userId: order.user_id,
      marketId: order.market_id,
      marketTitle: order.markets?.title || 'Unknown Market',
      marketCategory: order.markets?.category || 'other',
      marketStatus: order.markets?.status || 'unknown',
      resolutionDate: order.markets?.resolution_date,
      side: order.side,
      orderType: order.order_type || 'limit',
      quantity: order.quantity,
      price: order.price,
      filledQuantity: order.filled_quantity || 0,
      status: order.status,
      total: ((order.price || 0) * (order.filled_quantity || 0)) / 100,
      fees: ((order.price || 0) * (order.filled_quantity || 0)) / 100 * 0.01, // 1% fee
      timestamp: order.created_at,
      updatedAt: order.updated_at
    }))

    // Apply client-side search filter (since PostgREST doesn't support nested field search easily)
    if (search) {
      const searchLower = search.toLowerCase()
      trades = trades.filter(trade => 
        trade.marketTitle.toLowerCase().includes(searchLower) ||
        trade.marketCategory.toLowerCase().includes(searchLower) ||
        trade.side.toLowerCase().includes(searchLower) ||
        trade.status.toLowerCase().includes(searchLower)
      )
    }

    // Calculate statistics
    const filledTrades = trades.filter(trade => (trade.filledQuantity || 0) > 0)
    const completedTrades = trades.filter(trade => trade.status === 'filled')
    const pendingTrades = trades.filter(trade => trade.status === 'open')
    const cancelledTrades = trades.filter(trade => trade.status === 'cancelled')

    const totalVolume = filledTrades.reduce((sum, trade) => sum + (trade.filledQuantity || 0), 0)
    const totalFees = filledTrades.reduce((sum, trade) => sum + (trade.fees || 0), 0)
    const totalValue = filledTrades.reduce((sum, trade) => sum + (trade.total || 0), 0)

    // Calculate P&L (simplified - would need more complex logic for actual P&L)
    const totalPnL = 0 // TODO: Implement actual P&L calculation

    // Calculate win rate (simplified)
    const winRate = completedTrades.length > 0 ? (completedTrades.length / filledTrades.length) * 100 : 0

    // Calculate average trade size
    const avgTradeSize = filledTrades.length > 0 ? totalVolume / filledTrades.length : 0

    // Calculate execution time (simplified)
    const avgExecutionTime = 0 // TODO: Calculate actual execution time

    const stats = {
      totalTrades: trades.length,
      completedTrades: completedTrades.length,
      pendingTrades: pendingTrades.length,
      cancelledTrades: cancelledTrades.length,
      totalVolume,
      totalFees,
      totalPnL,
      winRate: Math.round(winRate * 100) / 100,
      avgTradeSize: Math.round(avgTradeSize * 100) / 100,
      bestTrade: 0, // TODO: Calculate best trade
      worstTrade: 0, // TODO: Calculate worst trade
      avgExecutionTime
    }

    const response = {
      trades,
      stats,
      pagination: {
        total: count || 0,
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

// Export the protected handler
export const GET = withAuth(tradeHistoryHandler) 