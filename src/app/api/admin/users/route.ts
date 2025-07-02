import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthentication } from '@/lib/server-utils';
import { supabaseAdmin } from '@/lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  created_at: string;
  is_verified: boolean;
  avatar_url: string | null;
  balance: {
    available_balance: number;
    locked_balance: number;
    total_deposited: number;
    total_trades: number;
    winning_trades: number;
    total_volume: number;
    total_profit_loss: number;
  } | null;
  role: string;
  status: 'active' | 'suspended' | 'banned';
  last_active: string | null;
}

async function adminUsersHandler(user: any, supabase: any, request: NextRequest): Promise<Response> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'all';

    const offset = (page - 1) * limit;

    // Build the base query for profiles
    let profileQuery = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply search filter if provided
    if (search) {
      profileQuery = profileQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);
    }

    const { data: profiles, error: profilesError, count: totalCount } = await profileQuery;

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Get user IDs for balance lookup
    const userIds = profiles?.map(profile => profile.id) || [];

    // Fetch user balances
    const { data: balances, error: balancesError } = await supabaseAdmin
      .from('user_balances')
      .select('*')
      .in('user_id', userIds);

    if (balancesError) {
      console.error('Error fetching balances:', balancesError);
    }

    // Create a map of balances for quick lookup
    const balanceMap = new Map(balances?.map(balance => [balance.user_id, balance]) || []);

    // Get last activity from orders (last order created)
    const { data: lastActivities, error: activitiesError } = await supabaseAdmin
      .from('orders')
      .select('user_id, created_at')
      .in('user_id', userIds)
      .order('created_at', { ascending: false });

    if (activitiesError) {
      console.error('Error fetching last activities:', activitiesError);
    }

    // Create a map of last activities
    const activityMap = new Map();
    lastActivities?.forEach(activity => {
      if (!activityMap.has(activity.user_id)) {
        activityMap.set(activity.user_id, activity.created_at);
      }
    });

    // Transform the data to match AdminUser interface
    const adminUsers: AdminUser[] = (profiles || []).map(profile => {
      const balance = balanceMap.get(profile.id);
      const lastActive = activityMap.get(profile.id);

      // For now, we'll determine user status based on verification
      // In a real app, you'd have a separate status field
      let status: 'active' | 'suspended' | 'banned' = 'active';
      
      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        username: profile.username,
        created_at: profile.created_at,
        is_verified: profile.is_verified || false,
        avatar_url: profile.avatar_url,
        balance: balance ? {
          available_balance: balance.available_balance,
          locked_balance: balance.locked_balance,
          total_deposited: balance.total_deposited,
          total_trades: balance.total_trades,
          winning_trades: balance.winning_trades,
          total_volume: balance.total_volume,
          total_profit_loss: balance.total_profit_loss
        } : null,
        role: 'user', // For now, all users are 'user' role unless specifically set as admin
        status,
        last_active: lastActive
      };
    });

    // Apply status filter
    const filteredUsers = statusFilter === 'all' 
      ? adminUsers 
      : adminUsers.filter(user => user.status === statusFilter);

    return NextResponse.json({
      users: filteredUsers,
      total: totalCount || 0,
      page,
      limit,
      totalPages: Math.ceil((totalCount || 0) / limit)
    });

  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch users' }, 
      { status: 500 }
    );
  }
}

export const GET = withAdminAuthentication(adminUsersHandler); 