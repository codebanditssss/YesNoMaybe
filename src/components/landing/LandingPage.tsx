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
    <>
      {/* Premium Grid Background */}
      <div 
        className="fixed inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(circle, #000000 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Content */}
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