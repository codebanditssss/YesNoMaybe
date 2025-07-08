'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, TrendingDown, BarChart3, Zap } from 'lucide-react';

interface HeroSectionProps {
  onOpenAuth?: (tab: 'signin' | 'signup') => void;
}

// Typewriter hook for sophisticated text animation
function useTypewriter(text: string, speed: number = 50) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return displayText;
}

// Interactive Market Preview Component
function MarketPreview() {
  const [selectedMarket, setSelectedMarket] = useState(0);
  const [userPrediction, setUserPrediction] = useState<'yes' | 'no' | null>(null);
  const [profitPreview, setProfitPreview] = useState(0);

  const markets = [
    { question: "BTC hits $100K by Dec 2024?", yesPrice: 67, noPrice: 33, volume: "₹2.3L" },
    { question: "AI solves climate change by 2030?", yesPrice: 23, noPrice: 77, volume: "₹1.8L" },
    { question: "Remote work becomes majority by 2025?", yesPrice: 81, noPrice: 19, volume: "₹4.1L" }
  ];

  const currentMarket = markets[selectedMarket];

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedMarket(prev => (prev + 1) % markets.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePrediction = (choice: 'yes' | 'no') => {
    setUserPrediction(choice);
    const investment = 1000;
    const odds = choice === 'yes' ? currentMarket.yesPrice : currentMarket.noPrice;
    const potential = Math.round((investment / odds) * 100 - investment);
    setProfitPreview(potential);
  };

  return (
    <motion.div 
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-400 uppercase tracking-wide">
          <span>Live Market</span>
          <span>Volume: {currentMarket.volume}</span>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.h3 
            key={selectedMarket}
            className="text-white font-medium text-sm leading-tight"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentMarket.question}
          </motion.h3>
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            className={`p-3 rounded border transition-all ${
              userPrediction === 'yes' 
                ? 'bg-green-500 text-white border-green-500' 
                : 'bg-green-500/20 text-green-400 border-green-500/30 hover:border-green-500/60 hover:bg-green-500/30'
            }`}
            onClick={() => handlePrediction('yes')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-xs text-green-300 mb-1">YES</div>
            <div className="font-bold text-white">{currentMarket.yesPrice}¢</div>
          </motion.button>
          
          <motion.button
            className={`p-3 rounded border transition-all ${
              userPrediction === 'no' 
                ? 'bg-red-500 text-white border-red-500' 
                : 'bg-red-500/20 text-red-400 border-red-500/30 hover:border-red-500/60 hover:bg-red-500/30'
            }`}
            onClick={() => handlePrediction('no')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-xs text-red-300 mb-1">NO</div>
            <div className="font-bold text-white">{currentMarket.noPrice}¢</div>
          </motion.button>
        </div>

        {userPrediction && (
          <motion.div 
            className="bg-white/10 rounded p-3 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-xs text-gray-400 mb-1">Potential Profit</div>
            <div className={`font-bold text-lg ${profitPreview > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {profitPreview > 0 ? '+' : ''}₹{profitPreview}
            </div>
            <div className="text-xs text-gray-500 mt-1">On ₹1,000 investment</div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function HeroSection({ onOpenAuth }: HeroSectionProps) {
  const { user, loading } = useAuth();
  const typewriterText = useTypewriter("Turn Your Predictions Into Profits", 80);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 49%, white 50%, white 51%, transparent 52%),
              linear-gradient(0deg, transparent 49%, white 50%, white 51%, transparent 52%)
            `,
            backgroundSize: '50px 50px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Ink Splash Effect */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full opacity-5"
          animate={{
            scale: [0, 1.2, 0.8, 1],
            opacity: [0, 0.1, 0.05, 0.1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-white rounded-full opacity-5"
          animate={{
            scale: [0.8, 1.3, 0.9, 1.1],
            opacity: [0.05, 0.15, 0.03, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-12">
        {/* Dynamic Badge */}
        <motion.div 
          className="inline-flex items-center px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Zap className="w-4 h-4 mr-2 text-white" />
          <span className="text-sm font-medium text-white">
            {user ? "Welcome back to your trading dashboard" : "India's First Real-Money Prediction Market"}
          </span>
        </motion.div>

        {/* Main Heading with Typewriter Effect */}
        <div className="space-y-6">
          <motion.h1 
            className="text-6xl md:text-8xl font-light tracking-tight text-white leading-[0.9]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="block">YesNoMaybe</span>
          </motion.h1>
          
          <motion.div
            className="h-16 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <h2 className="text-2xl md:text-4xl font-light text-gray-300 min-h-[3rem] flex items-center">
              {typewriterText}
              <motion.span
                className="ml-1 w-1 h-8 bg-white"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </h2>
          </motion.div>
        </div>

        {/* Interactive Market Preview */}
        <MarketPreview />

        {/* Animated Stats */}
        {showStats && (
          <motion.div 
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
          >
            {[
              { value: "₹1.2L+", label: "Weekly Volume" },
              { value: "247", label: "Active Traders" },
              { value: "12", label: "Live Markets" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center space-y-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.5 + index * 0.2, type: "spring" }}
              >
                <div className="text-2xl md:text-3xl font-light text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Call to Actions */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3 }}
        >
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : user ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg font-medium">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Explore Markets
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black px-8 py-6 text-lg font-medium">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Portfolio
                </Button>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg font-medium"
                  onClick={() => onOpenAuth?.('signup')}
                >
                  Start Trading Free
                  <TrendingUp className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg font-medium"
                  onClick={() => onOpenAuth?.('signin')}
                >
                  See Live Markets
                </Button>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          className="pt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
        >
          <p className="text-sm text-gray-400 uppercase tracking-wide">
            Secure • Transparent • Real Money • Instant Payouts
          </p>
        </motion.div>
      </div>
    </section>
  );
} 