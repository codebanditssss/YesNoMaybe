import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthentication } from '@/lib/server-utils';
import { supabaseAdmin } from '@/lib/supabase';

interface AdminMetrics {
  totalUsers: number;
  activeUsers24h: number;
  totalMarkets: number;
  activeMarkets: number;
  totalVolume: number;
  volume24h: number;
  totalTrades: number;
  trades24h: number;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    message: string;
  };
  recentAlerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
}

async function adminMetricsHandler(user: any, supabase: any, request: NextRequest): Promise<Response> {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 });
    }

    // Get total users
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('Error fetching user count:', usersError);
    }

    // Get active users in last 24h (users who made orders)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: activeUsersData, error: activeUsersError } = await supabaseAdmin
      .from('orders')
      .select('user_id')
      .gte('created_at', oneDayAgo.toISOString());

    const activeUsers24h = activeUsersData 
      ? new Set(activeUsersData.map(order => order.user_id)).size 
      : 0;

    // Get total and active markets
    const { count: totalMarkets, error: totalMarketsError } = await supabaseAdmin
      .from('markets')
      .select('*', { count: 'exact', head: true });

    const { count: activeMarkets, error: activeMarketsError } = await supabaseAdmin
      .from('markets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get total volume from user balances
    const { data: volumeData, error: volumeError } = await supabaseAdmin
      .from('user_balances')
      .select('total_volume');

    const totalVolume = volumeData?.reduce((sum, balance) => sum + (balance.total_volume || 0), 0) || 0;

    // Get 24h volume from recent orders
    const { data: recentOrders, error: recentOrdersError } = await supabaseAdmin
      .from('orders')
      .select('quantity, price, filled_quantity')
      .gte('created_at', oneDayAgo.toISOString())
      .eq('status', 'filled');

    const volume24h = recentOrders?.reduce((sum, order) => {
      const quantity = order.filled_quantity || order.quantity || 0;
      const price = order.price || 0;
      return sum + (quantity * price / 100);
    }, 0) || 0;

    // Get total trades
    const { count: totalTrades, error: totalTradesError } = await supabaseAdmin
      .from('trades')
      .select('*', { count: 'exact', head: true });

    // Get 24h trades
    const { count: trades24h, error: trades24hError } = await supabaseAdmin
      .from('trades')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneDayAgo.toISOString());

    // Calculate system health
    let systemHealth: AdminMetrics['systemHealth'] = {
      status: 'healthy',
      message: 'All systems operational'
    };

    // Check for system issues
    const errorCount = [
      usersError, activeUsersError, totalMarketsError, activeMarketsError,
      volumeError, recentOrdersError, totalTradesError, trades24hError
    ].filter(Boolean).length;

    if (errorCount > 0) {
      systemHealth = {
        status: errorCount > 3 ? 'critical' : 'warning',
        message: `${errorCount} database query errors detected`
      };
    }

    // Check trading volume health
    if (volume24h < 1000) { // Less than ₹1000 in 24h
      systemHealth = {
        status: 'warning',
        message: 'Low trading volume detected'
      };
    }

    // Generate sample alerts (in production, these would come from monitoring systems)
    const recentAlerts: AdminMetrics['recentAlerts'] = [];

    if (systemHealth.status !== 'healthy') {
      recentAlerts.push({
        id: 'system-health',
        type: systemHealth.status === 'critical' ? 'error' : 'warning',
        message: systemHealth.message,
        timestamp: new Date().toISOString()
      });
    }

    // Add some sample alerts for demonstration
    if (activeUsers24h < 5) {
      recentAlerts.push({
        id: 'low-activity',
        type: 'warning',
        message: 'Low user activity in the last 24 hours',
        timestamp: new Date().toISOString()
      });
    }

    if (activeMarkets === 0) {
      recentAlerts.push({
        id: 'no-markets',
        type: 'error',
        message: 'No active markets available for trading',
        timestamp: new Date().toISOString()
      });
    }

    const metrics: AdminMetrics = {
      totalUsers: totalUsers || 0,
      activeUsers24h,
      totalMarkets: totalMarkets || 0,
      activeMarkets: activeMarkets || 0,
      totalVolume,
      volume24h,
      totalTrades: totalTrades || 0,
      trades24h: trades24h || 0,
      systemHealth,
      recentAlerts
    };

    return NextResponse.json(metrics);

  } catch (error) {
    console.error('Admin metrics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch admin metrics' }, 
      { status: 500 }
    );
  }
}

export const GET = withAdminAuthentication(adminMetricsHandler); 