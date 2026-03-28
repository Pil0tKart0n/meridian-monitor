"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, Mail, Lock, User, ArrowRight, Check } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registrierung fehlgeschlagen.");
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Konto erstellt, aber Auto-Login fehlgeschlagen. Bitte manuell anmelden.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Activity className="h-8 w-8 text-accent" />
            <span className="text-2xl font-bold">
              Meridian<span className="text-accent">Monitor</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-muted">Erstelle dein kostenloses Konto</p>
        </div>

        {/* Benefits */}
        <div className="rounded-xl bg-surface border border-border p-4 space-y-2">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Free-Konto beinhaltet</p>
          {["Nachrichten-Feed mit KI-Zusammenfassungen", "Aktueller Global Escalation Index", "Woechentlicher Intelligence-Briefing"].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-sm">
              <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
              <span className="text-muted">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-950/50 border border-red-900/50 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full rounded-xl bg-surface border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                placeholder="Dein Name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">E-Mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl bg-surface border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                placeholder="name@beispiel.de"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Passwort</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-xl bg-surface border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                placeholder="Mindestens 8 Zeichen"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent text-gray-950 py-3 text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Wird erstellt..." : "Kostenlos registrieren"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          Bereits registriert?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
