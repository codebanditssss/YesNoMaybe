import { renderHook, act } from '@testing-library/react';
import { useRealtimeOrderbook } from '../useRealtimeOrderbook';
import { useOrderbook } from '../useOrderbook';

// Mock the useOrderbook hook
jest.mock('../useOrderbook');
const mockUseOrderbook = useOrderbook as jest.MockedFunction<typeof useOrderbook>;

// Mock EventSource
const mockEventSource = {
  onmessage: null as any,
  onerror: null as any,
  close: jest.fn()
};

const mockEventSourceConstructor = jest.fn(() => mockEventSource);
(global as any).EventSource = mockEventSourceConstructor;

describe('useRealtimeOrderbook', () => {
  const mockOrderbookData = {
    data: {
      bids: [{ price: 100, volume: 10, orders: 1 }],
      asks: [{ price: 101, volume: 5, orders: 1 }]
    },
    loading: false,
    error: null,
    refresh: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrderbook.mockReturnValue(mockOrderbookData);
  });

  afterEach(() => {
    // Clean up any open connections
    if (mockEventSource.close) {
      mockEventSource.close();
    }
  });

  it('should initialize with default options', () => {
    const { result } = renderHook(() => useRealtimeOrderbook());

    expect(result.current.data).toEqual(mockOrderbookData.data);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.realtimeUpdates).toEqual({
      lastUpdate: expect.any(Date),
      type: null
    });
  });

  it('should establish SSE connection when marketId is provided', () => {
    const marketId = 'test-market-123';
    
    renderHook(() => useRealtimeOrderbook({ marketId }));

    expect(mockEventSourceConstructor).toHaveBeenCalledWith('/api/realtime');
    expect(mockEventSource.onmessage).toBeInstanceOf(Function);
    expect(mockEventSource.onerror).toBeInstanceOf(Function);
  });

  it('should not establish SSE connection when marketId is not provided', () => {
    renderHook(() => useRealtimeOrderbook());

    expect(mockEventSourceConstructor).not.toHaveBeenCalled();
  });

  it('should handle order_created events', () => {
    const marketId = 'test-market-123';
    const { result } = renderHook(() => useRealtimeOrderbook({ marketId }));

    // Simulate receiving an order_created event
    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'order_created',
          marketId,
          orderId: 'order-123'
        })
      };
      mockEventSource.onmessage(event);
    });

    expect(result.current.realtimeUpdates.type).toBe('order');
    expect(result.current.realtimeUpdates.lastUpdate).toBeInstanceOf(Date);
    expect(mockOrderbookData.refresh).toHaveBeenCalled();
  });

  it('should handle order_cancelled events', () => {
    const marketId = 'test-market-123';
    const { result } = renderHook(() => useRealtimeOrderbook({ marketId }));

    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'order_cancelled',
          marketId,
          orderId: 'order-123'
        })
      };
      mockEventSource.onmessage(event);
    });

    expect(result.current.realtimeUpdates.type).toBe('order');
    expect(mockOrderbookData.refresh).toHaveBeenCalled();
  });

  it('should handle order_filled events', () => {
    const marketId = 'test-market-123';
    const { result } = renderHook(() => useRealtimeOrderbook({ marketId }));

    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'order_filled',
          marketId,
          orderId: 'order-123'
        })
      };
      mockEventSource.onmessage(event);
    });

    expect(result.current.realtimeUpdates.type).toBe('order');
    expect(mockOrderbookData.refresh).toHaveBeenCalled();
  });

  it('should handle trade_executed events', () => {
    const marketId = 'test-market-123';
    const { result } = renderHook(() => useRealtimeOrderbook({ marketId }));

    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'trade_executed',
          marketId,
          tradeId: 'trade-123'
        })
      };
      mockEventSource.onmessage(event);
    });

    expect(result.current.realtimeUpdates.type).toBe('trade');
    expect(mockOrderbookData.refresh).toHaveBeenCalled();
  });

  it('should ignore unknown event types', () => {
    const marketId = 'test-market-123';
    const { result } = renderHook(() => useRealtimeOrderbook({ marketId }));

    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'unknown_event',
          marketId
        })
      };
      mockEventSource.onmessage(event);
    });

    expect(result.current.realtimeUpdates.type).toBeNull();
    expect(mockOrderbookData.refresh).not.toHaveBeenCalled();
  });

  it('should handle invalid JSON gracefully', () => {
    const marketId = 'test-market-123';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    renderHook(() => useRealtimeOrderbook({ marketId }));

    act(() => {
      const event = {
        data: 'invalid json'
      };
      mockEventSource.onmessage(event);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error processing realtime event:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should handle connection errors', () => {
    const marketId = 'test-market-123';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    renderHook(() => useRealtimeOrderbook({ marketId }));

    act(() => {
      mockEventSource.onerror(new Error('Connection failed'));
    });

    expect(consoleSpy).toHaveBeenCalledWith('SSE connection error:', expect.any(Error));
    expect(mockEventSource.close).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should close connection on unmount', () => {
    const marketId = 'test-market-123';
    const { unmount } = renderHook(() => useRealtimeOrderbook({ marketId }));

    unmount();

    expect(mockEventSource.close).toHaveBeenCalled();
  });

  it('should pass through orderbook data correctly', () => {
    const customOrderbookData = {
      ...mockOrderbookData,
      data: {
        bids: [{ price: 200, volume: 20, orders: 2 }],
        asks: [{ price: 201, volume: 15, orders: 3 }]
      }
    };
    
    mockUseOrderbook.mockReturnValue(customOrderbookData);

    const { result } = renderHook(() => useRealtimeOrderbook());

    expect(result.current.data).toEqual(customOrderbookData.data);
    expect(result.current.loading).toBe(customOrderbookData.loading);
    expect(result.current.error).toBe(customOrderbookData.error);
  });

  it('should handle rapid successive events', () => {
    const marketId = 'test-market-123';
    const { result } = renderHook(() => useRealtimeOrderbook({ marketId }));

    // Simulate rapid events
    act(() => {
      for (let i = 0; i < 5; i++) {
        const event = {
          data: JSON.stringify({
            type: 'order_created',
            marketId,
            orderId: `order-${i}`
          })
        };
        mockEventSource.onmessage(event);
      }
    });

    expect(result.current.realtimeUpdates.type).toBe('order');
    expect(mockOrderbookData.refresh).toHaveBeenCalledTimes(5);
  });
}); 