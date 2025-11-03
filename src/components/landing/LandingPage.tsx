import { HeroSection } from "./HeroSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { Footers } from "./footer";

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
         
        <div>
          <HowItWorksSection />
        </div>
        <div id="faq">
          <Footers />
        </div>
      </div>
    </>
  );
}
