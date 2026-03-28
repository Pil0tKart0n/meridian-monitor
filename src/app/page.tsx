import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { AlertsSection } from "@/components/landing/alerts-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { NewsletterSection } from "@/components/landing/newsletter-section";
import { BreakingTicker } from "@/components/news/breaking-ticker";

export default function HomePage() {
  return (
    <>
      <Header />
      <BreakingTicker />
      <main>
        <HeroSection />
        <AlertsSection />
        <FeaturesSection />
        <PricingSection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
