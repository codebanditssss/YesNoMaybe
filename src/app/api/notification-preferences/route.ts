import { NextRequest } from 'next/server';
import { 
  withAuthentication, 
  validateRequestInput, 
  createErrorResponse, 
  createSuccessResponse 
} from '@/lib/server-utils';

// Default notification preferences that match the database schema
const DEFAULT_PREFERENCES = {
  email_notifications: true,
  market_alerts: true,
  trade_confirmations: true,
  order_updates: true,
  promotions: false,
  system_notifications: true
};

// Valid preference keys that can be updated
const VALID_PREFERENCE_KEYS = Object.keys(DEFAULT_PREFERENCES);

// GET handler for fetching user's notification preferences
async function getNotificationPreferences(user: any, supabase: any, request: NextRequest) {
  try {
    const { data: preferences, error } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, return defaults
        return createSuccessResponse({ 
          preferences: DEFAULT_PREFERENCES,
          isDefault: true 
        });
      }
      console.error('Error fetching notification preferences:', error);
      return createErrorResponse('Failed to fetch notification preferences', 500);
    }

    // Extract only the preference fields (remove metadata like id, user_id, timestamps)
    const userPreferences = {
      email_notifications: preferences.email_notifications ?? DEFAULT_PREFERENCES.email_notifications,
      market_alerts: preferences.market_alerts ?? DEFAULT_PREFERENCES.market_alerts,
      trade_confirmations: preferences.trade_confirmations ?? DEFAULT_PREFERENCES.trade_confirmations,
      order_updates: preferences.order_updates ?? DEFAULT_PREFERENCES.order_updates,
      promotions: preferences.promotions ?? DEFAULT_PREFERENCES.promotions,
      system_notifications: preferences.system_notifications ?? DEFAULT_PREFERENCES.system_notifications
    };

    return createSuccessResponse({ 
      preferences: userPreferences,
      isDefault: false 
    });

  } catch (error) {
    console.error('Notification preferences GET API error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT handler for updating notification preferences
async function updateNotificationPreferences(user: any, supabase: any, request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate that we have preferences data
    if (!body.preferences && !body) {
      return createErrorResponse('Missing preferences data', 400);
    }

    // Handle both { preferences: {...} } and direct {...} formats for backwards compatibility
    const preferencesToUpdate = body.preferences || body;

    // Validate that it's an object
    if (typeof preferencesToUpdate !== 'object' || preferencesToUpdate === null) {
      return createErrorResponse('Preferences must be an object', 400);
    }

    // Filter out invalid keys and validate values
    const validUpdates: any = {};
    const invalidKeys: string[] = [];
    const invalidValues: string[] = [];

    for (const [key, value] of Object.entries(preferencesToUpdate)) {
      if (!VALID_PREFERENCE_KEYS.includes(key)) {
        invalidKeys.push(key);
        continue;
      }

      // Validate that preference values are booleans
      if (typeof value !== 'boolean') {
        invalidValues.push(`${key} must be a boolean, got ${typeof value}`);
        continue;
      }

      validUpdates[key] = value;
    }

    // Report validation errors
    if (invalidKeys.length > 0) {
      return createErrorResponse(
        `Invalid preference keys: ${invalidKeys.join(', ')}. Valid keys are: ${VALID_PREFERENCE_KEYS.join(', ')}`,
        400
      );
    }

    if (invalidValues.length > 0) {
      return createErrorResponse(
        `Invalid preference values: ${invalidValues.join(', ')}`,
        400
      );
    }

    // Ensure we have at least one valid update
    if (Object.keys(validUpdates).length === 0) {
      return createErrorResponse('No valid preferences to update', 400);
    }

    // Prepare the data for upsert
    const upsertData = {
      user_id: user.id,
      ...validUpdates,
      updated_at: new Date().toISOString()
    };

    // Update or insert preferences using authenticated client
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .upsert(upsertData, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating notification preferences:', error);
      return createErrorResponse('Failed to update notification preferences', 500);
    }

    // Return only the preference fields
    const updatedPreferences = {
      email_notifications: data.email_notifications,
      market_alerts: data.market_alerts,
      trade_confirmations: data.trade_confirmations,
      order_updates: data.order_updates,
      promotions: data.promotions,
      system_notifications: data.system_notifications
    };

    return createSuccessResponse({ 
      preferences: updatedPreferences,
      updated: Object.keys(validUpdates)
    });

  } catch (error) {
    console.error('Notification preferences PUT API error:', error);
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }
    return createErrorResponse('Internal server error', 500);
  }
}

// Export the wrapped handlers
export const GET = withAuthentication(getNotificationPreferences);
export const PUT = withAuthentication(updateNotificationPreferences); 