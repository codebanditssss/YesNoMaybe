import { HeroSection } from './HeroSection';
import { StatsSection } from './StatsSection';
import { FeaturesSection } from './FeaturesSection';
import { MarketsSection } from './MarketsSection';
import { HowItWorksSection } from './HowItWorksSection';
import { CTASection } from './CTASection';

interface LandingPageProps {
  onOpenAuth: (tab: 'signin' | 'signup') => void;
}

export function LandingPage({ onOpenAuth }: LandingPageProps) {
  return (
    <div className="bg-black min-h-screen">
      <HeroSection onOpenAuth={onOpenAuth} />
      <StatsSection />
      <FeaturesSection />
      <MarketsSection />
      <HowItWorksSection />
      <CTASection onOpenAuth={onOpenAuth} />
    </div>
  );
} 