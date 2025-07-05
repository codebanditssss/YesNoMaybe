import { renderHook, act } from '@testing-library/react';
import { useRealtimeTradeHistory } from '../useRealtimeTradeHistory';
import { useTradeHistory } from '../useTradeHistory';

// Mock the useTradeHistory hook
jest.mock('../useTradeHistory');
const mockUseTradeHistory = useTradeHistory as jest.MockedFunction<typeof useTradeHistory>;

// Mock EventSource
const mockEventSource = {
  onmessage: null as any,
  onerror: null as any,
  close: jest.fn()
};

const mockEventSourceConstructor = jest.fn(() => mockEventSource);
(global as any).EventSource = mockEventSourceConstructor;

describe('useRealtimeTradeHistory', () => {
  const mockTradeHistoryData = {
    data: [
      {
        id: 'trade-1',
        marketId: 'market-1',
        marketTitle: 'Test Market',
        side: 'yes' as const,
        shares: 10,
        price: 0.6,
        amount: 6.0,
        timestamp: new Date('2024-01-01T10:00:00Z'),
        pnl: 2.5,
        status: 'filled' as const
      }
    ],
    loading: false,
    error: null,
    refresh: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTradeHistory.mockReturnValue(mockTradeHistoryData);
  });

  afterEach(() => {
    // Clean up any open connections
    if (mockEventSource.close) {
      mockEventSource.close();
    }
  });

  it('should initialize with default options', () => {
    const { result } = renderHook(() => useRealtimeTradeHistory());

    expect(result.current.data).toEqual(mockTradeHistoryData.data);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.realtimeUpdates).toEqual({
      lastUpdate: expect.any(Date),
      type: null
    });
  });

  it('should establish SSE connection when userId is provided', () => {
    const userId = 'test-user-123';
    
    renderHook(() => useRealtimeTradeHistory({ userId }));

    expect(mockEventSourceConstructor).toHaveBeenCalledWith('/api/realtime');
    expect(mockEventSource.onmessage).toBeInstanceOf(Function);
    expect(mockEventSource.onerror).toBeInstanceOf(Function);
  });

  it('should not establish SSE connection when userId is not provided', () => {
    renderHook(() => useRealtimeTradeHistory());

    expect(mockEventSourceConstructor).not.toHaveBeenCalled();
  });

  it('should handle trade_executed events', () => {
    const userId = 'test-user-123';
    const { result } = renderHook(() => useRealtimeTradeHistory({ userId }));

    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'trade_executed',
          trade_id: 'trade-123',
          userId,
          marketId: 'market-1'
        })
      };
      mockEventSource.onmessage(event);
    });

    expect(result.current.realtimeUpdates.type).toBe('trade');
    expect(result.current.realtimeUpdates.tradeId).toBe('trade-123');
    expect(result.current.realtimeUpdates.lastUpdate).toBeInstanceOf(Date);
    expect(mockTradeHistoryData.refresh).toHaveBeenCalled();
  });

  it('should ignore unknown event types', () => {
    const userId = 'test-user-123';
    const { result } = renderHook(() => useRealtimeTradeHistory({ userId }));

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
    expect(mockTradeHistoryData.refresh).not.toHaveBeenCalled();
  });

  it('should handle connection errors gracefully', () => {
    const userId = 'test-user-123';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    renderHook(() => useRealtimeTradeHistory({ userId }));

    act(() => {
      mockEventSource.onerror(new Error('Connection failed'));
    });

    expect(consoleSpy).toHaveBeenCalledWith('SSE connection error:', expect.any(Error));
    expect(mockEventSource.close).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should close connection on unmount', () => {
    const userId = 'test-user-123';
    const { unmount } = renderHook(() => useRealtimeTradeHistory({ userId }));

    unmount();

    expect(mockEventSource.close).toHaveBeenCalled();
  });

  it('should handle rapid trade events', () => {
    const userId = 'test-user-123';
    const { result } = renderHook(() => useRealtimeTradeHistory({ userId }));

    // Simulate rapid trade events
    act(() => {
      for (let i = 0; i < 5; i++) {
        const event = {
          data: JSON.stringify({
            type: 'trade_executed',
            trade_id: `trade-${i}`,
            userId,
            marketId: 'market-1'
          })
        };
        mockEventSource.onmessage(event);
      }
    });

    expect(result.current.realtimeUpdates.type).toBe('trade');
    expect(result.current.realtimeUpdates.tradeId).toBe('trade-4'); // Last trade ID
    expect(mockTradeHistoryData.refresh).toHaveBeenCalledTimes(5);
  });

  it('should pass through trade history data correctly', () => {
    const customTradeData = {
      ...mockTradeHistoryData,
      data: [
        {
          id: 'trade-2',
          marketId: 'market-2',
          marketTitle: 'Another Market',
          side: 'no' as const,
          shares: 5,
          price: 0.4,
          amount: 2.0,
          timestamp: new Date('2024-01-02T10:00:00Z'),
          pnl: -1.5,
          status: 'filled' as const
        }
      ]
    };
    
    mockUseTradeHistory.mockReturnValue(customTradeData);

    const { result } = renderHook(() => useRealtimeTradeHistory());

    expect(result.current.data).toEqual(customTradeData.data);
    expect(result.current.loading).toBe(customTradeData.loading);
    expect(result.current.error).toBe(customTradeData.error);
  });

  it('should handle invalid JSON gracefully', () => {
    const userId = 'test-user-123';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    renderHook(() => useRealtimeTradeHistory({ userId }));

    act(() => {
      const event = {
        data: 'invalid json'
      };
      mockEventSource.onmessage(event);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error processing realtime event:', expect.any(Error));
    consoleSpy.mockRestore();
  });
}); 