import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // TODO: Replace with proper authentication
    // Temporarily using hardcoded user for testing
    const user = { id: '1208f76e-ec3f-4a1f-bd2f-2f5a1e33a247' };

    const includeHistory = searchParams.get('include_history') === 'true'
    const historyLimit = parseInt(searchParams.get('history_limit') || '20')

    // Fetch user balance
    const { data: userBalance, error: balanceError } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (balanceError || !userBalance) {
      return NextResponse.json({ error: 'User balance not found' }, { status: 404 })
    }

    // Fetch active positions (orders that have been partially or fully filled)
    const { data: positions, error: positionsError } = await supabase
      .from('orders')
      .select(`
        *,
        markets:market_id (
          id,
          title,
          category,
          status,
          resolution_date,
          actual_outcome,
          total_yes_volume,
          total_no_volume
        )
      `)
      .eq('user_id', user.id)
      .gt('filled_quantity', 0)
      .order('updated_at', { ascending: false })

    if (positionsError) {
      console.error('Error fetching positions:', positionsError)
      return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 })
    }

    // Calculate current positions by market
    const positionsByMarket = new Map()
    
    positions?.forEach(order => {
      const marketId = order.market_id
      if (!positionsByMarket.has(marketId)) {
        positionsByMarket.set(marketId, {
          marketId,
          marketTitle: order.markets?.title,
          marketCategory: order.markets?.category,
          marketStatus: order.markets?.status,
          resolutionDate: order.markets?.resolution_date,
          actualOutcome: order.markets?.actual_outcome,
          yesShares: 0,
          noShares: 0,
          totalInvested: 0,
          unrealizedPnL: 0,
          realizedPnL: 0
        })
      }

      const position = positionsByMarket.get(marketId)
      const investedAmount = order.filled_quantity * order.price / 100

      if (order.side === 'YES') {
        position.yesShares += order.filled_quantity
      } else {
        position.noShares += order.filled_quantity
      }
      position.totalInvested += investedAmount

      // Calculate current market price based on volume
      const totalVolume = (order.markets?.total_yes_volume || 0) + (order.markets?.total_no_volume || 0)
      const currentYesPrice = totalVolume > 0 
        ? (order.markets?.total_yes_volume || 0) / totalVolume * 100 
        : 50

      // Calculate unrealized P&L for active markets
      if (order.markets?.status === 'active') {
        const yesValue = position.yesShares * currentYesPrice / 100
        const noValue = position.noShares * (100 - currentYesPrice) / 100
        position.unrealizedPnL = (yesValue + noValue) - position.totalInvested
      }

      // Calculate realized P&L for resolved markets
      if (order.markets?.status === 'resolved' && order.markets?.actual_outcome) {
        const winningShares = order.markets.actual_outcome === 'YES' 
          ? position.yesShares 
          : position.noShares
        position.realizedPnL = winningShares - position.totalInvested
        position.unrealizedPnL = 0 // No unrealized P&L for resolved markets
      }
    })

    const portfolioPositions = Array.from(positionsByMarket.values())

    // Calculate portfolio summary
    const totalUnrealizedPnL = portfolioPositions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0)
    const totalRealizedPnL = portfolioPositions.reduce((sum, pos) => sum + pos.realizedPnL, 0)
    const totalInvested = portfolioPositions.reduce((sum, pos) => sum + pos.totalInvested, 0)
    const totalValue = totalInvested + totalUnrealizedPnL + totalRealizedPnL

    // Fetch trade history if requested (from filled orders since we don't have matched trades yet)
    let tradeHistory = []
    if (includeHistory) {
      const { data: orderHistory, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          market_id,
          side,
          price,
          filled_quantity,
          created_at,
          markets:market_id (
            title,
            category
          )
        `)
        .eq('user_id', user.id)
        .gt('filled_quantity', 0)
        .order('created_at', { ascending: false })
        .limit(historyLimit)

      if (!orderError && orderHistory) {
        tradeHistory = orderHistory.map(order => ({
          id: order.id,
          marketId: order.market_id,
          marketTitle: order.markets?.title,
          marketCategory: order.markets?.category,
          side: order.side,
          quantity: order.filled_quantity,
          price: order.price,
          pnl: 0, // TODO: Calculate actual P&L when positions are closed
          createdAt: order.created_at
        }))
      }
    }

    // Calculate win rate from user balance stats (more reliable than individual trades)
    const winRate = userBalance.total_trades > 0 
      ? (userBalance.winning_trades / userBalance.total_trades) * 100 
      : 0

    const portfolioSummary = {
      balance: {
        available: parseFloat(userBalance.available_balance),
        total: totalValue,
        invested: totalInvested,
        unrealizedPnL: totalUnrealizedPnL,
        realizedPnL: totalRealizedPnL
      },
      stats: {
        totalTrades: userBalance.total_trades || 0,
        winningTrades: userBalance.winning_trades || 0,
        winRate: Math.round(winRate * 100) / 100,
        profitLoss: parseFloat(userBalance.total_profit_loss || 0),
        activePositions: portfolioPositions.filter(pos => pos.marketStatus === 'active').length,
        resolvedPositions: portfolioPositions.filter(pos => pos.marketStatus === 'resolved').length
      },
      positions: portfolioPositions,
      ...(includeHistory && { tradeHistory })
    }

    return NextResponse.json(portfolioSummary)

  } catch (error) {
    console.error('Portfolio API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 