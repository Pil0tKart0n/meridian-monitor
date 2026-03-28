"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { NewsCard } from "./news-card";
import { Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

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

const CATEGORIES = [
  { key: "all", labelKey: "all" },
  { key: "MILITARY", labelKey: "military" },
  { key: "DIPLOMATIC", labelKey: "diplomatic" },
  { key: "ECONOMIC", labelKey: "economic" },
  { key: "HUMANITARIAN", labelKey: "humanitarian" },
  { key: "NUCLEAR", labelKey: "nuclear" },
] as const;

const REGIONS = [
  { key: "all", labelKey: "all" },
  { key: "GAZA", labelKey: "gaza" },
  { key: "ISRAEL", labelKey: "israel" },
  { key: "LEBANON", labelKey: "lebanon" },
  { key: "SYRIA", labelKey: "syria" },
  { key: "YEMEN", labelKey: "yemen" },
  { key: "IRAN", labelKey: "iran" },
  { key: "RED_SEA", labelKey: "redSea" },
  { key: "EUROPE", labelKey: "europe" },
] as const;

export function NewsFeed() {
  const t = useTranslations("news");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("all");

  useEffect(() => {
    fetchArticles();
  }, [category, region]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (region !== "all") params.set("region", region);

      const res = await fetch(`/api/news?${params.toString()}`);
      const json = await res.json();
      setArticles(json.data ?? []);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {t("latest")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setCategory(cat.key)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                category === cat.key
                  ? "bg-accent text-gray-950 border-accent font-medium"
                  : "bg-surface border-border text-muted hover:text-foreground hover:border-accent/30"
              )}
            >
              {t(`filters.${cat.labelKey}`)}
            </button>
          ))}
        </div>

        {/* Region Filter */}
        <div className="flex flex-wrap gap-2">
          <Filter className="h-4 w-4 text-muted mt-1.5" />
          {REGIONS.map((reg) => (
            <button
              key={reg.key}
              type="button"
              onClick={() => setRegion(reg.key)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-lg border transition-colors",
                region === reg.key
                  ? "bg-surface-hover text-foreground border-accent/30 font-medium"
                  : "bg-transparent border-border text-muted hover:text-foreground"
              )}
            >
              {t(`regions.${reg.labelKey}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-surface border border-border p-6 animate-pulse">
              <div className="h-4 bg-border rounded w-3/4 mb-3" />
              <div className="h-3 bg-border rounded w-full mb-2" />
              <div className="h-3 bg-border rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted">{t("noResults")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
