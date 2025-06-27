import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

    // Get user balance and stats
    const { data: userBalance, error: balanceError } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (balanceError) {
      console.error('Error fetching user balance:', balanceError);
      return NextResponse.json(
        { error: 'Failed to fetch user balance' },
        { status: 500 }
      );
    }

    // Get user's active orders
    const { data: activeOrders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        markets (
          title,
          category,
          status,
          resolution_date
        )
      `)
      .eq('user_id', user_id)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching active orders:', ordersError);
      return NextResponse.json(
        { error: 'Failed to fetch active orders' },
        { status: 500 }
      );
    }

    // Get user's recent trades
    const { data: recentTrades, error: tradesError } = await supabase
      .from('trades')
      .select(`
        *,
        markets (
          title,
          category,
          status
        )
      `)
      .or(`yes_user_id.eq.${user_id},no_user_id.eq.${user_id}`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (tradesError) {
      console.error('Error fetching recent trades:', tradesError);
      return NextResponse.json(
        { error: 'Failed to fetch recent trades' },
        { status: 500 }
      );
    }

    // Calculate portfolio positions
    const positions = new Map();
    
    // Process active orders to calculate positions
    activeOrders?.forEach(order => {
      const marketId = order.market_id;
      if (!positions.has(marketId)) {
        positions.set(marketId, {
          market_id: marketId,
          market_title: order.markets?.title,
          market_category: order.markets?.category,
          market_status: order.markets?.status,
          yes_quantity: 0,
          no_quantity: 0,
          yes_avg_price: 0,
          no_avg_price: 0,
          total_invested: 0,
          current_value: 0,
          pnl: 0
        });
      }
      
      const position = positions.get(marketId);
      if (order.side === 'YES') {
        position.yes_quantity += (order.quantity - order.filled_quantity);
        position.total_invested += (order.quantity - order.filled_quantity) * order.price;
      } else {
        position.no_quantity += (order.quantity - order.filled_quantity);
        position.total_invested += (order.quantity - order.filled_quantity) * order.price;
      }
    });

    // Process completed trades to add to positions
    recentTrades?.forEach(trade => {
      const marketId = trade.market_id;
      if (!positions.has(marketId)) {
        positions.set(marketId, {
          market_id: marketId,
          market_title: trade.markets?.title,
          market_category: trade.markets?.category,
          market_status: trade.markets?.status,
          yes_quantity: 0,
          no_quantity: 0,
          yes_avg_price: 0,
          no_avg_price: 0,
          total_invested: 0,
          current_value: 0,
          pnl: 0
        });
      }
      
      const position = positions.get(marketId);
      
      // Add quantities based on user's side in the trade
      if (trade.yes_user_id === user_id) {
        position.yes_quantity += trade.quantity;
        position.total_invested += trade.quantity * trade.price;
      }
      if (trade.no_user_id === user_id) {
        position.no_quantity += trade.quantity;
        position.total_invested += trade.quantity * trade.price;
      }
      
      // Add payouts if market is resolved
      if (trade.markets?.status === 'resolved') {
        if (trade.yes_user_id === user_id && trade.yes_payout > 0) {
          position.pnl += trade.yes_payout - (trade.quantity * trade.price);
        }
        if (trade.no_user_id === user_id && trade.no_payout > 0) {
          position.pnl += trade.no_payout - (trade.quantity * trade.price);
        }
      }
    });

    const portfolioPositions = Array.from(positions.values());

    // Calculate total portfolio value
    const totalInvested = portfolioPositions.reduce((sum, pos) => sum + pos.total_invested, 0);
    const totalPnL = portfolioPositions.reduce((sum, pos) => sum + pos.pnl, 0);

    const portfolioData = {
      user_balance: userBalance,
      active_orders: activeOrders || [],
      recent_trades: recentTrades || [],
      positions: portfolioPositions,
      portfolio_summary: {
        total_balance: userBalance?.available_balance || 0,
        total_invested: totalInvested,
        total_pnl: totalPnL,
        total_trades: userBalance?.total_trades || 0,
        winning_trades: userBalance?.winning_trades || 0,
        win_rate: userBalance?.total_trades > 0 
          ? ((userBalance?.winning_trades || 0) / userBalance.total_trades * 100).toFixed(1)
          : '0.0'
      }
    };

    return NextResponse.json(portfolioData);

  } catch (error) {
    console.error('Error in portfolio API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 