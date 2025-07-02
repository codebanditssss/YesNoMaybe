import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthentication } from '@/lib/server-utils';

export async function GET(request: NextRequest) {
  return withAdminAuthentication(async (user) => {
    try {
      // Simulate analytics data
      // In a real app, this would query the database for actual analytics
      const analyticsData = {
        overview: {
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
        },
        chartData: [
          { period: 'Jan', users: 8500, volume: 1200000, trades: 3400 },
          { period: 'Feb', users: 9200, volume: 1580000, trades: 4100 },
          { period: 'Mar', users: 10100, volume: 1890000, trades: 4800 },
          { period: 'Apr', users: 10800, volume: 2100000, trades: 5200 },
          { period: 'May', users: 11600, volume: 2350000, trades: 5900 },
          { period: 'Jun', users: 12547, volume: 2847392, trades: 6847 }
        ],
        topMarkets: [
          { name: 'Bitcoin to reach $100k by 2024', volume: '$147,392', trades: 1247 },
          { name: 'AI will replace 50% of jobs', volume: '$89,234', trades: 892 },
          { name: 'Tesla stock above $300', volume: '$67,181', trades: 734 },
          { name: 'Climate change reversed', volume: '$45,928', trades: 567 },
          { name: 'Quantum computing breakthrough', volume: '$38,472', trades: 423 }
        ],
        engagement: {
          dailyActiveUsers: 3247,
          averageSessionTime: '14m 32s',
          pagesPerSession: 4.7,
          bounceRate: 23.8,
          returnVisitors: 68.4,
          mobileUsers: 45.2
        },
        revenue: {
          tradingFees: 89473,
          withdrawalFees: 23847,
          premiumFeatures: 18392,
          marketCreation: 7234,
          other: 3424
        }
      };

      return NextResponse.json(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }
  });
} 