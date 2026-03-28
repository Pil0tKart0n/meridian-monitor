"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Activity } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800 bg-zinc-900/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              <span className="font-bold">Meridian<span className="text-orange-500">Monitor</span></span>
            </div>
            <p className="text-sm text-zinc-500 max-w-xs">Datengetriebene geopolitische Analyse. Ein Index. Alle Perspektiven.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Produkt</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link href="/news" className="hover:text-white transition-colors">Nachrichten</Link></li>
              <li><Link href="/map" className="hover:text-white transition-colors">Konfliktkarte</Link></li>
              <li><Link href="/memes" className="hover:text-white transition-colors">Memes</Link></li>
              <li><Link href="/economy" className="hover:text-white transition-colors">Wirtschaft</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Transparenz</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link href="/methodology" className="hover:text-white transition-colors">{t("methodology")}</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Preise</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Rechtliches</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link href="/privacy" className="hover:text-white transition-colors">{t("privacy")}</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">{t("terms")}</Link></li>
              <li><Link href="/imprint" className="hover:text-white transition-colors">{t("imprint")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-zinc-800 text-center text-sm text-zinc-600">
          &copy; {year} {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
