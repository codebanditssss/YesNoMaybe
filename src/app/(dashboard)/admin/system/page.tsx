'use client';

import { useState, useEffect } from 'react';
import { 
  Monitor, 
  Server, 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  Users,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface SystemMetric {
  name: string;
  value: string;
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
  cache: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
}

export default function SystemMonitor() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    api: 'healthy', 
    cache: 'healthy',
    storage: 'healthy'
  });

  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: '42%', status: 'healthy', lastUpdated: '2 min ago' },
    { name: 'Memory Usage', value: '68%', status: 'warning', lastUpdated: '1 min ago' },
    { name: 'Disk Usage', value: '34%', status: 'healthy', lastUpdated: '3 min ago' },
    { name: 'Network I/O', value: '156 MB/s', status: 'healthy', lastUpdated: '1 min ago' },
    { name: 'Active Connections', value: '1,247', status: 'healthy', lastUpdated: '30 sec ago' },
    { name: 'Response Time', value: '89ms', status: 'healthy', lastUpdated: '1 min ago' }
  ]);

  const [dbMetrics, setDbMetrics] = useState({
    totalQueries: '15,432',
    averageQueryTime: '45ms',
    activeConnections: '23',
    slowQueries: '4',
    cacheHitRate: '94.2%',
    dbSize: '2.4GB'
  });

  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refreshData = async () => {
    setRefreshing(true);
    try {
      // Simulate API call to refresh system data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update metrics with random variations to simulate real data
      setSystemMetrics(prev => prev.map(metric => ({
        ...metric,
        value: generateRandomMetric(metric.name),
        lastUpdated: 'Just now'
      })));
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh system data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const generateRandomMetric = (metricName: string): string => {
    switch (metricName) {
      case 'CPU Usage':
        return `${Math.floor(Math.random() * 30 + 30)}%`;
      case 'Memory Usage':
        return `${Math.floor(Math.random() * 20 + 60)}%`;
      case 'Disk Usage':
        return `${Math.floor(Math.random() * 10 + 30)}%`;
      case 'Network I/O':
        return `${Math.floor(Math.random() * 50 + 120)} MB/s`;
      case 'Active Connections':
        return `${Math.floor(Math.random() * 500 + 1000).toLocaleString()}`;
      case 'Response Time':
        return `${Math.floor(Math.random() * 40 + 70)}ms`;
      default:
        return metric.value;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Monitor className="h-8 w-8 text-red-600 mr-3" />
            System Monitor
          </h1>
          <p className="mt-2 text-gray-600">
            Real-time system health and performance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Database</p>
              <p className="text-2xl font-bold text-gray-900">Healthy</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Database className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getStatusIcon('healthy')}
            <span className="ml-2 text-sm text-green-600">All systems operational</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">API Server</p>
              <p className="text-2xl font-bold text-gray-900">Healthy</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Server className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getStatusIcon('healthy')}
            <span className="ml-2 text-sm text-green-600">Response time normal</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cache</p>
              <p className="text-2xl font-bold text-gray-900">Healthy</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getStatusIcon('healthy')}
            <span className="ml-2 text-sm text-green-600">High hit rate</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Storage</p>
              <p className="text-2xl font-bold text-gray-900">Healthy</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <HardDrive className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getStatusIcon('healthy')}
            <span className="ml-2 text-sm text-green-600">Plenty of space</span>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Cpu className="h-5 w-5 text-red-600 mr-2" />
            System Metrics
          </h3>
          <div className="space-y-4">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{metric.name}</p>
                  <p className="text-sm text-gray-600">Updated {metric.lastUpdated}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(metric.status)}`}>
                    {metric.value}
                  </span>
                  {getStatusIcon(metric.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="h-5 w-5 text-red-600 mr-2" />
            Database Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Total Queries</p>
              <p className="text-2xl font-bold text-gray-900">{dbMetrics.totalQueries}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Avg Query Time</p>
              <p className="text-2xl font-bold text-gray-900">{dbMetrics.averageQueryTime}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Active Connections</p>
              <p className="text-2xl font-bold text-gray-900">{dbMetrics.activeConnections}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
              <p className="text-2xl font-bold text-gray-900">{dbMetrics.cacheHitRate}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Slow Queries</p>
              <p className="text-2xl font-bold text-red-600">{dbMetrics.slowQueries}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Database Size</p>
              <p className="text-2xl font-bold text-gray-900">{dbMetrics.dbSize}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          Recent System Alerts
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-yellow-900">High Memory Usage</p>
                <p className="text-sm text-yellow-700">Memory usage is above 85% threshold</p>
              </div>
            </div>
            <div className="text-sm text-yellow-600">5 min ago</div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-900">Database Backup Completed</p>
                <p className="text-sm text-green-700">Scheduled backup completed successfully</p>
              </div>
            </div>
            <div className="text-sm text-green-600">1 hour ago</div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-blue-900">System Maintenance Scheduled</p>
                <p className="text-sm text-blue-700">Maintenance window scheduled for tonight at 2 AM</p>
              </div>
            </div>
            <div className="text-sm text-blue-600">3 hours ago</div>
          </div>
        </div>
      </div>
    </div>
  );
} 