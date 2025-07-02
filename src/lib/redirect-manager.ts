import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export interface RedirectConfig {
  from: string;
  to: string;
  condition?: (request: NextRequest, session: any, profile: any) => boolean;
  priority: number;
}

export interface RedirectState {
  isAuthenticated: boolean;
  hasProfile: boolean;
  isOnboardingComplete: boolean;
  currentPath: string;
  redirectHistory: string[];
}

/**
 * Centralized redirect manager to prevent loops and handle all redirects consistently
 */
export class RedirectManager {
  private static MAX_REDIRECTS = 3;
  private static REDIRECT_HISTORY_KEY = 'redirect_history';

  /**
   * Get redirect history from cookies
   */
  private static getRedirectHistory(request: NextRequest): string[] {
    const historyStr = request.cookies.get(this.REDIRECT_HISTORY_KEY)?.value;
    if (!historyStr) return [];
    
    try {
      return JSON.parse(historyStr);
    } catch {
      return [];
    }
  }

  /**
   * Set redirect history in response
   */
  private static setRedirectHistory(response: NextResponse, history: string[]): void {
    response.cookies.set(this.REDIRECT_HISTORY_KEY, JSON.stringify(history), {
      path: '/',
      maxAge: 300, // 5 minutes
      httpOnly: true
    });
  }

  /**
   * Check if a redirect would create a loop
   */
  private static wouldCreateLoop(history: string[], from: string, to: string): boolean {
    // Check for immediate back-and-forth
    if (history.length >= 2) {
      const lastTwo = history.slice(-2);
      if (lastTwo[0] === to && lastTwo[1] === from) {
        return true;
      }
    }

    // Check for too many redirects
    if (history.length >= this.MAX_REDIRECTS) {
      return true;
    }

    // Check for circular pattern
    const cycle = history.indexOf(to);
    if (cycle !== -1 && history.slice(cycle).includes(from)) {
      return true;
    }

    return false;
  }

  /**
   * Clear redirect history
   */
  static clearHistory(response: NextResponse): void {
    response.cookies.delete(this.REDIRECT_HISTORY_KEY);
  }

  /**
   * Determine user state for redirect decisions
   */
  static async getUserState(request: NextRequest): Promise<RedirectState> {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );

    // Use getUser() instead of getSession() for security
    const { data: { user }, error } = await supabase.auth.getUser();
    const currentPath = request.nextUrl.pathname;
    const redirectHistory = this.getRedirectHistory(request);

    let hasProfile = false;
    let isOnboardingComplete = false;

    if (user && !error) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, username, bio')
          .eq('id', user.id)
          .single();

