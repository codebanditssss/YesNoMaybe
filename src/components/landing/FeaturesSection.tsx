'use client';

import { useState } from 'react';
import { Activity, BarChart3, Target } from 'lucide-react';

export function FeaturesSection() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'realtime',
      icon: <Activity className="h-8 w-8" />,
      title: 'Real-time Trading',
      subtitle: 'Lightning-fast execution',
      description: 'Professional-grade trading engine with live market data'
    },
    {
      id: 'analytics',
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Advanced Analytics',
      subtitle: 'Data-driven insights',
      description: 'Comprehensive market analysis and portfolio tracking'
    },
    {
      id: 'markets',
      icon: <Target className="h-8 w-8" />,
      title: 'Diverse Markets',
      subtitle: 'Multiple categories',
      description: 'Sports, crypto, politics, and technology prediction markets'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container px-4 mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2 className="font-light text-4xl md:text-5xl text-black mb-4">
            Why Choose Our Platform
          </h2>
          <p className="text-lg text-gray-600">
            Professional trading tools designed for serious traders
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="text-center group cursor-pointer"
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full transition-all duration-300 ${
                hoveredFeature === feature.id 
                  ? 'bg-black text-white scale-110' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {feature.icon}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 uppercase tracking-wide">
                  {feature.subtitle}
                </p>
                <p className={`text-gray-600 transition-all duration-300 ${
                  hoveredFeature === feature.id ? 'opacity-100' : 'opacity-70'
                }`}>
                  {feature.description}
                </p>
              </div>

              {/* Hover indicator */}
              <div className={`mt-4 h-0.5 bg-black transition-all duration-300 ${
                hoveredFeature === feature.id ? 'w-12 opacity-100' : 'w-0 opacity-0'
              } mx-auto`} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
} 