import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortfolio } from '@/hooks/usePortfolio';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Users,
  Volume2,
  Eye,
  AlertCircle,
  RefreshCw,
  Download,
  Filter,
  ArrowUpDown,
  Star,
  Zap,
  Activity,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Settings,
  BookOpen
} from "lucide-react";

interface Position {
  id: string;
  marketId: string;
  marketTitle: string;
  category: string;
  type: 'yes' | 'no';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  investmentValue: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  marketStatus: 'active' | 'closing_soon' | 'resolved';
  expiryDate: Date;
  purchaseDate: Date;
  lastUpdate: Date;
}

interface Trade {
  id: string;
  marketId: string;
  marketTitle: string;
  type: 'buy' | 'sell';
  side: 'yes' | 'no';
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'cancelled';
}

interface PortfolioStats {
  totalValue: number;
  totalInvested: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayChange: number;
  dayChangePercent: number;
  winRate: number;
  totalTrades: number;
  activePositions: number;
  availableBalance: number;
}

export function Portfolio() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'positions' | 'history' | 'analytics'>('overview');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M');
  const [sortBy, setSortBy] = useState<'pnl' | 'value' | 'alphabetical' | 'date'>('pnl');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closing' | 'resolved'>('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Use real portfolio data
  const { 
    portfolio, 
    loading, 
    error, 
    refresh,
    positions,
    totalPnL,
    pnlPercentage 
  } = usePortfolio({ 
    includeHistory: true, // Always include history for recent activity section
    historyLimit: selectedTab === 'history' ? 50 : 5, // Only get 5 for overview, 50 for history tab
    autoRefresh: true 
  });

  // Auto-refresh portfolio data
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      refresh();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [refresh]);

  // Build portfolio stats from real data with safe defaults
  const portfolioStats: PortfolioStats = {
    totalValue: portfolio?.balance?.total || 0,
    totalInvested: portfolio?.balance?.invested || 0,
    totalPnl: totalPnL || 0,
    totalPnlPercent: pnlPercentage || 0,
    dayChange: 0, // TODO: Calculate daily change
    dayChangePercent: 0, // TODO: Calculate daily change %
    winRate: portfolio?.stats?.winRate || 0,
    totalTrades: portfolio?.stats?.totalTrades || 0,
    activePositions: portfolio?.stats?.activePositions || 0,
    availableBalance: portfolio?.balance?.available || 0
  };

  // Transform real portfolio positions to match component interface with safe defaults
  const transformedPositions: Position[] = (positions || []).map(pos => {
    const totalShares = (pos.yesShares || 0) + (pos.noShares || 0);
    const isYesPosition = (pos.yesShares || 0) > (pos.noShares || 0);
    const avgPrice = totalShares > 0 ? ((pos.totalInvested || 0) / totalShares) * 100 : 0;
    const currentValue = (pos.totalInvested || 0) + (pos.unrealizedPnL || 0) + (pos.realizedPnL || 0);
    const pnlPercent = (pos.totalInvested || 0) > 0 ? (((pos.unrealizedPnL || 0) + (pos.realizedPnL || 0)) / pos.totalInvested) * 100 : 0;

    return {
      id: pos.marketId,
      marketId: pos.marketId,
      marketTitle: pos.marketTitle || 'Unknown Market',
      category: pos.marketCategory || 'other',
      type: isYesPosition ? 'yes' : 'no',
      quantity: totalShares,
      avgPrice: avgPrice,
      currentPrice: avgPrice, // TODO: Calculate current market price
      investmentValue: pos.totalInvested || 0,
      currentValue: currentValue,
      pnl: (pos.unrealizedPnL || 0) + (pos.realizedPnL || 0),
      pnlPercent: pnlPercent,
      marketStatus: (pos.marketStatus as 'active' | 'closing_soon' | 'resolved') || 'active',
      expiryDate: new Date(pos.resolutionDate || Date.now()),
      purchaseDate: new Date(), // TODO: Get actual purchase date
      lastUpdate: new Date()
    };
  });

  // Transform real trade history to match component interface with safe defaults
  const transformedTrades: Trade[] = (portfolio?.tradeHistory || []).map(trade => ({
    id: trade.id,
    marketId: trade.marketId,
    marketTitle: trade.marketTitle || 'Unknown Market',
    type: 'buy' as const, // All trades from orders are buys
    side: (trade.side || 'YES').toLowerCase() as 'yes' | 'no',
    quantity: trade.quantity || 0,
    price: trade.price || 0,
    total: ((trade.price || 0) * (trade.quantity || 0)) / 100,
    timestamp: new Date(trade.createdAt || Date.now()),
    status: 'completed' as const
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return (num || 0).toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closing_soon': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crypto': return 'bg-orange-100 text-orange-800';
      case 'sports': return 'bg-blue-100 text-blue-800';
      case 'technology': return 'bg-purple-100 text-purple-800';
      case 'economics': return 'bg-green-100 text-green-800';
      case 'politics': return 'bg-red-100 text-red-800';
      case 'entertainment': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPositions = transformedPositions
    .filter(position => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'active') return position.marketStatus === 'active';
      if (filterStatus === 'closing') return position.marketStatus === 'closing_soon';
      if (filterStatus === 'resolved') return position.marketStatus === 'resolved';
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'pnl':
          return b.pnlPercent - a.pnlPercent;
        case 'value':
          return b.currentValue - a.currentValue;
        case 'alphabetical':
          return a.marketTitle.localeCompare(b.marketTitle);
        case 'date':
          return b.purchaseDate.getTime() - a.purchaseDate.getTime();
        default:
          return 0;
      }
    });

  const categoryAllocation = transformedPositions.reduce((acc, position) => {
    const category = position.category;
    if (!acc[category]) acc[category] = 0;
    acc[category] += position.currentValue;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio</h1>
            <p className="text-gray-600">Track your positions and performance</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live prices</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setLastUpdate(new Date());
                refresh();
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading portfolio...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading portfolio</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                className="ml-auto"
              >
                Try again
              </Button>
            </div>
          </Card>
        )}

        {/* Portfolio Overview Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-blue-100 rounded">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Value</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioStats.totalValue)}</p>
                <div className={`flex items-center text-sm ${
                  portfolioStats.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {portfolioStats.dayChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  <span>{formatCurrency(Math.abs(portfolioStats.dayChange))} ({portfolioStats.dayChangePercent >= 0 ? '+' : ''}{portfolioStats.dayChangePercent.toFixed(2)}%)</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-green-100 rounded">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total P&L</span>
                </div>
                <p className={`text-2xl font-bold ${portfolioStats.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(portfolioStats.totalPnl)}
                </p>
                <div className={`flex items-center text-sm ${
                  portfolioStats.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span>({portfolioStats.totalPnlPercent >= 0 ? '+' : ''}{portfolioStats.totalPnlPercent.toFixed(2)}%)</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-purple-100 rounded">
                    <Target className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Win Rate</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{portfolioStats.winRate.toFixed(1)}%</p>
                <div className="text-sm text-gray-500">
                  <span>{portfolioStats.totalTrades} total trades</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-orange-100 rounded">
                    <Activity className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Active Positions</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{portfolioStats.activePositions}</p>
                <div className="text-sm text-gray-500">
                  <span>Across {Object.keys(categoryAllocation).length} categories</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-gray-100 rounded">
                    <BookOpen className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Invested</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioStats.totalInvested)}</p>
                <div className="text-sm text-gray-500">
                  <span>Principal amount</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-indigo-100 rounded">
                    <Zap className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Available</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioStats.availableBalance)}</p>
                <div className="text-sm text-gray-500">
                  <span>Ready to trade</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation Tabs */}
        {!loading && !error && (
          <Card className="p-1 bg-white border-0 shadow-sm">
            <div className="flex rounded-lg bg-gray-100 p-1">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'positions', label: 'Positions', icon: Target },
                { id: 'history', label: 'History', icon: Clock },
                { id: 'analytics', label: 'Analytics', icon: PieChart }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedTab(id as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors flex-1 justify-center ${
                    selectedTab === id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Tab Content */}
        {!loading && !error && (
          <>
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Portfolio Performance Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="p-6 bg-white border-0 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Portfolio Performance</h3>
                      <div className="flex rounded-lg bg-gray-100 p-1">
                        {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((period) => (
                          <button
                            key={period}
                            onClick={() => setTimeframe(period as any)}
                            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                              timeframe === period
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {portfolioStats.totalValue > 0 ? (
                      <div className="h-64 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                        <div className="h-full flex flex-col justify-between">
                          {/* Current Portfolio Metrics */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Total Portfolio Value</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioStats.totalValue)}</p>
                              </div>
                              <div className={`flex items-center gap-1 ${
                                portfolioStats.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {portfolioStats.totalPnl >= 0 ? (
                                  <TrendingUp className="h-5 w-5" />
                                ) : (
                                  <TrendingDown className="h-5 w-5" />
                                )}
                                <span className="font-semibold">
                                  {portfolioStats.totalPnl >= 0 ? '+' : ''}{portfolioStats.totalPnlPercent.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-xs text-gray-600">P&L</p>
                                <p className={`text-lg font-semibold ${
                                  portfolioStats.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {portfolioStats.totalPnl >= 0 ? '+' : ''}{formatCurrency(portfolioStats.totalPnl)}
                                </p>
                              </div>
                              <div className="bg-white/60 rounded-lg p-3">
                                <p className="text-xs text-gray-600">Win Rate</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {portfolioStats.winRate.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Performance Indicator */}
                          <div className="flex items-center justify-between pt-4 border-t border-white/30">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-gray-600">Live portfolio tracking</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {portfolioStats.activePositions} active position{portfolioStats.activePositions !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Start trading to see performance</p>
                          <p className="text-sm text-gray-500">Your portfolio performance will appear here</p>
                        </div>
                      </div>
                    )}
                  </Card>

                  <Card className="p-6 bg-white border-0 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Allocation</h3>
                    
                    {Object.keys(categoryAllocation).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(categoryAllocation).map(([category, value]) => {
                          const percentage = portfolioStats.totalValue > 0 ? (value / portfolioStats.totalValue) * 100 : 0;
                          return (
                            <div key={category} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium capitalize">{category}</span>
                                <span className="text-gray-600">{percentage.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatCurrency(value)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <PieChart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No positions yet</p>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="p-6 bg-white border-0 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Trading Activity</h3>
                    <Button variant="outline" size="sm" onClick={() => setSelectedTab('history')}>
                      View All
                    </Button>
                  </div>
                  
                  {transformedTrades.length > 0 ? (
                    <div className="space-y-4">
                      {transformedTrades.slice(0, 5).map((trade) => (
                        <div key={trade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${
                              trade.type === 'buy' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {trade.type === 'buy' ? (
                                <Plus className="h-4 w-4 text-green-600" />
                              ) : (
                                <Minus className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            
                            <div>
                              <p className="font-medium text-gray-900">{trade.marketTitle}</p>
                              <p className="text-sm text-gray-600">
                                {trade.type.toUpperCase()} {trade.quantity} {trade.side.toUpperCase()} @ ₹{trade.price}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatCurrency(trade.total)}</p>
                            <p className="text-sm text-gray-500">{trade.timestamp.toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No trading activity yet</p>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {selectedTab === 'positions' && (
              <div className="space-y-6">
                {/* Position Controls */}
                <Card className="p-4 bg-white border-0 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">Sort by:</span>
                      </div>
                      <div className="flex rounded-lg bg-gray-100 p-1">
                        {[
                          { value: 'pnl', label: 'P&L %' },
                          { value: 'value', label: 'Value' },
                          { value: 'alphabetical', label: 'A-Z' },
                          { value: 'date', label: 'Date' },
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => setSortBy(value as any)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              sortBy === value
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select 
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value as any)}
                          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Positions</option>
                          <option value="active">Active</option>
                          <option value="closing">Closing Soon</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {filteredPositions.length} positions
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Positions List or Empty State */}
                {filteredPositions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredPositions.map((position) => (
                      <Card key={position.id} className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getCategoryColor(position.category)} variant="outline">
                                {position.category.charAt(0).toUpperCase() + position.category.slice(1)}
                              </Badge>
                              <Badge className={getStatusColor(position.marketStatus)}>
                                {position.marketStatus.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge variant={position.type === 'yes' ? 'default' : 'outline'} className={
                                position.type === 'yes' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }>
                                {position.type.toUpperCase()}
                              </Badge>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {position.marketTitle}
                            </h3>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Quantity:</span>
                                <p className="font-medium">{position.quantity}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Avg Price:</span>
                                <p className="font-medium">₹{position.avgPrice.toFixed(2)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Current Price:</span>
                                <p className="font-medium">₹{position.currentPrice.toFixed(2)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Expires:</span>
                                <p className="font-medium">{position.expiryDate.toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>

                          <div className="text-right space-y-2">
                            <div>
                              <p className="text-sm text-gray-500">Current Value</p>
                              <p className="text-xl font-bold text-gray-900">{formatCurrency(position.currentValue)}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">P&L</p>
                              <div className={`flex items-center gap-1 ${
                                position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {position.pnl >= 0 ? (
                                  <TrendingUp className="h-4 w-4" />
                                ) : (
                                  <TrendingDown className="h-4 w-4" />
                                )}
                                <span className="font-bold">
                                  {formatCurrency(Math.abs(position.pnl))} ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 bg-white border-0 shadow-sm">
                    <div className="text-center">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No positions found</h3>
                      <p className="text-gray-600 mb-4">
                        {filterStatus === 'all' 
                          ? "You don't have any positions yet. Start trading to see your portfolio grow!"
                          : "No positions match your current filter. Try adjusting your criteria."
                        }
                      </p>
                      {filterStatus !== 'all' && (
                        <Button onClick={() => setFilterStatus('all')}>
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {selectedTab === 'history' && (
              <Card className="p-6 bg-white border-0 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Trading History</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
                
                {transformedTrades.length > 0 ? (
                  <div className="space-y-4">
                    {transformedTrades.map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            trade.type === 'buy' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {trade.type === 'buy' ? (
                              <Plus className="h-4 w-4 text-green-600" />
                            ) : (
                              <Minus className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-900">{trade.marketTitle}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{trade.type.toUpperCase()} {trade.quantity} {trade.side.toUpperCase()}</span>
                              <span>@ ₹{trade.price}</span>
                              <span>{trade.timestamp.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(trade.total)}</p>
                          <Badge className={
                            trade.status === 'completed' ? 'bg-green-100 text-green-800' :
                            trade.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {trade.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-center pt-6">
                      <Button variant="outline">
                        Load More History
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No trading history</h3>
                    <p className="text-gray-600">Your completed trades will appear here once you start trading.</p>
                  </div>
                )}
              </Card>
            )}

            {selectedTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-white border-0 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Total Return</span>
                      <span className={`font-bold ${portfolioStats.totalPnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {portfolioStats.totalPnlPercent >= 0 ? '+' : ''}{portfolioStats.totalPnlPercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Win Rate</span>
                      <span className="font-bold text-gray-900">{portfolioStats.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Total Trades</span>
                      <span className="font-bold text-gray-900">{portfolioStats.totalTrades}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Active Positions</span>
                      <span className="font-bold text-gray-900">{portfolioStats.activePositions}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Available Balance</span>
                      <span className="font-bold text-gray-900">{formatCurrency(portfolioStats.availableBalance)}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white border-0 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Total Invested</span>
                      <span className="font-bold text-gray-900">{formatCurrency(portfolioStats.totalInvested)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Current Value</span>
                      <span className="font-bold text-gray-900">{formatCurrency(portfolioStats.totalValue)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Total P&L</span>
                      <span className={`font-bold ${portfolioStats.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(portfolioStats.totalPnl)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Categories</span>
                      <span className="font-bold text-gray-900">{Object.keys(categoryAllocation).length}</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 