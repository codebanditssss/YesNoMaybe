// import { motion } from 'framer-motion';
// import { UserPlus, TrendingUp, BarChart3 } from 'lucide-react';

// export function HowItWorksSection() {
//   const steps = [
//     {
//       icon: <UserPlus className="h-8 w-8 text-white" />, bg: 'from-blue-500 to-blue-700', title: 'Create Account', description: 'Sign up and verify your identity for secure access.'
//     },
//     {
//       icon: <TrendingUp className="h-8 w-8 text-white" />, bg: 'from-green-500 to-green-700', title: 'Fund & Explore', description: 'Add funds and discover trending markets.'
//     },
//     {
//       icon: <BarChart3 className="h-8 w-8 text-white" />, bg: 'from-yellow-500 to-yellow-700', title: 'Trade & Win', description: 'Place predictions and track your performance.'
//     },
//   ];

//   return (
//     <section className="py-24 px-6 relative">
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="w-1/2 h-1/2 bg-gradient-to-br from-primary-100/40 to-transparent rounded-full blur-3xl absolute top-0 left-0" />
//       </div>
//       <div className="max-w-3xl mx-auto relative z-10">
//         <div className="text-center mb-16">
//           <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
//             How It Works
//           </h2>
//           <p className="text-lg text-gray-500 max-w-2xl mx-auto">
//             Just three simple steps to start trading predictions.
//           </p>
//         </div>
//         <div className="flex flex-col gap-12 relative">
//           {steps.map((step, idx) => (
//             <motion.div
//               key={idx}
//               initial={{ opacity: 0, x: 40 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.6, delay: 0.2 + idx * 0.15 }}
//               className="flex items-center gap-6"
//             >
//               <div className="flex flex-col items-center">
//                 <div className={`rounded-full p-4 bg-gradient-to-br ${step.bg} shadow-lg flex items-center justify-center mb-2`}>
//                   {step.icon}
//                 </div>
//                 {idx < steps.length - 1 && (
//                   <div className="w-1 h-16 bg-gray-300 rounded-full" />
//                 )}
//               </div>
//               <div className="bg-white rounded-2xl shadow-md p-6 flex-1">
//                 <h3 className="text-xl font-bold text-gray-900 mb-1">{step.title}</h3>
//                 <p className="text-gray-600 text-base">{step.description}</p>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// } 

"use client"

import {
    motion,
    MotionValue,
    useScroll,
    useSpring,
    useTransform,
} from "motion/react"
import { useRef } from "react"

function useParallax(value: MotionValue<number>, distance: number) {
    return useTransform(value, [0, 1], [-distance, distance])
}

const titles = ["Create Account", "Login", "Explore", "Trade", "Earn"];

function Image({ title, imageSrc }: { title: string; imageSrc: string }) {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({ target: ref })
    const y = useParallax(scrollYProgress, 300)

    return (
        <section className="img-container">
            <div ref={ref}>
                <img
                    src={imageSrc}
                    alt={title}
                />
            </div>
            <motion.h2
                // Hide until scroll progress is measured
                initial={{ visibility: "hidden" }}
                animate={{ visibility: "visible" }}
                style={{ y }}
            >{title}</motion.h2>
        </section>
    )
}

export function HowItWorksSection() {
    const imageSrc = "/Screenshotdb.png"
    const { scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    })

    return (
        <div className="p-24">
         <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Enterprise-grade prediction markets
          </h2>
        </div>
        <div id="how-it-works-scrollable">
            {[1, 2, 3, 4, 5].map((_, idx) => (
                <Image key={idx} imageSrc={imageSrc} title={titles[idx] || `Step ${idx + 1}`} />
            ))}
            <motion.div className="progress" style={{ scaleX }} />
            <StyleSheet />
        </div>
        </div>
    )
}

/**
 * ==============   Styles   ================
 */

function StyleSheet() {
    return (
        <style>{`
        #how-it-works-scrollable {
            scroll-snap-type: y mandatory;
        }
        .img-container {
            height: 70vh;
            scroll-snap-align: start;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
        }
        .img-container > div {
            border: 1px solid #e5e7eb;
            border-radius: 1rem;
            width: 700px;
            height: 400px;
            margin: 20px;
            background: #f5f5f5;
            overflow: hidden;
        }
        .img-container img {
            width: 800px;
            height: 400px;
        }
        @media (max-width: 500px) {
            .img-container > div {
                width: 150px;
                height: 200px;
            }
            .img-container img {
                width: 150px;
                height: 200px;
            }
        }
        .img-container h2 {
            color: black;
            margin: 0;
            font-family: "Azeret Mono", monospace;
            font-size: 50px;
            font-weight: 300; 
            letter-spacing: -3px;
            line-height: 1.2;
            position: absolute;
            display: inline-block;
            top: calc(50% - 25px);
            left: calc(50% + 320px);
        }
    `}</style>
    )
}