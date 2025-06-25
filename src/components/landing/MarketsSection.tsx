import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function MarketsSection() {
  const markets = [
    {
      title: "Will AI achieve AGI by 2025?",
      category: "Technology",
      volume: "₹10L",
      yesPrice: 34,
      noPrice: 66
    },
    {
      title: "2024 Election Prediction",
      category: "Politics", 
      volume: "₹7.5L",
      yesPrice: 52,
      noPrice: 48
    },
    {
      title: "Fed Rate Cut by Q2 2024?",
      category: "Economics",
      volume: "₹13L",
      yesPrice: 73,
      noPrice: 27
    }
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
            Popular Markets
          </h2>
          <p className="text-lg text-gray-600">
            Trade on high-volume prediction markets
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {markets.map((market, index) => (
            <Card key={index} className="p-6 border border-gray-200 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">{market.category}</Badge>
                  <span className="text-sm text-gray-500">24h volume: {market.volume}</span>
                </div>
                <h3 className="font-medium text-black">{market.title}</h3>
                <div className="flex justify-between text-sm">
                  <div className="text-center">
                    <div className="text-green-600 font-medium">YES</div>
                    <div className="text-gray-500">{market.yesPrice}¢</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 font-medium">NO</div>
                    <div className="text-gray-500">{market.noPrice}¢</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 