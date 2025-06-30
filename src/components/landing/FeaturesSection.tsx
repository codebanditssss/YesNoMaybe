import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export function FeaturesSection() {
  const features = [
    {
      icon: "📊",
      title: "Real-time Analytics",
      description:
        "Advanced market analytics with real-time data feeds and institutional-grade insights.",
    },
    {
      icon: "⚡",
      title: "Instant Execution",
      description:
        "Lightning-fast order execution with minimal slippage and maximum efficiency.",
    },
    {
      icon: "🔒",
      title: "Secure Trading",
      description:
        "Bank-level security with multi-factor authentication and encrypted transactions.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-black mb-4 tracking-tight">
            Enterprise-grade Prediction Markets
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Advanced tools and analytics for professional opinion trading
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all rounded-xl">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-md bg-black flex items-center justify-center shadow">
                    <span className="text-white text-xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-black tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
