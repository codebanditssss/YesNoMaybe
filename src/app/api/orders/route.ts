import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { market_id, side, quantity, price, user_id } = body;

    // Validate required fields
    if (!market_id || !side || !quantity || !price || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: market_id, side, quantity, price, user_id' },
        { status: 400 }
      );
    }

    // Validate side
    if (!['YES', 'NO'].includes(side)) {
      return NextResponse.json(
        { error: 'Side must be either YES or NO' },
        { status: 400 }
      );
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

    // Check if market exists and is active
    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select('id, status, resolution_date')
      .eq('id', market_id)
      .single();

    if (marketError || !market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    if (market.status !== 'active') {
      return NextResponse.json(
        { error: 'Market is not active for trading' },
        { status: 400 }
      );
    }

    // Check if user has sufficient balance
    const { data: userBalance, error: balanceError } = await supabase
      .from('user_balances')
      .select('available_balance')
      .eq('user_id', user_id)
      .single();

    if (balanceError || !userBalance) {
      return NextResponse.json(
        { error: 'User balance not found' },
        { status: 404 }
      );
    }

    const requiredAmount = quantity * price;
    if (userBalance.available_balance < requiredAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Place the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        market_id,
        user_id,
        side,
        quantity,
        price,
        status: 'open',
        filled_quantity: 0
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error placing order:', orderError);
      return NextResponse.json(
        { error: 'Failed to place order' },
        { status: 500 }
      );
    }

    // Update user's available balance (lock the funds)
    const { error: updateBalanceError } = await supabase
      .from('user_balances')
      .update({
        available_balance: userBalance.available_balance - requiredAmount
      })
      .eq('user_id', user_id);

    if (updateBalanceError) {
      console.error('Error updating balance:', updateBalanceError);
      // Rollback the order if balance update fails
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to update balance' },
        { status: 500 }
      );
    }

    // Try to match the order
    const { error: matchError } = await supabase.rpc('match_order', {
      order_id: order.id
    });

    if (matchError) {
      console.error('Error matching order:', matchError);
      // Order is placed but matching failed - that's ok, it will remain open
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        market_id: order.market_id,
        side: order.side,
        quantity: order.quantity,
        price: order.price,
        status: order.status,
        created_at: order.created_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in orders API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const market_id = searchParams.get('market_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    let query = supabase
      .from('orders')
      .select(`
        *,
        markets (
          title,
          category
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (market_id) {
      query = query.eq('market_id', market_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json(orders || []);

  } catch (error) {
    console.error('Error in orders GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 