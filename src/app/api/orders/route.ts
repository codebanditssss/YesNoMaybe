import { NextRequest } from 'next/server';
import { 
  withAuthentication, 
  getServiceRoleClient,
  validateRequestInput, 
  createErrorResponse, 
  createSuccessResponse 
} from '@/lib/server-utils';
import { tradingEngine } from '@/lib/trading-engine';
import { notificationService } from '@/lib/notificationService';

// GET handler for fetching user's orders
async function getOrdersHandler(user: any, supabase: any, request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status'); // open, filled, partial, cancelled
    const marketId = searchParams.get('marketId');
    const side = searchParams.get('side'); // YES, NO

    // Build query using authenticated client (RLS will filter to user's orders)
    let query = supabase
      .from('orders')
      .select(`
        *,
        markets:market_id (
          id,
          title,
          description,
          status
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      const validStatuses = ['open', 'filled', 'partial', 'cancelled'];
      if (validStatuses.includes(status)) {
        query = query.eq('status', status);
      }
    }

    if (marketId?.trim()) {
      query = query.eq('market_id', marketId.trim());
    }

    if (side) {
      const validSides = ['YES', 'NO'];
      if (validSides.includes(side)) {
        query = query.eq('side', side);
      }
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return createErrorResponse('Failed to fetch orders', 500);
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (status) {
      const validStatuses = ['open', 'filled', 'partial', 'cancelled'];
      if (validStatuses.includes(status)) {
        countQuery = countQuery.eq('status', status);
      }
    }

    if (marketId?.trim()) {
      countQuery = countQuery.eq('market_id', marketId.trim());
    }

    if (side) {
      const validSides = ['YES', 'NO'];
      if (validSides.includes(side)) {
        countQuery = countQuery.eq('side', side);
      }
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error getting order count:', countError);
    }

    return createSuccessResponse({
      orders: orders || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Orders GET API error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST handler for placing new orders using atomic trading engine
async function placeOrderHandler(user: any, supabase: any, request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const validation = validateRequestInput(body, ['marketId', 'side', 'quantity', 'price']);
    if (!validation.isValid) {
      return createErrorResponse(
        `Missing required fields: ${validation.missingFields.join(', ')}`,
        400
      );
    }

    const { marketId, side, quantity, price } = body;

    // Additional validation
    if (!['YES', 'NO'].includes(side)) {
      return createErrorResponse('Side must be YES or NO', 400);
    }

    // Validate numeric inputs
    const numericQuantity = parseInt(quantity);
    const numericPrice = parseFloat(price);

    if (!Number.isInteger(numericQuantity) || numericQuantity < 1 || numericQuantity > 10000) {
      return createErrorResponse('Quantity must be an integer between 1 and 10000', 400);
    }

    if (typeof numericPrice !== 'number' || numericPrice < 1 || numericPrice > 99) {
      return createErrorResponse('Price must be a number between 1 and 99', 400);
    }

    // Validate market exists and is active
    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select('id, title, status, end_date')
      .eq('id', marketId.trim())
      .single();

    if (marketError || !market) {
      return createErrorResponse('Market not found', 404);
    }

    if (market.status !== 'active') {
      return createErrorResponse('Market is not active for trading', 400);
    }

    // Check if market has ended
    if (market.end_date && new Date(market.end_date) < new Date()) {
      return createErrorResponse('Market has ended', 400);
    }

    console.log(`🎯 Processing order: ${side} ${numericQuantity} @ ₹${numericPrice} for market ${marketId}`);

    // Use atomic trading engine to place order
    const result = await tradingEngine.placeOrder({
      marketId: marketId.trim(),
      userId: user.id,
      side: side as 'YES' | 'NO',
      quantity: numericQuantity,
      price: numericPrice
    });

    if (!result.success) {
      return createErrorResponse(result.error || 'Failed to place order', 400);
    }

    // Send order placed notification (async, don't block response)
    try {
      notificationService.notifyOrderPlaced(user.id, {
        orderId: result.orderId!,
        marketId: marketId,
        marketTitle: market.title,
        side: side,
        quantity: numericQuantity,
        price: numericPrice
      }).catch(error => {
        console.error('Error sending order placed notification:', error);
      });
    } catch (notifError) {
      console.error('Error queuing order placed notification:', notifError);
      // Don't fail the order if notification fails
    }

    // If trades were executed, send trade notifications
    if (result.trades && result.trades.length > 0) {
      try {
        for (const trade of result.trades) {
          notificationService.notifyTradeExecuted(user.id, {
            tradeId: trade.id,
            marketId: marketId,
            marketTitle: market.title,
            quantity: trade.quantity,
            price: trade.price,
            side: side
          }).catch(error => {
            console.error('Error sending trade notification:', error);
          });
        }
      } catch (notifError) {
        console.error('Error queuing trade notifications:', notifError);
      }
    }

    return createSuccessResponse({
      success: true,
      orderId: result.orderId,
      filledQuantity: result.filledQuantity || 0,
      remainingQuantity: result.remainingQuantity || numericQuantity,
      trades: result.trades || [],
      message: result.trades && result.trades.length > 0 
        ? `Order placed and ${result.filledQuantity} shares executed immediately`
        : 'Order placed successfully'
    }, 201);

  } catch (error) {
    console.error('Place order API error:', error);
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }
    return createErrorResponse('Internal server error', 500);
  }
}

// PATCH handler for updating orders (cancel, modify)
async function updateOrderHandler(user: any, supabase: any, request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const validation = validateRequestInput(body, ['orderId', 'action']);
    if (!validation.isValid) {
      return createErrorResponse(
        `Missing required fields: ${validation.missingFields.join(', ')}`,
        400
      );
    }

    const { orderId, action } = body;

    // Validate action
    const validActions = ['cancel'];
    if (!validActions.includes(action)) {
      return createErrorResponse(
        `Invalid action. Must be one of: ${validActions.join(', ')}`,
        400
      );
    }

    if (action === 'cancel') {
      const result = await tradingEngine.cancelOrder(orderId.trim(), user.id);
      
      if (!result.success) {
        return createErrorResponse(result.error || 'Failed to cancel order', 400);
      }

      // Send order cancelled notification (async)
      try {
        const { data: order } = await supabase
          .from('orders')
          .select(`
            *,
            markets:market_id (title)
          `)
          .eq('id', orderId.trim())
          .eq('user_id', user.id)
          .single();

        if (order) {
          notificationService.notifyOrderCancelled(user.id, {
            orderId: orderId.trim(),
            marketId: order.market_id,
            marketTitle: order.markets?.title || 'Unknown Market',
            side: order.side,
            quantity: order.quantity,
            price: order.price
          }).catch(error => {
            console.error('Error sending order cancelled notification:', error);
          });
        }
      } catch (notifError) {
        console.error('Error queuing order cancelled notification:', notifError);
      }

      return createSuccessResponse({
        success: true,
        message: 'Order cancelled successfully'
      });
    }

    return createErrorResponse('Invalid action', 400);

  } catch (error) {
    console.error('Update order API error:', error);
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE handler for cancelling orders
async function deleteOrderHandler(user: any, supabase: any, request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId?.trim()) {
      return createErrorResponse('Order ID is required', 400);
    }

    const result = await tradingEngine.cancelOrder(orderId.trim(), user.id);
    
    if (!result.success) {
      return createErrorResponse(result.error || 'Failed to cancel order', 400);
    }

    return createSuccessResponse({
      success: true,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    console.error('Delete order API error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// Export the wrapped handlers
export const GET = withAuthentication(getOrdersHandler);
export const POST = withAuthentication(placeOrderHandler);
export const PATCH = withAuthentication(updateOrderHandler);
export const DELETE = withAuthentication(deleteOrderHandler);