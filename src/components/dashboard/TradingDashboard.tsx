import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Markets } from './Markets';
import { OrderPlacement } from './OrderPlacement';
import { Orderbook } from './Orderbook';
import { StockManager } from './StockManager';
import { 
  TrendingUp, 
  DollarSign, 
  Target,
  Activity,
  Users,
  BarChart3,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from "lucide-react";

export function TradingDashboard() {
  const [activeView, setActiveView] = useState<'overview' | 'markets' | 'trading' | 'stocks'>('overview');
  const [selectedMarket, setSelectedMarket] = useState<any>(null);

  // Mock data - in real app this would come from your API/state management
  const portfolioStats = [
    {
      title: "Portfolio Value",
      value: "₹1,04,750",
      change: "+12.5%",
      changeValue: "+₹11,520",
      trend: "up",
      icon: DollarSign
    },
    {
      title: "Active Positions",
      value: "8",
      change: "+3",
      changeValue: "from last week",
      trend: "up", 
      icon: Target
    },
    {
      title: "Total Returns",
      value: "₹20,750",
      change: "+18.7%",
      changeValue: "this month",
      trend: "up",
      icon: TrendingUp
    },
    {
      title: "Win Rate",
      value: "73%",
      change: "+5%",
      changeValue: "vs last month",
      trend: "up",
      icon: Activity
    }
  ];

  const mockMarket = {
    id: '1',
    title: 'Bitcoin to reach ₹84L by 2024?',
    yesPrice: 4.2,
    noPrice: 5.8,
    availableQuantity: 1000,
    lastPrice: 4.2,
    change: 0.3,
    changePercent: 7.8
  };

  const mockUserStocks = [
    {
      id: '1',
      marketId: '1',
      marketTitle: 'Bitcoin to reach ₹84L by 2024?',
      type: 'yes' as const,
      quantity: 150,
      avgPrice: 3.8,
      currentPrice: 4.2,
      pnl: 60.0,
      pnlPercent: 10.5
    },
    {
      id: '2',
      marketId: '2',
      marketTitle: 'Tesla stock above ₹25,000 by Q1 2025?',
      type: 'no' as const,
      quantity: 100,
      avgPrice: 3.5,
      currentPrice: 3.3,
      pnl: -20.0,
      pnlPercent: -5.7
    }
  ];

  const activePositions = [
    {
      title: "Will AI achieve AGI by 2025?",
      category: "Technology",
      position: "YES",
      shares: 150,
      currentPrice: 34,
      entryPrice: 28,
      pnl: "+₹7,560",
      pnlPercent: "+21.4%",
      trend: "up"
    },
    {
      title: "Fed Rate Cut by Q2 2024?",
      category: "Economics",
      position: "YES", 
      shares: 200,
      currentPrice: 73,
      entryPrice: 65,
      pnl: "+₹13,440",
      pnlPercent: "+12.3%",
      trend: "up"
    },
    {
      title: "2024 Election Prediction",
      category: "Politics",
      position: "NO",
      shares: 100,
      currentPrice: 48,
      entryPrice: 52,
      pnl: "-₹3,360",
      pnlPercent: "-7.7%",
      trend: "down"
    }
  ];

  const trendingMarkets = [
    {
      title: "Bitcoin hits ₹84L by end of 2024?",
      category: "Crypto",
      volume: "₹7.5L",
      yesPrice: 42,
      noPrice: 58,
      change: "+5%"
    },
    {
      title: "Tesla stock above ₹25,000 by Q1 2025?",
      category: "Stocks",
      volume: "₹13L", 
      yesPrice: 67,
      noPrice: 33,
      change: "+12%"
    }
  ];

  const renderQuickActions = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Button
        onClick={() => setActiveView('markets')}
        variant="outline"
        className="h-20 flex-col gap-2 border-2 hover:border-blue-500 hover:bg-blue-50"
      >
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <span className="font-medium">Browse Markets</span>
      </Button>
      
      <Button
        onClick={() => setActiveView('trading')}
        variant="outline"
        className="h-20 flex-col gap-2 border-2 hover:border-green-500 hover:bg-green-50"
      >
        <Activity className="h-6 w-6 text-green-600" />
        <span className="font-medium">View Orderbook</span>
      </Button>
      
      <Button
        onClick={() => setActiveView('stocks')}
        variant="outline"
        className="h-20 flex-col gap-2 border-2 hover:border-purple-500 hover:bg-purple-50"
      >
        <Zap className="h-6 w-6 text-purple-600" />
        <span className="font-medium">Manage Stocks</span>
      </Button>
      
      <Button
        variant="outline"
        className="h-20 flex-col gap-2 border-2 hover:border-orange-500 hover:bg-orange-50"
      >
        <Clock className="h-6 w-6 text-orange-600" />
        <span className="font-medium">Trade History</span>
      </Button>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8">
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
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveView('stocks')}
                >
                  View All
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {activePositions.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {position.category}
                        </Badge>
                        <Badge className={`text-xs ${
                          position.position === 'YES' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {position.position}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{position.title}</h3>
                      <p className="text-sm text-gray-600">
                        {position.shares} shares • ₹{position.currentPrice} current
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        position.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {position.pnl}
                      </div>
                      <div className="text-sm text-gray-500">{position.pnlPercent}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Trending Markets */}
        <div>
          <Card className="bg-white border-0 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Trending Markets</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveView('markets')}
                >
                  View All
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {trendingMarkets.map((market, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {market.category}
                      </Badge>
                      <div className="text-sm font-medium text-green-600">
                        {market.change}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm line-clamp-2">
                      {market.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1">
                          Yes ₹{market.yesPrice}
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs px-3 py-1">
                          No ₹{market.noPrice}
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500">
                        Vol: {market.volume}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeView === 'overview' && 'Trading Dashboard'}
              {activeView === 'markets' && 'Markets'}
              {activeView === 'trading' && 'Trading & Orderbook'}
              {activeView === 'stocks' && 'Stock Manager'}
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <button 
                onClick={() => setActiveView('overview')}
                className={activeView === 'overview' ? 'text-blue-600 font-medium' : 'hover:text-gray-900'}
              >
                Dashboard
              </button>
              {activeView !== 'overview' && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="font-medium text-gray-900">
                    {activeView === 'markets' && 'Markets'}
                    {activeView === 'trading' && 'Trading'}
                    {activeView === 'stocks' && 'Stock Manager'}
                  </span>
                </>
              )}
            </div>
          </div>

          {activeView !== 'overview' && (
            <Button onClick={() => setActiveView('overview')} variant="outline">
              Back to Dashboard
            </Button>
          )}
        </div>

        {/* Quick Actions */}
        {activeView === 'overview' && renderQuickActions()}

        {/* Main Content */}
        {activeView === 'overview' && renderOverview()}
        
        {activeView === 'markets' && <Markets />}
        
        {activeView === 'trading' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Orderbook market={mockMarket} />
            </div>
            <div>
              <OrderPlacement market={mockMarket} />
            </div>
          </div>
        )}
        
        {activeView === 'stocks' && (
          <StockManager 
            userStocks={mockUserStocks}
            onMint={(marketId, type, quantity) => {
              console.log('Minting:', { marketId, type, quantity });
            }}
            onBurn={(stockId, quantity) => {
              console.log('Burning:', { stockId, quantity });
            }}
          />
        )}
      </div>
    </div>
  );
} 