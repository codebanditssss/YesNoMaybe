"use client"

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu,
} from 'lucide-react';
import ProfileDropdown from '@/components/dashboard/ProfileDropdown';
import { ConnectionStatusCompact } from '@/components/realtime/ConnectionStatus';
import { RealtimeProvider } from '@/contexts/RealtimeContext';
import { AnimatedSidebar } from '@/components/dashboard/AnimatedSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RealtimeProvider autoConnect={true} maxEvents={50}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex h-screen overflow-hidden">
          {/* Animated Sidebar */}
          <AnimatedSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main Content */}
          <div className="flex flex-1 flex-col w-0 lg:w-auto">
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 lg:px-6 border-b border-gray-200 bg-white">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-500" />
              </button>
              <div className="flex-1 flex items-center justify-end space-x-4">
                <ProfileDropdown user={user} />
              </div>
            </div>

            {/* Page Content */}
            <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </RealtimeProvider>
  );
} 