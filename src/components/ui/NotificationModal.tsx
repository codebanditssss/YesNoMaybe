import { X, Bell, TrendingUp, CheckCircle, AlertCircle, Gift, Settings, Check, RefreshCw } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/lib/supabase';
import { useState } from 'react';

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'market_alert': return TrendingUp;
    case 'trade_confirmation': return CheckCircle;
    case 'order_update': return Bell;
    case 'promotion': return Gift;
    case 'system': return Settings;
    default: return Bell;
  }
};

const getNotificationColor = (type: string, priority: string) => {
  if (priority === 'urgent') return 'text-red-600 bg-red-50';
  if (priority === 'high') return 'text-orange-600 bg-orange-50';
  
  switch (type) {
    case 'market_alert': return 'text-blue-600 bg-blue-50';
    case 'trade_confirmation': return 'text-green-600 bg-green-50';
    case 'order_update': return 'text-purple-600 bg-purple-50';
    case 'promotion': return 'text-pink-600 bg-pink-50';
    case 'system': return 'text-gray-600 bg-gray-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const NotificationItem = ({ 
  notification, 
  onMarkAsRead 
}: { 
  notification: Notification; 
  onMarkAsRead: (id: string) => void;
}) => {
  const Icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type, notification.priority);
  
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div 
      className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer group ${
        notification.read 
          ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' 
          : 'bg-white border-blue-200 hover:border-blue-300 shadow-sm'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${colorClass} flex-shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium text-sm leading-5 ${
              notification.read ? 'text-gray-700' : 'text-gray-900'
            }`}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs text-gray-500">
                {formatTimeAgo(notification.created_at)}
              </span>
            </div>
          </div>
          
          <p className={`text-sm mt-1 ${
            notification.read ? 'text-gray-600' : 'text-gray-700'
          }`}>
            {notification.message}
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
              {notification.type.replace('_', ' ').toUpperCase()}
            </span>
            
            {notification.priority !== 'normal' && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                notification.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                notification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {notification.priority.toUpperCase()}
              </span>
            )}
            
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function NotificationModal({ open, onClose }: NotificationModalProps) {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refresh, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

  if (!open) return null;

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead([notificationId]);
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllAsRead(true);
    await markAllAsRead();
    setMarkingAllAsRead(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-25"
        onClick={onClose}
      />
      <div className="fixed top-20 right-6 z-50 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              title="Refresh notifications"
            >
              <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {markingAllAsRead ? 'Marking...' : 'Mark all read'}
              </button>
            )}
            
            <button
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Loading notifications...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={refresh}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No notifications</p>
              <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
              
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="w-full py-2 text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load more'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 