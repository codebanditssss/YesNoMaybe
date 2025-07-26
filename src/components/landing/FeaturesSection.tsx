// import { Card } from '@/components/ui/card';
// import { motion } from 'framer-motion';
// import { Zap, ShieldCheck, BarChart4 } from 'lucide-react';

// export function FeaturesSection() {
//   const features = [
//     {
//       icon: <Zap className="h-10 w-10 text-white" />, bg: 'from-yellow-400 to-yellow-600', title: 'Lightning Fast', description: 'Instant order execution and real-time updates.'
//     },
//     {
//       icon: <ShieldCheck className="h-10 w-10 text-white" />, bg: 'from-green-400 to-green-600', title: 'Secure & Private', description: 'Bank-level security and privacy for all users.'
//     },
//     {
//       icon: <BarChart4 className="h-10 w-10 text-white" />, bg: 'from-blue-400 to-blue-600', title: 'Advanced Analytics', description: 'Professional tools and analytics for every trader.'
//     },
//   ];

//   return (
//     <section className="py-24 px-6">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-16">
//           <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
//             Supercharge Your Trading
//           </h2>
//           <p className="text-lg text-gray-500 max-w-2xl mx-auto">
//             Discover the features that make YesNoMaybe the most advanced prediction market platform.
//           </p>
//         </div>
//         <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
//           {features.map((feature, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 40 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
//               className="w-full md:w-1/3"
//             >
//               <Card className="relative group p-8 bg-white rounded-3xl shadow-xl border-0 flex flex-col items-center transition-transform duration-300 hover:scale-105">
//                 <div className={`mb-6 rounded-full p-4 bg-gradient-to-br ${feature.bg} shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
//                   {feature.icon}
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">{feature.title}</h3>
//                 <p className="text-gray-600 text-center text-base">{feature.description}</p>
//               </Card>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// } 


import { Card } from '@/components/ui/card';
import { MarqueeDemo } from '../ui/movingbar';

export function FeaturesSection() {
  const features = [
    {
      icon: "📊",
      title: "Real-time Analytics",
      description: "Advanced market analytics with real-time data feeds and institutional-grade insights."
    },
    {
      icon: "⚡",
      title: "Instant Execution", 
      description: "Lightning-fast order execution with minimal slippage and maximum efficiency."
    },
    {
      icon: "🔒",
      title: "Secure Trading",
      description: "Bank-level security with multi-factor authentication and encrypted transactions."
    }
  ];

  return (
    <section className="py-34 pt-44 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
            Enterprise-grade prediction markets
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced tools and analytics for professional opinion trading
          </p>
        </div>
         <MarqueeDemo/>
        {/* <div className="grid md:grid-cols-3 gap-8">
       
          {features.map((feature, index) => (
            <Card key={index} className="p-8 border border-gray-200 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-black rounded-sm flex items-center justify-center">
                  <span className="text-white text-xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-medium text-black">{feature.title}</h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div> */}
      </div>
    </section>
  );
} 