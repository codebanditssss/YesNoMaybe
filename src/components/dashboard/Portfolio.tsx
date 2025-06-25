import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  TrendingDownIcon
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

  // Auto-refresh portfolio data
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Mock portfolio data
  const portfolioStats: PortfolioStats = {
    totalValue: 15420.50,
    totalInvested: 12800.00,
    totalPnl: 2620.50,
    totalPnlPercent: 20.47,
    dayChange: 340.25,
    dayChangePercent: 2.26,
    winRate: 68.5,
    totalTrades: 147,
    activePositions: 23,
    availableBalance: 4580.75
  };

  const positions: Position[] = [
    {
      id: '1',
      marketId: 'btc-100k',
      marketTitle: 'Bitcoin to reach ₹84L by December 2024?',
      category: 'crypto',
      type: 'yes',
      quantity: 150,
      avgPrice: 4.2,
      currentPrice: 4.8,
      investmentValue: 630.00,
      currentValue: 720.00,
      pnl: 90.00,
      pnlPercent: 14.29,
      marketStatus: 'active',
      expiryDate: new Date('2024-12-31'),
      purchaseDate: new Date('2024-01-15'),
      lastUpdate: new Date()
    },
    {
      id: '2',
      marketId: 'india-worldcup',
      marketTitle: 'India to win World Cup 2024?',
      category: 'sports',
      type: 'yes',
      quantity: 200,
      avgPrice: 6.5,
      currentPrice: 6.7,
      investmentValue: 1300.00,
      currentValue: 1340.00,
      pnl: 40.00,
      pnlPercent: 3.08,
      marketStatus: 'active',
      expiryDate: new Date('2024-06-29'),
      purchaseDate: new Date('2024-02-01'),
      lastUpdate: new Date()
    },
    {
      id: '3',
      marketId: 'tesla-300',
      marketTitle: 'Tesla stock to cross ₹25,000 by Q1 2025?',
      category: 'economics',
      type: 'no',
      quantity: 80,
      avgPrice: 4.8,
      currentPrice: 4.6,
      investmentValue: 384.00,
      currentValue: 368.00,
      pnl: -16.00,
      pnlPercent: -4.17,
      marketStatus: 'active',
      expiryDate: new Date('2025-03-31'),
      purchaseDate: new Date('2024-01-20'),
      lastUpdate: new Date()
    },
    {
      id: '4',
      marketId: 'ai-agi-2025',
      marketTitle: 'AI to achieve AGI by 2025?',
      category: 'technology',
      type: 'no',
      quantity: 120,
      avgPrice: 7.2,
      currentPrice: 7.8,
      investmentValue: 864.00,
      currentValue: 936.00,
      pnl: 72.00,
      pnlPercent: 8.33,
      marketStatus: 'active',
      expiryDate: new Date('2025-12-31'),
      purchaseDate: new Date('2023-12-01'),
      lastUpdate: new Date()
    }
  ];

  const recentTrades: Trade[] = [
    {
      id: '1',
      marketId: 'btc-100k',
      marketTitle: 'Bitcoin to reach ₹84L by December 2024?',
      type: 'buy',
      side: 'yes',
      quantity: 50,
      price: 4.8,
      total: 240.00,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'completed'
    },
    {
      id: '2',
      marketId: 'tesla-300',
      marketTitle: 'Tesla stock to cross ₹25,000 by Q1 2025?',
      type: 'sell',
      side: 'no',
      quantity: 20,
      price: 4.6,
      total: 92.00,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: 'completed'
    },
    {
      id: '3',
      marketId: 'india-worldcup',
      marketTitle: 'India to win World Cup 2024?',
      type: 'buy',
      side: 'yes',
      quantity: 100,
      price: 6.7,
      total: 670.00,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'completed'
    },
    {
      id: '4',
      marketId: 'ai-agi-2025',
      marketTitle: 'AI to achieve AGI by 2025?',
      type: 'buy',
      side: 'no',
      quantity: 30,
      price: 7.8,
      total: 234.00,
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      status: 'completed'
    },
    {
      id: '5',
      marketId: 'tesla-300',
      marketTitle: 'Tesla stock to cross ₹25,000 by Q1 2025?',
      type: 'sell',
      side: 'no',
      quantity: 15,
      price: 4.7,
      total: 70.50,
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
      status: 'completed'
    }
  ];

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

  const filteredPositions = positions
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

  const categoryAllocation = positions.reduce((acc, position) => {
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
              Export
            </Button>
          </div>
        </div>

        {/* Portfolio Overview Cards */}
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

        {/* Navigation Tabs */}
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

        {/* Tab Content */}
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
                
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Portfolio performance chart</p>
                    <p className="text-sm text-gray-500">Real charts would be integrated here</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border-0 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Allocation</h3>
                
                <div className="space-y-3">
                  {Object.entries(categoryAllocation).map(([category, value]) => {
                    const percentage = (value / portfolioStats.totalValue) * 100;
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
              
              <div className="space-y-4">
                {recentTrades.slice(0, 5).map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        trade.type === 'buy' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {trade.type === 'buy' ? (
                          <Plus className={`h-4 w-4 ${trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}`} />
                        ) : (
                          <Minus className={`h-4 w-4 ${trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}`} />
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

            {/* Positions List */}
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
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Buy More
                        </Button>
                        <Button size="sm" variant="outline">
                          <Minus className="h-4 w-4 mr-1" />
                          Sell
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredPositions.length === 0 && (
              <Card className="p-12 bg-white border-0 shadow-sm">
                <div className="text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No positions found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filter criteria or start trading on some markets.
                  </p>
                  <Button onClick={() => setFilterStatus('all')}>
                    Clear Filters
                  </Button>
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
            
            <div className="space-y-4">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      trade.type === 'buy' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {trade.type === 'buy' ? (
                        <Plus className={`h-4 w-4 ${trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}`} />
                      ) : (
                        <Minus className={`h-4 w-4 ${trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}`} />
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
            </div>
            
            <div className="text-center pt-6">
              <Button variant="outline">
                Load More History
              </Button>
            </div>
          </Card>
        )}

        {selectedTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white border-0 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Return</span>
                  <span className="font-bold text-green-600">+20.47%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Win Rate</span>
                  <span className="font-bold text-gray-900">68.5%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Average Trade</span>
                  <span className="font-bold text-gray-900">₹185.40</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Best Trade</span>
                  <span className="font-bold text-green-600">+₹450.00</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Worst Trade</span>
                  <span className="font-bold text-red-600">-₹120.00</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Sharpe Ratio</span>
                  <span className="font-bold text-gray-900">1.47</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-0 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Portfolio Beta</span>
                  <span className="font-bold text-gray-900">0.89</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Max Drawdown</span>
                  <span className="font-bold text-red-600">-8.5%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Volatility</span>
                  <span className="font-bold text-gray-900">15.2%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">VaR (95%)</span>
                  <span className="font-bold text-orange-600">₹320.50</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Risk Score</span>
                  <span className="font-bold text-yellow-600">Medium</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Correlation</span>
                  <span className="font-bold text-gray-900">0.23</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 