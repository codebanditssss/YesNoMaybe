import { useState, useEffect, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Market } from "@/hooks/useMarkets";
import { cn } from "@/lib/utils";

interface MarketCarouselProps {
  markets: Market[];
  currentMarket: Market | null;
  onMarketSelect: (market: Market) => void;
}

export function MarketCarousel({ markets, currentMarket, onMarketSelect }: MarketCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [transitionMarket, setTransitionMarket] = useState<Market | null>(null);

  // Initialize with current market
  useEffect(() => {
    if (currentMarket) {
      const index = markets.findIndex(m => m.id === currentMarket.id);
      if (index !== -1) {
        setCurrentIndex(index);
        setTransitionMarket(currentMarket);
      }
    }
  }, [currentMarket, markets]);

  const handleMarketChange = useCallback((direction: 'prev' | 'next') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + markets.length) % markets.length
      : (currentIndex + 1) % markets.length;

    // Set transition market first
    setTransitionMarket(markets[newIndex]);
    setCurrentIndex(newIndex);

    // Delay the actual market selection until animation starts
    setTimeout(() => {
      onMarketSelect(markets[newIndex]);
    }, 100);

    // Reset animation state after transition completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  }, [currentIndex, markets, onMarketSelect, isAnimating]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleMarketChange('prev');
      } else if (e.key === 'ArrowRight') {
        handleMarketChange('next');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleMarketChange]);

  const getVisibleMarkets = useCallback(() => {
    if (markets.length === 0) return [];
    
    return [-2, -1, 0, 1, 2].map(offset => {
      let index = currentIndex + offset;
      while (index < 0) index += markets.length;
      while (index >= markets.length) index -= markets.length;
      return {
        market: markets[index],
        position: offset
      };
    });
  }, [currentIndex, markets]);

  if (markets.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No markets available
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'border border-green-400 bg-white text-green-800';
      case 'resolved':
        return ' border border-blue-400 bg-white text-blue-800';
      case 'closing_soon':
        return 'border border-yellow-400 bg-white text-yellow-600';
      default:
        return 'border border-gray-400 bg-white text-gray-800';
    }
  };

  // Use transition market data for the center card if available
  const getMarketData = (market: Market, isCenter: boolean) => {
    if (isCenter && transitionMarket && transitionMarket.id === market.id) {
      return transitionMarket;
    }
    return market;
  };

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-50/50" />
      
      {/* Navigation */}
      <button
        onClick={() => handleMarketChange('prev')}
        disabled={isAnimating}
        className={cn(
          "absolute left-8 z-50 group",
          isAnimating && "pointer-events-none opacity-50"
        )}
        aria-label="Previous market"
      >
        <div className="p-3 rounded-full bg-white shadow-lg border border-gray-200 
          transition-all duration-200 
          group-hover:bg-gray-50 group-hover:shadow-xl
          group-active:scale-95">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </div>
      </button>

      {/* Markets Display */}
      <div className="relative w-full max-w-[1400px] h-full">
        {getVisibleMarkets().map(({ market, position }) => {
          const isCenter = position === 0;
          const isSide = Math.abs(position) === 1;
          const isOuter = Math.abs(position) === 2;
          const displayMarket = getMarketData(market, isCenter);

          const cardStyles = cn(
            "absolute top-1/2 left-1/2 transform transition-all duration-500 ease-out select-none",
            isCenter && "-translate-y-1/2 -translate-x-1/2 z-30 cursor-default",
            position === -1 && "-translate-y-1/2 -translate-x-[85%] z-20 cursor-pointer",
            position === 1 && "-translate-y-1/2 translate-x-[-15%] z-20 cursor-pointer",
            position === -2 && "-translate-y-1/2 -translate-x-[120%] z-10",
            position === 2 && "-translate-y-1/2 translate-x-[20%] z-10",
            isAnimating && "transition-all duration-500 ease-out"
          );

          return (
            <div
              key={market.id}
              className={cardStyles}
              onClick={() => !isCenter && !isOuter && !isAnimating && onMarketSelect(market)}
            >
              <Card className={cn(
                "w-[700px] p-6 transition-all duration-500 border border-gray-200",
                isCenter && "bg-white shadow-md scale-100 opacity-100",
                isSide && "bg-white/95 shadow-sm scale-[0.85] opacity-80 hover:opacity-90 hover:scale-[0.87]",
                isOuter && "bg-white/90 scale-[0.7] opacity-40"
              )}>
                <div className="space-y-4">
                  {/* Status & Category */}
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getStatusColor(displayMarket.status)}>
                      {displayMarket.status}
                    </Badge>
                    <Badge variant="outline">{displayMarket.category}</Badge>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className={cn(
                      "text-xl font-semibold mb-1 line-clamp-2",
                      isCenter ? "text-gray-900" : "text-gray-700"
                    )}>
                      {displayMarket.title}
                    </h3>
                    <p className={cn(
                      "text-sm line-clamp-2",
                      isCenter ? "text-gray-600" : "text-gray-500"
                    )}>
                      {displayMarket.description}
                    </p>
                  </div>

                  {/* Market Stats - Only shown for center card */}
                  {isCenter && (
                    <div className={cn(
                      "grid grid-cols-3 gap-4 pt-2 transition-opacity duration-300",
                      isAnimating ? "opacity-0" : "opacity-100"
                    )}>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Volume</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {displayMarket.volume?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">YES Price</p>
                        <p className="text-lg font-semibold text-blue-600">
                          ₹{displayMarket.yesPrice?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">NO Price</p>
                        <p className="text-lg font-semibold text-gray-700">
                          ₹{displayMarket.noPrice?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => handleMarketChange('next')}
        disabled={isAnimating}
        className={cn(
          "absolute right-8 z-50 group",
          isAnimating && "pointer-events-none opacity-50"
        )}
        aria-label="Next market"
      >
        <div className="p-3 rounded-full bg-white shadow-lg border border-gray-200 
          transition-all duration-200 
          group-hover:bg-gray-50 group-hover:shadow-xl
          group-active:scale-95">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </div>
      </button>
    </div>
  );
} 