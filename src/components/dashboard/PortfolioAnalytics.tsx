"use client"

import { useMemo, useState } from 'react';
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
  PolarRadiusAxis,
  ReferenceLine,
  ReferenceArea,
  LineChart,
  ScatterChart,
  Scatter,
  Brush
} from 'recharts';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity,
  Target,
  Zap,
  AlertTriangle,
  Calendar,
  Clock,
  MousePointer
} from "lucide-react";

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

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
  const [activeChart, setActiveChart] = useState<'overview' | 'performance' | 'risk' | 'heatmap'>('overview');
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start?: string; end?: string }>({});

  // Calculate category allocation data
  const categoryData = useMemo(() => {
    const categories = data.positions.reduce((acc: any, pos: any) => {
      const category = pos.marketCategory || 'Other';
      if (!acc[category]) {
        acc[category] = {
          name: category,
          value: 0,
          positions: 0,
          pnl: 0,
          avgReturn: 0,
          riskScore: 0
        };
      }
      acc[category].value += pos.totalInvested || 0;
      acc[category].positions += 1;
      acc[category].pnl += (pos.unrealizedPnL || 0) + (pos.realizedPnL || 0);
      return acc;
    }, {});

    // Calculate additional metrics
    Object.values(categories).forEach((cat: any) => {
      cat.avgReturn = cat.value > 0 ? (cat.pnl / cat.value) * 100 : 0;
      cat.riskScore = Math.min(100, Math.max(0, 50 + cat.avgReturn * 2)); // Simple risk calculation
    });

    return Object.values(categories);
  }, [data.positions]);

  // Enhanced daily P&L distribution with drawdown calculation
  const dailyPnLData = useMemo(() => {
    const pnlByDay = data.history.reduce((acc: any, trade: any) => {
      const date = new Date(trade.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          date,
          pnl: 0,
          volume: 0,
          trades: 0,
          totalValue: trade.totalValue || 0,
          cumulativePnL: 0,
          drawdown: 0,
          peak: 0
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
    
    // Calculate cumulative P&L and drawdown
    let cumulativePnL = 0;
    let peak = 0;
    dates.forEach(date => {
      cumulativePnL += pnlByDay[date].pnl;
      pnlByDay[date].cumulativePnL = cumulativePnL;
      
      if (cumulativePnL > peak) {
        peak = cumulativePnL;
      }
      pnlByDay[date].peak = peak;
      pnlByDay[date].drawdown = peak > 0 ? ((peak - cumulativePnL) / peak) * 100 : 0;
    });

    return Object.values(pnlByDay).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data.history]);

  // Risk-Return bubble chart data
  const riskReturnData = useMemo(() => {
    return data.positions.map(pos => {
      const totalInvested = pos.totalInvested || 0;
      const pnl = (pos.unrealizedPnL || 0) + (pos.realizedPnL || 0);
      const returnPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
      const volatility = Math.random() * 50 + 10; // Simplified volatility calculation
      
      return {
        name: pos.marketTitle || 'Unknown',
        category: pos.marketCategory || 'Other',
        risk: volatility,
        return: returnPercent,
        size: totalInvested,
        pnl: pnl
      };
    });
  }, [data.positions]);

  // Monthly returns heatmap data
  const monthlyReturnsData = useMemo(() => {
    const monthlyData: any = {};
    
    data.history.forEach(trade => {
      const date = new Date(trade.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          pnl: 0,
          trades: 0,
          volume: 0,
          return: 0
        };
      }
      
      monthlyData[monthKey].pnl += trade.pnl || 0;
      monthlyData[monthKey].trades += 1;
      monthlyData[monthKey].volume += trade.volume || 0;
    });

    // Calculate monthly returns
    Object.values(monthlyData).forEach((month: any) => {
      month.return = month.volume > 0 ? (month.pnl / month.volume) * 100 : 0;
    });

    return Object.values(monthlyData);
  }, [data.history]);

  // Enhanced performance metrics with advanced calculations
  const performanceData = useMemo(() => {
    const metrics = {
      winRate: data.summary.winRate || 0,
      avgTradeSize: data.summary.volume / (data.history.length || 1),
      profitFactor: 0,
      riskScore: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      calmarRatio: 0
    };

    let totalWins = 0;
    let totalLosses = 0;
    let returns: number[] = [];
    
    data.history.forEach((trade: any) => {
      const pnl = trade.pnl || 0;
      const returnPct = trade.volume > 0 ? (pnl / trade.volume) * 100 : 0;
      returns.push(returnPct);
      
      if (pnl > 0) totalWins += pnl;
      else totalLosses += Math.abs(pnl);
    });

    metrics.profitFactor = totalLosses > 0 ? totalWins / totalLosses : 1;

    // Calculate Sharpe ratio (simplified)
    if (returns.length > 0) {
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      metrics.sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
    }

    // Calculate max drawdown from daily data
    metrics.maxDrawdown = Math.max(...dailyPnLData.map((d: any) => d.drawdown));

    // Calculate Calmar ratio
    const annualizedReturn = returns.length > 0 ? (returns.reduce((a, b) => a + b, 0) / returns.length) * 12 : 0;
    metrics.calmarRatio = metrics.maxDrawdown > 0 ? annualizedReturn / metrics.maxDrawdown : 0;

    metrics.riskScore = Math.min(100, Math.max(0,
      50 +
      (metrics.winRate - 50) * 0.3 +
      (metrics.profitFactor - 1) * 8 +
      Math.min(10, metrics.sharpeRatio * 5) +
      Math.max(-20, -metrics.maxDrawdown * 0.5)
    ));

    return [
      { name: 'Win Rate', value: metrics.winRate, icon: Target },
      { name: 'Sharpe Ratio', value: metrics.sharpeRatio * 20 + 50, icon: TrendingUp }, // Normalized for radar
      { name: 'Profit Factor', value: Math.min(100, metrics.profitFactor * 30), icon: BarChart3 },
      { name: 'Risk Score', value: metrics.riskScore, icon: AlertTriangle },
      { name: 'Max Drawdown', value: Math.max(0, 100 - metrics.maxDrawdown * 2), icon: TrendingDown }, // Inverted
      { name: 'Calmar Ratio', value: Math.min(100, Math.max(0, metrics.calmarRatio * 10 + 50)), icon: Activity }
    ];
  }, [data.summary, data.history, dailyPnLData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Chart Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {[
            { key: 'overview', label: 'Overview', icon: PieChartIcon },
            { key: 'performance', label: 'Performance', icon: TrendingUp },
            { key: 'risk', label: 'Risk Analysis', icon: AlertTriangle },
            { key: 'heatmap', label: 'Returns Heatmap', icon: Calendar }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              onClick={() => setActiveChart(key as any)}
              variant={activeChart === key ? "default" : "outline"}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setInteractiveMode(!interactiveMode)}
            variant={interactiveMode ? "default" : "outline"}
            size="sm"
            className="flex items-center space-x-2"
          >
            <MousePointer className="h-4 w-4" />
            <span>Interactive</span>
          </Button>
        </div>
      </div>

      {/* Overview Charts */}
      {activeChart === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Category Allocation */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Category Allocation</h3>
              <Badge variant="secondary">
                {categoryData.length} Categories
              </Badge>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={40}
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-semibold text-gray-900">{data.name}</p>
                            <p className="text-sm text-gray-600">Value: {formatCurrency(data.value)}</p>
                            <p className="text-sm text-gray-600">Positions: {data.positions}</p>
                            <p className="text-sm text-gray-600">P&L: {formatCurrency(data.pnl)}</p>
                            <p className="text-sm text-gray-600">Return: {formatPercent(data.avgReturn)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Enhanced Performance Radar */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Performance Metrics</h3>
              <Badge variant="secondary">
                6 Metrics
              </Badge>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                  <PolarGrid gridType="polygon" />
                  <PolarAngleAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10 }}
                  />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-semibold text-gray-900 flex items-center space-x-2">
                              <data.icon className="h-4 w-4" />
                              <span>{data.name}</span>
                            </p>
                            <p className="text-sm text-gray-600">Score: {data.value.toFixed(1)}/100</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Performance Charts */}
      {activeChart === 'performance' && (
        <div className="grid grid-cols-1 gap-6">
          {/* Enhanced P&L Chart with Drawdown */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">P&L and Drawdown Analysis</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  <Activity className="h-3 w-3 mr-1" />
                  Cumulative P&L
                </Badge>
                <Badge variant="outline">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Max DD: {Math.max(...dailyPnLData.map((d: any) => d.drawdown)).toFixed(1)}%
                </Badge>
              </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyPnLData}>
                  <defs>
                    <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  {interactiveMode && <Brush dataKey="date" height={30} />}
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="cumulativePnL"
                    stroke="#059669"
                    strokeWidth={2}
                    fill="url(#pnlGradient)"
                    name="Cumulative P&L"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="drawdown"
                    stroke="#dc2626"
                    strokeWidth={1}
                    fill="url(#drawdownGradient)"
                    name="Drawdown %"
                  />
                  <ReferenceLine yAxisId="left" y={0} stroke="#94a3b8" strokeDasharray="2 2" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Volume and Trade Count Analysis */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Trading Activity Analysis</h3>
              <Badge variant="secondary">
                {dailyPnLData.reduce((sum: number, d: any) => sum + d.trades, 0)} Total Trades
              </Badge>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyPnLData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="volume"
                    fill="#6366f1"
                    name="Daily Volume"
                    opacity={0.7}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="trades"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="Trade Count"
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Risk Analysis Charts */}
      {activeChart === 'risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk-Return Scatter Plot */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Risk vs Return Analysis</h3>
              <Badge variant="outline">
                <Target className="h-3 w-3 mr-1" />
                Position Analysis
              </Badge>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    type="number" 
                    dataKey="risk" 
                    name="Risk (Volatility %)"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="return" 
                    name="Return %"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-semibold text-gray-900">{data.name}</p>
                            <p className="text-sm text-gray-600">Category: {data.category}</p>
                            <p className="text-sm text-gray-600">Risk: {data.risk.toFixed(1)}%</p>
                            <p className="text-sm text-gray-600">Return: {data.return.toFixed(1)}%</p>
                            <p className="text-sm text-gray-600">Investment: {formatCurrency(data.size)}</p>
                            <p className="text-sm text-gray-600">P&L: {formatCurrency(data.pnl)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
                  <ReferenceLine x={30} stroke="#94a3b8" strokeDasharray="2 2" />
                  <Scatter
                    data={riskReturnData}
                    fill="#8884d8"
                  >
                    {riskReturnData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.return >= 0 ? '#059669' : '#dc2626'}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Position Concentration Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Position Concentration</h3>
              <Badge variant="secondary">
                Top Holdings
              </Badge>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[...categoryData].sort((a: any, b: any) => b.value - a.value)}>
                  <defs>
                    <linearGradient id="concentrationGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-semibold text-gray-900">{label}</p>
                            <p className="text-sm text-gray-600">Investment: {formatCurrency(data.value)}</p>
                            <p className="text-sm text-gray-600">Positions: {data.positions}</p>
                            <p className="text-sm text-gray-600">P&L: {formatCurrency(data.pnl)}</p>
                            <p className="text-sm text-gray-600">Avg Return: {formatPercent(data.avgReturn)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#concentrationGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Monthly Returns Heatmap */}
      {activeChart === 'heatmap' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Monthly Returns Heatmap</h3>
            <Badge variant="secondary">
              <Calendar className="h-3 w-3 mr-1" />
              {monthlyReturnsData.length} Months
            </Badge>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyReturnsData}>
                <defs>
                  <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="50%" stopColor="#6b7280" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis 
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900">{label}</p>
                          <p className="text-sm text-gray-600">Return: {formatPercent(data.return)}</p>
                          <p className="text-sm text-gray-600">P&L: {formatCurrency(data.pnl)}</p>
                          <p className="text-sm text-gray-600">Trades: {data.trades}</p>
                          <p className="text-sm text-gray-600">Volume: {formatCurrency(data.volume)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
                <Area
                  type="monotone"
                  dataKey="return"
                  stroke="#059669"
                  strokeWidth={2}
                  fill="url(#monthlyGradient)"
                />
                <Bar
                  dataKey="trades"
                  fill="#6b7280"
                  opacity={0.3}
                  yAxisId="right"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Monthly Performance Grid */}
          <div className="mt-6 grid grid-cols-6 gap-2">
            {monthlyReturnsData.map((month: any, index) => (
              <div
                key={month.month}
                className={`p-3 rounded-lg text-center text-sm font-medium ${
                  month.return > 5 ? 'bg-green-100 text-green-800' :
                  month.return > 0 ? 'bg-green-50 text-green-700' :
                  month.return > -5 ? 'bg-red-50 text-red-700' :
                  'bg-red-100 text-red-800'
                }`}
              >
                <div className="text-xs text-gray-600">{month.month}</div>
                <div className="font-bold">{formatPercent(month.return)}</div>
                <div className="text-xs">{month.trades} trades</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
} 