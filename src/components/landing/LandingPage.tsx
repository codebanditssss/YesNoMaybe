import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { HeroSection } from "./HeroSection";
import { StatsSection } from "./StatsSection";
import { FeaturesSection } from "./FeaturesSection";
import { MarketsSection } from "./MarketsSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { CTASection } from "./CTASection";

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onOpenAuth: (tab: "signin" | "signup") => void;
}

export function LandingPage({ onOpenAuth }: LandingPageProps) {
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    sectionsRef.current.forEach((el, i) => {
      if (!el) return;

      const line = el.querySelector(`#line-${i}`);
      if (!line) return;

      // Section fade in on scroll
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        }
      );

      // Animate vertical line (expand + retract)
      gsap.fromTo(
        line,
        { height: "0%", opacity: 0 },
        {
          height: "100%",
          opacity: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "top 30%",
            scrub: true,
          },
        }
      );
    });
  }, []);

  const SectionComponents = [
    HeroSection,
    StatsSection,
    FeaturesSection,
    MarketsSection,
    HowItWorksSection,
    CTASection,
  ];

  return (
    <>
      {/* Background Grid */}
      <div className="fixed inset-0 z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 0%, rgba(99,102,241,0.10) 0%, transparent 70%),
              url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0H0V60' stroke='%239ca3af' stroke-width='1'/%3E%3C/svg%3E")
            `,
            backgroundRepeat: "repeat",
            backgroundSize: "auto, 60px 60px",
            backgroundColor: "#f3f4f6",
          }}
        />
        <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-purple-200/20 via-transparent to-blue-200/20 mix-blend-overlay" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 space-y-20">
        {SectionComponents.map((SectionComponent, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) sectionsRef.current[i] = el;
            }}
            className="relative bg-white bg-opacity-80 backdrop-blur-lg shadow-2xl rounded-3xl p-6 sm:p-10 overflow-hidden"
          >
            {/* Left Vertical Gradient Line (Charcoal) */}
            <div
              id={`line-${i}`}
              className="absolute top-1 bottom-2 left-5 w-[3px] bg-gradient-to-b from-gray-700 to-gray-500 opacity-0 rounded-full shadow-[0_0_6px_2px_rgba(0,0,0,0.15)]"
            />

           

            <SectionComponent onOpenAuth={onOpenAuth} />
          </div>
        ))}
      </div>

      {/* Gradient Animation */}
      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradientMove 20s ease-in-out infinite;
          }
        `}
      </style>
    </>
  );
}
