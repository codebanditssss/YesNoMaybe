"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// Types for portfolio
export interface PortfolioBalance {
  available: number;
  total: number;
  invested: number;
  unrealizedPnL: number;
  realizedPnL: number;
}

export interface PortfolioStats {
  totalTrades: number;
  winningTrades: number;
  winRate: number;
  profitLoss: number;
  activePositions: number;
  resolvedPositions: number;
}

export interface Position {
  marketId: string;
  marketTitle: string;
  marketCategory: string;
  marketStatus: 'active' | 'closing_soon' | 'resolved';
  resolutionDate: string;
  actualOutcome?: string;
  yesShares: number;
  noShares: number;
  totalInvested: number;
  unrealizedPnL: number;
  realizedPnL: number;
}

export interface TradeHistory {
  id: string;
  marketId: string;
  marketTitle: string;
  marketCategory: string;
  side: 'YES' | 'NO';
  quantity: number;
  price: number;
  pnl: number;
  volume: number;
  totalValue: number;
  createdAt: string;
}

export interface Portfolio {
  balance: {
    id: string;
    user_id: string;
    available_balance: number;
    locked_balance: number;
    total_deposited: number;
    total_withdrawn: number;
    total_trades: number;
    winning_trades: number;
    total_volume: number;
    total_profit_loss: number;
  };
  positions: Position[];
  summary: {
    totalValue: number;
    totalInvested: number;
    totalUnrealizedPnL: number;
    totalRealizedPnL: number;
    winRate: number;
    volume: number;
  };
  history?: TradeHistory[];
}

interface UsePortfolioOptions {
  includeHistory?: boolean;
  historyLimit?: number;
  timeframe?: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function usePortfolio(options: UsePortfolioOptions = {}) {
  const { 
    includeHistory = false, 
    historyLimit = 10, 
    timeframe = 'ALL',
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options;
  const { user, session } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
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

  // Fetch portfolio data
  const fetchPortfolio = useCallback(async () => {
    if (!user || !session) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      
      if (includeHistory) {
        params.append('include_history', 'true');
        params.append('history_limit', historyLimit.toString());
      }
      params.append('timeframe', timeframe);

      const response = await fetch(`/api/portfolio?${params.toString()}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to fetch portfolio: ${response.status}`;
        const errorDetails = errorData.details ? `\n${errorData.details}` : '';
        const errorHint = errorData.hint ? `\n${errorData.hint}` : '';
        throw new Error(`${errorMessage}${errorDetails}${errorHint}`);
      }

      const data: Portfolio = await response.json();
      setPortfolio(data);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  }, [user, session, includeHistory, historyLimit, timeframe, getAuthHeaders]);

  // Refresh portfolio data
  const refresh = useCallback(() => {
    setLoading(true);
    fetchPortfolio();
  }, [fetchPortfolio]);

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
      fetchPortfolio();
    } else {
      setPortfolio(null);
      setLoading(false);
      setError(null);
    }
  }, [user, session, fetchPortfolio]);

  // Helper functions
  const getTotalValue = () => {
    if (loading || !portfolio) return 0;
    return portfolio.summary.totalValue || 0;
  };

  const getTotalPnL = () => {
    if (loading || !portfolio) return 0;
    return (portfolio.summary.totalUnrealizedPnL || 0) + (portfolio.summary.totalRealizedPnL || 0);
  };

  const getPnLPercentage = () => {
    if (loading || !portfolio || !portfolio.summary.totalInvested || portfolio.summary.totalInvested === 0) return 0;
    const totalPnL = getTotalPnL();
    return (totalPnL / portfolio.summary.totalInvested) * 100;
  };

  const getActivePositions = () => {
    if (loading || !portfolio?.positions) return [];
    return portfolio.positions.filter(p => p.marketStatus === 'active');
  };

  const getResolvedPositions = () => {
    if (!portfolio?.positions) return [];
    return portfolio.positions.filter(pos => pos.marketStatus === 'resolved');
  };

  const getPositionByMarket = (marketId: string) => {
    if (!portfolio?.positions) return null;
    return portfolio.positions.find(pos => pos.marketId === marketId) || null;
  };

  const getWinRate = () => {
    if (!portfolio) return 0;
    return portfolio.summary.winRate || 0;
  };

  const getChartData = () => {
    if (!portfolio?.history) return [];
    return portfolio.history.map(trade => ({
      date: new Date(trade.createdAt).toISOString(),
      totalValue: trade.totalValue || 0,
      pnl: trade.pnl || 0,
      volume: trade.volume || 0
    }));
  };

  return {
    portfolio: loading ? null : portfolio,
    positions: loading ? [] : portfolio?.positions || [],
    loading,
    error,
    refresh,
    getTotalValue,
    getTotalPnL,
    getPnLPercentage,
    getActivePositions,
    getResolvedPositions,
    getPositionByMarket,
    getWinRate,
    getChartData,
    hasData: !!portfolio,
    totalPositions: portfolio?.positions?.length || 0,
    activePositionsCount: getActivePositions().length,
    resolvedPositionsCount: getResolvedPositions().length,
    isLoading: loading,
    hasError: !!error
  };
}

// Hook for portfolio summary only (lighter weight)
export function usePortfolioSummary() {
  return usePortfolio({ 
    includeHistory: false,
    autoRefresh: true,
    refreshInterval: 15000 // More frequent updates for summary
  });
}

// Hook for tracking specific position
export function usePosition(marketId: string) {
  const { positions, loading, error, refresh } = usePortfolio();
  
  const position = positions.find(pos => pos.marketId === marketId);
  
  return {
    position,
    hasPosition: !!position,
    loading,
    error,
    refresh
  };
} 