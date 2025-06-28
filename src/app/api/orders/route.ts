import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedUser, validateInput } from '@/lib/auth'

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
async function postOrdersHandler(request: NextRequest, user: AuthenticatedUser) {
  try {
    const body = await request.json()
    const { marketId, side, quantity, price, orderType = 'limit' } = body

    // Validate required fields
    const validation = validateInput(body, ['marketId', 'side', 'quantity', 'price'])
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: `Missing required fields: ${validation.missingFields.join(', ')}` 
      }, { status: 400 })
    }

    // Validate field values
    if (!['YES', 'NO'].includes(side)) {
      return NextResponse.json({ error: 'Side must be YES or NO' }, { status: 400 })
    }

    if (!['market', 'limit'].includes(orderType)) {
      return NextResponse.json({ error: 'Order type must be market or limit' }, { status: 400 })
    }

    // Convert and validate numeric values
    const numericPrice = Number(price)
    const numericQuantity = parseInt(quantity.toString(), 10)

    if (isNaN(numericPrice) || isNaN(numericQuantity)) {
      return NextResponse.json({ 
        error: 'Invalid price or quantity format' 
      }, { status: 400 })
    }

    if (numericQuantity <= 0 || numericQuantity > 10000) {
      return NextResponse.json({ 
        error: 'Quantity must be between 1 and 10,000' 
      }, { status: 400 })
    }

    if (numericPrice <= 0 || numericPrice >= 100) {
      return NextResponse.json({ 
        error: 'Price must be between 0 and 100' 
      }, { status: 400 })
    }

    // Check if market exists and is active
    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select('id, status, resolution_date, title')
      .eq('id', marketId)
      .single()

    if (marketError || !market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }

    if (market.status !== 'active') {
      return NextResponse.json({ 
        error: `Market "${market.title}" is ${market.status} and not accepting new orders` 
      }, { status: 400 })
    }

    // Check if market has expired
    if (market.resolution_date && new Date(market.resolution_date) <= new Date()) {
      return NextResponse.json({ 
        error: `Market "${market.title}" has expired` 
      }, { status: 400 })
    }

    // Check user balance
    const { data: userBalance, error: balanceError } = await supabase
      .from('user_balances')
      .select('available_balance')
      .eq('user_id', user.id)
      .single()

    if (balanceError || !userBalance) {
      return NextResponse.json({ 
        error: 'User balance not found. Please contact support.' 
      }, { status: 404 })
    }

    // Calculate required amount
    const requiredAmount = (numericPrice * numericQuantity) / 100
    
    if (userBalance.available_balance < requiredAmount) {
      return NextResponse.json({ 
        error: `Insufficient balance. Required: ₹${requiredAmount.toFixed(2)}, Available: ₹${userBalance.available_balance.toFixed(2)}` 
      }, { status: 400 })
    }

    // Create the order
    const orderData = {
      user_id: user.id,
      market_id: marketId,
      side: side.toUpperCase(), // Database expects uppercase YES/NO
      quantity: numericQuantity,
      price: numericPrice,
      order_type: orderType.toLowerCase(), // Keep lowercase for order_type
      status: 'open', // Database likely expects 'open' for new orders
      filled_quantity: 0
      // Note: remaining_quantity and total_cost are generated columns in the database
    }

    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
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
        total_cost,
        created_at,
        updated_at,
        markets:market_id (
          title,
          category
        )
      `)
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // TODO: Implement order matching logic here
    // For now, we'll just return the created order

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: `Order placed successfully for ${market.title}`
    }, { status: 201 })

  } catch (error) {
    console.error('Orders POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Export the protected handlers
export const GET = withAuth(getOrdersHandler)
export const POST = withAuth(postOrdersHandler) 