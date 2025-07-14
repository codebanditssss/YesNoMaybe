'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  UserPlus,
  X,
  Clock,
  Zap,
  Target,
  Trophy,
  Radio,
  RefreshCw,
  BarChart
} from "lucide-react";
import { useLeaderboard, LeaderboardEntry, RecentTrade } from '@/hooks/useLeaderboard';
import { useAuth } from '@/contexts/AuthContext';
import { SelectDropdown } from '../ui/select-dropdown';

interface FollowedTrader {
  id: string;
  isFollowed: boolean;
}

// Virtual scrolling configuration
const ITEM_HEIGHT = 80; // Height of each row in pixels
const CONTAINER_HEIGHT = 600; // Height of the scrollable container
const BUFFER_SIZE = 5; // Number of items to render outside visible area

interface VirtualScrollProps {
  items: LeaderboardEntry[];
  renderItem: (item: LeaderboardEntry, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  bufferSize?: number;
}

function VirtualScroll({ 
  items, 
  renderItem, 
  itemHeight, 
  containerHeight, 
  bufferSize = 5 
}: VirtualScrollProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const visibleItems = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
  const endIndex = Math.min(items.length - 1, startIndex + visibleItems + bufferSize * 2);
  
  const visibleData = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={scrollElementRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
      className="relative"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleData.map((item, index) => 
            renderItem(item, startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
}

export function Leaderboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | '1d' | '7d' | '30d'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'overall' | 'streak' | 'consistency' | 'volume'>('overall');
  const [hoveredTrader, setHoveredTrader] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [selectedTrader, setSelectedTrader] = useState<string | null>(null);
  const [showTraderPanel, setShowTraderPanel] = useState(false);
  const [followedTraders, setFollowedTraders] = useState<FollowedTrader[]>([]);

  const categoryOptions = [
    { value: "overall", label: "Overall Performance", icon: Trophy },
    { value: "streak", label: "Win Streak Leaders", icon: Zap },
    { value: "consistency", label: "Most Consistent", icon: Target },
    { value: "volume", label: "Volume Leaders", icon: TrendingUp },
  ];

  const timeRangeOptions = [
    { value: 'all', label: 'All Time', icon: Clock },
    { value: '30d', label: 'Last 30 Days', icon: Clock },
    { value: '7d', label: 'Last 7 Days', icon: Clock },
    { value: '1d', label: 'Last 24 Hours', icon: Clock },
  ];
  
  const { 
    leaderboard, 
    stats, 
    loading, 
    error, 
    refresh,
    hasData 
  } = useLeaderboard({ 
    search: searchTerm,
    timeRange: selectedTimeRange,
    limit: 1000, // Fetch more data for virtual scrolling
    offset: 0,
    autoRefresh: true,
    refreshInterval: 60000
  });

  // Memoize filtered and sorted data for performance
  const processedData = useMemo(() => {
    if (!leaderboard) return [];
    
    // Apply any additional client-side filtering or sorting here
    return leaderboard;
  }, [leaderboard, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getRankChange = (currentRank: number) => {
    return 0;
  };

  const getPerformanceStreak = (trader: any) => {
    return {
      streakLength: trader.streak || 0,
      isWinning: trader.totalPnL > 0
    };
  };

  const getSharpRatio = (trader: any) => {
    // For new traders with very few trades
    if (!trader.totalTrades || trader.totalTrades <= 3) {
      return '0.00';
    }

    // For traders with moderate activity, use a simplified measure
    if (trader.totalTrades <= 10) {
      const winRate = trader.winningTrades / trader.totalTrades;
      const simpleRatio = (winRate - 0.5) * 2; // Scale -1 to +1
      return simpleRatio.toFixed(2);
    }

    // For established traders with enough trades, calculate full Sharpe ratio
    if (!trader.recentTrades || trader.recentTrades.length === 0) {
      return '0.00';
    }

    // Calculate daily returns
    const dailyReturns = new Map<string, number>();
    trader.recentTrades.forEach((trade: any) => {
      const date = new Date(trade.timestamp).toISOString().split('T')[0];
      dailyReturns.set(date, (dailyReturns.get(date) || 0) + (trade.pnl || 0));
    });

    const returns = Array.from(dailyReturns.values());
    
    // Need at least 5 days of data for meaningful calculation
    if (returns.length < 5) {
      const totalReturn = returns.reduce((sum, r) => sum + r, 0);
      const avgReturn = totalReturn / returns.length;
      // Use ROI as a simple measure
      const roi = avgReturn / trader.balance;
      return (Math.max(-1, Math.min(1, roi)) * 2).toFixed(2);
    }

    // Calculate average daily return
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    // Calculate daily volatility
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1);
    const stdDev = Math.sqrt(variance || 0);

    if (stdDev === 0) {
      return avgReturn > 0 ? '1.00' : '0.00';
    }

    // Annualize (√252 is the standard annualization factor for daily returns)
    const annualizedReturn = avgReturn * 252;
    const annualizedStdDev = stdDev * Math.sqrt(252);

    // Risk-free rate (4% annual)
    const riskFreeRate = 0.04;

    // Calculate Sharpe Ratio and normalize it to a reasonable range (-3 to +3)
    const sharpeRatio = (annualizedReturn - riskFreeRate) / annualizedStdDev;
    const normalizedSharpe = Math.max(-3, Math.min(3, sharpeRatio));

    return normalizedSharpe.toFixed(2);
  };

  interface Badge {
    name: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    icon: string;
    description?: string;
  }

  const getBadges = (trader: LeaderboardEntry): Badge[] => {
    return trader.achievements || [];
  };

  const handleFollow = (traderId: string) => {
    setFollowedTraders(prev => {
      const existing = prev.find(f => f.id === traderId);
      if (existing) {
        return prev.map(f => f.id === traderId ? { ...f, isFollowed: !f.isFollowed } : f);
      } else {
        return [...prev, { id: traderId, isFollowed: true }];
      }
    });
  };

  // const isFollowed = (traderId: string) => {
  //   return followedTraders.find(f => f.id === traderId)?.isFollowed || false;
  // };

  const handleTraderClick = (traderId: string) => {
    setSelectedTrader(traderId);
    setShowTraderPanel(true);
  };

  const closeTraderPanel = () => {
    setShowTraderPanel(false);
    setTimeout(() => setSelectedTrader(null), 300);
  };

  // Render a single row for virtual scrolling
  const renderLeaderboardRow = useCallback((trader: LeaderboardEntry, index: number) => {
    const rankChange = getRankChange(trader.rank);
    const streak = getPerformanceStreak(trader);
    const sharpeRatio = getSharpRatio(trader);
    const badges = getBadges(trader);
    
    return (
      <div
        key={trader.id}
        style={{ height: ITEM_HEIGHT }}
        className="flex items-center border-b border-gray-100 hover:bg-gray-50 cursor-pointer px-8"
        // onMouseEnter={(e) => {
        //   setHoveredTrader(trader.id);
        //   const rect = e.currentTarget.getBoundingClientRect();
        //   setHoverPosition({ x: rect.right + 10, y: rect.top });
        // }}
        // onMouseLeave={() => setHoveredTrader(null)}
        onClick={() => handleTraderClick(trader.id)}
      >
        {/* Rank */}
        <div className="w-24 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="text-sm font-bold text-gray-900">
              {trader.rank}
            </div>
            {rankChange !== 0 && (
              <div className="flex items-center">
                {rankChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : rankChange < 0 ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : (
                  <Minus className="h-3 w-3 text-gray-400" />
                )}
                <span className={`text-xs font-medium ${
                  rankChange > 0 ? 'text-green-500' : 
                  rankChange < 0 ? 'text-red-500' : 
                  'text-gray-500'
                }`}>
                  {Math.abs(rankChange)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Trader Name */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">{trader.name}</div>
        </div>
        
        {/* P&L Column */}
        <div className="w-32 flex flex-col items-start pl-2">
          <div className={`font-semibold tabular-nums ${
            trader.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(trader.totalPnL)}
          </div>
          <div className={`text-sm tabular-nums ${
            trader.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {formatPercentage((trader.totalPnL / 10000) * 100)}
          </div>
        </div>

        {/* Score Column */}
        <div className="w-24 flex items-center justify-center">
          <div className={`font-semibold tabular-nums ${
            streak.isWinning ? 'text-green-600' : 'text-red-600'
          }`}>
            {streak.streakLength}{streak.isWinning ? 'W' : 'L'}
          </div>
        </div>

        {/* Badges Column */}
        <div className="w-32 flex items-center justify-center">
          {trader.achievements && badges.length > 0 ? (
            <div className="flex items-center gap-2">
              {badges.slice(0, 1).map((badge, i) => (
                <Badge 
                  key={i}
                  className={`text-xs px-2.5 py-1 flex items-center gap-1.5 ${
                    badge.tier === 'bronze' ? 'border border-orange bg-orange-100 text-orange-700' :
                    badge.tier === 'silver' ? 'border border-gray bg-gray-100 text-gray-700' :
                    badge.tier === 'gold' ? 'border border-yellow bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}
                >
                  {badge.name === 'First Trade' && <Target className="h-3.5 w-3.5" />}
                  {badge.name === 'Win Streak' && <Zap className="h-3.5 w-3.5" />}
                  {badge.name === 'High Volume' && <TrendingUp className="h-3.5 w-3.5" />}
                  {badge.name === 'Consistent' && <Trophy className="h-3.5 w-3.5" />}
                  <span className="text-xs font-medium">{badge.name}</span>
                </Badge>
              ))}
              {badges.length > 1 && (
                <span className="text-xs text-gray-500 font-medium">+{badges.length - 1}</span>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </div>

        {/* Sharpe Column */}
        <div className="w-24 flex items-center justify-center">
          <div className="font-semibold text-gray-900 tabular-nums">{sharpeRatio}</div>
        </div>

        {/* Action Column */}
        {/* <div className="w-24 flex items-center justify-center">
          <Button
            size="sm"
            variant={isFollowed(trader.id) ? "default" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              handleFollow(trader.id);
            }}
            className={`h-7 px-3 text-xs font-medium ${
              isFollowed(trader.id)
                ? 'bg-black text-white hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isFollowed(trader.id) ? 'Following' : 'Follow'}
          </Button>
        </div> */}
      </div>
    );
  }, []);


  const statsCards = [
    {
      label: 'Active Traders',
      icon: <UserPlus className="h-6 w-6 text-gray-400" />, 
      value: stats?.totalUsers || 0,
      valueClass: 'text-3xl font-extrabold text-gray-900',
    },
    {
      label: 'Top P&L',
      icon: <TrendingUp className="h-6 w-6 text-gray-400" />,
      value: processedData.length > 0 ? formatCurrency(Math.max(...processedData.map(t => t.totalPnL))) : '—',
      valueClass: 'text-3xl font-extrabold text-gray-900',
    },
    {
      label: 'Avg Win Rate',
      icon: <Trophy className="h-6 w-6 text-gray-400" />,
      value: processedData.length > 0 ? `${(
        processedData.reduce((sum, t) => sum + t.winRate, 0) / processedData.length
      ).toFixed(1)}%` : '—',
      valueClass: 'text-3xl font-extrabold text-gray-900',
    },
    {
      label: 'Total Trades',
      icon: <BarChart className="h-6 w-6 text-gray-400" />,
      value: processedData.length > 0 ? processedData.reduce((sum, t) => sum + t.totalTrades, 0) : 0,
      valueClass: 'text-3xl font-extrabold text-gray-900',
    },
  ];

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-14 gap-8">
          <div>
            <h1 className="text-5xl font-extralight text-black tracking-tight mb-2">Leaderboard</h1>
            <p className="text-gray-500 text-lg font-light">Performance rankings and trader analytics</p>
          </div>
          <div className="flex items-center gap-8 flex-wrap">
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md rounded-full px-6 py-3 shadow border border-gray-100">
              <Radio className={`h-5 w-5 ${hasData ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
              <span className="text-base text-gray-700 font-medium">
                {hasData ? 'Live rankings' : 'Waiting for data...'}
              </span>
            </div>
            <Button
              onClick={refresh}
              size="sm"
              variant="outline"
              className="hover:border-gray-200 shadow bg-white/70 backdrop-blur-md rounded-full px-6 py-3 min-w-[183px] min-h-[50px] flex items-center justify-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {statsCards.map((card, i) => (
            <Card key={i} className="p-7 flex items-center gap-5 bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/10 shadow-md">
              <div className="flex-shrink-0">{card.icon}</div>
              <div>
                <div className="text-xs text-gray-400 font-light uppercase tracking-wider mb-1">{card.label}</div>
                <div className={card.valueClass}>{card.value}</div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6 mb-10 flex-wrap">
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-lg rounded-full border border-gray-100 shadow px-6 py-3 justify-center flex-wrap">
            <div className="relative group w-72 flex-wrap">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
              <input
                type="text"
                placeholder="Search traders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-full text-base focus:outline-none"
              />
            </div>
            <SelectDropdown
              options={timeRangeOptions}
              selected={selectedTimeRange}
              onSelect={val => setSelectedTimeRange(val as any)}
              buttonIcon={Clock}
            />
            <SelectDropdown
              options={categoryOptions}
              selected={selectedCategory}
              onSelect={val => setSelectedCategory(val as any)}
              buttonIcon={Filter}
            />
          </div>
        </div>

        <div className="mb-20">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
              <span className="ml-4 text-gray-700 text-lg">Loading leaderboard...</span>
            </div>
          ) : error ? (
            <Card className="p-8 bg-red-50 border-red-200 rounded-2xl">
              <div className="text-center">
                <h3 className="text-lg font-medium text-red-800">Error loading leaderboard</h3>
                <p className="text-base text-red-600 mt-2">{error}</p>
                <Button variant="outline" size="sm" onClick={refresh} className="mt-4">
                  Try again
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="border border-gray-100 overflow-hidden bg-white/95 rounded-2xl shadow-xl">
              <div className="overflow-x-auto">
                <div className="bg-gray-50 border-b border-gray-100 px-10 py-6 min-w-[600px]">
                  <div className="flex items-center">
                    <div className="w-24 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Rank</div>
                    <div className="flex-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trader</div>
                    <div className="w-32 text-xs font-semibold text-gray-500 uppercase tracking-wide pl-2">P&L</div>
                    <div className="w-24 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Score</div>
                    <div className="w-32 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Badges</div>
                    <div className="w-24 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Sharpe</div>
                    {/* <div className="w-24 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Action</div> */}
                  </div>
                </div>
                <div className="min-w-[600px]">
                  <VirtualScroll
                    items={processedData}
                    renderItem={renderLeaderboardRow}
                    itemHeight={ITEM_HEIGHT}
                    containerHeight={CONTAINER_HEIGHT}
                    bufferSize={BUFFER_SIZE}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {hoveredTrader && typeof window !== 'undefined' && (
        <div 
          className="fixed w-[28rem] bg-white/95 border border-gray-100 shadow-2xl rounded-2xl z-50 p-8 pointer-events-none backdrop-blur-lg"
          style={{
            left: Math.min(hoverPosition.x, window.innerWidth - 500),
            top: Math.min(hoverPosition.y, window.innerHeight - 350),
          }}
        >
                {(() => {
                  const trader = processedData.find(t => t.id === hoveredTrader);
                  if (!trader) return null;
                  
                  const badges = getBadges(trader);
                  const streak = getPerformanceStreak(trader);
                  const sharpeRatio = getSharpRatio(trader);
                  
                  return (
                    <div className="space-y-3">
                      <div className="border-b border-gray-200 pb-2">
                        <div className="font-semibold text-gray-900">{trader.name}</div>
                        <div className="text-sm text-gray-500 font-mono">Rank #{trader.rank}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-500 uppercase text-xs">Total P&L</div>
                          <div className="font-semibold text-gray-900 tabular-nums">
                            {formatCurrency(trader.totalPnL)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 uppercase text-xs">ROI</div>
                          <div className="font-semibold text-gray-900 tabular-nums">
                            {formatPercentage((trader.totalPnL / 10000) * 100)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 uppercase text-xs">Win Rate</div>
                          <div className="font-semibold text-gray-900 tabular-nums">{trader.winRate.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-gray-500 uppercase text-xs">Total Trades</div>
                          <div className="font-semibold text-gray-900 tabular-nums">{trader.totalTrades}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 uppercase text-xs">Streak</div>
                          <div className="font-semibold text-gray-900 tabular-nums">
                            {streak.streakLength} {streak.isWinning ? 'W' : 'L'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 uppercase text-xs">Sharpe Ratio</div>
                          <div className="font-semibold text-gray-900 tabular-nums">{sharpeRatio}</div>
                        </div>
                      </div>
                      
                      <div className="text-gray-500 uppercase text-xs">Achievements</div>
                      <div className="flex gap-1 flex-wrap">
                        {badges.length > 0 ? badges.map((badge, i) => (
                          <Badge key={i} variant="outline" className={`text-xs ${
                            badge.tier === 'platinum' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            badge.tier === 'gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            badge.tier === 'silver' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                            'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                            {badge.name}
                          </Badge>
                        )) : (
                          <span className="text-xs text-gray-400">No achievements</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

      {/* Right Slide-out Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-[28rem] bg-white/95 border-l border-gray-100 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out rounded-l-2xl ${
          showTraderPanel ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedTrader && (() => {
          const trader = processedData.find(t => t.id === selectedTrader);
          if (!trader) return null;
          
          const badges = getBadges(trader);
          const streak = getPerformanceStreak(trader);
          const sharpeRatio = getSharpRatio(trader);
          
          return (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{trader.name}</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeTraderPanel}
                    className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-8">
                  {/* Rank & Performance Overview */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Performance Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Current Rank</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">#{trader.rank}</div>
                        <div className="text-xs text-gray-500 mt-1">out of {stats?.totalUsers || 'N/A'} traders</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Total P&L</div>
                        <div className={`text-2xl font-bold mt-1 tabular-nums ${
                          trader.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(trader.totalPnL)}
                        </div>
                        <div className={`text-xs mt-1 tabular-nums ${
                          trader.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {formatPercentage((trader.totalPnL / 10000) * 100)} ROI
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trading Statistics */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Trading Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Win Rate</span>
                        <span className="font-semibold text-gray-900 tabular-nums">{trader.winRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Total Trades</span>
                        <span className="font-semibold text-gray-900 tabular-nums">{trader.totalTrades}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Current Streak</span>
                        <span className={`font-semibold tabular-nums ${
                          streak.isWinning ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {streak.streakLength} {streak.isWinning ? 'Wins' : 'Losses'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Sharpe Ratio</span>
                        <span className="font-semibold text-gray-900 tabular-nums">{sharpeRatio}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Average Trade Size</span>
                        <span className="font-semibold text-gray-900 tabular-nums">
                          {formatCurrency(Math.floor(Math.random() * 5000) + 1000)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Portfolio Value</span>
                        <span className="font-semibold text-gray-900 tabular-nums">
                          {formatCurrency(10000 + trader.totalPnL)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Achievements</h3>
                    {badges.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {badges.map((badge, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{badge.name}</span>
                              <Badge variant="outline" className={`text-xs ${
                                badge.tier === 'platinum' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                badge.tier === 'gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                badge.tier === 'silver' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                                'bg-orange-50 text-orange-700 border-orange-200'
                              }`}>
                                {badge.tier}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <div className="text-sm">No achievements yet</div>
                        <div className="text-xs mt-1">Keep trading to earn badges</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {(trader.recentTrades || []).length > 0 ? (
                        (trader.recentTrades || []).map((trade: RecentTrade) => (
                          <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {trade.marketTitle}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(trade.timestamp).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-semibold ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {trade.side} @ {trade.price}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <div className="text-sm">No recent trades</div>
                          <div className="text-xs mt-1">Trades will appear here when available</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              {/* <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <Button
                  variant={isFollowed(trader.id) ? "default" : "outline"}
                  onClick={() => handleFollow(trader.id)}
                  className={`w-full ${
                    isFollowed(trader.id)
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isFollowed(trader.id) ? 'Following' : 'Follow Trader'}
                </Button>
              </div> */}
            </div>
          );
        })()}
      </div>

      {/* Overlay */}
      {showTraderPanel && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={closeTraderPanel}
        />
      )}
    </div>
  );
} 