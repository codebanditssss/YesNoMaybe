'use client';

import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export default function ProfileDropdown({
  user,
}: {
  user: User | null; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changing, setChanging] = useState(false);

  if (!user) return null;

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email;

  return (
    <div className="relative">
      {/* Profile Button (styled as in dashboard layout) */}
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
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full"></div>
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
        <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl z-50 overflow-hidden bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-medium bg-gray-900 text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
            </div>
          </div>
          <div className="py-2">
            <div className="px-4 pb-4">
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-full"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  disabled={changing}
                />
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-full"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={changing}
                />
              </div>
              {passwordError && <div className="text-xs text-red-600 mb-2">{passwordError}</div>}
              {passwordSuccess && <div className="text-xs text-green-600 mb-2">{passwordSuccess}</div>}
              <button
                className="w-full bg-black text-white py-2 rounded-full disabled:opacity-50"
                disabled={changing}
                onClick={async () => {
                  setPasswordError('');
                  setPasswordSuccess('');
                  if (!newPassword || !confirmPassword) {
                    setPasswordError('Please fill in both fields.');
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    setPasswordError('Passwords do not match.');
                    return;
                  }
                  if (newPassword.length < 6) {
                    setPasswordError('Password must be at least 6 characters.');
                    return;
                  }
                  setChanging(true);
                  const { error } = await supabase.auth.updateUser({ password: newPassword });
                  if (error) {
                    setPasswordError(error.message);
                  } else {
                    setPasswordSuccess('Password changed successfully!');
                    setNewPassword('');
                    setConfirmPassword('');
                  }
                  setChanging(false);
                }}
              >
                {changing ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}