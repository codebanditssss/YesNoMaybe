import { NextRequest } from 'next/server';
import { 
  withAuthentication, 
  getServiceRoleClient, 
  validateRequestInput, 
  createErrorResponse, 
  createSuccessResponse 
} from '@/lib/server-utils';
import type { NewNotification } from '@/lib/supabase';

// GET handler for fetching user's notifications
async function getNotifications(user: any, supabase: any, request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Cap at 100
    const offset = parseInt(searchParams.get('offset') || '0');
    const unread_only = searchParams.get('unread_only') === 'true';

    // Build query - using authenticated client with RLS
    let query = supabase
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
      return createErrorResponse('Failed to fetch notifications', 500);
    }

    // Get unread count using authenticated client
    const { count: unreadCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (countError) {
      console.error('Error getting unread count:', countError);
    }

    return createSuccessResponse({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      hasMore: notifications?.length === limit
    });

  } catch (error) {
    console.error('Notifications GET API error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST handler for creating notifications
async function createNotification(user: any, supabase: any, request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const validation = validateRequestInput(body, ['title', 'message', 'type']);
    if (!validation.isValid) {
      return createErrorResponse(
        `Missing required fields: ${validation.missingFields.join(', ')}`,
        400
      );
    }

    const { title, message, type, priority = 'normal', action_url, metadata = {} } = body;

    // Validate notification type
    const validTypes = ['market_alert', 'trade_confirmation', 'order_update', 'promotion', 'system'];
    if (!validTypes.includes(type)) {
      return createErrorResponse(
        `Invalid notification type. Must be one of: ${validTypes.join(', ')}`,
        400
      );
    }

    // Validate priority
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return createErrorResponse(
        `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
        400
      );
    }

    const newNotification: NewNotification = {
      user_id: user.id,
      title: title.trim(),
      message: message.trim(),
      type,
      priority,
      action_url: action_url?.trim() || null,
      metadata
    };

    // Use authenticated client for insertion (RLS will ensure user can only create their own notifications)
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert(newNotification)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return createErrorResponse('Failed to create notification', 500);
    }

    return createSuccessResponse({ notification }, 201);

  } catch (error) {
    console.error('Create notification API error:', error);
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }
    return createErrorResponse('Internal server error', 500);
  }
}

// PATCH handler for updating notifications (mark as read/unread)
async function updateNotifications(user: any, supabase: any, request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const validation = validateRequestInput(body, ['notificationIds']);
    if (!validation.isValid) {
      return createErrorResponse(
        `Missing required fields: ${validation.missingFields.join(', ')}`,
        400
      );
    }

    const { notificationIds, read = true } = body;

    // Validate notificationIds is an array
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return createErrorResponse('notificationIds must be a non-empty array', 400);
    }

    // Validate all IDs are strings/UUIDs
    const invalidIds = notificationIds.filter(id => typeof id !== 'string' || id.trim().length === 0);
    if (invalidIds.length > 0) {
      return createErrorResponse('All notification IDs must be valid strings', 400);
    }

    // Update notifications using authenticated client (RLS ensures user can only update their own)
    const { data, error } = await supabase
      .from('notifications')
      .update({ 
        read: Boolean(read), 
        read_at: read ? new Date().toISOString() : null 
      })
      .eq('user_id', user.id)
      .in('id', notificationIds)
      .select();

    if (error) {
      console.error('Error updating notifications:', error);
      return createErrorResponse('Failed to update notifications', 500);
    }

    return createSuccessResponse({ 
      updated: data,
      count: data?.length || 0 
    });

  } catch (error) {
    console.error('Update notifications API error:', error);
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }
    return createErrorResponse('Internal server error', 500);
  }
}

// Export the wrapped handlers
export const GET = withAuthentication(getNotifications);
export const POST = withAuthentication(createNotification);
export const PATCH = withAuthentication(updateNotifications); 