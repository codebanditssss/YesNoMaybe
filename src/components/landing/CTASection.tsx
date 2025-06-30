import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CTASectionProps {
  onOpenAuth?: (tab: "signin" | "signup") => void;
}

export function CTASection({ onOpenAuth }: CTASectionProps) {
  const { user, loading } = useAuth();

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-white via-neutral-50 to-white">
      <div className="max-w-4xl mx-auto text-center bg-white/90 rounded-2xl shadow-lg p-10 backdrop-blur-sm border border-neutral-200">
        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-6 tracking-tight">
          {user ? "Continue Your Trading Journey" : "Ready to Start Trading?"}
        </h2>
        <p className="text-lg text-neutral-600 mb-10 leading-relaxed max-w-2xl mx-auto">
          {user
            ? "Explore new markets, manage your portfolio, and stay ahead of market trends with our professional trading tools."
            : "Join thousands of traders already profiting from their predictions. Start with just ₹1000 and see where your insights can take you."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {loading ? (
            <div className="text-neutral-500">Loading...</div>
          ) : user ? (
            <>
              <Button
                size="lg"
                className="text-base px-8 py-5 h-auto rounded-md bg-black text-white hover:bg-neutral-900 shadow-sm transition-all"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Explore Markets
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 py-5 h-auto rounded-md border-neutral-300 text-neutral-800 hover:bg-neutral-100 transition-all"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                View Analytics
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                className="text-base px-8 py-5 h-auto rounded-md bg-black text-white hover:bg-neutral-900 shadow-sm transition-all"
                onClick={() => onOpenAuth?.("signup")}
              >
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 py-5 h-auto rounded-md border-neutral-300 text-neutral-800 hover:bg-neutral-100 transition-all"
                onClick={() => onOpenAuth?.("signin")}
              >
                Learn More
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
