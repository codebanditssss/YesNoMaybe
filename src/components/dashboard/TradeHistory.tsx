'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowUpDown,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  Users,
  Volume2,
  Zap,
  BookOpen,
  Radio
} from "lucide-react";
import { useRealtimeTradeHistory } from '@/hooks/useRealtimeTradeHistory';
import { exportTradeHistoryToCSV } from '@/lib/csvExport';
import { SelectDropdown } from "@/components/ui/select-dropdown";

export function TradeHistory() {
  const [selectedTab, setSelectedTab] = useState<'all' | 'completed' | 'pending' | 'analytics'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'total' | 'pnl' | 'price'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [filterSide, setFilterSide] = useState<'all' | 'YES' | 'NO'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'filled' | 'open' | 'cancelled'>('all');
  const [dateRange, setDateRange] = useState<'all' | '1d' | '7d' | '30d' | '90d'>('all');
  const [mounted, setMounted] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Use real-time trade history data
  const { 
    trades, 
    stats, 
    loading, 
    error, 
    refresh,
    loadMore,
    hasData,
    canLoadMore,
    realtimeUpdates
  } = useRealtimeTradeHistory({ 
    status: filterStatus === 'all' ? undefined : filterStatus,
    side: filterSide === 'all' ? undefined : filterSide,
    dateRange: dateRange === 'all' ? undefined : dateRange,
    sortBy: sortBy === 'total' ? 'quantity' : sortBy === 'pnl' ? 'quantity' : sortBy,
    sortOrder,
    search: searchTerm,
    autoRefresh: true,
    refreshInterval: 60000 // 1 minute
  });

  // Initialize on client side only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter trades client-side for tab functionality
  const filteredTrades = trades.filter(trade => {
    if (selectedTab === 'completed') return trade.status === 'filled';
    if (selectedTab === 'pending') return trade.status === 'open';
    return true; // 'all' tab shows everything
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': 
      case 'filled': return 'bg-green-100 text-green-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': 
      case 'filled': return <CheckCircle className="h-4 w-4" />;
      case 'open': return <Clock className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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

  const toggleTradeSelection = (tradeId: string) => {
    setSelectedTrades(prev => 
      prev.includes(tradeId) 
        ? prev.filter(id => id !== tradeId)
        : [...prev, tradeId]
    );
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "filled", label: "Completed" },
    { value: "open", label: "Pending" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const sideOptions = [
    { value: "all", label: "All Sides" },
    { value: "YES", label: "YES" },
    { value: "NO", label: "NO" },
  ];

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "1d", label: "Last 24 hours" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
  ];

  const sortByOptions = [
    { value: "created_at", label: "Date" },
    { value: "total", label: "Volume" },
    { value: "pnl", label: "P&L" },
    { value: "price", label: "Price" },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Trade History</h1>
            <p className="text-gray-600">Track all your trading activity and performance</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Real-time status indicator */}
            <div className="flex items-center gap-2">
              <Radio className={`h-4 w-4 ${realtimeUpdates.type ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {realtimeUpdates.type 
                  ? `Last update: ${realtimeUpdates.type} (${new Date(realtimeUpdates.lastUpdate).toLocaleTimeString()})`
                  : 'Waiting for updates...'}
              </span>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={refresh}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              onClick={() => exportTradeHistoryToCSV(trades)}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && trades.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading trade history...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading trade history</h3>
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

        {/* Trade Statistics */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-blue-100 rounded">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Trades</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTrades}</p>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-purple-100 rounded">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Volume</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalVolume)}</p>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${stats.totalPnL >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {stats.totalPnL >= 0 ? (
                      <TrendingUp className={`h-4 w-4 ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    ) : (
                      <TrendingDown className={`h-4 w-4 ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total P&L</span>
                </div>
                <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.totalPnL)}
                </p>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-green-100 rounded">
                    <Target className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Win Rate</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.winRate.toFixed(1)}%</p>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-orange-100 rounded">
                    <BookOpen className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Avg Trade</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgTradeSize)}</p>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-indigo-100 rounded">
                    <Zap className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Fees</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalFees)}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation Tabs */}
        {!loading && !error && (
          <Card className="p-1 bg-white border-0 shadow-sm">
            <div className="flex rounded-lg bg-gray-100 p-1">
              {[
                { id: 'all', label: 'All Trades', icon: Activity },
                { id: 'completed', label: 'Completed', icon: CheckCircle },
                { id: 'pending', label: 'Pending', icon: Clock },
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
                  {id === 'all' && (
                    <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
                    {stats.totalTrades}
                  </Badge>
                  )}
                  {id === 'completed' && (
                    <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
                      {stats.completedTrades}
                    </Badge>
                  )}
                  {id === 'pending' && (
                    <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-800">
                      {stats.pendingTrades}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Tab Content */}
        {!loading && !error && (
          <>
            {(selectedTab === 'all' || selectedTab === 'completed' || selectedTab === 'pending') && (
              <div className="space-y-6">
                {/* Filters and Search */}
                <Card className="p-6 bg-white border-0 shadow-sm">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by market title..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-wrap gap-3 items-center">
                      {/* Status Filter */}
                      <SelectDropdown
                        options={statusOptions}
                        selected={filterStatus}
                        onSelect={val => setFilterStatus(val as any)}
                      />

                      {/* Side Filter */}
                      <SelectDropdown
                        options={sideOptions}
                        selected={filterSide}
                        onSelect={val => setFilterSide(val as any)}
                      />

                      {/* Date Range Filter */}
                      <SelectDropdown
                        options={dateRangeOptions}
                        selected={dateRange}
                        onSelect={val => setDateRange(val as any)}
                      />

                      {/* Sort Controls */}
                      <SelectDropdown
                        options={sortByOptions}
                        selected={sortBy}
                        onSelect={val => setSortBy(val as any)}
                      />

                      <button
                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                      {/* View Mode Toggle (like Markets) */}
                      <div className="flex rounded-lg bg-gray-100 p-1 ml-2">
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                          title="List View"
                        >
                          <BookOpen className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                          title="Grid View"
                        >
                          <Target className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Trades List */}
                {!hasData ? (
                  <Card className="p-12 bg-white border-0 shadow-sm">
                    <div className="text-center">
                      <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No trades found</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm || filterStatus !== 'all' || filterSide !== 'all' || dateRange !== 'all'
                          ? "No trades match your current filters. Try adjusting your search criteria."
                          : "You haven't made any trades yet. Start trading to see your activity here!"
                        }
                      </p>
                      {(searchTerm || filterStatus !== 'all' || filterSide !== 'all' || dateRange !== 'all') && (
                        <Button onClick={() => {
                          setSearchTerm('');
                          setFilterStatus('all');
                          setFilterSide('all');
                          setDateRange('all');
                        }}>
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  </Card>
                ) : (
                  <Card className="bg-white rounded-lg border-1 border border-gray-200 shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {selectedTab === 'all' ? 'All Trades' : 
                           selectedTab === 'completed' ? 'Completed Trades' : 'Pending Trades'}
                        </h3>
                        <div className="text-sm text-gray-600">
                          {filteredTrades.length} {filteredTrades.length === 1 ? 'trade' : 'trades'}
                        </div>
                      </div>
                      <div className="border-b border-gray-200 my-2" />
                      
                      {viewMode === 'list' ? (
                        <div className="space-y-4">
                          {filteredTrades.map((trade) => (
                            <div 
                              key={trade.id} 
                              className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                                realtimeUpdates.type === 'trade' && 
                                realtimeUpdates.tradeId === trade.id &&
                                new Date().getTime() - realtimeUpdates.lastUpdate.getTime() < 5000 
                                  ? 'animate-highlight bg-green-50' 
                                  : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={getCategoryColor(trade.marketCategory || 'general')} variant="outline">
                                      {(trade.marketCategory || 'general').charAt(0).toUpperCase() + (trade.marketCategory || 'general').slice(1)}
                                    </Badge>
                                    <Badge className={getStatusColor(trade.status)} variant="outline">
                                      <div className="flex items-center gap-1">
                                        {getStatusIcon(trade.status)}
                                        {trade.status.toUpperCase()}
                                      </div>
                                    </Badge>
                                    <Badge variant={trade.side === 'YES' ? 'default' : 'outline'} className={
                                      trade.side === 'YES' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }>
                                      {trade.side.toUpperCase()}
                                    </Badge>
                                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                                      {trade.orderType.toUpperCase()}
                                    </Badge>
                                    {trade.marketStatus === 'resolved' && (
                                      <Badge variant="outline" className="bg-emerald-100 text-emerald-800">
                                        RESOLVED
                                      </Badge>
                                    )}
                                    {trade.marketStatus === 'active' && (
                                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                        ACTIVE
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {trade.marketTitle}
                                  </h3>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">Quantity:</span>
                                      <p className="font-medium">{trade.quantity}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Price:</span>
                                      <p className="font-medium">₹{trade.price.toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Total:</span>
                                      <p className="font-medium">{formatCurrency(trade.total)}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Date:</span>
                                      <p className="font-medium">{new Date(trade.timestamp).toLocaleDateString()}</p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(trade.timestamp).toLocaleTimeString('en-US', { 
                                          hour: '2-digit', 
                                          minute: '2-digit', 
                                          hour12: true 
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right space-y-2">
                                  <div>
                                    <p className="text-sm text-gray-500">Investment</p>
                                    <p className="text-lg font-bold text-gray-900">{formatCurrency(trade.total || 0)}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-gray-500">P&L</p>
                                    <div className="flex items-center gap-1">
                                      {trade.marketStatus === 'resolved' ? (
                                        <span className={`font-bold ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                                          <span className="text-xs ml-1">
                                            ({trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(1)}%)
                                          </span>
                                        </span>
                                      ) : trade.status === 'filled' ? (
                                        <span className="font-medium text-blue-600">
                                          Pending
                                          <span className="text-xs ml-1 text-gray-500">
                                            (Active Market)
                                          </span>
                                        </span>
                                      ) : (
                                        <span className="font-medium text-gray-500">
                                          -
                                          <span className="text-xs ml-1">
                                            (Not Filled)
                                          </span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="text-xs text-gray-500">
                                    <p>Fees: {formatCurrency(trade.fees)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredTrades.map((trade) => (
                            <Card key={trade.id} className="p-5 bg-white border-2 border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex gap-1 flex-wrap">
                                  <Badge className={getCategoryColor(trade.marketCategory || 'general')} variant="outline">
                                    {(trade.marketCategory || 'general').charAt(0).toUpperCase() + (trade.marketCategory || 'general').slice(1)}
                                  </Badge>
                                  <Badge className={getStatusColor(trade.status)} variant="outline">
                                    <div className="flex items-center gap-1">
                                      {getStatusIcon(trade.status)}
                                      {trade.status.toUpperCase()}
                                    </div>
                                  </Badge>
                                  <Badge variant={trade.side === 'YES' ? 'default' : 'outline'} className={
                                    trade.side === 'YES' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                  }>
                                    {trade.side.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-500 text-right min-w-[80px]">
                                  {new Date(trade.timestamp).toLocaleDateString()}<br />
                                  {new Date(trade.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </div>
                              </div>

                              {/* Title */}
                              <h3 className="text-md font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {trade.marketTitle}
                              </h3>

                              {/* Divider */}
                              <div className="border-b border-gray-100 my-2" />

                              {/* Stats Grid */}
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-700 mb-2">
                                <div className="flex flex-col">
                                  <span className="text-gray-500">Quantity</span>
                                  <span className="font-medium">{trade.quantity}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-gray-500">Price</span>
                                  <span className="font-medium">₹{trade.price.toFixed(2)}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-gray-500">Total</span>
                                  <span className="font-medium">{formatCurrency(trade.total)}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-gray-500">Fees</span>
                                  <span className="font-medium">{formatCurrency(trade.fees)}</span>
                                </div>
                              </div>

                              {/* Divider */}
                              <div className="border-b border-gray-100 my-2" />

                              {/* Bottom Section: Investment & P&L */}
                              <div className="flex items-end justify-between mt-auto pt-2">
                                <div>
                                  <span className="block text-xs text-gray-500">Investment</span>
                                  <span className="text-base font-bold text-gray-900">{formatCurrency(trade.total || 0)}</span>
                                </div>
                                <div className="text-right">
                                  <span className="block text-xs text-gray-500">P&L</span>
                                  <span className={`text-base font-bold ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>{trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                                    <span className="ml-1 text-xs font-normal">({trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(1)}%)</span>
                                  </span>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Load More Button */}
                      {canLoadMore && (
                        <div className="text-center pt-6">
                          <Button 
                            variant="outline" 
                            onClick={loadMore}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              'Load More Trades'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {selectedTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-white border-0 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Performance</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Total Trades</span>
                      <span className="font-bold text-gray-900">{stats.totalTrades}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-bold text-green-600">{stats.completedTrades}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-bold text-yellow-600">{stats.pendingTrades}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Cancelled</span>
                      <span className="font-bold text-gray-600">{stats.cancelledTrades}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Win Rate</span>
                      <span className="font-bold text-gray-900">{stats.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Avg Execution Time</span>
                      <span className="font-bold text-gray-900">{stats.avgExecutionTime.toFixed(2)}s</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white border-0 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Total Volume</span>
                      <span className="font-bold text-gray-900">{formatCurrency(stats.totalVolume)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Total Fees</span>
                      <span className="font-bold text-gray-900">{formatCurrency(stats.totalFees)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Total P&L</span>
                      <span className={`font-bold ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(stats.totalPnL)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Average Trade Size</span>
                      <span className="font-bold text-gray-900">{formatCurrency(stats.avgTradeSize)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Best Trade</span>
                      <span className="font-bold text-green-600">{formatCurrency(stats.bestTrade)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Worst Trade</span>
                      <span className="font-bold text-red-600">{formatCurrency(stats.worstTrade)}</span>
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