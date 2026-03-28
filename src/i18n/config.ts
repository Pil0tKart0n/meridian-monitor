export const locales = ["de", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "de";

export function getMessages(locale: Locale) {
  return import(`./messages/${locale}.json`).then((m) => m.default);
}
