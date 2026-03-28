"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

// Demo data — in production, this comes from the API
const breakingNews = [
  "Iran verstaerkt Marinepraesenz in der Strasse von Hormuz",
  "UN-Sicherheitsrat beruft Dringlichkeitssitzung zu Gaza ein",
  "Huthi-Milizen greifen erneut Handelsschiff im Roten Meer an",
  "NATO erhoeht Bereitschaftsstufe in der Ostflanke",
  "Oelpreis steigt um 4% nach Drohnenangriff auf Raffinerie",
];

export function BreakingTicker() {
  const t = useTranslations("news");

  return (
    <div className="bg-red-950/50 border-b border-red-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-2 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              {t("breaking")}
            </span>
          </div>
          <div className="overflow-hidden relative flex-1">
            <div className="animate-marquee flex gap-12 whitespace-nowrap">
              {[...breakingNews, ...breakingNews].map((item, i) => (
                <span key={i} className="text-sm text-red-200/80">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
