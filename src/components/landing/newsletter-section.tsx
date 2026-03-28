"use client";

import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { useState } from "react";

export function NewsletterSection() {
  const t = useTranslations("landing.newsletter");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-2xl bg-surface border border-border p-8 sm:p-12">
          <div className="inline-flex rounded-xl bg-amber-950/30 p-3 mb-6">
            <Mail className="h-6 w-6 text-accent" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            {t("title")}
          </h2>
          <p className="text-muted mb-8 max-w-md mx-auto">
            {t("description")}
          </p>

          {submitted ? (
            <div className="rounded-lg bg-green-950/30 border border-green-900/50 px-4 py-3 text-green-400 text-sm">
              Erfolgreich angemeldet. Du erhaeltst deinen ersten Briefing diese Woche.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("placeholder")}
                required
                className="flex-1 rounded-xl bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
              <button
                type="submit"
                className="px-6 py-3 text-sm font-semibold bg-accent text-gray-950 rounded-xl hover:bg-accent-hover transition-colors whitespace-nowrap"
              >
                {t("cta")}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
