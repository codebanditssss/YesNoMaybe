"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/contexts/AuthContext";

export interface TradeHistoryEntry {
  id: string;
  userId: string;
  marketId: string;
  marketTitle: string;
  marketCategory: string;
  marketStatus: string;
  resolutionDate?: string | null;
  side: 'YES' | 'NO';
  orderType: string;
  quantity: number;
  price: number;
  filledQuantity: number;
  status: string;
  total: number;
  fees: number;
  timestamp: string | Date;
  updatedAt: string;
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
  limit?: number;
  offset?: number;
  status?: 'all' | 'filled' | 'open' | 'cancelled';
  type?: 'all' | 'buy' | 'sell';
  side?: 'all' | 'YES' | 'NO';
  dateRange?: 'all' | '1d' | '7d' | '30d' | '90d';
  sortBy?: 'created_at' | 'updated_at' | 'price' | 'quantity' | 'filled_quantity';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function useTradeHistory(options: UseTradeHistoryOptions = {}) {
  const {
    limit = 50,
    offset = 0,
    status = 'all',
    type = 'all',
    side = 'all',
    dateRange = 'all',
    sortBy = 'created_at',
    sortOrder = 'desc',
    search = '',
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options;

  const { session, user } = useAuth();
  const [data, setData] = useState<TradeHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get auth headers
  const getAuthHeaders = useCallback(async () => {
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  }, [session]);

  const fetchTradeHistory = useCallback(async () => {
    if (!user || !session) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setError(null);

      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
      if (status !== 'all') params.append('status', status);
      if (type !== 'all') params.append('type', type);
      if (side !== 'all') params.append('side', side);
      if (dateRange !== 'all') params.append('dateRange', dateRange);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      if (search) params.append('search', search);

      const response = await fetch(`/api/trade-history?${params.toString()}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch trade history: ${response.status}`);
      }

      const result: TradeHistoryData = await response.json();
      
      // Transform trades to match component expectations
      const transformedTrades = result.trades.map(trade => ({
        ...trade,
        // Add missing fields for component compatibility
        category: trade.marketCategory || 'general',
        marketTitle: trade.marketTitle || 'Unknown Market',
        timestamp: new Date(trade.timestamp),
        updatedAt: trade.updatedAt,
        resolutionDate: trade.resolutionDate || null,
        // Computed fields for component
        netAmount: trade.total || 0,
        pnl: 0, // TODO: Calculate actual P&L
        pnlPercent: 0,
        executionTime: 0,
        isPartiallyFilled: (trade.filledQuantity || 0) > 0 && (trade.filledQuantity || 0) < trade.quantity,
        originalQuantity: trade.quantity
      }));

      setData({
        ...result,
        trades: transformedTrades
      });

    } catch (err) {
      console.error('Error fetching trade history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trade history');
    } finally {
      setLoading(false);
    }
  }, [user, session, limit, offset, status, type, side, dateRange, sortBy, sortOrder, search, getAuthHeaders]);

  // Refresh trade history data
  const refresh = useCallback(() => {
    setLoading(true);
    fetchTradeHistory();
  }, [fetchTradeHistory]);

  // Load more trades (for pagination)
  const loadMore = useCallback(async () => {
    if (!data || loading || !data.pagination.hasMore || !user || !session) return;

    try {
      const nextOffset = data.pagination.offset + data.pagination.limit;
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      
      params.append('limit', limit.toString());
      params.append('offset', nextOffset.toString());
      if (status !== 'all') params.append('status', status);
      if (type !== 'all') params.append('type', type);
      if (side !== 'all') params.append('side', side);
      if (dateRange !== 'all') params.append('dateRange', dateRange);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      if (search) params.append('search', search);

      const response = await fetch(`/api/trade-history?${params.toString()}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        throw new Error('Failed to load more trades');
      }

      const newData: TradeHistoryData = await response.json();
      
      // Transform and append new trades
      const transformedNewTrades = newData.trades.map(trade => ({
        ...trade,
        // Add missing fields for component compatibility
        category: trade.marketCategory || 'general',
        marketTitle: trade.marketTitle || 'Unknown Market',
        timestamp: new Date(trade.timestamp),
        updatedAt: trade.updatedAt,
        resolutionDate: trade.resolutionDate || null,
        // Computed fields for component
        netAmount: trade.total || 0,
        pnl: 0, // TODO: Calculate actual P&L
        pnlPercent: 0,
        executionTime: 0,
        isPartiallyFilled: (trade.filledQuantity || 0) > 0 && (trade.filledQuantity || 0) < trade.quantity,
        originalQuantity: trade.quantity
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
  }, [data, loading, user, session, limit, status, type, side, dateRange, sortBy, sortOrder, search, getAuthHeaders]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refresh]);

  // Initial fetch
  useEffect(() => {
    if (user && session) {
      fetchTradeHistory();
    } else {
      setData(null);
      setLoading(false);
      setError(null);
    }
  }, [user, session, fetchTradeHistory]);

  // Helper functions
  const getTradeById = useCallback((tradeId: string) => {
    return data?.trades.find(trade => trade.id === tradeId) || null;
  }, [data]);

  const getTradesByMarket = useCallback((marketId: string) => {
    return data?.trades.filter(trade => trade.marketId === marketId) || [];
  }, [data]);

  const getTradesByStatus = useCallback((status: string) => {
    return data?.trades.filter(trade => trade.status === status) || [];
  }, [data]);

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
    canLoadMore: data?.pagination?.hasMore || false,
    isLoading: loading,
    hasError: !!error
  };
} 