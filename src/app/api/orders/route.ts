import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedUser, validateInput } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { notificationService } from '@/lib/notificationService'

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

// Helper function to calculate order cost
function calculateOrderCost(side: string, price: number, quantity: number): number {
  // For YES orders: cost = price * quantity / 100 
  // For NO orders: cost = (100 - price) * quantity / 100
  const actualPrice = side === 'YES' ? price : (100 - price)
  return (actualPrice * quantity) / 100
}

// Helper function to match orders
async function findMatchingOrders(marketId: string, side: string, price: number, quantity: number) {
  const oppositeSide = side === 'YES' ? 'NO' : 'YES'
  
  // For YES orders, match with NO orders where YES_price + NO_price = 100
  // For NO orders, match with YES orders where YES_price + NO_price = 100
  const targetPrice = 100 - price
  
  console.log(`🔍 Looking for ${oppositeSide} orders at price ${targetPrice} for ${side} order at ${price}`)
  
  const { data: matchingOrders, error } = await serviceRoleClient
    .from('orders')
    .select('*')
    .eq('market_id', marketId)
    .eq('side', oppositeSide)
    .eq('price', targetPrice)
    .eq('status', 'open')
    .gt('quantity', 0)
    .order('created_at', { ascending: true }) // First-in-first-out
  
  if (error) {
    console.error('Error finding matching orders:', error)
    return []
  }
  
  console.log(`📋 Found ${matchingOrders?.length || 0} potential matches`)
  return matchingOrders || []
}

// Helper function to execute a trade
async function executeTrade(
  buyOrder: any,
  sellOrder: any,
  tradeQuantity: number,
  tradePrice: number,
  marketId: string
) {
  console.log(`⚡ Executing trade: ${tradeQuantity} shares at ₹${tradePrice}`)
  
  try {
    // Create trade record with correct status
    const { data: trade, error: tradeError } = await serviceRoleClient
      .from('trades')
      .insert({
        market_id: marketId,
        yes_order_id: buyOrder.side === 'YES' ? buyOrder.id : sellOrder.id,
        no_order_id: buyOrder.side === 'NO' ? buyOrder.id : sellOrder.id,
        yes_user_id: buyOrder.side === 'YES' ? buyOrder.user_id : sellOrder.user_id,
        no_user_id: buyOrder.side === 'NO' ? buyOrder.user_id : sellOrder.user_id,
        quantity: tradeQuantity,
        price: tradePrice,
        status: 'settled' // Fixed: use 'settled' instead of 'completed'
      })
      .select()
      .single()
    
    if (tradeError) {
      console.error('Error creating trade:', tradeError)
      throw tradeError
    }
    
    console.log(`✅ Trade created:`, trade)
    
    // Calculate new filled quantities
    const buyOrderNewFilled = buyOrder.filled_quantity + tradeQuantity
    const sellOrderNewFilled = sellOrder.filled_quantity + tradeQuantity
    
    // Determine order statuses
    const buyOrderStatus = buyOrderNewFilled >= buyOrder.quantity ? 'filled' : 'partial'
    const sellOrderStatus = sellOrderNewFilled >= sellOrder.quantity ? 'filled' : 'partial'
    
    // Update filled quantities for both orders
    const updatePromises = [
      serviceRoleClient
        .from('orders')
        .update({
          filled_quantity: buyOrderNewFilled,
          status: buyOrderStatus
        })
        .eq('id', buyOrder.id),
      
      serviceRoleClient
        .from('orders')
        .update({
          filled_quantity: sellOrderNewFilled,
          status: sellOrderStatus
        })
        .eq('id', sellOrder.id)
    ]
    
    await Promise.all(updatePromises)
    
    // Calculate unlock amounts correctly
    const yesUser = buyOrder.side === 'YES' ? buyOrder.user_id : sellOrder.user_id
    const noUser = buyOrder.side === 'NO' ? buyOrder.user_id : sellOrder.user_id
    
    // YES user pays: tradePrice * tradeQuantity / 100
    const yesUserCost = (tradePrice * tradeQuantity) / 100
    
    // NO user pays: (100 - tradePrice) * tradeQuantity / 100  
    const noUserCost = ((100 - tradePrice) * tradeQuantity) / 100
    
    console.log(`💰 YES user cost: ₹${yesUserCost}, NO user cost: ₹${noUserCost}`)
    
    // Get current balances for both users
    const { data: currentBalances } = await serviceRoleClient
      .from('user_balances')
      .select('user_id, locked_balance, total_trades, total_volume')
      .in('user_id', [yesUser, noUser])
    
    const yesUserBalance = currentBalances?.find(b => b.user_id === yesUser)
    const noUserBalance = currentBalances?.find(b => b.user_id === noUser)
    
    if (!yesUserBalance || !noUserBalance) {
      throw new Error('User balances not found')
    }
    
    // Update user balances - unlock the correct amounts
    const balanceUpdates = [
      // Update YES user balance
      serviceRoleClient
        .from('user_balances')
        .update({
          locked_balance: Number(yesUserBalance.locked_balance) - yesUserCost,
          total_trades: yesUserBalance.total_trades + 1,
          total_volume: Number(yesUserBalance.total_volume) + tradeQuantity
        })
        .eq('user_id', yesUser),
      
      // Update NO user balance  
      serviceRoleClient
        .from('user_balances')
        .update({
          locked_balance: Number(noUserBalance.locked_balance) - noUserCost,
          total_trades: noUserBalance.total_trades + 1,
          total_volume: Number(noUserBalance.total_volume) + tradeQuantity
        })
        .eq('user_id', noUser)
    ]
    
    await Promise.all(balanceUpdates)
    
    console.log(`💰 Updated balances - YES user unlocked ₹${yesUserCost}, NO user unlocked ₹${noUserCost}`)
    
    return trade
    
  } catch (error) {
    console.error('Error executing trade:', error)
    throw error
  }
}

