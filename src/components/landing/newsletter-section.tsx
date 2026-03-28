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
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 sm:p-12">
          <div className="inline-flex rounded-xl bg-orange-500/10 p-3 mb-6">
            <Mail className="h-6 w-6 text-orange-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">{t("title")}</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">{t("description")}</p>
          {submitted ? (
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-green-400 text-sm">
              Erfolgreich angemeldet!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("placeholder")} required className="flex-1 rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500" />
              <button type="submit" className="px-6 py-3 text-sm font-bold bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors whitespace-nowrap">{t("cta")}</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
