'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMarkets } from "@/hooks/useMarkets";
import { useRealtimeOrderbook } from "@/hooks/useRealtimeOrderbook";
import { 
  TrendingUp, 
  TrendingDown,
  Clock,
  User,
  RefreshCw,
  Filter,
  Search,
  BookOpen,
  Activity,
  BarChart,
  Target,
  Loader2,
  Radio,
} from "lucide-react";

import type { Market } from "@/hooks/useMarkets";
import { SelectDropdown } from "@/components/ui/select-dropdown";

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

  // Fetch available markets
  const { markets, loading: marketsLoading } = useMarkets();

  // Current selected market
  const [currentMarket, setCurrentMarket] = useState<Market | null>(
    selectedMarket || null
  );

  // Set default market when markets load
  useEffect(() => {
    if (!currentMarket && markets.length > 0) {
      setCurrentMarket(selectedMarket || markets[0]);
    }
  }, [markets, currentMarket, selectedMarket]);

  // Fetch orderbook data with real-time updates
  const {
    orderbook,
    marketInfo,
    yesBids,
    noAsks,
    recentTrades,
    loading: orderbookLoading,
    error: orderbookError,
    refresh,
    formatPrice,
    getDepthPercentage,
    bestPrices,
    marketStats,
    spread,
    spreadPercentage,
    realtimeUpdates
  } = useRealtimeOrderbook({
    marketId: currentMarket?.id,
    autoRefresh,
    refreshInterval: refreshInterval * 1000
  });

  // Update current market when selectedMarket changes
  useEffect(() => {
    if (selectedMarket) {
      setCurrentMarket(selectedMarket);
    }
  }, [selectedMarket]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Calculate totals from real data
  const totalYesVolume = marketStats?.yesLiquidity || 0;
  const totalNoVolume = marketStats?.noLiquidity || 0;
  const totalUsers = yesBids.reduce((sum, level) => sum + level.orders.length, 0) + 
                     noAsks.reduce((sum, level) => sum + level.orders.length, 0);

  const filteredMarkets = markets.filter(market => 
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
    refresh();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closing_soon': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // View mode for market selector
  const [marketViewMode, setMarketViewMode] = useState<'list' | 'grid'>('list');

  // Market stats cards array for DRY rendering
  const marketStatsCards = [
    {
      label: "Total Liquidity",
      value: marketStats ? formatNumber(marketStats.totalLiquidity) : '0',
      valueClass: "text-gray-900",
    },
    {
      label: "Active Orders",
      value: yesBids.length + noAsks.length,
      valueClass: "text-gray-900",
    },
    {
      label: "Best Yes",
      value: bestPrices?.bestYesBid ? `₹${formatPrice(bestPrices.bestYesBid)}` : 'N/A',
      valueClass: "text-blue-600",
    },
    {
      label: "Best No",
      value: bestPrices?.bestNoAsk ? `₹${formatPrice(bestPrices.bestNoAsk)}` : 'N/A',
      valueClass: "text-gray-600",
    },
  ];

  // Orderbook stat cards array for DRY rendering
  const orderbookCards = [
    {
      icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
      label: "Best Yes Bid",
      value: bestPrices?.bestYesBid ? `₹${formatPrice(bestPrices.bestYesBid)}` : 'N/A',
      valueClass: "text-2xl font-bold text-blue-600",
      subtext: yesBids[0] ? `${formatNumber(yesBids[0].quantity)} qty` : 'No orders',
      subtextClass: "text-xs text-gray-500 mt-1",
    },
    {
      icon: <TrendingDown className="h-4 w-4 text-gray-600" />,
      label: "Best No Bid",
      value: bestPrices?.bestNoAsk ? `₹${formatPrice(bestPrices.bestNoAsk)}` : 'N/A',
      valueClass: "text-2xl font-bold text-gray-700",
      subtext: noAsks[0] ? `${formatNumber(noAsks[0].quantity)} qty` : 'No orders',
      subtextClass: "text-xs text-gray-500 mt-1",
    },
    {
      icon: <BarChart className="h-4 w-4 text-purple-600" />,
      label: "Spread",
      value: spread ? `₹${(spread / 10).toFixed(1)}` : 'N/A',
      valueClass: "text-2xl font-bold text-gray-900",
      subtext: spreadPercentage ? `${spreadPercentage.toFixed(1)}%` : 'No spread',
      subtextClass: "text-xs text-gray-500 mt-1",
    },
    {
      icon: <Target className="h-4 w-4 text-green-600" />,
      label: "Mid Price",
      value: bestPrices?.midPrice ? `₹${(bestPrices.midPrice / 10).toFixed(1)}` : 'N/A',
      valueClass: "text-2xl font-bold text-gray-900",
      subtext: "Market average",
      subtextClass: "text-xs text-gray-500 mt-1",
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Book</h1>
            <p className="text-gray-600">Real-time market depth and order flow</p>
          </div>
          
          {/* Real-time status indicator */}
          <div className="flex items-center gap-2">
            <Radio className={`h-4 w-4 ${realtimeUpdates.type ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-600">
              {realtimeUpdates.type 
                ? `Last update: ${realtimeUpdates.type} (${new Date(realtimeUpdates.lastUpdate).toLocaleTimeString()})`
                : 'Waiting for updates...'}
            </span>
          </div>
        </div>

        {/* Market Selector */}

        {/* Current Market Info */}

        {/* Orderbook Controls */}
        <Card className="p-4 bg-white border-0 shadow-sm border-1 border border-gray-300 rounded-lg ">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">View Mode:</span>
              </div>
              <div className="flex rounded-lg bg-gray-100 p-1 border-1 border border-gray-300 rounded-lg ">
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
              <SelectDropdown
                options={[
                  { value: "all", label: "All Orders" },
                  { value: "best", label: "Best 5" },
                  { value: "recent", label: "Recent" },
                ]}
                selected={priceFilter}
                onSelect={val => setPriceFilter(val as any)}
              />
              
              {/* <div className="flex items-center gap-2">
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
              </div> */}
            </div>
          </div>
        </Card>

        {/* Orderbook */}
        <Card className="bg-white border-1 border border-gray-300 rounded-lg  shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Market Depth</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
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
            <div className="grid lg:grid-cols-2 border-1 border border-gray-200">
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
                  {orderbookLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="ml-2 text-sm text-gray-600">Loading orders...</span>
                    </div>
                  ) : yesBids.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No YES orders available</p>
                    </div>
                  ) : (
                    yesBids.slice(0, priceFilter === 'best' ? 5 : yesBids.length).map((level, index) => (
                      <div key={`yes-${level.price}`} className="relative group">
                      {/* Depth Bar */}
                      <div 
                        className="absolute left-0 top-0 h-full bg-blue-50 opacity-60 transition-all duration-300"
                          style={{ width: `${getDepthPercentage(level.quantity)}%` }}
                      />
                      
                      {/* Order Row */}
                      <div className="relative grid grid-cols-4 gap-2 py-1.5 text-sm hover:bg-blue-50 cursor-pointer transition-colors">
                        <div className="font-medium text-blue-600">
                            ₹{formatPrice(level.price)}
                        </div>
                        <div className="text-right text-gray-900">
                            {formatNumber(level.quantity)}
                        </div>
                        <div className="text-right text-gray-600">
                            ₹{formatNumber(level.quantity * level.price / 100)}
                        </div>
                        <div className="text-right text-gray-500 text-xs">
                            {level.orders.length}
                        </div>
                      </div>
                      
                      {/* Hover tooltip */}
                      <div className="absolute left-full ml-2 top-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                          {level.orders.map(order => order.username).join(', ')}
                        </div>
                      </div>
                    ))
                  )}
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
                  {orderbookLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                      <span className="ml-2 text-sm text-gray-600">Loading orders...</span>
                    </div>
                  ) : noAsks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No NO orders available</p>
                    </div>
                  ) : (
                    noAsks.slice(0, priceFilter === 'best' ? 5 : noAsks.length).map((level, index) => (
                      <div key={`no-${level.price}`} className="relative group">
                      {/* Depth Bar */}
                      <div 
                        className="absolute left-0 top-0 h-full bg-gray-100 opacity-60 transition-all duration-300"
                          style={{ width: `${getDepthPercentage(level.quantity)}%` }}
                      />
                      
                      {/* Order Row */}
                      <div className="relative grid grid-cols-4 gap-2 py-1.5 text-sm hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="font-medium text-gray-700">
                            ₹{formatPrice(level.price)}
                        </div>
                        <div className="text-right text-gray-900">
                            {formatNumber(level.quantity)}
                        </div>
                        <div className="text-right text-gray-600">
                            ₹{formatNumber(level.quantity * level.price / 100)}
                        </div>
                        <div className="text-right text-gray-500 text-xs">
                            {level.orders.length}
                        </div>
                      </div>
                      
                      {/* Hover tooltip */}
                      <div className="absolute left-full ml-2 top-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                          {level.orders.map(order => order.username).join(', ')}
                        </div>
                      </div>
                    ))
                  )}
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
                {orderbookLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                    <span className="ml-2 text-sm text-gray-600">Loading orders...</span>
                  </div>
                ) : (viewMode === 'yes' ? yesBids : noAsks).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No {viewMode.toUpperCase()} orders available</p>
                  </div>
                ) : (
                  (viewMode === 'yes' ? yesBids : noAsks)
                  .slice(0, priceFilter === 'best' ? 5 : undefined)
                    .map((level, index) => (
                      <div key={`${viewMode}-${level.price}`} className="relative group">
                      {/* Depth Bar */}
                      <div 
                        className={`absolute left-0 top-0 h-full opacity-60 transition-all duration-300 ${
                          viewMode === 'yes' ? 'bg-blue-50' : 'bg-gray-100'
                        }`}
                          style={{ width: `${getDepthPercentage(level.quantity)}%` }}
                      />
                      
                      {/* Order Row */}
                      <div className={`relative grid grid-cols-5 gap-2 py-2 text-sm cursor-pointer transition-colors ${
                        viewMode === 'yes' ? 'hover:bg-blue-50' : 'hover:bg-gray-50'
                      }`}>
                        <div className={`font-medium ${viewMode === 'yes' ? 'text-blue-600' : 'text-gray-700'}`}>
                            ₹{formatPrice(level.price)}
                        </div>
                        <div className="text-right text-gray-900">
                            {formatNumber(level.quantity)}
                        </div>
                        <div className="text-right text-gray-600">
                            ₹{formatNumber(level.quantity * level.price / 100)}
                        </div>
                        <div className="text-right text-gray-500 text-xs">
                            {level.orders.length}
                        </div>
                        <div className="text-right text-gray-400 text-xs">
                            {level.orders.map(order => order.username).join(', ')}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Order Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Updated: {orderbook ? new Date(orderbook.lastUpdated).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                  }) : 'Not loaded'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{formatNumber(totalUsers)} active orders</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Activity className="h-4 w-4" />
                  <span>{yesBids.length + noAsks.length} order levels</span>
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
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {orderbookCards.map((card, idx) => (
            <Card key={card.label} className="p-4 bg-white border-1 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {card.icon}
                  <p className="text-sm text-gray-500">{card.label}</p>
                </div>
                <p className={card.valueClass}>{card.value}</p>
                <p className={card.subtextClass}>{card.subtext}</p>
              </div>
            </Card>
          ))}
        </div>

        {currentMarket && (
        <Card className="p-6 bg-white border-1 border border-gray-300 rounded-lg shadow-sm flex-wrap">
            {orderbookError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{orderbookError}</p>
              </div>
            )}
            
          <div className="flex items-start justify-between mb-4 flex-wrap">
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
                    {formatNumber(totalUsers)} active orders
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {currentMarket.title}
              </h2>
              
              {currentMarket.description && (
                <p className="text-gray-600 text-sm mb-3">{currentMarket.description}</p>
              )}
              
              <div className="flex items-center gap-6 text-sm text-gray-500 flex-wrap">
                  <span>Expires: {new Date(currentMarket.expiryDate).toLocaleDateString()}</span>
                  <span>24h Volume: ₹{formatNumber(marketInfo?.volume24h || 0)}</span>
                  <span>Last update: {orderbook ? new Date(orderbook.lastUpdated).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                  }) : 'Not loaded'}</span>
              </div>
            </div>

            <div className="text-right">
                <p className="text-sm text-gray-500">Current Price</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900">
                    ₹{marketInfo ? (marketInfo.currentPrice / 10).toFixed(1) : currentMarket.yesPrice.toFixed(1)}
                </span>
                <div className={`flex items-center text-sm font-medium ${
                    (marketInfo?.priceChange24h || currentMarket.priceChange) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                    {(marketInfo?.priceChange24h || currentMarket.priceChange) >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                    {(marketInfo?.priceChange24h || currentMarket.priceChange) >= 0 ? '+' : ''}{(marketInfo?.priceChange24h || currentMarket.priceChange).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketStatsCards.map(card => (
              <div key={card.label} className="text-center p-3 bg-gray-50 border-1 border border-gray-300 rounded-lg ">
                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                <p className={`text-lg font-semibold ${card.valueClass}`}>{card.value}</p>
              </div>
            ))}
          </div>
        </Card>
        )}

        {/* Trading Actions */}
        
        <Card className="p-6 bg-white rounded-lg border-1 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Select Market</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
                />
              </div>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              {/* View Mode Toggle for market selector (Markets style) */}
              <div className="flex rounded-lg bg-gray-100 p-1 ml-0 sm:ml-2 w-full sm:w-auto justify-center">
                <button
                  onClick={() => setMarketViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${marketViewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  title="List View"
                >
                  <BookOpen className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setMarketViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${marketViewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  title="Grid View"
                >
                  <Target className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 my-2" />
          
          {marketsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading markets...</span>
            </div>
          ) : filteredMarkets.length === 0 ? (
            <Card className="p-12 bg-white border-0 shadow-sm">
              <div className="text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No markets found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria to find more markets.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              </div>
            </Card>
          ) : marketViewMode === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMarkets.map((market) => (
                <div
                  key={market.id}
                  onClick={() => handleMarketChange(market)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      currentMarket?.id === market.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {market.category}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(market.status)}`}>{market.status.replace('_', ' ').toUpperCase()}</Badge>
                    </div>
                    <div className={`text-sm font-medium ${
                        market.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {market.priceChange >= 0 ? '+' : ''}{market.priceChange.toFixed(1)}%
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
                        Vol: {market.volume}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets.map((market) => (
                <Card
                  key={market.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    currentMarket?.id === market.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                  onClick={() => handleMarketChange(market)}
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {market.category.charAt(0).toUpperCase() + market.category.slice(1)}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(market.status)}`}>{market.status.replace('_', ' ').toUpperCase()}</Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {market.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <div className="flex gap-3">
                        <span className="text-blue-600 font-medium">Yes ₹{market.yesPrice}</span>
                        <span className="text-gray-600 font-medium">No ₹{market.noPrice}</span>
                      </div>
                      <div className="text-gray-500">
                        Vol: {market.volume}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 