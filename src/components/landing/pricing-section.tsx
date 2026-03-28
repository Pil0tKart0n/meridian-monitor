"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TIER_FEATURES: Record<string, string[]> = {
  free: ["News-Feed (24-48h Verzoegerung)", "Aktueller GEI-Wert", "Woechentlicher Newsletter", "Basis-Konfliktkarte"],
  premium: ["Echtzeit-Nachrichten", "GEI mit Historie und Trends", "Interaktive Konfliktkarte", "Taegliche Briefings", "Push-Alerts", "Werbefrei", "Community-Zugang"],
  professional: ["Alles aus Premium", "Rohdaten-Export (CSV/JSON)", "API-Zugang", "Quartals-Forecasting", "Supply-Chain-Alerts", "Regionale Deep-Dives", "Priority-Support"],
};

export function PricingSection() {
  const t = useTranslations("pricing");

  const tiers = [
    { key: "free" as const, price: "0", popular: false },
    { key: "premium" as const, price: "9,99", popular: true },
    { key: "professional" as const, price: "29,99", popular: false },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 border-t border-zinc-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{t("title")}</h2>
          <p className="mt-4 text-lg text-zinc-400">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => {
            const features = TIER_FEATURES[tier.key] ?? [];
            return (
              <div key={tier.key} className={cn(
                "relative rounded-2xl border p-8 flex flex-col",
                tier.popular ? "border-orange-500/50 bg-zinc-900 shadow-xl shadow-orange-500/10 md:scale-105" : "border-zinc-800 bg-zinc-900/50"
              )}>
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex rounded-full bg-orange-500 px-4 py-1 text-xs font-bold text-white">Beliebteste Wahl</span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">{t(`tiers.${tier.key}.name`)}</h3>
                  <p className="text-sm text-zinc-500 mt-1">{t(`tiers.${tier.key}.description`)}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-black tabular-nums text-white">{tier.price}</span>
                  {tier.price !== "0" && <span className="text-zinc-500 ml-1">EUR / Monat</span>}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/signup${tier.key !== "free" ? `?tier=${tier.key}` : ""}`} className={cn(
                  "block text-center py-3 px-6 rounded-xl text-sm font-bold transition-colors",
                  tier.popular ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                )}>
                  {t(`tiers.${tier.key}.cta`)}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
