"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { LiveEscalationGauge } from "@/components/gei/live-escalation-gauge";
import { ArrowRight, Zap, Globe, Radio } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-950/20 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 sm:pt-20 sm:pb-28 lg:px-8">
        {/* Status badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-950/60 border border-red-500/20 px-4 py-2 text-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-red-300 font-medium">Live Monitoring</span>
            <span className="text-red-500/50">|</span>
            <span className="text-red-400/70 text-xs">30+ Quellen aktiv</span>
          </div>
        </div>

        {/* Headline — big, bold, centered */}
        <div className="text-center max-w-4xl mx-auto space-y-6 mb-16">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
            Geopolitik.{" "}
            <span className="text-gradient">Echtzeit.</span>
            <br />
            Datengetrieben.
          </h1>

          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            {t("subheadline")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 px-8 py-4 text-base font-bold bg-accent text-background rounded-2xl hover:bg-accent-hover transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("cta")}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-muted hover:text-foreground border border-border rounded-2xl hover:border-border-hover hover:bg-surface transition-all"
            >
              <Radio className="h-4 w-4" />
              Live Feed ansehen
            </Link>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 max-w-6xl mx-auto">
          {/* GEI Widget — large */}
          <div className="md:col-span-4 lg:col-span-5 rounded-2xl bg-surface border border-border p-1 glow-accent">
            <LiveEscalationGauge />
          </div>

          {/* Quick Stats */}
          <div className="md:col-span-2 lg:col-span-3 space-y-4">
            <StatCard
              icon={<Zap className="h-5 w-5 text-red-400" />}
              label="Aktive Konflikte"
              value="7"
              sublabel="Nahostregion"
            />
            <StatCard
              icon={<Globe className="h-5 w-5 text-blue-400" />}
              label="Quellen heute"
              value="391"
              sublabel="Artikel aggregiert"
            />
          </div>

          {/* Latest headlines mini-feed */}
          <div className="md:col-span-6 lg:col-span-4 rounded-2xl bg-surface border border-border p-5">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Aktuelle Schlagzeilen</p>
            <div className="space-y-3">
              {[
                { cat: "MILITARY", color: "bg-red-500", title: "Iran verstaerkt Marinepraesenz im Persischen Golf" },
                { cat: "DIPLOMATIC", color: "bg-blue-500", title: "UN-Sicherheitsrat beruft Dringlichkeitssitzung ein" },
                { cat: "ECONOMIC", color: "bg-amber-500", title: "Oelpreis +4% nach Red-Sea-Angriffen" },
                { cat: "NUCLEAR", color: "bg-purple-500", title: "IAEA: Iran bei 60% Uran-Anreicherung" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 group cursor-pointer">
                  <div className={`h-2 w-2 rounded-full ${item.color} mt-2 shrink-0 animate-pulse-dot`} />
                  <div>
                    <p className="text-sm leading-snug group-hover:text-accent transition-colors">{item.title}</p>
                    <p className="text-[10px] text-muted uppercase tracking-wider mt-0.5">{item.cat}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/news" className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover mt-4 font-medium">
              Alle Nachrichten <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, sublabel }: { icon: React.ReactNode; label: string; value: string; sublabel: string }) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-5 flex items-center gap-4">
      <div className="rounded-xl bg-background p-2.5">{icon}</div>
      <div>
        <p className="text-2xl font-black tabular-nums">{value}</p>
        <p className="text-xs text-muted">{label} — {sublabel}</p>
      </div>
    </div>
  );
}
