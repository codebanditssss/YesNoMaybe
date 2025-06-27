import { useState, useEffect } from 'react';

interface UserBalance {
  user_id: string;
  available_balance: number;
  total_trades: number;
  winning_trades: number;
  profit_loss: number;
  username: string;
  full_name: string;
}

interface Position {
  market_id: string;
  market_title: string;
  market_category: string;
  market_status: string;
  yes_quantity: number;
  no_quantity: number;
  yes_avg_price: number;
  no_avg_price: number;
  total_invested: number;
  current_value: number;
  pnl: number;
}

interface Trade {
  id: string;
  market_id: string;
  yes_user_id: string;
  no_user_id: string;
  quantity: number;
  price: number;
  yes_payout: number;
  no_payout: number;
  winner_side: string | null;
  created_at: string;
  markets?: {
    title: string;
    category: string;
    status: string;
  };
}

interface Order {
  id: string;
  market_id: string;
  user_id: string;
  side: 'YES' | 'NO';
  price: number;
  quantity: number;
  filled_quantity: number;
  status: 'open' | 'filled' | 'cancelled';
  created_at: string;
  markets?: {
    title: string;
    category: string;
    status: string;
    resolution_date: string;
  };
}

interface PortfolioSummary {
  total_balance: number;
  total_invested: number;
  total_pnl: number;
  total_trades: number;
  winning_trades: number;
  win_rate: string;
}

interface PortfolioData {
  user_balance: UserBalance;
  active_orders: Order[];
  recent_trades: Trade[];
  positions: Position[];
  portfolio_summary: PortfolioSummary;
}

interface UsePortfolioParams {
  user_id?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UsePortfolioReturn {
  portfolio: PortfolioData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePortfolio({
  user_id,
  autoRefresh = false,
  refreshInterval = 60000 // 1 minute default for portfolio
}: UsePortfolioParams = {}): UsePortfolioReturn {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    if (!user_id) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      const response = await fetch(`/api/portfolio?user_id=${user_id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio: ${response.statusText}`);
      }

      const data = await response.json();
      setPortfolio(data);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPortfolio();
  }, [user_id]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !user_id || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchPortfolio();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, user_id]);

  return {
    portfolio,
    loading,
    error,
    refetch: fetchPortfolio
  };
} 