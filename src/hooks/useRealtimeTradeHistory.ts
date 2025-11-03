import { useState, useEffect, useCallback } from 'react';
import { useTradeHistory } from './useTradeHistory';

interface UseRealtimeTradeHistoryOptions {
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'filled_quantity' | 'price' | 'quantity';
  sortOrder?: 'asc' | 'desc';
}

export function useRealtimeTradeHistory(options: UseRealtimeTradeHistoryOptions = {}) {
  const {
    userId,
    autoRefresh = true,
    refreshInterval = 5000,
    limit = 50,
    offset = 0,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options;

  // Use base trade history hook for initial data and polling
  const tradeHistoryData = useTradeHistory({
    limit,
    offset,
    sortBy,
    sortOrder
  });

  // State for real-time updates
  const [realtimeUpdates, setRealtimeUpdates] = useState<{
    lastUpdate: Date;
    type: 'trade' | null;
    tradeId?: string;
  }>({
    lastUpdate: new Date(),
    type: null
  });

  // Handle real-time updates
  const handleRealtimeEvent = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      // Handle trade events
      if (data.type === 'trade_executed') {
        setRealtimeUpdates({
          lastUpdate: new Date(),
          type: 'trade',
          tradeId: data.trade_id
        });
        tradeHistoryData.refresh();
      }
    } catch (err) {
      console.error('Error processing realtime event:', err);
    }
  }, [tradeHistoryData]);

  // Set up SSE connection
  useEffect(() => {
    if (!userId) return;

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
  }, [userId, handleRealtimeEvent]);

  return {
    ...tradeHistoryData,
    realtimeUpdates
  };
} 