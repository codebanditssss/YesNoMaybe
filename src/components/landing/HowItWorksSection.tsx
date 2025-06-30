import { motion } from "framer-motion";

export function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Create Account",
      description:
        "Sign up and verify your identity for secure trading access.",
    },
    {
      number: 2,
      title: "Fund Wallet",
      description: "Add funds to your wallet using secure payment methods.",
    },
    {
      number: 3,
      title: "Start Trading",
      description: "Browse markets and place your first prediction trade.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-black mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg text-gray-600">
            Three simple steps to start trading predictions
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="text-center space-y-5"
            >
              {/* Step Number Circle */}
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto text-2xl font-semibold shadow-md">
                {step.number}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-black">{step.title}</h3>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
