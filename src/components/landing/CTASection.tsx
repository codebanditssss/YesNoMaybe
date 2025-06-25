import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CTASectionProps {
  onOpenAuth?: (tab: 'signin' | 'signup') => void;
}

export function CTASection({ onOpenAuth }: CTASectionProps) {
  const { user, loading } = useAuth();

  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
          {user ? "Continue Your Trading Journey" : "Ready to Start Trading?"}
        </h2>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
          {user 
            ? "Explore new markets, manage your portfolio, and stay ahead of market trends with our professional trading tools."
            : "Join thousands of traders who are already profiting from their predictions. Start with just $10 and see where your insights can take you."
          }
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : user ? (
            <>
              <Button size="lg" className="text-base px-8 py-6 h-auto">
                <TrendingUp className="mr-2 h-5 w-5" />
                Explore Markets
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8 py-6 h-auto">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Analytics
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" className="text-base px-8 py-6 h-auto" onClick={() => onOpenAuth?.('signup')}>
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8 py-6 h-auto" onClick={() => onOpenAuth?.('signin')}>
                Learn More
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
} 