import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, locale = "de-DE"): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(date: Date | string, locale = "de-DE"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function relativeTime(date: Date | string, locale = "de-DE"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffMin < 1) return rtf.format(0, "minute");
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  if (diffHours < 24) return rtf.format(-diffHours, "hour");
  return rtf.format(-diffDays, "day");
}

export function getEscalationLevel(score: number): {
  label: string;
  labelEn: string;
  color: string;
  bgColor: string;
} {
  if (score >= 81) return { label: "Kritisch", labelEn: "Critical", color: "text-red-600", bgColor: "bg-red-500" };
  if (score >= 61) return { label: "Schwer", labelEn: "Severe", color: "text-orange-600", bgColor: "bg-orange-500" };
  if (score >= 41) return { label: "Hoch", labelEn: "High", color: "text-amber-600", bgColor: "bg-amber-500" };
  if (score >= 21) return { label: "Erhoeht", labelEn: "Elevated", color: "text-yellow-600", bgColor: "bg-yellow-500" };
  return { label: "Niedrig", labelEn: "Low", color: "text-green-600", bgColor: "bg-green-500" };
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}
