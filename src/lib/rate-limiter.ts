import { NextRequest, NextResponse } from 'next/server';

// In-memory store for development (should be Redis in production)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configurations by endpoint type
export const RATE_LIMIT_CONFIGS = {
  // High-frequency endpoints (browsing, viewing)
  READ: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,     // 100 requests per minute
    message: 'Too many requests. Please try again in a moment.'
  },
  
  // Medium-frequency endpoints (placing orders, updating data)
  WRITE: {
    windowMs: 60 * 1000, // 1 minute  
    maxRequests: 30,     // 30 requests per minute
    message: 'Too many requests. Please slow down.'
  },
  
  // Low-frequency endpoints (authentication, sensitive operations)
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,          // 10 requests per 15 minutes
    message: 'Too many authentication attempts. Please try again later.'
  },
  
  // Critical endpoints (order placement, financial operations)
  CRITICAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,     // 10 requests per minute
    message: 'Rate limit exceeded for critical operations. Please wait.'
  }
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

/**
 * Gets the client identifier from request
 * Uses IP address with user ID fallback for authenticated requests
 */
function getClientId(request: NextRequest, userId?: string): string {
  // Get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0].trim() || realIp || 'unknown';
  
  // Combine IP with user ID for better rate limiting
  return userId ? `${ip}:${userId}` : ip;
}

/**
 * Checks if request exceeds rate limit
 */
function checkRateLimit(clientId: string, config: typeof RATE_LIMIT_CONFIGS[RateLimitType]): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);
  
  // Clean up expired entries periodically (simple cleanup)
  if (Math.random() < 0.01) { // 1% chance to clean up
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  // Check if entry exists and is still valid
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(clientId, newEntry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime
    };
  }
  
  // Increment existing entry
  entry.count++;
  rateLimitStore.set(clientId, entry);
  
  return {
    allowed: entry.count <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime
  };
}

/**
 * Creates rate limiting response with proper headers
 */
function createRateLimitResponse(
  config: typeof RATE_LIMIT_CONFIGS[RateLimitType],
  remaining: number,
  resetTime: number
): NextResponse {
  const response = NextResponse.json(
    { 
      error: config.message,
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
    }, 
    { status: 429 }
  );
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', resetTime.toString());
  response.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());
  
  return response;
}

/**
 * Rate limiting middleware for authenticated handlers (works with withAuthentication wrapper)
 */
export function withAuthenticatedRateLimit<T extends any[]>(
  rateLimitType: RateLimitType,
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const config = RATE_LIMIT_CONFIGS[rateLimitType];
      
      // For authenticated handlers, we get the request as the first parameter
      const clientId = getClientId(request);
      const { allowed, remaining, resetTime } = checkRateLimit(clientId, config);
      
      if (!allowed) {
        console.warn(`Rate limit exceeded for ${clientId} on ${request.url}`);
        return createRateLimitResponse(config, remaining, resetTime);
      }
      
      // Call the original handler
      const response = await handler(request, ...args);
      
      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', resetTime.toString());
      
      return response;
      
    } catch (error) {
      console.error('Rate limiting error:', error);
      // If rate limiting fails, allow the request through
      return handler(request, ...args);
    }
  };
}

/**
 * Rate limiting middleware that can be applied to any handler
 */
export function withRateLimit<T extends any[]>(
  rateLimitType: RateLimitType,
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const config = RATE_LIMIT_CONFIGS[rateLimitType];
      
      // Extract user ID from args if it's an authenticated handler
      // This works with both old and new auth patterns
      let userId: string | undefined;
      if (args.length > 0 && args[0] && typeof args[0] === 'object' && 'id' in args[0]) {
        userId = args[0].id;
      }
      
      const clientId = getClientId(request, userId);
      const { allowed, remaining, resetTime } = checkRateLimit(clientId, config);
      
      if (!allowed) {
        console.warn(`Rate limit exceeded for ${clientId} on ${request.url}`);
        return createRateLimitResponse(config, remaining, resetTime);
      }
      
      // Call the original handler
      const response = await handler(request, ...args);
      
      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', resetTime.toString());
      
      return response;
      
    } catch (error) {
      console.error('Rate limiting error:', error);
      // If rate limiting fails, allow the request through
      return handler(request, ...args);
    }
  };
}

/**
 * Simple rate limiting for unprotected endpoints
 */
export function withSimpleRateLimit(
  rateLimitType: RateLimitType,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const config = RATE_LIMIT_CONFIGS[rateLimitType];
      const clientId = getClientId(request);
      const { allowed, remaining, resetTime } = checkRateLimit(clientId, config);
      
      if (!allowed) {
        console.warn(`Rate limit exceeded for ${clientId} on ${request.url}`);
        return createRateLimitResponse(config, remaining, resetTime);
      }
      
      // Call the original handler
      const response = await handler(request);
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', resetTime.toString());
      
      return response;
      
    } catch (error) {
      console.error('Rate limiting error:', error);
      // If rate limiting fails, allow the request through
      return handler(request);
    }
  };
}

/**
 * Clears rate limit entries for testing/development
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
} 