'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { BarChart3, Zap, Shield, TrendingUp, Eye, Clock } from 'lucide-react';

// Custom trading icons as SVG components
const TradingChartIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 12l3-3 3 3 3-3 3 3 3-3 3 3" />
    <path d="M21 18H3" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="18" cy="9" r="1" fill="currentColor" />
    <circle cx="6" cy="15" r="1" fill="currentColor" />
  </svg>
);

const LightningBoltIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

// Paper fold animation component
function OrigamiCard({ feature, index }: { feature: any, index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  const IconComponent = feature.iconComponent;

  return (
    <motion.div
      ref={ref}
      className="relative perspective-1000"
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: -15 }}
      transition={{ duration: 0.8, delay: index * 0.2, type: "spring" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTap={() => setIsClicked(!isClicked)}
    >
      {/* Shadow base */}
      <motion.div
        className="absolute inset-0 bg-black rounded-lg"
        initial={{ y: 0, opacity: 0.3 }}
        animate={{
          y: isHovered ? 8 : 4,
          opacity: isHovered ? 0.6 : 0.3,
          scale: isHovered ? 1.02 : 1
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Main card with fold effect */}
      <Card className="relative bg-white border-none overflow-hidden transform-gpu">
        {/* Fold line effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-gray-100 to-transparent opacity-0"
          animate={{
            opacity: isHovered ? 0.3 : 0,
            scaleX: isHovered ? 1 : 0.8,
          }}
          transition={{ duration: 0.4 }}
          style={{
            background: isHovered 
              ? 'linear-gradient(45deg, transparent 0%, rgba(0,0,0,0.05) 20%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 80%, transparent 100%)'
              : 'transparent'
          }}
        />

        {/* Paper corner fold */}
        <motion.div
          className="absolute top-0 right-0 w-0 h-0"
          style={{
            borderLeft: isHovered ? '20px solid #f3f4f6' : '0px solid transparent',
            borderBottom: isHovered ? '20px solid transparent' : '0px solid transparent',
          }}
          transition={{ duration: 0.3 }}
        />

        <motion.div 
          className="p-8 space-y-6 relative z-10"
          animate={{
            scale: isClicked ? 0.98 : 1,
            rotateY: isHovered ? 2 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Icon with origami effect */}
          <motion.div
            className="relative"
            animate={{
              rotateZ: isHovered ? 5 : 0,
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            {/* Icon shadow/depth */}
            <motion.div
              className="absolute inset-0 bg-black rounded-sm opacity-20"
              animate={{
                x: isHovered ? 2 : 0,
                y: isHovered ? 2 : 0,
              }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Main icon */}
            <div className="relative w-16 h-16 bg-black rounded-sm flex items-center justify-center text-white">
              <IconComponent />
            </div>

            {/* Geometric accent lines */}
            <motion.div
              className="absolute -bottom-1 -right-1 w-4 h-1 bg-gray-300"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isInView ? 1 : 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
            />
            <motion.div
              className="absolute -bottom-1 -right-1 w-1 h-4 bg-gray-300"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: isInView ? 1 : 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 + 0.7 }}
            />
          </motion.div>

          {/* Title with paper texture */}
          <motion.h3 
            className="text-2xl font-medium text-black relative"
            animate={{
              x: isHovered ? 2 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {feature.title}
            
            {/* Underline that draws itself */}
            <motion.div
              className="absolute bottom-0 left-0 h-px bg-black"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isInView ? 1 : 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
            />
          </motion.h3>

          {/* Description with typewriter reveal */}
          <motion.p 
            className="text-gray-600 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 + 0.6 }}
          >
            {feature.description}
          </motion.p>

          {/* Interactive elements */}
          <motion.div
            className="flex items-center space-x-4 pt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 10 }}
            transition={{ duration: 0.6, delay: index * 0.2 + 0.8 }}
          >
            {/* Minimalist arrow */}
            <motion.div
              className="w-8 h-px bg-black relative"
              animate={{
                scaleX: isHovered ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute right-0 top-0 w-2 h-px bg-black transform rotate-45 origin-right"
                animate={{
                  scaleX: isHovered ? 1.5 : 1,
                  rotate: isHovered ? 35 : 45,
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute right-0 top-0 w-2 h-px bg-black transform -rotate-45 origin-right"
                animate={{
                  scaleX: isHovered ? 1.5 : 1,
                  rotate: isHovered ? -35 : -45,
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            <motion.span
              className="text-sm text-gray-600 uppercase tracking-wide font-medium"
              animate={{
                opacity: isHovered ? 1 : 0.8,
                x: isHovered ? 4 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              Explore
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Paper grain texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(0,0,0,0.8) 1px, transparent 0),
              radial-gradient(circle at 2px 3px, rgba(0,0,0,0.3) 0.5px, transparent 0)
            `,
            backgroundSize: '4px 4px, 8px 8px'
          }}
        />
      </Card>
    </motion.div>
  );
}

export function FeaturesSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, threshold: 0.1 });

  const features = [
    {
      iconComponent: TradingChartIcon,
      title: "Real-time Analytics",
      description: "Advanced market analytics with institutional-grade insights. Track sentiment, volume, and price movements with precision timing."
    },
    {
      iconComponent: LightningBoltIcon,
      title: "Instant Execution", 
      description: "Lightning-fast order execution with minimal slippage. Your predictions are processed in milliseconds, not minutes."
    },
    {
      iconComponent: ShieldCheckIcon,
      title: "Bank-level Security",
      description: "Military-grade encryption protects your funds. Multi-factor authentication and cold storage keep your investments secure."
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 px-6 bg-white/5 relative overflow-hidden">
      {/* Background paper texture */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 46%, rgba(0,0,0,0.03) 49%, rgba(0,0,0,0.03) 51%, transparent 54%),
            linear-gradient(-45deg, transparent 46%, rgba(0,0,0,0.03) 49%, rgba(0,0,0,0.03) 51%, transparent 54%)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-light text-white mb-6"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Engineered for{' '}
            <motion.span 
              className="text-gray-400"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Precision
            </motion.span>
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Professional prediction markets demand professional tools. Our platform delivers institutional-grade features in an elegant interface.
          </motion.p>
        </motion.div>
        
        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <OrigamiCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
} 