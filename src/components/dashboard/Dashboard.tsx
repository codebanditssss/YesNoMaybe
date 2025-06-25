import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
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
  ArrowDownRight
} from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();

  const portfolioStats = [
    {
      title: "Portfolio Value",
      value: "$1,247.50",
      change: "+12.5%",
      changeValue: "+$137.20",
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
      value: "$247.50",
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

  const activePositions = [
    {
      title: "Will AI achieve AGI by 2025?",
      category: "Technology",
      position: "YES",
      shares: 150,
      currentPrice: 34,
      entryPrice: 28,
      pnl: "+$90.00",
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
      pnl: "+$160.00",
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
      pnl: "-$40.00",
      pnlPercent: "-7.7%",
      trend: "down"
    }
  ];

  const trendingMarkets = [
    {
      title: "Bitcoin hits $100K by end of 2024?",
      category: "Crypto",
      volume: "$89K",
      yesPrice: 42,
      noPrice: 58,
      change: "+5%"
    },
    {
      title: "Tesla stock above $300 by Q1 2025?",
      category: "Stocks",
      volume: "$156K", 
      yesPrice: 67,
      noPrice: 33,
      change: "+12%"
    },
    {
      title: "ChatGPT-5 released by OpenAI in 2024?",
      category: "Technology",
      volume: "$203K",
      yesPrice: 78,
      noPrice: 22,
      change: "-3%"
    }
  ];

  const recentActivity = [
    {
      type: "Position opened",
      description: "Bought 100 YES shares in AI AGI market",
      time: "2 hours ago",
      status: "success"
    },
    {
      type: "Market resolved",
      description: "Won $45 from Election prediction",
      time: "5 hours ago",
      status: "info"
    },
    {
      type: "Position closed",
      description: "Sold 50 NO shares in Fed Rate market",
      time: "1 day ago",
      status: "warning"
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back, {user?.email?.split('@')[0] || 'Trader'}
          </p>
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
                  <Button variant="outline" size="sm" className="text-sm">
                    View All
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {activePositions.map((position, index) => (
                    <div key={index} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              {position.category}
                            </Badge>
                            <Badge 
                              variant={position.position === 'YES' ? 'default' : 'secondary'} 
                              className="text-xs px-2 py-1"
                            >
                              {position.position}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm mb-2 leading-5">
                            {position.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{position.shares} shares</span>
                            <span>Current: {position.currentPrice}¢</span>
                            <span>Entry: {position.entryPrice}¢</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`flex items-center justify-end mb-1 ${
                            position.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {position.trend === 'up' ? (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                            )}
                            <span className="font-semibold text-sm">{position.pnl}</span>
                          </div>
                          <p className={`text-xs ${
                            position.trend === 'up' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {position.pnlPercent}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white border-0 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <Button className="w-full justify-start bg-gray-900 hover:bg-gray-800" size="lg">
                    <BarChart3 className="mr-3 h-4 w-4" />
                    Browse Markets
                  </Button>
                  <Button className="w-full justify-start" variant="outline" size="lg">
                    <TrendingUp className="mr-3 h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button className="w-full justify-start" variant="outline" size="lg">
                    <Clock className="mr-3 h-4 w-4" />
                    Trade History
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white border-0 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'info' ? 'bg-blue-500' : 'bg-orange-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type}
                        </p>
                        <p className="text-sm text-gray-600 leading-5">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Trending Markets */}
        <Card className="p-6 border border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-black">Trending Markets</h2>
            <Button variant="outline" size="sm">
              Explore All
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {trendingMarkets.map((market, index) => (
              <div key={index} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {market.category}
                  </Badge>
                  <span className={`text-sm font-medium ${market.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {market.change}
                  </span>
                </div>
                <h3 className="font-medium text-black text-sm mb-3">
                  {market.title}
                </h3>
                <div className="flex justify-between items-center text-xs mb-3">
                  <div className="text-center">
                    <div className="text-green-600 font-medium">YES</div>
                    <div className="text-gray-500">{market.yesPrice}¢</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 font-medium">NO</div>
                    <div className="text-gray-500">{market.noPrice}¢</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Volume</div>
                    <div className="text-gray-500">{market.volume}</div>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  Trade
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 