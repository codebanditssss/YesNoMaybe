'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

// Shadow puppet components
const ShadowPuppet = ({ 
  children, 
  isActive, 
  delay = 0,
  position = { x: 0, y: 0 }
}: { 
  children: React.ReactNode, 
  isActive: boolean, 
  delay?: number,
  position?: { x: number, y: number }
}) => (
  <motion.div
    className="absolute text-black"
    initial={{ opacity: 0, scale: 0.8, x: position.x - 50, y: position.y }}
    animate={isActive ? { 
      opacity: 1, 
      scale: 1, 
      x: position.x, 
      y: position.y,
      transition: { delay, duration: 0.8, type: "spring" }
    } : { 
      opacity: 0, 
      scale: 0.8, 
      x: position.x - 50, 
      y: position.y 
    }}
    transition={{ duration: 0.6 }}
  >
    {children}
  </motion.div>
);

// Interactive puppet show component
function PuppetTheater() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.3 });

  const steps = [
    {
      title: "Create Account",
      description: "Sign up securely and verify your identity",
      duration: 3000
    },
    {
      title: "Add Funds",
      description: "Deposit money using secure payment methods",
      duration: 3000
    },
    {
      title: "Make Predictions",
      description: "Browse markets and place your trades",
      duration: 3000
    },
    {
      title: "Earn Profits",
      description: "Watch your predictions turn into real money",
      duration: 3000
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isInView || !autoPlay) return;

    const timer = setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, steps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, isInView, autoPlay, steps]);

  // Manual controls
  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    setAutoPlay(!autoPlay);
  };

  const handleNext = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
    setAutoPlay(false);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAutoPlay(true);
  };

  return (
    <div ref={ref} className="relative">
      {/* Theater stage */}
      <div className="relative h-96 bg-gradient-to-b from-gray-100 to-gray-300 rounded-lg overflow-hidden border-4 border-black">
        {/* Spotlight effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20"
          animate={{
            background: isInView 
              ? `radial-gradient(circle at ${50 + currentStep * 20}% 60%, transparent 20%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.3) 70%)`
              : 'radial-gradient(circle at 50% 60%, transparent 20%, rgba(0,0,0,0.3) 70%)'
          }}
          transition={{ duration: 1 }}
        />

        {/* Stage floor */}
        <div className="absolute bottom-0 w-full h-4 bg-black"></div>

        {/* Puppet scenes */}
        <AnimatePresence mode="wait">
          {/* Step 1: Account Creation */}
          {currentStep === 0 && (
            <motion.div
              key="step1"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ShadowPuppet isActive={isInView} delay={0.5} position={{ x: 100, y: 120 }}>
                <svg width="60" height="80" viewBox="0 0 60 80" fill="currentColor">
                  {/* Person silhouette */}
                  <circle cx="30" cy="20" r="12" />
                  <rect x="18" y="32" width="24" height="40" rx="4" />
                  <rect x="10" y="40" width="12" height="20" rx="2" />
                  <rect x="38" y="40" width="12" height="20" rx="2" />
                </svg>
              </ShadowPuppet>
              
              <ShadowPuppet isActive={isInView} delay={1} position={{ x: 200, y: 100 }}>
                <svg width="80" height="60" viewBox="0 0 80 60" fill="currentColor">
                  {/* Computer/form */}
                  <rect x="10" y="15" width="60" height="35" rx="4" />
                  <rect x="15" y="20" width="20" height="2" />
                  <rect x="15" y="25" width="25" height="2" />
                  <rect x="15" y="30" width="15" height="2" />
                  <rect x="0" y="50" width="80" height="8" rx="2" />
                </svg>
              </ShadowPuppet>

              <motion.div
                className="absolute top-32 right-20 text-black text-xs font-mono"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 }}
              >
                ✓ Account Created
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Adding Funds */}
          {currentStep === 1 && (
            <motion.div
              key="step2"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ShadowPuppet isActive={isInView} delay={0.3} position={{ x: 80, y: 120 }}>
                <svg width="60" height="80" viewBox="0 0 60 80" fill="currentColor">
                  <circle cx="30" cy="20" r="12" />
                  <rect x="18" y="32" width="24" height="40" rx="4" />
                  <rect x="8" y="38" width="16" height="25" rx="2" />
                  <rect x="36" y="38" width="16" height="25" rx="2" />
                </svg>
              </ShadowPuppet>

              <ShadowPuppet isActive={isInView} delay={0.8} position={{ x: 180, y: 140 }}>
                <svg width="40" height="25" viewBox="0 0 40 25" fill="currentColor">
                  {/* Credit card */}
                  <rect x="0" y="0" width="40" height="25" rx="3" />
                  <rect x="2" y="4" width="36" height="4" />
                  <rect x="2" y="12" width="15" height="2" />
                  <rect x="2" y="16" width="10" height="2" />
                </svg>
              </ShadowPuppet>

              <motion.div
                className="absolute top-20 left-1/2 transform -translate-x-1/2"
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg width="30" height="30" viewBox="0 0 30 30" fill="black">
                  <text x="15" y="20" textAnchor="middle" fontSize="20">₹</text>
                </svg>
              </motion.div>

              <motion.div
                className="absolute top-32 right-20 text-white text-xs font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                ₹10,000 Added
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: Making Predictions */}
          {currentStep === 2 && (
            <motion.div
              key="step3"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ShadowPuppet isActive={isInView} delay={0.3} position={{ x: 60, y: 120 }}>
                <svg width="60" height="80" viewBox="0 0 60 80" fill="currentColor">
                  <circle cx="30" cy="20" r="12" />
                  <rect x="18" y="32" width="24" height="40" rx="4" />
                  <rect x="8" y="40" width="12" height="20" rx="2" />
                  <rect x="38" y="40" width="12" height="20" rx="2" />
                </svg>
              </ShadowPuppet>

              <ShadowPuppet isActive={isInView} delay={0.8} position={{ x: 160, y: 80 }}>
                <svg width="100" height="80" viewBox="0 0 100 80" fill="currentColor">
                  {/* Trading interface */}
                  <rect x="0" y="0" width="100" height="60" rx="4" />
                  <rect x="10" y="10" width="35" height="20" rx="2" />
                  <rect x="55" y="10" width="35" height="20" rx="2" />
                  <rect x="10" y="35" width="80" height="3" />
                  <rect x="10" y="42" width="60" height="3" />
                  <rect x="10" y="49" width="40" height="3" />
                </svg>
              </ShadowPuppet>

              <motion.div
                className="absolute top-24 left-1/2 transform -translate-x-1/2 flex space-x-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <motion.div
                  className="px-3 py-1 bg-green-200 text-green-800 text-xs rounded border border-green-400"
                  whileHover={{ scale: 1.05 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  YES
                </motion.div>
                <motion.div
                  className="px-3 py-1 bg-red-200 text-red-800 text-xs rounded border border-red-400"
                  whileHover={{ scale: 1.05 }}
                >
                  NO
                </motion.div>
              </motion.div>

              <motion.div
                className="absolute top-32 right-20 text-white text-xs font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
              >
                Trade Placed: ₹2,000
              </motion.div>
            </motion.div>
          )}

          {/* Step 4: Earning Profits */}
          {currentStep === 3 && (
            <motion.div
              key="step4"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ShadowPuppet isActive={isInView} delay={0.3} position={{ x: 80, y: 100 }}>
                <motion.svg 
                  width="60" 
                  height="80" 
                  viewBox="0 0 60 80" 
                  fill="currentColor"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <circle cx="30" cy="20" r="12" />
                  <rect x="18" y="32" width="24" height="40" rx="4" />
                  <rect x="10" y="40" width="12" height="20" rx="2" />
                  <rect x="38" y="40" width="12" height="20" rx="2" />
                </motion.svg>
              </ShadowPuppet>

              {/* Floating money symbols */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-white text-lg font-bold"
                  initial={{ 
                    x: 150 + (i * 30), 
                    y: 200, 
                    opacity: 0, 
                    scale: 0 
                  }}
                  animate={{ 
                    x: 150 + (i * 30) + Math.sin(i) * 20, 
                    y: 50, 
                    opacity: [0, 1, 0], 
                    scale: [0, 1.2, 0] 
                  }}
                  transition={{ 
                    duration: 2, 
                    delay: i * 0.3, 
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                >
                  ₹
                </motion.div>
              ))}

              <motion.div
                className="absolute top-32 right-20 text-white text-xs font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    color: ['#fff', '#16a34a', '#fff']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity
                  }}
                >
                  Profit: +₹3,400 🎉
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage curtains */}
        <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-red-800 to-red-600"></div>
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-red-800 to-red-600"></div>
      </div>

      {/* Theater controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={handlePlay}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-sm">{autoPlay ? 'Pause' : 'Play'}</span>
          </motion.button>
          
          <motion.button
            onClick={handleNext}
            className="p-2 border border-white/30 rounded hover:bg-white/10 transition-colors text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SkipForward className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={handleRestart}
            className="p-2 border border-white/30 rounded hover:bg-white/10 transition-colors text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
        
        {/* Progress indicator */}
        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full border-2 border-white ${
                index === currentStep ? 'bg-white' : 'bg-transparent'
              }`}
              animate={{
                scale: index === currentStep ? 1.2 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Step description */}
      <motion.div 
        className="mt-6 text-center"
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-medium text-white mb-2">
          {steps[currentStep].title}
        </h3>
        <p className="text-gray-300">
          {steps[currentStep].description}
        </p>
      </motion.div>
    </div>
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, threshold: 0.1 });

  return (
    <section ref={sectionRef} className="py-24 px-6 bg-black relative overflow-hidden">
      {/* Theater background pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, white 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px, 20px 20px'
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div 
          className="text-center mb-16"
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
            Shadow Puppet{' '}
            <motion.span 
              className="text-gray-400"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Trading Theater
            </motion.span>
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Watch your trading journey unfold in our interactive puppet show. 
            Four simple acts to transform predictions into profits.
          </motion.p>
        </motion.div>

        {/* Interactive puppet theater */}
        <PuppetTheater />
      </div>
    </section>
  );
} 