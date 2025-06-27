import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      markets: {
        Row: {
          actual_outcome: string | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          resolution_date: string | null
          status: string
          tags: string[] | null
          title: string
          total_no_volume: number | null
          total_traders: number | null
          total_volume: number | null
          total_yes_volume: number | null
          updated_at: string
        }
        Insert: {
          actual_outcome?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          resolution_date?: string | null
          status?: string
          tags?: string[] | null
          title: string
          total_no_volume?: number | null
          total_traders?: number | null
          total_volume?: number | null
          total_yes_volume?: number | null
          updated_at?: string
        }
        Update: {
          actual_outcome?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          resolution_date?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          total_no_volume?: number | null
          total_traders?: number | null
          total_volume?: number | null
          total_yes_volume?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          expires_at: string | null
          filled_cost: number | null
          filled_quantity: number | null
          id: string
          market_id: string
          order_type: string | null
          price: number
          quantity: number
          remaining_quantity: number | null
          side: string
          status: string
          total_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          filled_cost?: number | null
          filled_quantity?: number | null
          id?: string
          market_id: string
          order_type?: string | null
          price: number
          quantity: number
          remaining_quantity?: number | null
          side: string
          status?: string
          total_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          filled_cost?: number | null
          filled_quantity?: number | null
          id?: string
          market_id?: string
          order_type?: string | null
          price?: number
          quantity?: number
          remaining_quantity?: number | null
          side?: string
          status?: string
          total_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_verified: boolean | null
          location: string | null
          reputation_score: number | null
          total_trades: number | null
          total_winnings: number | null
          twitter_handle: string | null
          updated_at: string
          username: string | null
          website: string | null
          win_rate: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          location?: string | null
          reputation_score?: number | null
          total_trades?: number | null
          total_winnings?: number | null
          twitter_handle?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
          win_rate?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          location?: string | null
          reputation_score?: number | null
          total_trades?: number | null
          total_winnings?: number | null
          twitter_handle?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
          win_rate?: number | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          created_at: string
          id: string
          market_id: string
          no_order_id: string
          no_user_id: string
          no_user_payout: number | null
          price: number
          quantity: number
          status: string
          total_value: number | null
          winner_side: string | null
          winner_user_id: string | null
          yes_order_id: string
          yes_user_id: string
          yes_user_payout: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          market_id: string
          no_order_id: string
          no_user_id: string
          no_user_payout?: number | null
          price: number
          quantity: number
          status?: string
          total_value?: number | null
          winner_side?: string | null
          winner_user_id?: string | null
          yes_order_id: string
          yes_user_id: string
          yes_user_payout?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          market_id?: string
          no_order_id?: string
          no_user_id?: string
          no_user_payout?: number | null
          price?: number
          quantity?: number
          status?: string
          total_value?: number | null
          winner_side?: string | null
          winner_user_id?: string | null
          yes_order_id?: string
          yes_user_id?: string
          yes_user_payout?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trades_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_no_order_id_fkey"
            columns: ["no_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_yes_order_id_fkey"
            columns: ["yes_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_balances: {
        Row: {
          available_balance: number
          created_at: string
          id: string
          locked_balance: number
          total_deposited: number
          total_profit_loss: number
          total_trades: number
          total_volume: number
          total_withdrawn: number
          updated_at: string
          user_id: string
          winning_trades: number
        }
        Insert: {
          available_balance?: number
          created_at?: string
          id?: string
          locked_balance?: number
          total_deposited?: number
          total_profit_loss?: number
          total_trades?: number
          total_volume?: number
          total_withdrawn?: number
          updated_at?: string
          user_id: string
          winning_trades?: number
        }
        Update: {
          available_balance?: number
          created_at?: string
          id?: string
          locked_balance?: number
          total_deposited?: number
          total_profit_loss?: number
          total_trades?: number
          total_volume?: number
          total_withdrawn?: number
          updated_at?: string
          user_id?: string
          winning_trades?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_profile: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      match_order: {
        Args: {
          p_market_id: string
          p_user_id: string
          p_side: string
          p_quantity: number
          p_price: number
        }
        Returns: Json
      }
      resolve_market: {
        Args: { p_market_id: string; p_outcome: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helpful type exports
export type Market = Database['public']['Tables']['markets']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Trade = Database['public']['Tables']['trades']['Row']
export type UserBalance = Database['public']['Tables']['user_balances']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

export type NewMarket = Database['public']['Tables']['markets']['Insert']
export type NewOrder = Database['public']['Tables']['orders']['Insert']
export type NewTrade = Database['public']['Tables']['trades']['Insert'] 