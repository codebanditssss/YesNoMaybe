import { useState, useEffect } from 'react';

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
  };
}

interface UseOrdersParams {
  user_id?: string;
  market_id?: string;
  status?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  placeOrder: (orderData: {
    market_id: string;
    side: 'YES' | 'NO';
    price: number;
    quantity: number;
  }) => Promise<Order>;
}

export function useOrders({
  user_id,
  market_id,
  status,
  autoRefresh = false,
  refreshInterval = 30000
}: UseOrdersParams = {}): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (user_id) params.append('user_id', user_id);
      if (market_id) params.append('market_id', market_id);
      if (status) params.append('status', status);

      const response = await fetch(`/api/orders?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (orderData: {
    market_id: string;
    side: 'YES' | 'NO';
    price: number;
    quantity: number;
  }): Promise<Order> => {
    if (!user_id) {
      throw new Error('User ID is required to place orders');
    }

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...orderData,
        user_id
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to place order');
    }

    // Refresh orders after successful placement
    await fetchOrders();

    return result.order;
  };

  // Initial fetch
  useEffect(() => {
    if (user_id) {
      fetchOrders();
    }
  }, [user_id, market_id, status]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !user_id || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, user_id, market_id, status]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    placeOrder
  };
} 