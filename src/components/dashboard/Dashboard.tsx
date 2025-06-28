import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useMarkets } from "@/hooks/useMarkets";
import { useTradeHistory } from "@/hooks/useTradeHistory";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  Activity,
  Users,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
  Loader2
} from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();

  // Fetch real portfolio data
  const { 
    portfolio, 
    loading: portfolioLoading, 
    error: portfolioError,
    refresh: refreshPortfolio,
    totalPnL,
    pnlPercentage,
    activePositions
  } = usePortfolio({ 
    includeHistory: true,
    historyLimit: 5,
    autoRefresh: true 
  });

  // Fetch real markets data for trending markets
  const { 
    markets, 
    loading: marketsLoading,
    error: marketsError,
    refetch: refreshMarkets
  } = useMarkets({ 
    featured: true,
    limit: 3
  });

  // Fetch recent trade history
  const {
    trades: recentTrades,
    loading: tradesLoading,
    error: tradesError,
    refetch: refreshTrades
  } = useTradeHistory({
    limit: 3,
    autoRefresh: true
  });

  // Build portfolio stats from real data with safe defaults
  const portfolioStats = [
    {
      title: "Portfolio Value",
      value: portfolio?.balance?.total ? `₹${portfolio.balance.total.toLocaleString()}` : "₹0",
      change: (pnlPercentage || 0) >= 0 ? `+${(pnlPercentage || 0).toFixed(1)}%` : `${(pnlPercentage || 0).toFixed(1)}%`,
      changeValue: (totalPnL || 0) >= 0 ? `+₹${Math.abs(totalPnL || 0).toLocaleString()}` : `-₹${Math.abs(totalPnL || 0).toLocaleString()}`,
      trend: (pnlPercentage || 0) >= 0 ? "up" : "down",
      icon: DollarSign
    },
    {
      title: "Active Positions",
      value: portfolio?.stats?.activePositions?.toString() || "0",
      change: (activePositions || []).length > 0 ? `+${(activePositions || []).length}` : "0",
      changeValue: "positions",
      trend: (activePositions || []).length > 0 ? "up" : "neutral", 
      icon: Target
    },
    {
      title: "Total Returns",
      value: (totalPnL || 0) >= 0 ? `+₹${(totalPnL || 0).toLocaleString()}` : `-₹${Math.abs(totalPnL || 0).toLocaleString()}`,
      change: (pnlPercentage || 0) >= 0 ? `+${(pnlPercentage || 0).toFixed(1)}%` : `${(pnlPercentage || 0).toFixed(1)}%`,
      changeValue: "all time",
      trend: (totalPnL || 0) >= 0 ? "up" : "down",
      icon: TrendingUp
    },
    {
      title: "Win Rate",
      value: `${(portfolio?.stats?.winRate || 0).toFixed(1)}%`,
      change: (portfolio?.stats?.winRate || 0) > 50 ? `+${((portfolio?.stats?.winRate || 0) - 50).toFixed(1)}%` : `${((portfolio?.stats?.winRate || 0) - 50).toFixed(1)}%`,
      changeValue: "vs average",
      trend: (portfolio?.stats?.winRate || 0) > 50 ? "up" : "down",
      icon: Activity
    }
  ];

  // Transform active positions data with safe defaults
  const transformedActivePositions = (activePositions || []).slice(0, 3).map(position => {
    const pnl = (position.unrealizedPnL || 0) + (position.realizedPnL || 0);
    const pnlPercent = (position.totalInvested || 0) > 0 ? (pnl / (position.totalInvested || 1)) * 100 : 0;
    const totalShares = (position.yesShares || 0) + (position.noShares || 0);
    const isYesPosition = (position.yesShares || 0) > (position.noShares || 0);
    
    return {
      title: position.marketTitle || 'Unknown Market',
      category: position.marketCategory?.charAt(0).toUpperCase() + position.marketCategory?.slice(1) || 'Other',
      position: isYesPosition ? "YES" : "NO",
      shares: totalShares,
      currentPrice: (position.totalInvested || 0) > 0 && totalShares > 0 ? Math.round((position.totalInvested || 0) / totalShares * 100) / 100 : 0,
      entryPrice: (position.totalInvested || 0) > 0 && totalShares > 0 ? Math.round((position.totalInvested || 0) / totalShares * 100) / 100 : 0,
      pnl: pnl >= 0 ? `+₹${Math.abs(pnl).toLocaleString()}` : `-₹${Math.abs(pnl).toLocaleString()}`,
      pnlPercent: pnlPercent >= 0 ? `+${Math.abs(pnlPercent).toFixed(1)}%` : `${Math.abs(pnlPercent).toFixed(1)}%`,
      trend: pnl >= 0 ? "up" : "down"
    };
  });

  // Transform markets data for trending markets with safe defaults
  const trendingMarkets = (markets || []).slice(0, 3).map(market => ({
    title: market.title || 'Unknown Market',
    category: (market.category || 'other').charAt(0).toUpperCase() + (market.category || 'other').slice(1),
    volume: `₹${((market.volume24h || 0) / 100000).toFixed(1)}L`,
    yesPrice: market.yesPrice || 0,
    noPrice: market.noPrice || 0,
    change: (market.priceChange24h || 0) >= 0 ? `+${(market.priceChange24h || 0).toFixed(1)}%` : `${(market.priceChange24h || 0).toFixed(1)}%`
  }));

  // Transform recent trades for activity with safe defaults
  const recentActivity = (recentTrades || []).slice(0, 3).map(trade => ({
    type: "Trade executed",
    description: `${trade.side || 'Unknown'} ${trade.quantity || 0} shares in ${trade.marketTitle || 'Unknown Market'}`,
    time: trade.createdAt ? new Date(trade.createdAt).toLocaleString() : 'Unknown time',
    status: trade.status === 'completed' ? 'success' : trade.status === 'cancelled' ? 'warning' : 'info'
  }));

  const isLoading = portfolioLoading || marketsLoading || tradesLoading;
  const hasError = portfolioError || marketsError || tradesError;

  const handleRefreshAll = () => {
    refreshPortfolio();
    refreshMarkets();
    refreshTrades();
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-gray-50 min-h-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-8 bg-gray-50 min-h-full">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
                <p className="text-sm text-red-600 mt-1">
                  {portfolioError || marketsError || tradesError}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                className="ml-auto"
              >
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome back, {user?.email?.split('@')[0] || 'Trader'}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live data</span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleRefreshAll}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Portfolio Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portfolioStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className={`flex items-center text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : stat.trend === 'down' ? (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    ) : null}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.changeValue}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Positions */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-0 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Active Positions</h2>
                  <Button variant="outline" size="sm" className="text-sm">
                    View All
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                {transformedActivePositions.length > 0 ? (
                  <div className="space-y-4">
                    {transformedActivePositions.map((position, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            position.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {position.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {position.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {position.category}
                              </Badge>
                              <Badge className={`text-xs ${
                                position.position === 'YES' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {position.position}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {position.shares} shares @ ₹{position.entryPrice}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-bold text-sm ${
                            position.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {position.pnl}
                          </p>
                          <p className={`text-xs ${
                            position.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {position.pnlPercent}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No active positions</p>
                    <p className="text-sm text-gray-500 mt-1">Start trading to see your positions here</p>
                    <Button variant="outline" className="mt-4" size="sm">
                      Browse Markets
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="bg-white border-0 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              </div>
              
              <div className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-full mt-0.5 ${
                          activity.status === 'success' ? 'bg-green-100' :
                          activity.status === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            activity.status === 'success' ? 'bg-green-600' :
                            activity.status === 'warning' ? 'bg-orange-600' : 'bg-blue-600'
                          }`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.type}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Trending Markets */}
            <Card className="bg-white border-0 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Trending Markets</h3>
                  <Button variant="outline" size="sm" className="text-sm">
                    View All
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                {trendingMarkets.length > 0 ? (
                  <div className="space-y-4">
                    {trendingMarkets.map((market, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {market.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {market.category}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Vol: {market.volume}
                              </span>
                            </div>
                          </div>
                          <div className={`text-sm font-medium ${
                            market.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {market.change}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 text-xs">
                            YES {market.yesPrice.toFixed(1)}¢
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 text-xs">
                            NO {market.noPrice.toFixed(1)}¢
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No trending markets</p>
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