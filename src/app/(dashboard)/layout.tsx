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
      <div className="h-screen flex bg-gray-50">
        {/* Animated Sidebar */}
        <AnimatedSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-white">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-500" />
            </button>
            <div className="flex-1 flex items-center justify-end space-x-4">
              <ConnectionStatusCompact />
              <ProfileDropdown user={user} />
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </RealtimeProvider>
  );
} 