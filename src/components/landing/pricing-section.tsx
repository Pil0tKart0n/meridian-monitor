"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function PricingSection() {
  const t = useTranslations("pricing");

  const tiers = [
    {
      key: "free" as const,
      popular: false,
    },
    {
      key: "premium" as const,
      popular: true,
    },
    {
      key: "professional" as const,
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => {
            const name = t(`tiers.${tier.key}.name`);
            const price = t(`tiers.${tier.key}.price`);
            const description = t(`tiers.${tier.key}.description`);
            const cta = t(`tiers.${tier.key}.cta`);
            const features: string[] = [];

            // Read features array from translations
            let i = 0;
            while (true) {
              try {
                const feature = t(`tiers.${tier.key}.features.${i}`);
                if (!feature) break;
                features.push(feature);
                i++;
              } catch {
                break;
              }
            }

            return (
              <div
                key={tier.key}
                className={cn(
                  "relative rounded-2xl border p-8 flex flex-col",
                  tier.popular
                    ? "border-accent bg-surface shadow-lg shadow-accent/5 scale-105"
                    : "border-border bg-surface"
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-accent px-4 py-1 text-xs font-semibold text-gray-950">
                      Beliebteste Wahl
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold">{name}</h3>
                  <p className="text-sm text-muted mt-1">{description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold tabular-nums">
                    {price === "0" ? "0" : price}
                  </span>
                  {price !== "0" && (
                    <span className="text-muted ml-1">EUR / {t("monthly").toLowerCase()}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.key === "free" ? "/signup" : "/signup?tier=" + tier.key}
                  className={cn(
                    "block text-center py-3 px-6 rounded-xl text-sm font-semibold transition-colors",
                    tier.popular
                      ? "bg-accent text-gray-950 hover:bg-accent-hover"
                      : "bg-surface-hover text-foreground hover:bg-border"
                  )}
                >
                  {cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
