import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthentication } from '@/lib/server-utils';

export async function GET(request: NextRequest) {
  return withAdminAuthentication(async (user) => {
    try {
      // Simulate moderation data
      // In a real app, this would query the database for actual reports
      const moderationData = {
        reports: [
          {
            id: '1',
            type: 'user',
            subject: 'Inappropriate username and behavior',
            reportedBy: 'john_doe_trader',
            reportedUser: 'offensive_user123',
            reason: 'Harassment/Bullying',
            description: 'User has been sending threatening messages and using offensive language in market discussions.',
            status: 'pending',
            priority: 'high',
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            type: 'market',
            subject: 'Misleading market description',
            reportedBy: 'trader_alert',
            reportedContent: 'Will Bitcoin reach $1M by tomorrow?',
            reason: 'Misinformation',
            description: 'Market description contains false information and unrealistic timeframes.',
            status: 'pending',
            priority: 'medium',
            createdAt: '2024-01-15T09:15:00Z'
          },
          {
            id: '3',
            type: 'comment',
            subject: 'Spam in market comments',
            reportedBy: 'crypto_analyst',
            reportedUser: 'spam_bot_user',
            reportedContent: 'Buy our premium signals! Link in bio!',
            reason: 'Spam',
            description: 'User posting promotional content and spam links repeatedly.',
            status: 'reviewed',
            priority: 'low',
            createdAt: '2024-01-15T08:45:00Z'
          }
        ],
        stats: {
          pendingReports: 2,
          criticalPriority: 0,
          actionsToday: 5,
          resolutionRate: 94
        },
        recentActions: [
          {
            id: '1',
            type: 'suspension',
            target: 'toxic_trader_99',
            reason: 'Repeated harassment of other users',
            moderator: 'admin_sarah',
            timestamp: '2024-01-15T11:00:00Z'
          },
          {
            id: '2',
            type: 'content_removal',
            target: 'Fake news market about political events',
            reason: 'Misinformation and false claims',
            moderator: 'admin_mike',
            timestamp: '2024-01-15T10:45:00Z'
          }
        ]
      };

      return NextResponse.json(moderationData);
    } catch (error) {
      console.error('Error fetching moderation data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch moderation data' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAdminAuthentication(async (user) => {
    try {
      const { reportId, action, reason } = await request.json();

      // Simulate taking action on a report
      // In a real app, this would update the database and possibly take actual moderation actions
      
      console.log(`Admin ${user.email} took action on report ${reportId}: ${action} - ${reason}`);

      return NextResponse.json({ 
        success: true, 
        message: `Action ${action} taken on report ${reportId}` 
      });
    } catch (error) {
      console.error('Error taking moderation action:', error);
      return NextResponse.json(
        { error: 'Failed to take moderation action' },
        { status: 500 }
      );
    }
  });
} 