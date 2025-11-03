'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { HeroScrollDemo } from "./laptopScroll";
import { MorphingTextDemo } from "../ui/Morphyy";
import { MiniOrderbook } from "./MiniOrderbook";
import { AnimatedPortfolio } from "./AnimatedPortfolio";
import { MarketCategories } from "./MarketCategories";
import { FloatingElements } from "./FloatingElements";
import { useState, useEffect } from "react";
import { Play, ArrowRight, BarChart3 } from "lucide-react";

interface HeroSectionProps {
  onOpenAuth?: (tab: 'signin' | 'signup') => void;
}

export function HeroSection({ onOpenAuth }: HeroSectionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [showDemo, setShowDemo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartTrading = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      onOpenAuth?.('signup');
    }
  };

  const handleViewDemo = () => {
    setShowDemo(true);
  };

  const handleLearnMore = () => {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="relative py-0 pb-0 overflow-hidden min-h-screen flex items-center justify-center">
        {/* Floating Elements Background */}
        <FloatingElements />
        
        {/* Main Content */}
        <div className="container px-4 mx-auto relative z-10">
          <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto">
            
            {/* Main Headline */}
            <div className="text-center mb-8 max-w-4xl mt-32">
              <h1 className="font-light text-5xl md:text-7xl text-black mb-6 leading-tight">
                Professional Prediction
                <br />
                <span className="flex items-center justify-center gap-4 mt-2 flex-wrap">
                  Markets for <span className="ml-2"><MorphingTextDemo /></span>
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                Trade on real-world events with institutional-grade tools. 
                Real-time analytics, professional orderbooks, and advanced portfolio management.
              </p>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 z-20 relative">
              <Button 
                onClick={handleStartTrading}
                size="lg"
                className="bg-black hover:bg-gray-900 text-white px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {user ? 'Go to Dashboard' : 'Start Trading'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                onClick={handleViewDemo}
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300"
              >
                <Play className="mr-2 h-5 w-5" />
                View Live Demo
              </Button>
            </div>

            {/* Interactive Demo Components */}
            {mounted && (
              <div className="flex flex-wrap items-center justify-center gap-8 mb-16 max-w-6xl">
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <MiniOrderbook />
                </div>
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <AnimatedPortfolio />
                </div>
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <MarketCategories />
                </div>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Real-time WebSocket updates</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Professional orderbook interface</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Multi-category prediction markets</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Advanced portfolio analytics</span>
              </div>
            </div>

          </div>
        </div>

        {/* Demo Modal */}
        {showDemo && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDemo(false)}
          >
            <div 
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowDemo(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-light"
              >
                ✕
              </button>
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900">Live Platform Demo</h3>
                  <p className="text-gray-600 mt-2">Experience the full trading interface</p>
                </div>
                <div className="bg-gray-100 flex items-center justify-center overflow-auto max-h-[80vh]">
                  <img
                    src="/Screenshotdb.png"
                    alt="Platform Demo"
                    className="w-full h-auto object-contain max-h-[80vh]"
                    draggable={false}
                  />
                </div>
                <div className="p-6 bg-gray-50 flex justify-end">
                  <Button onClick={handleStartTrading}>
                    Get Started Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Platform Preview */}
      <HeroScrollDemo />
    </>
  );
} 