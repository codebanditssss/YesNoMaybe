'use client';

import { useState, useCallback } from 'react';
import { Orderbook } from '@/components/dashboard/Orderbook';
import { MarketCarousel } from '@/components/dashboard/MarketCarousel';
import { useMarkets } from '@/hooks/useMarkets';
import type { Market } from '@/hooks/useMarkets';

export default function MarketDepthPage() {
  const { markets, loading } = useMarkets();
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleMarketSelect = useCallback((market: Market) => {
    if (isTransitioning || isPending) return; // Prevent multiple transitions
    
    setIsPending(true); // Start fade out
    setIsTransitioning(true);
    
    // Step 1: Start visual transition
    setTimeout(() => {
      setSelectedMarket(market);
      
      // Step 2: Allow new data to load
      setTimeout(() => {
        setIsPending(false); // Start fade in
        
        // Step 3: Complete transition after fade in
        setTimeout(() => {
          setIsTransitioning(false);
        }, 400);
      }, 200);
    }, 150);
  }, [isTransitioning, isPending]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Market Depth</h1>
          <p className="text-gray-600 mt-2">Explore market details and order book depth</p>
        </div>

        {/* Market Carousel */}
        <div className="mb-8">
          <MarketCarousel
            markets={markets}
            currentMarket={selectedMarket}
            onMarketSelect={handleMarketSelect}
          />
        </div>

        {/* Orderbook */}
        <div className="bg-white rounded-lg shadow relative">
          <div className={`
            absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center
            transition-opacity duration-300 pointer-events-none
            ${isPending ? 'opacity-100' : 'opacity-0'}
          `}>
            <div className="animate-pulse flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Updating...</span>
            </div>
          </div>
          <Orderbook
            selectedMarket={selectedMarket}
            onMarketSelect={handleMarketSelect}
            isTransitioning={isTransitioning}
            isPending={isPending}
          />
        </div>
      </div>
    </div>
  );
} 