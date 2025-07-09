'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface HeroSectionProps {
  onOpenAuth?: (tab: 'signin' | 'signup') => void;
}

export function HeroSection({ onOpenAuth }: HeroSectionProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleStartTrading = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      onOpenAuth?.('signup');
    }
  };

  const handleLearnMore = () => {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="flex flex-wrap items-center -mx-4">
          <div className="w-full lg:w-1/2 px-4 mb-16 lg:mb-0">
            <div className="max-w-lg">
              <div className="flex items-center gap-3 mb-8">
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-8 h-8 text-black"
                  fill="currentColor"
                >
                  <path d="M12 2L9.5 7L15 9L12 14L18.5 16L15 22L21 19.5L19.5 15L16 13L18.5 9L15.5 7.5L17 4L12 2Z" />
                </svg>
                <span className="text-2xl font-bold">
                  Augur
                </span>
              </div>
              <h1 className="font-light text-5xl md:text-6xl text-black mb-6">
                Trade on the Future with <span className="font-normal">Confidence</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Join India's most sophisticated prediction market platform. Make data-driven trades on future outcomes with real-time analytics and advanced market insights.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleStartTrading}
                  size="lg"
                  className="bg-black hover:bg-black/90 text-white px-8"
                >
                  Start Trading
                </Button>
                <Button
                  onClick={handleLearnMore}
                  size="lg"
                  variant="outline"
                  className="px-8"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 px-4">
            <div className="relative">
              <img 
                className="relative rounded-2xl shadow-2xl"
                src="/trading-preview.png" 
                alt="Trading Interface Preview"
                width={900}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 