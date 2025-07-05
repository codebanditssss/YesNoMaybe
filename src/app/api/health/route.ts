import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/server-utils';
import { checkRedisRateLimiterHealth } from '@/lib/redis-rate-limiter';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  responseTime?: number;
  details?: any;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: HealthCheckResult;
    rateLimiter: HealthCheckResult;
    realtime: HealthCheckResult;
    tradingEngine: HealthCheckResult;
    memory: HealthCheckResult;
  };
  summary: {
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

/**
 * Database health check
 */
async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  
  try {
    const supabase = getServiceRoleClient();
    
    // Test basic connectivity with a simple query
    const { data, error } = await supabase
      .from('markets')
      .select('id')
      .limit(1);
    
    const responseTime = Date.now() - start;
    
    if (error) {
      return {
        status: 'unhealthy',
        message: `Database error: ${error.message}`,
        responseTime
      };
    }
    
    // Check if response time is reasonable
    const status = responseTime > 1000 ? 'degraded' : 'healthy';
    const message = status === 'degraded' 
      ? `Database slow (${responseTime}ms)` 
      : 'Database operational';
    
    return {
      status,
      message,
      responseTime
    };
    
  } catch (error) {
    const responseTime = Date.now() - start;
    return {
      status: 'unhealthy',
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime
    };
  }
}

/**
 * Real-time system health check
 */
async function checkRealtimeHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  
  try {
    // Check if real-time endpoint is responsive
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/realtime`, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    const responseTime = Date.now() - start;
    
    if (!response.ok) {
      return {
        status: 'unhealthy',
        message: `Real-time endpoint error: ${response.status}`,
        responseTime
      };
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('text/event-stream')) {
      return {
        status: 'degraded',
        message: 'Real-time endpoint not serving SSE',
        responseTime
      };
    }
    
    return {
      status: 'healthy',
      message: 'Real-time system operational',
      responseTime
    };
    
  } catch (error) {
    const responseTime = Date.now() - start;
    return {
      status: 'unhealthy',
      message: `Real-time system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime
    };
  }
}

/**
 * Trading engine health check
 */
async function checkTradingEngineHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  
  try {
    const supabase = getServiceRoleClient();
    
    // Check if we can access orders table and user_balances
    const [ordersCheck, balancesCheck] = await Promise.all([
      supabase.from('orders').select('id').limit(1),
      supabase.from('user_balances').select('user_id').limit(1)
    ]);
    
    const responseTime = Date.now() - start;
    
    if (ordersCheck.error || balancesCheck.error) {
      return {
        status: 'degraded',
        message: 'Trading engine tables inaccessible',
        responseTime,
        details: {
          ordersError: ordersCheck.error?.message,
          balancesError: balancesCheck.error?.message
        }
      };
    }
    
    // Check for recent orders to see if trading is active
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .limit(1);
    
    const hasRecentActivity = recentOrders && recentOrders.length > 0;
    
    return {
      status: 'healthy',
      message: hasRecentActivity ? 'Trading engine active' : 'Trading engine ready (no recent activity)',
      responseTime,
      details: {
        recentActivity: hasRecentActivity
      }
    };
    
  } catch (error) {
    const responseTime = Date.now() - start;
    return {
      status: 'unhealthy',
      message: `Trading engine error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime
    };
  }
}

/**
 * Memory usage health check
 */
function checkMemoryHealth(): HealthCheckResult {
  try {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);
    
    // Consider memory unhealthy if heap usage is over 80%
    const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let message = `Memory usage: ${heapUsedMB}MB/${heapTotalMB}MB (${heapUsagePercent.toFixed(1)}%)`;
    
    if (heapUsagePercent > 80) {
      status = 'unhealthy';
      message = `High memory usage: ${heapUsagePercent.toFixed(1)}%`;
    } else if (heapUsagePercent > 60) {
      status = 'degraded';
      message = `Elevated memory usage: ${heapUsagePercent.toFixed(1)}%`;
    }
    
    return {
      status,
      message,
      details: {
        heapUsed: `${heapUsedMB}MB`,
        heapTotal: `${heapTotalMB}MB`,
        rss: `${rssMB}MB`,
        heapUsagePercent: heapUsagePercent.toFixed(1) + '%'
      }
    };
    
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Memory check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Main health check endpoint
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Run all health checks in parallel
    const [
      databaseHealth,
      rateLimiterHealth,
      realtimeHealth,
      tradingEngineHealth,
      memoryHealth
    ] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisRateLimiterHealth(),
      checkRealtimeHealth(),
      checkTradingEngineHealth(),
      checkMemoryHealth()
    ]);
    
    // Calculate overall status
    const checks = {
      database: databaseHealth,
      rateLimiter: rateLimiterHealth,
      realtime: realtimeHealth,
      tradingEngine: tradingEngineHealth,
      memory: memoryHealth
    };
    
    const statuses = Object.values(checks).map(check => check.status);
    const summary = {
      healthy: statuses.filter(s => s === 'healthy').length,
      degraded: statuses.filter(s => s === 'degraded').length,
      unhealthy: statuses.filter(s => s === 'unhealthy').length
    };
    
    // Determine overall system status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (summary.unhealthy > 0) {
      overallStatus = 'unhealthy';
    } else if (summary.degraded > 0) {
      overallStatus = 'degraded';
    }
    
    const healthData: SystemHealth = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      checks,
      summary
    };
    
    // Return appropriate HTTP status
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthData, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${Date.now() - startTime}ms`
      }
    });
    
  } catch (error) {
    const errorResponse: SystemHealth = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: { status: 'unhealthy', message: 'Health check failed' },
        rateLimiter: { status: 'unhealthy', message: 'Health check failed' },
        realtime: { status: 'unhealthy', message: 'Health check failed' },
        tradingEngine: { status: 'unhealthy', message: 'Health check failed' },
        memory: { status: 'unhealthy', message: 'Health check failed' }
      },
      summary: { healthy: 0, degraded: 0, unhealthy: 5 }
    };
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${Date.now() - startTime}ms`
      }
    });
  }
} 