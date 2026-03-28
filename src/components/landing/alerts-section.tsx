"use client";

import { RedAlertFeed } from "@/components/alerts/red-alert-feed";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Link from "next/link";
import { ArrowRight, Siren } from "lucide-react";

export function AlertsSection() {
  return (
    <section className="py-16 sm:py-24 border-t border-zinc-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                <Siren className="h-7 w-7 text-red-500" />
                Live Raketenalarm
              </h2>
              <p className="text-sm text-zinc-500 mt-1">Echtzeit-Daten aus dem israelischen Warnsystem (Tzeva Adom)</p>
            </div>
            <Link href="/alerts" className="hidden sm:inline-flex items-center gap-1 text-sm text-orange-500 hover:text-orange-400 font-medium">
              Vollansicht <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="max-w-2xl">
            <RedAlertFeed />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
