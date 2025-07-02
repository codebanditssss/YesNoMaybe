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

// Helper function to calculate position value at a point in time
function calculatePositionValue(trades: any[], marketData: any, timestamp: Date) {
  const relevantTrades = trades.filter(t => new Date(t.created_at) <= timestamp);
  
  if (relevantTrades.length === 0) return 0;

  let yesShares = 0;
  let noShares = 0;
  let totalInvested = 0;

  relevantTrades.forEach(trade => {
    if (trade.side === 'YES') {
      yesShares += trade.filled_quantity || 0;
    } else {
      noShares += trade.filled_quantity || 0;
    }
    totalInvested += (trade.filled_quantity || 0) * (trade.price / 100);
  });

  // For resolved markets
  if (marketData.status === 'resolved' && marketData.actual_outcome) {
    const winningShares = marketData.actual_outcome === 'YES' ? yesShares : noShares;
    return winningShares - totalInvested; // P&L
  }

  // For active markets
  const totalVolume = (marketData.total_yes_volume || 0) + (marketData.total_no_volume || 0);
  const currentYesPrice = totalVolume > 0 
    ? (marketData.total_yes_volume || 0) / totalVolume * 100 
    : 50;
  const currentNoPrice = 100 - currentYesPrice;

  const yesValue = yesShares * (currentYesPrice / 100);
  const noValue = noShares * (currentNoPrice / 100);
  const currentValue = yesValue + noValue;
  
  return currentValue - totalInvested; // P&L
}

