"use client"

import { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface AdminMetrics {
  totalUsers: number;
  activeUsers24h: number;
  totalMarkets: number;
  activeMarkets: number;
  totalVolume: number;
  volume24h: number;
  totalTrades: number;
  trades24h: number;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    message: string;
  };
  recentAlerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  colorClass = "bg-blue-500" 
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: any;
  colorClass?: string;
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`${colorClass} rounded-md p-3`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
            {change && (
              <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                change.startsWith('+') ? 'text-green-600' : 
                change.startsWith('-') ? 'text-red-600' : 
                'text-gray-500'
              }`}>
                {change}
              </div>
            )}
          </dd>
        </dl>
      </div>
    </div>
  </div>
);

const AlertItem = ({ alert }: { alert: AdminMetrics['recentAlerts'][0] }) => {
  const iconMap = {
    info: CheckCircle,
    warning: AlertCircle,
    error: XCircle
  };
  
  const colorMap = {
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };

  const Icon = iconMap[alert.type];

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <Icon className={`h-5 w-5 mt-0.5 ${colorMap[alert.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{alert.message}</p>
        <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/metrics');
        if (!response.ok) {
          throw new Error('Failed to fetch admin metrics');
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">
            System overview and key metrics for Augur trading platform
          </p>
        </div>
        <img src="/logo.svg" alt="Augur" className="h-8" />
      </div>

      {/* System Health Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          {metrics.systemHealth.status === 'healthy' && (
            <CheckCircle className="h-8 w-8 text-green-500" />
          )}
          {metrics.systemHealth.status === 'warning' && (
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          )}
          {metrics.systemHealth.status === 'critical' && (
            <XCircle className="h-8 w-8 text-red-500" />
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
            <p className={`text-sm ${
              metrics.systemHealth.status === 'healthy' ? 'text-green-600' :
              metrics.systemHealth.status === 'warning' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {metrics.systemHealth.message}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          change={`+${metrics.activeUsers24h} today`}
          icon={Users}
          colorClass="bg-blue-500"
        />
        <MetricCard
          title="Active Markets"
          value={metrics.activeMarkets}
          change={`of ${metrics.totalMarkets} total`}
          icon={TrendingUp}
          colorClass="bg-green-500"
        />
        <MetricCard
          title="Total Volume"
          value={`₹${(metrics.totalVolume / 1000).toFixed(1)}K`}
          change={`₹${(metrics.volume24h / 1000).toFixed(1)}K today`}
          icon={DollarSign}
          colorClass="bg-purple-500"
        />
        <MetricCard
          title="Trades (24h)"
          value={metrics.trades24h}
          change={`of ${metrics.totalTrades} total`}
          icon={Activity}
          colorClass="bg-orange-500"
        />
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent System Alerts
          </h2>
        </div>
        <div className="p-6">
          {metrics.recentAlerts.length > 0 ? (
            <div className="space-y-2">
              {metrics.recentAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No recent alerts. System is running smoothly.
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Create New Market
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Resolve Markets
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            View System Logs
          </button>
        </div>
      </div>
    </div>
  );
} 