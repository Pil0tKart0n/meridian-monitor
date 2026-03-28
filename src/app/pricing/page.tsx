import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PricingSection } from "@/components/landing/pricing-section";

export const metadata = {
  title: "Preise — Meridian Monitor",
  description: "Waehle deinen Zugang zur geopolitischen Intelligence-Plattform. Free, Premium oder Professional.",
};

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="py-12">
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}
