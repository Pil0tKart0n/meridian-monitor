"use client";

import { useTranslations } from "next-intl";
import { relativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Crosshair, Handshake, TrendingUp, Heart, Atom, Shield,
  ExternalLink,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceCountry: string;
  category: string;
  region: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  tone: number;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Crosshair; color: string; bg: string }> = {
  MILITARY: { icon: Crosshair, color: "text-red-400", bg: "bg-red-950/50" },
  DIPLOMATIC: { icon: Handshake, color: "text-blue-400", bg: "bg-blue-950/50" },
  ECONOMIC: { icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-950/50" },
  HUMANITARIAN: { icon: Heart, color: "text-green-400", bg: "bg-green-950/50" },
  NUCLEAR: { icon: Atom, color: "text-purple-400", bg: "bg-purple-950/50" },
  CYBER: { icon: Shield, color: "text-cyan-400", bg: "bg-cyan-950/50" },
};

const REGION_LABELS: Record<string, string> = {
  GAZA: "Gaza",
  ISRAEL: "Israel",
  LEBANON: "Libanon",
  SYRIA: "Syrien",
  YEMEN: "Jemen",
  IRAN: "Iran",
  IRAQ: "Irak",
  RED_SEA: "Rotes Meer",
  GULF: "Golf",
  EUROPE: "Europa",
  GLOBAL: "Global",
};

export function NewsCard({ article }: { article: Article }) {
  const t = useTranslations("news");
  const config = CATEGORY_CONFIG[article.category] ?? CATEGORY_CONFIG.MILITARY;
  const Icon = config.icon;
  const toneColor = article.tone > 0 ? "text-green-400" : article.tone < -3 ? "text-red-400" : "text-amber-400";

  return (
    <article className="group rounded-xl bg-surface border border-border p-5 sm:p-6 hover:border-accent/20 transition-colors">
      <div className="flex gap-4">
        {/* Category Icon */}
        <div className={cn("shrink-0 rounded-lg p-2.5 h-fit", config.bg)}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Header: Source + Time */}
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="font-medium text-foreground/80">{article.source}</span>
            <span className="text-border">|</span>
            <span>{REGION_LABELS[article.region] ?? article.region}</span>
            <span className="text-border">|</span>
            <time dateTime={article.publishedAt}>
              {relativeTime(article.publishedAt)}
            </time>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold leading-snug group-hover:text-accent transition-colors">
            {article.url !== "#" ? (
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2">
                {article.title}
                <ExternalLink className="h-4 w-4 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ) : (
              article.title
            )}
          </h3>

          {/* Summary */}
          <p className="text-sm text-muted leading-relaxed line-clamp-2">
            {article.summary}
          </p>

          {/* Footer: Tone indicator */}
          <div className="flex items-center gap-4 text-xs text-muted pt-1">
            <span className={cn("font-mono", toneColor)}>
              Tone: {article.tone > 0 ? "+" : ""}{article.tone.toFixed(1)}
            </span>
            <span className="uppercase tracking-wider text-[10px] opacity-60">
              {article.sourceCountry}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
