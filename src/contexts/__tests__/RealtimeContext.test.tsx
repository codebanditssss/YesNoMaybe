import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { RealtimeProvider, useRealtime, RealtimeEvent } from '../RealtimeContext';

// Mock EventSource
const mockEventSource = {
  onopen: null as any,
  onmessage: null as any,
  onerror: null as any,
  close: jest.fn(),
  readyState: 0,
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2
};

const mockEventSourceConstructor = jest.fn(() => {
  const instance = { ...mockEventSource };
  // Reset the mock instance for each test
  instance.close = jest.fn();
  return instance;
});

// Mock the global EventSource
Object.defineProperty(global, 'EventSource', {
  value: mockEventSourceConstructor,
  writable: true
});

// Test component that uses the RealtimeContext
function TestComponent() {
  const { 
    isConnected, 
    connectionState, 
    lastEvent, 
    events, 
    error, 
    connect, 
    disconnect, 
    clearEvents,
    subscribe 
  } = useRealtime();

  const [subscriptionEvent, setSubscriptionEvent] = React.useState<RealtimeEvent | null>(null);

  React.useEffect(() => {
    const unsubscribe = subscribe((event) => {
      setSubscriptionEvent(event);
    });

    return unsubscribe;
  }, [subscribe]);

  return (
    <div>
      <div data-testid="connection-state">{connectionState}</div>
      <div data-testid="is-connected">{isConnected ? 'true' : 'false'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="events-count">{events.length}</div>
      <div data-testid="last-event">{lastEvent?.type || 'no-event'}</div>
      <div data-testid="subscription-event">{subscriptionEvent?.type || 'no-subscription-event'}</div>
      <button onClick={connect} data-testid="connect-btn">Connect</button>
      <button onClick={disconnect} data-testid="disconnect-btn">Disconnect</button>
      <button onClick={clearEvents} data-testid="clear-events-btn">Clear Events</button>
    </div>
  );
}

describe('RealtimeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEventSource.readyState = 0;
    mockEventSource.onopen = null;
    mockEventSource.onmessage = null;
    mockEventSource.onerror = null;
  });

  afterEach(() => {
    // Clean up any timers
    jest.clearAllTimers();
  });

  it('should provide initial state', () => {
    render(
      <RealtimeProvider autoConnect={false}>
        <TestComponent />
      </RealtimeProvider>
    );

    expect(screen.getByTestId('connection-state')).toHaveTextContent('disconnected');
    expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    expect(screen.getByTestId('events-count')).toHaveTextContent('0');
    expect(screen.getByTestId('last-event')).toHaveTextContent('no-event');
  });

  it('should auto-connect when autoConnect is true', () => {
    render(
      <RealtimeProvider autoConnect={true}>
        <TestComponent />
      </RealtimeProvider>
    );

    expect(mockEventSourceConstructor).toHaveBeenCalledWith('/api/realtime');
    expect(screen.getByTestId('connection-state')).toHaveTextContent('connecting');
  });

  it('should not auto-connect when autoConnect is false', () => {
    render(
      <RealtimeProvider autoConnect={false}>
        <TestComponent />
      </RealtimeProvider>
    );

    expect(mockEventSourceConstructor).not.toHaveBeenCalled();
    expect(screen.getByTestId('connection-state')).toHaveTextContent('disconnected');
  });

  it('should handle manual connection', () => {
    render(
      <RealtimeProvider autoConnect={false}>
        <TestComponent />
      </RealtimeProvider>
    );

    act(() => {
      screen.getByTestId('connect-btn').click();
    });

    expect(mockEventSourceConstructor).toHaveBeenCalledWith('/api/realtime');
    expect(screen.getByTestId('connection-state')).toHaveTextContent('connecting');
  });

  it('should handle successful connection', async () => {
    render(
      <RealtimeProvider autoConnect={false}>
        <TestComponent />
      </RealtimeProvider>
    );

    act(() => {
      screen.getByTestId('connect-btn').click();
    });

    // Simulate successful connection
    act(() => {
      mockEventSource.readyState = 1; // OPEN
      mockEventSource.onopen?.({} as Event);
    });

    await waitFor(() => {
      expect(screen.getByTestId('connection-state')).toHaveTextContent('connected');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('true');
    });
  });

  it('should handle connection events', async () => {
    render(
      <RealtimeProvider autoConnect={false}>
        <TestComponent />
      </RealtimeProvider>
    );

    act(() => {
      screen.getByTestId('connect-btn').click();
    });

    // Simulate connection event
    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'connection',
          message: 'Connected to realtime updates',
          timestamp: new Date().toISOString()
        })
      };
      mockEventSource.onmessage?.(event as MessageEvent);
    });

    await waitFor(() => {
      expect(screen.getByTestId('last-event')).toHaveTextContent('connection');
      expect(screen.getByTestId('events-count')).toHaveTextContent('1');
    });
  });

  it('should handle heartbeat events', async () => {
    render(
      <RealtimeProvider autoConnect={false}>
        <TestComponent />
      </RealtimeProvider>
    );

    act(() => {
      screen.getByTestId('connect-btn').click();
    });

    // Simulate heartbeat event
    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        })
      };
      mockEventSource.onmessage?.(event as MessageEvent);
    });

    await waitFor(() => {
      expect(screen.getByTestId('last-event')).toHaveTextContent('heartbeat');
      expect(screen.getByTestId('events-count')).toHaveTextContent('1');
    });
  });

  it('should handle database change events', async () => {
    render(
      <RealtimeProvider autoConnect={false}>
        <TestComponent />
      </RealtimeProvider>
    );

    act(() => {
      screen.getByTestId('connect-btn').click();
    });

    // Simulate database change event
    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'database_change',
          channel: 'orders',
          operation: 'INSERT',
          table: 'orders',
          data: { id: 'order-123', status: 'pending' },
          timestamp: new Date().toISOString()
        })
      };
      mockEventSource.onmessage?.(event as MessageEvent);
    });

    await waitFor(() => {
      expect(screen.getByTestId('last-event')).toHaveTextContent('database_change');
      expect(screen.getByTestId('events-count')).toHaveTextContent('1');
    });
  });

  it('should handle subscription callbacks', async () => {
    render(
      <RealtimeProvider autoConnect={false}>
        <TestComponent />
      </RealtimeProvider>
    );

    act(() => {
      screen.getByTestId('connect-btn').click();
    });

    // Simulate database change event
    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'database_change',
          channel: 'orders',
          operation: 'INSERT',
          table: 'orders',
          data: { id: 'order-123' },
          timestamp: new Date().toISOString()
        })
      };
      mockEventSource.onmessage?.(event as MessageEvent);
    });

    await waitFor(() => {
      expect(screen.getByTestId('subscription-event')).toHaveTextContent('database_change');
    });
  });

  it('should handle connection errors', async () => {
    render(
      <RealtimeProvider autoConnect={false}>
        <TestComponent />
      </RealtimeProvider>
    );

    act(() => {
      screen.getByTestId('connect-btn').click();
    });

    // Simulate connection error
    act(() => {
      mockEventSource.onerror?.(new Error('Connection failed') as any);
    });

    await waitFor(() => {
      expect(screen.getByTestId('connection-state')).toHaveTextContent('error');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('Connection lost');
    });
  });

  it('should handle reconnection with exponential backoff', async () => {
    jest.useFakeTimers();

    render(
      <RealtimeProvider autoConnect={false}>
        <TestComponent />
      </RealtimeProvider>
    );

    act(() => {
      screen.getByTestId('connect-btn').click();
    });

    // Simulate connection error
    act(() => {
      mockEventSource.onerror?.(new Error('Connection failed') as any);
    });

    // Fast forward time for first reconnection attempt
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockEventSourceConstructor).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('should handle manual disconnection', async () => {
    render(
      <RealtimeProvider autoConnect={false}>
        <TestComponent />
      </RealtimeProvider>
    );

    act(() => {
      screen.getByTestId('connect-btn').click();
    });

    act(() => {
      screen.getByTestId('disconnect-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('connection-state')).toHaveTextContent('disconnected');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
    });

    expect(mockEventSource.close).toHaveBeenCalled();
  });

  it('should clear events when requested', async () => {
    render(
      <RealtimeProvider autoConnect={false}>
        <TestComponent />
      </RealtimeProvider>
    );

    act(() => {
      screen.getByTestId('connect-btn').click();
    });

    // Add some events
    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        })
      };
      mockEventSource.onmessage?.(event as MessageEvent);
    });

    await waitFor(() => {
      expect(screen.getByTestId('events-count')).toHaveTextContent('1');
    });

    // Clear events
    act(() => {
      screen.getByTestId('clear-events-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('events-count')).toHaveTextContent('0');
      expect(screen.getByTestId('last-event')).toHaveTextContent('no-event');
    });
  });

  it('should limit events to maxEvents', async () => {
    const maxEvents = 3;
    render(
      <RealtimeProvider autoConnect={false} maxEvents={maxEvents}>
        <TestComponent />
      </RealtimeProvider>
    );

    act(() => {
      screen.getByTestId('connect-btn').click();
    });

    // Add more events than the limit
    act(() => {
      for (let i = 0; i < 5; i++) {
        const event = {
          data: JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          })
        };
        mockEventSource.onmessage?.(event as MessageEvent);
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('events-count')).toHaveTextContent(maxEvents.toString());
    });
  });

  it('should handle invalid JSON gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <RealtimeProvider autoConnect={false}>
        <TestComponent />
      </RealtimeProvider>
    );

    act(() => {
      screen.getByTestId('connect-btn').click();
    });

    // Send invalid JSON
    act(() => {
      const event = {
        data: 'invalid json'
      };
      mockEventSource.onmessage?.(event as MessageEvent);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error parsing SSE data:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should handle subscription errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Create a component with a failing subscription
    function FailingTestComponent() {
      const { subscribe, connect } = useRealtime();

      React.useEffect(() => {
        const unsubscribe = subscribe(() => {
          throw new Error('Subscription failed');
        });

        return unsubscribe;
      }, [subscribe]);

      return (
        <div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
          Test
        </div>
      );
    }

    render(
      <RealtimeProvider autoConnect={false}>
        <FailingTestComponent />
      </RealtimeProvider>
    );

    act(() => {
      screen.getByTestId('connect-btn').click();
    });

    // Simulate an event that will trigger the failing subscription
    act(() => {
      const event = {
        data: JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        })
      };
      mockEventSource.onmessage?.(event as MessageEvent);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error in realtime subscriber:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should throw error when useRealtime is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    function TestComponentOutsideProvider() {
      const { isConnected } = useRealtime();
      return <div>{isConnected ? 'connected' : 'disconnected'}</div>;
    }

    expect(() => {
      render(<TestComponentOutsideProvider />);
    }).toThrow('useRealtime must be used within a RealtimeProvider');

    consoleSpy.mockRestore();
  });
}); 