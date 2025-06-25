import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home,
  BarChart3,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Target,
  Activity,
  Clock,
  Bell,
  Search
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function DashboardLayout({ children, currentPage = 'dashboard', onNavigate }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', page: 'dashboard', icon: Home, current: currentPage === 'dashboard' },
    { name: 'Markets', page: 'markets', icon: BarChart3, current: currentPage === 'markets' },
    { name: 'Portfolio', page: 'portfolio', icon: Target, current: currentPage === 'portfolio' },
    { name: 'Order Book', page: 'orderbook', icon: Activity, current: currentPage === 'orderbook' },
    { name: 'Stock Manager', page: 'stocks', icon: TrendingUp, current: currentPage === 'stocks' },
    { name: 'Trade History', page: 'history', icon: Clock, current: currentPage === 'history' },
    { name: 'Leaderboard', page: 'leaderboard', icon: Users, current: currentPage === 'leaderboard' },
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
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 lg:static lg:inset-auto lg:translate-x-0 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">YesNoMaybe</h1>
              <p className="text-xs text-gray-500">Trading Platform</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="mb-4">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Main Menu
            </p>
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => onNavigate?.(item.page)}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 w-full text-left ${
                  item.current
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-100 p-4 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="h-5 w-5 text-gray-500" />
              </button>
              
              {/* Search bar */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search markets, positions..."
                    className="pl-10 pr-4 py-2.5 w-80 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2.5 rounded-xl hover:bg-gray-100 relative transition-colors">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              {/* Portfolio value */}
              <div className="hidden md:block text-right bg-gray-50 px-4 py-2 rounded-xl">
                <p className="text-xs text-gray-500 font-medium">Portfolio Value</p>
                <p className="text-lg font-bold text-gray-900">$1,247.50</p>
              </div>
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