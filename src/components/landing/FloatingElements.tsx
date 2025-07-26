'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Zap, Shield, Activity } from 'lucide-react';

interface FloatingElement {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  position: {
    top: string;
    left: string;
  };
  delay: number;
  color: string;
}

const elements: FloatingElement[] = [
  {
    id: 'realtime',
    icon: <Activity className="h-3 w-3" />,
    label: 'Real-time',
    value: 'Live',
    position: { top: '15%', left: '10%' },
    delay: 0,
    color: 'border-gray-200 bg-white/90 text-gray-700'
  },
  {
    id: 'trades',
    icon: <BarChart3 className="h-3 w-3" />,
    label: 'Today',
    value: '247 trades',
    position: { top: '25%', left: '85%' },
    delay: 500,
    color: 'border-gray-200 bg-white/90 text-gray-700'
  },
  {
    id: 'performance',
    icon: <TrendingUp className="h-3 w-3" />,
    label: 'Avg Return',
    value: '+12.4%',
    position: { top: '70%', left: '15%' },
    delay: 1000,
    color: 'border-gray-200 bg-white/90 text-gray-700'
  },
  {
    id: 'users',
    icon: <Users className="h-3 w-3" />,
    label: 'Active Now',
    value: '1,247',
    position: { top: '60%', left: '90%' },
    delay: 1500,
    color: 'border-gray-200 bg-white/90 text-gray-700'
  },
  {
    id: 'speed',
    icon: <Zap className="h-3 w-3" />,
    label: 'Execution',
    value: '<100ms',
    position: { top: '45%', left: '5%' },
    delay: 2000,
    color: 'border-gray-200 bg-white/90 text-gray-700'
  },
  {
    id: 'security',
    icon: <Shield className="h-3 w-3" />,
    label: 'Security',
    value: 'Bank-grade',
    position: { top: '80%', left: '80%' },
    delay: 2500,
    color: 'border-gray-200 bg-white/90 text-gray-700'
  }
];

export function FloatingElements() {
  const [visibleElements, setVisibleElements] = useState<string[]>([]);
  const [animatingElements, setAnimatingElements] = useState<string[]>([]);

  useEffect(() => {
    // Stagger the appearance of elements
    elements.forEach((element) => {
      setTimeout(() => {
        setVisibleElements(prev => [...prev, element.id]);
      }, element.delay);
    });

    // Add periodic animation to random elements
    const animationInterval = setInterval(() => {
      const randomElement = elements[Math.floor(Math.random() * elements.length)];
      setAnimatingElements(prev => [...prev, randomElement.id]);
      
      setTimeout(() => {
        setAnimatingElements(prev => prev.filter(id => id !== randomElement.id));
      }, 1000);
    }, 3000);

    return () => clearInterval(animationInterval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {elements.map((element) => (
        <div
          key={element.id}
          className={`
            absolute transition-all duration-700
            ${visibleElements.includes(element.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            ${animatingElements.includes(element.id) ? 'scale-110 shadow-lg' : 'scale-100'}
            ${visibleElements.includes(element.id) ? `float-animation delay-${Math.floor(element.delay / 100)}` : ''}
          `}
          style={{
            top: element.position.top,
            left: element.position.left
          }}
        >
          <div className={`
            flex items-center gap-2 px-3 py-2 rounded-full border backdrop-blur-sm
            ${element.color}
            shadow-sm hover:shadow-md transition-all duration-300
          `}>
            {element.icon}
            <div className="text-xs">
              <div className="font-medium">{element.value}</div>
              <div className="text-xs opacity-75">{element.label}</div>
            </div>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        .delay-0 { animation-delay: 0ms; }
        .delay-5 { animation-delay: 500ms; }
        .delay-10 { animation-delay: 1000ms; }
        .delay-15 { animation-delay: 1500ms; }
        .delay-20 { animation-delay: 2000ms; }
        .delay-25 { animation-delay: 2500ms; }
      `}</style>
    </div>
  );
} 