import { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from './usePortfolio';

interface UseRealtimePortfolioOptions {
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useRealtimePortfolio(options: UseRealtimePortfolioOptions = {}) {
  const {
    userId,
    autoRefresh = true,
    refreshInterval = 5000
  } = options;

  // Use base portfolio hook for initial data and polling
  const portfolioData = usePortfolio();

  // State for real-time updates
  const [realtimeUpdates, setRealtimeUpdates] = useState<{
    lastUpdate: Date;
    type: 'balance' | 'position' | 'order' | null;
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
        case 'balance_updated':
          setRealtimeUpdates({
            lastUpdate: new Date(),
            type: 'balance'
          });
          portfolioData.refresh();
          break;

        case 'position_updated':
          setRealtimeUpdates({
            lastUpdate: new Date(),
            type: 'position'
          });
          portfolioData.refresh();
          break;

        case 'order_filled':
        case 'order_cancelled':
          setRealtimeUpdates({
            lastUpdate: new Date(),
            type: 'order'
          });
          portfolioData.refresh();
          break;

        default:
          // Ignore other event types
          break;
      }
    } catch (err) {
      console.error('Error processing realtime event:', err);
    }
  }, [portfolioData]);

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
    ...portfolioData,
    realtimeUpdates
  };
} 