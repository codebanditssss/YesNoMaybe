import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { MacbookScroll } from "@/components/ui/macbook-scroll";

interface HeroSectionProps {
  onOpenAuth?: (tab: 'signin' | 'signup') => void;
}

export function HeroSection({ onOpenAuth }: HeroSectionProps) {
  const { user, loading } = useAuth();

  return (
    <section className="pt-40 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-8">
          {/* Dynamic badge based on auth state */}
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm">
            <span className="text-sm font-medium text-gray-700">
              {user ? "Welcome to your trading dashboard" : "Enterprise-Grade Opinion Trading"}
            </span>
          </div>
          
          {/* Clean, professional headline */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-black leading-[1.1]">
              YesNoMaybe
            </h1>
            
            {/* MacBook Scroll Component - positioned right after the title */}
            <div className="mt-12">
              <MacbookScroll
                title={
                  <span>
                    Experience the future of trading. <br />
                    Scroll to see our platform in action.
                  </span>
                }
                badge={
                  <div className="h-10 w-10 transform -rotate-12 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Y</span>
                  </div>
                }
                // Using a data URL for a placeholder gradient until you add a real screenshot
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f8fafc;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23e2e8f0;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='600' fill='url(%23grad)'/%3E%3Ctext x='400' y='300' font-family='Arial' font-size='24' fill='%236b7280' text-anchor='middle'%3EYesNoMaybe Trading Platform%3C/text%3E%3C/svg%3E"
                showGradient={false}
              />
            </div>
            
            {/* Added spacing before the subtitle */}
            <div className="mt-16">
              <h2 className="text-2xl md:text-3xl font-light text-gray-600 max-w-4xl mx-auto leading-relaxed"  style={{ marginTop: '300px' }}>
                {user 
                  ? `Welcome back, ${user.email?.split('@')[0] || 'Trader'}` 
                  : "Professional prediction markets for institutional-grade opinion trading"
                }
              </h2>
            </div>
          </div>
          
          {/* Professional description */}
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {user 
              ? "Ready to explore new markets and manage your positions? Your trading dashboard awaits."
              : "Execute strategic positions on future market outcomes with institutional-level precision and transparency."
            }
          </p>
          
          {/* Dynamic buttons based on auth state */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : user ? (
              <>
                <Button 
                  size="lg" 
                  className="bg-black text-white hover:bg-gray-800 px-12 py-6 text-base font-normal border-0 rounded-sm transition-all duration-200"
                >
                  Browse Markets
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-12 py-6 text-base font-normal rounded-sm transition-all duration-200"
                >
                  View Portfolio
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="lg" 
                  onClick={() => onOpenAuth?.('signup')}
                  className="bg-black text-white hover:bg-gray-800 px-12 py-6 text-base font-normal border-0 rounded-sm transition-all duration-200"
                >
                  Access Platform
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => onOpenAuth?.('signin')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-12 py-6 text-base font-normal rounded-sm transition-all duration-200"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 