import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedUser, validateInput } from '@/lib/auth'

async function leaderboardHandler(request: NextRequest, user: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Cap at 100
    const offset = parseInt(searchParams.get('offset') || '0')
    const timeRange = searchParams.get('timeRange') || 'all' // 'all', '1d', '7d', '30d'
    const sortBy = searchParams.get('sortBy') || 'total_profit_loss' // 'total_profit_loss', 'total_trades', 'win_rate'
    const search = searchParams.get('search') || ''

    // Validate sortBy parameter
    const allowedSortFields = ['total_profit_loss', 'total_trades', 'winning_trades', 'total_volume']
    if (!allowedSortFields.includes(sortBy)) {
      return NextResponse.json({ 
        error: `Invalid sortBy field. Allowed values: ${allowedSortFields.join(', ')}` 
      }, { status: 400 })
    }

    // First fetch user balances
    const { data: leaderboardData, error: balanceError, count } = await supabase
      .from('user_balances')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: false })
      .range(offset, offset + limit - 1)

    if (balanceError) {
      console.error('Error fetching leaderboard:', balanceError)
      return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 })
    }

    // Then fetch profiles for these users
    const userIds = leaderboardData?.map(entry => entry.user_id) || []
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', userIds)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json({ error: 'Failed to fetch user profiles' }, { status: 500 })
    }

    // Create a map of profiles for quick lookup
    const profileMap = new Map(profilesData?.map(profile => [profile.id, profile]) || [])

    // Transform data to leaderboard format
    let leaderboardEntries = (leaderboardData || []).map((entry, index) => {
      const winRate = entry.total_trades > 0 ? (entry.winning_trades / entry.total_trades) * 100 : 0
      const profile = profileMap.get(entry.user_id)
      
      // Use real name from profile, fallback to user ID
      const displayName = profile?.full_name || `User ${entry.user_id.slice(-8)}`
      
      return {
        id: entry.user_id,
        rank: offset + index + 1,
        name: displayName,
        email: profile?.email || '',
        avatar: profile?.avatar_url || '',
        isVerified: Boolean(profile?.email),
        totalPnL: parseFloat(entry.total_profit_loss || '0'),
        totalTrades: entry.total_trades || 0,
        winningTrades: entry.winning_trades || 0,
        winRate: Math.round(winRate * 100) / 100,
        totalVolume: parseFloat(entry.total_volume || '0'),
        balance: parseFloat(entry.available_balance || '0'),
        isCurrentUser: entry.user_id === user.id,
        streak: 0, // TODO: Calculate win streak
        badges: [], // TODO: Implement badge system
        lastActive: entry.updated_at
      }
    })

    // Apply client-side search filter
    if (search) {
      const searchLower = search.toLowerCase()
      leaderboardEntries = leaderboardEntries.filter(entry => 
        entry.name.toLowerCase().includes(searchLower) ||
        entry.email.toLowerCase().includes(searchLower)
      )
    }

    // Calculate overall statistics
    const totalUsers = count || 0
    const activeTrades = leaderboardEntries.reduce((sum, entry) => sum + entry.totalTrades, 0)
    const totalVolume = leaderboardEntries.reduce((sum, entry) => sum + entry.totalVolume, 0)
    const avgWinRate = leaderboardEntries.length > 0 
      ? leaderboardEntries.reduce((sum, entry) => sum + entry.winRate, 0) / leaderboardEntries.length 
      : 0

    // Find current user's position if not in current page
    let currentUserRank = null
    if (!leaderboardEntries.some(entry => entry.isCurrentUser)) {
      const { data: userRankData, error: rankError } = await supabase
        .from('user_balances')
        .select('user_id, total_profit_loss')
        .order(sortBy, { ascending: false })

      if (!rankError && userRankData) {
        const userIndex = userRankData.findIndex(entry => entry.user_id === user.id)
        if (userIndex !== -1) {
          currentUserRank = userIndex + 1
        }
      }
    }

    const stats = {
      totalUsers,
      activeTrades,
      totalVolume: Math.round(totalVolume * 100) / 100,
      avgWinRate: Math.round(avgWinRate * 100) / 100,
      topPerformer: leaderboardEntries.length > 0 ? leaderboardEntries[0] : null,
      currentUserRank: currentUserRank || leaderboardEntries.find(e => e.isCurrentUser)?.rank || null
    }

    const response = {
      leaderboard: leaderboardEntries,
      stats,
      pagination: {
        total: totalUsers,
        limit,
        offset,
        hasMore: totalUsers > offset + limit
      },
      filters: {
        timeRange,
        sortBy,
        search
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Export the protected handler (leaderboard can be viewed by authenticated users)
export const GET = withAuth(leaderboardHandler)