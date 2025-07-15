import { HeroSection } from "./HeroSection";
import { StatsSection } from "./StatsSection";
import { FeaturesSection } from "./FeaturesSection";
import { MarketsSection } from "./MarketsSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { CTASection } from "./CTASection";
import { Footers } from "./footer";
import { HeroScrollDemo } from "./laptopScroll";
import { MarqueeDemo } from "../ui/movingbar";

interface LandingPageProps {
  onOpenAuth: (tab: "signin" | "signup") => void;
}

export function LandingPage({ onOpenAuth }: LandingPageProps) {
  return (
    <>
      {/* Premium Grid Background */}
      <div
        className="fixed inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, #000000 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <HeroSection onOpenAuth={onOpenAuth} />
        {/* <StatsSection /> */}
        {/* <HeroScrollDemo/> */}
        <div id="features">
          <FeaturesSection />
        </div>
        {/* <MarketsSection /> */}
        <div id="something">
          <HowItWorksSection />
        </div>
        <div id="learn">
          <CTASection onOpenAuth={onOpenAuth} />
        </div>
        <div id="faq">
          <Footers />
        </div>
      </div>
    </>
  );
}
