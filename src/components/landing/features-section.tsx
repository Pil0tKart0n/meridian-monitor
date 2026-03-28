"use client";

import { useTranslations } from "next-intl";
import { Activity, Globe, Map, Bell } from "lucide-react";

export function FeaturesSection() {
  const t = useTranslations("landing.features");

  const features = [
    { icon: Activity, title: t("gei.title"), description: t("gei.description"), iconColor: "text-orange-400", bgColor: "bg-orange-500/10" },
    { icon: Globe, title: t("sources.title"), description: t("sources.description"), iconColor: "text-blue-400", bgColor: "bg-blue-500/10" },
    { icon: Map, title: t("map.title"), description: t("map.description"), iconColor: "text-emerald-400", bgColor: "bg-emerald-500/10" },
    { icon: Bell, title: t("alerts.title"), description: t("alerts.description"), iconColor: "text-red-400", bgColor: "bg-red-500/10" },
  ];

  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-center mb-16">{t("title")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 hover:border-zinc-700 transition-colors">
              <div className={`inline-flex rounded-xl ${f.bgColor} p-3 mb-4`}>
                <f.icon className={`h-6 w-6 ${f.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
