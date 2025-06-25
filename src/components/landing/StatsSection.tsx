export function StatsSection() {
  const stats = [
    {
      value: "₹20Cr+",
      label: "Total Volume Traded"
    },
    {
      value: "15K+", 
      label: "Active Traders"
    },
    {
      value: "89%",
      label: "Accuracy Rate"
    },
    {
      value: "500+",
      label: "Markets Available"
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-3xl md:text-4xl font-light text-black">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 