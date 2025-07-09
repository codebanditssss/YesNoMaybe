'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { MacbookScroll } from "@/components/ui/macbook-scroll";

interface HeroSectionProps {
  onOpenAuth?: (tab: 'signin' | 'signup') => void;
}

export function HeroSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="flex flex-wrap items-center -mx-4">
          <div className="w-full lg:w-1/2 px-4 mb-12 lg:mb-0">
            <div className="max-w-lg">
              <img src="/logo.svg" alt="Augur" className="h-12 mb-8" />
              <h1 className="font-light text-4xl md:text-5xl text-black mb-6">
                Trade on the Future with <span className="font-normal">Augur</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Join the sophisticated prediction market where insight meets opportunity. Trade on future outcomes with real-time data and advanced analytics.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="inline-block px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                  Start Trading
                </button>
                <button className="inline-block px-6 py-3 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 px-4">
            <div className="relative">
              <img 
                className="relative rounded-2xl"
                src="/trading-preview.png" 
                alt="Trading Interface Preview" 
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/20 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 