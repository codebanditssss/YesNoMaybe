'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRealtimeOrderbook } from "@/hooks/useRealtimeOrderbook";
import { 
  TrendingUp, 
  TrendingDown,
  User,
  RefreshCw,
  Filter,
  BookOpen,
  Activity,
  BarChart,
  Target,
  Loader2,
  Radio,
} from "lucide-react";

import type { Market } from "@/hooks/useMarkets";

interface OrderLevel {
  price: number;
  quantity: number;
  total: number;
  orders: Array<{
    id: string;
    isNew?: boolean;
    isUpdated?: boolean;
    timestamp: string;
  }>;
}

interface OrderbookProps {
  selectedMarket?: Market | null;
  onMarketSelect?: (market: Market) => void;
  isTransitioning?: boolean;
  isPending?: boolean;
}

export function Orderbook({ selectedMarket, onMarketSelect, isTransitioning, isPending }: OrderbookProps) {
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [viewMode, setViewMode] = useState<'combined' | 'yes' | 'no'>('combined');
  const [priceFilter, setPriceFilter] = useState<'all' | 'best' | 'recent'>('all');
  const [yesBidsStartIndex, setYesBidsStartIndex] = useState(0);
  const [noAsksStartIndex, setNoAsksStartIndex] = useState(0);
  const [previousData, setPreviousData] = useState<any>(null);

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
    marketId: selectedMarket?.id,
    autoRefresh: !isTransitioning && !isPending && autoRefresh,
    refreshInterval: refreshInterval * 1000
  });

  // Store previous data when transitioning starts
  useEffect(() => {
    if (isPending && previousData === null) {
      setPreviousData({
        yesBids,
        noAsks,
        bestPrices,
        marketStats,
        spread,
        spreadPercentage,
        realtimeUpdates
      });
    } else if (!isPending && !isTransitioning) {
      setPreviousData(null);
    }
  }, [isPending, isTransitioning, yesBids, noAsks, bestPrices, marketStats, spread, spreadPercentage, realtimeUpdates]);

  // Use previous data during transition
  const displayData = (isPending || isTransitioning) && previousData ? previousData : {
    yesBids,
    noAsks,
    bestPrices,
    marketStats,
    spread,
    spreadPercentage,
    realtimeUpdates
  };

  // Auto-rotate orders every 3 seconds
  useEffect(() => {
    if (isTransitioning || isPending) return; // Don't rotate during any transition state

    const rotateInterval = setInterval(() => {
      if (displayData.yesBids?.length > 5) {
        setYesBidsStartIndex((prev) => (prev + 1) % (displayData.yesBids.length - 4));
      }
      if (displayData.noAsks?.length > 5) {
        setNoAsksStartIndex((prev) => (prev + 1) % (displayData.noAsks.length - 4));
      }
    }, 3000);

    return () => clearInterval(rotateInterval);
  }, [displayData.yesBids?.length, displayData.noAsks?.length, isTransitioning, isPending]);

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
  const totalUsers = yesBids.reduce((sum: number, level: any) => sum + level.orders.length, 0) + 
                     noAsks.reduce((sum: number, level: any) => sum + level.orders.length, 0);

  const handleRefresh = () => {
    refresh();
  };

  // Calculate depth percentage
  const calculateDepthPercentage = (total: number) => {
    const maxTotal = Math.max(
      ...(yesBids || []).map((level: OrderLevel) => level.total),
      ...(noAsks || []).map((level: OrderLevel) => level.total)
    );
    return maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  };

  // Get visible orders based on current index and filter
  const getVisibleOrders = (orders: OrderLevel[]) => {
    if (!orders?.length) return [];
    
    let filteredOrders = orders;

    // Apply price filter
    switch (priceFilter) {
      case 'best':
        // Only show orders at the best price level
        const bestPrice = orders[0]?.price;
        filteredOrders = orders.filter(order => order.price === bestPrice);
        break;
      case 'recent':
        // Sort by timestamp and take most recent
        filteredOrders = [...orders].sort((a, b) => {
          const latestA = Math.max(...a.orders.map(o => new Date(o.timestamp).getTime()));
          const latestB = Math.max(...b.orders.map(o => new Date(o.timestamp).getTime()));
          return latestB - latestA;
        }).slice(0, 5);
        break;
      default: // 'all'
        // Show paginated view for all orders
        filteredOrders = orders.slice(0, 5);
        break;
    }

    return filteredOrders;
  };

  // Render order rows with filtering
  const renderOrderRows = (type: 'yes' | 'no') => {
    const orders = type === 'yes' ? displayData.yesBids : displayData.noAsks;
    
    if (!orders?.length) {
      return (
        <tr>
          <td colSpan={4} className="text-center py-4 text-gray-500">
            No {type.toUpperCase()} orders
          </td>
        </tr>
      );
    }

    const visibleOrders = getVisibleOrders(orders);

    return visibleOrders.map((level: OrderLevel, index: number) => {
      const depthPercentage = calculateDepthPercentage(level.total);
      const isNewOrder = level.orders.some(o => o.isNew);
      const isUpdated = level.orders.some(o => o.isUpdated);
      
      return (
        <tr 
          key={`${level.price}-${index}`}
          className={`relative ${
            isNewOrder ? 'animate-highlight-green' :
            isUpdated ? 'animate-highlight-yellow' : ''
          }`}
        >
          <td className="py-2 pl-4">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${type === 'yes' ? 'text-blue-600' : 'text-gray-900'}`}>
                ₹{formatPrice(level.price)}
              </span>
              {level.orders.length > 1 && (
                <Badge variant="outline" className="text-xs">
                  {level.orders.length}
                </Badge>
              )}
            </div>
          </td>
          <td className="py-2 text-right">{formatNumber(level.quantity)}</td>
          <td className="py-2 text-right text-gray-500">{formatNumber(level.total)}</td>
          <td className="py-2 pr-4">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-full rounded-full ${type === 'yes' ? 'bg-blue-600' : 'bg-gray-600'}`}
                style={{ width: `${depthPercentage}%` }}
              />
            </div>
          </td>
        </tr>
      );
    });
  };

  // Market stats cards array for DRY rendering
  const marketStatsCards = [
    {
      label: "Total Liquidity",
      value: displayData?.marketStats ? formatNumber(displayData.marketStats.totalLiquidity) : '0',
      valueClass: "text-gray-900",
      icon: <Activity className="h-4 w-4 text-gray-600" />,
    }
  ];

  // Orderbook stat cards array for DRY rendering
  const orderbookCards = [
    {
      icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
      label: "Best Yes Bid",
      value: displayData?.bestPrices?.bestYesBid ? `₹${formatPrice(displayData.bestPrices.bestYesBid)}` : 'N/A',
      valueClass: "text-2xl font-bold text-blue-600",
      subtext: displayData?.yesBids?.[0] ? `${formatNumber(displayData.yesBids[0].quantity)} qty` : 'No orders',
      subtextClass: "text-xs text-gray-500 mt-1",
    },
    {
      icon: <TrendingDown className="h-4 w-4 text-gray-600" />,
      label: "Best No Bid",
      value: displayData?.bestPrices?.bestNoAsk ? `₹${formatPrice(displayData.bestPrices.bestNoAsk)}` : 'N/A',
      valueClass: "text-2xl font-bold text-gray-700",
      subtext: displayData?.noAsks?.[0] ? `${formatNumber(displayData.noAsks[0].quantity)} qty` : 'No orders',
      subtextClass: "text-xs text-gray-500 mt-1",
    },
    {
      icon: <BarChart className="h-4 w-4 text-purple-600" />,
      label: "Spread",
      value: displayData?.spread ? `₹${(displayData.spread / 10).toFixed(1)}` : 'N/A',
      valueClass: "text-2xl font-bold text-gray-900",
      subtext: displayData?.spreadPercentage ? `${displayData.spreadPercentage.toFixed(1)}%` : 'No spread',
      subtextClass: "text-xs text-gray-500 mt-1",
    },
    {
      icon: <Target className="h-4 w-4 text-green-600" />,
      label: "Mid Price",
      value: displayData?.bestPrices?.midPrice ? `₹${(displayData.bestPrices.midPrice / 10).toFixed(1)}` : 'N/A',
      valueClass: "text-2xl font-bold text-gray-900",
      subtext: "Market average",
      subtextClass: "text-xs text-gray-500 mt-1",
    },
  ];

  if (!selectedMarket) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Select a market to view orderbook</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Top Bar with Liquidity and Refresh */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600">Total Liquidity:</span>
          <span className="text-sm font-semibold">
            {displayData?.marketStats ? formatNumber(displayData.marketStats.totalLiquidity) : '0'}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-2"
          disabled={orderbookLoading || isTransitioning}
        >
          <RefreshCw className={`h-4 w-4 ${orderbookLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* View Mode and Filter Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'combined' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('combined')}
              >
                Combined
              </Button>
              <Button
                variant={viewMode === 'yes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('yes')}
              >
                YES Only
              </Button>
              <Button
                variant={viewMode === 'no' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('no')}
              >
                NO Only
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600">Filter:</span>
          <div className="flex gap-2">
            <Button
              variant={priceFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPriceFilter('all')}
            >
              All Orders
            </Button>
            <Button
              variant={priceFilter === 'best' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPriceFilter('best')}
            >
              Best Prices
            </Button>
            <Button
              variant={priceFilter === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPriceFilter('recent')}
            >
              Recent
            </Button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {orderbookCards.map((card, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {card.icon}
              <span className="text-sm text-gray-600">{card.label}</span>
            </div>
            <div className={card.valueClass}>{card.value}</div>
            <div className={card.subtextClass}>{card.subtext}</div>
          </Card>
        ))}
      </div>

      {/* Orderbook */}
      <Card className="bg-white border-0 shadow-sm overflow-hidden">
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
              <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 font-medium mb-2 pb-2 border-b border-gray-500">
                <div>Price</div>
                <div className="text-right">Qty</div>
                <div className="text-right">Total</div>
                <div className="text-right">Users</div>
              </div>

              {/* YES Orders List with auto-rotation */}
              <div className="space-y-1 h-[200px] overflow-hidden">
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
                  <div className="transition-all duration-500 ease-in-out">
                    {getVisibleOrders(yesBids).map((level, index) => (
                      <div key={`yes-${level.price}`} className="relative group">
                        {/* Depth Bar */}
                        <div 
                          className="absolute left-0 top-0 h-full bg-blue-50 opacity-60 transition-all duration-300"
                          style={{ width: `${calculateDepthPercentage(level.quantity)}%` }}
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* NO Orders */}
            <div className="p-4 border-l border-gray-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-600">NO Orders</h4>
                <Badge className="bg-gray-100 text-gray-800 text-xs">
                  ₹{formatNumber(totalNoVolume)}
                </Badge>
              </div>

              {/* Header */}
              <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 font-medium mb-2 pb-2 border-b border-gray-500">
                <div>Price</div>
                <div className="text-right">Qty</div>
                <div className="text-right">Total</div>
                <div className="text-right">Users</div>
              </div>

              {/* NO Orders List with auto-rotation */}
              <div className="space-y-1 h-[200px] overflow-hidden">
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
                  <div className="transition-all duration-500 ease-in-out">
                    {getVisibleOrders(noAsks).map((level, index) => (
                      <div key={`no-${level.price}`} className="relative group">
                        {/* Depth Bar */}
                        <div 
                          className="absolute left-0 top-0 h-full bg-gray-100 opacity-60 transition-all duration-300"
                          style={{ width: `${calculateDepthPercentage(level.quantity)}%` }}
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Single Side View with auto-rotation */
          <div className="p-6 border-1 border border-gray-20">
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-semibold ${viewMode === 'yes' ? 'text-blue-600' : 'text-gray-600'}`}>
                {viewMode === 'yes' ? 'YES' : 'NO'} Orders
              </h4>
              <Badge className={`text-xs ${viewMode === 'yes' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                ₹{formatNumber(viewMode === 'yes' ? totalYesVolume : totalNoVolume)}
              </Badge>
            </div>

            {/* Header */}
            <div className="grid grid-cols-5 gap-2 text-xs text-gray-500 font-medium mb-2 pb-2 border-b border-gray-500">
              <div>Price</div>
              <div className="text-right">Qty</div>
              <div className="text-right">Total</div>
              <div className="text-right">Users</div>
              <div className="text-right">Orders</div>
            </div>

            {/* Orders List with auto-rotation */}
            <div className="space-y-1 h-[250px] overflow-hidden">
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
                <div className="transition-all duration-500 ease-in-out">
                  {getVisibleOrders(
                    viewMode === 'yes' ? yesBids : noAsks
                  ).map((level, index) => (
                    <div key={`${viewMode}-${level.price}`} className="relative group">
                      {/* Depth Bar */}
                      <div 
                        className={`absolute left-0 top-0 h-full opacity-60 transition-all duration-300 ${
                          viewMode === 'yes' ? 'bg-blue-50' : 'bg-gray-100'
                        }`}
                        style={{ width: `${calculateDepthPercentage(level.quantity)}%` }}
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
                          {level.orders.length} orders
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{formatNumber(totalUsers)} active orders</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>{yesBids.length + noAsks.length} order levels</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 