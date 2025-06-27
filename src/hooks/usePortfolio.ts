import { useState, useEffect, useCallback } from 'react';

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
  marketStatus: 'active' | 'resolved' | 'cancelled';
  resolutionDate: string;
  actualOutcome?: 'YES' | 'NO';
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
  createdAt: string;
}

export interface Portfolio {
  balance: PortfolioBalance;
  stats: PortfolioStats;
  positions: Position[];
  tradeHistory?: TradeHistory[];
}

interface UsePortfolioOptions {
  includeHistory?: boolean;
  historyLimit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function usePortfolio(options: UsePortfolioOptions = {}) {
  const {
    includeHistory = false,
    historyLimit = 20,
    autoRefresh = true,
    refreshInterval = 30000
  } = options;

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch portfolio data
  const fetchPortfolio = useCallback(async () => {
    try {
      setError(null);
      
      const params = new URLSearchParams();
      if (includeHistory) params.append('include_history', 'true');
      if (historyLimit) params.append('history_limit', historyLimit.toString());

      const response = await fetch(`/api/portfolio?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch portfolio');
      }

      const data: Portfolio = await response.json();
      setPortfolio(data);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  }, [includeHistory, historyLimit]);

  // Refresh portfolio data
  const refresh = useCallback(() => {
    setLoading(true);
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchPortfolio, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchPortfolio]);

  // Initial fetch
  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Computed values
  const activePositions = portfolio?.positions.filter(pos => pos.marketStatus === 'active') || [];
  const resolvedPositions = portfolio?.positions.filter(pos => pos.marketStatus === 'resolved') || [];
  const profitablePositions = portfolio?.positions.filter(pos => 
    pos.unrealizedPnL > 0 || pos.realizedPnL > 0
  ) || [];
  
  const totalPnL = (portfolio?.balance.unrealizedPnL || 0) + (portfolio?.balance.realizedPnL || 0);
  const pnlPercentage = portfolio?.balance.invested 
    ? (totalPnL / portfolio.balance.invested) * 100 
    : 0;

  // Position analysis
  const largestPosition = portfolio?.positions.reduce((largest, current) => {
    const currentValue = current.totalInvested;
    const largestValue = largest ? largest.totalInvested : 0;
    return currentValue > largestValue ? current : largest;
  }, null as Position | null);

  const bestPerformingPosition = portfolio?.positions.reduce((best, current) => {
    const currentPnL = current.unrealizedPnL + current.realizedPnL;
    const bestPnL = best ? (best.unrealizedPnL + best.realizedPnL) : -Infinity;
    return currentPnL > bestPnL ? current : best;
  }, null as Position | null);

  const worstPerformingPosition = portfolio?.positions.reduce((worst, current) => {
    const currentPnL = current.unrealizedPnL + current.realizedPnL;
    const worstPnL = worst ? (worst.unrealizedPnL + worst.realizedPnL) : Infinity;
    return currentPnL < worstPnL ? current : worst;
  }, null as Position | null);

  return {
    // Core data
    portfolio,
    balance: portfolio?.balance,
    stats: portfolio?.stats,
    positions: portfolio?.positions || [],
    tradeHistory: portfolio?.tradeHistory || [],
    
    // Filtered positions
    activePositions,
    resolvedPositions,
    profitablePositions,
    
    // State
    loading,
    error,
    
    // Actions
    refresh,
    
    // Computed metrics
    totalPnL,
    pnlPercentage: Math.round(pnlPercentage * 100) / 100,
    hasPositions: (portfolio?.positions.length || 0) > 0,
    hasActivePositions: activePositions.length > 0,
    
    // Position analysis
    largestPosition,
    bestPerformingPosition,
    worstPerformingPosition,
    
    // Utility functions
    getPositionPnL: (position: Position) => position.unrealizedPnL + position.realizedPnL,
    getPositionValue: (position: Position) => position.totalInvested + position.unrealizedPnL + position.realizedPnL,
    getPositionShares: (position: Position) => position.yesShares + position.noShares,
  };
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

// Hook for portfolio summary only (lighter weight)
export function usePortfolioSummary() {
  return usePortfolio({ 
    includeHistory: false,
    autoRefresh: true,
    refreshInterval: 15000 // More frequent updates for summary
  });
} 