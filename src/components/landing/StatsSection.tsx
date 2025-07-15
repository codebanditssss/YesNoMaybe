// 'use client';

// import { motion } from 'framer-motion';

// export function StatsSection() {
//   const stats = [
//     {
//       value: "₹20Cr+",
//       label: "Total Volume Traded",
//       prefix: ""
//     },
//     {
//       value: "15K+", 
//       label: "Active Traders",
//       prefix: ""
//     },
//     {
//       value: "89",
//       label: "Accuracy Rate",
//       prefix: "",
//       suffix: "%"
//     },
//     {
//       value: "500",
//       label: "Markets Available",
//       prefix: "",
//       suffix: "+"
//     }
//   ];

//   const container = {
//     hidden: { opacity: 0 },
//     show: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1
//       }
//     }
//   };

//   const item = {
//     hidden: { opacity: 0, y: 20 },
//     show: { opacity: 1, y: 0 }
//   };

//   return (
//     <section className="py-24 px-6 bg-black/5">
//       <div className="max-w-6xl mx-auto">
//         <motion.div 
//           initial="hidden"
//           whileInView="show"
//           viewport={{ once: true, margin: "-100px" }}
//           variants={container}
//           className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
//         >
//           {stats.map((stat, index) => (
//             <motion.div 
//               key={index} 
//               variants={item}
//               className="relative p-6 rounded-xl bg-white shadow-sm"
//             >
//               <div className="text-center space-y-2">
//                 <div className="text-3xl md:text-4xl font-light text-black flex items-center justify-center gap-0.5">
//                   <span className="font-normal">{stat.prefix}</span>
//                   <span>{stat.value}</span>
//                   <span className="font-normal">{stat.suffix}</span>
//                 </div>
//                 <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
//                   {stat.label}
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// } 

export function HowItWorksSections() {
  const steps = [
    {
      number: 1,
      title: "Create Account",
      description: "Sign up and verify your identity for secure trading access."
    },
    {
      number: 2,
      title: "Fund Wallet",
      description: "Add funds to your wallet using secure payment methods."
    },
    {
      number: 3,
      title: "Start Trading",
      description: "Browse markets and place your first prediction trade."
    }
  ];

  return (
    <section className="py-40 pt-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
            How it works
          </h2>
          <p className="text-lg text-gray-600">
            Three simple steps to start trading predictions
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 ml-10">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="w-16 h-16 bg-black text-white rounded-sm flex items-center justify-center mx-auto text-2xl font-light">
                {step.number}
              </div>
              <h3 className="text-xl font-medium text-black">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 