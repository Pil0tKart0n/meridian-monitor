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

export function EscalationGauge({
  score,
  change,
  primaryDriver,
  compact = false,
}: EscalationGaugeProps) {
  const t = useTranslations("gei");
  const level = getEscalationLevel(score);
  const percentage = Math.min(score, 100);

  const TrendIcon =
    change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendColor =
    change > 0 ? "text-red-400" : change < 0 ? "text-green-400" : "text-gray-400";

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-surface border border-border px-4 py-3">
        <div className="relative h-12 w-12">
          <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-border"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeWidth="3"
              strokeDasharray={`${percentage}, 100`}
              className={level.color}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
            {score}
          </span>
        </div>
        <div>
          <p className="text-xs text-muted">{t("title")}</p>
          <p className={`text-sm font-semibold ${level.color}`}>{level.label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface border border-border p-6 sm:p-8">
      <div className="text-center space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t("title")}</h2>
          <p className="text-sm text-muted mt-1">{t("subtitle")}</p>
        </div>

        {/* Gauge */}
        <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-border"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeWidth="2.5"
              strokeDasharray={`${percentage}, 100`}
              className={level.color}
              strokeLinecap="round"
              style={{
                transition: "stroke-dasharray 1s ease-out",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-bold tabular-nums">{score}</span>
            <span className={`text-sm font-semibold ${level.color} mt-1`}>
              {level.label}
            </span>
          </div>
        </div>

        {/* Trend */}
        <div className="flex items-center justify-center gap-2">
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          <span className={`text-sm font-medium ${trendColor}`}>
            {change > 0 ? "+" : ""}
            {change} {t("trend")}
          </span>
        </div>

        {/* Primary Driver */}
        {primaryDriver && (
          <div className="bg-background rounded-lg px-4 py-3">
            <p className="text-xs text-muted mb-1">{t("driver")}</p>
            <p className="text-sm font-medium">{primaryDriver}</p>
          </div>
        )}

        {/* Category Bars */}
        <div className="space-y-3 text-left">
          <CategoryBar label={t("categories.military")} value={68} maxValue={100} color="bg-red-500" />
          <CategoryBar label={t("categories.diplomatic")} value={45} maxValue={100} color="bg-amber-500" />
          <CategoryBar label={t("categories.conflict")} value={52} maxValue={100} color="bg-orange-500" />
          <CategoryBar label={t("categories.economic")} value={35} maxValue={100} color="bg-yellow-500" />
          <CategoryBar label={t("categories.nuclear")} value={28} maxValue={100} color="bg-purple-500" />
        </div>
      </div>
    </div>
  );
}

function CategoryBar({
  label,
  value,
  maxValue,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}) {
  const width = (value / maxValue) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
