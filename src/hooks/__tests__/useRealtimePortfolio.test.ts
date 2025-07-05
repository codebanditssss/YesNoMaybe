import { renderHook, act } from '@testing-library/react';
import { useRealtimePortfolio } from '../useRealtimePortfolio';
import { usePortfolio } from '../usePortfolio';

// Mock the usePortfolio hook
jest.mock('../usePortfolio');
const mockUsePortfolio = usePortfolio as jest.MockedFunction<typeof usePortfolio>;

// Mock EventSource
const mockEventSource = {
  onmessage: null as any,
  onerror: null as any,
  close: jest.fn()
};

const mockEventSourceConstructor = jest.fn(() => mockEventSource);
(global as any).EventSource = mockEventSourceConstructor;

describe('useRealtimePortfolio', () => {
  const mockPortfolioData = {
    data: {
      totalValue: 10000,
      availableBalance: 5000,
      lockedBalance: 2000,
      totalPnl: 500,
      dailyPnl: 100,
      positions: [
        {
          marketId: 'market-1',
          marketTitle: 'Test Market',
          shares: 10,
          avgPrice: 50,
          currentPrice: 55,
          unrealizedPnl: 50
        }
      ]
    },
    loading: false,
    error: null,
    refresh: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePortfolio.mockReturnValue(mockPortfolioData);
  });

  afterEach(() => {
    // Clean up any open connections
    if (mockEventSource.close) {
      mockEventSource.close();
    }
  });

  it('should initialize with default options', () => {
    const { result } = renderHook(() => useRealtimePortfolio());

    expect(result.current.data).toEqual(mockPortfolioData.data);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.realtimeUpdates).toEqual({
      lastUpdate: expect.any(Date),
      type: null
    });
  });

  it('should establish SSE connection when userId is provided', () => {
    const userId = 'test-user-123';
    
    renderHook(() => useRealtimePortfolio({ userId }));

    expect(mockEventSourceConstructor).toHaveBeenCalledWith('/api/realtime');
    expect(mockEventSource.onmessage).toBeInstanceOf(Function);
    expect(mockEventSource.onerror).toBeInstanceOf(Function);
  });

  it('should not establish SSE connection when userId is not provided', () => {
    renderHook(() => useRealtimePortfolio());

    expect(mockEventSourceConstructor).not.toHaveBeenCalled();
  });

  it('should handle balance_updated events', () => {
    const userId = 'test-user-123';
    const { result } = renderHook(() => useRealtimePortfolio({ userId }));

    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'balance_updated',
          userId,
          newBalance: 9000
        })
      };
      mockEventSource.onmessage(event);
    });

    expect(result.current.realtimeUpdates.type).toBe('balance');
    expect(result.current.realtimeUpdates.lastUpdate).toBeInstanceOf(Date);
    expect(mockPortfolioData.refresh).toHaveBeenCalled();
  });

  it('should handle position_updated events', () => {
    const userId = 'test-user-123';
    const { result } = renderHook(() => useRealtimePortfolio({ userId }));

    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'position_updated',
          userId,
          marketId: 'market-1',
          shares: 15
        })
      };
      mockEventSource.onmessage(event);
    });

    expect(result.current.realtimeUpdates.type).toBe('position');
    expect(result.current.realtimeUpdates.lastUpdate).toBeInstanceOf(Date);
    expect(mockPortfolioData.refresh).toHaveBeenCalled();
  });

  it('should handle order_filled events', () => {
    const userId = 'test-user-123';
    const { result } = renderHook(() => useRealtimePortfolio({ userId }));

    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'order_filled',
          userId,
          orderId: 'order-123',
          marketId: 'market-1'
        })
      };
      mockEventSource.onmessage(event);
    });

    expect(result.current.realtimeUpdates.type).toBe('order');
    expect(result.current.realtimeUpdates.lastUpdate).toBeInstanceOf(Date);
    expect(mockPortfolioData.refresh).toHaveBeenCalled();
  });

  it('should handle order_cancelled events', () => {
    const userId = 'test-user-123';
    const { result } = renderHook(() => useRealtimePortfolio({ userId }));

    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'order_cancelled',
          userId,
          orderId: 'order-123'
        })
      };
      mockEventSource.onmessage(event);
    });

    expect(result.current.realtimeUpdates.type).toBe('order');
    expect(result.current.realtimeUpdates.lastUpdate).toBeInstanceOf(Date);
    expect(mockPortfolioData.refresh).toHaveBeenCalled();
  });

  it('should ignore unknown event types', () => {
    const userId = 'test-user-123';
    const { result } = renderHook(() => useRealtimePortfolio({ userId }));

    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'unknown_event',
          userId
        })
      };
      mockEventSource.onmessage(event);
    });

    expect(result.current.realtimeUpdates.type).toBeNull();
    expect(mockPortfolioData.refresh).not.toHaveBeenCalled();
  });

  it('should handle invalid JSON gracefully', () => {
    const userId = 'test-user-123';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    renderHook(() => useRealtimePortfolio({ userId }));

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
    const userId = 'test-user-123';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    renderHook(() => useRealtimePortfolio({ userId }));

    act(() => {
      mockEventSource.onerror(new Error('Connection failed'));
    });

    expect(consoleSpy).toHaveBeenCalledWith('SSE connection error:', expect.any(Error));
    expect(mockEventSource.close).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should close connection on unmount', () => {
    const userId = 'test-user-123';
    const { unmount } = renderHook(() => useRealtimePortfolio({ userId }));

    unmount();

    expect(mockEventSource.close).toHaveBeenCalled();
  });

  it('should pass through portfolio data correctly', () => {
    const customPortfolioData = {
      ...mockPortfolioData,
      data: {
        ...mockPortfolioData.data,
        totalValue: 15000,
        availableBalance: 7000,
        totalPnl: 1000
      }
    };
    
    mockUsePortfolio.mockReturnValue(customPortfolioData);

    const { result } = renderHook(() => useRealtimePortfolio());

    expect(result.current.data).toEqual(customPortfolioData.data);
    expect(result.current.loading).toBe(customPortfolioData.loading);
    expect(result.current.error).toBe(customPortfolioData.error);
  });

  it('should handle multiple event types in sequence', () => {
    const userId = 'test-user-123';
    const { result } = renderHook(() => useRealtimePortfolio({ userId }));

    // Balance update first
    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'balance_updated',
          userId,
          newBalance: 9000
        })
      };
      mockEventSource.onmessage(event);
    });

    expect(result.current.realtimeUpdates.type).toBe('balance');

    // Then position update
    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'position_updated',
          userId,
          marketId: 'market-1'
        })
      };
      mockEventSource.onmessage(event);
    });

    expect(result.current.realtimeUpdates.type).toBe('position');

    // Finally order update
    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'order_filled',
          userId,
          orderId: 'order-123'
        })
      };
      mockEventSource.onmessage(event);
    });

    expect(result.current.realtimeUpdates.type).toBe('order');
    expect(mockPortfolioData.refresh).toHaveBeenCalledTimes(3);
  });

  it('should handle rapid successive balance updates', () => {
    const userId = 'test-user-123';
    const { result } = renderHook(() => useRealtimePortfolio({ userId }));

    // Simulate rapid balance updates
    act(() => {
      for (let i = 0; i < 5; i++) {
        const event = {
          data: JSON.stringify({
            type: 'balance_updated',
            userId,
            newBalance: 9000 + i * 100
          })
        };
        mockEventSource.onmessage(event);
      }
    });

    expect(result.current.realtimeUpdates.type).toBe('balance');
    expect(mockPortfolioData.refresh).toHaveBeenCalledTimes(5);
  });
}); 