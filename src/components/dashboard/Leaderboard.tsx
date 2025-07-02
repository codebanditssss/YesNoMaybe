'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Users, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  TrendingUp,
  Activity,
  BarChart3,
  Crown
} from "lucide-react";
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useAuth } from '@/contexts/AuthContext';

export function Leaderboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Get auth status for debugging
  const { user, session, loading: authLoading } = useAuth();
  
  // Use real leaderboard data
  const { 
    leaderboard, 
    stats, 
    loading, 
    error, 
    refresh,
    hasData 
  } = useLeaderboard({ 
    search: searchTerm,
    autoRefresh: true,
    refreshInterval: 60000 // 1 minute
  });



  // Initialize timestamp on client side only
  useEffect(() => {
    setMounted(true);
    setLastUpdate(new Date());
  }, []);

  // Auto-refresh timestamp
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // Update timestamp every minute
    return () => clearInterval(interval);
  }, [mounted]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2: return 'bg-gray-100 text-gray-800 border-gray-200';
      case 3: return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-4 w-4 text-yellow-600" />;
      case 2: return <Trophy className="h-4 w-4 text-gray-600" />;
      case 3: return <Trophy className="h-4 w-4 text-orange-600" />;
      default: return null;
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
            <p className="text-gray-600">Top traders and their performance rankings</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              {mounted && lastUpdate && (
                <span>
                  Last updated: {lastUpdate.toISOString().slice(11, 19)}
                </span>
              )}
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live rankings</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (mounted) {
                  setLastUpdate(new Date());
                }
                refresh();
              }}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading leaderboard...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading leaderboard</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                className="ml-auto"
              >
                Try again
              </Button>
            </div>
          </Card>
        )}

        {/* Statistics */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-blue-100 rounded">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Traders</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-green-100 rounded">
                    <Crown className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Top Performer</span>
                </div>
                <div className="flex items-center gap-3">
                  {stats.topPerformer?.avatar ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                      <img 
                        src={stats.topPerformer.avatar} 
                        alt={`${stats.topPerformer.name}'s avatar`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center', 'bg-green-100', 'text-green-600', 'font-medium');
                          e.currentTarget.parentElement!.innerHTML = stats.topPerformer!.name.charAt(0).toUpperCase();
                        }}
                      />
                    </div>
                  ) : stats.topPerformer ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-600 font-medium">
                      {stats.topPerformer.name.charAt(0).toUpperCase()}
                    </div>
                  ) : null}
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.topPerformer?.name || 'N/A'}
                    </p>
                    {stats.topPerformer && (
                      <p className="text-sm text-green-600 font-medium">
                        {formatCurrency(stats.topPerformer.totalPnL)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-purple-100 rounded">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Avg Win Rate</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.avgWinRate || 0).toFixed(1)}%
                </p>
              </div>
            </Card>

            <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-orange-100 rounded">
                    <Activity className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Trades</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.activeTrades || 0).toLocaleString()}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Search */}
        {!loading && !error && (
          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search traders by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </Card>
        )}

        {/* Leaderboard */}
        {!loading && !error && (
          <Card className="bg-white border-0 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Rankings</h3>
              
              {!hasData ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No traders found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm 
                      ? "No traders match your search criteria. Try adjusting your search terms."
                      : "No trading data available yet. Start trading to appear on the leaderboard!"
                    }
                  </p>

                  {searchTerm && (
                    <Button onClick={() => setSearchTerm('')}>
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((trader) => (
                    <div 
                      key={trader.id} 
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        trader.rank <= 3 
                          ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 hover:shadow-lg' 
                          : 'border-gray-200 hover:shadow-md hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getRankBadgeColor(trader.rank)}`}>
                            {getRankIcon(trader.rank) || (
                              <span className="text-sm font-bold">#{trader.rank}</span>
                            )}
                          </div>
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                            {trader.avatar ? (
                              <img 
                                src={trader.avatar} 
                                alt={`${trader.name}'s avatar`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center', 'bg-blue-100', 'text-blue-600', 'font-medium');
                                  e.currentTarget.parentElement!.innerHTML = trader.name.charAt(0).toUpperCase();
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-medium">
                                {trader.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900">{trader.name}</h4>
                              {trader.rank <= 3 && (
                                <Badge variant="outline" className={getRankBadgeColor(trader.rank)}>
                                  Top {trader.rank}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">@{trader.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-6 lg:gap-8 text-sm">
                          <div className="text-center">
                            <p className="text-gray-500 text-xs uppercase tracking-wide">Total P&L</p>
                            <p className={`font-bold text-lg ${
                              trader.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(trader.totalPnL)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 text-xs uppercase tracking-wide">Win Rate</p>
                            <p className="font-bold text-lg text-gray-900">{trader.winRate.toFixed(1)}%</p>
                          </div>
                          <div className="text-center hidden sm:block">
                            <p className="text-gray-500 text-xs uppercase tracking-wide">Trades</p>
                            <p className="font-bold text-lg text-gray-900">{trader.totalTrades}</p>
                          </div>
                          <div className="text-center hidden lg:block">
                            <p className="text-gray-500 text-xs uppercase tracking-wide">Volume</p>
                            <p className="font-bold text-lg text-gray-900">
                              {formatCurrency(trader.totalVolume)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 