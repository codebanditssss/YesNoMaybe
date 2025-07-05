'use client';

import React from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

export function ConnectionStatus() {
  const {
    connectionState,
    isConnected,
    error,
    connect
  } = useRealtime();

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
    if (connectionState === 'connecting') {
      return {
        icon: <RefreshCw className="h-3 w-3 mr-1 animate-spin" />,
        text: 'Connecting...',
        color: 'text-blue-600',
        bg: 'bg-blue-50 border-blue-200'
      };
    }
    
    if (connectionState === 'error') {
      return {
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        text: 'Connection Error',
        color: 'text-red-600',
        bg: 'bg-red-50 border-red-200'
      };
    }
    
    // Disconnected
    return {
      icon: <WifiOff className="h-3 w-3 mr-1" />,
      text: 'Disconnected',
      color: 'text-gray-600',
      bg: 'bg-gray-50 border-gray-200'
    };
  };

  const status = getStatusContent();

  return (
    <div className={`flex items-center justify-between px-2 py-1 rounded border text-xs ${status.color} ${status.bg}`}>
      <div className="flex items-center">
        {status.icon}
        <span>{status.text}</span>
      </div>
      
      {/* Show retry button if error */}
      {connectionState === 'error' && (
        <button
          onClick={connect}
          className="ml-2 px-2 py-0.5 bg-white border rounded text-xs hover:bg-gray-50 transition-colors"
          title="Retry connection"
        >
          Retry
        </button>
      )}
      
      {/* Show error details on hover */}
      {connectionState === 'error' && error && (
        <div className="hidden group-hover:block absolute bottom-full left-0 mb-1 p-2 bg-black text-white text-xs rounded shadow-lg max-w-xs z-50">
          Error: {error}
        </div>
      )}
    </div>
  );
}

// Compact version for headers/footers
export function ConnectionStatusCompact() {
  const { isConnected, connectionState } = useRealtime();

  if (isConnected) {
    return <div className="w-2 h-2 bg-green-500 rounded-full" title="Real-time connected" />;
  }
  
  if (connectionState === 'connecting') {
    return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Connecting..." />;
  }
  
  if (connectionState === 'error') {
    return <div className="w-2 h-2 bg-red-500 rounded-full" title="Connection error - Click to view details" />;
  }
  
  // Disconnected
  return <div className="w-2 h-2 bg-gray-400 rounded-full" title="Disconnected - Auto-connecting..." />;
} 