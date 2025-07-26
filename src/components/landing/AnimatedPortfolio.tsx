'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioData {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  activePositions: number;
}

export function AnimatedPortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    totalValue: 25000,
    dailyChange: 1250,
    dailyChangePercent: 5.2,
    activePositions: 7
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [displayValue, setDisplayValue] = useState(25000);

  // Simulate portfolio updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setPortfolio(prev => {
        const change = (Math.random() - 0.45) * 1000; // Slightly positive bias
        const newValue = Math.max(20000, prev.totalValue + change);
        const newDailyChange = prev.dailyChange + change;
        const newDailyChangePercent = (newDailyChange / (newValue - newDailyChange)) * 100;
        
        return {
          ...prev,
          totalValue: newValue,
          dailyChange: newDailyChange,
          dailyChangePercent: newDailyChangePercent,
          activePositions: Math.max(5, prev.activePositions + Math.floor((Math.random() - 0.5) * 2))
        };
      });

      setTimeout(() => setIsAnimating(false), 1000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Animate value changes
  useEffect(() => {
    const targetValue = portfolio.totalValue;
    const startValue = displayValue;
    const difference = targetValue - startValue;
    const duration = 800;
    const steps = 60;
    const stepValue = difference / steps;
    let currentStep = 0;

    const animateValue = () => {
      if (currentStep < steps) {
        setDisplayValue(startValue + (stepValue * currentStep));
        currentStep++;
        requestAnimationFrame(animateValue);
      } else {
        setDisplayValue(targetValue);
      }
    };

    if (Math.abs(difference) > 10) {
      animateValue();
    }
  }, [portfolio.totalValue, displayValue]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const isPositive = portfolio.dailyChange >= 0;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 shadow-lg p-4 w-64">
      <div className="flex items-center justify-center mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Portfolio</h3>
      </div>

      <div className="space-y-3">
        {/* Total Value */}
        <div className={`transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
          <div className="text-xs text-gray-500 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(displayValue)}
          </div>
        </div>

        {/* Daily Change */}
        <div className={`flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${
          isPositive ? 'bg-green-50' : 'bg-red-50'
        } ${isAnimating ? 'scale-105' : ''}`}>
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <div>
              <div className={`text-sm font-medium ${
                isPositive ? 'text-green-700' : 'text-red-700'
              }`}>
                {isPositive ? '+' : ''}{formatCurrency(portfolio.dailyChange)}
              </div>
              <div className="text-xs text-gray-500">Today</div>
            </div>
          </div>
          <div className={`text-sm font-medium ${
            isPositive ? 'text-green-700' : 'text-red-700'
          }`}>
            {isPositive ? '+' : ''}{portfolio.dailyChangePercent.toFixed(1)}%
          </div>
        </div>

        {/* Active Positions */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Active Positions</span>
          <span className="font-medium text-gray-900">{portfolio.activePositions}</span>
        </div>
      </div>

      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-green-200/20 rounded-xl animate-pulse"></div>
        </div>
      )}
    </div>
  );
} 