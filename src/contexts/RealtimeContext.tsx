'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

// Types for real-time events
export interface RealtimeEvent {
  type: 'connection' | 'heartbeat' | 'database_change';
  channel?: string;
  operation?: 'INSERT' | 'UPDATE' | 'DELETE';
  table?: string;
  data?: any;
  timestamp: string;
  message?: string;
}

export interface RealtimeContextType {
  isConnected: boolean;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastEvent: RealtimeEvent | null;
  events: RealtimeEvent[];
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  clearEvents: () => void;
  subscribe: (callback: (event: RealtimeEvent) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

interface RealtimeProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
  maxEvents?: number;
}

export function RealtimeProvider({ 
  children, 
  autoConnect = true, 
  maxEvents = 100 
}: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const subscribersRef = useRef<Set<(event: RealtimeEvent) => void>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Add event to buffer
  const addEvent = useCallback((event: RealtimeEvent) => {
    setEvents(prev => {
      const newEvents = [...prev, event];
      // Keep only the last maxEvents
      return newEvents.slice(-maxEvents);
    });
    setLastEvent(event);
    
    // Notify all subscribers
    subscribersRef.current.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in realtime subscriber:', error);
      }
    });
  }, [maxEvents]);

  // Connect to SSE endpoint
  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      console.log('Already connected to realtime');
      return;
    }

    setConnectionState('connecting');
    setError(null);
    
    console.log('Connecting to realtime SSE...');
    
    try {
      const eventSource = new EventSource('/api/realtime');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('Connected to realtime SSE');
        setIsConnected(true);
        setConnectionState('connected');
        setError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data);
          
          if (data.type === 'connection') {
            console.log('Realtime connection confirmed');
          } else if (data.type === 'heartbeat') {
            console.log('Realtime heartbeat');
          } else if (data.type === 'database_change') {
            console.log(`Database change: ${data.table} (${data.operation})`);
          }
          
          addEvent(data);
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);
        setConnectionState('error');
        setError('Connection lost');
        
        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          console.error('Max reconnection attempts reached');
          setError('Failed to reconnect after multiple attempts');
        }
      };

    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      setConnectionState('error');
      setError('Failed to establish connection');
    }
  }, [addEvent]);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    console.log('Disconnecting from realtime SSE');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionState('disconnected');
    setError(null);
    reconnectAttempts.current = 0;
  }, []);

  // Clear event history
  const clearEvents = useCallback(() => {
    setEvents([]);
    setLastEvent(null);
  }, []);

  // Subscribe to real-time events
  const subscribe = useCallback((callback: (event: RealtimeEvent) => void) => {
    subscribersRef.current.add(callback);
    
    // Return unsubscribe function
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Handle page visibility changes to reconnect when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && connectionState === 'error') {
        console.log('Page became visible, attempting to reconnect...');
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connectionState, connect]);

  const value: RealtimeContextType = {
    isConnected,
    connectionState,
    lastEvent,
    events,
    error,
    connect,
    disconnect,
    clearEvents,
    subscribe
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

// Hook to use realtime context
export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

// Specific hooks for different data types
export function useRealtimeOrders() {
  const { subscribe } = useRealtime();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    return subscribe((event) => {
      if (event.type === 'database_change' && event.table === 'orders') {
        console.log(`Order ${event.operation}:`, event.data);
        
        if (event.operation === 'INSERT') {
          setOrders(prev => [event.data, ...prev]);
        } else if (event.operation === 'UPDATE') {
          setOrders(prev => prev.map(order => 
            order.id === event.data.id ? { ...order, ...event.data } : order
          ));
        } else if (event.operation === 'DELETE') {
          setOrders(prev => prev.filter(order => order.id !== event.data.id));
        }
      }
    });
  }, [subscribe]);

  return orders;
}

export function useRealtimeTrades() {
  const { subscribe } = useRealtime();
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    return subscribe((event) => {
      if (event.type === 'database_change' && event.table === 'trades') {
        console.log(`Trade ${event.operation}:`, event.data);
        
        if (event.operation === 'INSERT') {
          setTrades(prev => [event.data, ...prev]);
        } else if (event.operation === 'UPDATE') {
          setTrades(prev => prev.map(trade => 
            trade.id === event.data.id ? { ...trade, ...event.data } : trade
          ));
        }
      }
    });
  }, [subscribe]);

  return trades;
}

export function useRealtimeMarkets() {
  const { subscribe } = useRealtime();
  const [marketUpdates, setMarketUpdates] = useState<any[]>([]);

  useEffect(() => {
    return subscribe((event) => {
      if (event.type === 'database_change' && event.table === 'markets') {
        console.log(`Market ${event.operation}:`, event.data);
        setMarketUpdates(prev => [event.data, ...prev.slice(0, 9)]); // Keep last 10
      }
    });
  }, [subscribe]);

  return marketUpdates;
}

export function useRealtimeBalances() {
  const { subscribe } = useRealtime();
  const [balanceUpdates, setBalanceUpdates] = useState<any[]>([]);

  useEffect(() => {
    return subscribe((event) => {
      if (event.type === 'database_change' && event.table === 'user_balances') {
        console.log(`Balance ${event.operation}:`, event.data);
        setBalanceUpdates(prev => [event.data, ...prev.slice(0, 4)]); // Keep last 5
      }
    });
  }, [subscribe]);

  return balanceUpdates;
} 