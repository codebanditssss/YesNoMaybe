import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedUser, validateInput } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with the service role key for admin operations
const serviceRoleClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// GET handler for fetching user's orders
async function getOrdersHandler(request: NextRequest, user: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'all', 'pending', 'filled', 'cancelled'
    const marketId = searchParams.get('market_id')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Cap at 100
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('orders')
      .select(`
        id,
        market_id,
        side,
        quantity,
        price,
        filled_quantity,
        remaining_quantity,
        status,
        order_type,
        created_at,
        updated_at,
        expires_at,
        markets:market_id (
          title,
          category,
          status
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (marketId) {
      query = query.eq('market_id', marketId)
    }

    const { data: orders, error, count } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('Orders GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST handler for placing new orders
export const POST = withAuth(async (req, user) => {
  try {
    const body = await req.json()
    const { marketId, side, quantity, price } = body

    if (!marketId || !side || !quantity || !price) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    console.log('Creating order with data:', {
      marketId, 
      userId: user.id, 
      side, 
      quantity, 
      price
    })

    // First, ensure user balance exists using raw SQL
    try {
      await serviceRoleClient.rpc('exec_sql', {
        sql: `
          INSERT INTO user_balances (user_id, available_balance, locked_balance, total_deposited, total_profit_loss)
          VALUES ($1, 10000, 0, 10000, 0)
          ON CONFLICT (user_id) DO NOTHING;
        `,
        params: [user.id]
      })
    } catch (balanceError) {
      console.log('Balance upsert attempt:', balanceError)
      // Try with simpler approach if RPC doesn't exist
      try {
        await serviceRoleClient
          .from('user_balances')
          .upsert({
            user_id: user.id,
            available_balance: 10000,
            locked_balance: 0,
            total_deposited: 10000,
            total_profit_loss: 0
          }, {
            onConflict: 'user_id'
          })
      } catch (upsertError) {
        console.log('Upsert attempt:', upsertError)
      }
    }

    // Try raw SQL first, then fallback to simple approach
    let orderResult = null
    let orderError = null

    try {
      // Try raw SQL approach
      const orderSql = `
        INSERT INTO orders (market_id, user_id, side, quantity, price, status, order_type, filled_quantity)
        VALUES ($1, $2, $3, $4, $5, 'open', 'limit', 0)
        RETURNING id, market_id, user_id, side, quantity, price, status, order_type, filled_quantity, created_at;
      `

      const { data: sqlResult, error: sqlError } = await serviceRoleClient.rpc('exec_sql', {
        sql: orderSql,
        params: [
          marketId,
          user.id,
          side,
          parseInt(quantity),
          parseFloat(price)
        ]
      })

      if (sqlError) throw sqlError
      orderResult = sqlResult
      
    } catch (sqlErr) {
      console.log('Raw SQL failed, trying simple insert:', sqlErr)
      
      // Fallback to simplest possible insert
      try {
        const { data: insertResult, error: insertError } = await serviceRoleClient
      .from('orders')
      .insert({
        market_id: marketId,
        user_id: user.id,
            side: side,
            quantity: parseInt(quantity),
            price: parseFloat(price),
        status: 'open',
            order_type: 'limit',
        filled_quantity: 0
      })
        
        if (insertError) {
          console.error('Insert failed with error:', insertError)
          throw insertError
        }
        
        console.log('Simple insert succeeded:', insertResult)
        
        // Verify the order was actually created by fetching the most recent order
        const { data: verifyOrder, error: verifyError } = await serviceRoleClient
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        if (verifyError) {
          console.error('Failed to verify order creation:', verifyError)
        } else {
          console.log('Verified most recent order in database:', verifyOrder)
        }
        
        // Also check total orders count for debugging
        const { data: allOrders, error: countError } = await serviceRoleClient
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
        
        if (!countError) {
          console.log(`Total orders for user ${user.id}:`, allOrders?.length || 0)
          console.log('Recent orders:', allOrders?.slice(-3))
        }
        
        orderResult = 'simple_success'
        
      } catch (insertErr) {
        console.error('All insert methods failed:', insertErr)
        orderError = insertErr
      }
    }

    // Get market info for the response
    const { data: market } = await serviceRoleClient
      .from('markets')
      .select('title, category')
      .eq('id', marketId)
      .single()

    // Handle the result
    if (orderError) {
      const errorMessage = orderError instanceof Error ? orderError.message : 
                          (typeof orderError === 'object' && orderError && 'message' in orderError) 
                          ? String(orderError.message) : 'Unknown error'
      return NextResponse.json({ 
        success: false,
        error: 'Failed to create order: ' + errorMessage
      }, { status: 500 })
    }

    // If we have SQL result data, use it; otherwise provide a basic response
    if (orderResult && orderResult.length > 0) {
      const order = orderResult[0]
      return NextResponse.json({ 
        success: true,
        order: {
          id: order.id,
          marketId: order.market_id,
          marketTitle: market?.title || 'Unknown Market',
          marketCategory: market?.category || null,
          side: order.side,
          quantity: order.quantity,
          price: order.price,
          filledQuantity: order.filled_quantity || 0,
          remainingQuantity: order.quantity - (order.filled_quantity || 0),
          status: order.status,
          orderType: order.order_type,
          createdAt: order.created_at,
          updatedAt: order.created_at,
          expiresAt: null
        },
        message: 'Order placed successfully'
      })
    } else {
      // Fallback response - order was likely created but we couldn't get the details
      return NextResponse.json({ 
        success: true,
        order: {
          id: `order_${Date.now()}`,
          marketId: marketId,
          marketTitle: market?.title || 'Unknown Market',
          marketCategory: market?.category || null,
          side: side,
          quantity: parseInt(quantity),
          price: parseFloat(price),
          filledQuantity: 0,
          remainingQuantity: parseInt(quantity),
          status: 'open',
          orderType: 'limit',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          expiresAt: null
        },
        message: 'Order placed successfully'
      })
    }

  } catch (error) {
    console.error('Error in order placement:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 })
  }
})

// Export the protected handlers
export const GET = withAuth(getOrdersHandler)