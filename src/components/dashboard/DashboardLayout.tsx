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
  Bell,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function DashboardLayout({ children, currentPage = 'dashboard', onNavigate }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard', page: 'dashboard', icon: Home, current: currentPage === 'dashboard' },
    { name: 'Markets', page: 'markets', icon: BarChart3, current: currentPage === 'markets' },
    { name: 'Portfolio', page: 'portfolio', icon: Target, current: currentPage === 'portfolio' },
    { name: 'Market Depth', page: 'orderbook', icon: Activity, current: currentPage === 'orderbook' },
    { name: 'Trade History', page: 'history', icon: Clock, current: currentPage === 'history' },
    { name: 'Leaderboard', page: 'leaderboard', icon: Users, current: currentPage === 'leaderboard' },
    { name: 'Settings', page: 'settings', icon: Settings, current: currentPage === 'settings' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
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
          {!sidebarCollapsed && (
            <div className="mb-6">
              <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Main Menu
              </p>
            </div>
          )}
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const isSettings = item.page === 'settings';
            return (
              <div key={item.name}>
                {isSettings && !sidebarCollapsed && (
                  <div className="my-6 px-3">
                    <div className="border-t border-gray-200"></div>
                  </div>
                )}
                <button
                  onClick={() => onNavigate?.(item.page)}
                  className={`group flex items-center rounded-lg transition-all duration-200 w-full text-left relative ${
                    sidebarCollapsed ? 'px-2 py-3 justify-center mx-1' : 'px-4 py-3.5'
                  } ${
                    item.current
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${
                    sidebarCollapsed ? 'mx-auto' : 'mr-4'
                  } ${
                    item.current ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="text-sm font-semibold">{item.name}</span>
                      {item.current && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </>
                  )}
                  {sidebarCollapsed && item.current && (
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </button>
              </div>
            );
          })}
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
            className={`
              fixed inset-y-0 left-0 z-50
              bg-white border-r border-gray-200 shadow-lg
              transition-all duration-300 ease-in-out
              w-72
              lg:hidden
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
              {!sidebarCollapsed && (
                <div className="mb-6">
                  <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Main Menu
                  </p>
                </div>
              )}
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const isSettings = item.page === 'settings';
                return (
                  <div key={item.name}>
                    {isSettings && !sidebarCollapsed && (
                      <div className="my-6 px-3">
                        <div className="border-t border-gray-200"></div>
                      </div>
                    )}
                    <button
                      onClick={() => onNavigate?.(item.page)}
                      className={`group flex items-center rounded-lg transition-all duration-200 w-full text-left relative ${
                        sidebarCollapsed ? 'px-2 py-3 justify-center mx-1' : 'px-4 py-3.5'
                      } ${
                        item.current
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 ${
                        sidebarCollapsed ? 'mx-auto' : 'mr-4'
                      } ${
                        item.current ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                      }`} />
                      {!sidebarCollapsed && (
                        <>
                          <span className="text-sm font-semibold">{item.name}</span>
                          {item.current && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </>
                      )}
                      {sidebarCollapsed && item.current && (
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </button>
                  </div>
                );
              })}
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
        </>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm h-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <div className="flex items-center space-x-3">
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
                <div className="hidden md:block">
                  <p className="text-sm font-bold text-gray-900">
                    {user?.email?.split('@')[0] || 'khushidiwan953'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {user?.email || 'khushidiwan953@gmail.com'}
                  </p>
                </div>
              </div>

              {/* Notifications */}
              <button className="p-3 rounded-lg hover:bg-gray-100 relative transition-all duration-200 group">
                <Bell className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
                <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-gray-900 border border-white"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 