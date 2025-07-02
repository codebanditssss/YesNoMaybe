import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedUser } from '@/lib/auth'

async function portfolioSnapshotsHandler(request: NextRequest, user: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') // 'get' or 'create'
    const date = searchParams.get('date') // YYYY-MM-DD format

    if (action === 'create') {
      // Create daily snapshot (called by cron or manually)
      return await createDailySnapshot(user)
    } else {
      // Get snapshot for specific date or latest
      return await getSnapshot(user, date)
    }

  } catch (error) {
    console.error('Portfolio snapshots API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function createDailySnapshot(user: AuthenticatedUser) {
  try {
    // Get current portfolio value
    const { data: portfolio, error: portfolioError } = await supabaseAdmin!
      .from('portfolio_summary')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (portfolioError && portfolioError.code !== 'PGRST116') {
      console.error('Error fetching portfolio for snapshot:', portfolioError)
      return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
    }

    const totalValue = portfolio?.total_value || 0
    const totalInvested = portfolio?.total_invested || 0
    const totalPnL = totalValue - totalInvested

    // Create snapshot record
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    
    const { data: snapshot, error: snapshotError } = await supabaseAdmin!
      .from('portfolio_daily_snapshots')
      .upsert({
        user_id: user.id,
        snapshot_date: today,
        total_value: totalValue,
        total_invested: totalInvested,
        total_pnl: totalPnL,
        active_positions: portfolio?.active_positions || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,snapshot_date'
      })
      .select()
      .single()

    if (snapshotError) {
      console.error('Error creating portfolio snapshot:', snapshotError)
      return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Snapshot created successfully',
      snapshot 
    })

  } catch (error) {
    console.error('Error in createDailySnapshot:', error)
    return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 })
  }
}

async function getSnapshot(user: AuthenticatedUser, date?: string | null) {
  try {
    let query = supabaseAdmin!
      .from('portfolio_daily_snapshots')
      .select('*')
      .eq('user_id', user.id)

    if (date) {
      query = query.eq('snapshot_date', date)
    } else {
      // Get latest snapshot
      query = query.order('snapshot_date', { ascending: false }).limit(1)
    }

    const { data: snapshot, error } = await query.single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching snapshot:', error)
      return NextResponse.json({ error: 'Failed to fetch snapshot' }, { status: 500 })
    }

    // If no snapshot exists, return default values
    if (!snapshot) {
      return NextResponse.json({
        snapshot: null,
        hasSnapshot: false,
        message: 'No snapshot found for the specified date'
      })
    }

    return NextResponse.json({
      snapshot,
      hasSnapshot: true
    })

  } catch (error) {
    console.error('Error in getSnapshot:', error)
    return NextResponse.json({ error: 'Failed to fetch snapshot' }, { status: 500 })
  }
}

// Export the protected handler
export const GET = withAuth(portfolioSnapshotsHandler)
export const POST = withAuth(portfolioSnapshotsHandler) 