'use client';

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
              src="/pic.png"
              showGradient={false}
            />
          </div>
          
          {/* Added spacing before the subtitle */}
          <div className="mt-16">
            <h2 className="text-2xl md:text-3xl font-light text-gray-600 max-w-4xl mx-auto leading-relaxed" style={{ marginTop: '300px' }}>
              {user 
                ? `Welcome back, ${user.email?.split('@')[0] || 'Trader'}` 
                : "Professional prediction markets for institutional-grade opinion trading"
              }
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
} 