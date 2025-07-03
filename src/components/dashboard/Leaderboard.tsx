'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  UserPlus,
  X,
  Clock,
  Zap,
  Target,
  Trophy
} from "lucide-react";
import { useLeaderboard, LeaderboardEntry, RecentTrade } from '@/hooks/useLeaderboard';
import { useAuth } from '@/contexts/AuthContext';

interface FollowedTrader {
  id: string;
  isFollowed: boolean;
}

export function Leaderboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | '1d' | '7d' | '30d'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'overall' | 'streak' | 'consistency' | 'volume'>('overall');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hoveredTrader, setHoveredTrader] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [selectedTrader, setSelectedTrader] = useState<string | null>(null);
  const [showTraderPanel, setShowTraderPanel] = useState(false);
  const [followedTraders, setFollowedTraders] = useState<FollowedTrader[]>([]);
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showRowsDropdown, setShowRowsDropdown] = useState(false);
  
  const { user } = useAuth();
  
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
    limit: rowsPerPage,
    offset: (currentPage - 1) * rowsPerPage,
    autoRefresh: true,
    refreshInterval: 60000
  });

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
    // Real rank change from previous rank in trader_rankings table
    return 0; // For now, until we implement historical rank tracking
  };

  const getPerformanceStreak = (trader: any) => {
    return {
      streakLength: trader.streak || 0,
      isWinning: trader.totalPnL > 0
    };
  };

  const getSharpRatio = (trader: any) => {
    // Calculate Sharpe ratio from win rate and returns
    const riskFreeRate = 0.04; // 4% annual risk-free rate
    const excessReturn = (trader.totalPnL / trader.balance) - (riskFreeRate / 252); // Daily excess return
    const volatility = Math.sqrt(
      (trader.winRate / 100) * Math.pow(excessReturn, 2) + 
      (1 - trader.winRate / 100) * Math.pow(-excessReturn, 2)
    );
    return volatility === 0 ? 0 : ((excessReturn / volatility) * Math.sqrt(252)).toFixed(2);
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

  const isFollowed = (traderId: string) => {
    return followedTraders.find(f => f.id === traderId)?.isFollowed || false;
  };

  const handleTraderClick = (traderId: string) => {
    setSelectedTrader(traderId);
    setShowTraderPanel(true);
  };

  const closeTraderPanel = () => {
    setShowTraderPanel(false);
    setTimeout(() => setSelectedTrader(null), 300); // Wait for animation to complete
  };

  const totalPages = Math.ceil((stats?.totalUsers || 0) / rowsPerPage);

  return (
    <div className="min-h-screen bg-white">
        {/* Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
              <h1 className="text-4xl font-bold text-black tracking-tight">Leaderboard</h1>
              <p className="text-gray-500 mt-2 text-lg">Performance rankings and trader analytics</p>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Live rankings</span>
                </div>
                <div className="text-sm text-gray-500">
                  {stats?.totalUsers || 0} active traders
                </div>
              </div>
            </div>
            
                         <div className="flex items-center gap-4">
               {/* Search */}
               <div className="relative group">
                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                 <input
                   type="text"
                   placeholder="Search traders..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-64 pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black bg-white shadow-sm transition-all duration-200 hover:shadow-md focus:shadow-md"
                 />
          </div>
          
               {/* Time Range Filter */}
               <div className="relative">
                 <Button 
                   variant="outline"
                   size="sm"
                   onClick={() => {
                     setShowTimeRangeDropdown(!showTimeRangeDropdown);
                     setShowCategoryDropdown(false);
                   }}
                   className={`border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 py-2.5 px-4 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${
                     showTimeRangeDropdown ? 'bg-gray-50 border-gray-300' : ''
                   }`}
                 >
                   <Clock className="h-4 w-4 mr-2" />
                   {selectedTimeRange === 'all' ? 'All Time' : 
                    selectedTimeRange === '30d' ? 'Last 30 Days' :
                    selectedTimeRange === '7d' ? 'Last 7 Days' : 'Last 24 Hours'}
                   <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showTimeRangeDropdown ? 'transform rotate-180' : ''}`} />
                 </Button>

                 {showTimeRangeDropdown && (
                   <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                     <div className="py-1">
                       {[
                         { value: 'all', label: 'All Time' },
                         { value: '30d', label: 'Last 30 Days' },
                         { value: '7d', label: 'Last 7 Days' },
                         { value: '1d', label: 'Last 24 Hours' }
                       ].map((option) => (
                         <button
                           key={option.value}
                           onClick={() => {
                             setSelectedTimeRange(option.value as any);
                             setShowTimeRangeDropdown(false);
                           }}
                           className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                             selectedTimeRange === option.value 
                               ? 'bg-gray-50 text-black font-medium' 
                               : 'text-gray-700 hover:bg-gray-50'
                           }`}
                         >
                           {option.label}
                         </button>
                       ))}
                     </div>
                   </div>
                 )}
               </div>

               {/* Category Filter */}
               <div className="relative">
                 <Button 
                   variant="outline"
                   size="sm"
                   onClick={() => {
                     setShowCategoryDropdown(!showCategoryDropdown);
                     setShowTimeRangeDropdown(false);
                   }}
                   className={`border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 py-2.5 px-4 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${
                     showCategoryDropdown ? 'bg-gray-50 border-gray-300' : ''
                   }`}
                 >
                   <Filter className="h-4 w-4 mr-2" />
                   {selectedCategory === 'overall' ? 'Overall Performance' :
                    selectedCategory === 'streak' ? 'Win Streak Leaders' :
                    selectedCategory === 'consistency' ? 'Most Consistent' : 'Volume Leaders'}
                   <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showCategoryDropdown ? 'transform rotate-180' : ''}`} />
                 </Button>

                 {showCategoryDropdown && (
                   <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                     <div className="py-1">
                       {[
                         { value: 'overall', label: 'Overall Performance', icon: Trophy },
                         { value: 'streak', label: 'Win Streak Leaders', icon: Zap },
                         { value: 'consistency', label: 'Most Consistent', icon: Target },
                         { value: 'volume', label: 'Volume Leaders', icon: TrendingUp }
                       ].map((option) => (
                         <button
                           key={option.value}
                           onClick={() => {
                             setSelectedCategory(option.value as any);
                             setShowCategoryDropdown(false);
                           }}
                           className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 flex items-center ${
                             selectedCategory === option.value 
                               ? 'bg-gray-50 text-black font-medium' 
                               : 'text-gray-700 hover:bg-gray-50'
                           }`}
                         >
                           <option.icon className="h-4 w-4 mr-2" />
                           {option.label}
                         </button>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             </div>
          </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <span className="ml-3 text-gray-600">Loading leaderboard...</span>
          </div>
        ) : error ? (
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="text-center">
                <h3 className="text-sm font-medium text-red-800">Error loading leaderboard</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              <Button variant="outline" size="sm" onClick={refresh} className="mt-3">
                Try again
              </Button>
            </div>
          </Card>
        ) : (
          <>
                         {/* Leaderboard Table */}
             <div className="relative">
               <Card className="border border-gray-200 overflow-hidden">
                 <div className="overflow-hidden">
                   <table className="w-full">
                     <thead className="bg-gray-50 border-b border-gray-200">
                       <tr>
                         <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Rank</th>
                         <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Trader</th>
                         <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">P&L</th>
                         <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Streak</th>
                         <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Badges</th>
                         <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Sharpe</th>
                         <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Action</th>
                       </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-50">
                       {leaderboard.map((trader, index) => {
                         const rankChange = getRankChange(trader.rank);
                         const streak = getPerformanceStreak(trader);
                         const sharpeRatio = getSharpRatio(trader);
                         const badges = getBadges(trader);
                         
                         return (
                           <tr 
                             key={trader.id}
                             className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                             onMouseEnter={(e) => {
                               setHoveredTrader(trader.id);
                               const rect = e.currentTarget.getBoundingClientRect();
                               setHoverPosition({ x: rect.right + 10, y: rect.top });
                             }}
                             onMouseLeave={() => setHoveredTrader(null)}
                             onClick={() => handleTraderClick(trader.id)}
                           >
                             <td className="px-8 py-4">
                               <div className="flex items-center gap-4">
                                 <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-gray-900">
                                   {trader.rank}
                                 </div>
                                 {rankChange !== 0 && (
                                   <div className="flex items-center gap-1">
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
                             </td>
                             
                             <td className="px-8 py-4">
                               <div>
                                 <div className="font-semibold text-gray-900">{trader.name}</div>
                               </div>
                             </td>
                             
                             <td className="px-8 py-4">
                               <div className="space-y-1">
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
                             </td>
                             
                             <td className="px-8 py-4">
                               <div className="space-y-1">
                                 <div className={`font-semibold tabular-nums ${
                                   streak.isWinning ? 'text-green-600' : 'text-red-600'
                                 }`}>
                                   {streak.streakLength} {streak.isWinning ? 'W' : 'L'}
                                 </div>
                                 <div className={`text-sm ${
                                   streak.isWinning ? 'text-green-500' : 'text-red-500'
                                 }`}>
                                   {streak.streakLength} days
                                 </div>
                               </div>
                             </td>
                             
                             <td className="px-8 py-4">
                               <div className="space-y-1">
                                 <div className="font-semibold text-gray-900 tabular-nums">
                                   {badges.length}
                                 </div>
                                 <div className="text-sm text-gray-500">
                                   {trader.achievements && (
                                     <div className="flex gap-1 mt-1">
                                       {getBadges(trader).map((badge, i) => (
                                         <div key={i} className="relative group">
                                           <Badge 
                                             className={`
                                               ${badge.tier === 'bronze' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : ''}
                                               ${badge.tier === 'silver' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
                                               ${badge.tier === 'gold' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : ''}
                                               ${badge.tier === 'platinum' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                                             `}
                                           >
                                             {badge.name}
                                           </Badge>
                                           <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                                             {badge.description}
                                           </div>
                                         </div>
                                       ))}
                                     </div>
                                   )}
                                 </div>
                               </div>
                             </td>
                             
                             <td className="px-8 py-4">
                               <div className="space-y-1">
                                 <div className="font-semibold text-gray-900 tabular-nums">{sharpeRatio}</div>
                                 <div className="text-sm text-gray-500">sharpe ratio</div>
                </div>
                             </td>
                             
                             <td className="px-8 py-4">
                               <Button
                                 size="sm"
                                 variant={isFollowed(trader.id) ? "default" : "outline"}
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleFollow(trader.id);
                                 }}
                                 className={`h-8 px-3 text-xs font-medium ${
                                   isFollowed(trader.id)
                                     ? 'bg-black text-white hover:bg-gray-800'
                                     : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                 }`}
                               >
                                 {isFollowed(trader.id) ? 'Following' : 'Follow'}
                               </Button>
                             </td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
              </div>
            </Card>

               {/* Professional Hover Card */}
               {hoveredTrader && typeof window !== 'undefined' && (
                 <div 
                   className="fixed w-80 bg-white border border-gray-300 shadow-lg z-50 p-4 pointer-events-none"
                   style={{
                     left: Math.min(hoverPosition.x, window.innerWidth - 320),
                     top: Math.min(hoverPosition.y, window.innerHeight - 200),
                   }}
                 >
                   {(() => {
                     const trader = leaderboard.find(t => t.id === hoveredTrader);
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
                         
                         <div className="border-t border-gray-200 pt-2">
                           <div className="text-gray-500 uppercase text-xs mb-1">Achievements</div>
                           <div className="text-sm text-gray-700">
                             {badges.length > 0 ? badges.join(', ') : 'No badges earned'}
                           </div>
                         </div>
                       </div>
                     );
                   })()}
                  </div>
               )}
                </div>

                         {/* Pagination */}
             <div className="flex items-center justify-between mt-6 py-4">
               <div className="flex items-center gap-6">
                 <div className="relative">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                     className="border-gray-300 text-gray-700 hover:bg-gray-50"
                   >
                     <span className="text-sm">Rows per page: {rowsPerPage}</span>
                     <ChevronDown className="h-4 w-4 ml-2" />
                   </Button>
                   
                                        {showRowsDropdown && (
                       <div className="absolute top-full left-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-20">
                         {[10, 25, 50, 100].map((size) => (
                           <button
                             key={size}
                             onClick={() => {
                               setRowsPerPage(size);
                               setCurrentPage(1);
                               setShowRowsDropdown(false);
                             }}
                             className={`w-full text-left px-3 py-2 text-sm ${
                               rowsPerPage === size 
                                 ? 'bg-gray-900 text-white' 
                                 : 'text-gray-700 hover:bg-gray-50'
                             }`}
                           >
                             {size}
                           </button>
                         ))}
                       </div>
                     )}
                 </div>
                 
                 <span className="text-sm text-gray-600">
                   Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, stats?.totalUsers || 0)} of {stats?.totalUsers || 0} traders
                 </span>
               </div>
               
               <div className="flex items-center gap-2">
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                   disabled={currentPage === 1}
                   className="border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                 >
                   <ChevronLeft className="h-4 w-4" />
                 </Button>
                 
                 {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                   const pageNum = currentPage <= 3 ? idx + 1 : currentPage - 2 + idx;
                   if (pageNum > totalPages) return null;
                   
                   return (
                     <Button
                       key={pageNum}
                       variant={currentPage === pageNum ? "default" : "outline"}
                       size="sm"
                       onClick={() => setCurrentPage(pageNum)}
                       className={currentPage === pageNum ? "bg-gray-900 text-white" : "border-gray-300 hover:bg-gray-50"}
                     >
                       {pageNum}
                     </Button>
                   );
                 })}
                 
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                   disabled={currentPage === totalPages}
                   className="border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                 >
                   <ChevronRight className="h-4 w-4" />
                 </Button>
               </div>
                    </div>
          </>
        )}
                    </div>

      {/* Right Slide-out Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          showTraderPanel ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedTrader && (() => {
          const trader = leaderboard.find(t => t.id === selectedTrader);
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
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
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
              </div>
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