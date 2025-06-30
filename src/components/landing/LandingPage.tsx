import { HeroSection } from "./HeroSection";
import { StatsSection } from "./StatsSection";
import { FeaturesSection } from "./FeaturesSection";
import { MarketsSection } from "./MarketsSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { CTASection } from "./CTASection";

interface LandingPageProps {
  onOpenAuth: (tab: "signin" | "signup") => void;
}

export function LandingPage({ onOpenAuth }: LandingPageProps) {
  return (
    <>
      {/* Background Layer */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* Gradient Light-to-Dark BG */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 via-white to-neutral-100" />

        {/* Soft Paper Texture */}
        <div
          className="absolute inset-0 mix-blend-soft-light opacity-[0.03]"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/paper-fibers.png")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* Subtle vignette effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">
        <HeroSection onOpenAuth={onOpenAuth} />
        <StatsSection />
        <FeaturesSection />
        <MarketsSection />
        <HowItWorksSection />
        <CTASection onOpenAuth={onOpenAuth} />
      </div>
    </>
  );
}
