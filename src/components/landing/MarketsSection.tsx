import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Marquee } from '../magicui/marquee';
import { cn } from '@/lib/utils';

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
    },
    {
      title: "Fed Rate Cut by Q2 2024?",
      category: "Economics",
      volume: "₹13L",
      yesPrice: 73,
      noPrice: 27
    },
    {
      title: "Fed Rate Cut by Q2 2024?",
      category: "Economics",
      volume: "₹13L",
      yesPrice: 73,
      noPrice: 27
    },
    {
      title: "Fed Rate Cut by Q2 2024?",
      category: "Economics",
      volume: "₹13L",
      yesPrice: 73,
      noPrice: 27
    },
    {
      title: "Fed Rate Cut by Q2 2024?",
      category: "Economics",
      volume: "₹13L",
      yesPrice: 73,
      noPrice: 27
    }
  ];

  const ReviewCard = ({
    category,
    title,
    yesPrice,
    volume,
    noPrice,
  }: {
    category: string;
    volume: string;
    title: string;
    yesPrice: number;
    noPrice: number;
  }) => {
    return (
      <figure
        className={cn(
          "",
          // light styles
          "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
          // dark styles
          "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
        )}
      >
       <Card className="p-6 border border-gray-200 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">{category}</Badge>
                  <span className="text-sm text-gray-500">24h volume: {volume}</span>
                </div>
                <h3 className="font-medium text-black">{title}</h3>
                <div className="flex justify-between text-sm">
                  <div className="text-center">
                    <div className="text-green-600 font-medium">YES</div>
                    <div className="text-gray-500">{yesPrice}¢</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 font-medium">NO</div>
                    <div className="text-gray-500">{noPrice}¢</div>
                  </div>
                </div>
              </div>
        </Card>
      </figure>
    );
  };

  const firstRow = markets.slice(0, markets.length / 2);

  return (
    <section className="py-44 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
            Popular Markets
          </h2>
          <p className="text-lg text-gray-600">
            Trade on high-volume prediction markets
          </p>
        </div>
        
        <div >
        <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((market, index) => (
           <ReviewCard key={index} {...market} />
        ))}
      </Marquee>
          {/* {markets.map((market, index) => (
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
          ))} */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
        </div>
      </div>
    </section>
  );
} 