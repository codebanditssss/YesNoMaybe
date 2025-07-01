import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export interface AuthenticatedUser {
  id: string
  email: string
  role?: string
}

/**
 * Extracts and verifies JWT token from request headers or cookies
 * Returns user data if valid, null if invalid
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Create server client that can access cookies
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
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

    // Get the current user from the session
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.warn('No valid session found:', error?.message)
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      role: user.user_metadata?.role || 'user'
    }

  } catch (error) {
    console.error('Error in getAuthenticatedUser:', error)
    return null
  }
}

/**
 * Alternative method: Get user from session (for server-side)
 */
export async function getUserFromSession(): Promise<AuthenticatedUser | null> {
  try {
    // This method is deprecated for server-side use
    console.warn('getUserFromSession is deprecated for server-side use')
    return null
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

/**
 * Middleware function for protecting API routes
 */
export function withAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please login to access this resource' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return handler(request, user)
  }
}

/**
 * Admin-only middleware
 */
export function withAdminAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please login to access this resource' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (user.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return handler(request, user)
  }
}

/**
 * Utility to validate request inputs
 */
export function validateInput(data: any, requiredFields: string[]): { isValid: boolean; missingFields: string[] } {
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