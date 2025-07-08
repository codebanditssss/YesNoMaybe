'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, BarChart3, Zap, Crown, Star, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CTASectionProps {
  onOpenAuth?: (tab: 'signin' | 'signup') => void;
}

// Ink explosion component
function InkExplosion({ trigger, position }: { trigger: boolean, position: { x: number, y: number } }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: position.x, top: position.y }}
      initial={{ scale: 0, opacity: 0 }}
      animate={trigger ? { 
        scale: [0, 2, 4], 
        opacity: [0, 0.8, 0] 
      } : { scale: 0, opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <div className="w-32 h-32 bg-black rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2" />
    </motion.div>
  );
}

// Floating testimonial component
function FloatingTestimonial({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-4 max-w-xs shadow-lg"
      initial={{ opacity: 0, y: 20, x: -100 }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        y: [20, 0, 0, -20],
        x: [-100, 0, 0, 100]
      }}
      transition={{ 
        duration: 6, 
        delay,
        repeat: Infinity,
        repeatDelay: 10,
        ease: "easeInOut"
      }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        <div>
          <div className="text-sm font-medium">Khushi Diwan</div>
          <div className="text-xs text-gray-500">+₹12,400 profit</div>
        </div>
      </div>
      <p className="text-xs text-gray-700">
        "Made my first ₹5K in one week. This actually works!"
      </p>
      <div className="flex text-yellow-400 text-xs mt-1">
        {"★".repeat(5)}
      </div>
    </motion.div>
  );
}

