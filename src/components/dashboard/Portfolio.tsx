"use client"

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRealtimePortfolio } from '@/hooks/useRealtimePortfolio';
import { useDailyChanges } from '@/hooks/useDailyChanges';
import { useRealtime } from '@/contexts/RealtimeContext';
import { 
  Target,
  BarChart3,
  PieChart,
  AlertCircle,
  RefreshCw,
  Radio,
  Clock,
  Activity,
  LucideIcon
} from "lucide-react";
import { PortfolioCharts } from './PortfolioCharts';
import { PortfolioAnalytics } from './PortfolioAnalytics';
import { PnLCalculator, TradePosition } from '@/lib/pnl-calculator';
import { TradeHistoryEntry as TradeHistory } from '@/hooks/useTradeHistory';

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
  lastUpdate: Date;
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
  volume: number;
}

// Add sophisticated color palette at the top
const POSITION_COLORS = {
  primary: '#1a1a1a',    // Black
  secondary: '#718096',  // Medium Gray
  accent: '#4a5568',     // Dark Gray
  success: '#047857',    // Muted Green
  danger: '#991b1b',     // Muted Red
  background: 'rgba(255, 255, 255, 0.8)',
  border: 'rgba(229, 231, 235, 0.5)'
};

export function Portfolio() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'positions' | 'analytics'>('overview');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'pnl' | 'value' | 'alphabetical' | 'date'>('pnl');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');
  const [mounted, setMounted] = useState(false);

  const { isConnected } = useRealtime();

  // Use real-time portfolio data
  const { 
    portfolio, 
    loading, 
    error, 
    refresh,
    positions,
    getTotalPnL,
    getPnLPercentage,
    realtimeUpdates
  } = useRealtimePortfolio({ 
    autoRefresh: true
  });

  // Initialize on client side only
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTotalValue = portfolio?.summary?.totalValue || (portfolio?.balance?.available_balance || 0);
  
  // Get daily changes using our new hook
  const { 
    dailyChange, 
    yesterdaySnapshot, 
    loading: dailyChangeLoading, 
    error: dailyChangeError,
    createSnapshot 
  } = useDailyChanges(currentTotalValue);

  // Use API portfolio data with calculated daily changes
  const stats: PortfolioStats = {
    totalValue: currentTotalValue,
    totalInvested: portfolio?.summary?.totalInvested || 0,
    totalPnl: getTotalPnL(),
    totalPnlPercent: getPnLPercentage(),
    dayChange: dailyChange?.absoluteChange || 0,
    dayChangePercent: dailyChange?.percentChange || 0,
    winRate: portfolio?.summary?.winRate || 0,
    totalTrades: portfolio?.balance?.total_trades || 0,
    activePositions: positions?.filter(p => p.marketStatus === 'active').length || 0,
    availableBalance: portfolio?.balance?.available_balance || 0,
    volume: portfolio?.summary?.volume || 0
  };

  // Transform positions for display using API data
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
      currentPrice: avgPrice, // Use avg price as current for now
      investmentValue: pos.totalInvested || 0,
      currentValue: currentValue,
      pnl: (pos.unrealizedPnL || 0) + (pos.realizedPnL || 0),
      pnlPercent: pnlPercent,
      marketStatus: (pos.marketStatus as 'active' | 'closing_soon' | 'resolved') || 'active',
      expiryDate: new Date(pos.resolutionDate || Date.now()),
      lastUpdate: new Date()
    };
  });

  // Filter positions
  const filteredPositions = transformedPositions.filter(position => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return position.marketStatus === 'active';
    if (filterStatus === 'resolved') return position.marketStatus === 'resolved';
    return true;
  });

  // Calculate category breakdown
  const categoryBreakdown = transformedPositions.reduce((acc, position) => {
    const category = position.category;
    if (!acc[category]) acc[category] = { value: 0, count: 0 };
    acc[category].value += position.currentValue;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { value: number; count: number }>);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num || 0);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      crypto: 'bg-orange-100 text-orange-800',
      sports: 'bg-blue-100 text-blue-800',
      technology: 'bg-purple-100 text-purple-800',
      economics: 'bg-green-100 text-green-800',
      politics: 'bg-red-100 text-red-800',
      entertainment: 'bg-pink-100 text-pink-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closing_soon': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading skeleton components
  const StatCardSkeleton = () => (
    <Card className="p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-1/2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mt-2"></div>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/4 mt-4"></div>
    </Card>
  );

  const PositionSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
    </tr>
  );

  const ChartSkeleton = () => (
    <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <BarChart3 className="h-8 w-8 text-gray-300" />
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-full">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Portfolio Value</h3>
              <ChartSkeleton />
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">P&L Distribution</h3>
              <ChartSkeleton />
            </Card>
          </div>

          {/* Positions Table */}
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Positions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(5)].map((_, i) => (
                    <PositionSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-50 min-h-full">
        <div className="max-w-7xl mx-auto">
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
                onClick={() => {
                  refresh();
                }}
              >
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  type TabId = 'overview' | 'positions' | 'analytics';
  
  const tabs: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
    { id: 'overview', label: 'Overview', icon: Clock },
    { id: 'positions', label: 'Positions', icon: BarChart3 },
    { id: 'analytics', label: 'Advanced Analytics', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl  font-bold text-black tracking-tight">Portfolio</h1>
            <p className="text-gray-500 mt-2 font-light">Your prediction market performance</p>
          </div>
          
          {/* Real-time status indicator as two separate buttons, always visible */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Last updated button (no clock, with label) */}
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full px-6 py-3 shadow border border-gray-100 min-w-[160px] min-h-[44px]">
              <span className="text-base font-semibold text-gray-700">Last updated:</span>
              <span className="text-base text-gray-700 font-medium">
                {realtimeUpdates.lastUpdate
                  ? new Date(realtimeUpdates.lastUpdate).toLocaleTimeString()
                  : '--:--'}
              </span>
            </div>
            {/* Live button (no green dot) */}
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full px-6 py-3 shadow border border-gray-100 min-w-[120px] min-h-[44px]">
              <Radio className={`h-5 w-5 ${isConnected ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
              <span className="text-base text-gray-700 font-medium">Live</span>
            </div>
            {/* Refresh button (unchanged) */}
            <Button
              onClick={refresh}
              size="sm"
              variant="outline"
              className="hover:border-gray-200 shadow bg-white/70 backdrop-blur-md rounded-full px-6 py-3 min-w-[120px] min-h-[44px] flex items-center justify-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center w-full mb-10">
          <nav className="flex bg-white/80 backdrop-blur-lg rounded-full border border-gray-100 shadow">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedTab(id)}
                className={`
                  flex items-center gap-3 px-8 py-3 text-lg font-medium rounded-full min-w-[160px] min-h-[48px] justify-center
                  ${selectedTab === id 
                    ? 'bg-black text-white shadow-lg' 
                    : 'bg-transparent'}
                `}
                style={{ boxShadow: selectedTab === id ? '0 2px 16px 0 rgba(0,0,0,0.08)' : undefined }}
              >
                <Icon className={`h-6 w-6 ${selectedTab === id ? 'text-white' : 'text-gray-500'}`} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Section with improved spacing */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-gray-100/50">
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Value Card */}
                <div className={`bg-white/80 rounded-lg p-6 shadow border border-gray-100/50 group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/10 shadow-md ${
                  realtimeUpdates.type === 'balance' && 
                  new Date().getTime() - realtimeUpdates.lastUpdate.getTime() < 2000 
                    ? 'animate-highlight' 
                    : ''
                }`}>
                  <h3 className="text-sm font-light text-gray-500 mb-2">TOTAL VALUE</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-medium">₹{formatNumber(stats.totalValue)}</span>
                    <span className={`text-sm ${stats.totalPnlPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stats.totalPnlPercent >= 0 ? '+' : ''}{stats.totalPnlPercent.toFixed(2)}%
                    </span>
                  </div>
                  {realtimeUpdates.type === 'balance' && (
                    <div className="text-xs text-emerald-600 mt-1 font-medium animate-pulse">
                      Real-time updates enabled
                    </div>
                  )}
                </div>

                {/* P&L Card */}
                <div className={`bg-white/80 rounded-lg p-6 shadow border border-gray-100/50 group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/10 shadow-md ${
                  realtimeUpdates.type === 'position' && 
                  new Date().getTime() - realtimeUpdates.lastUpdate.getTime() < 2000 
                    ? 'animate-highlight' 
                    : ''
                }`}>
                  <h3 className="text-sm font-light text-gray-500 mb-2">PROFIT & LOSS</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className={`text-2xl font-medium ${stats.totalPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stats.totalPnl >= 0 ? '+' : ''}₹{formatNumber(Math.abs(stats.totalPnl))}
                    </span>
                    <span className="text-sm text-gray-500">{stats.totalTrades} trades executed</span>
                  </div>
                  {realtimeUpdates.type === 'position' && (
                    <div className="text-xs text-emerald-600 mt-1 font-medium animate-pulse">
                      Real-time updates enabled
                    </div>
                  )}
                </div>

                {/* Available Balance Card */}
                <div className={`bg-white/80 rounded-lg p-6 shadow border border-gray-100/50 group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/10 shadow-md ${
                  realtimeUpdates.type === 'balance' && 
                  new Date().getTime() - realtimeUpdates.lastUpdate.getTime() < 2000 
                    ? 'animate-highlight' 
                    : ''
                }`}>
                  <h3 className="text-sm font-light text-gray-500 mb-2">AVAILABLE</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-medium">₹{formatNumber(stats.availableBalance)}</span>
                    <span className="text-sm text-gray-500">Ready to trade</span>
                  </div>
                  {realtimeUpdates.type === 'balance' && (
                    <div className="text-xs text-emerald-600 mt-1 font-medium animate-pulse">
                      Real-time updates enabled
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'WIN RATE', value: `${stats.winRate.toFixed(1)}%` },
                  { label: 'ACTIVE POSITIONS', value: stats.activePositions },
                  { label: 'TOTAL INVESTED', value: `₹${formatNumber(stats.totalInvested)}` },
                  { label: 'VOLUME', value: `₹${formatNumber(stats.volume)}` }
                ].map((metric, idx) => (
                  <div
                    key={idx}
                    className="bg-white/60 rounded-lg p-4 text-center shadow group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/10 shadow-md"
                  >
                    <div className="text-xl font-medium">{metric.value}</div>
                    <div className="text-xs font-light text-gray-500 mt-1">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="space-y-5">
                <div className="flex items-center justify-between mt-16">
                  <h2 className="text-4xl font-light text-black tracking-tigh">Performance</h2>
                  <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm overflow-hidden">
                    {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTimeframe(t)}
                        className={`
                          px-4 py-2 text-sm font-medium transition-all duration-200
                          ${timeframe === t 
                            ? 'bg-black text-white shadow-lg' 
                            : 'text-gray-600 hover:bg-gray-100'
                          }
                        `}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-100/50 shadow-sm p-6">
                  <PortfolioCharts 
                    timeframe={timeframe}
                    data={{
                      history: portfolio?.history || [],
                      summary: {
                        totalValue: stats.totalValue,
                        totalPnl: stats.totalPnl,
                        volume: stats.volume
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

        {/* Positions Tab */}
        {selectedTab === 'positions' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-black">Your Positions</h2>
              <div className="flex items-center space-x-4">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="border border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-light rounded-lg hover:bg-white transition-colors"
                >
                  <option value="all">All Positions ({transformedPositions.length})</option>
                  <option value="active">Active ({transformedPositions.filter(p => p.marketStatus === 'active').length})</option>
                  <option value="resolved">Resolved ({transformedPositions.filter(p => p.marketStatus === 'resolved').length})</option>
                </select>
                
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                    className="border border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-light rounded-lg hover:bg-white transition-colors"
                >
                  <option value="pnl">Sort by P&L</option>
                  <option value="value">Sort by Value</option>
                    <option value="alphabetical">Sort by Name</option>
                  <option value="date">Sort by Date</option>
                </select>
              </div>
            </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200/50 text-left bg-gray-50/50">
                        <th className="px-6 py-4 text-sm font-light text-gray-600">Market</th>
                        <th className="px-6 py-4 text-sm font-light text-gray-600">Type</th>
                        <th className="px-6 py-4 text-sm font-light text-gray-600">Category</th>
                        <th className="px-6 py-4 text-sm font-light text-gray-600">Quantity</th>
                        <th className="px-6 py-4 text-sm font-light text-gray-600">Avg. Price</th>
                        <th className="px-6 py-4 text-sm font-light text-gray-600">Current Value</th>
                        <th className="px-6 py-4 text-sm font-light text-gray-600">P&L</th>
                        <th className="px-6 py-4 text-sm font-light text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array(3).fill(0).map((_, i) => <PositionSkeleton key={i} />)
                      ) : filteredPositions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                            No positions found
                          </td>
                        </tr>
                      ) : (
                        filteredPositions
                  .sort((a, b) => {
                    switch (sortBy) {
                      case 'pnl':
                        return b.pnl - a.pnl;
                      case 'value':
                        return b.currentValue - a.currentValue;
                      case 'alphabetical':
                        return a.marketTitle.localeCompare(b.marketTitle);
                      case 'date':
                                return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
                      default:
                        return 0;
                    }
                  })
                          .map((position) => (
                            <tr 
                              key={position.id} 
                              className={`
                                border-b border-gray-100/50 transition-all duration-200
                                ${position.pnl >= 0 
                                  ? 'hover:bg-emerald-50/30' 
                                  : 'hover:bg-red-50/30'
                                }
                              `}
                            >
                              <td className="px-6 py-4">
                                <div className="font-light">{position.marketTitle}</div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge 
                                  variant="outline" 
                                  className={`
                                    bg-white/60 backdrop-blur-sm border border-gray-200/50
                                    ${position.type === 'yes' 
                                      ? 'text-emerald-900' 
                                      : 'text-gray-700'
                                    }
                                  `}
                                >
                                  {position.type.toUpperCase()}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <Badge 
                                  variant="outline" 
                                  className="bg-white/60 backdrop-blur-sm border border-gray-200/50 text-gray-700"
                                >
                            {position.category}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 font-light">
                                {position.quantity.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 font-light">
                                {formatCurrency(position.avgPrice)}
                              </td>
                              <td className="px-6 py-4 font-light">
                                {formatCurrency(position.currentValue)}
                              </td>
                              <td className="px-6 py-4">
                                <div className={`
                                  ${position.pnl >= 0 
                                    ? 'text-emerald-800' 
                                    : 'text-red-900'
                                  }
                                `}>
                                  <div className="font-light">{formatCurrency(position.pnl)}</div>
                                  <div className="text-sm opacity-75">{formatPercent(position.pnlPercent)}</div>
                        </div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge 
                                  variant="outline" 
                                  className={`
                                    bg-white/60 backdrop-blur-sm border border-gray-200/50
                                    ${position.marketStatus === 'active' 
                                      ? 'text-emerald-900' 
                                      : position.marketStatus === 'closing_soon'
                                      ? 'text-amber-900'
                                      : 'text-gray-700'
                                    }
                                  `}
                                >
                                  {position.marketStatus.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        )}

          {/* Analytics Tab */}
        {selectedTab === 'analytics' && (
            <div>
              <PortfolioAnalytics 
                data={{
                  positions: transformedPositions,
                  history: portfolio?.history || [],
                  summary: {
                    totalValue: stats.totalValue,
                    totalPnl: stats.totalPnl,
                    winRate: stats.winRate,
                    volume: stats.volume
                  }
                }}
              />
            </div>
          )}
          </div>
      </div>
    </div>
  );
} 