import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';

// Redis client for rate limiting
let redisClient: Redis | null = null;

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Rate limit configurations - same as the in-memory version
export const RATE_LIMIT_CONFIGS = {
  READ: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,     // 100 requests per minute
    message: 'Too many requests. Please try again in a moment.'
  },
  WRITE: {
    windowMs: 60 * 1000, // 1 minute  
    maxRequests: 30,     // 30 requests per minute
    message: 'Too many requests. Please slow down.'
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,          // 10 requests per 15 minutes
    message: 'Too many authentication attempts. Please try again later.'
  },
  CRITICAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,     // 10 requests per minute
    message: 'Rate limit exceeded for critical operations. Please wait.'
  }
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

/**
 * Initialize Redis client for production rate limiting
 */
function initRedisClient(): Redis | null {
  if (redisClient) return redisClient;
  
  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
  
  if (!redisUrl || process.env.NODE_ENV === 'development') {
    console.log('Redis not configured or in development mode, falling back to in-memory rate limiting');
    return null;
  }
  
  try {
    redisClient = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    });
    
    redisClient.on('error', (error) => {
      console.error('Redis rate limiter error:', error);
      redisClient = null; // Fall back to in-memory on Redis errors
    });
    
    console.log('Redis rate limiter initialized successfully');
    return redisClient;
  } catch (error) {
    console.error('Failed to initialize Redis rate limiter:', error);
    return null;
  }
}

/**
 * Gets the client identifier from request
 */
function getClientId(request: NextRequest, userId?: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0].trim() || realIp || 'unknown';
  
  return userId ? `rate_limit:${ip}:${userId}` : `rate_limit:${ip}`;
}

/**
 * Redis-based rate limiting check
 */
async function checkRateLimitRedis(
  clientId: string, 
  config: typeof RATE_LIMIT_CONFIGS[RateLimitType]
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
}> {
  const redis = initRedisClient();
  
  if (!redis) {
    // Fall back to in-memory if Redis is not available
    return checkRateLimitInMemory(clientId, config);
  }
  
  try {
    const now = Date.now();
    const windowKey = `${clientId}:${Math.floor(now / config.windowMs)}`;
    
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();
    pipeline.incr(windowKey);
    pipeline.expire(windowKey, Math.ceil(config.windowMs / 1000));
    
    const results = await pipeline.exec();
    
    if (!results || results[0][1] === null) {
      throw new Error('Redis pipeline failed');
    }
    
    const count = results[0][1] as number;
    const resetTime = now + config.windowMs;
    
    return {
      allowed: count <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
      resetTime
    };
    
  } catch (error) {
    console.error('Redis rate limit check failed, falling back to in-memory:', error);
    return checkRateLimitInMemory(clientId, config);
  }
}

/**
 * In-memory fallback rate limiting (same as original implementation)
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimitInMemory(
  clientId: string, 
  config: typeof RATE_LIMIT_CONFIGS[RateLimitType]
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);
  
  // Periodic cleanup
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  if (!entry || now > entry.resetTime) {
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
  
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', resetTime.toString());
  response.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());
  
  return response;
}

/**
 * Production-ready rate limiting middleware with Redis support
 */
export function withProductionRateLimit<T extends any[]>(
  rateLimitType: RateLimitType,
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const config = RATE_LIMIT_CONFIGS[rateLimitType];
      
      // Extract user ID from args if available
      let userId: string | undefined;
      if (args.length > 0 && args[0] && typeof args[0] === 'object' && 'id' in args[0]) {
        userId = args[0].id;
      }
      
      const clientId = getClientId(request, userId);
      const { allowed, remaining, resetTime } = await checkRateLimitRedis(clientId, config);
      
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
 * Health check for Redis rate limiter
 */
export async function checkRedisRateLimiterHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  redisConnected: boolean;
}> {
  try {
    const redis = initRedisClient();
    
    if (!redis) {
      return {
        status: 'degraded',
        message: 'Using in-memory rate limiting (Redis not configured)',
        redisConnected: false
      };
    }
    
    // Test Redis connection
    const testKey = 'health_check:rate_limiter';
    await redis.set(testKey, '1', 'EX', 10);
    const result = await redis.get(testKey);
    await redis.del(testKey);
    
    if (result === '1') {
      return {
        status: 'healthy',
        message: 'Redis rate limiting operational',
        redisConnected: true
      };
    } else {
      throw new Error('Redis health check failed');
    }
    
  } catch (error) {
    console.error('Redis health check failed:', error);
    return {
      status: 'unhealthy',
      message: `Redis rate limiter error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      redisConnected: false
    };
  }
}

/**
 * Clean up Redis client on shutdown
 */
export function closeRedisRateLimiter(): void {
  if (redisClient) {
    redisClient.disconnect();
    redisClient = null;
  }
} 