async function portfolioHandler(request: NextRequest, user: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(request.url)
    
    const includeHistory = searchParams.get('include_history') === 'true'
    const historyLimit = parseInt(searchParams.get('history_limit') || '100')
    const timeframe = searchParams.get('timeframe') || 'ALL'

    // Validate history limit
    if (historyLimit < 1 || historyLimit > 1000) {
      return NextResponse.json({ error: 'History limit must be between 1 and 1000' }, { status: 400 })
    }

    // Use fallback date for filtering (user creation date not critical for portfolio)
    const userCreatedAt = new Date('2025-06-25') // Platform launch date fallback

    // Get date range for filtering, but never go before user creation
    const { start: timeframeStart, end } = getDateRange(timeframe)
    const start = timeframeStart < userCreatedAt ? userCreatedAt : timeframeStart

    // Get user balance
    let { data: userBalance, error: balanceError } = await serviceRoleClient
      .from('user_balances')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // If no balance exists, create one with default values
    if (!userBalance && balanceError?.code === 'PGRST116') {
      const { data: newBalance, error: createError } = await serviceRoleClient
        .from('user_balances')
        .insert({
          user_id: user.id,
          available_balance: 10000, // ₹10,000 initial balance
          locked_balance: 0,
          total_deposited: 10000,
          total_withdrawn: 0,
          total_trades: 0,
          winning_trades: 0,
          total_volume: 0,
          total_profit_loss: 0
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user balance:', { error: createError, userId: user.id, email: user.email })
        return NextResponse.json({ error: 'Failed to create user balance' }, { status: 500 })
      }

      userBalance = newBalance
      balanceError = null
    }

    if (balanceError) {
      console.error('Error fetching user balance:', { error: balanceError, userId: user.id, email: user.email })
      return NextResponse.json({ error: 'Failed to fetch user balance' }, { status: 500 })
    }

    // Fetch all orders for history (don't filter by timeframe for complete chart data)
    const { data: allOrders, error: allOrdersError } = await serviceRoleClient
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
      .gte('created_at', userCreatedAt.toISOString()) // Filter out orders before user creation
      .order('created_at', { ascending: true })

    if (allOrdersError) {
      console.error('Error fetching all orders:', allOrdersError)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }



    // For positions calculation, filter orders by timeframe
    const orders = allOrders?.filter(order => {
      const orderDate = new Date(order.updated_at);
      return orderDate >= start && orderDate <= end;
    }) || [];

    // Calculate positions and P&L for the time period
    const positionsByMarket = new Map()
    let periodTotalTrades = 0
    let periodWinningTrades = 0
    let periodTotalVolume = 0
    
    // Group orders by market for P&L calculation
    const ordersByMarket = new Map()
    orders?.forEach(order => {
      if (!ordersByMarket.has(order.market_id)) {
        ordersByMarket.set(order.market_id, [])
      }
      ordersByMarket.get(order.market_id).push(order)
    })
    
    orders?.forEach(order => {
      if (order.status !== 'filled') return // Only consider filled orders
      
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
          realizedPnL: 0,
          trades: [] // Track individual trades for P&L calculation
        })
      }

      const position = positionsByMarket.get(marketId)
      
      // Calculate effective quantity and investment
      const effectiveQuantity = order.filled_quantity || 0
      const investedAmount = effectiveQuantity * order.price / 100

      // Update position
      if (order.side === 'YES') {
        position.yesShares += effectiveQuantity
      } else {
        position.noShares += effectiveQuantity
      }
      position.totalInvested += investedAmount
      position.trades.push({
        side: order.side,
        quantity: effectiveQuantity,
        price: order.price,
        amount: investedAmount,
        created_at: order.created_at
      })

      // Update period statistics
      periodTotalTrades++
      periodTotalVolume += investedAmount

      // Calculate if this was a winning trade for resolved markets
      if (order.markets?.status === 'resolved' && order.markets?.actual_outcome) {
        const isWinningTrade = order.side === order.markets.actual_outcome
        if (isWinningTrade) {
          periodWinningTrades++
        }
      }
    })

    // Calculate final P&L for each position
    for (const position of positionsByMarket.values()) {
      const market = orders?.find(o => o.market_id === position.marketId)?.markets
      if (!market) continue

      if (market.status === 'active') {
        // For active markets, calculate P&L based on current market prices
        const totalVolume = (market.total_yes_volume || 0) + (market.total_no_volume || 0)
        const currentYesPrice = totalVolume > 0 
          ? (market.total_yes_volume || 0) / totalVolume * 100 
          : 50
        const currentNoPrice = 100 - currentYesPrice

        // Calculate unrealized P&L
        const yesValue = position.yesShares * currentYesPrice / 100
        const noValue = position.noShares * currentNoPrice / 100
        const currentValue = yesValue + noValue
        position.unrealizedPnL = currentValue - position.totalInvested
        position.realizedPnL = 0
      } else if (market.status === 'resolved' && market.actual_outcome) {
        // For resolved markets, calculate realized P&L
        const winningShares = market.actual_outcome === 'YES' ? position.yesShares : position.noShares
        const winningValue = winningShares // Each winning share is worth ₹1
        position.realizedPnL = winningValue - position.totalInvested
        position.unrealizedPnL = 0
      }
    }

    const portfolioPositions = Array.from(positionsByMarket.values())

    // Calculate period summary
    const totalUnrealizedPnL = portfolioPositions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0)
    const totalRealizedPnL = portfolioPositions.reduce((sum, pos) => sum + pos.realizedPnL, 0)
    const totalInvested = portfolioPositions.reduce((sum, pos) => sum + pos.totalInvested, 0)
    
    // Calculate period win rate
    const winRate = periodTotalTrades > 0 
      ? (periodWinningTrades / periodTotalTrades) * 100 
      : 0

    // Calculate total value (invested + unrealized P&L)
    const totalValue = totalInvested + totalUnrealizedPnL

    // Prepare history data for charts (use all orders for complete history)
    const historyData = allOrders
      ?.filter(o => o.status === 'filled')
      .map(order => {
        // Calculate P&L for this individual trade
        const tradeValue = (order.filled_quantity || 0) * order.price / 100;
        
        // For now, use simplified P&L calculation
        // TODO: This should be more sophisticated based on market resolution
        let tradePnL = 0;
        const market = order.markets;
        
        if (market?.status === 'resolved' && market?.actual_outcome) {
          // For resolved markets, calculate actual P&L
          const isWinner = order.side === market.actual_outcome;
          tradePnL = isWinner ? (order.filled_quantity || 0) - tradeValue : -tradeValue;
        } else {
          // For active markets, show investment as negative P&L for now
          tradePnL = -tradeValue;
        }

        return {
          id: order.id,
          marketId: order.market_id,
          marketTitle: order.markets?.title || 'Unknown Market',
          marketCategory: order.markets?.category || 'other',
          side: order.side,
          quantity: order.filled_quantity || 0,
          price: order.price,
          volume: tradeValue,
          pnl: tradePnL,
          totalValue: tradeValue, // This will be recalculated cumulatively in frontend
          createdAt: order.created_at
        };
      }) || [];

    // Return the response
    const response = {
      balance: {
        ...userBalance,
        // Override with period-specific stats
        total_trades: periodTotalTrades,
        winning_trades: periodWinningTrades,
        total_volume: periodTotalVolume,
        total_profit_loss: totalRealizedPnL + totalUnrealizedPnL
      },
      positions: portfolioPositions,
      summary: {
        totalValue,
        totalInvested,
        totalUnrealizedPnL,
        totalRealizedPnL,
        winRate,
        volume: periodTotalVolume
      },
      history: historyData
    };

    return NextResponse.json(response)

  } catch (error) {
    console.error('Portfolio handler error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Export the protected handler
export const GET = withAuth(portfolioHandler)