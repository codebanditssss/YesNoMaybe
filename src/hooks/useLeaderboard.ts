"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/contexts/AuthContext";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  email: string;
  avatar: string;
  isVerified: boolean;
  totalPnL: number;
  totalTrades: number;
  winningTrades: number;
  winRate: number;
  totalVolume: number;
  balance: number;
  isCurrentUser: boolean;
  streak: number;
  badges: string[];
  lastActive: string;
}

export interface LeaderboardStats {
  totalUsers: number;
  activeTrades: number;
  totalVolume: number;
  avgWinRate: number;
  topPerformer: LeaderboardEntry | null;
  currentUserRank: number | null;
}

export interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  stats: LeaderboardStats;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    timeRange: string;
    sortBy: string;
    search: string;
  };
}

interface UseLeaderboardOptions {
  limit?: number;
  offset?: number;
  timeRange?: 'all' | '1d' | '7d' | '30d';
  sortBy?: 'total_profit_loss' | 'total_trades' | 'winning_trades' | 'total_volume';
  search?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const {
    limit = 50,
    offset = 0,
    timeRange = 'all',
    sortBy = 'total_profit_loss',
    search = '',
    autoRefresh = true,
    refreshInterval = 60000 // 1 minute
  } = options;

  const { session, user } = useAuth();
  const [data, setData] = useState<LeaderboardData | null>(null);
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

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
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
      if (timeRange !== 'all') params.append('timeRange', timeRange);
      if (sortBy) params.append('sortBy', sortBy);
      if (search) params.append('search', search);

      const response = await fetch(`/api/leaderboard?${params.toString()}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch leaderboard: ${response.status}`);
      }

      const result: LeaderboardData = await response.json();
      setData(result);

    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, [user, session, limit, offset, timeRange, sortBy, search, getAuthHeaders]);

  // Refresh leaderboard data
  const refresh = useCallback(() => {
    setLoading(true);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Load more entries (for pagination)
  const loadMore = useCallback(async () => {
    if (!data || loading || !data.pagination.hasMore || !user || !session) return;

    try {
      const nextOffset = data.pagination.offset + data.pagination.limit;
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      
      params.append('limit', limit.toString());
      params.append('offset', nextOffset.toString());
      if (timeRange !== 'all') params.append('timeRange', timeRange);
      if (sortBy) params.append('sortBy', sortBy);
      if (search) params.append('search', search);

      const response = await fetch(`/api/leaderboard?${params.toString()}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        throw new Error('Failed to load more leaderboard entries');
      }

      const newData: LeaderboardData = await response.json();
      
      // Append new entries
      setData(prevData => ({
        ...newData,
        leaderboard: [...(prevData?.leaderboard || []), ...newData.leaderboard],
        pagination: newData.pagination
      }));

    } catch (err) {
      console.error('Error loading more leaderboard entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more entries');
    }
  }, [data, loading, user, session, limit, timeRange, sortBy, search, getAuthHeaders]);

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
      fetchLeaderboard();
    } else {
      setData(null);
      setLoading(false);
      setError(null);
    }
  }, [user, session, fetchLeaderboard]);

  // Helper functions
  const getUserRank = useCallback((userId: string) => {
    if (!data?.leaderboard) return null;
    const entry = data.leaderboard.find(entry => entry.id === userId);
    return entry ? entry.rank : null;
  }, [data]);

  const getTopPerformers = useCallback((count: number = 3) => {
    if (!data?.leaderboard) return [];
    return data.leaderboard.slice(0, count);
  }, [data]);

  const getCurrentUserEntry = useCallback(() => {
    if (!data?.leaderboard || !user) return null;
    return data.leaderboard.find(entry => entry.isCurrentUser) || null;
  }, [data, user]);

  const getEntryById = useCallback((userId: string) => {
    if (!data?.leaderboard) return null;
    return data.leaderboard.find(entry => entry.id === userId) || null;
  }, [data]);

  return {
    // Core data
    leaderboard: data?.leaderboard || [],
    stats: data?.stats || {
      totalUsers: 0,
      activeTrades: 0,
      totalVolume: 0,
      avgWinRate: 0,
      topPerformer: null,
      currentUserRank: null
    },
    pagination: data?.pagination || {
      total: 0,
      limit,
      offset,
      hasMore: false
    },
    filters: data?.filters || {
      timeRange,
      sortBy,
      search
    },
    
    // State
    loading,
    error,
    
    // Actions
    refresh,
    loadMore,
    
    // Helper functions
    getUserRank,
    getTopPerformers,
    getCurrentUserEntry,
    getEntryById,
    
    // Computed values
    hasData: (data?.leaderboard?.length || 0) > 0,
    totalEntries: data?.leaderboard?.length || 0,
    canLoadMore: data?.pagination?.hasMore || false,
    currentUserRank: data?.stats?.currentUserRank || null,
    isLoading: loading,
    hasError: !!error
  };
} 