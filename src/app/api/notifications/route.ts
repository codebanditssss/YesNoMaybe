import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, AuthenticatedUser } from '@/lib/auth';
import { NewNotification } from '@/lib/supabase';

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

async function getNotifications(request: NextRequest, user: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unread_only = searchParams.get('unread_only') === 'true';

    // Build query
    let query = serviceRoleClient
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (unread_only) {
      query = query.eq('read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get unread count
    const { count: unreadCount, error: countError } = await serviceRoleClient
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (countError) {
      console.error('Error getting unread count:', countError);
    }

    return NextResponse.json({
      notifications,
      unreadCount: unreadCount || 0,
      hasMore: notifications.length === limit
    });

  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createNotification(request: NextRequest, user: AuthenticatedUser) {
  try {
    const body = await request.json();
    const { title, message, type, priority = 'normal', action_url, metadata = {} } = body;

    const newNotification: NewNotification = {
      user_id: user.id,
      title,
      message,
      type,
      priority,
      action_url,
      metadata
    };

    const { data: notification, error } = await serviceRoleClient
      .from('notifications')
      .insert(newNotification)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notification }, { status: 201 });

  } catch (error) {
    console.error('Create notification API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateNotifications(request: NextRequest, user: AuthenticatedUser) {
  try {
    const body = await request.json();
    const { notificationIds, read = true } = body;

    // Update notifications
    const { data, error } = await serviceRoleClient
      .from('notifications')
      .update({ 
        read, 
        read_at: read ? new Date().toISOString() : null 
      })
      .eq('user_id', user.id)
      .in('id', notificationIds)
      .select();

    if (error) {
      console.error('Error updating notifications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ updated: data });

  } catch (error) {
    console.error('Update notifications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getNotifications);
export const POST = withAuth(createNotification);
export const PATCH = withAuth(updateNotifications); 