// Urgency counter component
function UrgencyCounter() {
  const [count, setCount] = useState(247);
  const [recentJoins, setRecentJoins] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 3 seconds
        setCount(prev => prev + 1);
        
        const names = ["Khushi Diwan", "Punit Dhiman", "Vaanya Goel", "Aashish Kumar"];
        const newJoin = names[Math.floor(Math.random() * names.length)];
        
        setRecentJoins(prev => [newJoin, ...prev.slice(0, 2)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="bg-black/90 backdrop-blur-sm text-white rounded-lg p-4 border border-white/20"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-sm font-mono">LIVE ACTIVITY</span>
      </div>
      
      <motion.div 
        className="text-2xl font-bold mb-1"
        key={count}
        initial={{ scale: 1.2, color: '#10b981' }}
        animate={{ scale: 1, color: '#ffffff' }}
        transition={{ duration: 0.5 }}
      >
        {count} traders online
      </motion.div>
      
      <div className="space-y-1">
        {recentJoins.map((name, index) => (
          <motion.div
            key={`${name}-${index}`}
            className="text-xs text-gray-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1 - (index * 0.3), x: 0 }}
            transition={{ duration: 0.5 }}
          >
            ✓ {name} just joined
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function CTASection({ onOpenAuth }: CTASectionProps) {
  const { user, loading } = useAuth();
  const [inkExplosions, setInkExplosions] = useState<Array<{id: number, position: {x: number, y: number}}>>([]);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, threshold: 0.1 });

  const handleButtonClick = (e: React.MouseEvent, buttonType: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const newExplosion = {
      id: Date.now(),
      position: { x, y }
    };
    
    setInkExplosions(prev => [...prev, newExplosion]);
    
    // Remove explosion after animation
    setTimeout(() => {
      setInkExplosions(prev => prev.filter(exp => exp.id !== newExplosion.id));
    }, 1500);

    // Call original function
    if (buttonType === 'signup') onOpenAuth?.('signup');
    if (buttonType === 'signin') onOpenAuth?.('signin');
  };

  return (
    <section ref={sectionRef} className="py-24 px-4 bg-black relative overflow-hidden">
      {/* Dramatic background effects */}
      <div className="absolute inset-0">
        {/* Animated ink stains */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.1, 0.2, 0.05, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [0.8, 1.3, 1, 0.9],
            opacity: [0.05, 0.15, 0.1, 0.05]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Dynamic line patterns */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(45deg, transparent 48%, white 50%, white 52%, transparent 54%),
              linear-gradient(-45deg, transparent 48%, white 50%, white 52%, transparent 54%)
            `,
            backgroundSize: '60px 60px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '60px 60px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Floating testimonials */}
      <FloatingTestimonial delay={2} />
      <FloatingTestimonial delay={8} />

      {/* Ink explosions */}
      {inkExplosions.map(explosion => (
        <InkExplosion
          key={explosion.id}
          trigger={true}
          position={explosion.position}
        />
      ))}

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Main headline */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-5xl md:text-7xl font-light text-white mb-6 leading-tight"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {user ? (
              <>
                Welcome Back,{' '}
                <motion.span 
                  className="text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                >
                  Trader
                </motion.span>
              </>
            ) : (
              <>
                Ready to{' '}
                <motion.span 
                  className="text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                >
                  Profit?
                </motion.span>
              </>
            )}
          </motion.h2>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
          {user 
              ? "Continue building your portfolio with new markets, advanced analytics, and real-time insights. Your next big win is waiting."
              : "Join India's fastest-growing prediction market. Start with ₹100, learn the system, and scale to serious profits."
            }
          </motion.p>
        </motion.div>

        {/* Social proof section */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center">
            <motion.div 
              className="text-3xl md:text-4xl font-light text-white mb-2"
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ₹1.2L+
            </motion.div>
            <div className="text-gray-400 text-sm uppercase tracking-wide">Weekly Volume</div>
          </div>
          
          <div className="text-center">
            <motion.div 
              className="text-3xl md:text-4xl font-light text-white mb-2"
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.7
              }}
            >
              89%
            </motion.div>
            <div className="text-gray-400 text-sm uppercase tracking-wide">Accuracy Rate</div>
          </div>
          
          <div className="text-center">
            <motion.div 
              className="text-3xl md:text-4xl font-light text-white mb-2"
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.4
              }}
            >
              247
            </motion.div>
            <div className="text-gray-400 text-sm uppercase tracking-wide">Active Traders</div>
          </div>
        </motion.div>
        
        {/* Call to action buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 1.2 }}
        >
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : user ? (
            <>
              <motion.div
                onHoverStart={() => setHoveredButton('explore')}
                onHoverEnd={() => setHoveredButton(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-gray-100 px-12 py-8 text-xl font-medium relative overflow-hidden group"
                  onClick={(e) => handleButtonClick(e, 'explore')}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={hoveredButton === 'explore' ? { x: '100%' } : { x: '-100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <TrendingUp className="mr-3 h-6 w-6" />
                Explore Markets
                  <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              </motion.div>
              
              <motion.div
                onHoverStart={() => setHoveredButton('portfolio')}
                onHoverEnd={() => setHoveredButton(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-black px-12 py-8 text-xl font-medium relative overflow-hidden group"
                  onClick={(e) => handleButtonClick(e, 'portfolio')}
                >
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ scale: 0 }}
                    animate={hoveredButton === 'portfolio' ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ originX: 0.5, originY: 0.5 }}
                  />
                  <BarChart3 className="mr-3 h-6 w-6 relative z-10" />
                  <span className="relative z-10">View Portfolio</span>
              </Button>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                onHoverStart={() => setHoveredButton('signup')}
                onHoverEnd={() => setHoveredButton(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-gray-100 px-12 py-8 text-xl font-medium relative overflow-hidden group"
                  onClick={(e) => handleButtonClick(e, 'signup')}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={hoveredButton === 'signup' ? { x: '100%' } : { x: '-100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <Crown className="mr-3 h-6 w-6" />
                  <span className="relative z-10">Start Trading Free</span>
                  <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              </motion.div>
              
              <motion.div
                onHoverStart={() => setHoveredButton('signin')}
                onHoverEnd={() => setHoveredButton(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white bg-white text-black hover:bg-gray-100 px-12 py-8 text-xl font-medium relative overflow-hidden"
                  onClick={(e) => handleButtonClick(e, 'signin')}
                >
                  <motion.div
                    className="absolute inset-0 bg-gray-100"
                    initial={{ scale: 0 }}
                    animate={hoveredButton === 'signin' ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <Users className="mr-3 h-6 w-6 relative z-10" />
                  <span className="relative z-10">See Live Markets</span>
              </Button>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Urgency and trust section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <UrgencyCounter />
          
          <motion.div 
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 1.5 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Security Promise</span>
            </div>
            <div className="text-gray-300 text-sm space-y-2">
              <div>🔒 Bank-level encryption</div>
              <div>⚡ Instant payouts</div>
              <div>🛡️ KYC verified platform</div>
              <div>💰 ₹100 minimum to start</div>
            </div>
          </motion.div>
        </div>

        {/* Final trust line */}
        <motion.div 
          className="mt-12 pt-8 border-t border-white/20"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 2 }}
        >
          <p className="text-gray-400 text-sm uppercase tracking-wide">
            Trusted by traders • Regulated • Transparent • Secure
          </p>
        </motion.div>
      </div>
    </section>
  );
} 