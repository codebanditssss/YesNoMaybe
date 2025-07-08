'use client';

import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ConnectionStatusCompact } from '../realtime/ConnectionStatus';

export default function ProfileDropdown({
  user,
}: {
  user: User | null; 
}) {
  if (!user) return null;

  return (
    <div className="relative">
      <button
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
    </div>
  );
}