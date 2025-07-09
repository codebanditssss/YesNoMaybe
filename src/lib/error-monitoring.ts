import { NextRequest } from 'next/server';

export interface ErrorContext {
  userId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  timestamp: string;
  environment: string;
  userSession?: {
    sessionId?: string;
    isAuthenticated: boolean;
  };
  additionalData?: Record<string, any>;
}

export interface ErrorDetails {
  message: string;
  stack?: string;
  name: string;
  cause?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'database' | 'api' | 'auth' | 'trading' | 'realtime' | 'system' | 'user' | 'unknown';
}

/**
 * Production error logger with structured logging
 */
class ErrorMonitor {
  private environment: string;
  private isDevelopment: boolean;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.isDevelopment = this.environment === 'development';
  }

  /**
   * Log error with full context
   */
  async logError(error: Error | unknown, context: Partial<ErrorContext> = {}, overrides: Partial<ErrorDetails> = {}): Promise<void> {
    try {
      const errorDetails = this.createErrorDetails(error, context, overrides);
      
      // Log to console (always)
      this.logToConsole(errorDetails);
      
      // In production, would send to external monitoring service
      if (!this.isDevelopment) {
        await this.sendToMonitoringService(errorDetails);
      }
      
      // Log to database for critical errors
      if (errorDetails.severity === 'critical') {
        await this.logToDatabase(errorDetails);
      }
      
    } catch (loggingError) {
      // Fallback: always log to console if error monitoring fails
      console.error('Error monitoring system failed:', loggingError);
      console.error('Original error:', error);
    }
  }

  /**
   * Create standardized error details
   */
  private createErrorDetails(error: Error | unknown, context: Partial<ErrorContext>, overrides: Partial<ErrorDetails>): ErrorDetails {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    const fullContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      userSession: {
        isAuthenticated: false
      },
      ...context
    };

    return {
      message: errorObj.message || 'Unknown error',
      stack: errorObj.stack,
      name: errorObj.name || 'Error',
      cause: errorObj.cause ? String(errorObj.cause) : undefined,
      context: fullContext,
      severity: this.determineSeverity(errorObj),
      category: this.determineCategory(errorObj),
      ...overrides
    };
  }

  /**
   * Determine error severity based on error type and message
   */
  private determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Critical errors
    if (
      message.includes('database') && message.includes('connection') ||
      message.includes('payment') ||
      message.includes('trading engine') ||
      name.includes('databaseerror') ||
      message.includes('critical')
    ) {
      return 'critical';
    }

    // High severity
    if (
      message.includes('auth') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('rate limit') ||
      message.includes('order') && message.includes('fail')
    ) {
      return 'high';
    }

    // Medium severity
    if (
      message.includes('validation') ||
      message.includes('timeout') ||
      message.includes('network') ||
      name.includes('typeerror')
    ) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Determine error category based on error characteristics
   */
  private determineCategory(error: Error): ErrorDetails['category'] {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('database') || message.includes('supabase') || stack.includes('supabase')) {
      return 'database';
    }
    if (message.includes('auth') || message.includes('unauthorized') || stack.includes('auth')) {
      return 'auth';
    }
    if (message.includes('order') || message.includes('trading') || message.includes('market')) {
      return 'trading';
    }
    if (message.includes('realtime') || message.includes('websocket') || message.includes('sse')) {
      return 'realtime';
    }
    if (stack.includes('api/') || message.includes('api')) {
      return 'api';
    }
    if (message.includes('memory') || message.includes('heap') || message.includes('system')) {
      return 'system';
    }
    if (message.includes('validation') || message.includes('input')) {
      return 'user';
    }

    return 'unknown';
  }

  /**
   * Log to console with proper formatting
   */
  private logToConsole(errorDetails: ErrorDetails): void {
    const { severity, category, message, context } = errorDetails;
    
    const logLevel = severity === 'critical' ? 'error' : 
                    severity === 'high' ? 'error' :
                    severity === 'medium' ? 'warn' : 'info';

    const prefix = `[${severity.toUpperCase()}] [${category.toUpperCase()}]`;
    const timestamp = context.timestamp;
    const location = context.url ? ` at ${context.url}` : '';
    
    console[logLevel](`${prefix} ${timestamp}${location}: ${message}`);
    
    if (errorDetails.stack && this.isDevelopment) {
      console[logLevel]('Stack trace:', errorDetails.stack);
    }
    
    if (context.additionalData) {
      console[logLevel]('Additional context:', context.additionalData);
    }
  }

  /**
   * Send to external monitoring service (Sentry, DataDog, etc.)
   */
  private async sendToMonitoringService(errorDetails: ErrorDetails): Promise<void> {
    // In production, this would integrate with services like:
    // - Sentry for error tracking
    // - DataDog for APM
    // - LogRocket for session replay
    // - Custom webhook endpoints
    
    // Example implementation:
    try {
      const monitoringWebhook = process.env.ERROR_MONITORING_WEBHOOK;
      
      if (monitoringWebhook) {
        await fetch(monitoringWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service: 'augur-trading',
            environment: this.environment,
            error: errorDetails,
            timestamp: errorDetails.context.timestamp
          }),
        });
      }
    } catch (webhookError) {
      console.error('Failed to send error to monitoring service:', webhookError);
    }
  }

  /**
   * Log critical errors to database for persistence
   */
  private async logToDatabase(errorDetails: ErrorDetails): Promise<void> {
    try {
      // This would typically use a dedicated error logging table
      // For now, we'll just ensure critical errors are preserved
      const errorLog = {
        timestamp: errorDetails.context.timestamp,
        severity: errorDetails.severity,
        category: errorDetails.category,
        message: errorDetails.message,
        stack: errorDetails.stack,
        context: JSON.stringify(errorDetails.context),
        environment: this.environment
      };
      
      // Would insert into error_logs table in production
      console.error('CRITICAL ERROR - Database log:', errorLog);
      
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError);
    }
  }

  /**
   * Create error context from Next.js request
   */
  createRequestContext(request: NextRequest, additionalData?: Record<string, any>): Partial<ErrorContext> {
    return {
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: this.getClientIP(request),
      additionalData
    };
  }

  /**
   * Extract client IP from request
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    return forwarded?.split(',')[0].trim() || realIp || 'unknown';
  }
}

// Singleton instance
export const errorMonitor = new ErrorMonitor();

/**
 * Convenience function for logging errors
 */