        hasProfile = !!profile;
        isOnboardingComplete = !!(profile?.full_name && profile?.username && profile?.bio);
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
        // Continue with default values
      }
    }

    return {
      isAuthenticated: !!user && !error,
      hasProfile,
      isOnboardingComplete,
      currentPath,
      redirectHistory
    };
  }

  /**
   * Determine the correct redirect target based on user state
   */
  static getRedirectTarget(state: RedirectState): string | null {
    const { isAuthenticated, hasProfile, isOnboardingComplete, currentPath } = state;

    // If user is not authenticated and on a protected route, redirect to home
    if (!isAuthenticated && RouteGuards.isProtectedPath(currentPath)) {
      return '/';
    }

    // If user is authenticated but on auth route, redirect to dashboard
    if (isAuthenticated && currentPath === '/auth') {
      return '/dashboard';
    }

    // If user is authenticated but needs onboarding
    if (isAuthenticated && !isOnboardingComplete) {
      // Don't redirect if already on onboarding page
      if (currentPath === '/onboarding') {
        return null;
      }
      // Redirect to onboarding from any other page
      return '/onboarding';
    }

    // If user is authenticated with complete onboarding but on landing page
    if (isAuthenticated && isOnboardingComplete && currentPath === '/') {
      return '/dashboard';
    }

    // If user is on onboarding but already has complete profile
    if (isAuthenticated && isOnboardingComplete && currentPath === '/onboarding') {
      return '/dashboard';
    }

    // No redirect needed
    return null;
  }

  /**
   * Execute a redirect with loop protection
   */
  static executeRedirect(
    request: NextRequest, 
    targetPath: string,
    reason?: string
  ): NextResponse | null {
    const currentPath = request.nextUrl.pathname;
    const history = this.getRedirectHistory(request);
    
    // Check for redirect loops
    if (this.wouldCreateLoop(history, currentPath, targetPath)) {
      console.warn(`Redirect loop prevented: ${currentPath} -> ${targetPath}`, {
        history,
        reason: reason || 'Unknown'
      });
      
      // Clear history and redirect to safe default
      const response = NextResponse.redirect(new URL('/dashboard', request.url));
      this.clearHistory(response);
      return response;
    }

    // Execute redirect and update history
    const response = NextResponse.redirect(new URL(targetPath, request.url));
    const newHistory = [...history, currentPath].slice(-this.MAX_REDIRECTS);
    this.setRedirectHistory(response, newHistory);
    
    console.log(`Redirect executed: ${currentPath} -> ${targetPath}`, {
      reason: reason || 'Route rule',
      history: newHistory
    });

    return response;
  }

  /**
   * Main middleware function with comprehensive redirect management
   */
  static async handleMiddleware(request: NextRequest): Promise<NextResponse> {
    const state = await this.getUserState(request);
    const targetPath = this.getRedirectTarget(state);

    console.log(`[RedirectManager] Path: ${state.currentPath}, Auth: ${state.isAuthenticated}, Complete: ${state.isOnboardingComplete}, Target: ${targetPath}`);

    // No redirect needed
    if (!targetPath) {
      const response = NextResponse.next();
      
      // Clear redirect history on successful page load
      if (!request.nextUrl.pathname.startsWith('/api')) {
        this.clearHistory(response);
      }
      
      return response;
    }

    // Execute redirect with loop protection
    const redirectResponse = this.executeRedirect(
      request, 
      targetPath,
      `User state: auth=${state.isAuthenticated}, complete=${state.isOnboardingComplete}`
    );

    return redirectResponse || NextResponse.next();
  }
}

/**
 * Client-side redirect utilities
 */
export class ClientRedirectManager {
  private static isRedirecting = false;
  private static lastRedirect = '';
  private static redirectTimeout: NodeJS.Timeout | null = null;

  /**
   * Safe client-side redirect with loop protection
   */
  static redirect(router: any, path: string, reason?: string): void {
    // Prevent rapid redirects
    if (this.isRedirecting && Date.now() - this.getLastRedirectTime() < 1000) {
      console.warn('Rapid redirect prevented:', { path, reason });
      return;
    }

    // Prevent same-path redirects
    if (this.lastRedirect === path) {
      console.warn('Duplicate redirect prevented:', { path, reason });
      return;
    }

    this.isRedirecting = true;
    this.lastRedirect = path;
    this.setLastRedirectTime(Date.now());

    console.log('Client redirect:', { path, reason });

    // Clear redirect lock after delay
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
    
    this.redirectTimeout = setTimeout(() => {
      this.isRedirecting = false;
    }, 2000);

    router.push(path);
  }

  /**
   * Reset redirect state
   */
  static reset(): void {
    this.isRedirecting = false;
    this.lastRedirect = '';
    
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
      this.redirectTimeout = null;
    }
  }

  private static getLastRedirectTime(): number {
    return parseInt(sessionStorage.getItem('lastRedirectTime') || '0');
  }

  private static setLastRedirectTime(time: number): void {
    sessionStorage.setItem('lastRedirectTime', time.toString());
  }
}

/**
 * Route guards for specific paths
 */
export const RouteGuards = {
  protectedPaths: ['/dashboard', '/Markets', '/Portfolio', '/MarketDepth', '/TradeHistory', '/Leaderboard', '/Settings'],
  publicPaths: ['/', '/auth'],
  onboardingPath: '/onboarding',
  
  isProtectedPath(path: string): boolean {
    return this.protectedPaths.some(protectedPath => 
      path === protectedPath || path.startsWith(protectedPath + '/')
    );
  },

  isPublicPath(path: string): boolean {
    return this.publicPaths.some(publicPath => 
      path === publicPath || path.startsWith(publicPath + '/')
    );
  },

  isOnboardingPath(path: string): boolean {
    return path === this.onboardingPath || path.startsWith(this.onboardingPath + '/');
  }
}; 