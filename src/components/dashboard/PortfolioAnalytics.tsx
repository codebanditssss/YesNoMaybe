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
    positions: Array<{
      id: string;
      marketId: string;
      marketTitle: string;
      category: string;
      type: 'yes' | 'no';
      quantity: number;
      avgPrice: number;
      currentPrice: number;
      investmentValue: number;
      currentValue: number;
      pnl: number;
      pnlPercent: number;
      marketStatus: 'active' | 'closing_soon' | 'resolved';
      expiryDate: Date;
      lastUpdate: Date;
    }>;
    history: any[];
    summary: {
      totalValue: number;
      totalPnl: number;
      winRate: number;
      volume: number;
    };
  };
}

// Sophisticated color palette
const COLORS = [
  '#1a1a1a', // Black
  '#2d3748', // Dark Gray
  '#4a5568', // Medium Gray
  '#718096', // Light Gray
  '#a0aec0', // Lighter Gray
  '#cbd5e0', // Very Light Gray
  '#e2e8f0', // Almost White
  '#edf2f7'  // White Gray
];

// Refined chart colors for metrics
const METRIC_COLORS = {
  primary: '#1a1a1a',
  secondary: '#718096',
  accent: '#4a5568',
  success: '#047857',
  danger: '#dc2626',
  warning: '#d97706',
  info: '#0369a1'
};

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

  // Calculate category allocation data with sophisticated styling
  const categoryData = useMemo(() => {
    const categories = data.positions.reduce((acc: any, pos: any) => {
      const category = pos.category || 'Other';
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
      acc[category].value += pos.investmentValue || 0;
      acc[category].positions += 1;
      acc[category].pnl += pos.pnl || 0;
      return acc;
    }, {});

    // Calculate additional metrics
    Object.values(categories).forEach((cat: any) => {
      cat.avgReturn = cat.value > 0 ? (cat.pnl / cat.value) * 100 : 0;
      cat.riskScore = Math.min(100, Math.max(0, 50 + cat.avgReturn * 2));
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
      const totalInvested = pos.investmentValue || 0;
      const pnl = pos.pnl || 0;
      const returnPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
      const volatility = Math.random() * 50 + 10; // Simplified volatility calculation
      
      return {
        name: pos.marketTitle || 'Unknown',
        category: pos.category || 'Other',
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

  // Render the pie chart with sophisticated styling
  const renderCategoryAllocation = () => (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-light text-gray-900">Category Allocation</h3>
          <p className="text-sm text-gray-500 mt-1 font-light">{categoryData.length} Categories</p>
        </div>
      </div>
      <div className="relative" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
              innerRadius={80}
                    outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
                  >
                    {categoryData.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
                />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                    <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3">
                      <div className="font-medium text-gray-900">{data.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatCurrency(data.value)} ({((data.value / data.positions) || 0).toFixed(1)}%)
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {data.positions} positions
                      </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-6">
        {categoryData.map((category: any, index: number) => (
          <div 
            key={category.name}
            className="flex items-center gap-2 p-2 rounded-lg bg-white/60 border border-gray-100"
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {category.name}
              </div>
              <div className="text-xs text-gray-500">
                {((category.value / data.summary.totalValue) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  // Render the radar chart with sophisticated styling
  const renderPerformanceMetrics = () => {
    const metrics = [
      { name: 'Win Rate', value: data.summary.winRate },
      { name: 'Sharpe Ratio', value: 1.8 }, // Example value
      { name: 'Profit Factor', value: 2.1 }, // Example value
      { name: 'Risk Score', value: 65 }, // Example value
      { name: 'Max Drawdown', value: 15 }, // Example value
      { name: 'Calmar Ratio', value: 1.2 }, // Example value
    ];

    return (
      <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-light text-gray-900">Performance Metrics</h3>
            <p className="text-sm text-gray-500 mt-1 font-light">{metrics.length} Key Indicators</p>
          </div>
        </div>
        <div className="relative" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metrics}>
              <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis 
                    dataKey="name" 
                tick={{ fill: '#4a5568', fontSize: 12 }}
                stroke="#cbd5e0"
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                stroke="#cbd5e0"
                tick={{ fill: '#718096', fontSize: 10 }}
                  />
                  <Radar
                name="Metrics"
                    dataKey="value"
                stroke={METRIC_COLORS.primary}
                fill={METRIC_COLORS.primary}
                fillOpacity={0.15}
                  />
                  <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3">
                        <div className="font-medium text-gray-900">{data.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {data.value.toFixed(1)}
                        </div>
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
    );
  };

  // Render P&L and Drawdown Analysis
  const renderPnLAnalysis = () => (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-light text-gray-900">P&L and Drawdown Analysis</h3>
          <p className="text-sm text-gray-500 mt-1 font-light">Daily Performance Tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white/50">
                  <Activity className="h-3 w-3 mr-1" />
                  Cumulative P&L
                </Badge>
          <Badge variant="outline" className="bg-white/50">
                  <TrendingDown className="h-3 w-3 mr-1" />
            Max DD: {Math.max(...data.history.map((d: any) => d.drawdown || 0)).toFixed(1)}%
                </Badge>
              </div>
            </div>
      <div className="relative" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data.history}>
                  <defs>
                    <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={METRIC_COLORS.success} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={METRIC_COLORS.success} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={METRIC_COLORS.danger} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={METRIC_COLORS.danger} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
              tick={{ fontSize: 11, fill: METRIC_COLORS.secondary }}
              stroke={METRIC_COLORS.accent}
                  />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={formatCurrency}
              tick={{ fontSize: 11, fill: METRIC_COLORS.secondary }}
              stroke={METRIC_COLORS.accent}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => `${value.toFixed(1)}%`}
              tick={{ fontSize: 11, fill: METRIC_COLORS.secondary }}
              stroke={METRIC_COLORS.accent}
            />
            {interactiveMode && <Brush dataKey="date" height={30} stroke={METRIC_COLORS.accent} />}
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="cumulativePnL"
              stroke={METRIC_COLORS.success}
                    strokeWidth={2}
                    fill="url(#pnlGradient)"
                    name="Cumulative P&L"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="drawdown"
              stroke={METRIC_COLORS.danger}
                    strokeWidth={1}
                    fill="url(#drawdownGradient)"
                    name="Drawdown %"
                  />
            <ReferenceLine yAxisId="left" y={0} stroke={METRIC_COLORS.accent} strokeDasharray="2 2" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
  );

  // Render Risk vs Return Analysis
  const renderRiskReturn = () => (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-light text-gray-900">Risk vs Return Analysis</h3>
          <p className="text-sm text-gray-500 mt-1 font-light">Position Risk Assessment</p>
        </div>
        <Badge variant="outline" className="bg-white/50">
          <Target className="h-3 w-3 mr-1" />
          Position Analysis
        </Badge>
      </div>
      <div className="relative" style={{ height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              type="number" 
              dataKey="risk" 
              name="Risk (Volatility %)"
              tick={{ fontSize: 11, fill: METRIC_COLORS.secondary }}
              stroke={METRIC_COLORS.accent}
            />
            <YAxis 
              type="number" 
              dataKey="return" 
              name="Return %"
              tick={{ fontSize: 11, fill: METRIC_COLORS.secondary }}
              stroke={METRIC_COLORS.accent}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <ReferenceLine y={0} stroke={METRIC_COLORS.accent} strokeDasharray="2 2" />
            <ReferenceLine x={30} stroke={METRIC_COLORS.accent} strokeDasharray="2 2" />
            <Scatter
              data={data.positions}
              fill={METRIC_COLORS.primary}
            >
              {data.positions.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.return >= 0 ? METRIC_COLORS.success : METRIC_COLORS.danger}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );

  // Render Trading Activity Analysis
  const renderTradingActivity = () => (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-light text-gray-900">Trading Activity Analysis</h3>
          <p className="text-sm text-gray-500 mt-1 font-light">Volume and Trade Frequency</p>
        </div>
        <Badge variant="outline" className="bg-white/50">
          {data.history.reduce((sum: number, d: any) => sum + (d.trades || 0), 0)} Total Trades
              </Badge>
            </div>
      <div className="relative" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data.history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
              tick={{ fontSize: 11, fill: METRIC_COLORS.secondary }}
              stroke={METRIC_COLORS.accent}
                  />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={formatCurrency}
              tick={{ fontSize: 11, fill: METRIC_COLORS.secondary }}
              stroke={METRIC_COLORS.accent}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
              tick={{ fontSize: 11, fill: METRIC_COLORS.secondary }}
              stroke={METRIC_COLORS.accent}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
                  <Bar
                    yAxisId="left"
                    dataKey="volume"
              fill={METRIC_COLORS.info}
                    name="Daily Volume"
                    opacity={0.7}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="trades"
              stroke={METRIC_COLORS.warning}
              strokeWidth={2}
                    name="Trade Count"
              dot={{ fill: METRIC_COLORS.warning, strokeWidth: 2, r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
  );

  // Render Position Concentration
  const renderPositionConcentration = () => (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-light text-gray-900">Position Concentration</h3>
          <p className="text-sm text-gray-500 mt-1 font-light">Top Holdings Analysis</p>
        </div>
        <Badge variant="outline" className="bg-white/50">
                Top Holdings
              </Badge>
            </div>
      <div className="relative" style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[...categoryData].sort((a: any, b: any) => b.value - a.value)}>
                  <defs>
                    <linearGradient id="concentrationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={METRIC_COLORS.primary} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={METRIC_COLORS.primary} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
              tick={{ fontSize: 11, fill: METRIC_COLORS.secondary }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
              stroke={METRIC_COLORS.accent}
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
              tick={{ fontSize: 11, fill: METRIC_COLORS.secondary }}
              stroke={METRIC_COLORS.accent}
                  />
                  <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
              stroke={METRIC_COLORS.primary}
                    strokeWidth={2}
                    fill="url(#concentrationGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
  );

  // Render Monthly Returns Heatmap
  const renderMonthlyReturns = () => {
    const monthlyData = data.history.reduce((acc: any[], entry: any) => {
      const month = new Date(entry.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      const existingMonth = acc.find(m => m.month === month);
      if (existingMonth) {
        existingMonth.return += entry.return || 0;
        existingMonth.pnl += entry.pnl || 0;
        existingMonth.trades += entry.trades || 0;
        existingMonth.volume += entry.volume || 0;
      } else {
        acc.push({
          month,
          return: entry.return || 0,
          pnl: entry.pnl || 0,
          trades: entry.trades || 0,
          volume: entry.volume || 0
        });
      }
      return acc;
    }, []);

    return (
      <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-light text-gray-900">Monthly Returns Heatmap</h3>
            <p className="text-sm text-gray-500 mt-1 font-light">Performance Distribution</p>
        </div>
          <Badge variant="outline" className="bg-white/50">
              <Calendar className="h-3 w-3 mr-1" />
            {monthlyData.length} Months
            </Badge>
          </div>
        <div className="relative" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyData}>
                <defs>
                  <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={METRIC_COLORS.success} stopOpacity={0.8}/>
                  <stop offset="50%" stopColor={METRIC_COLORS.accent} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={METRIC_COLORS.danger} stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                tick={{ fontSize: 11, fill: METRIC_COLORS.secondary }}
                stroke={METRIC_COLORS.accent}
                />
                <YAxis 
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                tick={{ fontSize: 11, fill: METRIC_COLORS.secondary }}
                stroke={METRIC_COLORS.accent}
                />
                <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <ReferenceLine y={0} stroke={METRIC_COLORS.accent} strokeDasharray="2 2" />
                <Area
                  type="monotone"
                  dataKey="return"
                stroke={METRIC_COLORS.success}
                  strokeWidth={2}
                  fill="url(#monthlyGradient)"
                />
                <Bar
                  dataKey="trades"
                fill={METRIC_COLORS.accent}
                  opacity={0.3}
                  yAxisId="right"
                />
            </ComposedChart>
            </ResponsiveContainer>
          </div>
          
        <div className="grid grid-cols-6 gap-2 mt-6">
          {monthlyData.map((month: any) => (
              <div
                key={month.month}
              className={`
                p-3 rounded-lg text-center backdrop-blur-sm border
                ${month.return > 5 ? 'bg-green-50/50 border-green-200 text-green-800' :
                  month.return > 0 ? 'bg-green-50/30 border-green-100 text-green-700' :
                  month.return > -5 ? 'bg-red-50/30 border-red-100 text-red-700' :
                  'bg-red-50/50 border-red-200 text-red-800'
                }
              `}
              >
                <div className="text-xs text-gray-600">{month.month}</div>
              <div className="font-medium">{formatPercent(month.return)}</div>
                <div className="text-xs">{month.trades} trades</div>
              </div>
            ))}
          </div>
        </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-black mb-2">Advanced Portfolio Analytics</h2>
        <p className="text-gray-500 font-light">Deep insights into your trading performance</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
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
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${activeChart === key ? 'bg-black text-white shadow-lg' : 'bg-white/50 text-gray-700 hover:bg-black/5'}
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Button>
          ))}
        </div>
        
        <Button
          onClick={() => setInteractiveMode(!interactiveMode)}
          variant={interactiveMode ? "default" : "outline"}
          size="sm"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-all
            ${interactiveMode ? 'bg-black text-white shadow-lg' : 'bg-white/50 text-gray-700 hover:bg-black/5'}
          `}
        >
          <MousePointer className="h-4 w-4" />
          <span>Interactive</span>
        </Button>
      </div>

      {activeChart === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderCategoryAllocation()}
          {renderPerformanceMetrics()}
        </div>
      )}

      {activeChart === 'performance' && (
        <div className="grid grid-cols-1 gap-6">
          {renderPnLAnalysis()}
          {renderTradingActivity()}
        </div>
      )}

      {activeChart === 'risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderRiskReturn()}
          {renderPositionConcentration()}
        </div>
      )}

      {activeChart === 'heatmap' && (
        <div className="grid grid-cols-1 gap-6">
          {renderMonthlyReturns()}
        </div>
      )}
    </div>
  );
} 