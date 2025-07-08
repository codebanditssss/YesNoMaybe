'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Volume2, Clock } from 'lucide-react';

// Ticker tape component
function TickerTape() {
  const tickers = [
    "BTC ₹28,45,000 +2.4%",
    "AI-CLIMATE ₹67 -1.2%", 
    "REMOTE-2025 ₹81 +5.7%",
    "FED-RATE ₹23 -0.8%",
    "ELECTION-2024 ₹52 +1.1%",
    "CRYPTO-ETF ₹88 +3.2%"
  ];

  return (
    <div className="relative h-8 bg-black text-white overflow-hidden font-mono text-sm">
      <motion.div
        className="absolute whitespace-nowrap flex items-center h-full"
        animate={{ x: [0, -2000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...tickers, ...tickers, ...tickers].map((ticker, index) => (
          <span key={index} className="mx-8 text-green-400">
            {ticker}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// Market card with newspaper aesthetic
function NewspaperMarketCard({ market, index }: { market: any, index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(market.yesPrice);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  // Simulate price fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 4; // ±2%
      const newPrice = Math.max(1, Math.min(99, currentPrice + change));
      setPriceDirection(newPrice > currentPrice ? 'up' : newPrice < currentPrice ? 'down' : 'neutral');
      setCurrentPrice(Math.round(newPrice));
    }, 3000 + index * 1000); // Stagger updates

    return () => clearInterval(interval);
  }, [currentPrice, index]);

  return (
    <motion.div
      ref={ref}
      className="relative"
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 30, rotateX: -10 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Newspaper shadow */}
      <motion.div
        className="absolute inset-0 bg-black rounded"
        animate={{
          x: isHovered ? 4 : 2,
          y: isHovered ? 4 : 2,
          opacity: isHovered ? 0.3 : 0.15
        }}
        transition={{ duration: 0.3 }}
      />

      <Card className="relative bg-white border border-gray-300 overflow-hidden transform-gpu">
        {/* Newspaper headline bar */}
        <div className="bg-black text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono tracking-wide">LIVE MARKET</span>
          </div>
          <motion.div 
            className="text-xs font-mono"
            key={currentPrice}
            initial={{ scale: 1.2, color: priceDirection === 'up' ? '#10b981' : priceDirection === 'down' ? '#ef4444' : '#ffffff' }}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ duration: 0.5 }}
          >
            {market.volume}
          </motion.div>
        </div>

        {/* Paper texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 1px,
                rgba(0,0,0,0.1) 1px,
                rgba(0,0,0,0.1) 2px
              )
            `,
            backgroundSize: '100% 24px'
          }}
        />

        <motion.div 
          className="p-6 space-y-4"
          animate={{
            scale: isHovered ? 1.02 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Category badge with vintage styling */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className="bg-gray-100 text-black text-xs font-mono border border-gray-300"
            >
              {market.category.toUpperCase()}
            </Badge>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>2m ago</span>
            </div>
          </div>

          {/* Headline with newspaper styling */}
          <motion.h3 
            className="font-bold text-lg text-black leading-tight border-l-4 border-black pl-3"
            style={{ fontFamily: 'Georgia, serif' }}
            animate={{
              borderLeftColor: isHovered ? '#666' : '#000'
            }}
            transition={{ duration: 0.3 }}
          >
            {market.title}
          </motion.h3>

          {/* Price display with terminal styling */}
          <div className="bg-gray-900 rounded p-4 font-mono">
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="text-center"
                animate={{
                  scale: priceDirection === 'up' ? 1.05 : 1
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-green-400 text-xs mb-1 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  YES
                </div>
                <motion.div 
                  className="text-white text-lg font-bold"
                  key={`yes-${currentPrice}`}
                  initial={{ 
                    scale: 1.1, 
                    color: priceDirection === 'up' ? '#10b981' : '#ffffff' 
                  }}
                  animate={{ 
                    scale: 1, 
                    color: '#ffffff' 
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {currentPrice}¢
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                animate={{
                  scale: priceDirection === 'down' ? 1.05 : 1
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-red-400 text-xs mb-1 flex items-center justify-center">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  NO
                </div>
                <motion.div 
                  className="text-white text-lg font-bold"
                  key={`no-${100 - currentPrice}`}
                  initial={{ 
                    scale: 1.1, 
                    color: priceDirection === 'down' ? '#ef4444' : '#ffffff' 
                  }}
                  animate={{ 
                    scale: 1, 
                    color: '#ffffff' 
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {100 - currentPrice}¢
                </motion.div>
              </motion.div>
            </div>

            {/* Volume indicator */}
            <motion.div 
              className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-center text-gray-400 text-xs"
              animate={{
                opacity: isHovered ? 1 : 0.7
              }}
            >
              <Volume2 className="w-3 h-3 mr-1" />
              <span>24h Volume: {market.volume}</span>
            </motion.div>
          </div>

          {/* Trading action */}
          <motion.div
            className="flex items-center justify-between pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
            transition={{ delay: index * 0.2 + 0.5 }}
          >
            <span className="text-sm text-gray-600">Quick Trade:</span>
            <div className="flex space-x-2">
              <motion.button
                className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-300 hover:bg-green-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                BUY YES
              </motion.button>
              <motion.button
                className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded border border-red-300 hover:bg-red-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                BUY NO
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Corner fold effect */}
        <motion.div
          className="absolute top-0 right-0 w-0 h-0"
          style={{
            borderLeft: isHovered ? '16px solid #f3f4f6' : '0px solid transparent',
            borderBottom: isHovered ? '16px solid transparent' : '0px solid transparent',
          }}
          transition={{ duration: 0.3 }}
        />
      </Card>
    </motion.div>
  );
}

export function MarketsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, threshold: 0.1 });

  const markets = [
    {
      title: "Will Bitcoin hit $100K by Dec 2024?",
      category: "Crypto",
      volume: "₹2.3L",
      yesPrice: 67,
      noPrice: 33
    },
    {
      title: "AI solves climate change by 2030?",
      category: "Technology", 
      volume: "₹1.8L",
      yesPrice: 23,
      noPrice: 77
    },
    {
      title: "Remote work majority by 2025?",
      category: "Business",
      volume: "₹4.1L",
      yesPrice: 81,
      noPrice: 19
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 px-6 bg-black relative overflow-hidden">
      {/* Newspaper texture background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,0.1) 10px,
              rgba(255,255,255,0.1) 11px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,0.1) 10px,
              rgba(255,255,255,0.1) 11px
            )
          `
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Ticker tape */}
        <TickerTape />
        
        {/* Section header */}
        <motion.div 
          className="text-center my-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-light text-white mb-6"
            style={{ fontFamily: 'Georgia, serif' }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Market{' '}
            <motion.span 
              className="text-gray-400"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Headlines
            </motion.span>
          </motion.h2>
          <motion.p 
            className="text-gray-400 text-lg font-mono"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            LIVE MARKETS • REAL MONEY • INSTANT EXECUTION
          </motion.p>
        </motion.div>
        
        {/* Markets grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {markets.map((market, index) => (
            <NewspaperMarketCard key={index} market={market} index={index} />
          ))}
        </div>

        {/* Bottom trading floor aesthetic */}
        <motion.div 
          className="mt-16 p-6 bg-gray-900 rounded border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 1 }}
        >
          <div className="text-center text-gray-400 font-mono text-sm">
            <div className="flex items-center justify-center space-x-8">
              <span>📈 TOTAL VOLUME: ₹12.4L TODAY</span>
              <span>👥 ACTIVE TRADERS: 247</span>
              <span>⚡ AVG EXECUTION: 0.3s</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 