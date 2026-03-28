"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { type Locale, locales } from "@/i18n/config";

const localeLabels: Record<Locale, string> = {
  de: "DE",
  en: "EN",
};

export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();

  function switchLocale() {
    const nextLocale = currentLocale === "de" ? "en" : "de";
    document.cookie = `locale=${nextLocale};path=/;max-age=31536000`;
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted hover:text-foreground transition-colors rounded-md hover:bg-surface-hover"
      aria-label={`Switch to ${currentLocale === "de" ? "English" : "Deutsch"}`}
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{localeLabels[currentLocale]}</span>
    </button>
  );
}
