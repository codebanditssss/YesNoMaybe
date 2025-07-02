import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthentication } from '@/lib/server-utils';

export async function GET(request: NextRequest) {
  return withAdminAuthentication(async (user) => {
    try {
      // Simulate reports data
      // In a real app, this would generate actual reports from database data
      const reportsData = {
        availableReports: [
          {
            name: 'Monthly Financial Report',
            description: 'Complete financial overview including revenue, fees, and P&L',
            type: 'financial',
            lastGenerated: '2024-01-01',
            size: '2.4 MB',
            downloadUrl: '/api/admin/reports/download/financial'
          },
          {
            name: 'User Growth Analysis',
            description: 'User registration, retention, and engagement metrics',
            type: 'user',
            lastGenerated: '2024-01-01',
            size: '1.8 MB',
            downloadUrl: '/api/admin/reports/download/user'
          },
          {
            name: 'Trading Activity Report',
            description: 'Market performance, trading volume, and user activity',
            type: 'activity',
            lastGenerated: '2024-01-01',
            size: '3.2 MB',
            downloadUrl: '/api/admin/reports/download/activity'
          },
          {
            name: 'System Performance Report',
            description: 'Server metrics, uptime, and technical performance data',
            type: 'system',
            lastGenerated: '2024-01-01',
            size: '1.5 MB',
            downloadUrl: '/api/admin/reports/download/system'
          }
        ],
        stats: {
          totalReports: 4,
          totalSize: '8.9 MB',
          lastUpdated: new Date().toISOString(),
          autoReports: 4
        }
      };

      return NextResponse.json(reportsData);
    } catch (error) {
      console.error('Error fetching reports data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reports data' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAdminAuthentication(async (user) => {
    try {
      const { reportType, dateRange, includeData } = await request.json();

      // Simulate generating a custom report
      // In a real app, this would generate actual data based on the parameters
      
      console.log(`Admin ${user.email} requested custom report: ${reportType} for ${dateRange}`);

      const reportId = Date.now().toString();
      
      return NextResponse.json({ 
        success: true, 
        reportId,
        message: `Custom ${reportType} report generated successfully`,
        downloadUrl: `/api/admin/reports/download/custom/${reportId}`
      });
    } catch (error) {
      console.error('Error generating custom report:', error);
      return NextResponse.json(
        { error: 'Failed to generate custom report' },
        { status: 500 }
      );
    }
  });
} 