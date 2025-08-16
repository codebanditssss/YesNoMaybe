'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Search, TrendingUp, BarChart3, Target, CheckCircle } from 'lucide-react';

export function HowItWorksSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoProgress, setAutoProgress] = useState(false);

  const steps = [
    {
      id: 'discover',
      title: 'Discover Markets',
      description: 'Browse prediction markets across sports, crypto, politics, and technology',
      icon: <Search className="h-8 w-8" />,
      content: {
        type: 'market-browser',
        data: [
          { name: 'Will Bitcoin reach $150k in 2025?', category: 'Crypto', price: '₹67', trend: '+5.2%', popular: true },
          { name: 'IPL 2024 Winner', category: 'Sports', price: '₹42', trend: '+2.1%' },
          { name: 'Will Tesla FSD be fully released?', category: 'Tech', price: '₹73', trend: '-1.3%' },
          { name: 'US Elections 2024', category: 'Politics', price: '₹58', trend: '+3.7%' }
        ]
      }
    },
    {
      id: 'analyze',
      title: 'Analyze Data',
      description: 'View real-time market data, charts, and community insights',
      icon: <BarChart3 className="h-8 w-8" />,
      content: {
        type: 'market-analysis',
        data: {
          market: 'Will Bitcoin reach $150k in 2025?',
          price: 67,
          volume: '₹3.2L',
          chart: [45, 52, 48, 61, 67, 65, 72, 67],
          stats: { high: '₹74', low: '₹41', volume: '₹3.2L' }
        }
      }
    },
    {
      id: 'trade',
      title: 'Place Your Trade',
      description: 'Choose YES or NO and enter your prediction with confidence',
      icon: <TrendingUp className="h-8 w-8" />,
      content: {
        type: 'trading-interface',
        data: {
          market: 'Will Bitcoin reach $150k in 2025?',
          currentPrice: 67,
          selectedSide: 'YES',
          amount: 1000
        }
      }
    },
    {
      id: 'track',
      title: 'Track Performance',
      description: 'Monitor your positions and portfolio performance in real-time',
      icon: <Target className="h-8 w-8" />,
      content: {
        type: 'portfolio-tracker',
        data: {
          totalValue: 48147,
          dailyChange: 2847,
          positions: 3,
          winRate: 73
        }
      }
    }
  ];

  useEffect(() => {
    if (!autoProgress) return;
    
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoProgress, steps.length]);

  const nextStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
      setIsAnimating(false);
    }, 300);
  };

  const goToStep = (index: number) => {
    if (index === currentStep) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(index);
      setIsAnimating(false);
    }, 300);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.content.type) {
      case 'market-browser':
        const marketData = step.content.data as Array<{name: string; category: string; price: string; trend: string; popular?: boolean}>;
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Trending Markets</h4>
              <span className="text-xs text-gray-500">Updated now</span>
            </div>
            {marketData.map((market, i: number) => (
              <div key={i} className={`p-4 rounded-lg border transition-all duration-500 ${
                market.popular ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
              } hover:shadow-md`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 text-sm">{market.name}</h5>
                    <span className="text-xs text-gray-500">{market.category}</span>
                  </div>
                  {market.popular && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Popular</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">{market.price}</span>
                  <span className={`text-sm font-medium ${
                    market.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>{market.trend}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'market-analysis':
        const analysisData = step.content.data as {
          market: string;
          price: number;
          volume: string;
          chart: number[];
          stats: { high: string; low: string; volume: string };
        };
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{analysisData.market}</h4>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-gray-900">₹{analysisData.price}</span>
                <span className="text-sm text-green-600 font-medium">+5.2%</span>
                <span className="text-sm text-gray-500">Vol: {analysisData.volume}</span>
              </div>
            </div>
            
            {/* Mini Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="h-32 flex items-end gap-2">
                {analysisData.chart.map((value: number, i: number) => (
                  <div
                    key={i}
                    className="bg-blue-500 rounded-t transition-all duration-1000 ease-out"
                    style={{ 
                      height: `${(value / 80) * 100}%`,
                      width: '12%',
                      animationDelay: `${i * 100}ms`
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-sm font-medium text-gray-900">{analysisData.stats.high}</div>
                <div className="text-xs text-gray-500">24h High</div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-sm font-medium text-gray-900">{analysisData.stats.low}</div>
                <div className="text-xs text-gray-500">24h Low</div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-sm font-medium text-gray-900">{analysisData.stats.volume}</div>
                <div className="text-xs text-gray-500">Volume</div>
              </div>
            </div>
          </div>
        );

      case 'trading-interface':
        const tradingData = step.content.data as {
          market: string;
          currentPrice: number;
          selectedSide: string;
          amount: number;
        };
    return (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{tradingData.market}</h4>
              <div className="text-xl font-bold text-gray-900 mb-4">Current Price: ₹{tradingData.currentPrice}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className={`p-4 rounded-lg border-2 transition-all ${
                tradingData.selectedSide === 'YES' 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
                <div className="text-lg font-bold">YES</div>
                <div className="text-sm">₹{tradingData.currentPrice}</div>
              </button>
              
              <button className={`p-4 rounded-lg border-2 transition-all ${
                tradingData.selectedSide === 'NO' 
                  ? 'border-red-500 bg-red-50 text-red-700' 
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
                <div className="text-lg font-bold">NO</div>
                <div className="text-sm">₹{100 - tradingData.currentPrice}</div>
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Investment Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input 
                  type="text" 
                  value={tradingData.amount.toLocaleString()}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
            </div>

            <button className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Place Order
            </button>
          </div>
        );

      case 'portfolio-tracker':
        const portfolioData = step.content.data as {
          totalValue: number;
          dailyChange: number;
          positions: number;
          winRate: number;
        };
        return (
          <div className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900">₹{portfolioData.totalValue.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mb-2">Portfolio Value</div>
              <div className="text-lg font-medium text-green-600">+₹{portfolioData.dailyChange.toLocaleString()} (Today)</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-xl font-bold text-gray-900">{portfolioData.positions}</div>
                <div className="text-xs text-gray-500">Active Positions</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-xl font-bold text-gray-900">{portfolioData.winRate}%</div>
                <div className="text-xs text-gray-500">Win Rate</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-xl font-bold text-gray-900">12</div>
                <div className="text-xs text-gray-500">Total Trades</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Profitable trading session!</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

    return (
    <section className="py-24 bg-white">
      <div className="container px-4 mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-light text-4xl md:text-5xl text-black mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Start trading predictions in four simple steps
          </p>
          
          <button 
            onClick={() => setAutoProgress(!autoProgress)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoProgress 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {autoProgress ? 'Auto Playing' : 'Auto Play Demo'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Steps Navigation */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  currentStep === index 
                    ? 'border-black bg-gray-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => goToStep(index)}
              >
                <div className="flex items-start gap-4">
                  {/* Step Number & Icon */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all duration-300 ${
                    currentStep === index 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {currentStep > index ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  {currentStep === index && (
                    <ArrowRight className="h-5 w-5 text-black" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Demo */}
          <div className="lg:sticky lg:top-24">
            <div className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-lg transition-all duration-500 ${
              isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
            }`}>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {steps[currentStep].icon}
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {steps[currentStep].title}
                  </h4>
                </div>
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-black transition-all duration-1000 ease-out"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="min-h-[400px]">
                {renderStepContent()}
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <button 
                  onClick={nextStep}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Next Step
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
        </div>
        </div>

      </div>
    </section>
  );
}