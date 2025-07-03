'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Connection states
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // in milliseconds
  maxDelay: number;
  retryCount: number;
}

// Context interface
interface RealtimeContextType {
  // Connection state
  connectionState: ConnectionState;
  isConnected: boolean;
  lastError: string | null;
  retryCount: number;
  
  // Connection management
  connect: () => void;
  disconnect: () => void;
  forceReconnect: () => void;
  
  // Subscription management
  subscribeToChannel: (channelName: string, config: any) => RealtimeChannel | null;
  unsubscribeFromChannel: (channelName: string) => void;
  getActiveChannels: () => string[];
  channelCount: number;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

// Retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  baseDelay: 1000,    // Start with 1 second
  maxDelay: 30000,    // Max 30 seconds
  retryCount: 0
};

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  // Connection state
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastError, setLastError] = useState<string | null>(null);
  const [retryConfig, setRetryConfig] = useState<RetryConfig>(DEFAULT_RETRY_CONFIG);
  
  // Active channels tracking
  const activeChannels = useRef<Map<string, RealtimeChannel>>(new Map());
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Interval | null>(null);
  
  // Computed values
  const isConnected = connectionState === 'connected';
  
  // Calculate exponential backoff delay
  const getRetryDelay = useCallback((retryCount: number): number => {
    const delay = retryConfig.baseDelay * Math.pow(2, retryCount);
    return Math.min(delay, retryConfig.maxDelay);
  }, [retryConfig]);
  
  // Clear retry timeout
  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);
  
  // Clear heartbeat interval
  const clearHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);
  
  // Start heartbeat monitoring
  const startHeartbeat = useCallback(() => {
    clearHeartbeat();
    
    heartbeatIntervalRef.current = setInterval(() => {
      // Check if realtime is still connected
      const currentStatus = supabase.realtime.isConnected();
      
      if (!currentStatus && isConnected) {
        console.warn('🔄 Heartbeat detected disconnection, attempting reconnect...');
        setConnectionState('reconnecting');
        connect();
      }
    }, 15000); // Check every 15 seconds
  }, [isConnected]);
  
  // Connect to Supabase Realtime
  const connect = useCallback(async () => {
    try {
      setConnectionState('connecting');
      setLastError(null);
      
      console.log('🔌 Attempting Supabase Realtime connection...');
      
      // Check if we have an existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('🔐 No session found, creating anonymous session for Realtime...');
        
        // Try to sign in anonymously for Realtime access
        try {
          const { data, error } = await supabase.auth.signInAnonymously();
          
          if (error) {
            console.warn('⚠️ Anonymous sign-in failed, trying without auth:', error.message);
          } else {
            console.log('✅ Anonymous session created for Realtime');
            // Wait a moment for the session to be established
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (authError) {
          console.warn('⚠️ Auth error, continuing with anon key:', authError);
        }
      }
      
      // Connect to Supabase Realtime
      supabase.realtime.connect();
      
      // Set up connection success handler
      const handleConnection = () => {
        setConnectionState('connected');
        setRetryConfig(prev => ({ ...prev, retryCount: 0 }));
        setLastError(null);
        console.log('✅ Supabase Realtime Connected Successfully');
        startHeartbeat();
      };
      
      // Set up error handler
      const handleError = (error: any) => {
        console.error('❌ Supabase Realtime Error:', error);
        setLastError(error?.message || 'Connection error');
        setConnectionState('error');
        
        // Attempt retry with exponential backoff
        if (retryConfig.retryCount < retryConfig.maxRetries) {
          const delay = getRetryDelay(retryConfig.retryCount);
          console.log(`🔄 Retrying connection in ${delay}ms (attempt ${retryConfig.retryCount + 1}/${retryConfig.maxRetries})`);
          
          setConnectionState('reconnecting');
          setRetryConfig(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
          
          retryTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('❌ Max retry attempts reached. Realtime may not be enabled for this project.');
          setConnectionState('error');
          setLastError('Realtime service unavailable - may need to be enabled in Supabase dashboard');
        }
      };
      
      // Set up disconnect handler
      const handleDisconnect = () => {
        console.log('❌ Supabase Realtime Disconnected');
        setConnectionState('disconnected');
        clearHeartbeat();
        
        // Auto-reconnect if it wasn't a manual disconnect
        if (connectionState !== 'disconnected') {
          setTimeout(() => {
            connect();
          }, 2000);
        }
      };
      
      // Monitor connection state with more aggressive checking
      let connectionChecks = 0;
      const maxChecks = 5;
      
      const checkConnection = () => {
        connectionChecks++;
        
        if (supabase.realtime.isConnected()) {
          handleConnection();
        } else if (connectionChecks < maxChecks) {
          // Keep checking every 2 seconds up to 5 times (10 seconds total)
          setTimeout(checkConnection, 2000);
        } else {
          handleError(new Error('Realtime service may not be enabled for client connections on this project'));
        }
      };
      
      // Start checking after 1 second
      setTimeout(checkConnection, 1000);
      
    } catch (error) {
      console.error('❌ Failed to initiate Supabase Realtime connection:', error);
      setConnectionState('error');
      setLastError(error instanceof Error ? error.message : 'Connection failed');
    }
  }, [retryConfig.retryCount, retryConfig.maxRetries, getRetryDelay, startHeartbeat, connectionState]);
  
  // Disconnect from Supabase Realtime
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting from Supabase Realtime...');
    
    // Clear all timeouts and intervals
    clearRetryTimeout();
    clearHeartbeat();
    
    // Unsubscribe from all channels
    activeChannels.current.forEach((channel, channelName) => {
      console.log(`📤 Unsubscribing from channel: ${channelName}`);
      supabase.removeChannel(channel);
    });
    activeChannels.current.clear();
    
    // Disconnect from Supabase Realtime
    supabase.realtime.disconnect();
    
    setConnectionState('disconnected');
    setLastError(null);
    setRetryConfig(DEFAULT_RETRY_CONFIG);
  }, [clearRetryTimeout, clearHeartbeat]);
  
  // Force reconnection (manual retry)
  const forceReconnect = useCallback(() => {
    console.log('🔄 Force reconnecting...');
    disconnect();
    setTimeout(() => {
      setRetryConfig(DEFAULT_RETRY_CONFIG); // Reset retry count
      connect();
    }, 1000);
  }, [disconnect, connect]);
  
  // Subscribe to a channel
  const subscribeToChannel = useCallback((channelName: string, config: any): RealtimeChannel | null => {
    if (!isConnected) {
      console.warn(`❌ Cannot subscribe to ${channelName}: Not connected to realtime`);
      return null;
    }
    
    // Check if already subscribed
    if (activeChannels.current.has(channelName)) {
      console.log(`📡 Already subscribed to channel: ${channelName}`);
      return activeChannels.current.get(channelName)!;
    }
    
    try {
      const channel = supabase.channel(channelName, config);
      
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Successfully subscribed to channel: ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to channel: ${channelName}`);
          activeChannels.current.delete(channelName);
        } else if (status === 'TIMED_OUT') {
          console.warn(`⏰ Subscription timeout for channel: ${channelName}`);
          activeChannels.current.delete(channelName);
        }
      });
      
      activeChannels.current.set(channelName, channel);
      console.log(`📡 Subscribing to channel: ${channelName}`);
      
      return channel;
    } catch (error) {
      console.error(`❌ Failed to subscribe to channel ${channelName}:`, error);
      return null;
    }
  }, [isConnected]);
  
  // Unsubscribe from a channel
  const unsubscribeFromChannel = useCallback((channelName: string) => {
    const channel = activeChannels.current.get(channelName);
    if (channel) {
      console.log(`📤 Unsubscribing from channel: ${channelName}`);
      supabase.removeChannel(channel);
      activeChannels.current.delete(channelName);
    }
  }, []);
  
  // Get list of active channels
  const getActiveChannels = useCallback((): string[] => {
    return Array.from(activeChannels.current.keys());
  }, []);
  
  // Auto-connect on mount (disabled temporarily for testing)
  useEffect(() => {
    // Temporarily disabled auto-connect until Supabase Realtime is enabled
    console.log('🔧 Auto-connect disabled - use manual connection for testing');
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []); // Only run on mount/unmount
  
  // Context value
  const contextValue: RealtimeContextType = {
    // Connection state
    connectionState,
    isConnected,
    lastError,
    retryCount: retryConfig.retryCount,
    
    // Connection management
    connect,
    disconnect,
    forceReconnect,
    
    // Subscription management
    subscribeToChannel,
    unsubscribeFromChannel,
    getActiveChannels,
    channelCount: activeChannels.current.size
  };
  
  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
}

// Hook to use the realtime context
export function useRealtime(): RealtimeContextType {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

// Hook for connection status
export function useRealtimeConnection() {
  const { connectionState, isConnected, lastError, retryCount, forceReconnect } = useRealtime();
  
  return {
    connectionState,
    isConnected,
    lastError,
    retryCount,
    forceReconnect,
    
    // Helper functions
    isConnecting: connectionState === 'connecting',
    isReconnecting: connectionState === 'reconnecting',
    hasError: connectionState === 'error',
    canRetry: retryCount < DEFAULT_RETRY_CONFIG.maxRetries
  };
} 