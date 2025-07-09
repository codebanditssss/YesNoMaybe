'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMarkets } from '@/hooks/useMarkets';
import { OrderPlacement } from './OrderPlacement';
import type { Market } from '@/lib/supabase';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Clock,
  Search,
  Filter,
  Bitcoin,
  Trophy,
  Globe,
  Building,
  Gamepad2,
  Tv,
  ArrowUpDown,
  BarChart3,
  Volume2,
  AlertCircle,
  Calendar,
  DollarSign,
  Activity,
  Zap,
  ChevronDown,
  SlidersHorizontal,
  RefreshCw,
  BookOpen,
  Target,
  TrendingDownIcon
} from "lucide-react";
import { SelectDropdown } from "@/components/ui/select-dropdown";

// Helper function to get category icon
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'crypto': return Bitcoin;
    case 'sports': return Trophy;
    case 'politics': return Building;
    case 'economics': return DollarSign;
    case 'technology': return Activity;
    case 'entertainment': return Tv;
    default: return Globe;
}
};

export function Markets() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closing_soon' | 'resolved'>('active');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  
  // Order placement modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  // Use the minimal type for OrderPlacementProps.market
  const [selectedMarket, setSelectedMarket] = useState<{
    id: string;
    title: string;
    yesPrice: number;
    noPrice: number;
    availableQuantity: number;
    status?: string;
  } | null>(null);
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>('yes');

  // Fetch ALL markets for category counts (no filters)
  const { 
    markets: allMarkets, 
  } = useMarkets({
    status: 'all',
    category: 'all',
    limit: 1000 // Get all markets
  });

  // Fetch filtered markets for display
  const { 
    markets: apiMarkets, 
    loading, 
    error, 
    refetch: refreshMarkets 
  } = useMarkets({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    status: statusFilter === 'all' ? undefined : statusFilter,
    featured: featuredOnly || undefined
  });

  // Auto-refresh market data
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMarkets();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshMarkets]);

  // Transform API markets to match frontend interface by adding icon (for UI only)
  const marketsWithIcon = apiMarkets.map(market => ({
    ...market,
    icon: getCategoryIcon(market.category)
  }));

  // Calculate dynamic category counts from ALL markets (not filtered)
  const categoryCounts = allMarkets.reduce((acc, market) => {
    acc[market.category] = (acc[market.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = [
    { id: 'all', name: 'All Markets', count: allMarkets.length, icon: Globe },
    { id: 'sports', name: 'Sports', count: categoryCounts['sports'] || 0, icon: Trophy },
    { id: 'crypto', name: 'Crypto', count: categoryCounts['crypto'] || 0, icon: Bitcoin },
    { id: 'politics', name: 'Politics', count: categoryCounts['politics'] || 0, icon: Building },
    { id: 'economics', name: 'Economics', count: categoryCounts['economics'] || 0, icon: DollarSign },
    { id: 'technology', name: 'Technology', count: categoryCounts['technology'] || 0, icon: Activity },
    { id: 'entertainment', name: 'Entertainment', count: categoryCounts['entertainment'] || 0, icon: Tv }
  ];

  // Utility functions
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and sort markets
  const filteredMarkets = marketsWithIcon
    .filter(market => {
      const matchesCategory = selectedCategory === 'all' || market.category === selectedCategory;
      const matchesSearch = market.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           market.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           market.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || market.status === statusFilter;
      const matchesRisk = riskFilter === 'all' || market.riskLevel === riskFilter;
      const matchesFeatured = !featuredOnly || market.featured;
      const matchesPrice = market.yesPrice >= priceRange[0] && market.yesPrice <= priceRange[1];
      
      return matchesCategory && matchesSearch && matchesStatus && matchesRisk && matchesFeatured && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'trending':
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return b.volume24h - a.volume24h;
        case 'volume':
          return b.volume24h - a.volume24h;
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'closing':
          return a.expiryDate.getTime() - b.expiryDate.getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closing_soon': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'closing_soon': return 'Closing Soon';
      case 'resolved': return 'Resolved';
      default: return 'Unknown';
    }
  };

  const totalVolume = apiMarkets.reduce((sum, market) => sum + market.volume24h, 0);
  const activeMarkets = apiMarkets.filter(m => m.status === 'active').length;
  const totalTraders = apiMarkets.reduce((sum, market) => sum + market.traders, 0);

  // Handle order placement
  const handleOrderClick = (
    market: {
      id: string;
      title: string;
      yesPrice: number;
      noPrice: number;
      availableQuantity: number;
      status?: string;
    },
    side: 'yes' | 'no'
  ) => {
    setSelectedMarket(market);
    setSelectedSide(side);
    setShowOrderModal(true);
  };

  const handleOrderSuccess = () => {
    setShowOrderModal(false);
    setSelectedMarket(null);
    // Optionally refresh markets data
    refreshMarkets();
  };

  // Market summary cards array for DRY rendering
  const marketSummaryCards = [
    {
      icon: <Globe className="h-5 w-5 text-blue-600" />,
      iconBg: "bg-blue-100",
      label: "Total Markets",
      value: formatNumber(marketsWithIcon.length),
      valueClass: "text-2xl font-bold text-gray-900",
      subtext: `${activeMarkets} active`,
      subtextClass: "text-xs text-gray-500 mt-1",
    },
    {
      icon: <Users className="h-5 w-5 text-green-600" />,
      iconBg: "bg-green-100",
      label: "Active Traders",
      value: formatNumber(totalTraders),
      valueClass: "text-2xl font-bold text-gray-900",
      subtext: "+12% this week",
      subtextClass: "text-xs text-gray-500 mt-1",
    },
    {
      icon: <Volume2 className="h-5 w-5 text-purple-600" />,
      iconBg: "bg-purple-100",
      label: "24h Volume",
      value: `₹${formatNumber(totalVolume)}`,
      valueClass: "text-2xl font-bold text-gray-900",
      subtext: "+8% from yesterday",
      subtextClass: "text-xs text-gray-500 mt-1",
    },
    {
      icon: <Clock className="h-5 w-5 text-orange-600" />,
      iconBg: "bg-orange-100",
      label: "Closing Soon",
      value: apiMarkets.filter(m => m.status === 'closing_soon').length,
      valueClass: "text-2xl font-bold text-gray-900",
      subtext: "Within 24 hours",
      subtextClass: "text-xs text-gray-500 mt-1",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-14 gap-8">
          <div>
            <h1 className="text-5xl font-bold text-black tracking-tight mb-2">Markets</h1>
            <p className="text-gray-500 text-lg font-light">Trade on real-world events and outcomes</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center bg-white/70 backdrop-blur-md rounded-full px-6 py-3 shadow border border-gray-100 flex-wrap">
              <span className="text-base text-gray-700 font-medium ml-2">
                Last updated: {new Date().toLocaleTimeString().slice(11, 19)}
              </span>
              <div className="flex items-center gap-1 ml-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live data</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshMarkets}
              className="hover:border-gray-200 shadow bg-white/70 backdrop-blur-md rounded-full px-6 py-3 min-w-[120px] min-h-[44px] flex items-center justify-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {marketSummaryCards.map(card => (
            <Card key={card.label} className="p-7 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/10 shadow-md">
              <div className="flex-shrink-0">{card.icon}</div>
              <div className="text-xs text-gray-400 font-light uppercase tracking-wider text-center">{card.label}</div>
              <div className="text-2xl font-bold text-gray-900 text-center">{card.value}</div>
              <div className={card.subtextClass + ' text-center'}>{card.subtext}</div>
            </Card>
          ))}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="p-6 bg-white border-1 border border-gray-300 rounded-lg shadow-sm max-w-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setRiskFilter('all');
                    setPriceRange([0, 100]);
                    setFeaturedOnly(false);
                  }}
                >
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <SelectDropdown
                    options={[
                      { value: "all", label: "All Statuses" },
                      { value: "active", label: "Active" },
                      { value: "closing_soon", label: "Closing Soon" },
                      { value: "resolved", label: "Resolved" },
                    ]}
                    selected={statusFilter}
                    onSelect={val => setStatusFilter(val as any)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                  <SelectDropdown
                    options={[
                      { value: "all", label: "All Risk Levels" },
                      { value: "low", label: "Low Risk" },
                      { value: "medium", label: "Medium Risk" },
                      { value: "high", label: "High Risk" },
                    ]}
                    selected={riskFilter}
                    onSelect={val => setRiskFilter(val as any)}
                  />
                </div>
                
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (Yes)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-16 p-1 text-xs border border-gray-200 rounded"
                    />
                    <span className="text-gray-500">-</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100])}
                      className="w-16 p-1 text-xs border border-gray-200 rounded"
                    />
                  </div>
                </div> */}
                
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special</label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox"
                      checked={featuredOnly}
                      onChange={(e) => setFeaturedOnly(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Featured only</span>
                  </label>
                </div> */}
              </div>
            </div>
          </Card>
        )}

        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover:shadow-sm'
                }`}
              >
                <Icon className="h-4 w-4" />
                {category.name}
                <span className="ml-1 text-xs opacity-75 bg-black/10 px-1.5 py-0.5 rounded">
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sorting and View Controls */}
        {/* <Card className="p-4 bg-white border-1 border border-gray-300 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Sort by:</span>
              </div>
              <div className="flex flex-col border-1 border border-gray-300 rounded-lg sm:flex-row gap-1 rounded-lg bg-white p-1 w-full sm:w-auto overflow-x-auto">
                {[
                  { value: 'trending', label: 'Trending', icon: TrendingUp },
                  { value: 'volume', label: 'Volume', icon: Volume2 },
                  { value: 'newest', label: 'Newest', icon: Clock },
                  { value: 'closing', label: 'Closing', icon: AlertCircle },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setSortBy(value as any)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      sortBy === value
                        ? 'bg-white border border-gray-100 text-gray-900 shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{filteredMarkets.length} markets found</span>
                {featuredOnly && <Badge variant="outline" className="text-xs">Featured only</Badge>}
              </div>
              
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Target className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Card> */}

        {/* Markets List */}
        <Card className="border border-gray-100 overflow-hidden bg-white/95 rounded-2xl shadow-xl overflow-x-auto">
          <div className="p-3 sm:p-6">
            <div className="flex items-center justify-between mb-6">
          {/* <div className="bg-gray-50 border-b border-gray-100 p-3 sm:p-6">
            <div className="flex items-center justify-between mb-6"> */}
              <div className='flex items-center gap-4 justify-start w-full sm:w-auto mt-2 sm:mt-0 flex-wrap'>
              <h3 className="text-xl font-semibold text-gray-900 flex-wrap">
                {selectedCategory === 'all' ? 'All Markets' : `${categories.find(c => c.id === selectedCategory)?.name} Markets`}
              </h3>
              <div className="flex rounded-full bg-white p-1 ml-4">
                {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((label, idx, arr) => {
                  const isSelected = sortBy === label;
                  const isLast = idx === arr.length - 1;
                  return (
                    <button
                      key={label}
                      onClick={() => setSortBy(label)}
                      className={
                        `flex-1 px-3 py-1 text-sm font-medium shadow-sm ` +
                        (isSelected
                          ? `bg-black text-white ${isLast ? 'rounded-r-full' : ''}`
                          : `bg-transparent ${isLast ? 'rounded-r-full' : ''}`)
                      }
                      style={{
                        borderTopLeftRadius: idx === 0 ? '9999px' : undefined,
                        borderBottomLeftRadius: idx === 0 ? '9999px' : undefined,
                        borderTopRightRadius: isLast ? '9999px' : undefined,
                        borderBottomRightRadius: isLast ? '9999px' : undefined,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              </div>
              <div>
              <div className="flex items-center gap-4 justify-end w-full sm:w-auto mt-2 sm:mt-0 flex-wrap">
                  <div className="text-sm text-gray-600">
                    {filteredMarkets.length} {filteredMarkets.length === 1 ? 'market' : 'markets'}
                  </div>
                  <div className="flex rounded-lg bg-gray-100 p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded transition-colors ${
                        viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                    >
                      <BookOpen className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded transition-colors ${
                        viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                    >
                      <Target className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-b border-gray-200 my-2" />

            {/* Loading State */}
            {loading && (
              <Card className="p-8 bg-white border-0 shadow-sm">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading markets...</h3>
                  <p className="text-gray-600">Fetching the latest market data for you</p>
                </div>
              </Card>
            )}

            {/* Error State */}
            {error && (
              <Card className="p-8 bg-white border-0 shadow-sm border-red-200">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading markets</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button 
                    onClick={refreshMarkets}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </Card>
            )}

            {/* Markets Data */}
            {!loading && !error && (
              <>
                {viewMode === 'list' ? (
                  /* List View */
                  <div className="overflow-x-auto">
                    <div className="min-w-[900px] max-h-[520px] overflow-y-auto">
                      <div className="space-y-4">
                        {filteredMarkets.map((market) => {
                          const Icon = market.icon;
                          return (
                            <Card key={market.id} className="p-6 bg-white border-1 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group">
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-gray-100 rounded-lg flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                                  <Icon className="h-6 w-6 text-gray-700" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1">
                                      {/* <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <Badge variant="outline" className="text-xs">
                                          {market.category.charAt(0).toUpperCase() + market.category.slice(1)}
                                        </Badge>
                                        <Badge className={`text-xs ${getStatusColor(market.status)}`}>
                                          {getStatusText(market.status)}
                                        </Badge>
                                        <Badge className={`text-xs ${getRiskColor(market.riskLevel)}`}>
                                          {market.riskLevel.toUpperCase()} RISK
                                        </Badge>
                                        {market.trending && (
                                          <Badge className="text-xs bg-red-100 text-red-800">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            Trending
                                          </Badge>
                                        )}
                                        {market.featured && (
                                          <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                            Featured
                                          </Badge>
                                        )}
                                      </div> */}
                                      
                                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                        {market.title}
                                      </h3>
                                      
                                      {market.description && (
                                        <p className="text-sm text-gray-600 mb-3">{market.description}</p>
                                      )}
                                      
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                        <div className="flex items-center gap-1 text-gray-500">
                                          <Users className="h-3 w-3" />
                                          <span>{formatNumber(market.traders)} traders</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500">
                                          <Volume2 className="h-3 w-3" />
                                          <span>₹{formatNumber(market.volume24h)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500">
                                          <Calendar className="h-3 w-3" />
                                          <span>Expires {market.expiryDate.toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500">
                                          <Clock className="h-3 w-3" />
                                          <span>Updated {market.lastUpdate}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                      <div className="text-right">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-sm text-gray-500">Probability:</span>
                                          <span className="text-lg font-bold text-gray-900">{market.probability}%</span>
                                          <div className={`flex items-center text-xs ${
                                            market.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                                          }`}>
                                            {market.priceChange >= 0 ? (
                                              <TrendingUp className="h-3 w-3 mr-1" />
                                            ) : (
                                              <TrendingDown className="h-3 w-3 mr-1" />
                                            )}
                                            {market.priceChangePercent >= 0 ? '+' : ''}{market.priceChangePercent.toFixed(1)}%
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex gap-2">
                                        <Button 
                                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOrderClick(market, 'yes');
                                          }}
                                        >
                                          Yes ₹{market.yesPrice}
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOrderClick(market, 'no');
                                          }}
                                        >
                                          No ₹{market.noPrice}
                                        </Button>
                                      </div>
                                      

                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Grid View */
                  <div className="overflow-x-auto">
                    <div className="min-w-[900px] max-h-[520px] overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMarkets.map((market) => {
                          const Icon = market.icon;
                          // Find the original market object from apiMarkets for logic/handlers
                          const originalMarket = apiMarkets.find(m => m.id === market.id)!;
                          // Map to OrderPlacementProps.market type
                          const orderPlacementMarket = {
                            id: originalMarket.id,
                            title: originalMarket.title,
                            yesPrice: originalMarket.yesPrice,
                            noPrice: originalMarket.noPrice,
                            availableQuantity: 1000, // TODO: Replace with real value if available
                            status: originalMarket.status
                          };
                          return (
                            <Card key={market.id} className="p-5 bg-white border-1 border border-gray-300 rounded-lg shadow-sm hover:shadow-lg transition-all cursor-pointer group">
                              <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                                    <Icon className="h-5 w-5 text-gray-700" />
                                  </div>
                                  <div className="flex gap-1">
                                    {market.featured}
                                    {market.trending && (
                                      <TrendingUp className="h-4 w-4 text-red-500" />
                                    )}
                                  </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {market.category.charAt(0).toUpperCase() + market.category.slice(1)}
                                  </Badge>
                                  <Badge className={`text-xs ${getStatusColor(market.status)}`}>
                                    {getStatusText(market.status)}
                                  </Badge>
                                  <Badge className={`text-xs ${getRiskColor(market.riskLevel)}`}>
                                    {market.riskLevel.toUpperCase()}
                                  </Badge>
                                </div>

                                {/* Title */}
                                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                  {market.title}
                                </h3>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{formatNumber(market.traders)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Volume2 className="h-3 w-3" />
                                    <span>₹{formatNumber(market.volume24h)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    <span>{market.probability}%</span>
                                  </div>
                                  <div className={`flex items-center gap-1 ${
                                    market.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {market.priceChange >= 0 ? (
                                      <TrendingUp className="h-3 w-3" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3" />
                                    )}
                                    <span>{market.priceChangePercent >= 0 ? '+' : ''}{market.priceChangePercent.toFixed(1)}%</span>
                                  </div>
                                </div>

                                {/* Trading Buttons */}
                                <div className="flex gap-2">
                                  <Button 
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1 text-sm"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOrderClick(orderPlacementMarket, 'yes');
                                    }}
                                  >
                                    Yes ₹{market.yesPrice}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 flex-1 text-sm"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOrderClick(orderPlacementMarket, 'no');
                                    }}
                                  >
                                    No ₹{market.noPrice}
                                  </Button>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>Expires {market.expiryDate.toLocaleDateString()}</span>
                                  <span>{market.lastUpdate}</span>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {filteredMarkets.length === 0 && (
                  <Card className="p-12 bg-white border-0 shadow-sm">
                    <div className="text-center">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No markets found</h3>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your search or filter criteria to find more markets.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('all');
                          setStatusFilter('all');
                          setRiskFilter('all');
                          setFeaturedOnly(false);
                        }}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Order Placement Modal */}
        {showOrderModal && selectedMarket && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOrderModal(false)}
          >
            <div 
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <OrderPlacement
                market={selectedMarket}
                initialSide={selectedSide}
                onOrderSuccess={handleOrderSuccess}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 