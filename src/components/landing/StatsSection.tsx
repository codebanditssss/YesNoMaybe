export function StatsSection() {
  const stats = [
    { value: "$2.4M+", label: "Total Volume Traded" },
    { value: "15K+", label: "Active Traders" },
    { value: "89%", label: "Accuracy Rate" },
    { value: "500+", label: "Markets Available" }
  ];

  return (
    <section className="py-16 bg-white/50 backdrop-blur-sm border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-slate-600 uppercase tracking-wide font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 