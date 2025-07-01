import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (notification: {
    title: string;
    message: string;
    type: 'market_alert' | 'trade_confirmation' | 'order_update' | 'promotion' | 'system';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    action_url?: string;
    metadata?: any;
  }) => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchNotifications = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;
      const response = await fetch(`/api/notifications?limit=20&offset=${currentOffset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      
      if (reset) {
        setNotifications(data.notifications);
        setOffset(20);
      } else {
        setNotifications(prev => [...prev, ...data.notifications]);
        setOffset(prev => prev + 20);
      }
      
      setUnreadCount(data.unreadCount);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [offset]);

  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchNotifications(true);
  }, [fetchNotifications]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchNotifications(false);
  }, [hasMore, loading, fetchNotifications]);

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds,
          read: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.id)
            ? { ...notification, read: true, read_at: new Date().toISOString() }
            : notification
        )
      );

      // Update unread count
      const unreadToRead = notifications.filter(n => 
        notificationIds.includes(n.id) && !n.read
      ).length;
      setUnreadCount(prev => Math.max(0, prev - unreadToRead));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notifications as read');
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  }, [notifications, markAsRead]);

  const createNotification = useCallback(async (notification: {
    title: string;
    message: string;
    type: 'market_alert' | 'trade_confirmation' | 'order_update' | 'promotion' | 'system';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    action_url?: string;
    metadata?: any;
  }) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }

      const data = await response.json();
      
      // Add to local state
      setNotifications(prev => [data.notification, ...prev]);
      setUnreadCount(prev => prev + 1);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification');
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(true);
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupRealtimeSubscription();
    
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
    createNotification
  };
} 