import { BarChart3, Shield, Zap, Users, Target, TrendingUp } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Advanced charts and market data to make informed trading decisions.",
      color: "blue"
    },
    {
      icon: Shield,
      title: "Secure Trading",
      description: "Bank-grade security with encrypted transactions and secure wallet integration.",
      color: "green"
    },
    {
      icon: Zap,
      title: "Instant Execution",
      description: "Lightning-fast order execution with minimal slippage and optimal pricing.",
      color: "purple"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join a vibrant community of traders sharing insights and strategies.",
      color: "orange"
    },
    {
      icon: Target,
      title: "Diverse Markets",
      description: "Trade on politics, sports, crypto, tech, and hundreds of other categories.",
      color: "red"
    },
    {
      icon: TrendingUp,
      title: "AI-Powered Insights",
      description: "Get market predictions and trading signals powered by advanced AI algorithms.",
      color: "indigo"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 group-hover:bg-blue-200 text-blue-600",
      green: "bg-green-100 group-hover:bg-green-200 text-green-600",
      purple: "bg-purple-100 group-hover:bg-purple-200 text-purple-600",
      orange: "bg-orange-100 group-hover:bg-orange-200 text-orange-600",
      red: "bg-red-100 group-hover:bg-red-200 text-red-600",
      indigo: "bg-indigo-100 group-hover:bg-indigo-200 text-indigo-600"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Why Choose YesNoMaybe?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Professional-grade trading tools and market insights for the modern prediction trader.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-colors ${getColorClasses(feature.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 