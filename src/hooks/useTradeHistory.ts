import { useState, useEffect, useCallback } from 'react';

export interface TradeHistoryEntry {
  id: string;
  marketId: string;
  marketTitle: string;
  category: string;
  type: 'buy' | 'sell';
  side: 'yes' | 'no';
  quantity: number;
  price: number;
  total: number;
  fees: number;
  netAmount: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'cancelled' | 'failed';
  orderType: 'market' | 'limit';
  pnl?: number;
  pnlPercent?: number;
  executionTime: number;
  liquidityProvider?: boolean;
  isPartiallyFilled?: boolean;
  originalQuantity?: number;
  filledQuantity?: number;
  marketStatus?: string;
  resolutionDate?: Date | null;
}

export interface TradeHistoryStats {
  totalTrades: number;
  completedTrades: number;
  pendingTrades: number;
  cancelledTrades: number;
  totalVolume: number;
  totalFees: number;
  totalPnL: number;
  winRate: number;
  avgTradeSize: number;
  bestTrade: number;
  worstTrade: number;
  avgExecutionTime: number;
}

export interface TradeHistoryPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface TradeHistoryData {
  trades: TradeHistoryEntry[];
  stats: TradeHistoryStats;
  pagination: TradeHistoryPagination;
}

interface UseTradeHistoryOptions {
  userId?: string;
  limit?: number;
  offset?: number;
  status?: 'all' | 'filled' | 'pending' | 'cancelled';
  type?: 'all' | 'buy' | 'sell';
  side?: 'all' | 'yes' | 'no';
  dateRange?: 'all' | '1d' | '7d' | '30d' | '90d';
  sortBy?: 'created_at' | 'total' | 'pnl' | 'price';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useTradeHistory(options: UseTradeHistoryOptions = {}) {
  const {
    userId,
    limit = 50,
    offset = 0,
    status = 'all',
    type = 'all',
    side = 'all',
    dateRange = 'all',
    sortBy = 'created_at',
    sortOrder = 'desc',
    search = '',
    autoRefresh = true,
    refreshInterval = 60000 // 1 minute
  } = options;

  const [data, setData] = useState<TradeHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trade history data
  const fetchTradeHistory = useCallback(async () => {
    try {
      setError(null);
      
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      if (status) params.append('status', status);
      if (type) params.append('type', type);
      if (side) params.append('side', side);
      if (dateRange) params.append('dateRange', dateRange);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      if (search) params.append('search', search);

      const response = await fetch(`/api/trade-history?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch trade history');
      }

      const tradeHistoryData: TradeHistoryData = await response.json();
      
      // Transform timestamp strings to Date objects
      const transformedData = {
        ...tradeHistoryData,
        trades: tradeHistoryData.trades.map(trade => ({
          ...trade,
          timestamp: new Date(trade.timestamp),
          resolutionDate: trade.resolutionDate ? new Date(trade.resolutionDate) : null
        }))
      };
      
      setData(transformedData);
    } catch (err) {
      console.error('Error fetching trade history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trade history');
    } finally {
      setLoading(false);
    }
  }, [userId, limit, offset, status, type, side, dateRange, sortBy, sortOrder, search]);

  // Refresh trade history data
  const refresh = useCallback(() => {
    setLoading(true);
    fetchTradeHistory();
  }, [fetchTradeHistory]);

  // Load more trades (for pagination)
  const loadMore = useCallback(async () => {
    if (!data || loading || !data.pagination.hasMore) return;

    try {
      const nextOffset = data.pagination.offset + data.pagination.limit;
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      params.append('limit', limit.toString());
      params.append('offset', nextOffset.toString());
      if (status) params.append('status', status);
      if (type) params.append('type', type);
      if (side) params.append('side', side);
      if (dateRange) params.append('dateRange', dateRange);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      if (search) params.append('search', search);

      const response = await fetch(`/api/trade-history?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to load more trades');
      }

      const newData: TradeHistoryData = await response.json();
      
      // Transform and append new trades
      const transformedNewTrades = newData.trades.map(trade => ({
        ...trade,
        timestamp: new Date(trade.timestamp),
        resolutionDate: trade.resolutionDate ? new Date(trade.resolutionDate) : null
      }));

      setData(prevData => ({
        ...newData,
        trades: [...(prevData?.trades || []), ...transformedNewTrades],
        pagination: newData.pagination
      }));
    } catch (err) {
      console.error('Error loading more trades:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more trades');
    }
  }, [data, loading, userId, limit, status, type, side, dateRange, sortBy, sortOrder, search]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchTradeHistory, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchTradeHistory]);

  // Initial fetch and refetch when options change
  useEffect(() => {
    fetchTradeHistory();
  }, [fetchTradeHistory]);

  // Helper functions
  const getTradeById = useCallback((tradeId: string): TradeHistoryEntry | null => {
    if (!data?.trades) return null;
    return data.trades.find(trade => trade.id === tradeId) || null;
  }, [data?.trades]);

  const getTradesByMarket = useCallback((marketId: string): TradeHistoryEntry[] => {
    if (!data?.trades) return [];
    return data.trades.filter(trade => trade.marketId === marketId);
  }, [data?.trades]);

  const getTradesByStatus = useCallback((tradeStatus: string): TradeHistoryEntry[] => {
    if (!data?.trades) return [];
    return data.trades.filter(trade => trade.status === tradeStatus);
  }, [data?.trades]);

  return {
    // Core data
    trades: data?.trades || [],
    stats: data?.stats || {
      totalTrades: 0,
      completedTrades: 0,
      pendingTrades: 0,
      cancelledTrades: 0,
      totalVolume: 0,
      totalFees: 0,
      totalPnL: 0,
      winRate: 0,
      avgTradeSize: 0,
      bestTrade: 0,
      worstTrade: 0,
      avgExecutionTime: 0
    },
    pagination: data?.pagination || {
      total: 0,
      limit,
      offset,
      hasMore: false
    },
    
    // State
    loading,
    error,
    
    // Actions
    refresh,
    loadMore,
    
    // Helper functions
    getTradeById,
    getTradesByMarket,
    getTradesByStatus,
    
    // Computed values
    hasData: (data?.trades?.length || 0) > 0,
    totalTrades: data?.trades?.length || 0,
    canLoadMore: data?.pagination?.hasMore || false
  };
} 