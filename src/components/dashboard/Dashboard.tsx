"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useMarkets } from "@/hooks/useMarkets";
import { useTradeHistory } from "@/hooks/useTradeHistory";
import { Portfolio } from "./Portfolio";
import { Markets } from "./Markets";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
  Loader2,
  ExternalLink,
  Clock,
  Percent,
  TrendingDown as Loss,
  PieChart,
  Calendar,
  Info
} from "lucide-react";

// Add type definition for stat
interface StatCardProps {
  stat: {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: any; // Using any for Lucide icons
    description: string;
    loading: boolean;
  };
}

type StatType = StatCardProps['stat'];

export function Dashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'dashboard' | 'portfolio' | 'markets'>('dashboard');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  // Fetch real portfolio data
  const { 
    portfolio, 
    loading: portfolioLoading, 
    error: portfolioError,
    refresh: refreshPortfolio,
    getTotalPnL,
    getPnLPercentage,
    getActivePositions
  } = usePortfolio({ 
    includeHistory: true,
    historyLimit: 10,
    autoRefresh: true 
  });

  // Fetch real markets data
  const { 
    markets, 
    loading: marketsLoading,
    error: marketsError,
    refetch: refreshMarkets
  } = useMarkets({ 
    featured: true,
    limit: 8
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize timestamp on client side only
  useEffect(() => {
    setMounted(true);
    setLastUpdate(new Date());
  }, []);

  // Calculate derived values
  const totalPnL = getTotalPnL();
  const pnlPercentage = getPnLPercentage();
  const activePositions = getActivePositions();

  // Portfolio performance metrics
  const portfolioStats: StatType[] = [
    {
      title: "Portfolio Value",
      value: portfolioLoading ? "Loading..." : (portfolio?.summary?.totalValue ? `₹${portfolio.summary.totalValue.toLocaleString()}` : "₹0"),
      change: portfolioLoading ? "Loading..." : ((pnlPercentage || 0) >= 0 ? `+${(pnlPercentage || 0).toFixed(2)}%` : `${(pnlPercentage || 0).toFixed(2)}%`),
      trend: portfolioLoading ? "neutral" : ((pnlPercentage || 0) >= 0 ? "up" : "down"),
      icon: DollarSign,
      description: "Total balance",
      loading: portfolioLoading
    },
    {
      title: "Today's P&L",
      value: portfolioLoading ? "Loading..." : ((totalPnL || 0) >= 0 ? `+₹${(totalPnL || 0).toLocaleString()}` : `-₹${Math.abs(totalPnL || 0).toLocaleString()}`),
      change: portfolioLoading ? "Loading..." : ((pnlPercentage || 0) >= 0 ? `+${(pnlPercentage || 0).toFixed(2)}%` : `${(pnlPercentage || 0).toFixed(2)}%`),
      trend: portfolioLoading ? "neutral" : ((totalPnL || 0) >= 0 ? "up" : "down"),
      icon: (totalPnL || 0) >= 0 ? TrendingUp : Loss,
      description: "Daily performance",
      loading: portfolioLoading
    },
    {
      title: "Active Positions",
      value: portfolioLoading ? "Loading..." : ((activePositions?.length || 0).toString()),
      change: portfolioLoading ? "Loading..." : ((activePositions?.length || 0) > 0 ? "Positions open" : "No positions"),
      trend: portfolioLoading ? "neutral" : ((activePositions?.length || 0) > 0 ? "neutral" : "down"),
      icon: Target,
      description: "Current trades",
      loading: portfolioLoading
    },
    {
      title: "Win Rate",
      value: portfolioLoading ? "Loading..." : `${(portfolio?.summary?.winRate || 0).toFixed(1)}%`,
      change: portfolioLoading ? "Loading..." : (portfolio?.balance?.total_trades ? `${portfolio.balance.total_trades} total trades` : "No trading history"),
      trend: portfolioLoading ? "neutral" : ((portfolio?.summary?.winRate || 0) > 50 ? "up" : "down"),
      icon: Percent,
      description: "Success ratio",
      loading: portfolioLoading
    }
  ];

  // Active positions with detailed info
  const transformedActivePositions = portfolioLoading ? [] : (activePositions || []).slice(0, 6).map((position: any) => {
    const pnl = (position.unrealizedPnL || 0) + (position.realizedPnL || 0);
    const pnlPercent = (position.totalInvested || 0) > 0 ? (pnl / (position.totalInvested || 1)) * 100 : 0;
    const totalShares = (position.yesShares || 0) + (position.noShares || 0);
    const isYesPosition = (position.yesShares || 0) > (position.noShares || 0);
    const avgPrice = (position.totalInvested || 0) > 0 && totalShares > 0 ? (position.totalInvested || 0) / totalShares : 0;
    
    return {
      title: position.marketTitle || 'Unknown Market',
      category: position.marketCategory?.charAt(0).toUpperCase() + position.marketCategory?.slice(1) || 'Other',
      position: isYesPosition ? "YES" : "NO",
      shares: totalShares,
      avgPrice: avgPrice.toFixed(2),
      invested: `₹${(position.totalInvested || 0).toLocaleString()}`,
      pnl: pnl >= 0 ? `+₹${Math.abs(pnl).toLocaleString()}` : `-₹${Math.abs(pnl).toLocaleString()}`,
      pnlPercent: pnlPercent >= 0 ? `+${Math.abs(pnlPercent).toFixed(1)}%` : `-${Math.abs(pnlPercent).toFixed(1)}%`,
      trend: pnl >= 0 ? "up" : "down"
    };
  });

  // Market opportunities
  const marketOpportunities = marketsLoading ? [] : (markets || []).slice(0, 8).map(market => ({
    title: market.title || 'Unknown Market',
    category: (market.category || 'other').charAt(0).toUpperCase() + (market.category || 'other').slice(1),
    volume: `₹${((market.volume24h || 0) / 100000).toFixed(1)}L`,
    yesPrice: market.yesPrice || 0,
    noPrice: market.noPrice || 0,
    change: (market.priceChange || 0) >= 0 ? `+${(market.priceChange || 0).toFixed(1)}%` : `${(market.priceChange || 0).toFixed(1)}%`,
    trend: (market.priceChange || 0) >= 0 ? "up" : "down",
    id: market.id
  }));

  const isLoading = portfolioLoading || marketsLoading;
  const hasError = portfolioError || marketsError;
  const hasActivePositions = transformedActivePositions.length > 0;

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    if (mounted) {
      setLastUpdate(new Date());
    }
    
    try {
      await Promise.all([
        refreshPortfolio(),
        refreshMarkets()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };



  // Loading skeleton for stats cards
  const StatCardSkeleton = () => (
    <Card className="p-4 sm:p-6 relative overflow-hidden">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-100 rounded-full"></div>
            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-24"></div>
          </div>
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-20"></div>
        </div>
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-32 mb-3"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-24"></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skeleton-shimmer"></div>
    </Card>
  );

  // Loading skeleton for positions
  const PositionSkeleton = () => (
    <div className="p-6 border border-gray-100 rounded-xl relative overflow-hidden">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gradient-to-br from-gray-200 to-gray-100 rounded-full"></div>
              <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-3/4"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-20"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-24"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-32"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-24"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-16"></div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skeleton-shimmer"></div>
    </div>
  );

  // Loading skeleton for market opportunities
  const MarketSkeleton = () => (
    <div className="p-6 border border-gray-100 rounded-xl relative overflow-hidden">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-3 flex-1">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-3/4"></div>
            <div className="flex items-center gap-3">
              <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-20"></div>
              <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-24"></div>
            </div>
          </div>
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-8"></div>
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-16"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-24"></div>
          </div>
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-20"></div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skeleton-shimmer"></div>
    </div>
  );

  // Update the stats card to handle loading states
  const StatCard = ({ stat }: StatCardProps) => (
    <Card className={`p-2 sm:p-3 bg-white border border-gray-200 ${stat.loading ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {stat.icon && <stat.icon className="h-4 w-4 text-gray-600" />}
          <span className="text-sm text-gray-600">{stat.title}</span>
        </div>
        {stat.loading ? (
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        ) : (
          <div className={`text-xs px-2 py-0.5 rounded ${
            stat.trend === 'up' ? 'text-green-700 bg-green-50' : 
            stat.trend === 'down' ? 'text-red-700 bg-red-50' : 'text-gray-700 bg-gray-50'
          }`}>
            {stat.change}
          </div>
        )}
      </div>
      {stat.loading ? (
        <div className="h-7 bg-gray-200 rounded w-24 mb-1"></div>
      ) : (
        <div className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{stat.value}</div>
      )}
      <div className="text-xs text-gray-500">{stat.description}</div>
    </Card>
  );

  // Update the portfolio metrics grid
  const PortfolioMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 flex-shrink-0">
      {portfolioStats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  );

  // Determine if we should show the loading state
  const showLoading = isLoading || !portfolio;
  const showEmptyState = !showLoading && !hasActivePositions;

  if (hasError) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
                <p className="text-sm text-red-600 mt-1">
                  {portfolioError || marketsError}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                className="ml-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Update the loading state layout
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-6">
            <div className="space-y-3">
              <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-32"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-48"></div>
            </div>
            <div className="h-9 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-28"></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-40"></div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-8"></div>
              </div>
              {[...Array(3)].map((_, i) => (
                <PositionSkeleton key={i} />
              ))}
            </div>
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <MarketSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 bg-white min-h-screen">
      <div className="w-full flex flex-col space-y-2 sm:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 flex-shrink-0">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {user?.email?.split('@')[0] || 'Trader'}
              {mounted && lastUpdate && (
                <> • Last updated: {lastUpdate.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit', 
                  hour12: true 
                })}</>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefreshAll}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isRefreshing ? "Loading..." : "Refresh Data"}
            </Button>
          </div>
        </div>

        {/* Portfolio Metrics */}
        <PortfolioMetrics />

        {/* Main Content */}
        <div className="flex-1">
          {showLoading ? (
            /* Loading State */
            <div className="space-y-4">
              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Loading Dashboard...</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <PositionSkeleton key={i} />
                  ))}
                </div>
              </Card>
            </div>
          ) : showEmptyState ? (
            /* Empty State */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
              {/* Portfolio Summary */}
              <Card className="bg-white border border-gray-200 flex-shrink-0">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Portfolio Summary</h2>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="text-center py-4">
                    <Target className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Start Trading</h3>
                    <p className="text-gray-600 mb-4">You have no active positions. Explore markets to find trading opportunities.</p>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">
                          {portfolio?.summary?.totalValue ? `₹${portfolio.summary.totalValue.toLocaleString()}` : "₹0"}
                        </div>
                        <div className="text-xs text-gray-600">Available Balance</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">
                          {portfolio?.balance?.total_trades || 0}
                        </div>
                        <div className="text-xs text-gray-600">Total Trades</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Getting Started */}
              <Card className="bg-white border border-gray-200 flex-shrink-0">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Getting Started</h3>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-700 text-xs font-bold">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Explore Markets</p>
                        <p className="text-xs text-blue-700">Browse trending prediction markets to find opportunities</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-700 text-xs font-bold">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-900">Make Predictions</p>
                        <p className="text-xs text-green-700">Buy YES or NO shares based on your research</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 p-2 bg-purple-50 rounded-lg">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-700 text-xs font-bold">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-900">Track Performance</p>
                        <p className="text-xs text-purple-700">Monitor your positions and profits in real-time</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            /* Active Positions Layout */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
              {/* Active Positions */}
              <div className="lg:col-span-2">
                <Card className="bg-white border border-gray-200">
                  <div className="p-3 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Active Positions</h2>
                      <Link href="/Portfolio" passHref>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4 text-blue-600" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="p-3 flex-1 overflow-y-auto">
                    <div className="space-y-2">
                      {transformedActivePositions.map((position, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <div className={`w-2 h-2 rounded-full ${
                                position.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className="text-sm font-medium text-gray-900">
                                {position.title.length > 50 ? position.title.substring(0, 50) + '...' : position.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span>{position.category}</span>
                              <span className={`px-2 py-1 rounded ${
                                position.position === 'YES' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
                              }`}>
                                {position.position}
                              </span>
                              <span>{position.shares} shares @ ₹{position.avgPrice}</span>
                              <span>Invested: {position.invested}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-semibold ${
                              position.trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {position.pnl}
                            </div>
                            <div className={`text-xs ${
                              position.trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {position.pnlPercent}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-2 sm:space-y-4">
                {/* Market Opportunities */}
                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm transition-shadow hover:shadow-lg">
                  <div className="p-4 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 rounded-full mr-2"></div>
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight">Market Opportunities</h3>
                    </div>
                    <Link href="/Markets" passHref>
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-5 w-5 text-blue-600" />
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="p-4 flex-1 overflow-y-auto">
                    {marketOpportunities.length > 0 ? (
                      <div className="space-y-4">
                        {marketOpportunities.slice(0, 4).map((market, index) => (
                          <div
                            key={index}
                            className="group bg-gray-50 border border-gray-100 rounded-lg p-4 flex flex-col gap-2 transition-all shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-base font-semibold text-gray-900 line-clamp-2 mb-1">
                                  {market.title.length > 35 ? market.title.substring(0, 35) + '...' : market.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{market.category}</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">Vol: {market.volume}</span>
                                </div>
                              </div>
                              <div className={`flex items-center gap-1 text-xs font-bold ${
                                market.trend === 'up' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {market.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                {market.change}
                              </div>
                            </div>
                            {/* <div className="flex gap-2 mt-2 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <span className="text-blue-600 font-medium">YES</span>
                                <span>₹{market.yesPrice.toFixed(1)}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-600 font-medium">NO</span>
                                <span>₹{market.noPrice.toFixed(1)}</span>
                              </div>
                            </div> */}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="h-10 w-10 text-blue-200 mx-auto mb-3" />
                        <p className="text-gray-500 text-base font-medium">No markets available</p>
                      </div>
                    )}
                  </div>
                </Card>


              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 