export async function logError(
  error: Error | unknown, 
  context?: Partial<ErrorContext>, 
  overrides?: Partial<ErrorDetails>
): Promise<void> {
  return errorMonitor.logError(error, context, overrides);
}

/**
 * Express/Next.js middleware wrapper for automatic error monitoring
 */
export function withErrorMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<any>,
  context?: Partial<ErrorContext>
) {
  return async (...args: T): Promise<any> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Auto-log errors with request context if available
      const requestContext = args[0] && typeof args[0] === 'object' && 'url' in args[0] 
        ? errorMonitor.createRequestContext(args[0] as NextRequest)
        : {};
      
      await logError(error, { ...requestContext, ...context });
      throw error; // Re-throw for normal error handling
    }
  };
}

/**
 * Performance monitoring wrapper
 */
export function withPerformanceMonitoring<T extends any[]>(
  name: string,
  handler: (...args: T) => Promise<any>
) {
  return async (...args: T): Promise<any> => {
    const start = Date.now();
    
    try {
      const result = await handler(...args);
      const duration = Date.now() - start;
      
      // Log slow operations
      if (duration > 1000) {
        console.warn(`[PERFORMANCE] Slow operation "${name}": ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      await logError(error, {
        additionalData: {
          operationName: name,
          operationDuration: duration
        }
      });
      throw error;
    }
  };
} 