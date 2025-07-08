'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Custom hook for counting animation
function useCountUp(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      const currentCount = Math.floor(start + (end - start) * easeOutQuart);
      
      setCount(currentCount);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isActive, end, duration, start]);

  return { count, setIsActive };
}

// Individual stat component with animations
function AnimatedStat({ value, label, delay = 0 }: { value: string, label: string, delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });
  
  // Extract numeric value for animation
  const numericValue = parseInt(value.replace(/[^\d]/g, '')) || 0;
  const prefix = value.match(/^[^\d]*/)?.[0] || '';
  const suffix = value.match(/[^\d]*$/)?.[0] || '';
  
  const { count, setIsActive } = useCountUp(numericValue, 2000);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setIsActive(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, delay, setIsActive]);

  return (
    <motion.div 
      ref={ref}
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
    >
      {/* Ink stamp effect background */}
      <motion.div
        className="absolute inset-0 bg-black/5 rounded-lg backdrop-blur-sm"
        initial={{ scale: 0, rotate: -5 }}
        animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -5 }}
        transition={{ duration: 0.4, delay: delay / 1000 + 0.2, type: "spring" }}
      />
      
      {/* Geometric accent */}
      <motion.div
        className="absolute -top-2 -right-2 w-4 h-4 bg-black transform rotate-45"
        initial={{ opacity: 0, scale: 0 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        transition={{ duration: 0.3, delay: delay / 1000 + 0.5 }}
      />
      
      <div className="relative p-6 text-center space-y-3">
        {/* Animated number */}
        <motion.div 
          className="text-4xl md:text-5xl font-light text-black font-mono"
          style={{ fontFeatureSettings: '"tnum"' }} // Tabular numbers for consistent width
        >
          <span className="text-gray-600">{prefix}</span>
          <motion.span
            key={count}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {count.toLocaleString()}
          </motion.span>
          <span className="text-gray-600">{suffix}</span>
        </motion.div>
        
        {/* Label with typewriter effect */}
        <motion.div 
          className="text-sm font-medium text-gray-600 uppercase tracking-wider"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: delay / 1000 + 0.8 }}
        >
          {label}
        </motion.div>
        
        {/* Underline effect */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-black to-transparent"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.6, delay: delay / 1000 + 1 }}
        />
      </div>
      
      {/* Hover effect */}
      <motion.div
        className="absolute inset-0 border border-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        whileHover={{ scale: 1.02 }}
      />
    </motion.div>
  );
}

export function StatsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true });
  
  const stats = [
    {
      value: "₹1.2L+",
      label: "Weekly Volume"
    },
    {
      value: "247", 
      label: "Active Traders"
    },
    {
      value: "89%",
      label: "Win Rate"
    },
    {
      value: "12",
      label: "Live Markets"
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 px-6 bg-white relative overflow-hidden">
      {/* Background geometric patterns */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 border border-black rotate-45"
          animate={isInView ? { rotate: [45, 405] } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-24 h-24 border border-black"
          animate={isInView ? { rotate: [0, 360] } : {}}
          transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 5 }}
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
            Real Numbers,{' '}
            <motion.span 
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Real Growth
            </motion.span>
          </motion.h2>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Live metrics from our growing community
          </motion.p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <AnimatedStat
              key={stat.label}
              value={stat.value}
              label={stat.label}
              delay={index * 200}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 