// POST handler for placing new orders with matching engine
export const POST = withAuth(async (req, user) => {
  try {
    const body = await req.json()
    const { marketId, side, quantity, price } = body

    // Validate required fields
    if (!marketId || !side || !quantity || !price) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields: marketId, side, quantity, price' 
      }, { status: 400 })
    }

    // Validate input ranges
    if (price < 1 || price > 99) {
      return NextResponse.json({
        success: false,
        error: 'Price must be between 1 and 99'
      }, { status: 400 })
    }

    if (quantity < 1 || quantity > 10000) {
      return NextResponse.json({
        success: false,
        error: 'Quantity must be between 1 and 10000'
      }, { status: 400 })
    }

    if (!['YES', 'NO'].includes(side)) {
      return NextResponse.json({
        success: false,
        error: 'Side must be YES or NO'
      }, { status: 400 })
    }

    console.log(`🎯 Processing order: ${side} ${quantity} @ ₹${price} for market ${marketId}`)

    // Step 1: Get user balance (don't overwrite existing balance!)
    let { data: userBalance, error: balanceError } = await serviceRoleClient
      .from('user_balances')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Only create default balance for truly new users
    if (balanceError && balanceError.code === 'PGRST116') {
      console.log(`🆕 Creating new user balance for ${user.id}`)
      const { data: newBalance, error: createError } = await serviceRoleClient
        .from('user_balances')
        .insert({
          user_id: user.id,
          available_balance: 10000, // Default balance for new users
          locked_balance: 0,
          total_deposited: 10000,
          total_profit_loss: 0,
          total_trades: 0,
          winning_trades: 0,
          total_volume: 0,
          total_withdrawn: 0
        })
        .select()
        .single()
      
      if (createError) {
        console.error('Error creating user balance:', createError)
        return NextResponse.json({ 
          success: false,
          error: 'Failed to create user balance' 
        }, { status: 500 })
      }
      
      userBalance = newBalance
      balanceError = null
    }

    if (balanceError) {
      console.error('Error getting user balance:', balanceError)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to access user balance' 
      }, { status: 500 })
    }

    // Step 2: Calculate order cost and check balance
    const orderCost = calculateOrderCost(side, price, quantity)
    console.log(`💰 Order cost: ₹${orderCost}, Available: ₹${userBalance.available_balance}`)

    if (orderCost > userBalance.available_balance) {
      return NextResponse.json({
        success: false,
        error: `Insufficient balance. Required: ₹${orderCost.toFixed(2)}, Available: ₹${userBalance.available_balance.toFixed(2)}`
      }, { status: 400 })
    }

    // Step 3: Lock funds
    const { error: lockError } = await serviceRoleClient
      .from('user_balances')
      .update({
        available_balance: userBalance.available_balance - orderCost,
        locked_balance: userBalance.locked_balance + orderCost
      })
      .eq('user_id', user.id)

    if (lockError) {
      console.error('Error locking funds:', lockError)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to lock funds' 
      }, { status: 500 })
    }

    console.log(`🔒 Locked ₹${orderCost} for user ${user.id}`)

    // Step 4: Create the order
    const { data: newOrder, error: orderError } = await serviceRoleClient
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
      .select()
      .single()

    if (orderError) {
      // Rollback balance lock on order creation failure
      await serviceRoleClient
        .from('user_balances')
        .update({
          available_balance: userBalance.available_balance,
          locked_balance: userBalance.locked_balance
        })
        .eq('user_id', user.id)
      
      console.error('Error creating order:', orderError)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to create order' 
      }, { status: 500 })
    }

    console.log(`📝 Created order:`, newOrder)

    // Step 5: Send order placed notification
    try {
      const { data: marketData } = await serviceRoleClient
        .from('markets')
        .select('title')
        .eq('id', marketId)
        .single()

      await notificationService.notifyOrderPlaced(user.id, {
        orderId: newOrder.id,
        marketId: marketId,
        marketTitle: marketData?.title || 'Unknown Market',
        side: side,
        quantity: quantity,
        price: price
      })
    } catch (notifError) {
      console.error('Error sending order placed notification:', notifError)
      // Don't fail the order if notification fails
    }

    // Step 6: Try to match the order immediately
    let remainingQuantity = quantity
    let totalFilled = 0
    const executedTrades = []

    try {
      const matchingOrders = await findMatchingOrders(marketId, side, price, quantity)
      
      for (const matchOrder of matchingOrders) {
        if (remainingQuantity <= 0) break
        
        const availableQuantity = matchOrder.quantity - (matchOrder.filled_quantity || 0)
        if (availableQuantity <= 0) continue
        
        const tradeQuantity = Math.min(remainingQuantity, availableQuantity)
        const tradePrice = side === 'YES' ? price : matchOrder.price
        
        // Execute the trade
        const trade = await executeTrade(
          side === 'YES' ? newOrder : matchOrder,
          side === 'YES' ? matchOrder : newOrder,
          tradeQuantity,
          tradePrice,
          marketId
        )
        
        executedTrades.push(trade)
        totalFilled += tradeQuantity
        remainingQuantity -= tradeQuantity
        
        console.log(`🎉 Executed trade: ${tradeQuantity} shares, ${remainingQuantity} remaining`)
      }
      
      // Update the new order if it was filled
      if (totalFilled > 0) {
        await serviceRoleClient
          .from('orders')
          .update({
            filled_quantity: totalFilled,
            status: totalFilled >= quantity ? 'filled' : 'partial'
          })
          .eq('id', newOrder.id)

        // Send order filled notification
        try {
          const { data: marketData } = await serviceRoleClient
            .from('markets')
            .select('title')
            .eq('id', marketId)
            .single()

          if (totalFilled >= quantity) {
            // Order completely filled
            await notificationService.notifyOrderFilled(user.id, {
              orderId: newOrder.id,
              marketId: marketId,
              marketTitle: marketData?.title || 'Unknown Market',
              side: side,
              quantity: totalFilled,
              price: price,
              tradeId: executedTrades[0]?.id || 'multiple'
            })
          } else {
            // Order partially filled - create a custom notification
            await notificationService.createNotification({
              user_id: user.id,
              title: 'Order Partially Filled! 📊',
              message: `Your ${side} order for ${quantity} shares was partially filled (${totalFilled}/${quantity}) at ₹${price} for "${marketData?.title || 'Unknown Market'}"`,
              type: 'order_update',
              priority: 'normal',
              metadata: {
                orderId: newOrder.id,
                marketId: marketId,
                side: side,
                quantity: quantity,
                filledQuantity: totalFilled,
                price: price
              }
            })
          }
        } catch (notifError) {
          console.error('Error sending order filled notification:', notifError)
          // Don't fail the order if notification fails
        }
      }
      
    } catch (matchError) {
      console.error('Error during matching:', matchError)
      // Continue without failing the order placement
    }

    // Step 7: Get market info for response
    const { data: market } = await serviceRoleClient
      .from('markets')
      .select('title, category')
      .eq('id', marketId)
      .single()

    // Step 8: Return success response
      return NextResponse.json({ 
        success: true,
        order: {
        id: newOrder.id,
        marketId: newOrder.market_id,
          marketTitle: market?.title || 'Unknown Market',
          marketCategory: market?.category || null,
        side: newOrder.side,
        quantity: newOrder.quantity,
        price: newOrder.price,
        filledQuantity: totalFilled,
        remainingQuantity: newOrder.quantity - totalFilled,
        status: totalFilled >= quantity ? 'filled' : (totalFilled > 0 ? 'partial' : 'open'),
        orderType: newOrder.order_type,
        createdAt: newOrder.created_at,
        updatedAt: newOrder.updated_at || newOrder.created_at,
          expiresAt: null
        },
      trades: executedTrades,
      totalFilled,
      message: totalFilled > 0 
        ? `Order placed and ${totalFilled}/${quantity} shares filled immediately`
        : 'Order placed successfully and waiting for match'
    })

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