import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthentication } from '@/lib/server-utils';

export async function GET(request: NextRequest) {
  return withAdminAuthentication(async (user) => {
    try {
      // Simulate system metrics data
      // In a real app, this would gather actual system metrics
      const systemMetrics = {
        health: {
          database: 'healthy',
          api: 'healthy',
          cache: 'healthy',
          storage: 'healthy'
        },
        metrics: [
          { name: 'CPU Usage', value: `${Math.floor(Math.random() * 30 + 30)}%`, status: 'healthy', lastUpdated: '2 min ago' },
          { name: 'Memory Usage', value: `${Math.floor(Math.random() * 20 + 60)}%`, status: 'warning', lastUpdated: '1 min ago' },
          { name: 'Disk Usage', value: `${Math.floor(Math.random() * 10 + 30)}%`, status: 'healthy', lastUpdated: '3 min ago' },
          { name: 'Network I/O', value: `${Math.floor(Math.random() * 50 + 120)} MB/s`, status: 'healthy', lastUpdated: '1 min ago' },
          { name: 'Active Connections', value: `${Math.floor(Math.random() * 500 + 1000).toLocaleString()}`, status: 'healthy', lastUpdated: '30 sec ago' },
          { name: 'Response Time', value: `${Math.floor(Math.random() * 40 + 70)}ms`, status: 'healthy', lastUpdated: '1 min ago' }
        ],
        database: {
          totalQueries: '15,432',
          averageQueryTime: '45ms',
          activeConnections: '23',
          slowQueries: '4',
          cacheHitRate: '94.2%',
          dbSize: '2.4GB'
        },
        alerts: [
          {
            type: 'warning',
            title: 'High Memory Usage',
            description: 'Memory usage is above 85% threshold',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
          },
          {
            type: 'success',
            title: 'Database Backup Completed',
            description: 'Scheduled backup completed successfully',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
          },
          {
            type: 'info',
            title: 'System Maintenance Scheduled',
            description: 'Maintenance window scheduled for tonight at 2 AM',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
          }
        ]
      };

      return NextResponse.json(systemMetrics);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch system metrics' },
        { status: 500 }
      );
    }
  });
} 