"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Activity } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              <span className="font-bold">
                Meridian<span className="text-accent">Monitor</span>
              </span>
            </div>
            <p className="text-sm text-muted max-w-xs">
              Datengetriebene geopolitische Analyse. Ein Index. Alle Perspektiven.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Produkt</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/news" className="hover:text-foreground transition-colors">Nachrichten</Link></li>
              <li><Link href="/map" className="hover:text-foreground transition-colors">Konfliktkarte</Link></li>
              <li><Link href="/economy" className="hover:text-foreground transition-colors">Wirtschaft</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Preise</Link></li>
            </ul>
          </div>

          {/* Transparency */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Transparenz</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/methodology" className="hover:text-foreground transition-colors">{t("methodology")}</Link></li>
              <li><Link href="/sources" className="hover:text-foreground transition-colors">{t("sources")}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Rechtliches</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">{t("privacy")}</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">{t("terms")}</Link></li>
              <li><Link href="/imprint" className="hover:text-foreground transition-colors">{t("imprint")}</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">{t("contact")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted">
          &copy; {year} {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
