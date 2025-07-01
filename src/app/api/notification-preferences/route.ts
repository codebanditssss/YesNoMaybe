import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, AuthenticatedUser } from '@/lib/auth';

const serviceRoleClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function getNotificationPreferences(request: NextRequest, user: AuthenticatedUser) {
  try {
    const { data: preferences, error } = await serviceRoleClient
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, return defaults
        const defaultPreferences = {
          order_updates: true,
          market_alerts: true,
          price_changes: false,
          daily_summary: true,
          weekly_digest: true,
          promotional: false
        };
        return NextResponse.json({ preferences: defaultPreferences });
      }
      console.error('Error fetching notification preferences:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ preferences });

  } catch (error) {
    console.error('Notification preferences GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateNotificationPreferences(request: NextRequest, user: AuthenticatedUser) {
  try {
    const body = await request.json();
    const { preferences } = body;

    // Update or insert preferences
    const { data, error } = await serviceRoleClient
      .from('user_notification_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating notification preferences:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ preferences: data });

  } catch (error) {
    console.error('Notification preferences PUT API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getNotificationPreferences);
export const PUT = withAuth(updateNotificationPreferences); 