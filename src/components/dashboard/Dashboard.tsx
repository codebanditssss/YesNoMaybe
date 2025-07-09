"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useMarkets } from "@/hooks/useMarkets";
import { useTradeHistory } from "@/hooks/useTradeHistory";
import { useDailyChanges } from "@/hooks/useDailyChanges";
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
  
  // Get daily changes for today's P&L
  const currentTotalValue = portfolio?.summary?.totalValue || (portfolio?.balance?.available_balance || 0);
  const { dailyChange } = useDailyChanges(currentTotalValue);

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
      value: portfolioLoading ? "Loading..." : (
        dailyChange ? 
          ((dailyChange.absoluteChange >= 0) ? `+₹${Math.abs(dailyChange.absoluteChange).toLocaleString()}` : `-₹${Math.abs(dailyChange.absoluteChange).toLocaleString()}`) :
          "No data"
      ),
      change: portfolioLoading ? "Loading..." : (
        dailyChange ? 
          ((dailyChange.percentChange >= 0) ? `+${dailyChange.percentChange.toFixed(2)}%` : `${dailyChange.percentChange.toFixed(2)}%`) :
          "First day"
      ),
      trend: portfolioLoading ? "neutral" : (
        dailyChange ? 
          (dailyChange.absoluteChange >= 0 ? "up" : "down") :
          "neutral"
      ),
      icon: dailyChange ? (dailyChange.absoluteChange >= 0 ? TrendingUp : Loss) : TrendingUp,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-14 gap-8">
          <div>
            <h1 className="text-5xl font-extralight text-black tracking-tight mb-2">Dashboard</h1>
            <p className="text-gray-500 text-lg font-light">
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
          <Button
              onClick={handleRefreshAll}
              size="sm"
              variant="outline"
              className="hover:border-gray-200 shadow bg-white/70 backdrop-blur-md rounded-full px-6 py-3 min-w-[183px] min-h-[50px] flex items-center justify-center"
            >
              {isRefreshing ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5 mr-2" />
              )}
              {isRefreshing ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {/* Stats Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {portfolioStats.map((stat, index) => (
            <Card key={index} className="p-7 flex items-center gap-5 bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/10 shadow-md">
              <div className="flex-shrink-0">
                {stat.icon && <stat.icon className="h-6 w-6 text-gray-400" />}
              </div>
              <div>
                <div className="text-xs text-gray-400 font-light uppercase tracking-wider mb-1">{stat.title}</div>
                <div className="text-3xl font-extrabold text-gray-900">{stat.value}</div>
                <div className={`text-xs px-2 py-0.5 rounded mt-1 ${
                  stat.trend === 'up' ? 'text-green-700 bg-green-50' : 
                  stat.trend === 'down' ? 'text-red-700 bg-red-50' : 'text-gray-700 bg-gray-50'
                }`}>
                  {stat.change}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content: Active Positions & Market Opportunities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
          {/* Active Positions Table */}
          <div className="lg:col-span-2 h-full flex flex-col">
            <Card className="bg-white/95 border border-gray-200 rounded-2xl shadow-xl h-full flex flex-col">
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
              <div className="overflow-x-auto flex-1">
                <div className="min-w-[600px] h-full overflow-y-auto">
                  <div className="bg-gray-50 border-b border-gray-100 px-6 py-3">
                    <div className="flex items-center">
                      <div className="flex-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Market</div>
                      <div className="w-20 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Type</div>
                      <div className="w-20 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Shares</div>
                      <div className="w-24 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Avg Price</div>
                      <div className="w-28 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Invested</div>
                      <div className="w-24 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">P&L</div>
                      <div className="w-20 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">P&L %</div>
                    </div>
                  </div>
                  {transformedActivePositions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">No active positions</div>
                  ) : (
                    transformedActivePositions.map((position, index) => (
                      <div
                        key={index}
                        className="flex items-center border-b border-gray-100 hover:bg-gray-50 px-6 py-3"
                        style={{ minHeight: 56 }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{position.title}</div>
                          <div className="text-xs text-gray-400 truncate">{position.category}</div>
                        </div>
                        <div className={`w-20 text-xs font-semibold text-center rounded-full px-2 py-1 ${position.position === 'YES' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'}`}>{position.position}</div>
                        <div className="w-20 text-xs text-gray-700 text-center">{position.shares}</div>
                        <div className="w-24 text-xs text-gray-700 text-center">₹{position.avgPrice}</div>
                        <div className="w-28 text-xs text-gray-700 text-center">{position.invested}</div>
                        <div className={`w-24 text-xs font-semibold text-center ${position.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{position.pnl}</div>
                        <div className={`w-20 text-xs font-semibold text-center ${position.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{position.pnlPercent}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>
          {/* Market Opportunities */}
          <div className="space-y-6 h-full flex flex-col">
            <Card className="bg-white/95 border border-gray-200 rounded-2xl shadow-xl h-full flex flex-col">
              <div className="p-4 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Market Opportunities</h3>
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
      </div>
    </div>
  );
} 