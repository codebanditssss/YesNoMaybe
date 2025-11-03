import { useState, useEffect, useCallback, useRef } from 'react';
import { useOrderbook, OrderbookData } from './useOrderbook';

interface UseRealtimeOrderbookOptions {
  marketId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface OrderbookState extends OrderbookData {
  lastUpdate: Date;
  isStale: boolean;
  yesBids: Array<{ price: number; quantity: number; orders: Array<{ id: string; quantity: number; username: string }> }>;
  noAsks: Array<{ price: number; quantity: number; orders: Array<{ id: string; quantity: number; username: string }> }>;
  marketInfo: OrderbookData['marketInfo'];
  bestPrices: { bestYesBid: number | null; bestNoAsk: number | null; midPrice: number } | null;
  marketStats: {
    totalLiquidity: number;
    yesLiquidity: number;
    noLiquidity: number;
    liquidityRatio: number;
    recentTradeCount: number;
    lastTradePrice: number;
    priceVolatility: number;
  } | null;
  spread: number | null;
  spreadPercentage: number;
}

export function useRealtimeOrderbook(options: UseRealtimeOrderbookOptions = {}) {
  const {
    marketId,
    autoRefresh = true,
    refreshInterval = 5000
  } = options;

  // Keep track of current market ID for comparison
  const currentMarketRef = useRef<string | undefined>(marketId);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentData, setCurrentData] = useState<OrderbookState | null>(null);
  const [stableData, setStableData] = useState<OrderbookState | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const orderbookRef = useRef<OrderbookData | null>(null);

  // Use base orderbook hook for initial data and polling
  const orderbookData = useOrderbook(marketId, {
    autoRefresh: autoRefresh && !isTransitioning,
    refreshInterval
  });

  // Update orderbook ref when data changes
  useEffect(() => {
    if (!orderbookData.loading && orderbookData.orderbook) {
      orderbookRef.current = orderbookData.orderbook;
    }
  }, [orderbookData.loading, orderbookData.orderbook]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  // Handle market ID changes
  useEffect(() => {
    if (marketId !== currentMarketRef.current) {
      setIsTransitioning(true);
      
      // Store the last stable data before transition
      setStableData(prevStableData => {
        if (currentData && !currentData.isStale) {
          return currentData;
        }
        return prevStableData;
      });
      
      // Update ref immediately to prevent multiple transitions
      currentMarketRef.current = marketId;
      
      // Clear any pending timeouts
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    }
  }, [marketId]);

  // Update current data when orderbook changes
  useEffect(() => {
    if (!orderbookData.orderbook) return;

    const updateData = () => {
      const newData: OrderbookState = {
        ...orderbookData.orderbook!,
        yesBids: orderbookData.yesBids,
        noAsks: orderbookData.noAsks,
        marketInfo: orderbookData.marketInfo!,
        bestPrices: orderbookData.bestPrices,
        marketStats: orderbookData.marketStats,
        spread: orderbookData.spread ?? null,
        spreadPercentage: orderbookData.spreadPercentage ?? 0,
        lastUpdate: new Date(),
        isStale: false
      };

      setCurrentData(newData);

      // If we're transitioning and got fresh data for the new market
      if (isTransitioning && marketId === currentMarketRef.current) {
        setIsTransitioning(false);
        setStableData(null);
      }
    };

    // Clear any pending update timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Schedule the update with a small delay to batch potential updates
    updateTimeoutRef.current = setTimeout(updateData, 50);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [marketId, isTransitioning, orderbookData.orderbook, orderbookData.yesBids, orderbookData.noAsks, orderbookData.marketInfo, orderbookData.bestPrices, orderbookData.marketStats, orderbookData.spread, orderbookData.spreadPercentage]);

  // Handle real-time updates with debouncing
  const handleRealtimeEvent = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      // Only process events if we're not transitioning
      if (!isTransitioning) {
        switch (data.type) {
          case 'order_created':
          case 'order_cancelled':
          case 'order_filled':
          case 'trade_executed':
            // Clear any pending update
            if (updateTimeoutRef.current) {
              clearTimeout(updateTimeoutRef.current);
            }

            // Mark current data as stale and trigger refresh
            setCurrentData(prev => prev ? { ...prev, isStale: true } : null);
            orderbookData.refresh();
            break;
          default:
            break;
        }
      }
    } catch (err) {
      console.error('Error processing realtime event:', err);
    }
  }, [isTransitioning, orderbookData]);

  // Set up SSE connection
  useEffect(() => {
    if (!marketId) return;

    const eventSource = new EventSource('/api/realtime');
    eventSource.onmessage = handleRealtimeEvent;
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [marketId, handleRealtimeEvent]);

  // Return stable data during transition, current data otherwise
  const displayData = isTransitioning ? stableData : currentData;

  return {
    ...orderbookData,
    // Override with stable values during transition
    orderbook: displayData?.orderbook || orderbookData.orderbook,
    marketInfo: displayData?.marketInfo || orderbookData.marketInfo,
    yesBids: displayData?.yesBids || orderbookData.yesBids,
    noAsks: displayData?.noAsks || orderbookData.noAsks,
    recentTrades: displayData?.recentTrades || orderbookData.recentTrades,
    bestPrices: displayData?.bestPrices || orderbookData.bestPrices,
    marketStats: displayData?.marketStats || orderbookData.marketStats,
    spread: displayData?.spread || orderbookData.spread,
    spreadPercentage: displayData?.spreadPercentage || orderbookData.spreadPercentage,
    // Add transition info
    realtimeUpdates: {
      lastUpdate: displayData?.lastUpdate || new Date(),
      type: displayData?.isStale ? 'order' : null
    },
    isTransitioning
  };
} 