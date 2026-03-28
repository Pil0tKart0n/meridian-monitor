"use client";

import { useTranslations } from "next-intl";
import { Activity, Globe, Map, Bell } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";

export function FeaturesSection() {
  const t = useTranslations("landing.features");

  const features = [
    { icon: Activity, title: t("gei.title"), description: t("gei.description"), iconColor: "text-orange-400", bgColor: "bg-orange-500/10", borderHover: "hover:border-orange-500/30" },
    { icon: Globe, title: t("sources.title"), description: t("sources.description"), iconColor: "text-blue-400", bgColor: "bg-blue-500/10", borderHover: "hover:border-blue-500/30" },
    { icon: Map, title: t("map.title"), description: t("map.description"), iconColor: "text-emerald-400", bgColor: "bg-emerald-500/10", borderHover: "hover:border-emerald-500/30" },
    { icon: Bell, title: t("alerts.title"), description: t("alerts.description"), iconColor: "text-red-400", bgColor: "bg-red-500/10", borderHover: "hover:border-red-500/30" },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 border-t border-zinc-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-center mb-4">{t("title")}</h2>
          <p className="text-center text-zinc-400 mb-16 max-w-2xl mx-auto">Alles was du brauchst um geopolitische Risiken zu verstehen — in einer Plattform.</p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <div className={`rounded-2xl bg-zinc-900 border border-zinc-800 p-6 card-hover ${f.borderHover} h-full`}>
                <div className={`inline-flex rounded-xl ${f.bgColor} p-3 mb-4`}>
                  <f.icon className={`h-6 w-6 ${f.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
