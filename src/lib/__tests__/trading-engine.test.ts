import { TradingEngine, OrderRequest, OrderResult } from '../trading-engine';

// Mock the service role client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
  rpc: jest.fn(),
  raw: jest.fn((sql) => sql),
};

jest.mock('../server-utils', () => ({
  getServiceRoleClient: () => mockSupabase,
}));

describe('TradingEngine', () => {
  let engine: TradingEngine;

  beforeEach(() => {
    engine = new TradingEngine();
    jest.clearAllMocks();
  });

  describe('Order Validation', () => {
    test('should validate valid order request', () => {
      const order: OrderRequest = {
        marketId: 'market-1',
        userId: 'user-1',
        side: 'YES',
        quantity: 100,
        price: 50,
      };

      // Access private method through type assertion
      const validateOrder = (engine as any).validateOrder;
      const result = validateOrder(order);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject invalid price', () => {
      const order: OrderRequest = {
        marketId: 'market-1',
        userId: 'user-1',
        side: 'YES',
        quantity: 100,
        price: 150, // Invalid price > 99
      };

      const validateOrder = (engine as any).validateOrder;
      const result = validateOrder(order);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Price must be between 1 and 99');
    });

    test('should reject invalid quantity', () => {
      const order: OrderRequest = {
        marketId: 'market-1',
        userId: 'user-1',
        side: 'YES',
        quantity: 0, // Invalid quantity
        price: 50,
      };

      const validateOrder = (engine as any).validateOrder;
      const result = validateOrder(order);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Quantity must be between 1 and 10000');
    });
  });

  describe('Order Cost Calculation', () => {
    test('should calculate YES order cost correctly', () => {
      const calculateOrderCost = (engine as any).calculateOrderCost;
      const cost = calculateOrderCost('YES', 60, 100);
      
      // Cost = (price * quantity) / 100 = (60 * 100) / 100 = 60
      expect(cost).toBe(60);
    });

    test('should calculate NO order cost correctly', () => {
      const calculateOrderCost = (engine as any).calculateOrderCost;
      const cost = calculateOrderCost('NO', 70, 50);
      
      // Cost = (price * quantity) / 100 = (70 * 50) / 100 = 35
      expect(cost).toBe(35);
    });

    test('should handle edge cases', () => {
      const calculateOrderCost = (engine as any).calculateOrderCost;
      
      // Minimum values
      expect(calculateOrderCost('YES', 1, 1)).toBe(0.01);
      
      // Maximum values
      expect(calculateOrderCost('YES', 99, 10000)).toBe(9900);
    });
  });

  describe('Order Placement', () => {
    test('should place order successfully when user has sufficient balance', async () => {
      const mockUser = {
        user_id: 'user-1',
        available_balance: 1000,
        locked_balance: 0,
        total_deposited: 1000,
        total_profit_loss: 0,
        total_trades: 0,
        winning_trades: 0,
        total_volume: 0,
        total_withdrawn: 0,
      };

      const mockOrder = {
        id: 'order-1',
        market_id: 'market-1',
        user_id: 'user-1',
        side: 'YES',
        quantity: 100,
        price: 50,
        status: 'open',
        order_type: 'limit',
        filled_quantity: 0,
        remaining_quantity: 100,
        total_cost: 50,
      };

      // Mock RPC failure to test manual transaction
      mockSupabase.rpc.mockResolvedValue({ error: { message: 'Function not found' } });

      // Mock balance check
      mockSupabase.from().single.mockResolvedValueOnce({ 
        data: mockUser, 
        error: null 
      });

      // Mock order creation
      mockSupabase.from().single.mockResolvedValueOnce({ 
        data: mockOrder, 
        error: null 
      });

      // Mock balance update
      mockSupabase.from().eq.mockResolvedValue({ error: null });

      const orderRequest: OrderRequest = {
        marketId: 'market-1',
        userId: 'user-1',
        side: 'YES',
        quantity: 100,
        price: 50,
      };

      const result = await engine.placeOrder(orderRequest);

      expect(result.success).toBe(true);
      expect(result.orderId).toBe('order-1');
      expect(result.filledQuantity).toBe(0);
      expect(result.remainingQuantity).toBe(100);
    });

    test('should reject order when insufficient balance', async () => {
      const mockUser = {
        user_id: 'user-1',
        available_balance: 10, // Insufficient for order cost of 50
        locked_balance: 0,
        total_deposited: 10,
      };

      // Mock RPC failure
      mockSupabase.rpc.mockResolvedValue({ error: { message: 'Function not found' } });

      // Mock balance check
      mockSupabase.from().single.mockResolvedValueOnce({ 
        data: mockUser, 
        error: null 
      });

      const orderRequest: OrderRequest = {
        marketId: 'market-1',
        userId: 'user-1',
        side: 'YES',
        quantity: 100,
        price: 50,
      };

      const result = await engine.placeOrder(orderRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient balance');
    });

    test('should create default balance for new user', async () => {
      const mockNewUser = {
        user_id: 'new-user',
        available_balance: 10000,
        locked_balance: 0,
        total_deposited: 10000,
        total_profit_loss: 0,
        total_trades: 0,
        winning_trades: 0,
        total_volume: 0,
        total_withdrawn: 0,
      };

      const mockOrder = {
        id: 'order-1',
        market_id: 'market-1',
        user_id: 'new-user',
        side: 'YES',
        quantity: 100,
        price: 50,
        status: 'open',
        total_cost: 50,
      };

      // Mock RPC failure
      mockSupabase.rpc.mockResolvedValue({ error: { message: 'Function not found' } });

      // Mock balance check - user not found
      mockSupabase.from().single
        .mockResolvedValueOnce({ 
          data: null, 
          error: { code: 'PGRST116' } // User not found
        })
        .mockResolvedValueOnce({ 
          data: mockNewUser, 
          error: null 
        })
        .mockResolvedValueOnce({ 
          data: mockOrder, 
          error: null 
        });

      // Mock balance update
      mockSupabase.from().eq.mockResolvedValue({ error: null });

      const orderRequest: OrderRequest = {
        marketId: 'market-1',
        userId: 'new-user',
        side: 'YES',
        quantity: 100,
        price: 50,
      };

      const result = await engine.placeOrder(orderRequest);

      expect(result.success).toBe(true);
      expect(result.orderId).toBe('order-1');
    });
  });

  describe('Order Cancellation', () => {
    test('should cancel order successfully', async () => {
      const mockOrder = {
        id: 'order-1',
        user_id: 'user-1',
        side: 'YES',
        quantity: 100,
        price: 50,
        remaining_quantity: 100,
        status: 'open',
      };

      // Mock order fetch
      mockSupabase.from().single.mockResolvedValueOnce({ 
        data: mockOrder, 
        error: null 
      });

      // Mock order cancellation
      mockSupabase.from().eq.mockResolvedValueOnce({ error: null });

      // Mock balance unlock
      mockSupabase.from().eq.mockResolvedValueOnce({ error: null });

      const result = await engine.cancelOrder('order-1', 'user-1');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject cancellation of non-existent order', async () => {
      // Mock order not found
      mockSupabase.from().single.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Order not found' } 
      });

      const result = await engine.cancelOrder('non-existent', 'user-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Order not found');
    });
  });
}); 