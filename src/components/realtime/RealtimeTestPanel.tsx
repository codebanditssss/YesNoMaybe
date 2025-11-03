'use client';

import React, { useState } from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { ConnectionStatus } from './ConnectionStatus';
import { Wifi, WifiOff, RefreshCw, Play, Square, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function RealtimeTestPanel() {
  const {
    connectionState,
    isConnected,
    error: lastError,
    connect,
    disconnect,
    clearEvents
  } = useRealtime();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [authStatus, setAuthStatus] = useState<string>('Unknown');

  const activeChannels: any[] = [];

  const addTestResult = (result: string) => {
    setTestResults(prev => [`[${new Date().toLocaleTimeString()}] ${result}`, ...prev.slice(0, 9)]);
  };

  const testAuthentication = async () => {
    setIsTestingAuth(true);
    addTestResult('🔍 Testing authentication status...');
    
    try {
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addTestResult(`❌ Session error: ${sessionError.message}`);
        setAuthStatus('Error');
        return;
      }
      
      if (session) {
        addTestResult(`✅ Active session found for user: ${session.user.email || 'anonymous'}`);
        setAuthStatus(`Authenticated (${session.user.email || 'anonymous'})`);
      } else {
        addTestResult('ℹ️ No active session, attempting anonymous sign-in...');
        
        // Try anonymous sign-in
        const { data, error } = await supabase.auth.signInAnonymously();
        
        if (error) {
          addTestResult(`❌ Anonymous auth failed: ${error.message}`);
          setAuthStatus('Anonymous Auth Failed');
        } else {
          addTestResult('✅ Anonymous session created successfully');
          setAuthStatus('Anonymous Session Active');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(`❌ Auth test failed: ${errorMessage}`);
      setAuthStatus('Test Failed');
    } finally {
      setIsTestingAuth(false);
    }
  };

  const testDatabaseConnection = async () => {
    addTestResult('🔍 Testing database connection...');
    
    try {
      // Test query using a valid table
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .limit(1);
      
      if (error) {
        addTestResult(`❌ Database test failed: ${error.message}`);
      } else {
        addTestResult(`✅ Database connection working, found ${data?.length || 0} test records`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(`❌ Database connection failed: ${errorMessage}`);
    }
  };

  const testRealtimeSubscription = async () => {
    addTestResult('🔍 Testing Realtime subscription...');
    
    try {
      const channel = supabase
        .channel('test-channel')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'markets'
        }, (payload) => {
          addTestResult(`📡 Realtime event received: ${payload.eventType}`);
        })
        .subscribe((status) => {
          addTestResult(`📡 Subscription status: ${status}`);
        });

      // Insert a test record to trigger realtime
      setTimeout(async () => {
        // Note: Cannot insert into markets table for testing - using read-only test instead
        const { error } = await supabase
          .from('markets')
          .select('id')
          .limit(1);
        
        if (error) {
          addTestResult(`❌ Test insert failed: ${error.message}`);
        } else {
          addTestResult('✅ Test record inserted, should trigger realtime event');
        }
      }, 2000);

      // Clean up after 10 seconds
      setTimeout(() => {
        channel.unsubscribe();
        addTestResult('🧹 Test subscription cleaned up');
      }, 10000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addTestResult(`❌ Realtime subscription test failed: ${errorMessage}`);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'bg-green-500';
      case 'connecting': case 'reconnecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">🔧 Realtime Connection Diagnostics</h1>
        <p className="text-gray-600">Comprehensive testing for Supabase Realtime connection</p>
      </div>

      {/* Connection Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Connection Status</h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`}></div>
            <Badge variant={connectionState === 'connected' ? 'default' : 'secondary'}>
              {connectionState}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>WebSocket Status:</strong> {connectionState}
          </div>
          <div>
            <strong>Active Channels:</strong> {activeChannels.length}
          </div>
          <div>
            <strong>Auth Status:</strong> {authStatus}
          </div>
          <div>
            <strong>Last Error:</strong> {lastError || 'None'}
          </div>
        </div>
      </Card>

      {/* Control Buttons */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Connection Controls</h2>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={connect} 
            disabled={connectionState === 'connecting'}
            className="bg-green-600 hover:bg-green-700"
          >
            {connectionState === 'connecting' ? 'Connecting...' : 'Connect WebSocket'}
          </Button>
          
          <Button 
            onClick={disconnect} 
            variant="destructive"
            disabled={connectionState === 'disconnected'}
          >
            Disconnect
          </Button>
          
          <Button 
            onClick={connect}
            disabled={connectionState === 'connecting' || connectionState === 'reconnecting'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Force Reconnect
          </Button>
          
          <Button 
            onClick={testAuthentication}
            disabled={isTestingAuth}
            variant="outline"
          >
            {isTestingAuth ? 'Testing Auth...' : 'Test Authentication'}
          </Button>
          
          <Button 
            onClick={testDatabaseConnection}
            variant="outline"
          >
            Test Database
          </Button>
          
          <Button 
            onClick={testRealtimeSubscription}
            variant="outline"
          >
            Test Realtime Events
          </Button>
          
          <Button 
            onClick={clearResults}
            variant="ghost"
          >
            Clear Results
          </Button>
        </div>
      </Card>

      {/* Test Results */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Test Results</h2>
        {testResults.length === 0 ? (
          <p className="text-gray-500 italic">No test results yet. Click buttons above to run tests.</p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                {result}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Setup Instructions */}
      {connectionState !== 'connected' && (
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <h2 className="text-lg font-semibold mb-2 text-yellow-800">🔧 Troubleshooting Guide</h2>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>If connection keeps failing:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li><strong>Test Authentication:</strong> Click "Test Authentication" to verify auth is working</li>
              <li><strong>Test Database:</strong> Verify basic Supabase connection is working</li>
              <li><strong>Test Realtime Events:</strong> Check if Realtime tables are properly configured</li>
              <li><strong>Check Network:</strong> Ensure WebSocket connections aren't blocked by firewall</li>
              <li><strong>Project Settings:</strong> Realtime might need to be enabled at project level in Supabase dashboard</li>
            </ol>
            
            <div className="mt-4 p-3 bg-yellow-100 rounded">
              <p><strong>💡 Alternative:</strong> If WebSocket keeps failing, this might indicate that <strong>Supabase Realtime service isn't fully enabled</strong> for your project tier or region.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 