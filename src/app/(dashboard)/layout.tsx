"use client"

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Target,
  Activity,
  Clock,
  ChevronLeft,
  ChevronRight,
  Shield,
  Database,
  Monitor,
  Flag,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClientRedirectManager } from '@/lib/redirect-manager';
import ProfileDropdown from '@/components/dashboard/ProfileDropdown';
import { ConnectionStatusCompact } from '@/components/realtime/ConnectionStatus';
import { RealtimeProvider } from '@/contexts/RealtimeContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  // Check if user has admin role
  const isAdmin = user?.user_metadata?.role === 'admin';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Markets', href: '/Markets', icon: BarChart3 },
    { name: 'Portfolio', href: '/Portfolio', icon: Target },
    { name: 'Market Depth', href: '/MarketDepth', icon: Activity },
    { name: 'Trade History', href: '/TradeHistory', icon: Clock },
    { name: 'Leaderboard', href: '/Leaderboard', icon: Users },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: Shield },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Market Management', href: '/admin/markets', icon: BarChart3 },
    { name: 'System Monitor', href: '/admin/system', icon: Monitor },
    { name: 'Analytics', href: '/admin/analytics', icon: Database },
    { name: 'Moderation', href: '/admin/moderation', icon: Flag },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      ClientRedirectManager.redirect(
        router, 
        '/', 
        'User signed out successfully'
      );
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <RealtimeProvider autoConnect={true} maxEvents={50}>
      <div className="h-screen flex bg-gray-50">
      {/* Sidebar for desktop */}
      <div
        className={`
          hidden
          lg:static lg:block
          bg-white border-r border-gray-200 shadow-none
          ${sidebarCollapsed ? 'w-16' : 'w-72'}
          relative
        `}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between h-20 border-b border-gray-200 ${sidebarCollapsed ? 'px-2' : 'px-6'}`}>
          <div className={`flex items-center transition-all duration-300 ${sidebarCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            {!sidebarCollapsed && (
              <div className="transition-opacity duration-300">
                <h1 className="text-xl font-bold text-gray-900">
                  YesNoMaybe
                </h1>
                <p className="text-xs text-gray-500 font-medium">Trading Platform</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-6 space-y-1 overflow-y-auto ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
          {/* Show only admin navigation for admin users */}
          {isAdmin ? (
            <>
              {!sidebarCollapsed && (
                <div className="mb-6">
                  <p className="px-3 text-xs font-bold text-red-600 uppercase tracking-wider">
                    Admin Panel
                  </p>
                </div>
              )}
              {adminNavigation.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className={`group flex items-center rounded-lg transition-all duration-200 w-full text-left relative ${
                        sidebarCollapsed ? 'px-2 py-3 justify-center mx-1' : 'px-4 py-3.5'
                      } text-red-700 hover:bg-red-50 hover:text-red-900`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 ${
                        sidebarCollapsed ? 'mx-auto' : 'mr-4'
                      } text-red-500 group-hover:text-red-700`} />
                      {!sidebarCollapsed && (
                        <span className="text-sm font-semibold">{item.name}</span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {!sidebarCollapsed && (
                <div className="mb-6">
                  <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Main Menu
                  </p>
                </div>
              )}
              {navigation.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className={`group flex items-center rounded-lg transition-all duration-200 w-full text-left relative ${
                        sidebarCollapsed ? 'px-2 py-3 justify-center mx-1' : 'px-4 py-3.5'
                      } text-gray-700 hover:bg-gray-100 hover:text-gray-900`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 ${
                        sidebarCollapsed ? 'mx-auto' : 'mr-4'
                      } text-gray-500 group-hover:text-gray-700`} />
                      {!sidebarCollapsed && (
                        <span className="text-sm font-semibold">{item.name}</span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </>
          )}

          {/* Settings */}
          {!sidebarCollapsed && (
            <div className="my-6 px-3">
              <div className="border-t border-gray-200"></div>
            </div>
          )}
          <Link
            href="/Settings"
            className={`group flex items-center rounded-lg transition-all duration-200 w-full text-left relative ${
              sidebarCollapsed ? 'px-2 py-3 justify-center mx-1' : 'px-4 py-3.5'
            } text-gray-700 hover:bg-gray-100 hover:text-gray-900`}
            title={sidebarCollapsed ? 'Settings' : undefined}
          >
            <Settings className={`h-5 w-5 flex-shrink-0 ${
              sidebarCollapsed ? 'mx-auto' : 'mr-4'
            } text-gray-500 group-hover:text-gray-700`} />
            {!sidebarCollapsed && (
              <span className="text-sm font-semibold">Settings</span>
            )}
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className={`border-t border-gray-200 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
          {/* Toggle button for collapsed state */}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex w-full items-center justify-center rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 px-2 py-3 mb-2 mx-1"
              title="Expand Sidebar"
            >
              <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
            </button>
          )}
          
          <button
            onClick={handleSignOut}
            className={`group flex items-center rounded-lg transition-all duration-200 w-full text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
              sidebarCollapsed ? 'px-2 py-3 justify-center mx-1' : 'px-4 py-3.5'
            }`}
            title={sidebarCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className={`h-5 w-5 flex-shrink-0 text-gray-500 group-hover:text-gray-700 ${
              sidebarCollapsed ? 'mx-auto' : 'mr-4'
            }`} />
            {!sidebarCollapsed && <span className="text-sm font-semibold">Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Sidebar for mobile */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div
            className="
              fixed inset-y-0 left-0 z-50
              bg-white border-r border-gray-200 shadow-lg
              transition-all duration-300 ease-in-out
              w-72
              lg:hidden
            "
          >
            {/* Mobile Sidebar Header */}
            <div className="flex items-center justify-between h-20 border-b border-gray-200 px-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">Y</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">YesNoMaybe</h1>
                  <p className="text-xs text-gray-500 font-medium">Trading Platform</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
              {/* Show only admin navigation for admin users */}
              {isAdmin ? (
                <>
                  <div className="mb-6">
                    <p className="px-3 text-xs font-bold text-red-600 uppercase tracking-wider">
                      Admin Panel
                    </p>
                  </div>
                  {adminNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.name}>
                        <Link
                          href={item.href}
                          className="group flex items-center px-4 py-3.5 rounded-lg transition-all duration-200 w-full text-left text-red-700 hover:bg-red-50 hover:text-red-900"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0 mr-4 text-red-500 group-hover:text-red-700" />
                          <span className="text-sm font-semibold">{item.name}</span>
                        </Link>
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Main Menu
                    </p>
                  </div>
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.name}>
                        <Link
                          href={item.href}
                          className="group flex items-center px-4 py-3.5 rounded-lg transition-all duration-200 w-full text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0 mr-4 text-gray-500 group-hover:text-gray-700" />
                          <span className="text-sm font-semibold">{item.name}</span>
                        </Link>
                      </div>
                    );
                  })}
                </>
              )}

              <div className="my-6 px-3">
                <div className="border-t border-gray-200"></div>
              </div>
              <Link
                href="/Settings"
                className="group flex items-center px-4 py-3.5 rounded-lg transition-all duration-200 w-full text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="h-5 w-5 flex-shrink-0 mr-4 text-gray-500 group-hover:text-gray-700" />
                <span className="text-sm font-semibold">Settings</span>
              </Link>
            </nav>

            {/* Mobile Sidebar Footer */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleSignOut}
                className="group flex items-center px-4 py-3.5 rounded-lg transition-all duration-200 w-full text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5 flex-shrink-0 mr-4 text-gray-500 group-hover:text-gray-700" />
                <span className="text-sm font-semibold">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}

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