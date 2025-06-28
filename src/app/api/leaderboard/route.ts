import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    // Fetch user leaderboard data from user_balances
    let query = supabase
      .from('user_balances')
      .select(`
        user_id,
        username,
        full_name,
        total_trades,
        winning_trades,
        total_profit_loss,
        available_balance,
        total_deposited,
        total_volume
      `)
      .order('total_profit_loss', { ascending: false })
      .limit(limit)

    // Apply search filter if provided
    if (search) {
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    const { data: leaderboardData, error } = await query

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }

    // Transform and rank the data
    const transformedData = (leaderboardData || []).map((user, index) => {
      const totalTrades = user.total_trades || 0
      const winningTrades = user.winning_trades || 0
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
      const totalPnL = parseFloat(user.total_profit_loss || '0')
      const totalVolume = parseFloat(user.total_volume || '0')

      return {
        id: user.user_id,
        username: user.username || 'Anonymous',
        displayName: user.full_name || user.username || 'Anonymous User',
        rank: index + 1,
        totalPnL: totalPnL,
        winRate: winRate,
        totalTrades: totalTrades,
        winningTrades: winningTrades,
        totalVolume: totalVolume,
        availableBalance: parseFloat(user.available_balance || '0'),
        totalDeposited: parseFloat(user.total_deposited || '0')
      }
    })

    // Calculate aggregated statistics
    const totalUsers = transformedData.length
    const avgWinRate = totalUsers > 0 
      ? transformedData.reduce((sum, user) => sum + user.winRate, 0) / totalUsers 
      : 0
    const topPerformer = transformedData[0]
    const totalVolume = transformedData.reduce((sum, user) => sum + user.totalVolume, 0)
    const totalTrades = transformedData.reduce((sum, user) => sum + user.totalTrades, 0)

    const response = {
      leaderboard: transformedData,
      stats: {
        totalUsers,
        avgWinRate: Math.round(avgWinRate * 100) / 100,
        topPerformer: topPerformer ? {
          username: topPerformer.username,
          displayName: topPerformer.displayName,
          totalPnL: topPerformer.totalPnL
        } : null,
        totalVolume,
        totalTrades
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 