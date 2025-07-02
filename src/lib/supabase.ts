import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../types/supabase'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create a client for use in the browser with cookie-based auth
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Disconnect from realtime to prevent WebSocket errors
if (typeof window !== 'undefined') {
  supabase.realtime.disconnect()
}

// Create a client with the service role key for admin operations
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { 
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

// Disconnect admin client from realtime as well
if (supabaseAdmin && typeof window !== 'undefined') {
  supabaseAdmin.realtime.disconnect()
}

// Export types
export type Market = Database['public']['Tables']['markets']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Trade = Database['public']['Tables']['trades']['Row']
export type UserBalance = Database['public']['Tables']['user_balances']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type UserNotificationPreferences = Database['public']['Tables']['user_notification_preferences']['Row']

export type NewMarket = Database['public']['Tables']['markets']['Insert']
export type NewOrder = Database['public']['Tables']['orders']['Insert']
export type NewTrade = Database['public']['Tables']['trades']['Insert']
export type NewNotification = Database['public']['Tables']['notifications']['Insert']
export type NewUserNotificationPreferences = Database['public']['Tables']['user_notification_preferences']['Insert'] 