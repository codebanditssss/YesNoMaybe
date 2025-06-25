import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown,
  Volume2,
  Clock,
  User,
  ArrowUpDown,
  RefreshCw,
  Settings,
  Filter,
  Search,
  BookOpen,
  Zap,
  Activity,
  Eye,
  BarChart,
  Target,
  AlertCircle
} from "lucide-react";

interface OrderbookOrder {
  id: string;
  price: number;
  quantity: number;
  total: number;
  users: number;
  timestamp: Date;
}

interface Market {
  id: string;
  title: string;
  category: string;
  description?: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume24h: number;
  yesPrice: number;
  noPrice: number;
  totalTraders: number;
  status: 'active' | 'closing_soon' | 'closed';
  expiryDate: Date;
}

interface OrderbookProps {
  selectedMarket?: Market;
  onMarketSelect?: (market: Market) => void;
}

export function Orderbook({ selectedMarket, onMarketSelect }: OrderbookProps) {
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [viewMode, setViewMode] = useState<'combined' | 'yes' | 'no'>('combined');
  const [priceFilter, setPriceFilter] = useState<'all' | 'best' | 'recent'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock markets data
  const availableMarkets: Market[] = [
    {
      id: '1',
      title: 'Bitcoin to reach ₹84L by 2024?',
      category: 'Crypto',
      description: 'Will Bitcoin price reach ₹84,00,000 INR by December 31, 2024?',
      lastPrice: 4.2,
      change: 0.3,
      changePercent: 7.8,
      volume24h: 156000,
      yesPrice: 4.2,
      noPrice: 5.8,
      totalTraders: 2847,
      status: 'active',
      expiryDate: new Date('2024-12-31')
    },
    {
      id: '2',
      title: 'Tesla stock above ₹25,000 by Q1 2025?',
      category: 'Stocks',
      description: 'Will Tesla stock price be above ₹25,000 INR by March 31, 2025?',
      lastPrice: 6.7,
      change: 0.8,
      changePercent: 13.6,
      volume24h: 89000,
      yesPrice: 6.7,
      noPrice: 3.3,
      totalTraders: 1632,
      status: 'active',
      expiryDate: new Date('2025-03-31')
    },
    {
      id: '3',
      title: 'AI achieves AGI by 2025?',
      category: 'Technology',
      description: 'Will artificial general intelligence be achieved by any company by 2025?',
      lastPrice: 3.4,
      change: -0.2,
      changePercent: -5.6,
      volume24h: 234000,
      yesPrice: 3.4,
      noPrice: 6.6,
      totalTraders: 4521,
      status: 'active',
      expiryDate: new Date('2025-12-31')
    },
    {
      id: '4',
      title: 'Fed Rate Cut by Q2 2024?',
      category: 'Economics',
      description: 'Will the Federal Reserve cut interest rates by June 30, 2024?',
      lastPrice: 7.3,
      change: 0.5,
      changePercent: 7.4,
      volume24h: 67000,
      yesPrice: 7.3,
      noPrice: 2.7,
      totalTraders: 892,
      status: 'closing_soon',
      expiryDate: new Date('2024-06-30')
    }
  ];

  const [currentMarket, setCurrentMarket] = useState<Market>(
    selectedMarket || availableMarkets[0]
  );

  // Mock orderbook data - in real app this would come from API
  const generateMockOrders = (side: 'yes' | 'no', market: Market): OrderbookOrder[] => {
    const basePrice = side === 'yes' ? market.yesPrice : market.noPrice;
    const orders: OrderbookOrder[] = [];
    
    for (let i = 0; i < 8; i++) {
      const priceVariation = side === 'yes' ? -0.5 * i : 0.5 * i;
      const price = Math.max(0.5, Math.min(9.5, basePrice + priceVariation));
      const quantity = Math.floor(Math.random() * 5000) + 500;
      
      orders.push({
        id: `${side}-${i}`,
        price: parseFloat(price.toFixed(1)),
        quantity,
        total: price * quantity,
        users: Math.floor(Math.random() * 100) + 10,
        timestamp: new Date(Date.now() - Math.random() * 3600000)
      });
    }
    
    return orders.sort((a, b) => side === 'yes' ? b.price - a.price : a.price - b.price);
  };

  const yesOrders = generateMockOrders('yes', currentMarket);
  const noOrders = generateMockOrders('no', currentMarket);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // In real app, this would trigger API refresh
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Update current market when selectedMarket changes
  useEffect(() => {
    if (selectedMarket) {
      setCurrentMarket(selectedMarket);
    }
  }, [selectedMarket]);

  const maxQuantity = Math.max(
    Math.max(...yesOrders.map(o => o.quantity)),
    Math.max(...noOrders.map(o => o.quantity))
  );

  const getDepthPercentage = (quantity: number) => {
    return (quantity / maxQuantity) * 100;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const totalYesVolume = yesOrders.reduce((sum, order) => sum + order.total, 0);
  const totalNoVolume = noOrders.reduce((sum, order) => sum + order.total, 0);
  const totalUsers = [...yesOrders, ...noOrders].reduce((sum, order) => sum + order.users, 0);

  const filteredMarkets = availableMarkets.filter(market => 
    market.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    market.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarketChange = (market: Market) => {
    setCurrentMarket(market);
    if (onMarketSelect) {
      onMarketSelect(market);
    }
  };

  const handleRefresh = () => {
    setLastUpdate(new Date());
    // In real app, this would trigger API refresh
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closing_soon': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Book</h1>
            <p className="text-gray-600">Real-time market depth and order flow</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-2 rounded-lg border">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span>Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
            >
              {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
            </Button>
          </div>
        </div>

        {/* Market Selector */}
        <Card className="p-6 bg-white border-0 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Select Market</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMarkets.map((market) => (
              <div
                key={market.id}
                onClick={() => handleMarketChange(market)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  currentMarket.id === market.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {market.category}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(market.status)}`}>
                      {market.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className={`text-sm font-medium ${
                    market.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {market.change >= 0 ? '+' : ''}{market.changePercent.toFixed(1)}%
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {market.title}
                </h3>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-3">
                    <span className="text-blue-600 font-medium">Yes ₹{market.yesPrice.toFixed(1)}</span>
                    <span className="text-gray-600 font-medium">No ₹{market.noPrice.toFixed(1)}</span>
                  </div>
                  <div className="text-gray-500">
                    Vol: ₹{formatNumber(market.volume24h)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Current Market Info */}
        <Card className="p-6 bg-white border-0 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {currentMarket.category}
                </Badge>
                <Badge className={`text-xs ${getStatusColor(currentMarket.status)}`}>
                  {currentMarket.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <div className="flex items-center text-xs text-gray-500">
                  <User className="h-3 w-3 mr-1" />
                  {formatNumber(currentMarket.totalTraders)} traders
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {currentMarket.title}
              </h2>
              
              {currentMarket.description && (
                <p className="text-gray-600 text-sm mb-3">{currentMarket.description}</p>
              )}
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>Expires: {currentMarket.expiryDate.toLocaleDateString()}</span>
                <span>24h Volume: ₹{formatNumber(currentMarket.volume24h)}</span>
                <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Last Price</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{currentMarket.lastPrice.toFixed(1)}
                </span>
                <div className={`flex items-center text-sm font-medium ${
                  currentMarket.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentMarket.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {currentMarket.changePercent >= 0 ? '+' : ''}{currentMarket.changePercent.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Total Volume</p>
              <p className="text-lg font-semibold text-gray-900">
                ₹{formatNumber(totalYesVolume + totalNoVolume)}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Active Orders</p>
              <p className="text-lg font-semibold text-gray-900">
                {yesOrders.length + noOrders.length}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Best Yes</p>
              <p className="text-lg font-semibold text-blue-600">
                ₹{yesOrders[0]?.price.toFixed(1)}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Best No</p>
              <p className="text-lg font-semibold text-gray-600">
                ₹{noOrders[0]?.price.toFixed(1)}
              </p>
            </div>
          </div>
        </Card>

        {/* Orderbook Controls */}
        <Card className="p-4 bg-white border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">View Mode:</span>
              </div>
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  onClick={() => setViewMode('combined')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'combined'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Combined
                </button>
                <button
                  onClick={() => setViewMode('yes')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'yes'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  YES Only
                </button>
                <button
                  onClick={() => setViewMode('no')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'no'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  NO Only
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Filter:</span>
              </div>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="best">Best 5</option>
                <option value="recent">Recent</option>
              </select>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Refresh:</span>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1s</option>
                  <option value={5}>5s</option>
                  <option value={10}>10s</option>
                  <option value={30}>30s</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Orderbook */}
        <Card className="bg-white border-0 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Market Depth</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Volume2 className="h-4 w-4" />
                  <span>Live Orders</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Real-time</span>
                </div>
              </div>
            </div>
          </div>

          {viewMode === 'combined' ? (
            <div className="grid lg:grid-cols-2">
              {/* YES Orders */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-blue-600">YES Orders</h4>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    ₹{formatNumber(totalYesVolume)}
                  </Badge>
                </div>

                {/* Header */}
                <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 font-medium mb-2 pb-2 border-b border-gray-100">
                  <div>Price</div>
                  <div className="text-right">Qty</div>
                  <div className="text-right">Total</div>
                  <div className="text-right">Users</div>
                </div>

                {/* YES Orders List */}
                <div className="space-y-1">
                  {yesOrders.slice(0, priceFilter === 'best' ? 5 : yesOrders.length).map((order, index) => (
                    <div key={order.id} className="relative group">
                      {/* Depth Bar */}
                      <div 
                        className="absolute left-0 top-0 h-full bg-blue-50 opacity-60 transition-all duration-300"
                        style={{ width: `${getDepthPercentage(order.quantity)}%` }}
                      />
                      
                      {/* Order Row */}
                      <div className="relative grid grid-cols-4 gap-2 py-1.5 text-sm hover:bg-blue-50 cursor-pointer transition-colors">
                        <div className="font-medium text-blue-600">
                          ₹{order.price.toFixed(1)}
                        </div>
                        <div className="text-right text-gray-900">
                          {formatNumber(order.quantity)}
                        </div>
                        <div className="text-right text-gray-600">
                          ₹{formatNumber(order.total)}
                        </div>
                        <div className="text-right text-gray-500 text-xs">
                          {order.users}
                        </div>
                      </div>
                      
                      {/* Hover tooltip */}
                      <div className="absolute left-full ml-2 top-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                        {order.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NO Orders */}
              <div className="p-4 border-l border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-600">NO Orders</h4>
                  <Badge className="bg-gray-100 text-gray-800 text-xs">
                    ₹{formatNumber(totalNoVolume)}
                  </Badge>
                </div>

                {/* Header */}
                <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 font-medium mb-2 pb-2 border-b border-gray-100">
                  <div>Price</div>
                  <div className="text-right">Qty</div>
                  <div className="text-right">Total</div>
                  <div className="text-right">Users</div>
                </div>

                {/* NO Orders List */}
                <div className="space-y-1">
                  {noOrders.slice(0, priceFilter === 'best' ? 5 : noOrders.length).map((order, index) => (
                    <div key={order.id} className="relative group">
                      {/* Depth Bar */}
                      <div 
                        className="absolute left-0 top-0 h-full bg-gray-100 opacity-60 transition-all duration-300"
                        style={{ width: `${getDepthPercentage(order.quantity)}%` }}
                      />
                      
                      {/* Order Row */}
                      <div className="relative grid grid-cols-4 gap-2 py-1.5 text-sm hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="font-medium text-gray-700">
                          ₹{order.price.toFixed(1)}
                        </div>
                        <div className="text-right text-gray-900">
                          {formatNumber(order.quantity)}
                        </div>
                        <div className="text-right text-gray-600">
                          ₹{formatNumber(order.total)}
                        </div>
                        <div className="text-right text-gray-500 text-xs">
                          {order.users}
                        </div>
                      </div>
                      
                      {/* Hover tooltip */}
                      <div className="absolute left-full ml-2 top-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                        {order.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Single Side View */
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-semibold ${viewMode === 'yes' ? 'text-blue-600' : 'text-gray-600'}`}>
                  {viewMode === 'yes' ? 'YES' : 'NO'} Orders
                </h4>
                <Badge className={`text-xs ${viewMode === 'yes' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  ₹{formatNumber(viewMode === 'yes' ? totalYesVolume : totalNoVolume)}
                </Badge>
              </div>

              {/* Header */}
              <div className="grid grid-cols-5 gap-2 text-xs text-gray-500 font-medium mb-2 pb-2 border-b border-gray-100">
                <div>Price</div>
                <div className="text-right">Qty</div>
                <div className="text-right">Total</div>
                <div className="text-right">Users</div>
                <div className="text-right">Time</div>
              </div>

              {/* Orders List */}
              <div className="space-y-1">
                {(viewMode === 'yes' ? yesOrders : noOrders)
                  .slice(0, priceFilter === 'best' ? 5 : undefined)
                  .map((order, index) => (
                    <div key={order.id} className="relative group">
                      {/* Depth Bar */}
                      <div 
                        className={`absolute left-0 top-0 h-full opacity-60 transition-all duration-300 ${
                          viewMode === 'yes' ? 'bg-blue-50' : 'bg-gray-100'
                        }`}
                        style={{ width: `${getDepthPercentage(order.quantity)}%` }}
                      />
                      
                      {/* Order Row */}
                      <div className={`relative grid grid-cols-5 gap-2 py-2 text-sm cursor-pointer transition-colors ${
                        viewMode === 'yes' ? 'hover:bg-blue-50' : 'hover:bg-gray-50'
                      }`}>
                        <div className={`font-medium ${viewMode === 'yes' ? 'text-blue-600' : 'text-gray-700'}`}>
                          ₹{order.price.toFixed(1)}
                        </div>
                        <div className="text-right text-gray-900">
                          {formatNumber(order.quantity)}
                        </div>
                        <div className="text-right text-gray-600">
                          ₹{formatNumber(order.total)}
                        </div>
                        <div className="text-right text-gray-500 text-xs">
                          {order.users}
                        </div>
                        <div className="text-right text-gray-400 text-xs">
                          {order.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Order Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{formatNumber(currentMarket.totalTraders)} active traders</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Activity className="h-4 w-4" />
                  <span>{yesOrders.length + noOrders.length} orders</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRefresh}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-gray-500">Best Yes Bid</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">₹{yesOrders[0]?.price.toFixed(1)}</p>
              <p className="text-xs text-gray-500 mt-1">{formatNumber(yesOrders[0]?.quantity)} qty</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-gray-600" />
                <p className="text-sm text-gray-500">Best No Bid</p>
              </div>
              <p className="text-2xl font-bold text-gray-700">₹{noOrders[0]?.price.toFixed(1)}</p>
              <p className="text-xs text-gray-500 mt-1">{formatNumber(noOrders[0]?.quantity)} qty</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart className="h-4 w-4 text-purple-600" />
                <p className="text-sm text-gray-500">Spread</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(noOrders[0]?.price - yesOrders[0]?.price).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(((noOrders[0]?.price - yesOrders[0]?.price) / yesOrders[0]?.price) * 100).toFixed(1)}%
              </p>
            </div>
          </Card>
          
          <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <p className="text-sm text-gray-500">Mid Price</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ₹{((noOrders[0]?.price + yesOrders[0]?.price) / 2).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Market average</p>
            </div>
          </Card>
        </div>

        {/* Trading Actions */}
        <Card className="p-6 bg-white border-0 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Zap className="h-4 w-4" />
              <span>Instant trading</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Buy YES ₹{yesOrders[0]?.price.toFixed(1)}
            </Button>
            
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <TrendingDown className="h-4 w-4 mr-2" />
              Buy NO ₹{noOrders[0]?.price.toFixed(1)}
            </Button>
            
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Watch Market
            </Button>
            
            <Button variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              Set Alert
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 