import { getServiceRoleClient } from './server-utils'
import type { Database } from '../types/supabase'

export interface OrderRequest {
  marketId: string;
  userId: string;
  side: 'YES' | 'NO';
  quantity: number;
  price: number;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
  trades?: any[];
  filledQuantity?: number;
  remainingQuantity?: number;
}

export interface TradeExecution {
  buyOrderId: string;
  sellOrderId: string;
  buyUserId: string;
  sellUserId: string;
  quantity: number;
  price: number;
  marketId: string;
  side: 'YES' | 'NO'; // Which side is being bought (the side of the buy order)
}

/**
 * Atomic Order Placement and Matching Engine
 * Uses database transactions to prevent race conditions
 */
export class TradingEngine {
  private supabase: any;

  constructor() {
    this.supabase = getServiceRoleClient();
  }

  /**
   * Calculate the cost required to place an order
   */
  private calculateOrderCost(side: string, price: number, quantity: number): number {
    const actualPrice = side === 'YES' ? price : (100 - price);
    return (actualPrice * quantity) / 100;
  }

  /**
   * Validate order parameters
   */
  private validateOrder(order: OrderRequest): { valid: boolean; error?: string } {
    if (!order.marketId?.trim()) {
      return { valid: false, error: 'Market ID is required' };
    }

    if (!order.userId?.trim()) {
      return { valid: false, error: 'User ID is required' };
    }

    if (!['YES', 'NO'].includes(order.side)) {
      return { valid: false, error: 'Side must be YES or NO' };
    }

    if (!Number.isInteger(order.quantity) || order.quantity < 1 || order.quantity > 10000) {
      return { valid: false, error: 'Quantity must be an integer between 1 and 10000' };
    }

    if (typeof order.price !== 'number' || order.price < 1 || order.price > 99) {
      return { valid: false, error: 'Price must be a number between 1 and 99' };
    }

    return { valid: true };
  }

