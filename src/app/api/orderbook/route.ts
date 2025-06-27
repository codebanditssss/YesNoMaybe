import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const market_id = searchParams.get('market_id');
    const depth = parseInt(searchParams.get('depth') || '20');

    if (!market_id) {
      return NextResponse.json(
        { error: 'market_id is required' },
        { status: 400 }
      );
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

    // Get market info
    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select('*')
      .eq('id', market_id)
      .single();

    if (marketError || !market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    // Get YES orders (bids) - users wanting to buy YES
    const { data: yesOrders, error: yesError } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        price,
        quantity,
        filled_quantity,
        created_at,
        profiles (
          username
        )
      `)
      .eq('market_id', market_id)
      .eq('side', 'YES')
      .eq('status', 'open')
      .order('price', { ascending: false }) // Highest price first
      .order('created_at', { ascending: true }) // FIFO for same price
      .limit(depth);

    if (yesError) {
      console.error('Error fetching YES orders:', yesError);
      return NextResponse.json(
        { error: 'Failed to fetch YES orders' },
        { status: 500 }
      );
    }

    // Get NO orders (asks) - users wanting to buy NO (sell YES)
    const { data: noOrders, error: noError } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        price,
        quantity,
        filled_quantity,
        created_at,
        profiles (
          username
        )
      `)
      .eq('market_id', market_id)
      .eq('side', 'NO')
      .eq('status', 'open')
      .order('price', { ascending: true }) // Lowest price first
      .order('created_at', { ascending: true }) // FIFO for same price
      .limit(depth);

    if (noError) {
      console.error('Error fetching NO orders:', noError);
      return NextResponse.json(
        { error: 'Failed to fetch NO orders' },
        { status: 500 }
      );
    }

    // Group orders by price level for better orderbook display
    const groupOrdersByPrice = (orders: any[], side: 'YES' | 'NO') => {
      const priceMap = new Map();
      
      orders?.forEach(order => {
        const price = order.price;
        const remainingQty = order.quantity - order.filled_quantity;
        
        if (!priceMap.has(price)) {
          priceMap.set(price, {
            price,
            quantity: 0,
            orders: 0,
            side
          });
        }
        
        const level = priceMap.get(price);
        level.quantity += remainingQty;
        level.orders += 1;
      });
      
      return Array.from(priceMap.values()).sort((a, b) => 
        side === 'YES' ? b.price - a.price : a.price - b.price
      );
    };

    // Get recent trades for market activity
    const { data: recentTrades, error: tradesError } = await supabase
      .from('trades')
      .select('price, quantity, created_at, winner_side')
      .eq('market_id', market_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (tradesError) {
      console.error('Error fetching recent trades:', tradesError);
    }

    // Calculate market stats
    const yesLevels = groupOrdersByPrice(yesOrders, 'YES');
    const noLevels = groupOrdersByPrice(noOrders, 'NO');
    
    const bestBid = yesLevels.length > 0 ? yesLevels[0].price : 0;
    const bestAsk = noLevels.length > 0 ? 100 - noLevels[0].price : 100; // Convert NO price to YES equivalent
    const spread = bestAsk - bestBid;
    const midPrice = (bestBid + bestAsk) / 2;
    
    // Calculate total liquidity
    const totalYesLiquidity = yesLevels.reduce((sum, level) => sum + (level.quantity * level.price), 0);
    const totalNoLiquidity = noLevels.reduce((sum, level) => sum + (level.quantity * level.price), 0);
    
    // Get last trade price
    const lastTradePrice = recentTrades && recentTrades.length > 0 ? recentTrades[0].price : midPrice;
    
    // Calculate 24h volume
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const volume24h = recentTrades?.filter(trade => 
      new Date(trade.created_at) > oneDayAgo
    ).reduce((sum, trade) => sum + (trade.quantity * trade.price), 0) || 0;

    const orderbookData = {
      market_id,
      market_title: market.title,
      market_status: market.status,
      timestamp: new Date().toISOString(),
      
      // Price levels
      yes_levels: yesLevels.slice(0, depth),
      no_levels: noLevels.slice(0, depth),
      
      // Market stats
      best_bid: bestBid,
      best_ask: bestAsk,
      spread,
      mid_price: midPrice,
      last_price: lastTradePrice,
      
      // Liquidity
      total_yes_liquidity: totalYesLiquidity,
      total_no_liquidity: totalNoLiquidity,
      total_liquidity: totalYesLiquidity + totalNoLiquidity,
      
      // Activity
      volume_24h: volume24h,
      recent_trades: recentTrades?.slice(0, 10) || [],
      
      // Order counts
      total_yes_orders: yesOrders?.length || 0,
      total_no_orders: noOrders?.length || 0
    };

    return NextResponse.json(orderbookData);

  } catch (error) {
    console.error('Error in orderbook API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 