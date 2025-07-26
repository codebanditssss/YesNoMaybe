'use client';

import { useState, useEffect } from 'react';
import { Trophy, Bitcoin, Building, TrendingUp, Tv, Gamepad2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  markets: string[];
  count: number;
}

const categories: Category[] = [
  {
    id: 'sports',
    name: 'Sports',
    icon: <Trophy className="h-4 w-4" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    markets: ['IPL 2024', 'FIFA World Cup', 'Premier League'],
    count: 24
  },
  {
    id: 'crypto',
    name: 'Crypto',
    icon: <Bitcoin className="h-4 w-4" />,
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    markets: ['Bitcoin $50K', 'Ethereum ETF', 'DeFi Season'],
    count: 18
  },
  {
    id: 'politics',
    name: 'Politics',
    icon: <Building className="h-4 w-4" />,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    markets: ['Elections 2024', 'Policy Changes', 'Global Events'],
    count: 16
  },
  {
    id: 'economics',
    name: 'Economics',
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    markets: ['Interest Rates', 'Stock Markets', 'GDP Growth'],
    count: 12
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: <Tv className="h-4 w-4" />,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    markets: ['Award Shows', 'Box Office', 'Streaming Wars'],
    count: 9
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: <Gamepad2 className="h-4 w-4" />,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    markets: ['AI Breakthroughs', 'Product Launches', 'IPOs'],
    count: 15
  }
];

export function MarketCategories() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % categories.length);
        setIsTransitioning(false);
      }, 200);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const currentCategory = categories[currentIndex];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 shadow-lg p-4 w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Market Categories</h3>
        <div className="text-xs text-gray-500">
          {currentIndex + 1} of {categories.length}
        </div>
      </div>

      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        {/* Current Category */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${currentCategory.bgColor} ${currentCategory.color}`}>
            {currentCategory.icon}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{currentCategory.name}</div>
            <div className="text-xs text-gray-500">{currentCategory.count} active markets</div>
          </div>
        </div>

        {/* Sample Markets */}
        <div className="space-y-2">
          {currentCategory.markets.map((market, index) => (
            <div 
              key={market}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: isTransitioning ? 'none' : 'fadeInUp 0.5s ease-out forwards'
              }}
            >
              <span className="text-sm text-gray-700">{market}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">₹{(Math.random() * 80 + 10).toFixed(0)}</span>
                <div className={`w-2 h-2 rounded-full ${
                  Math.random() > 0.5 ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Indicators */}
        <div className="flex justify-center gap-1 mt-4">
          {categories.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-gray-900 w-6' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 