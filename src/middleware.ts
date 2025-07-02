import { NextRequest, NextResponse } from 'next/server'
import { RedirectManager } from '@/lib/redirect-manager'

/**
 * Middleware with comprehensive redirect management and loop prevention
 */
export async function middleware(request: NextRequest) {
  // Skip API routes completely to avoid interference
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  try {
    return await RedirectManager.handleMiddleware(request)
  } catch (error) {
    console.error('Middleware error:', error)
    // Fallback to allowing the request through on error
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 