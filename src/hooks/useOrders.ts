"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/contexts/AuthContext";

// Types for orders
export interface Order {
  id: string;
  marketId: string;
  marketTitle?: string;
  marketCategory?: string;
  side: 'YES' | 'NO';
  quantity: number;
  price: number;
  filledQuantity: number;
  remainingQuantity: number;
  status: 'open' | 'filled' | 'cancelled';
  orderType: 'market' | 'limit';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface PlaceOrderRequest {
  marketId: string;
  side: 'YES' | 'NO';
  quantity: number;
  price: number;
  orderType?: 'market' | 'limit';
}

export interface PlaceOrderResponse {
  success: boolean;
  order: Order;
  message: string;
}

interface UseOrdersOptions {
  status?: 'all' | 'open' | 'filled' | 'cancelled';
  marketId?: string;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function useOrders(options: UseOrdersOptions = {}) {
  const {
    status = 'all',
    marketId,
    limit = 50,
    autoRefresh = false,
    refreshInterval = 10000 // 10 seconds
  } = options;

  const { session, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit,
    offset: 0,
    hasMore: false
  });

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

  const fetchOrders = useCallback(async (offset = 0, append = false) => {
    if (!user || !session) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      if (!append) setLoading(true);
      setError(null);

      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      
      if (status !== 'all') params.append('status', status);
      if (marketId) params.append('market_id', marketId);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await fetch(`/api/orders?${params.toString()}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch orders: ${response.status}`);
      }

      const data: OrdersResponse = await response.json();
      
      if (append) {
        setOrders(prev => [...prev, ...data.orders]);
      } else {
        setOrders(data.orders);
      }
      
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [user, session, status, marketId, limit, getAuthHeaders]);

  // Place a new order
  const placeOrder = useCallback(async (orderData: PlaceOrderRequest): Promise<PlaceOrderResponse> => {
    if (!user || !session) {
      throw new Error('User not authenticated');
    }

    setPlacing(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to place order: ${response.status}`);
      }

      const result: PlaceOrderResponse = await response.json();
      
      // Add the new order to the local state if it matches current filters
      if (!status || status === 'all' || result.order.status === status) {
        if (!marketId || result.order.marketId === marketId) {
          setOrders(prev => [result.order, ...prev]);
        }
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setPlacing(false);
    }
  }, [user, session, status, marketId, getAuthHeaders]);

  // Cancel an order
  const cancelOrder = useCallback(async (orderId: string): Promise<void> => {
    if (!user || !session) {
      throw new Error('User not authenticated');
    }

    setCancelling(orderId);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ action: 'cancel' })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        const errorData = await response.json().catch(() => ({}));
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
  }, [user, session, getAuthHeaders]);

  // Load more orders (for pagination)
  const loadMore = useCallback(() => {
    if (pagination.hasMore && !loading) {
      fetchOrders(pagination.offset + pagination.limit, true);
    }
  }, [fetchOrders, pagination, loading]);

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
    if (user && session) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
      setError(null);
      setPagination({ total: 0, limit, offset: 0, hasMore: false });
    }
  }, [user, session, fetchOrders]);

  // Computed values
  const openOrders = orders.filter(order => order.status === 'open');
  const filledOrders = orders.filter(order => order.status === 'filled');
  const cancelledOrders = orders.filter(order => order.status === 'cancelled');
  const totalVolume = orders.reduce((sum, order) => sum + order.filledQuantity, 0);
  const totalValue = orders.reduce((sum, order) => sum + (order.filledQuantity * order.price / 100), 0);

  // Helper functions
  const getOrdersByMarket = (marketId: string) => orders.filter(order => order.marketId === marketId);
  const getOrdersByStatus = (status: Order['status']) => orders.filter(order => order.status === status);
  const getOrderById = (orderId: string) => orders.find(order => order.id === orderId);

  return {
    // Core data
    orders,
    pagination,
    
    // State
    loading,
    error,
    placing,
    cancelling,
    
    // Actions
    placeOrder,
    cancelOrder,
    loadMore,
    refresh,
    
    // Filtered data
    openOrders,
    filledOrders,
    cancelledOrders,
    
    // Helper functions
    getOrdersByMarket,
    getOrdersByStatus,
    getOrderById,
    
    // Computed values
    totalOrders: orders.length,
    totalVolume,
    totalValue,
    canLoadMore: pagination.hasMore,
    hasData: orders.length > 0,
    hasError: !!error,
    isLoading: loading,
    isPlacing: placing
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

// Hook for open orders only
export function useOpenOrders() {
  return useOrders({ 
    status: 'open',
    autoRefresh: true,
    refreshInterval: 5000 // Very frequent updates for open orders
  });
} 