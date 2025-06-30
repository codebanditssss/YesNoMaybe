"use client"

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { Card } from "@/components/ui/card";

interface PortfolioAnalyticsProps {
  data: {
    positions: any[];
    history: any[];
    summary: {
      totalValue: number;
      totalPnl: number;
      winRate: number;
      volume: number;
    };
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export function PortfolioAnalytics({ data }: PortfolioAnalyticsProps) {
  // Calculate category allocation data
  const categoryData = useMemo(() => {
    const categories = data.positions.reduce((acc: any, pos: any) => {
      const category = pos.marketCategory || 'Other';
      if (!acc[category]) {
        acc[category] = {
          name: category,
          value: 0,
          positions: 0,
          pnl: 0
        };
      }
      acc[category].value += pos.totalInvested || 0;
      acc[category].positions += 1;
      acc[category].pnl += (pos.unrealizedPnL || 0) + (pos.realizedPnL || 0);
      return acc;
    }, {});

    return Object.values(categories);
  }, [data.positions]);

  // Calculate daily P&L distribution
  const dailyPnLData = useMemo(() => {
    const pnlByDay = data.history.reduce((acc: any, trade: any) => {
      const date = new Date(trade.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          date,
          pnl: 0,
          volume: 0,
          trades: 0,
          totalValue: trade.totalValue || 0
        };
      }
      acc[date].pnl += trade.pnl || 0;
      acc[date].volume += trade.volume || 0;
      acc[date].trades += 1;
      if (trade.totalValue > acc[date].totalValue) {
        acc[date].totalValue = trade.totalValue;
      }
      return acc;
    }, {});

    const dates = Object.keys(pnlByDay).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    
    if (dates.length > 0) {
      const startDate = new Date(dates[0]);
      const endDate = new Date();
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toLocaleDateString();
        if (!pnlByDay[dateStr]) {
          const lastDate = dates.filter(d => new Date(d) < currentDate)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
          const lastValue = lastDate ? pnlByDay[lastDate].totalValue : 0;
          
          pnlByDay[dateStr] = {
            date: dateStr,
            pnl: 0,
            volume: 0,
            trades: 0,
            totalValue: lastValue
          };
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return Object.values(pnlByDay).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data.history]);

  // Calculate performance metrics with better aggregation
  const performanceData = useMemo(() => {
    const metrics = {
      winRate: data.summary.winRate || 0,
      avgTradeSize: data.summary.volume / (data.history.length || 1),
      profitFactor: 0,
      riskScore: 0
    };

    let totalWins = 0;
    let totalLosses = 0;
    data.history.forEach((trade: any) => {
      const pnl = trade.pnl || 0;
      if (pnl > 0) totalWins += pnl;
      else totalLosses += Math.abs(pnl);
    });
    metrics.profitFactor = totalLosses > 0 ? totalWins / totalLosses : 1;

    const volatility = data.history.reduce((acc: number, trade: any) => {
      return acc + Math.pow(trade.pnl || 0, 2);
    }, 0) / (data.history.length || 1);
    
    const maxDrawdown = data.history.reduce((acc: number, trade: any) => {
      return Math.min(acc, trade.pnl || 0);
    }, 0);

    metrics.riskScore = Math.min(100, Math.max(0,
      50 +
      (metrics.winRate - 50) * 0.5 +
      (metrics.profitFactor - 1) * 10 +
      Math.min(0, maxDrawdown / 1000) +
      Math.min(0, -Math.sqrt(volatility) / 10)
    ));

    return [
      { name: 'Win Rate', value: metrics.winRate },
      { name: 'Avg Trade', value: metrics.avgTradeSize },
      { name: 'Profit Factor', value: metrics.profitFactor * 100 },
      { name: 'Risk Score', value: metrics.riskScore }
    ];
  }, [data.summary, data.history]);

  return (
    <div className="space-y-6">
      {/* Top Row - Category Allocation and Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Allocation */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Category Allocation</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip formatter={(value: number) => formatPercent(value)} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Row - P&L Distribution and Volume Analysis */}
      <div className="grid grid-cols-1 gap-6">
        {/* Daily P&L and Volume */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daily P&L and Volume</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyPnLData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={formatCurrency}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar
                  yAxisId="right"
                  dataKey="volume"
                  fill="#82ca9d"
                  name="Volume"
                  opacity={0.3}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="pnl"
                  stroke="#8884d8"
                  name="P&L"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
} 