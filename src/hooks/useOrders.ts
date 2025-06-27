import { useState, useEffect, useCallback } from 'react';

// Types for orders
export interface Order {
  id: string;
  marketId: string;
  marketTitle: string;
  marketCategory: string;
  side: 'YES' | 'NO';
  quantity: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled' | 'partial';
  filledQuantity: number;
  remainingQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  hasMore: boolean;
}

export interface PlaceOrderRequest {
  marketId: string;
  side: 'YES' | 'NO';
  quantity: number;
  price: number;
}

export interface PlaceOrderResponse {
  order: Order;
  message: string;
}

interface UseOrdersOptions {
  status?: 'pending' | 'filled' | 'cancelled';
  marketId?: string;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const {
    status,
    marketId,
    limit = 50,
    autoRefresh = false,
    refreshInterval = 30000
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Fetch orders function
  const fetchOrders = useCallback(async (offset = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (marketId) params.append('market_id', marketId);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await fetch(`/api/orders?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch orders');
      }

      const data: OrdersResponse = await response.json();
      
      if (append) {
        setOrders(prev => [...prev, ...data.orders]);
      } else {
        setOrders(data.orders);
      }
      
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [status, marketId, limit]);

  // Load more orders for pagination
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchOrders(orders.length, true);
    }
  }, [fetchOrders, loading, hasMore, orders.length]);

  // Place a new order
  const placeOrder = useCallback(async (orderData: PlaceOrderRequest): Promise<Order> => {
    setPlacing(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }

      const data: PlaceOrderResponse = await response.json();
      
      // Add the new order to the beginning of the list
      setOrders(prev => [data.order, ...prev]);
      
      return data.order;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setPlacing(false);
    }
  }, []);

  // Cancel an order
  const cancelOrder = useCallback(async (orderId: string): Promise<void> => {
    setCancelling(orderId);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cancel' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel order');
      }

      // Update the order status in local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled' as const }
            : order
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setCancelling(null);
    }
  }, []);

  // Refresh orders
  const refresh = useCallback(() => {
    fetchOrders(0, false);
  }, [fetchOrders]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refresh]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Computed values
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const filledOrders = orders.filter(order => order.status === 'filled');
  const totalVolume = orders.reduce((sum, order) => sum + order.filledQuantity, 0);
  const totalValue = orders.reduce((sum, order) => sum + (order.filledQuantity * order.price / 100), 0);

  return {
    // Data
    orders,
    pendingOrders,
    filledOrders,
    
    // State
    loading,
    error,
    hasMore,
    placing,
    cancelling,
    
    // Actions
    placeOrder,
    cancelOrder,
    refresh,
    loadMore,
    
    // Computed
    totalVolume,
    totalValue,
    isEmpty: orders.length === 0 && !loading,
  };
}

// Hook for a specific market's orders
export function useMarketOrders(marketId: string) {
  return useOrders({ 
    marketId, 
    autoRefresh: true,
    refreshInterval: 10000 // More frequent updates for market-specific orders
  });
}

// Hook for pending orders only
export function usePendingOrders() {
  return useOrders({ 
    status: 'pending',
    autoRefresh: true,
    refreshInterval: 5000 // Very frequent updates for pending orders
  });
} 