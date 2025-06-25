import { Badge } from "@/components/ui/badge";

export function MarketsSection() {
  const markets = [
    {
      category: "Politics",
      question: "Will the next election result in a landslide victory?",
      yesPrice: "42¢",
      noPrice: "58¢",
      volume: "$234K"
    },
    {
      category: "Technology", 
      question: "Will AI surpass human performance in creative tasks by 2025?",
      yesPrice: "67¢",
      noPrice: "33¢",
      volume: "$512K"
    },
    {
      category: "Crypto",
      question: "Will Bitcoin reach $100K before the end of 2024?", 
      yesPrice: "73¢",
      noPrice: "27¢",
      volume: "$892K"
    }
  ];

  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Popular Markets
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Explore trending prediction markets and see where the crowd is placing their bets.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {markets.map((market, index) => (
            <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <Badge variant="secondary" className="mb-4">{market.category}</Badge>
              <h3 className="text-lg font-semibold mb-4">{market.question}</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                  <span className="font-medium text-green-400">Yes</span>
                  <span className="font-bold">{market.yesPrice}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                  <span className="font-medium text-red-400">No</span>
                  <span className="font-bold">{market.noPrice}</span>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-slate-400">
                Volume: {market.volume}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 