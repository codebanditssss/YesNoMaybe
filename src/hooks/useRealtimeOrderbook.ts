import { useState, useEffect, useCallback } from 'react';
import { useOrderbook, OrderbookData } from './useOrderbook';

interface UseRealtimeOrderbookOptions {
  marketId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useRealtimeOrderbook(options: UseRealtimeOrderbookOptions = {}) {
  const {
    marketId,
    autoRefresh = true,
    refreshInterval = 5000
  } = options;

  // Use base orderbook hook for initial data and polling
  const orderbookData = useOrderbook(marketId, {
    autoRefresh,
    refreshInterval
  });

  // State for real-time updates
  const [realtimeUpdates, setRealtimeUpdates] = useState<{
    lastUpdate: Date;
    type: 'order' | 'trade' | null;
  }>({
    lastUpdate: new Date(),
    type: null
  });

  // Handle real-time updates
  const handleRealtimeEvent = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      // Handle different event types
      switch (data.type) {
        case 'order_created':
        case 'order_cancelled':
        case 'order_filled':
          setRealtimeUpdates({
            lastUpdate: new Date(),
            type: 'order'
          });
          // Trigger refresh to get latest orderbook state
          orderbookData.refresh();
          break;

        case 'trade_executed':
          setRealtimeUpdates({
            lastUpdate: new Date(),
            type: 'trade'
          });
          // Trigger refresh to get latest trades
          orderbookData.refresh();
          break;

        default:
          // Ignore other event types
          break;
      }
    } catch (err) {
      console.error('Error processing realtime event:', err);
    }
  }, [orderbookData]);

  // Set up SSE connection
  useEffect(() => {
    if (!marketId) return;

    const eventSource = new EventSource('/api/realtime');
    
    eventSource.onmessage = handleRealtimeEvent;
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // Attempt to reconnect after error
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [marketId, handleRealtimeEvent]);

  return {
    ...orderbookData,
    realtimeUpdates
  };
} 