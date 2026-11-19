import CoreHero from "@/components/ui/syntra-hero";
import SystemFeatures from "@/components/ui/system-features";
import HowItWorks from "@/components/ui/how-it-works";
import { Testimonial } from "@/components/ui/design-testimonial";
import PricingSection from "@/components/ui/pricing-section";
import CtaBand from "@/components/ui/cta-band";
// import IntegrationsSection from "@/components/ui/integrations-section";
import SiteFooter from "@/components/ui/site-footer";

export default function Home() {
  return (
    <main>
      {/* The branded hero (its own nav + animated core) is the top of the page. */}
      <CoreHero />

      {/* What you get - live diagram bento of the agent's skills. */}
      <SystemFeatures />

      {/* How it works - 3 steps. */}
      <HowItWorks />

      {/* Testimonials. */}
      <Testimonial />

      {/* Pricing. */}
      <PricingSection />

      {/* Call-to-action between the two feature sections. */}
      <CtaBand />

      {/* Integrations - tool wheel. (commented out for now) */}
      {/* <IntegrationsSection /> */}

      {/* Stacked circular footer. */}
      <SiteFooter />
    </main>
  );
}
