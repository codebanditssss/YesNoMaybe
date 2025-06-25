import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Star,
  BarChart3,
  Volume2,
  Eye,
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

interface Market {
  id: string;
  title: string;
  category: string;
  description?: string;
  traders: number;
  volume: string;
  volume24h: number;
  yesPrice: number;
  noPrice: number;
  priceChange: number;
  priceChangePercent: number;
  lastUpdate: string;
  trending: boolean;
  icon: React.ComponentType<any>;
  status: 'active' | 'closing_soon' | 'resolved';
  expiryDate: Date;
  totalLiquidity: number;
  marketCap: number;
  createdAt: Date;
  tags: string[];
  featured: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  probability: number;
}

export function Markets() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'trending' | 'volume' | 'newest' | 'closing' | 'alphabetical'>('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closing_soon' | 'resolved'>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-refresh market data
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // In real app, this would fetch fresh market data
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const categories = [
    { id: 'all', name: 'All Markets', count: 1584, icon: Globe },
    { id: 'sports', name: 'Sports', count: 478, icon: Trophy },
    { id: 'crypto', name: 'Crypto', count: 267, icon: Bitcoin },
    { id: 'politics', name: 'Politics', count: 124, icon: Building },
    { id: 'economics', name: 'Economics', count: 189, icon: DollarSign },
    { id: 'technology', name: 'Technology', count: 301, icon: Activity },
    { id: 'entertainment', name: 'Entertainment', count: 225, icon: Tv }
  ];

  const markets: Market[] = [
    {
      id: '1',
      title: 'Bitcoin to reach $100K by December 2024?',
      category: 'crypto',
      description: 'Will Bitcoin price reach $100,000 USD by December 31, 2024?',
      traders: 4521,
      volume: '₹8.7L',
      volume24h: 870000,
      yesPrice: 42,
      noPrice: 58,
      priceChange: 2.3,
      priceChangePercent: 5.8,
      lastUpdate: '1 min ago',
      trending: true,
      icon: Bitcoin,
      status: 'active',
      expiryDate: new Date('2024-12-31'),
      totalLiquidity: 1250000,
      marketCap: 2100000,
      createdAt: new Date('2024-01-15'),
      tags: ['crypto', 'bitcoin', 'price-prediction'],
      featured: true,
      riskLevel: 'medium',
      probability: 42
    },
    {
      id: '2', 
      title: 'India to win World Cup 2024?',
      category: 'sports',
      description: 'Will Team India win the ICC T20 World Cup 2024?',
      traders: 8912,
      volume: '₹15.3L',
      volume24h: 1530000,
      yesPrice: 67,
      noPrice: 33,
      priceChange: -1.5,
      priceChangePercent: -2.2,
      lastUpdate: '30 sec ago',
      trending: true,
      icon: Trophy,
      status: 'active',
      expiryDate: new Date('2024-06-29'),
      totalLiquidity: 2890000,
      marketCap: 4200000,
      createdAt: new Date('2024-02-01'),
      tags: ['sports', 'cricket', 'world-cup'],
      featured: true,
      riskLevel: 'high',
      probability: 67
    },
    {
      id: '3',
      title: 'Apple to announce iPhone 16 in September 2024?',
      category: 'technology',
      description: 'Will Apple officially announce iPhone 16 series in September 2024?',
      traders: 2156,
      volume: '₹4.2L',
      volume24h: 420000,
      yesPrice: 89,
      noPrice: 11,
      priceChange: 3.2,
      priceChangePercent: 3.7,
      lastUpdate: '2 min ago',
      trending: false,
      icon: Activity,
      status: 'closing_soon',
      expiryDate: new Date('2024-09-30'),
      totalLiquidity: 680000,
      marketCap: 890000,
      createdAt: new Date('2024-03-10'),
      tags: ['technology', 'apple', 'iphone'],
      featured: false,
      riskLevel: 'low',
      probability: 89
    },
    {
      id: '4',
      title: 'Tesla stock to cross $300 by Q1 2025?',
      category: 'economics',
      description: 'Will Tesla (TSLA) stock price exceed $300 by March 31, 2025?',
      traders: 3247,
      volume: '₹6.8L',
      volume24h: 680000,
      yesPrice: 54,
      noPrice: 46,
      priceChange: 4.1,
      priceChangePercent: 8.2,
      lastUpdate: '45 sec ago',
      trending: true,
      icon: DollarSign,
      status: 'active',
      expiryDate: new Date('2025-03-31'),
      totalLiquidity: 1420000,
      marketCap: 1890000,
      createdAt: new Date('2024-01-20'),
      tags: ['stocks', 'tesla', 'electric-vehicles'],
      featured: true,
      riskLevel: 'medium',
      probability: 54
    },
    {
      id: '5',
      title: 'AI to achieve AGI by 2025?',
      category: 'technology',
      description: 'Will artificial general intelligence be achieved by any company by 2025?',
      traders: 5689,
      volume: '₹12.1L',
      volume24h: 1210000,
      yesPrice: 28,
      noPrice: 72,
      priceChange: -2.8,
      priceChangePercent: -9.1,
      lastUpdate: '3 min ago',
      trending: true,
      icon: Activity,
      status: 'active',
      expiryDate: new Date('2025-12-31'),
      totalLiquidity: 2350000,
      marketCap: 3100000,
      createdAt: new Date('2023-12-01'),
      tags: ['ai', 'agi', 'technology'],
      featured: true,
      riskLevel: 'high',
      probability: 28
    },
    {
      id: '6',
      title: 'Avengers 5 to be highest grossing movie of 2025?',
      category: 'entertainment',
      description: 'Will Avengers 5 become the highest grossing movie worldwide in 2025?',
      traders: 1847,
      volume: '₹3.1L',
      volume24h: 310000,
      yesPrice: 73,
      noPrice: 27,
      priceChange: 1.8,
      priceChangePercent: 2.5,
      lastUpdate: '4 min ago',
      trending: false,
      icon: Tv,
      status: 'active',
      expiryDate: new Date('2025-12-31'),
      totalLiquidity: 520000,
      marketCap: 780000,
      createdAt: new Date('2024-02-15'),
      tags: ['movies', 'marvel', 'box-office'],
      featured: false,
      riskLevel: 'medium',
      probability: 73
    },
    {
      id: '7',
      title: 'US Elections 2024: Democrat to win presidency?',
      category: 'politics',
      description: 'Will the Democratic Party candidate win the 2024 US Presidential Election?',
      traders: 12456,
      volume: '₹24.7L',
      volume24h: 2470000,
      yesPrice: 51,
      noPrice: 49,
      priceChange: 0.8,
      priceChangePercent: 1.6,
      lastUpdate: '15 sec ago',
      trending: true,
      icon: Building,
      status: 'active',
      expiryDate: new Date('2024-11-05'),
      totalLiquidity: 4200000,
      marketCap: 6800000,
      createdAt: new Date('2023-11-01'),
      tags: ['politics', 'us-elections', 'presidency'],
      featured: true,
      riskLevel: 'high',
      probability: 51
    },
    {
      id: '8',
      title: 'Ethereum to reach $5K by end of 2024?',
      category: 'crypto',
      description: 'Will Ethereum price reach $5,000 USD by December 31, 2024?',
      traders: 2891,
      volume: '₹5.4L',
      volume24h: 540000,
      yesPrice: 38,
      noPrice: 62,
      priceChange: -1.2,
      priceChangePercent: -3.1,
      lastUpdate: '2 min ago',
      trending: false,
      icon: Bitcoin,
      status: 'active',
      expiryDate: new Date('2024-12-31'),
      totalLiquidity: 890000,
      marketCap: 1200000,
      createdAt: new Date('2024-01-10'),
      tags: ['crypto', 'ethereum', 'price-prediction'],
      featured: false,
      riskLevel: 'medium',
      probability: 38
    }
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
  const filteredMarkets = markets
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

  const totalVolume = markets.reduce((sum, market) => sum + market.volume24h, 0);
  const activeMarkets = markets.filter(m => m.status === 'active').length;
  const totalTraders = markets.reduce((sum, market) => sum + market.traders, 0);

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Markets</h1>
            <p className="text-gray-600">Trade on real-world events and outcomes</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live data</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search markets, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full sm:w-80 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={showFilters ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLastUpdate(new Date())}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                <Button 
                  variant="ghost" 
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
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="closing_soon">Closing Soon</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                  <select 
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value as any)}
                    className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>
                
                <div>
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
                </div>
                
                <div>
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
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2">
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

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total Markets</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(markets.length)}</p>
                <p className="text-xs text-gray-500 mt-1">{activeMarkets} active</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Active Traders</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(totalTraders)}</p>
                <p className="text-xs text-gray-500 mt-1">+12% this week</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Volume2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">24h Volume</p>
                <p className="text-2xl font-bold text-gray-900">₹{formatNumber(totalVolume)}</p>
                <p className="text-xs text-gray-500 mt-1">+8% from yesterday</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Closing Soon</p>
                <p className="text-2xl font-bold text-gray-900">
                  {markets.filter(m => m.status === 'closing_soon').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Within 24 hours</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sorting and View Controls */}
        <Card className="p-4 bg-white border-0 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Sort by:</span>
              </div>
              <div className="flex rounded-lg bg-gray-100 p-1">
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
                        ? 'bg-white text-gray-900 shadow-sm'
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
        </Card>

        {/* Markets List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCategory === 'all' ? 'All Markets' : `${categories.find(c => c.id === selectedCategory)?.name} Markets`}
            </h2>
          </div>

          {viewMode === 'list' ? (
            /* List View */
            <div className="space-y-4">
              {filteredMarkets.map((market) => {
                const Icon = market.icon;
                return (
                  <Card key={market.id} className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-start gap-4">
                      {/* Market Icon */}
                      <div className="p-3 bg-gray-100 rounded-lg flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                        <Icon className="h-6 w-6 text-gray-700" />
                      </div>

                      {/* Market Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            
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

                          {/* Price Section */}
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
                            
                            {/* Trading Buttons */}
                            <div className="flex gap-2">
                              <Button 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
                                size="sm"
                              >
                                Yes ₹{market.yesPrice}
                              </Button>
                              <Button 
                                variant="outline" 
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                                size="sm"
                              >
                                No ₹{market.noPrice}
                              </Button>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="p-1">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="p-1">
                                <Star className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="p-1">
                                <AlertCircle className="h-4 w-4" />
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
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets.map((market) => {
                const Icon = market.icon;
                return (
                  <Card key={market.id} className="p-5 bg-white border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                          <Icon className="h-5 w-5 text-gray-700" />
                        </div>
                        <div className="flex gap-1">
                          {market.featured && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
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
                        >
                          Yes ₹{market.yesPrice}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 flex-1 text-sm"
                          size="sm"
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
        </div>

        {/* Load More */}
        {filteredMarkets.length > 0 && (
          <div className="text-center pt-8">
            <Button variant="outline" className="px-8 py-3">
              <Zap className="h-4 w-4 mr-2" />
              Load More Markets
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 