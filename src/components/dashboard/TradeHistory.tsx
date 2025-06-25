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
  BookOpen
} from "lucide-react";

interface Trade {
  id: string;
  marketId: string;
  marketTitle: string;
  category: string;
  type: 'buy' | 'sell';
  side: 'yes' | 'no';
  quantity: number;
  price: number;
  total: number;
  fees: number;
  netAmount: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'cancelled' | 'failed';
  orderType: 'market' | 'limit';
  pnl?: number;
  pnlPercent?: number;
  executionTime: number; // in seconds
  liquidityProvider?: boolean;
}

interface TradeStats {
  totalTrades: number;
  totalVolume: number;
  totalFees: number;
  totalPnL: number;
  winRate: number;
  avgTradeSize: number;
  bestTrade: number;
  worstTrade: number;
  avgExecutionTime: number;
}

export function TradeHistory() {
  const [selectedTab, setSelectedTab] = useState<'all' | 'completed' | 'pending' | 'analytics'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'volume' | 'pnl' | 'price'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [filterSide, setFilterSide] = useState<'all' | 'yes' | 'no'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');
  const [dateRange, setDateRange] = useState<'all' | '1d' | '7d' | '30d' | '90d'>('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Mock trade data
  const trades: Trade[] = [
    {
      id: '1',
      marketId: 'btc-100k',
      marketTitle: 'Bitcoin to reach ₹84L by December 2024?',
      category: 'crypto',
      type: 'buy',
      side: 'yes',
      quantity: 150,
      price: 4.8,
      total: 720.00,
      fees: 7.20,
      netAmount: 727.20,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'completed',
      orderType: 'market',
      pnl: 90.00,
      pnlPercent: 12.5,
      executionTime: 0.8,
      liquidityProvider: false
    },
    {
      id: '2',
      marketId: 'tesla-300',
      marketTitle: 'Tesla stock to cross ₹25,000 by Q1 2025?',
      category: 'economics',
      type: 'sell',
      side: 'no',
      quantity: 20,
      price: 4.6,
      total: 92.00,
      fees: 0.92,
      netAmount: 91.08,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: 'completed',
      orderType: 'limit',
      pnl: -8.50,
      pnlPercent: -8.5,
      executionTime: 120.5,
      liquidityProvider: true
    },
    {
      id: '3',
      marketId: 'india-worldcup',
      marketTitle: 'India to win World Cup 2024?',
      category: 'sports',
      type: 'buy',
      side: 'yes',
      quantity: 100,
      price: 6.7,
      total: 670.00,
      fees: 6.70,
      netAmount: 676.70,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'completed',
      orderType: 'market',
      pnl: 45.20,
      pnlPercent: 6.7,
      executionTime: 1.2,
      liquidityProvider: false
    },
    {
      id: '4',
      marketId: 'ai-agi-2025',
      marketTitle: 'AI to achieve AGI by 2025?',
      category: 'technology',
      type: 'buy',
      side: 'no',
      quantity: 30,
      price: 7.8,
      total: 234.00,
      fees: 2.34,
      netAmount: 236.34,
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      status: 'pending',
      orderType: 'limit',
      executionTime: 0,
      liquidityProvider: false
    },
    {
      id: '5',
      marketId: 'apple-iphone16',
      marketTitle: 'Apple to announce iPhone 16 in September 2024?',
      category: 'technology',
      type: 'sell',
      side: 'yes',
      quantity: 50,
      price: 9.1,
      total: 455.00,
      fees: 4.55,
      netAmount: 450.45,
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
      status: 'cancelled',
      orderType: 'limit',
      pnl: 0,
      pnlPercent: 0,
      executionTime: 0,
      liquidityProvider: false
    },
    {
      id: '6',
      marketId: 'meta-vr',
      marketTitle: 'Meta to release affordable VR headset in 2024?',
      category: 'technology',
      type: 'buy',
      side: 'yes',
      quantity: 200,
      price: 5.5,
      total: 1100.00,
      fees: 11.00,
      netAmount: 1111.00,
      timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000),
      status: 'completed',
      orderType: 'market',
      pnl: 165.00,
      pnlPercent: 15.0,
      executionTime: 0.9,
      liquidityProvider: false
    }
  ];

  // Calculate trade statistics
  const completedTrades = trades.filter(trade => trade.status === 'completed');
  const tradeStats: TradeStats = {
    totalTrades: trades.length,
    totalVolume: completedTrades.reduce((sum, trade) => sum + trade.total, 0),
    totalFees: completedTrades.reduce((sum, trade) => sum + trade.fees, 0),
    totalPnL: completedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0),
    winRate: completedTrades.length > 0 ? (completedTrades.filter(t => (t.pnl || 0) > 0).length / completedTrades.length) * 100 : 0,
    avgTradeSize: completedTrades.length > 0 ? completedTrades.reduce((sum, trade) => sum + trade.total, 0) / completedTrades.length : 0,
    bestTrade: completedTrades.length > 0 ? Math.max(...completedTrades.map(t => t.pnl || 0)) : 0,
    worstTrade: completedTrades.length > 0 ? Math.min(...completedTrades.map(t => t.pnl || 0)) : 0,
    avgExecutionTime: completedTrades.length > 0 ? completedTrades.reduce((sum, trade) => sum + trade.executionTime, 0) / completedTrades.length : 0
  };

  // Filter trades based on current filters
  const filteredTrades = trades
    .filter(trade => {
      const matchesSearch = trade.marketTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || trade.type === filterType;
      const matchesSide = filterSide === 'all' || trade.side === filterSide;
      const matchesStatus = filterStatus === 'all' || trade.status === filterStatus;
      
      let matchesDate = true;
      if (dateRange !== 'all') {
        const days = parseInt(dateRange.replace('d', ''));
        const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        matchesDate = trade.timestamp >= dateThreshold;
      }

      return matchesSearch && matchesType && matchesSide && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'timestamp':
          comparison = b.timestamp.getTime() - a.timestamp.getTime();
          break;
        case 'volume':
          comparison = b.total - a.total;
          break;
        case 'pnl':
          comparison = (b.pnl || 0) - (a.pnl || 0);
          break;
        case 'price':
          comparison = b.price - a.price;
          break;
      }
      return sortOrder === 'desc' ? comparison : -comparison;
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
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
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

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Trade History</h1>
            <p className="text-gray-600">Track all your trading activity and performance</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live updates</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLastUpdate(new Date())}
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
              Export CSV
            </Button>
          </div>
        </div>

        {/* Trade Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Total Trades</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{tradeStats.totalTrades}</p>
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
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(tradeStats.totalVolume)}</p>
            </div>
          </Card>

          <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${tradeStats.totalPnL >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {tradeStats.totalPnL >= 0 ? (
                    <TrendingUp className={`h-4 w-4 ${tradeStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  ) : (
                    <TrendingDown className={`h-4 w-4 ${tradeStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-600">Total P&L</span>
              </div>
              <p className={`text-2xl font-bold ${tradeStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(tradeStats.totalPnL)}
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
              <p className="text-2xl font-bold text-gray-900">{tradeStats.winRate.toFixed(1)}%</p>
            </div>
          </Card>

          <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-orange-100 rounded">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Avg Size</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(tradeStats.avgTradeSize)}</p>
            </div>
          </Card>

          <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-gray-100 rounded">
                  <Clock className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Avg Speed</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{tradeStats.avgExecutionTime.toFixed(1)}s</p>
            </div>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className="p-6 bg-white border-0 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Filter & Search</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Trade Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="buy">Buy Orders</option>
              <option value="sell">Sell Orders</option>
            </select>

            {/* Side Filter */}
            <select
              value={filterSide}
              onChange={(e) => setFilterSide(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sides</option>
              <option value="yes">YES Positions</option>
              <option value="no">NO Positions</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="flex gap-2">
              {[
                { value: 'timestamp', label: 'Date' },
                { value: 'volume', label: 'Volume' },
                { value: 'pnl', label: 'P&L' },
                { value: 'price', label: 'Price' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    if (sortBy === value) {
                      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                    } else {
                      setSortBy(value as any);
                      setSortOrder('desc');
                    }
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    sortBy === value
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                  {sortBy === value && (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="ml-auto text-sm text-gray-600">
              {filteredTrades.length} of {trades.length} trades
            </div>
          </div>
        </Card>

        {/* Trade List */}
        <Card className="bg-white border-0 shadow-sm">
          <div className="p-6">
            {filteredTrades.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No trades found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search criteria.
                </p>
                <Button onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterSide('all');
                  setFilterStatus('all');
                  setDateRange('all');
                }}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTrades.map((trade) => (
                  <div key={trade.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(trade.category)} variant="outline">
                            {trade.category.charAt(0).toUpperCase() + trade.category.slice(1)}
                          </Badge>
                          <Badge className={getStatusColor(trade.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(trade.status)}
                              {trade.status.toUpperCase()}
                            </div>
                          </Badge>
                          <Badge variant={trade.type === 'buy' ? 'default' : 'outline'} className={
                            trade.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }>
                            {trade.type.toUpperCase()}
                          </Badge>
                          <Badge variant={trade.side === 'yes' ? 'default' : 'outline'} className={
                            trade.side === 'yes' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }>
                            {trade.side.toUpperCase()}
                          </Badge>
                          {trade.liquidityProvider && (
                            <Badge className="bg-purple-100 text-purple-800">
                              LP
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-2">{trade.marketTitle}</h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Quantity</p>
                            <p className="font-medium">{trade.quantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Price</p>
                            <p className="font-medium">{formatCurrency(trade.price)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total</p>
                            <p className="font-medium">{formatCurrency(trade.total)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Fees</p>
                            <p className="font-medium">{formatCurrency(trade.fees)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Date</p>
                            <p className="font-medium">{trade.timestamp.toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{trade.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        {trade.status === 'completed' && trade.pnl !== undefined && (
                          <div>
                            <p className="text-sm text-gray-500">P&L</p>
                            <div className={`text-lg font-bold flex items-center ${
                              trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {trade.pnl >= 0 ? (
                                <TrendingUp className="h-4 w-4 mr-1" />
                              ) : (
                                <TrendingDown className="h-4 w-4 mr-1" />
                              )}
                              {formatCurrency(Math.abs(trade.pnl))}
                            </div>
                            <p className={`text-sm ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({trade.pnlPercent !== undefined ? (trade.pnlPercent >= 0 ? '+' : '') + trade.pnlPercent.toFixed(1) + '%' : 'N/A'})
                            </p>
                          </div>
                        )}
                        
                        {trade.status === 'pending' && (
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 text-yellow-600">
                              <Clock className="h-4 w-4 animate-spin" />
                              <span className="text-sm font-medium">Processing...</span>
                            </div>
                          </div>
                        )}
                        
                        {trade.status === 'cancelled' && (
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 text-gray-600">
                              <XCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Cancelled</span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // View trade details
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Additional trade details */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>Order: {trade.orderType.toUpperCase()}</span>
                          {trade.status === 'completed' && (
                            <span>Execution: {trade.executionTime.toFixed(1)}s</span>
                          )}
                          <span>Net: {formatCurrency(trade.netAmount)}</span>
                        </div>
                        <span>ID: {trade.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 