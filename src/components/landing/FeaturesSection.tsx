import { Card } from '@/components/ui/card';

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
    <section className="py-24 px-6 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
            Enterprise-grade prediction markets
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced tools and analytics for professional opinion trading
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
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
        </div>
      </div>
    </section>
  );
} 