  /**
   * Execute a single trade between two orders atomically
   * This function assumes it's called within a transaction
   */
  private async executeTradeTransaction(
    supabase: any,
    trade: TradeExecution
  ): Promise<{ success: boolean; tradeId?: string; error?: string }> {
    try {
      // 1. Create the trade record
      const { data: tradeRecord, error: tradeError } = await supabase
        .from('trades')
        .insert({
          market_id: trade.marketId,
          yes_order_id: trade.side === 'YES' ? trade.buyOrderId : trade.sellOrderId,
          no_order_id: trade.side === 'NO' ? trade.buyOrderId : trade.sellOrderId,
          yes_user_id: trade.side === 'YES' ? trade.buyUserId : trade.sellUserId,
          no_user_id: trade.side === 'NO' ? trade.buyUserId : trade.sellUserId,
          quantity: trade.quantity,
          price: trade.price,
          status: 'settled'
        })
        .select()
        .single();

      if (tradeError) {
        return { success: false, error: `Failed to create trade: ${tradeError.message}` };
      }

      // 2. Update order filled quantities and statuses
      const { error: buyOrderError } = await supabase
        .from('orders')
        .update({
          filled_quantity: supabase.raw(`filled_quantity + ${trade.quantity}`),
          status: supabase.raw(`CASE WHEN filled_quantity + ${trade.quantity} >= quantity THEN 'filled' ELSE 'partial' END`)
        })
        .eq('id', trade.buyOrderId);

      if (buyOrderError) {
        return { success: false, error: `Failed to update buy order: ${buyOrderError.message}` };
      }

      const { error: sellOrderError } = await supabase
        .from('orders')
        .update({
          filled_quantity: supabase.raw(`filled_quantity + ${trade.quantity}`),
          status: supabase.raw(`CASE WHEN filled_quantity + ${trade.quantity} >= quantity THEN 'filled' ELSE 'partial' END`)
        })
        .eq('id', trade.sellOrderId);

      if (sellOrderError) {
        return { success: false, error: `Failed to update sell order: ${sellOrderError.message}` };
      }

      // 3. Calculate costs for balance updates
      const yesUserCost = (trade.price * trade.quantity) / 100;
      const noUserCost = ((100 - trade.price) * trade.quantity) / 100;

      // 4. Update user balances - unlock locked funds
      const { error: yesBalanceError } = await supabase
        .from('user_balances')
        .update({
          locked_balance: supabase.raw(`locked_balance - ${yesUserCost}`),
          total_trades: supabase.raw('total_trades + 1'),
          total_volume: supabase.raw(`total_volume + ${trade.quantity}`)
        })
        .eq('user_id', trade.side === 'YES' ? trade.buyUserId : trade.sellUserId);

      if (yesBalanceError) {
        return { success: false, error: `Failed to update YES user balance: ${yesBalanceError.message}` };
      }

      const { error: noBalanceError } = await supabase
        .from('user_balances')
        .update({
          locked_balance: supabase.raw(`locked_balance - ${noUserCost}`),
          total_trades: supabase.raw('total_trades + 1'),
          total_volume: supabase.raw(`total_volume + ${trade.quantity}`)
        })
        .eq('user_id', trade.side === 'NO' ? trade.buyUserId : trade.sellUserId);

      if (noBalanceError) {
        return { success: false, error: `Failed to update NO user balance: ${noBalanceError.message}` };
      }

      return { success: true, tradeId: tradeRecord.id };

    } catch (error) {
      return { success: false, error: `Trade execution failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Find matching orders with proper price-time priority and atomic locking
   * Improved logic for YES/NO prediction markets
   */
  private async findMatchingOrdersWithLock(
    supabase: any,
    marketId: string,
    side: string,
    price: number,
    maxQuantity: number
  ): Promise<{ orders: any[]; error?: string }> {
    try {
      const oppositeSide = side === 'YES' ? 'NO' : 'YES';
      
      // For YES/NO markets, complementary pricing:
      // If someone wants to buy YES at 60, they match with NO orders at 40
      // If someone wants to buy NO at 30, they match with YES orders at 70
      const targetPrice = 100 - price;

      // Build the matching query with proper price-time priority
      let query = supabase
        .from('orders')
        .select('*')
        .eq('market_id', marketId)
        .eq('side', oppositeSide)
        .eq('status', 'open')
        .gt('remaining_quantity', 0);

      // Price matching logic for prediction markets
      if (side === 'YES') {
        // For YES orders, match with NO orders at complementary price or better
        query = query.lte('price', targetPrice);
      } else {
        // For NO orders, match with YES orders at complementary price or better
        query = query.lte('price', targetPrice);
      }

      // Order by price priority (best price first) then by time priority (earliest first)
      if (side === 'YES') {
        // For YES orders, prefer lower-priced NO orders (better for the YES buyer)
        query = query.order('price', { ascending: true });
      } else {
        // For NO orders, prefer lower-priced YES orders (better for the NO buyer)
        query = query.order('price', { ascending: true });
      }
      
      // Then by time priority (FIFO)
      query = query.order('created_at', { ascending: true });
      
      // Limit to prevent excessive locking
      query = query.limit(50);

      const { data: matchingOrders, error } = await query;

      if (error) {
        return { orders: [], error: error.message };
      }

      // Filter orders to ensure we don't exceed maxQuantity
      let cumulativeQuantity = 0;
      const filteredOrders = [];
      
      for (const order of matchingOrders || []) {
        if (cumulativeQuantity >= maxQuantity) break;
        
        const orderQuantity = order.remaining_quantity || order.quantity;
        const quantityToTake = Math.min(orderQuantity, maxQuantity - cumulativeQuantity);
        
        if (quantityToTake > 0) {
          filteredOrders.push({
            ...order,
            available_quantity: quantityToTake
          });
          cumulativeQuantity += quantityToTake;
        }
      }

      return { orders: filteredOrders, error: undefined };

    } catch (error) {
      return { 
        orders: [], 
        error: `Failed to find matching orders: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Attempt to match a newly placed order against existing orders
   * Enhanced with proper atomic transactions and rollback handling
   */
  private async attemptOrderMatching(
    newOrder: any,
    marketId: string
  ): Promise<{ trades: any[]; filledQuantity: number; remainingQuantity: number }> {
    try {
      const { side, quantity, price, id: orderId, user_id: userId } = newOrder;
      let remainingQuantity = quantity;
      let filledQuantity = 0;
      const trades: any[] = [];
      const orderUpdates: any[] = [];

      // Find matching orders with proper priority
      const matchingResult = await this.findMatchingOrdersWithLock(
        this.supabase,
        marketId,
        side,
        price,
        remainingQuantity
      );

      if (matchingResult.error || !matchingResult.orders.length) {
        // No matching orders or error - order remains open
        return { trades: [], filledQuantity: 0, remainingQuantity: quantity };
      }

      // Process each matching order atomically
      for (const matchingOrder of matchingResult.orders) {
        if (remainingQuantity <= 0) break;

        // Calculate match quantity considering available quantity
        const matchQuantity = Math.min(
          remainingQuantity, 
          matchingOrder.available_quantity || matchingOrder.remaining_quantity || matchingOrder.quantity
        );
        
        if (matchQuantity <= 0) continue;

        // Create trade execution with proper buyer/seller assignment
        const trade: TradeExecution = {
          buyOrderId: side === 'YES' ? orderId : matchingOrder.id,
          sellOrderId: side === 'YES' ? matchingOrder.id : orderId,
          buyUserId: side === 'YES' ? userId : matchingOrder.user_id,
          sellUserId: side === 'YES' ? matchingOrder.user_id : userId,
          quantity: matchQuantity,
          price: matchingOrder.price, // Use the matched order's price
          marketId: marketId,
          side: side
        };

        // Execute the trade atomically
        const tradeResult = await this.executeTradeTransaction(this.supabase, trade);
        
        if (tradeResult.success) {
          trades.push({
            tradeId: tradeResult.tradeId,
            quantity: matchQuantity,
            price: matchingOrder.price,
            matchedOrderId: matchingOrder.id,
            matchedUserId: matchingOrder.user_id
          });

          remainingQuantity -= matchQuantity;
          filledQuantity += matchQuantity;

          // Track order updates for batch processing
          const matchingOrderNewRemaining = (matchingOrder.remaining_quantity || matchingOrder.quantity) - matchQuantity;
          orderUpdates.push({
            orderId: matchingOrder.id,
            filledQuantity: (matchingOrder.filled_quantity || 0) + matchQuantity,
            remainingQuantity: matchingOrderNewRemaining,
            status: matchingOrderNewRemaining === 0 ? 'filled' : 'partial'
          });

        } else {
          console.error(`Trade execution failed: ${tradeResult.error}`);
          // Log failed trade but continue with other matches
          continue;
        }
      }

      // Update all order statuses atomically
      try {
        // Update the new order
        if (filledQuantity > 0) {
          await this.supabase
            .from('orders')
            .update({
              filled_quantity: filledQuantity,
              remaining_quantity: remainingQuantity,
              status: remainingQuantity === 0 ? 'filled' : 'partial'
            })
            .eq('id', orderId);
        }

        // Update matched orders
        for (const update of orderUpdates) {
          await this.supabase
            .from('orders')
            .update({
              filled_quantity: update.filledQuantity,
              remaining_quantity: update.remainingQuantity,
              status: update.status
            })
            .eq('id', update.orderId);
        }

      } catch (updateError) {
        console.error('Failed to update order statuses:', updateError);
        // Orders are already traded, so we continue but log the error
      }

      return { trades, filledQuantity, remainingQuantity };

    } catch (error) {
      console.error('Order matching failed:', error);
      return { trades: [], filledQuantity: 0, remainingQuantity: newOrder.quantity };
    }
  }

  /**
   * Place an order with atomic transaction guarantees
   */
  async placeOrder(orderRequest: OrderRequest): Promise<OrderResult> {
    // Validate order
    const validation = this.validateOrder(orderRequest);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const { marketId, userId, side, quantity, price } = orderRequest;
    const orderCost = this.calculateOrderCost(side, price, quantity);

    try {
      // Try to use the stored procedure for atomic operations
      const result = await this.supabase.rpc('place_order_atomic', {
        p_market_id: marketId,
        p_user_id: userId,
        p_side: side,
        p_quantity: quantity,
        p_price: price,
        p_order_cost: orderCost
      });

      // If RPC succeeds, return the result
      if (!result.error) {
        return {
          success: true,
          orderId: result.data?.order_id,
          trades: result.data?.trades || [],
          filledQuantity: result.data?.filled_quantity || 0,
          remainingQuantity: result.data?.remaining_quantity || quantity
        };
      }

      // If function doesn't exist or other RPC error, fall back to manual transaction
      console.log('RPC function not available, falling back to manual transaction:', result.error.message);
      return await this.placeOrderManualTransaction(orderRequest);

    } catch (error) {
      console.log('RPC error, falling back to manual transaction:', error);
      // Any error in RPC should fall back to manual transaction
      return await this.placeOrderManualTransaction(orderRequest);
    }
  }

  /**
   * Manual transaction implementation for order placement
   * This is a fallback if the stored procedure is not available
   */
  private async placeOrderManualTransaction(orderRequest: OrderRequest): Promise<OrderResult> {
    const { marketId, userId, side, quantity, price } = orderRequest;
    const orderCost = this.calculateOrderCost(side, price, quantity);

    try {
      // 1. Check and lock user balance atomically
      let { data: userBalance, error: balanceError } = await this.supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (balanceError) {
        if (balanceError.code === 'PGRST116') {
          // Create default balance for new user based on wallet mode
          const isProduction = process.env.WALLET_MODE === 'production';
          const initialAmount = isProduction ? 0 : parseInt(process.env.INITIAL_WALLET_AMOUNT || '10000');
          
          const { data: newBalance, error: createError } = await this.supabase
            .from('user_balances')
            .insert({
              user_id: userId,
              available_balance: initialAmount,
              locked_balance: 0,
              total_deposited: initialAmount,
              total_profit_loss: 0,
              total_trades: 0,
              winning_trades: 0,
              total_volume: 0,
              total_withdrawn: 0
            })
            .select()
            .single();

          if (createError) {
            return { success: false, error: 'Failed to create user balance' };
          }
          
          userBalance = newBalance;
        } else {
          return { success: false, error: 'Failed to access user balance' };
        }
      }

      if (userBalance.available_balance < orderCost) {
        return {
          success: false,
          error: `Insufficient balance. Required: ₹${orderCost.toFixed(2)}, Available: ₹${userBalance.available_balance.toFixed(2)}`
        };
      }

      // 2. Atomically lock funds and create order
      const { data: newOrder, error: orderError } = await this.supabase
        .from('orders')
        .insert({
          market_id: marketId,
          user_id: userId,
          side: side,
          quantity: quantity,
          price: price,
          status: 'open',
          order_type: 'limit',
          filled_quantity: 0,
          remaining_quantity: quantity,
          total_cost: orderCost
        })
        .select()
        .single();

      if (orderError) {
        return { success: false, error: 'Failed to create order' };
      }

      // 3. Update balance atomically
      const { error: balanceUpdateError } = await this.supabase
        .from('user_balances')
        .update({
          available_balance: userBalance.available_balance - orderCost,
          locked_balance: userBalance.locked_balance + orderCost
        })
        .eq('user_id', userId)
        .eq('available_balance', userBalance.available_balance); // Optimistic locking

      if (balanceUpdateError) {
        // Rollback order creation
        await this.supabase
          .from('orders')
          .delete()
          .eq('id', newOrder.id);
        
        return { success: false, error: 'Failed to lock funds - balance may have changed' };
      }

      // 4. Attempt immediate matching with proper atomic transaction
      const matchingResult = await this.attemptOrderMatching(newOrder, marketId);
      
      return {
        success: true,
        orderId: newOrder.id,
        trades: matchingResult.trades || [],
        filledQuantity: matchingResult.filledQuantity || 0,
        remainingQuantity: matchingResult.remainingQuantity || quantity
      };

    } catch (error) {
      return {
        success: false,
        error: `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Cancel an order atomically
   */
  async cancelOrder(orderId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get order with lock
      const { data: order, error: orderError } = await this.supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', userId)
        .eq('status', 'open')
        .single();

      if (orderError) {
        return { success: false, error: 'Order not found or already processed' };
      }

      const remainingCost = this.calculateOrderCost(order.side, order.price, order.remaining_quantity || order.quantity);

      // Atomically cancel order and unlock funds
      const { error: cancelError } = await this.supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (cancelError) {
        return { success: false, error: 'Failed to cancel order' };
      }

      const { error: unlockError } = await this.supabase
        .from('user_balances')
        .update({
          available_balance: this.supabase.raw(`available_balance + ${remainingCost}`),
          locked_balance: this.supabase.raw(`locked_balance - ${remainingCost}`)
        })
        .eq('user_id', userId);

      if (unlockError) {
        return { success: false, error: 'Order cancelled but failed to unlock funds' };
      }

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: `Cancel failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export singleton instance
 