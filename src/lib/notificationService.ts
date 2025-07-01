import { supabase } from './supabase';

export interface CreateNotificationParams {
  user_id: string;
  title: string;
  message: string;
  type: 'market_alert' | 'trade_confirmation' | 'order_update' | 'promotion' | 'system';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

export const notificationService = {
  async createNotification(params: CreateNotificationParams) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: params.user_id,
          title: params.title,
          message: params.message,
          type: params.type,
          priority: params.priority || 'normal',
          metadata: params.metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Notification service error:', error);
      return null;
    }
  },

  // Order-related notifications
  async notifyOrderPlaced(user_id: string, orderData: any) {
    return this.createNotification({
      user_id,
      title: 'Order Placed Successfully',
      message: `Your ${orderData.side} order for ${orderData.quantity} shares at ₹${orderData.price} has been placed for "${orderData.marketTitle}"`,
      type: 'order_update',
      priority: 'normal',
      metadata: {
        orderId: orderData.orderId,
        marketId: orderData.marketId,
        side: orderData.side,
        quantity: orderData.quantity,
        price: orderData.price
      }
    });
  },

  async notifyOrderFilled(user_id: string, orderData: any) {
    return this.createNotification({
      user_id,
      title: 'Order Executed Successfully! 💰',
      message: `Your ${orderData.side} order for ${orderData.quantity} shares at ₹${orderData.price} has been filled for "${orderData.marketTitle}"`,
      type: 'trade_confirmation',
      priority: 'high',
      metadata: {
        orderId: orderData.orderId,
        tradeId: orderData.tradeId,
        marketId: orderData.marketId,
        side: orderData.side,
        quantity: orderData.quantity,
        price: orderData.price
      }
    });
  },

  async notifyOrderCancelled(user_id: string, orderData: any) {
    return this.createNotification({
      user_id,
      title: 'Order Cancelled',
      message: `Your ${orderData.side} order for ${orderData.quantity} shares at ₹${orderData.price} has been cancelled for "${orderData.marketTitle}"`,
      type: 'order_update',
      priority: 'normal',
      metadata: {
        orderId: orderData.orderId,
        marketId: orderData.marketId,
        side: orderData.side,
        quantity: orderData.quantity,
        price: orderData.price
      }
    });
  },

  // Market-related notifications
  async notifyMarketResolved(user_id: string, marketData: any) {
    return this.createNotification({
      user_id,
      title: 'Market Resolved! 🏁',
      message: `"${marketData.title}" has been resolved. Outcome: ${marketData.outcome}`,
      type: 'market_alert',
      priority: 'high',
      metadata: {
        marketId: marketData.marketId,
        outcome: marketData.outcome,
        title: marketData.title
      }
    });
  },

  async notifyPriceAlert(user_id: string, alertData: any) {
    return this.createNotification({
      user_id,
      title: 'Price Alert 📈',
      message: `${alertData.marketTitle} price ${alertData.direction} to ₹${alertData.currentPrice} (${alertData.changePercent > 0 ? '+' : ''}${alertData.changePercent}%)`,
      type: 'market_alert',
      priority: 'normal',
      metadata: {
        marketId: alertData.marketId,
        currentPrice: alertData.currentPrice,
        changePercent: alertData.changePercent,
        direction: alertData.direction
      }
    });
  },

  // System notifications
  async notifyWelcome(user_id: string) {
    return this.createNotification({
      user_id,
      title: 'Welcome to YesNoMaybe! 🎉',
      message: 'Thanks for joining our prediction market platform. Start exploring markets and make your first trade!',
      type: 'system',
      priority: 'normal',
      metadata: {
        type: 'welcome'
      }
    });
  },

  async notifySystemUpdate(user_id: string, updateData: any) {
    return this.createNotification({
      user_id,
      title: 'System Update',
      message: updateData.message,
      type: 'system',
      priority: updateData.priority || 'normal',
      metadata: {
        version: updateData.version,
        features: updateData.features
      }
    });
  },

  // Promotional notifications
  async notifyPromotion(user_id: string, promoData: any) {
    return this.createNotification({
      user_id,
      title: promoData.title,
      message: promoData.message,
      type: 'promotion',
      priority: 'normal',
      metadata: {
        promoCode: promoData.promoCode,
        expiresAt: promoData.expiresAt,
        discount: promoData.discount
      }
    });
  }
}; 