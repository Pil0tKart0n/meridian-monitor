"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { NewsCard } from "./news-card";
import { Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Article {
  id: string; title: string; summary: string; source: string; sourceCountry: string;
  category: string; region: string; url: string; imageUrl: string | null; publishedAt: string; tone: number;
}

const CATEGORIES = [
  { key: "all", labelKey: "all" }, { key: "MILITARY", labelKey: "military" }, { key: "DIPLOMATIC", labelKey: "diplomatic" },
  { key: "ECONOMIC", labelKey: "economic" }, { key: "HUMANITARIAN", labelKey: "humanitarian" }, { key: "NUCLEAR", labelKey: "nuclear" },
] as const;

const REGIONS = [
  { key: "all", labelKey: "all" }, { key: "GAZA", labelKey: "gaza" }, { key: "ISRAEL", labelKey: "israel" },
  { key: "LEBANON", labelKey: "lebanon" }, { key: "SYRIA", labelKey: "syria" }, { key: "YEMEN", labelKey: "yemen" },
  { key: "IRAN", labelKey: "iran" }, { key: "RED_SEA", labelKey: "redSea" }, { key: "EUROPE", labelKey: "europe" },
] as const;

export function NewsFeed() {
  const t = useTranslations("news");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== "all") params.set("category", category);
        if (region !== "all") params.set("region", region);
        const res = await fetch(`/api/news?${params.toString()}`);
        if (!res.ok) {
          console.error("[NewsFeed] HTTP", res.status);
          return;
        }
        const json = await res.json();
        setArticles(json.data ?? []);
      } catch (error) {
        console.error("[NewsFeed] Fetch failed:", error instanceof Error ? error.message : "Unknown");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category, region]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">{t("title")}</h1>
        <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />{t("latest")}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat.key} type="button" onClick={() => setCategory(cat.key)} className={cn(
              "px-3 py-1.5 text-sm rounded-lg border transition-colors",
              category === cat.key ? "bg-orange-500 text-white border-orange-500 font-semibold" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
            )}>
              {t(`filters.${cat.labelKey}`)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Filter className="h-4 w-4 text-zinc-600 mt-1.5" />
          {REGIONS.map((reg) => (
            <button key={reg.key} type="button" onClick={() => setRegion(reg.key)} className={cn(
              "px-3 py-1.5 text-xs rounded-lg border transition-colors",
              region === reg.key ? "bg-zinc-800 text-white border-zinc-700 font-medium" : "bg-transparent border-zinc-800 text-zinc-500 hover:text-white"
            )}>
              {t(`regions.${reg.labelKey}`)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-3/4 mb-3" />
              <div className="h-3 bg-zinc-800 rounded w-full mb-2" />
              <div className="h-3 bg-zinc-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16"><p className="text-zinc-500">{t("noResults")}</p></div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => {
            const publishedTime = new Date(article.publishedAt).getTime();
            const recent = (Date.now() - publishedTime) < 3600000;
            return <NewsCard key={article.id} article={article} isRecent={recent} />;
          })}
        </div>
      )}
    </div>
  );
}
