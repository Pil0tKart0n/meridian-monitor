"use client";

import { relativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Crosshair, Handshake, TrendingUp, Heart, Atom, Shield, ExternalLink, Clock, Newspaper } from "lucide-react";

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

const CATEGORY_CONFIG: Record<string, { icon: typeof Crosshair; color: string; border: string; label: string }> = {
  MILITARY: { icon: Crosshair, color: "text-red-400", border: "border-l-red-500", label: "Militaer" },
  DIPLOMATIC: { icon: Handshake, color: "text-blue-400", border: "border-l-blue-500", label: "Diplomatie" },
  ECONOMIC: { icon: TrendingUp, color: "text-amber-400", border: "border-l-amber-500", label: "Wirtschaft" },
  HUMANITARIAN: { icon: Heart, color: "text-emerald-400", border: "border-l-emerald-500", label: "Humanitaer" },
  NUCLEAR: { icon: Atom, color: "text-purple-400", border: "border-l-purple-500", label: "Nuklear" },
  CYBER: { icon: Shield, color: "text-cyan-400", border: "border-l-cyan-500", label: "Cyber" },
  UNCATEGORIZED: { icon: Newspaper, color: "text-zinc-400", border: "border-l-zinc-600", label: "Sonstiges" },
};

const REGION_LABELS: Record<string, string> = {
  GAZA: "Gaza", ISRAEL: "Israel", LEBANON: "Libanon", SYRIA: "Syrien",
  YEMEN: "Jemen", IRAN: "Iran", RED_SEA: "Rotes Meer", EUROPE: "Europa", GLOBAL: "Global",
};

const SOURCE_FLAGS: Record<string, string> = {
  US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", IL: "🇮🇱", QA: "🇶🇦", SA: "🇸🇦", FR: "🇫🇷", CN: "🇨🇳", RU: "🇷🇺", INT: "🌐",
};

export function NewsCard({ article }: { article: Article }) {
  const config = CATEGORY_CONFIG[article.category] ?? CATEGORY_CONFIG.UNCATEGORIZED;
  const flag = SOURCE_FLAGS[article.sourceCountry] ?? "🌐";
  const isRecent = (Date.now() - new Date(article.publishedAt).getTime()) < 3600000;
  const threatLevel = Math.min(5, Math.max(1, Math.ceil(Math.abs(article.tone) / 2) || 2));

  const cleanSummary = article.summary?.replace(/<[^>]*>/g, "")?.replace(/\s+/g, " ")?.trim() || "";

  return (
    <article className={cn(
      "rounded-2xl bg-zinc-900 border border-zinc-800 border-l-[3px] p-5",
      config.border,
      "hover:border-zinc-700 transition-colors",
      isRecent && "ring-1 ring-orange-500/20"
    )}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("text-[10px] font-bold uppercase tracking-widest", config.color)}>{config.label}</span>
            {article.region && article.region !== "GLOBAL" && (
              <>
                <span className="text-zinc-700">·</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{REGION_LABELS[article.region] ?? article.region}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isRecent && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="h-3 w-3" />
              {relativeTime(article.publishedAt)}
            </span>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-bold leading-snug tracking-tight text-white">
          {article.url !== "#" ? (
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="group/link flex items-start gap-2 hover:text-orange-400 transition-colors">
              {article.title}
              <ExternalLink className="h-4 w-4 shrink-0 mt-1 opacity-0 group-hover/link:opacity-100 transition-opacity text-zinc-500" />
            </a>
          ) : article.title}
        </h3>

        {cleanSummary && <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">{cleanSummary}</p>}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">{flag}</span>
            <span className="text-xs font-medium text-zinc-300">{article.source}</span>
          </div>
          <div className="flex items-center gap-0.5" title={`Intensitaet: ${threatLevel}/5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn("h-1.5 w-1.5 rounded-full", i < threatLevel ? "bg-red-500" : "bg-zinc-800")} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
