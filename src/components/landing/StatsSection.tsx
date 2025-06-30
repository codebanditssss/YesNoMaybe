import { motion } from "framer-motion";

export function StatsSection() {
  const stats = [
    { value: "₹20Cr+", label: "Total Volume Traded" },
    { value: "15K+", label: "Active Traders" },
    { value: "89%", label: "Accuracy Rate" },
    { value: "500+", label: "Markets Available" },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 250 }}
              className="bg-neutral-50 rounded-lg py-8 px-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="text-3xl md:text-4xl font-semibold text-black">
                {stat.value}
              </div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-2">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
