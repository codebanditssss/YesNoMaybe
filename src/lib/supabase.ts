import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = 'https://cyrnkrvlxvoufvazmgqf.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a client for use in the browser with cookie-based auth
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)

// Enable realtime (WebSocket connections will be established on subscription)
if (typeof window !== 'undefined') {
  console.log('🔌 Supabase Realtime Enabled - WebSocket connections will start on subscription')
}

// Create a client with the service role key for admin operations
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient<Database>(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

// Keep admin client disconnected from realtime (server-side operations only)
if (supabaseAdmin && typeof window !== 'undefined') {
  supabaseAdmin.realtime.disconnect()
}

// Types
export type User = Database['public']['Tables']['users']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Market = Database['public']['Tables']['markets']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Trade = Database['public']['Tables']['trades']['Row']
export type Portfolio = Database['public']['Tables']['portfolios']['Row']
export type PortfolioSnapshot = Database['public']['Tables']['portfolio_snapshots']['Row']
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// Insert Types
export type NewUser = Database['public']['Tables']['users']['Insert']
export type NewProfile = Database['public']['Tables']['profiles']['Insert']
export type NewMarket = Database['public']['Tables']['markets']['Insert']
export type NewOrder = Database['public']['Tables']['orders']['Insert']
export type NewTrade = Database['public']['Tables']['trades']['Insert']
export type NewPortfolio = Database['public']['Tables']['portfolios']['Insert']
export type NewPortfolioSnapshot = Database['public']['Tables']['portfolio_snapshots']['Insert']
export type NewAchievement = Database['public']['Tables']['achievements']['Insert']
export type NewNotification = Database['public']['Tables']['notifications']['Insert'] 