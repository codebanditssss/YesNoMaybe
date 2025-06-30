import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export function MarketsSection() {
  const markets = [
    {
      title: "Will AI achieve AGI by 2025?",
      category: "Technology",
      volume: "₹10L",
      yesPrice: 34,
      noPrice: 66,
    },
    {
      title: "2024 Election Prediction",
      category: "Politics",
      volume: "₹7.5L",
      yesPrice: 52,
      noPrice: 48,
    },
    {
      title: "Fed Rate Cut by Q2 2024?",
      category: "Economics",
      volume: "₹13L",
      yesPrice: 73,
      noPrice: 27,
    },
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-black mb-4 tracking-tight">
            Popular Markets
          </h2>
          <p className="text-lg text-gray-600">
            Trade on high-volume prediction markets
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {markets.map((market, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all rounded-xl">
                <div className="space-y-4">
                  {/* Top Row */}
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {market.category}
                    </Badge>
                    <span className="text-gray-500">
                      24h Vol: {market.volume}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-medium text-black leading-snug">
                    {market.title}
                  </h3>

                  {/* Prices */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-center space-y-1">
                      <div className="text-green-600 font-semibold text-sm">
                        YES
                      </div>
                      <div className="text-gray-500 text-sm">
                        {market.yesPrice}¢
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="text-red-600 font-semibold text-sm">
                        NO
                      </div>
                      <div className="text-gray-500 text-sm">
                        {market.noPrice}¢
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
