import { useState, useEffect, useCallback } from 'react';

export interface LeaderboardEntry {
  id: string;
  username: string;
  displayName: string;
  rank: number;
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  totalVolume: number;
  availableBalance: number;
  totalDeposited: number;
}

export interface LeaderboardStats {
  totalUsers: number;
  avgWinRate: number;
  topPerformer: {
    username: string;
    displayName: string;
    totalPnL: number;
  } | null;
  totalVolume: number;
  totalTrades: number;
}

export interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  stats: LeaderboardStats;
}

interface UseLeaderboardOptions {
  limit?: number;
  search?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const {
    limit = 50,
    search = '',
    autoRefresh = true,
    refreshInterval = 60000 // 1 minute
  } = options;

  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    try {
      setError(null);
      
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (search) params.append('search', search);

      const response = await fetch(`/api/leaderboard?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch leaderboard');
      }

      const leaderboardData: LeaderboardData = await response.json();
      setData(leaderboardData);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, [limit, search]);

  // Refresh leaderboard data
  const refresh = useCallback(() => {
    setLoading(true);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchLeaderboard, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchLeaderboard]);

  // Initial fetch and refetch when search/limit changes
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Helper functions
  const getUserRank = useCallback((userId: string): number | null => {
    if (!data?.leaderboard) return null;
    const user = data.leaderboard.find(entry => entry.id === userId);
    return user?.rank || null;
  }, [data?.leaderboard]);

  const getTopPerformers = useCallback((count: number = 3): LeaderboardEntry[] => {
    if (!data?.leaderboard) return [];
    return data.leaderboard.slice(0, count);
  }, [data?.leaderboard]);

  return {
    // Core data
    leaderboard: data?.leaderboard || [],
    stats: data?.stats || {
      totalUsers: 0,
      avgWinRate: 0,
      topPerformer: null,
      totalVolume: 0,
      totalTrades: 0
    },
    
    // State
    loading,
    error,
    
    // Actions
    refresh,
    
    // Helper functions
    getUserRank,
    getTopPerformers,
    
    // Computed values
    hasData: (data?.leaderboard?.length || 0) > 0,
    totalEntries: data?.leaderboard?.length || 0
  };
} 