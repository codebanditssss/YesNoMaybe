import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // TODO: Replace with proper authentication
    // Temporarily using hardcoded user for testing
    const user = { id: '1208f76e-ec3f-4a1f-bd2f-2f5a1e33a247' };

    // Parse query parameters
    const status = searchParams.get('status'); // 'pending', 'filled', 'cancelled'
    const marketId = searchParams.get('market_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        markets:market_id (
          title,
          category,
          status
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (marketId) {
      query = query.eq('market_id', marketId);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Transform data for frontend
    const transformedOrders = orders?.map(order => ({
      id: order.id,
      marketId: order.market_id,
      marketTitle: order.markets?.title,
      marketCategory: order.markets?.category,
      side: order.side,
      quantity: order.quantity,
      price: order.price,
      status: order.status,
      filledQuantity: order.filled_quantity,
      remainingQuantity: order.quantity - order.filled_quantity,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    })) || [];

    return NextResponse.json({
      orders: transformedOrders,
      total: transformedOrders.length,
      hasMore: transformedOrders.length === limit
    });

  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    
    // TODO: Replace with proper authentication
    // Temporarily using hardcoded user for testing
    const user = { id: '1208f76e-ec3f-4a1f-bd2f-2f5a1e33a247' };

    const body = await request.json();
    const { marketId, side, quantity, price } = body;

    // Validation
    if (!marketId || !side || !quantity || price === undefined || price === null) {
      return NextResponse.json({ 
        error: 'Missing required fields: marketId, side, quantity, price' 
      }, { status: 400 });
    }

    if (!['YES', 'NO'].includes(side)) {
      return NextResponse.json({ error: 'Side must be YES or NO' }, { status: 400 });
    }

    // Convert price to number and quantity to integer
    const numericPrice = Number(price);
    const numericQuantity = parseInt(quantity.toString(), 10); // Ensure integer

    if (isNaN(numericPrice) || isNaN(numericQuantity) || numericQuantity <= 0 || numericPrice <= 0 || numericPrice > 100) {
      return NextResponse.json({ 
        error: 'Invalid quantity or price. Price must be between 0 and 100, quantity must be > 0' 
      }, { status: 400 });
    }

    // Check if market exists and is active
    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select('id, status, resolution_date')
      .eq('id', marketId)
      .single();

    if (marketError || !market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }

    if (market.status !== 'active') {
      return NextResponse.json({ error: 'Market is not active' }, { status: 400 });
    }

    // Check if market has expired
    if (new Date(market.resolution_date) <= new Date()) {
      return NextResponse.json({ error: 'Market has expired' }, { status: 400 });
    }

    // Check user balance
    const { data: userBalance, error: balanceError } = await supabase
      .from('user_balances')
      .select('available_balance')
      .eq('user_id', user.id)
      .single();

    if (balanceError || !userBalance) {
      return NextResponse.json({ error: 'User balance not found' }, { status: 404 });
    }

    const requiredAmount = numericQuantity * numericPrice / 100; // Convert price to decimal
    if (userBalance.available_balance < requiredAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Create the order
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        market_id: marketId,
        user_id: user.id,
        side,
        quantity: numericQuantity,
        price: numericPrice,
        status: 'open',
        filled_quantity: 0
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Update user balance (reserve funds)
    const { error: updateBalanceError } = await supabase
      .from('user_balances')
      .update({
        available_balance: userBalance.available_balance - requiredAmount
      })
      .eq('user_id', user.id);

    if (updateBalanceError) {
      console.error('Error updating balance:', updateBalanceError);
      // Should rollback the order creation in production
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
    }

    // TODO: Implement order matching engine
    // const { error: matchError } = await supabase.rpc('match_order', {
    //   order_id: newOrder.id
    // });
    //
    // if (matchError) {
    //   console.error('Error matching order:', matchError);
    // }

    // Fetch the updated order with market info
    const { data: updatedOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        markets:market_id (
          title,
          category,
          status
        )
      `)
      .eq('id', newOrder.id)
      .single();

    if (fetchError) {
      console.error('Error fetching updated order:', fetchError);
      return NextResponse.json({ error: 'Order created but failed to fetch details' }, { status: 500 });
    }

    // Transform response
    const transformedOrder = {
      id: updatedOrder.id,
      marketId: updatedOrder.market_id,
      marketTitle: updatedOrder.markets?.title,
      marketCategory: updatedOrder.markets?.category,
      side: updatedOrder.side,
      quantity: updatedOrder.quantity,
      price: updatedOrder.price,
      status: updatedOrder.status,
      filledQuantity: updatedOrder.filled_quantity,
      remainingQuantity: updatedOrder.quantity - updatedOrder.filled_quantity,
      createdAt: updatedOrder.created_at,
      updatedAt: updatedOrder.updated_at
    };

    return NextResponse.json({
      order: transformedOrder,
      message: 'Order placed successfully'
    });

  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 