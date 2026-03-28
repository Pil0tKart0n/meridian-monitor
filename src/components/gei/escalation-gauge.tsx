"use client";

import { useTranslations } from "next-intl";
import { getEscalationLevel } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface EscalationGaugeProps {
  score: number;
  change: number;
  primaryDriver?: string;
  compact?: boolean;
}

const LEVEL_COLORS: Record<string, string> = {
  low: "text-green-400",
  elevated: "text-yellow-400",
  high: "text-amber-400",
  severe: "text-orange-400",
  critical: "text-red-400",
};

const LEVEL_STROKE: Record<string, string> = {
  low: "stroke-green-400",
  elevated: "stroke-yellow-400",
  high: "stroke-amber-400",
  severe: "stroke-orange-400",
  critical: "stroke-red-400",
};

export function EscalationGauge({ score, change, primaryDriver, compact = false }: EscalationGaugeProps) {
  const t = useTranslations("gei");
  const level = getEscalationLevel(score);
  const percentage = Math.min(score, 100);
  const levelKey = score >= 81 ? "critical" : score >= 61 ? "severe" : score >= 41 ? "high" : score >= 21 ? "elevated" : "low";

  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendColor = change > 0 ? "text-red-400" : change < 0 ? "text-green-400" : "text-zinc-500";

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3">
        <div className="relative h-12 w-12">
          <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" className="stroke-zinc-800" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" strokeDasharray={`${percentage}, 100`} className={LEVEL_STROKE[levelKey]} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{score}</span>
        </div>
        <div>
          <p className="text-xs text-zinc-500">{t("title")}</p>
          <p className={`text-sm font-semibold ${LEVEL_COLORS[levelKey]}`}>{level.label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8">
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
          <p className="text-sm text-zinc-500 mt-1">{t("subtitle")}</p>
        </div>

        <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="2.5" className="stroke-zinc-800" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="2.5" strokeDasharray={`${percentage}, 100`} className={LEVEL_STROKE[levelKey]} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease-out" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-black tabular-nums text-white">{score}</span>
            <span className={`text-sm font-semibold ${LEVEL_COLORS[levelKey]} mt-1`}>{level.label}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          <span className={`text-sm font-medium ${trendColor}`}>
            {change > 0 ? "+" : ""}{change} {t("trend")}
          </span>
        </div>

        {primaryDriver && (
          <div className="bg-zinc-950 rounded-xl px-4 py-3">
            <p className="text-xs text-zinc-500 mb-1">{t("driver")}</p>
            <p className="text-sm font-medium text-zinc-200">{primaryDriver}</p>
          </div>
        )}

        <div className="space-y-3 text-left">
          <CategoryBar label={t("categories.military")} value={68} color="bg-red-500" />
          <CategoryBar label={t("categories.diplomatic")} value={45} color="bg-blue-500" />
          <CategoryBar label={t("categories.conflict")} value={52} color="bg-orange-500" />
          <CategoryBar label={t("categories.economic")} value={35} color="bg-amber-500" />
          <CategoryBar label={t("categories.nuclear")} value={28} color="bg-purple-500" />
        </div>
      </div>
    </div>
  );
}

function CategoryBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="font-medium tabular-nums text-zinc-200">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
