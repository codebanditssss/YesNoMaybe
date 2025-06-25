import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Target,
  Calculator,
  BarChart3,
  PieChart,
  RefreshCw,
  Filter,
  Search,
  ArrowUpDown,
  Download,
  History,
  Activity,
  Eye,
  Settings,
  BookOpen,
  Layers,
  TrendingDownIcon
} from "lucide-react";

interface Stock {
  id: string;
  marketId: string;
  marketTitle: string;
  type: 'yes' | 'no';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface StockManagerProps {
  userStocks: Stock[];
  onMint?: (marketId: string, type: 'yes' | 'no', quantity: number) => void;
  onBurn?: (stockId: string, quantity: number) => void;
}

export function StockManager({ userStocks, onMint, onBurn }: StockManagerProps) {
  const [activeTab, setActiveTab] = useState<'holdings' | 'mint' | 'burn' | 'analytics'>('holdings');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [mintType, setMintType] = useState<'yes' | 'no'>('yes');
  const [mintQuantity, setMintQuantity] = useState(100);
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [burnQuantity, setBurnQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'pnl' | 'value' | 'quantity' | 'name'>('pnl');
  const [filterType, setFilterType] = useState<'all' | 'yes' | 'no'>('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Mock available markets for minting
  const availableMarkets = [
    { 
      id: '1', 
      title: 'Bitcoin to reach ₹84L by 2024?', 
      yesPrice: 4.2, 
      noPrice: 5.8, 
      category: 'crypto',
      volume: 125000,
      traders: 1245,
      liquidity: 'High',
      risk: 'Medium'
    },
    { 
      id: '2', 
      title: 'Tesla stock above ₹25,000 by Q1 2025?', 
      yesPrice: 6.7, 
      noPrice: 3.3, 
      category: 'economics',
      volume: 89000,
      traders: 867,
      liquidity: 'Medium',
      risk: 'Low'
    },
    { 
      id: '3', 
      title: 'AI achieves AGI by 2025?', 
      yesPrice: 3.4, 
      noPrice: 6.6, 
      category: 'technology',
      volume: 156000,
      traders: 2134,
      liquidity: 'High',
      risk: 'High'
    },
    {
      id: '4',
      title: 'India to win Cricket World Cup 2024?',
      yesPrice: 7.2,
      noPrice: 2.8,
      category: 'sports',
      volume: 198000,
      traders: 3245,
      liquidity: 'Very High',
      risk: 'Medium'
    }
  ];

  const mintCost = mintQuantity * 10; // Each stock costs ₹10 to mint
  const totalPortfolioValue = userStocks.reduce((sum, stock) => sum + (stock.quantity * stock.currentPrice), 0);
  const totalPnL = userStocks.reduce((sum, stock) => sum + stock.pnl, 0);
  const totalInvested = userStocks.reduce((sum, stock) => sum + (stock.quantity * stock.avgPrice), 0);
  const winningPositions = userStocks.filter(stock => stock.pnl > 0).length;
  const losingPositions = userStocks.filter(stock => stock.pnl < 0).length;
  const winRate = userStocks.length > 0 ? (winningPositions / userStocks.length) * 100 : 0;

  const handleMintStocks = () => {
    if (selectedMarket && onMint) {
      onMint(selectedMarket, mintType, mintQuantity);
      setMintQuantity(100);
    }
  };

  const handleBurnStocks = () => {
    if (selectedStock && onBurn) {
      onBurn(selectedStock, burnQuantity);
      setBurnQuantity(1);
    }
  };

  const handleBulkBurn = () => {
    if (selectedStocks.length > 0 && onBurn) {
      selectedStocks.forEach(stockId => {
        const stock = userStocks.find(s => s.id === stockId);
        if (stock) {
          onBurn(stockId, stock.quantity);
        }
      });
      setSelectedStocks([]);
    }
  };

  const toggleStockSelection = (stockId: string) => {
    setSelectedStocks(prev => 
      prev.includes(stockId) 
        ? prev.filter(id => id !== stockId)
        : [...prev, stockId]
    );
  };

  const selectedStockData = userStocks.find(stock => stock.id === selectedStock);
  const burnValue = selectedStockData ? burnQuantity * selectedStockData.currentPrice : 0;

  // Filter and sort stocks
  const filteredStocks = userStocks
    .filter(stock => {
      const matchesSearch = stock.marketTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || stock.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'pnl':
          return b.pnlPercent - a.pnlPercent;
        case 'value':
          return (b.quantity * b.currentPrice) - (a.quantity * a.currentPrice);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'name':
          return a.marketTitle.localeCompare(b.marketTitle);
        default:
          return 0;
      }
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crypto': return 'bg-orange-100 text-orange-800';
      case 'sports': return 'bg-blue-100 text-blue-800';
      case 'technology': return 'bg-purple-100 text-purple-800';
      case 'economics': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-white border-0 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Stock Manager</h2>
            <p className="text-gray-600">Mint new positions or burn existing ones</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live prices</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLastUpdate(new Date())}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Enhanced Portfolio Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Portfolio Value</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPortfolioValue)}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {totalPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium text-gray-600">Total P&L</span>
            </div>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalPnL)}
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Win Rate</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{winRate.toFixed(1)}%</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Holdings</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{userStocks.length}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Invested</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInvested)}</p>
          </div>

          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-gray-600">Winning</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{winningPositions}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('holdings')}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'holdings'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            Holdings ({userStocks.length})
          </button>
          <button
            onClick={() => setActiveTab('mint')}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'mint'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Zap className="h-4 w-4" />
            Mint Stocks
          </button>
          <button
            onClick={() => setActiveTab('burn')}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'burn'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Trash2 className="h-4 w-4" />
            Burn Stocks
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </button>
        </div>
      </Card>

      {/* Holdings Tab */}
      {activeTab === 'holdings' && (
        <Card className="bg-white border-0 shadow-sm">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Your Stock Holdings</h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search holdings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="yes">YES Stocks</option>
                  <option value="no">NO Stocks</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pnl">Sort by P&L %</option>
                  <option value="value">Sort by Value</option>
                  <option value="quantity">Sort by Quantity</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedStocks.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {selectedStocks.length} stock{selectedStocks.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStocks([])}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkBurn}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Burn Selected
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {filteredStocks.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No holdings yet</h4>
                <p className="text-gray-600 mb-4">Start by minting some stocks in prediction markets</p>
                <Button onClick={() => setActiveTab('mint')}>
                  <Zap className="h-4 w-4 mr-2" />
                  Mint Stocks
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStocks.map((stock) => (
                  <div key={stock.id} className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                    selectedStocks.includes(stock.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Selection Checkbox */}
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            checked={selectedStocks.includes(stock.id)}
                            onChange={() => toggleStockSelection(stock.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`text-xs ${
                              stock.type === 'yes' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {stock.type.toUpperCase()}
                            </Badge>
                            <Badge className={`text-xs ${
                              stock.pnl >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {stock.pnl >= 0 ? '+' : ''}{formatCurrency(stock.pnl)}
                            </Badge>
                          </div>
                          
                          <h4 className="font-semibold text-gray-900 mb-2">{stock.marketTitle}</h4>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Quantity</p>
                              <p className="font-medium">{stock.quantity}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Avg Price</p>
                              <p className="font-medium">{formatCurrency(stock.avgPrice)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Current Price</p>
                              <p className="font-medium">{formatCurrency(stock.currentPrice)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Total Value</p>
                              <p className="font-medium">{formatCurrency(stock.quantity * stock.currentPrice)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className={`text-lg font-bold flex items-center ${
                          stock.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stock.pnl >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                          {stock.pnlPercent >= 0 ? '+' : ''}{stock.pnlPercent.toFixed(1)}%
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add buy more functionality
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Buy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStock(stock.id);
                              setActiveTab('burn');
                            }}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Minus className="h-3 w-3 mr-1" />
                            Sell
                          </Button>
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

      {/* Mint Tab */}
      {activeTab === 'mint' && (
        <Card className="bg-white border-0 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Mint New Stocks</h3>
            </div>

            <div className="space-y-6">
              {/* Market Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Select Market
                </label>
                <select
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a market...</option>
                  {availableMarkets.map((market) => (
                    <option key={market.id} value={market.id}>
                      {market.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMarket && (
                <>
                  {/* Stock Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Stock Type
                    </label>
                    <div className="flex rounded-lg bg-gray-100 p-1">
                      <button
                        onClick={() => setMintType('yes')}
                        className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                          mintType === 'yes'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        YES Stocks
                      </button>
                      <button
                        onClick={() => setMintType('no')}
                        className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                          mintType === 'no'
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        NO Stocks
                      </button>
                    </div>
                  </div>

                  {/* Quantity Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Quantity to Mint
                    </label>
                    <div className="flex items-center">
                      <button
                        onClick={() => setMintQuantity(Math.max(1, mintQuantity - 10))}
                        className="p-2 rounded-l-lg border border-r-0 border-gray-300 hover:bg-gray-50"
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <input
                        type="number"
                        value={mintQuantity}
                        onChange={(e) => setMintQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 text-center border-t border-b border-gray-300 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                      <button
                        onClick={() => setMintQuantity(mintQuantity + 10)}
                        className="p-2 rounded-r-lg border border-l-0 border-gray-300 hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Cost Summary */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Minting Cost</span>
                      <span className="text-lg font-bold text-gray-900">₹{mintCost.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Info className="h-4 w-4" />
                      <span>Each stock costs ₹10 to mint (₹{mintQuantity} × ₹10)</span>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-orange-800 mb-1">Important</p>
                        <p className="text-orange-700">
                          Minting creates equal YES and NO positions. You'll receive {mintQuantity} {mintType.toUpperCase()} stocks 
                          and {mintQuantity} {mintType === 'yes' ? 'NO' : 'YES'} stocks.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mint Button */}
                  <Button 
                    onClick={handleMintStocks}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    disabled={!selectedMarket}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Mint {mintQuantity} Stocks for ₹{mintCost.toFixed(2)}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Burn Tab */}
      {activeTab === 'burn' && (
        <Card className="bg-white border-0 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trash2 className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Burn Existing Stocks</h3>
            </div>

            {userStocks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No stocks available to burn</p>
                <Button onClick={() => setActiveTab('mint')} variant="outline">
                  Mint Some Stocks First
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stock Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Select Stock to Burn
                  </label>
                  <select
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Choose a stock...</option>
                    {userStocks.map((stock) => (
                      <option key={stock.id} value={stock.id}>
                        {stock.marketTitle} - {stock.type.toUpperCase()} ({stock.quantity} available)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedStock && selectedStockData && (
                  <>
                    {/* Stock Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Stock Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Available Quantity</p>
                          <p className="font-medium">{selectedStockData.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Current Price</p>
                          <p className="font-medium">₹{selectedStockData.currentPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quantity to Burn */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Quantity to Burn
                      </label>
                      <div className="flex items-center">
                        <button
                          onClick={() => setBurnQuantity(Math.max(1, burnQuantity - 1))}
                          disabled={burnQuantity <= 1}
                          className="p-2 rounded-l-lg border border-r-0 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <input
                          type="number"
                          value={burnQuantity}
                          onChange={(e) => setBurnQuantity(Math.max(1, Math.min(selectedStockData.quantity, parseInt(e.target.value) || 1)))}
                          className="flex-1 text-center border-t border-b border-gray-300 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          min="1"
                          max={selectedStockData.quantity}
                        />
                        <button
                          onClick={() => setBurnQuantity(Math.min(selectedStockData.quantity, burnQuantity + 1))}
                          disabled={burnQuantity >= selectedStockData.quantity}
                          className="p-2 rounded-r-lg border border-l-0 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Burn Value */}
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">You'll Receive</span>
                        <span className="text-lg font-bold text-gray-900">₹{burnValue.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <Info className="h-4 w-4" />
                        <span>Based on current market price of ₹{selectedStockData.currentPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-red-800 mb-1">Permanent Action</p>
                          <p className="text-red-700">
                            Burning stocks is irreversible. You'll receive the current market value 
                            but lose your position in this market.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Burn Button */}
                    <Button 
                      onClick={handleBurnStocks}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                      disabled={!selectedStock}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Burn {burnQuantity} Stocks for {formatCurrency(burnValue)}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Portfolio Analytics Overview */}
          <Card className="p-6 bg-white border-0 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-blue-800">Total ROI</h4>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(1) : '0.0'}%
                </p>
                <p className="text-xs text-blue-700 mt-1">Return on Investment</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-green-800">Best Performer</h4>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {userStocks.length > 0 ? Math.max(...userStocks.map(s => s.pnlPercent)).toFixed(1) : '0.0'}%
                </p>
                <p className="text-xs text-green-700 mt-1">Highest P&L %</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-red-800">Worst Performer</h4>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-900">
                  {userStocks.length > 0 ? Math.min(...userStocks.map(s => s.pnlPercent)).toFixed(1) : '0.0'}%
                </p>
                <p className="text-xs text-red-700 mt-1">Lowest P&L %</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-purple-800">Avg Position Size</h4>
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(userStocks.length > 0 ? totalPortfolioValue / userStocks.length : 0)}
                </p>
                <p className="text-xs text-purple-700 mt-1">Per position</p>
              </div>
            </div>
          </Card>

          {/* Position Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white border-0 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Position Distribution</h4>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">YES Positions</span>
                    <span className="text-gray-600">
                      {userStocks.filter(s => s.type === 'yes').length} 
                      ({userStocks.length > 0 ? ((userStocks.filter(s => s.type === 'yes').length / userStocks.length) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${userStocks.length > 0 ? (userStocks.filter(s => s.type === 'yes').length / userStocks.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">NO Positions</span>
                    <span className="text-gray-600">
                      {userStocks.filter(s => s.type === 'no').length}
                      ({userStocks.length > 0 ? ((userStocks.filter(s => s.type === 'no').length / userStocks.length) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-600 h-2 rounded-full" 
                      style={{ 
                        width: `${userStocks.length > 0 ? (userStocks.filter(s => s.type === 'no').length / userStocks.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">Winning Positions</span>
                    <span className="text-gray-600">
                      {winningPositions} ({winRate.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${winRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">Losing Positions</span>
                    <span className="text-gray-600">
                      {losingPositions} ({userStocks.length > 0 ? ((losingPositions / userStocks.length) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ 
                        width: `${userStocks.length > 0 ? (losingPositions / userStocks.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-0 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Metrics</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Portfolio Concentration</span>
                  <span className="font-medium text-gray-900">
                    {userStocks.length > 0 ? 
                      ((Math.max(...userStocks.map(s => s.quantity * s.currentPrice)) / totalPortfolioValue) * 100).toFixed(1) + '%'
                      : '0%'
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Average Hold Time</span>
                  <span className="font-medium text-gray-900">15 days</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Volatility Score</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Risk Rating</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {totalPortfolioValue > 10000 ? 'High' : totalPortfolioValue > 5000 ? 'Medium' : 'Low'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Diversification</span>
                  <span className="font-medium text-gray-900">
                    {userStocks.length > 5 ? 'Good' : userStocks.length > 2 ? 'Fair' : 'Poor'}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Top Performers */}
          {userStocks.length > 0 && (
            <Card className="p-6 bg-white border-0 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Top & Bottom Performers</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Top Performers
                  </h5>
                  <div className="space-y-2">
                    {userStocks
                      .filter(s => s.pnl > 0)
                      .sort((a, b) => b.pnlPercent - a.pnlPercent)
                      .slice(0, 3)
                      .map((stock) => (
                        <div key={stock.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{stock.marketTitle.slice(0, 40)}...</p>
                            <p className="text-xs text-gray-600">{stock.type.toUpperCase()} • {stock.quantity} shares</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">+{stock.pnlPercent.toFixed(1)}%</p>
                            <p className="text-xs text-gray-600">{formatCurrency(stock.pnl)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-red-800 mb-3 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Bottom Performers
                  </h5>
                  <div className="space-y-2">
                    {userStocks
                      .filter(s => s.pnl < 0)
                      .sort((a, b) => a.pnlPercent - b.pnlPercent)
                      .slice(0, 3)
                      .map((stock) => (
                        <div key={stock.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{stock.marketTitle.slice(0, 40)}...</p>
                            <p className="text-xs text-gray-600">{stock.type.toUpperCase()} • {stock.quantity} shares</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">{stock.pnlPercent.toFixed(1)}%</p>
                            <p className="text-xs text-gray-600">{formatCurrency(stock.pnl)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}