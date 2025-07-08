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
  const isInView = useInView(sectionRef, { once: true });

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
    <section ref={sectionRef} className="py-24 px-4 bg-white relative overflow-hidden">
      {/* Dramatic background effects */}
      <div className="absolute inset-0">
        {/* Animated ink stains */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-black/5 rounded-full blur-3xl"
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
          className="absolute bottom-20 right-10 w-48 h-48 bg-black/5 rounded-full blur-3xl"
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
              linear-gradient(45deg, transparent 48%, black 50%, black 52%, transparent 54%),
              linear-gradient(-45deg, transparent 48%, black 50%, black 52%, transparent 54%)
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

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-light text-black mb-4"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Start Trading Today
          </motion.h2>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Join thousands of traders making smarter predictions
          </motion.p>
        </motion.div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          {!user && !loading && (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setHoveredButton('signup')}
                onHoverEnd={() => setHoveredButton(null)}
              >
                <Button 
                  size="lg" 
                  className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg font-medium"
                  onClick={(e) => handleButtonClick(e, 'signup')}
                >
                  Start Trading Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setHoveredButton('signin')}
                onHoverEnd={() => setHoveredButton(null)}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg font-medium border-2 border-black"
                  onClick={(e) => handleButtonClick(e, 'signin')}
                >
                  See Live Markets
                </Button>
              </motion.div>
            </>
          )}
        </div>

        {/* Features grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-black mb-2">Real Money Trading</h3>
            <p className="text-gray-600">Trade with real money and earn real profits from your predictions</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-black mb-2">Advanced Analytics</h3>
            <p className="text-gray-600">Get detailed insights and analytics to make informed decisions</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-black mb-2">Instant Execution</h3>
            <p className="text-gray-600">Execute trades instantly with our high-performance platform</p>
          </div>
        </motion.div>

        {/* Floating elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Ink explosions */}
          {inkExplosions.map(explosion => (
            <InkExplosion 
              key={explosion.id} 
              trigger={true} 
              position={explosion.position} 
            />
          ))}
          
          {/* Floating testimonials */}
          <div className="absolute top-1/4 left-0">
            <FloatingTestimonial delay={0} />
          </div>
          <div className="absolute bottom-1/3 right-0">
            <FloatingTestimonial delay={5} />
          </div>
          
          {/* Live counter */}
          <div className="absolute top-1/3 right-0">
            <UrgencyCounter />
          </div>
        </div>
      </div>
    </section>
  );
} 