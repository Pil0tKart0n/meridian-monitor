"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { LiveEscalationGauge } from "@/components/gei/live-escalation-gauge";
import { ArrowRight, Radio, Zap, Globe } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden border-b border-zinc-800/50">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-500/5 rounded-full blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8">
        {/* Live badge */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-red-400 font-medium">Live Monitoring</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-500 text-xs">30+ Quellen aktiv</span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            Geopolitik.{" "}
            <span className="text-gradient">Echtzeit.</span>
            <br />
            Datengetrieben.
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Konfliktanalyse aus 30+ internationalen Quellen. Ein transparenter Index.
            Alle Perspektiven auf einen Blick.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="group inline-flex items-center gap-2 px-8 py-4 text-base font-bold bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/20">
              {t("cta")}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/news" className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-zinc-300 border border-zinc-700 rounded-2xl hover:border-zinc-600 hover:bg-zinc-800/50 transition-all">
              <Radio className="h-4 w-4" />
              Live Feed ansehen
            </Link>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 max-w-6xl mx-auto">
          {/* GEI Widget */}
          <div className="md:col-span-4 lg:col-span-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-xl shadow-orange-500/5 p-1">
            <LiveEscalationGauge />
          </div>

          {/* Stats */}
          <div className="md:col-span-2 lg:col-span-3 space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 flex items-center gap-4">
              <div className="rounded-xl bg-red-500/10 p-2.5">
                <Zap className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-black tabular-nums text-white">7</p>
                <p className="text-xs text-zinc-500">Aktive Konflikte</p>
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 flex items-center gap-4">
              <div className="rounded-xl bg-blue-500/10 p-2.5">
                <Globe className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-black tabular-nums text-white">391</p>
                <p className="text-xs text-zinc-500">Artikel heute</p>
              </div>
            </div>
          </div>

          {/* Headlines */}
          <div className="md:col-span-6 lg:col-span-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Schlagzeilen</p>
            <div className="space-y-3">
              {[
                { color: "bg-red-500", title: "Iran verstaerkt Marinepraesenz" },
                { color: "bg-blue-500", title: "UN-Sicherheitsrat Dringlichkeitssitzung" },
                { color: "bg-amber-500", title: "Oelpreis +4% nach Angriffen" },
                { color: "bg-purple-500", title: "IAEA: Iran bei 60% Anreicherung" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 group cursor-pointer">
                  <div className={`h-2 w-2 rounded-full ${item.color} mt-2 shrink-0`} />
                  <p className="text-sm text-zinc-300 leading-snug group-hover:text-orange-400 transition-colors">{item.title}</p>
                </div>
              ))}
            </div>
            <Link href="/news" className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-400 mt-4 font-medium">
              Alle Nachrichten <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
