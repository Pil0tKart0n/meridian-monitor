"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { LiveEscalationGauge } from "@/components/gei/live-escalation-gauge";
import { AnimatedGlobe } from "@/components/ui/animated-globe";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ArrowRight, Radio, Zap, Globe, Newspaper } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden animated-bg">
      {/* Scan line effect */}
      <div className="scan-line" />

      {/* Noise texture */}
      <div className="noise-overlay" />

      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 sm:pt-16 sm:pb-24 lg:px-8">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2.5 rounded-full bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-red-400 font-medium">Live Monitoring</span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-500 text-xs">Aktive Ueberwachung</span>
          </div>
        </motion.div>

        {/* Main hero — two column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
          {/* Left: Copy */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6"
            >
              Geopolitik.
              <br />
              <span className="text-gradient">Echtzeit.</span>
              <br />
              Datengetrieben<span className="typing-cursor" />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="text-lg text-zinc-400 max-w-xl leading-relaxed mb-8"
            >
              Konfliktanalyse aus 30+ internationalen Quellen.
              KI-gestuetzte Zusammenfassungen. Ein transparenter Eskalationsindex.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <Link href="/signup" className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/25">
                {t("cta")}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/news" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-zinc-300 border border-zinc-700 rounded-2xl hover:border-zinc-500 hover:bg-zinc-900 transition-all">
                <Radio className="h-4 w-4 text-red-400" />
                Live Feed
              </Link>
            </motion.div>

            {/* Trust stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="grid grid-cols-3 gap-6"
            >
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white">
                  <AnimatedCounter target={30} suffix="+" />
                </p>
                <p className="text-xs text-zinc-500 mt-1">Quellen weltweit</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white">
                  <AnimatedCounter target={391} />
                </p>
                <p className="text-xs text-zinc-500 mt-1">Artikel heute</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white">
                  <AnimatedCounter target={15} suffix=" Min" />
                </p>
                <p className="text-xs text-zinc-500 mt-1">Update-Intervall</p>
              </div>
            </motion.div>
          </div>

          {/* Right: Animated Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hidden lg:block"
          >
            <AnimatedGlobe className="w-full max-w-lg mx-auto" />
          </motion.div>
        </div>

        {/* GEI + Cards Bento */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="md:col-span-4 lg:col-span-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 glow-pulse"
          >
            <LiveEscalationGauge />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="md:col-span-2 lg:col-span-3 space-y-4"
          >
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 flex items-center gap-4 card-hover">
              <div className="rounded-xl bg-red-500/10 p-2.5"><Zap className="h-5 w-5 text-red-400" /></div>
              <div>
                <p className="text-2xl font-black tabular-nums text-white"><AnimatedCounter target={7} /></p>
                <p className="text-xs text-zinc-500">Aktive Konfliktzonen</p>
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 flex items-center gap-4 card-hover">
              <div className="rounded-xl bg-blue-500/10 p-2.5"><Globe className="h-5 w-5 text-blue-400" /></div>
              <div>
                <p className="text-2xl font-black tabular-nums text-white"><AnimatedCounter target={8} /></p>
                <p className="text-xs text-zinc-500">Fraktionen beobachtet</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="md:col-span-6 lg:col-span-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 card-hover"
          >
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Newspaper className="h-3.5 w-3.5" /> Live Schlagzeilen
            </p>
            <div className="space-y-3">
              {[
                { color: "bg-red-500", text: "Iran verstaerkt Marinepraesenz im Golf", time: "12 Min" },
                { color: "bg-blue-500", text: "UN-Sicherheitsrat Dringlichkeitssitzung", time: "34 Min" },
                { color: "bg-amber-500", text: "Oelpreis +4% nach Red-Sea-Angriffen", time: "1 Std" },
                { color: "bg-purple-500", text: "IAEA: Iran bei 60% Uran-Anreicherung", time: "3 Std" },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="flex items-start gap-3 group cursor-pointer"
                >
                  <div className={`h-2 w-2 rounded-full ${item.color} mt-2 shrink-0`} />
                  <div className="flex-1">
                    <p className="text-sm text-zinc-300 leading-snug group-hover:text-orange-400 transition-colors">{item.text}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">vor {item.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link href="/news" className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-400 mt-4 font-medium">
              Alle Nachrichten <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
