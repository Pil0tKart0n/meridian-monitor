"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { LiveEscalationGauge } from "@/components/gei/live-escalation-gauge";
import { ArrowRight, Shield } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-950/50 border border-red-900/50 px-4 py-1.5 text-sm text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              Live Monitoring Active
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              {t("headline")}
            </h1>

            <p className="text-lg sm:text-xl text-muted max-w-xl leading-relaxed">
              {t("subheadline")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-accent text-gray-950 rounded-xl hover:bg-accent-hover transition-colors"
              >
                {t("cta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium border border-border text-foreground rounded-xl hover:bg-surface-hover transition-colors"
              >
                {t("ctaSecondary")}
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 text-sm text-muted">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-green-500" />
                <span>30+ Quellen</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Transparente Methodik</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Echtzeit-Updates</span>
              </div>
            </div>
          </div>

          {/* Right: GEI Widget */}
          <div className="lg:pl-8">
            <LiveEscalationGauge />
          </div>
        </div>
      </div>
    </section>
  );
}
