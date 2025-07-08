'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ConnectionStatusCompact } from '../realtime/ConnectionStatus';

interface UserBalance {
  available_balance: number;
  total_deposited: number;
  total_profit_loss: number;
}

export default function ProfileDropdown({
  user,
}: {
  user: User | null; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_balances')
        .select('available_balance, total_deposited, total_profit_loss')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setBalance(data);
      }
      setLoading(false);
    };

    fetchBalance();
  }, [user]);

  if (!user) return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 focus:outline-none"
        type="button"
      >
        <div className="relative">
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'K'}
            </span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center" >
            <ConnectionStatusCompact/> 
          </div>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-bold text-gray-900">
            {user?.email?.split('@')[0] || 'example@example.com'}
          </p>
          <p className="text-xs text-gray-600">
            {user?.email || 'example@example.com'}
          </p>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-lg z-50 bg-white border border-gray-100">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Available Balance</span>
                    <span className="text-sm font-semibold">
                      {loading ? '...' : `₹${balance?.available_balance?.toLocaleString() || 0}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Deposited</span>
                    <span className="text-sm font-semibold">
                      ₹{loading ? '...' : balance?.total_deposited?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total P&L</span>
                    <span className={`text-sm font-semibold ${(balance?.total_profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {loading ? '...' : `${(balance?.total_profit_loss || 0) >= 0 ? '+' : ''}₹${balance?.total_profit_loss?.toLocaleString() || 0}`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
        </>
      )}
    </div>
  );
}