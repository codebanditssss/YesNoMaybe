"use client";

import { useState } from 'react'
import { HeroSection } from '@/components/landing/HeroSection'
import { CTASection } from '@/components/landing/CTASection'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AuthModal } from '@/components/auth/AuthModal'
import ResizableNavbar from '@/components/ui/resizable-navbar'

export default function Home() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; tab: 'signin' | 'signup' }>({
    isOpen: false,
    tab: 'signin'
  });

  const openAuthModal = (tab: 'signin' | 'signup') => {
    setAuthModal({ isOpen: true, tab });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, tab: 'signin' });
  };

  return (
    <main className="min-h-screen bg-white relative">
      {/* Navbar */}
      <ResizableNavbar onOpenAuth={openAuthModal} />
      
      {/* Premium Grid Background */}
      <div 
        className="fixed inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(circle, #000000 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <HeroSection onOpenAuth={openAuthModal} />
        
        {/* Stats Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-light text-black">$2.4M+</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Volume Traded</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-light text-black">15K+</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Traders</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-light text-black">89%</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Accuracy Rate</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-light text-black">500+</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Markets Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-gray-50/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
                Enterprise-grade prediction markets
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Advanced tools and analytics for professional opinion trading
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 border border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-black rounded-sm flex items-center justify-center">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <h3 className="text-xl font-medium text-black">Real-time Analytics</h3>
                  <p className="text-gray-600">
                    Advanced market analytics with real-time data feeds and institutional-grade insights.
                  </p>
                </div>
              </Card>
              
              <Card className="p-8 border border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-black rounded-sm flex items-center justify-center">
                    <span className="text-white text-xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-medium text-black">Instant Execution</h3>
                  <p className="text-gray-600">
                    Lightning-fast order execution with minimal slippage and maximum efficiency.
                  </p>
                </div>
              </Card>
              
              <Card className="p-8 border border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-black rounded-sm flex items-center justify-center">
                    <span className="text-white text-xl">🔒</span>
                  </div>
                  <h3 className="text-xl font-medium text-black">Secure Trading</h3>
                  <p className="text-gray-600">
                    Bank-level security with multi-factor authentication and encrypted transactions.
                  </p>
                </div>
              </Card>
              </div>
          </div>
        </section>

        {/* Popular Markets */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
                Popular Markets
              </h2>
              <p className="text-lg text-gray-600">
                Trade on high-volume prediction markets
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 border border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">Technology</Badge>
                    <span className="text-sm text-gray-500">24h volume: $125K</span>
                  </div>
                  <h3 className="font-medium text-black">Will AI achieve AGI by 2025?</h3>
                  <div className="flex justify-between text-sm">
                    <div className="text-center">
                      <div className="text-green-600 font-medium">YES</div>
                      <div className="text-gray-500">34¢</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-600 font-medium">NO</div>
                      <div className="text-gray-500">66¢</div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 border border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">Politics</Badge>
                    <span className="text-sm text-gray-500">24h volume: $89K</span>
                  </div>
                  <h3 className="font-medium text-black">2024 Election Prediction</h3>
                  <div className="flex justify-between text-sm">
                    <div className="text-center">
                      <div className="text-green-600 font-medium">YES</div>
                      <div className="text-gray-500">52¢</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-600 font-medium">NO</div>
                      <div className="text-gray-500">48¢</div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 border border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">Economics</Badge>
                    <span className="text-sm text-gray-500">24h volume: $156K</span>
                  </div>
                  <h3 className="font-medium text-black">Fed Rate Cut by Q2 2024?</h3>
                  <div className="flex justify-between text-sm">
                    <div className="text-center">
                      <div className="text-green-600 font-medium">YES</div>
                      <div className="text-gray-500">73¢</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-600 font-medium">NO</div>
                      <div className="text-gray-500">27¢</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6 bg-gray-50/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
                How it works
              </h2>
              <p className="text-lg text-gray-600">
                Three simple steps to start trading predictions
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-black text-white rounded-sm flex items-center justify-center mx-auto text-2xl font-light">1</div>
                <h3 className="text-xl font-medium text-black">Create Account</h3>
                <p className="text-gray-600">Sign up and verify your identity for secure trading access.</p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-black text-white rounded-sm flex items-center justify-center mx-auto text-2xl font-light">2</div>
                <h3 className="text-xl font-medium text-black">Fund Wallet</h3>
                <p className="text-gray-600">Deposit funds using secure payment methods and start trading.</p>
    </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-black text-white rounded-sm flex items-center justify-center mx-auto text-2xl font-light">3</div>
                <h3 className="text-xl font-medium text-black">Trade Predictions</h3>
                <p className="text-gray-600">Place positions on outcomes and profit from accurate predictions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection onOpenAuth={openAuthModal} />
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        defaultTab={authModal.tab}
      />
    </main>
  )
} 