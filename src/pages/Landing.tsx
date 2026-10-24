import LandingNav from './landing/LandingNav';
import HeroSection from './landing/HeroSection';
import HowItWorksSection from './landing/HowItWorksSection';
import PillarsSection from './landing/PillarsSection';
import PickLevelSection from './landing/PickLevelSection';
import ForParentsSection from './landing/ForParentsSection';
import CoachPreviewSection from './landing/CoachPreviewSection';
import FaqSection from './landing/FaqSection';
import CtaSection from './landing/CtaSection';
import LandingFooter from './landing/LandingFooter';

export default function Landing() {
  return (
    <div className="min-h-dvh" style={{ background: 'var(--color-canvas)' }}>
      <LandingNav />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <PillarsSection />
        <PickLevelSection />
        <ForParentsSection />
        <CoachPreviewSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
