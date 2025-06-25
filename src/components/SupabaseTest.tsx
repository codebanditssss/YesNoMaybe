"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function SupabaseTest() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testEmail] = useState('test@example.com');
  const [testPassword] = useState('testpassword123');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check initial session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const testConnection = async () => {
    setMessage('Testing Supabase connection...');
    try {
      // Test with auth.getUser() instead of querying tables
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setMessage(`Connection test: ${error.message}`);
      } else {
        setMessage('✅ Supabase connection successful!');
      }
    } catch (err) {
      setMessage(`❌ Connection failed: ${err}`);
    }
  };

  const createTables = async () => {
    setMessage('Creating database tables...');
    setMessage('⚠️ Tables need to be created in Supabase Dashboard. Go to: https://supabase.com/dashboard/project/cyrnkrvlxvoufvazmgqf/editor');
  };

  const testMarketQuery = async () => {
    setMessage('Testing market data query...');
    try {
      const { data, error } = await supabase.from('markets').select('*').limit(5);
      if (error) {
        setMessage(`Query error: ${error.message}`);
      } else {
        setMessage(`✅ Found ${data.length} markets in database`);
      }
    } catch (err) {
      setMessage(`❌ Query failed: ${err}`);
    }
  };

  const testSignUp = async () => {
    setMessage('Testing sign up...');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        setMessage(`Sign up error: ${error.message}`);
      } else {
        setMessage('✅ Sign up successful! Check email for confirmation.');
      }
    } catch (err) {
      setMessage(`❌ Sign up failed: ${err}`);
    }
  };

  const testSignIn = async () => {
    setMessage('Testing sign in...');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        setMessage(`Sign in error: ${error.message}`);
      } else {
        setMessage('✅ Sign in successful!');
      }
    } catch (err) {
      setMessage(`❌ Sign in failed: ${err}`);
    }
  };

  const testSignOut = async () => {
    setMessage('Signing out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setMessage(`Sign out error: ${error.message}`);
      } else {
        setMessage('✅ Signed out successfully!');
      }
    } catch (err) {
      setMessage(`❌ Sign out failed: ${err}`);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto m-4">
      <h2 className="text-2xl font-bold mb-4">Supabase Test Panel</h2>
      
      {/* Current User Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Current User:</h3>
        {user ? (
          <div>
            <p>✅ Logged in as: {user.email}</p>
            <p>User ID: {user.id}</p>
            <p>Email confirmed: {user.email_confirmed_at ? '✅' : '❌'}</p>
          </div>
        ) : (
          <p>❌ No user logged in</p>
        )}
      </div>

      {/* Test Credentials */}
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Test Credentials:</h3>
        <p>Email: {testEmail}</p>
        <p>Password: {testPassword}</p>
      </div>

      {/* Test Buttons */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={testConnection} variant="outline">
            Test Connection
          </Button>
          <Button onClick={createTables} className="bg-purple-600 hover:bg-purple-700">
            Create Tables
          </Button>
          <Button onClick={testMarketQuery} className="bg-orange-600 hover:bg-orange-700">
            Test Markets Query
          </Button>
          <Button onClick={testSignUp} className="bg-green-600 hover:bg-green-700">
            Test Sign Up
          </Button>
          <Button onClick={testSignIn} className="bg-blue-600 hover:bg-blue-700">
            Test Sign In
          </Button>
          <Button onClick={testSignOut} variant="destructive">
            Test Sign Out
          </Button>
        </div>

        {/* Environment Check */}
        <div className="p-4 bg-yellow-50 rounded">
          <h3 className="font-semibold mb-2">Environment Check:</h3>
          <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
          <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
          
          {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
            <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
              <p><strong>Missing Environment Variables!</strong></p>
              <p>Create a <code>.env.local</code> file with:</p>
              <pre className="mt-1 text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
              </pre>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className="p-4 bg-gray-100 rounded">
            <p className="font-mono text-sm">{message}</p>
          </div>
        )}
      </div>
    </Card>
  );
} 