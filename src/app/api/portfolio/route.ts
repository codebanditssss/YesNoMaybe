import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedUser, validateInput } from '@/lib/auth'

async function portfolioHandler(request: NextRequest, user: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(request.url)
    
    const includeHistory = searchParams.get('include_history') === 'true'
    const historyLimit = parseInt(searchParams.get('history_limit') || '20')

    // Validate history limit
    if (historyLimit < 1 || historyLimit > 100) {
      return NextResponse.json({ error: 'History limit must be between 1 and 100' }, { status: 400 })
    }

    // First try to fetch existing balance
    const { data: existingBalance, error: fetchError } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    let userBalance = existingBalance

    // If no balance exists, try to initialize it
    if (!existingBalance && !fetchError) {
      try {
        // First try to insert directly
        const { data: directInsert, error: insertError } = await supabase
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
          .select()
          .maybeSingle()

        if (!insertError && directInsert) {
          userBalance = directInsert
        } else {
          // If direct insert fails, try the RPC function
          const { data: newBalance, error: initError } = await supabase
            .rpc('initialize_user_balance', {
              p_user_id: user.id
            })
            .maybeSingle()

          if (initError) {
            console.error('Error initializing user balance:', {
              error: initError,
              userId: user.id,
              email: user.email
            })
            return NextResponse.json({ 
              error: 'Failed to initialize user balance',
              details: initError.message,
              hint: 'Please try the following steps:\n1. Sign out\n2. Clear your browser cache\n3. Sign in again\n4. If the issue persists, contact support'
            }, { status: 500 })
          }

          userBalance = newBalance
        }
      } catch (initError) {
        console.error('Error initializing user balance:', {
          error: initError,
          userId: user.id,
          email: user.email
        })
        return NextResponse.json({ 
          error: 'Failed to initialize user balance',
          details: initError instanceof Error ? initError.message : 'Unknown error',
          hint: 'Please try the following steps:\n1. Sign out\n2. Clear your browser cache\n3. Sign in again\n4. If the issue persists, contact support'
        }, { status: 500 })
      }
    } else if (fetchError) {
      console.error('Error fetching existing balance:', {
        error: fetchError,
        userId: user.id,
        email: user.email
      })
      return NextResponse.json({ 
        error: 'Failed to fetch user balance',
        details: fetchError.message
      }, { status: 500 })
    }

    if (!userBalance) {
      console.error('No balance found for user:', {
        userId: user.id,
        email: user.email
      })
      return NextResponse.json({ 
        error: 'User balance not found',
        hint: 'Please ensure you are logged in with the correct account'
      }, { status: 404 })
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

    // Return the response
    return NextResponse.json({
      balance: userBalance,
      positions: portfolioPositions,
      summary: {
        totalValue,
        totalInvested,
        totalUnrealizedPnL,
        totalRealizedPnL,
        winRate
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