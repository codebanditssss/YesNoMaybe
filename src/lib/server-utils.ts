import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import type { Database } from '../types/supabase'

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY')
}

/**
 * Create a Supabase client with service role key for admin operations
 * ⚠️ WARNING: Only use this for operations that absolutely require bypassing RLS
 * Prefer using getAuthenticatedServerClient() with proper RLS policies
 */
export function getServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

/**
 * Create an authenticated server client that respects RLS policies
 * This should be used for most operations instead of service role
 */
export async function getAuthenticatedServerClient(request?: NextRequest) {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

/**
 * Get current authenticated user from server context
 */
export async function getCurrentUser(request?: NextRequest) {
  const supabase = await getAuthenticatedServerClient(request)
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      role: user.user_metadata?.role || 'user'
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Wrapper for authenticated API routes
 * Automatically handles authentication and provides both user and supabase client
 */
export function withAuthentication<T extends any[]>(
  handler: (user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>, supabase: Awaited<ReturnType<typeof getAuthenticatedServerClient>>, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T) => {
    try {
      const user = await getCurrentUser(request)
      
      if (!user) {
        return new Response(
          JSON.stringify({ 
            error: 'Unauthorized', 
            message: 'Please sign in to access this resource' 
          }), 
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      const supabase = await getAuthenticatedServerClient(request)
      return handler(user, supabase, ...args)
      
    } catch (error) {
      console.error('Authentication error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Internal Server Error',
          message: 'Authentication failed'
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

/**
 * Admin-only wrapper - requires user to have admin role
 */
export function withAdminAuthentication<T extends any[]>(
  handler: (user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>, supabase: Awaited<ReturnType<typeof getAuthenticatedServerClient>>, ...args: T) => Promise<Response>
) {
  return withAuthentication(async (user, supabase, ...args: T) => {
    if (user.role !== 'admin') {
      return new Response(
        JSON.stringify({ 
          error: 'Forbidden',
          message: 'Admin access required'
        }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return handler(user, supabase, ...args)
  })
}

/**
 * Validate request input against required fields
 */
export function validateRequestInput(data: any, requiredFields: string[]): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = []
  
  for (const field of requiredFields) {
    if (!data[field] || data[field] === null || data[field] === undefined) {
      missingFields.push(field)
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}

/**
 * Standard error response helper
 */
export function createErrorResponse(message: string, status: number = 400, details?: any) {
  return new Response(
    JSON.stringify({ 
      error: message,
      details,
      timestamp: new Date().toISOString()
    }), 
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

/**
 * Standard success response helper
 */
export function createSuccessResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify(data), 
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
} 