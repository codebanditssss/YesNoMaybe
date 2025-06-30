"use strict";

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedUser, validateInput } from '@/lib/auth'

const serviceRoleClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper function to get date range based on timeframe
function getDateRange(timeframe: string): { start: Date, end: Date } {
  const end = new Date();
  let start = new Date();

  switch (timeframe) {
    case '1D':
      start.setDate(end.getDate() - 1);
      break;
    case '1W':
      start.setDate(end.getDate() - 7);
      break;
    case '1M':
      start.setMonth(end.getMonth() - 1);
      break;
    case '3M':
      start.setMonth(end.getMonth() - 3);
      break;
    case '1Y':
      start.setFullYear(end.getFullYear() - 1);
      break;
    default: // ALL
      start = new Date(0); // Beginning of time
  }

  return { start, end };
}

async function portfolioHandler(request: NextRequest, user: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(request.url)
    
    const includeHistory = searchParams.get('include_history') === 'true'
    const historyLimit = parseInt(searchParams.get('history_limit') || '20')
    const timeframe = searchParams.get('timeframe') || 'ALL'

    // Validate history limit
    if (historyLimit < 1 || historyLimit > 100) {
      return NextResponse.json({ error: 'History limit must be between 1 and 100' }, { status: 400 })
    }

    // Get date range for filtering
    const { start, end } = getDateRange(timeframe)

    // Get existing user balance or create new one if not exists
    let { data: userBalance, error: balanceError } = await serviceRoleClient
      .from('user_balances')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Only create new record if user doesn't exist, don't overwrite existing data
    if (balanceError && balanceError.code === 'PGRST116') {
      const { data: newBalance, error: insertError } = await serviceRoleClient
        .from('user_balances')
        .insert({
          user_id: user.id,
          available_balance: 1000,
          locked_balance: 0,
          total_deposited: 1000,
          total_withdrawn: 0,
          total_trades: 0,
          winning_trades: 0,
          total_volume: 0,
          total_profit_loss: 0
        })
        .select('*')
        .single()

      if (insertError) {
        console.error('Error creating user balance:', { error: insertError, userId: user.id, email: user.email })
        return NextResponse.json({ error: 'Failed to create user balance' }, { status: 500 })
      }
      userBalance = newBalance
      balanceError = null
    }

    if (balanceError) {
      console.error('Error initializing user balance:', { error: balanceError, userId: user.id, email: user.email })
      return NextResponse.json({ error: 'Failed to initialize user balance' }, { status: 500 })
    }

    // Fetch all orders within the time range
    const { data: positions, error: positionsError } = await serviceRoleClient
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
      .in('status', ['filled', 'partial', 'open'])
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
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
      
      // For filled/partial orders, use filled_quantity; for open orders, use full quantity
      const effectiveQuantity = order.status === 'open' ? order.quantity : order.filled_quantity
      const investedAmount = order.status === 'open' 
        ? order.quantity * order.price / 100  // Full order value for open orders
        : order.filled_quantity * order.price / 100  // Only filled portion for completed orders

      if (order.side === 'YES') {
        position.yesShares += effectiveQuantity
      } else {
        position.noShares += effectiveQuantity
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
    
    // Calculate total portfolio value: available + locked + unrealized P&L
    const totalValue = (userBalance.available_balance || 0) + (userBalance.locked_balance || 0) + totalUnrealizedPnL

    // Fetch trade history if requested (from filled orders since we don't have matched trades yet)
    let tradeHistory = []
    if (includeHistory) {
      const { data: orderHistory, error: orderError } = await serviceRoleClient
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
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
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

    // Return the response
    return NextResponse.json({
      balance: userBalance,
      positions: portfolioPositions,
      summary: {
        totalValue,
        totalInvested,
        totalUnrealizedPnL,
        totalRealizedPnL,
        winRate,
        timeframe // Include the timeframe in the response
      },
      history: includeHistory ? tradeHistory : undefined
    })

  } catch (error) {
    console.error('Unexpected error in portfolio handler:', error)
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Export the protected handler
export const GET = withAuth(portfolioHandler)