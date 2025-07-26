'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface OrderLevel {
  price: number;
  quantity: number;
  side: 'yes' | 'no';
}

export function MiniOrderbook() {
  const [orders, setOrders] = useState<OrderLevel[]>([
    { price: 67, quantity: 150, side: 'yes' },
    { price: 65, quantity: 200, side: 'yes' },
    { price: 63, quantity: 180, side: 'yes' },
    { price: 38, quantity: 120, side: 'no' },
    { price: 36, quantity: 160, side: 'no' },
    { price: 34, quantity: 140, side: 'no' },
  ]);

  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => 
        prevOrders.map(order => ({
          ...order,
          price: order.price + (Math.random() - 0.5) * 2,
          quantity: Math.max(50, order.quantity + Math.floor((Math.random() - 0.5) * 50))
        }))
      );

      // Highlight random order
      setHighlightedIndex(Math.floor(Math.random() * 6));
      setTimeout(() => setHighlightedIndex(null), 800);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const yesOrders = orders.filter(o => o.side === 'yes').sort((a, b) => b.price - a.price);
  const noOrders = orders.filter(o => o.side === 'no').sort((a, b) => b.price - a.price);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 shadow-lg p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Live Market</h3>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Real-time</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* YES Orders */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">YES</span>
          </div>
          <div className="space-y-1">
            {yesOrders.slice(0, 3).map((order, index) => (
              <div 
                key={index}
                className={`flex justify-between text-xs py-1 px-2 rounded transition-all duration-300 ${
                  highlightedIndex === index ? 'bg-blue-100 scale-105' : 'hover:bg-blue-50'
                }`}
              >
                <span className="font-medium text-blue-700">₹{order.price.toFixed(0)}</span>
                <span className="text-gray-600">{order.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NO Orders */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-3 w-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">NO</span>
          </div>
          <div className="space-y-1">
            {noOrders.slice(0, 3).map((order, index) => (
              <div 
                key={index}
                className={`flex justify-between text-xs py-1 px-2 rounded transition-all duration-300 ${
                  highlightedIndex === (index + 3) ? 'bg-gray-100 scale-105' : 'hover:bg-gray-50'
                }`}
              >
                <span className="font-medium text-gray-700">₹{order.price.toFixed(0)}</span>
                <span className="text-gray-600">{order.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-center">
          <span className="text-xs text-gray-500">IPL 2024: Mumbai Indians to win?</span>
        </div>
      </div>
    </div>
  );
} 