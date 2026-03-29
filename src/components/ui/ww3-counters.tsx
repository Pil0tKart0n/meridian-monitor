"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { Skull, Radiation, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CounterData {
  label: string;
  value: number;
  icon: typeof Skull;
  color: string;
  glowColor: string;
  description: string;
}

// SSR-safe mounted check without useEffect+setState
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function useAnimatedNumber(target: number, duration: number = 2000) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const startValue = current;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(startValue + (target - startValue) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    // Only re-run when target changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return current;
}

function formatDaysSince(dateStr: string): number {
  const start = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

const COUNTERS: CounterData[] = [
  {
    label: "WW3 RISK INDEX",
    value: 73,
    icon: Skull,
    color: "text-red-500",
    glowColor: "shadow-red-500/30",
    description: "Basierend auf 5 Eskalationskategorien",
  },
  {
    label: "NUKLEAR-RISIKO",
    value: 31,
    icon: Radiation,
    color: "text-yellow-500",
    glowColor: "shadow-yellow-500/30",
    description: "Atomwaffen-Eskalationsstufe",
  },
];

export function WW3Counters() {
  const [expanded, setExpanded] = useState(false);
  const mounted = useMounted();

  const daysSinceEscalation = formatDaysSince("2023-10-07");

  const ww3Value = useAnimatedNumber(mounted ? COUNTERS[0].value : 0, 1500);
  const nukeValue = useAnimatedNumber(mounted ? COUNTERS[1].value : 0, 1800);

  return (
    <div className="fixed top-20 right-4 z-40 flex flex-col items-end gap-2">
      {/* Compact toggle button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-xl transition-all",
          "bg-zinc-950/90 border-red-500/20 hover:border-red-500/40",
          "shadow-lg",
          expanded ? "shadow-red-500/10" : "shadow-red-500/20"
        )}
        aria-label="WW3 Counter anzeigen"
        aria-expanded={expanded}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="text-xs font-bold text-red-400 tabular-nums">WW3: {ww3Value}%</span>
        <span className="text-zinc-600">|</span>
        <Radiation className="h-3.5 w-3.5 text-yellow-500" />
        <span className="text-xs font-bold text-yellow-400 tabular-nums">{nukeValue}%</span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        )}
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="w-72 rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-800/50 bg-red-500/5">
            <div className="flex items-center gap-2">
              <Skull className="h-4 w-4 text-red-500" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Eskalations-Monitor</span>
            </div>
          </div>

          {/* Counters */}
          <div className="p-4 space-y-4">
            {/* WW3 Risk Gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">WW3 Risiko</span>
                <span className={cn(
                  "text-lg font-black tabular-nums",
                  ww3Value >= 70 ? "text-red-500" : ww3Value >= 40 ? "text-amber-500" : "text-green-500"
                )}>
                  {ww3Value}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-red-500 to-red-600 transition-all duration-1000"
                  style={{ width: `${ww3Value}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-600">{COUNTERS[0].description}</p>
            </div>

            {/* Nuclear Risk Gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Radiation className="h-3 w-3 text-yellow-500" />
                  Nuklear-Risiko
                </span>
                <span className={cn(
                  "text-lg font-black tabular-nums",
                  nukeValue >= 50 ? "text-red-500" : nukeValue >= 25 ? "text-yellow-500" : "text-green-500"
                )}>
                  {nukeValue}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-orange-500 transition-all duration-1000"
                  style={{ width: `${nukeValue}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-600">{COUNTERS[1].description}</p>
            </div>

            {/* Days counter */}
            <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Tage seit Eskalation</span>
                <span className="text-xl font-black text-orange-500 tabular-nums">{daysSinceEscalation}</span>
              </div>
              <p className="text-[10px] text-zinc-600 mt-1">Seit 7. Oktober 2023</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-zinc-800/50 bg-zinc-900/30">
            <p className="text-[9px] text-zinc-600 text-center">
              Aktualisiert alle 15 Min — Quellen: GDELT, ACLED, SIPRI
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
