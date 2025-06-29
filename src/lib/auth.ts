import { supabase } from './supabase'
import { NextRequest } from 'next/server'

export interface AuthenticatedUser {
  id: string
  email: string
  role?: string
}

/**
 * Extracts and verifies JWT token from request headers
 * Returns user data if valid, null if invalid
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // First try to get the session token from the cookie
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (session?.user) {
      return {
        id: session.user.id,
        email: session.user.email!,
        role: session.user.user_metadata?.role || 'user'
      }
    }

    // If no session from cookie, try the Authorization header
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (user) {
        return {
          id: user.id,
          email: user.email!,
          role: user.user_metadata?.role || 'user'
        }
      }
    }

    // No valid session found
    console.warn('No valid session found')
    return null

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
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email!,
      role: session.user.user_metadata?.role || 'user'
    }
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