"use client"

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
  BookOpen,
  Award
} from "lucide-react";
import { PortfolioCharts } from './PortfolioCharts';
import { PortfolioAnalytics } from './PortfolioAnalytics';

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

export function Portfolio() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'positions' | 'analytics'>('overview');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'pnl' | 'value' | 'alphabetical' | 'date'>('pnl');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Use real portfolio data
  const { 
    portfolio, 
    loading, 
    error, 
    refresh,
    positions,
    getTotalPnL,
    getPnLPercentage
  } = usePortfolio({ 
    includeHistory: true,
    autoRefresh: true,
    timeframe: timeframe
  });

  // Auto-refresh portfolio data
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      refresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Calculate portfolio stats
  const stats: PortfolioStats = {
    totalValue: portfolio?.summary?.totalValue || 0,
    totalInvested: portfolio?.summary?.totalInvested || 0,
    totalPnl: getTotalPnL(),
    totalPnlPercent: getPnLPercentage(),
    dayChange: 0, // TODO: Calculate daily change
    dayChangePercent: 0, // TODO: Calculate daily change %
    winRate: portfolio?.summary?.winRate || 0,
    totalTrades: portfolio?.balance?.total_trades || 0,
    activePositions: positions?.filter(p => p.marketStatus === 'active').length || 0,
    availableBalance: portfolio?.balance?.available_balance || 0,
    volume: portfolio?.summary?.volume || 0
  };

  // Transform positions for display
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
      currentPrice: avgPrice,
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
                  setLastUpdate(new Date());
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-light text-black tracking-tight">Portfolio</h1>
            <p className="text-gray-500 mt-2 font-light">Your prediction market performance</p>
          </div>
          
          <div className="flex items-center gap-6">
                          <div className="text-right">
                <div className="text-sm text-gray-400 font-light">Last updated</div>
                <div className="text-sm text-black font-medium">
                  {lastUpdate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                  })}
                </div>
              </div>
            <button 
              onClick={() => {
                setLastUpdate(new Date());
                refresh();
              }}
              className="w-10 h-10 rounded-full border border-gray-200 hover:border-gray-300 transition-all duration-300 flex items-center justify-center group hover:shadow-md"
            >
              <RefreshCw className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
            </button>
          </div>
        </div>

        {/* Key Metrics - Clean Design */}
        <div className="relative mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Portfolio Value */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-8 group hover:bg-white hover:shadow-2xl hover:shadow-gray-900/10 transition-all duration-500 hover:-translate-y-1 border border-gray-100/50">
              <div className="text-sm text-gray-400 font-light uppercase tracking-wider mb-3">Total Value</div>
              <div className="text-3xl font-light text-black mb-2">{formatCurrency(stats.totalValue)}</div>
              <div className={`text-sm font-medium flex items-center gap-1 ${
                stats.totalPnl >= 0 
                  ? 'text-emerald-700' 
                  : 'text-red-600'
              }`}>
                {stats.totalPnl >= 0 ? '↗' : '↘'}
                {stats.totalPnl >= 0 ? '+' : ''}{formatPercent(stats.totalPnlPercent)}
              </div>
            </div>

            {/* P&L */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-8 group hover:bg-white hover:shadow-2xl hover:shadow-gray-900/10 transition-all duration-500 hover:-translate-y-1 border border-gray-100/50">
              <div className="text-sm text-gray-400 font-light uppercase tracking-wider mb-3">Profit & Loss</div>
              <div className={`text-3xl font-light mb-2 ${
                stats.totalPnl >= 0 ? 'text-emerald-700' : 'text-red-600'
              }`}>
                {stats.totalPnl >= 0 ? '+' : ''}{formatCurrency(stats.totalPnl)}
              </div>
              <div className="text-sm text-gray-500 font-light">{stats.totalTrades} trades executed</div>
            </div>

            {/* Available Balance */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-8 group hover:bg-white hover:shadow-2xl hover:shadow-gray-900/10 transition-all duration-500 hover:-translate-y-1 border border-gray-100/50">
              <div className="text-sm text-gray-400 font-light uppercase tracking-wider mb-3">Available</div>
              <div className="text-3xl font-light text-black mb-2">{formatCurrency(stats.availableBalance)}</div>
              <div className="text-sm text-gray-500 font-light">Ready to trade</div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics - Floating Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-gray-100/70 transition-all duration-300 border border-white/50">
            <div className="text-2xl font-light text-black mb-1">{stats.winRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Win Rate</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-gray-100/70 transition-all duration-300 border border-white/50">
            <div className="text-2xl font-light text-black mb-1">{stats.activePositions}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Active Positions</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-gray-100/70 transition-all duration-300 border border-white/50">
            <div className="text-2xl font-light text-black mb-1">{formatCurrency(stats.totalInvested)}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Total Invested</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-gray-100/70 transition-all duration-300 border border-white/50">
            <div className="text-2xl font-light text-black mb-1">{formatCurrency(stats.volume)}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Volume</div>
          </div>
        </div>

        {/* Performance Charts */}
        <div className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light text-black">Performance</h2>
              {timeframe !== 'ALL' && (
                <p className="text-sm text-gray-400 mt-2 font-light">
                  Viewing {timeframe} period • Select "ALL" for complete history
                </p>
              )}
            </div>
            <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200 shadow-lg shadow-gray-100/50 overflow-hidden">
              {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const).map((t, index) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-4 py-2 text-sm font-light transition-all duration-300 relative ${
                    timeframe === t 
                      ? 'bg-black text-white shadow-lg' 
                      : 'text-gray-500 hover:text-black hover:bg-white/80'
                  }`}
                >
                  {t}
                  {timeframe === t && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-xl shadow-gray-100/50 overflow-hidden">
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

        {/* Category Breakdown */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-light text-black mb-8">Portfolio Allocation</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(categoryBreakdown).map(([category, data], index) => (
                <div key={category} className="relative bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 text-center group hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-5 bg-gray-400 transform translate-x-6 -translate-y-6"></div>
                  <div className="text-lg font-medium text-gray-800 mb-2 relative z-10">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1 relative z-10">{formatCurrency(data.value)}</div>
                  <div className="text-sm text-gray-500 font-medium relative z-10">
                    {data.count} position{data.count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Positions */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-light text-black">Positions</h2>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border border-gray-200 bg-white px-4 py-2 text-sm font-light text-black focus:outline-none focus:border-black transition-colors"
            >
              <option value="all">All Positions ({transformedPositions.length})</option>
              <option value="active">Active ({transformedPositions.filter(p => p.marketStatus === 'active').length})</option>
              <option value="resolved">Resolved ({transformedPositions.filter(p => p.marketStatus === 'resolved').length})</option>
            </select>
          </div>

          {filteredPositions.length > 0 ? (
            <div className="space-y-4">
              {filteredPositions.map((position, index) => (
                <div key={position.id} className={`relative bg-white/80 backdrop-blur-sm p-6 hover:bg-white/95 transition-all duration-300 group border border-gray-200/50 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:-translate-y-0.5 ${
                  index % 2 === 0 ? 'rounded-l-2xl rounded-r-lg' : 'rounded-r-2xl rounded-l-lg'
                } hover:shadow-gray-200/50`}>
                  {/* Subtle left accent */}
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-gray-300 to-gray-500 rounded-l-2xl"></div>
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1 ml-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs uppercase tracking-wider font-medium px-3 py-1.5 rounded-full border border-gray-200/50 text-gray-700 bg-white/60">
                          {position.category}
                        </span>
                        <span className={`text-xs uppercase tracking-wider font-light px-3 py-1.5 rounded-full ${
                          position.marketStatus === 'active' 
                            ? 'text-black bg-gray-100/60 border border-gray-300/50' 
                            : 'text-gray-500 bg-gray-50/60 border border-gray-200/50'
                        }`}>
                          {position.marketStatus.replace('_', ' ')}
                        </span>
                        <span className={`text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full border ${
                          position.type === 'yes' 
                            ? 'text-black bg-black/5 border-black/20' 
                            : 'text-gray-600 bg-gray-100/60 border-gray-300/50'
                        }`}>
                          {position.type}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-4 leading-tight">{position.marketTitle}</h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/30">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Quantity</div>
                          <div className="font-semibold text-gray-900">{position.quantity}</div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/30">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Avg Price</div>
                          <div className="font-semibold text-gray-900">₹{position.avgPrice.toFixed(2)}</div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/30">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Invested</div>
                          <div className="font-semibold text-gray-900">{formatCurrency(position.investmentValue)}</div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/30">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Current Value</div>
                          <div className="font-semibold text-gray-900">{formatCurrency(position.currentValue)}</div>
                        </div>
                      </div>
                    </div>

                    <div className={`text-right ml-8 px-4 py-6 rounded-xl border ${
                      position.pnl >= 0 
                        ? 'bg-gray-50/60 border-gray-300/30' 
                        : 'bg-gray-50/60 border-gray-300/30'
                    }`}>
                      <div className={`text-2xl font-bold flex items-center gap-2 ${
                        position.pnl >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        <span className="text-lg">{position.pnl >= 0 ? '↗' : '↘'}</span>
                        {position.pnl >= 0 ? '+' : ''}{formatCurrency(Math.abs(position.pnl))}
                      </div>
                      <div className={`text-sm font-medium mt-1 ${
                        position.pnl >= 0 ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {position.pnl >= 0 ? '+' : ''}{formatPercent(position.pnlPercent)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-gray-100 p-16 text-center">
              <div className="text-lg font-light text-gray-400 mb-2">No positions found</div>
              <div className="text-sm text-gray-400 font-light">
                {filterStatus === 'all' 
                  ? "Start trading to build your portfolio"
                  : "No positions match your current filter"
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 