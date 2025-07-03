'use client';

import React from 'react';
import { useRealtimeConnection } from '@/contexts/RealtimeContext';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

export function ConnectionStatus() {
  const {
    connectionState,
    isConnected,
    isConnecting,
    isReconnecting,
    hasError,
    lastError,
    retryCount,
    forceReconnect,
    canRetry
  } = useRealtimeConnection();

  // Show connected state
  if (isConnected) {
    return (
      <div className="flex items-center text-green-600 text-xs">
        <Wifi className="h-3 w-3 mr-1" />
        <span>Live</span>
      </div>
    );
  }

  // Show different states
  const getStatusContent = () => {
    if (isConnecting) {
      return {
        icon: <RefreshCw className="h-3 w-3 mr-1 animate-spin" />,
        text: 'Connecting...',
        color: 'text-blue-600',
        bg: 'bg-blue-50 border-blue-200'
      };
    }
    
    if (isReconnecting) {
      return {
        icon: <RefreshCw className="h-3 w-3 mr-1 animate-spin" />,
        text: `Reconnecting... (${retryCount}/5)`,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50 border-yellow-200'
      };
    }
    
    if (hasError) {
      return {
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        text: 'Connection Error',
        color: 'text-red-600',
        bg: 'bg-red-50 border-red-200'
      };
    }
    
    // Disconnected (setup phase)
    return {
      icon: <WifiOff className="h-3 w-3 mr-1" />,
      text: 'Setup Mode',
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200'
    };
  };

  const status = getStatusContent();

  return (
    <div className={`flex items-center justify-between px-2 py-1 rounded border text-xs ${status.color} ${status.bg}`}>
      <div className="flex items-center">
        {status.icon}
        <span>{status.text}</span>
      </div>
      
      {/* Show retry button if error and can retry */}
      {hasError && canRetry && (
        <button
          onClick={forceReconnect}
          className="ml-2 px-2 py-0.5 bg-white border rounded text-xs hover:bg-gray-50 transition-colors"
          title="Retry connection"
        >
          Retry
        </button>
      )}
      
      {/* Show error details on hover */}
      {hasError && lastError && (
        <div className="hidden group-hover:block absolute bottom-full left-0 mb-1 p-2 bg-black text-white text-xs rounded shadow-lg max-w-xs z-50">
          Error: {lastError}
        </div>
      )}
    </div>
  );
}

// Compact version for headers/footers
export function ConnectionStatusCompact() {
  const { isConnected, isConnecting, isReconnecting, hasError, connectionState } = useRealtimeConnection();

  if (isConnected) {
    return <div className="w-2 h-2 bg-green-500 rounded-full" title="Real-time connected" />;
  }
  
  if (isConnecting || isReconnecting) {
    return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Connecting..." />;
  }
  
  if (hasError) {
    return <div className="w-2 h-2 bg-red-500 rounded-full" title="Connection error - Check debug panel" />;
  }
  
  // Setup mode (disconnected but not trying)
  return <div className="w-2 h-2 bg-blue-500 rounded-full" title="Setup mode - Use debug panel to test" />;
} 