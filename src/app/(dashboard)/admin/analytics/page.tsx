'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Calendar,
  PieChart,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  userGrowth: {
    total: number;
    growth: number;
    newThisMonth: number;
  };
  tradingVolume: {
    total: string;
    growth: number;
    avgDaily: string;
  };
  marketActivity: {
    totalMarkets: number;
    activeMarkets: number;
    resolvedMarkets: number;
  };
  revenue: {
    total: string;
    growth: number;
    fees: string;
  };
}

interface ChartData {
  period: string;
  users: number;
  volume: number;
  trades: number;
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: {
      total: 12547,
      growth: 15.2,
      newThisMonth: 1847
    },
    tradingVolume: {
      total: '$2,847,392',
      growth: 23.1,
      avgDaily: '$94,913'
    },
    marketActivity: {
      totalMarkets: 1256,
      activeMarkets: 247,
      resolvedMarkets: 1009
    },
    revenue: {
      total: '$142,370',
      growth: 18.7,
      fees: '$28,474'
    }
  });

  const [chartData, setChartData] = useState<ChartData[]>([
    { period: 'Jan', users: 8500, volume: 1200000, trades: 3400 },
    { period: 'Feb', users: 9200, volume: 1580000, trades: 4100 },
    { period: 'Mar', users: 10100, volume: 1890000, trades: 4800 },
    { period: 'Apr', users: 10800, volume: 2100000, trades: 5200 },
    { period: 'May', users: 11600, volume: 2350000, trades: 5900 },
    { period: 'Jun', users: 12547, volume: 2847392, trades: 6847 }
  ]);

  const [timeframe, setTimeframe] = useState('6m');
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update data would happen here
    } catch (error) {
      console.error('Failed to refresh analytics data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const exportData = () => {
    // Simulate data export
    console.log('Exporting analytics data...');
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-8 w-8 text-red-600 mr-3" />
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Platform performance and user engagement insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.userGrowth.total.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getGrowthIcon(analyticsData.userGrowth.growth)}
            <span className={`ml-1 text-sm font-medium ${getGrowthColor(analyticsData.userGrowth.growth)}`}>
              {analyticsData.userGrowth.growth > 0 ? '+' : ''}{analyticsData.userGrowth.growth}%
            </span>
            <span className="ml-2 text-sm text-gray-600">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trading Volume</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.tradingVolume.total}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getGrowthIcon(analyticsData.tradingVolume.growth)}
            <span className={`ml-1 text-sm font-medium ${getGrowthColor(analyticsData.tradingVolume.growth)}`}>
              {analyticsData.tradingVolume.growth > 0 ? '+' : ''}{analyticsData.tradingVolume.growth}%
            </span>
            <span className="ml-2 text-sm text-gray-600">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Markets</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.marketActivity.activeMarkets}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {analyticsData.marketActivity.totalMarkets} total markets
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.revenue.total}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getGrowthIcon(analyticsData.revenue.growth)}
            <span className={`ml-1 text-sm font-medium ${getGrowthColor(analyticsData.revenue.growth)}`}>
              {analyticsData.revenue.growth > 0 ? '+' : ''}{analyticsData.revenue.growth}%
            </span>
            <span className="ml-2 text-sm text-gray-600">vs last month</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {chartData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                  style={{
                    height: `${(data.users / Math.max(...chartData.map(d => d.users))) * 200}px`,
                    minHeight: '4px'
                  }}
                  title={`${data.period}: ${data.users.toLocaleString()} users`}
                ></div>
                <p className="text-xs text-gray-600 mt-2">{data.period}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Volume Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Volume</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {chartData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-green-500 rounded-t-sm transition-all duration-300 hover:bg-green-600"
                  style={{
                    height: `${(data.volume / Math.max(...chartData.map(d => d.volume))) * 200}px`,
                    minHeight: '4px'
                  }}
                  title={`${data.period}: $${data.volume.toLocaleString()}`}
                ></div>
                <p className="text-xs text-gray-600 mt-2">{data.period}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Performing Markets */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 text-red-600 mr-2" />
            Top Performing Markets
          </h3>
          <div className="space-y-4">
            {[
              { name: 'Bitcoin to reach $100k by 2024', volume: '$147,392', trades: 1247 },
              { name: 'AI will replace 50% of jobs', volume: '$89,234', trades: 892 },
              { name: 'Tesla stock above $300', volume: '$67,181', trades: 734 },
              { name: 'Climate change reversed', volume: '$45,928', trades: 567 },
              { name: 'Quantum computing breakthrough', volume: '$38,472', trades: 423 }
            ].map((market, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{market.name}</p>
                  <p className="text-xs text-gray-600">{market.trades} trades</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{market.volume}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Engagement */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 text-red-600 mr-2" />
            User Engagement
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Daily Active Users</span>
              <span className="font-semibold">3,247</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Session Time</span>
              <span className="font-semibold">14m 32s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pages per Session</span>
              <span className="font-semibold">4.7</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bounce Rate</span>
              <span className="font-semibold">23.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Return Visitors</span>
              <span className="font-semibold">68.4%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mobile Users</span>
              <span className="font-semibold">45.2%</span>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 text-red-600 mr-2" />
            Revenue Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Trading Fees</span>
              <span className="font-semibold">$89,473</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Withdrawal Fees</span>
              <span className="font-semibold">$23,847</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Premium Features</span>
              <span className="font-semibold">$18,392</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Market Creation</span>
              <span className="font-semibold">$7,234</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Other</span>
              <span className="font-semibold">$3,424</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between font-semibold">
                <span>Total Revenue</span>
                <span className="text-green-600">$142,370</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 