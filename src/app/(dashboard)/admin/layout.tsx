"use client"

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/');
      return;
    }

    const userRole = user?.user_metadata?.role;
    if (userRole !== 'admin') {
      setIsAuthorized(false);
      return;
    }

    setIsAuthorized(true);
  }, [user, loading, router]);

  // Show loading state
  if (loading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized state
  if (isAuthorized === false) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin dashboard. 
            Contact your system administrator if you believe this is an error.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show admin dashboard
  return (
    <div className="h-full">
      {/* Admin Header Banner */}
      <div className="bg-red-600 text-white px-6 py-3 border-b">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span className="font-semibold">Admin Dashboard</span>
          <span className="text-red-200">•</span>
          <span className="text-red-200 text-sm">
            Logged in as {user?.email}
          </span>
        </div>
      </div>

      {/* Admin Content */}
      <div className="h-full">
        {children}
      </div>
    </div>
  );
} 