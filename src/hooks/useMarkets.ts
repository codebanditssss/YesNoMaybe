import { useState, useEffect } from 'react';

interface Market {
  id: string;
  title: string;
  category: string;
  description?: string;
  traders: number;
  volume: string;
  volume24h: number;
  yesPrice: number;
  noPrice: number;
  priceChange: number;
  priceChangePercent: number;
  lastUpdate: string;
  trending: boolean;
  icon: string;
  status: 'active' | 'closing_soon' | 'resolved';
  expiryDate: Date;
  totalLiquidity: number;
  marketCap: number;
  createdAt: Date;
  tags: string[];
  featured: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  probability: number;
}

interface UseMarketsParams {
  status?: string;
  category?: string;
  featured?: boolean;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseMarketsReturn {
  markets: Market[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMarkets({
  status = 'all', // Default to all markets
  category = 'all',
  featured,
  limit = 50,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: UseMarketsParams = {}): UseMarketsReturn {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = async () => {
    try {
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (category !== 'all') params.append('category', category);
      if (featured !== undefined) params.append('featured', featured.toString());
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/markets?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch markets: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convert date strings back to Date objects
      const marketsWithDates = data.map((market: any) => ({
        ...market,
        expiryDate: new Date(market.expiryDate),
        createdAt: new Date(market.createdAt)
      }));

      setMarkets(marketsWithDates);
    } catch (err) {
      console.error('Error fetching markets:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMarkets();
  }, [status, category, featured, limit]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchMarkets();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, status, category, featured, limit]);

  return {
    markets,
    loading,
    error,
    refetch: fetchMarkets
  };
} 