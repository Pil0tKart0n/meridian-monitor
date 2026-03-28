"use client";

import { useTranslations } from "next-intl";
import { Activity, Globe, Map, Bell } from "lucide-react";

export function FeaturesSection() {
  const t = useTranslations("landing.features");

  const features = [
    {
      icon: Activity,
      title: t("gei.title"),
      description: t("gei.description"),
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
    },
    {
      icon: Globe,
      title: t("sources.title"),
      description: t("sources.description"),
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
    },
    {
      icon: Map,
      title: t("map.title"),
      description: t("map.description"),
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-400",
    },
    {
      icon: Bell,
      title: t("alerts.title"),
      description: t("alerts.description"),
      gradient: "from-red-500/20 to-pink-500/20",
      iconColor: "text-red-400",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl bg-surface border border-border p-6 hover:border-accent/30 transition-colors"
            >
              <div
                className={`inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-4`}
              >
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
