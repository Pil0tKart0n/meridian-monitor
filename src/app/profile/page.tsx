"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { User, Mail, Crown, Shield } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-border rounded w-1/3" />
            <div className="h-4 bg-border rounded w-1/2" />
          </div>
        </main>
      </>
    );
  }

  if (!session?.user) return null;

  const user = session.user as Record<string, unknown>;
  const tier = (user.tier as string) ?? "FREE";

  const tierConfig: Record<string, { label: string; color: string; bg: string }> = {
    FREE: { label: "Free", color: "text-gray-400", bg: "bg-gray-900" },
    PREMIUM: { label: "Premium", color: "text-amber-400", bg: "bg-amber-950/30" },
    PROFESSIONAL: { label: "Professional", color: "text-purple-400", bg: "bg-purple-950/30" },
    ENTERPRISE: { label: "Enterprise", color: "text-blue-400", bg: "bg-blue-950/30" },
  };

  const tc = tierConfig[tier] ?? tierConfig.FREE;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <h1 className="text-2xl font-bold">Profil</h1>

          {/* User Info */}
          <div className="rounded-2xl bg-surface border border-border p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{session.user.name ?? "Nutzer"}</h2>
                <p className="text-sm text-muted flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {session.user.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-background border border-border p-4">
                <div className="flex items-center gap-2 text-sm text-muted mb-1">
                  <Crown className="h-4 w-4" />
                  Abo-Status
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full ${tc.bg} border border-current/20 px-3 py-1 text-sm font-medium ${tc.color}`}>
                  {tc.label}
                </span>
              </div>
              <div className="rounded-lg bg-background border border-border p-4">
                <div className="flex items-center gap-2 text-sm text-muted mb-1">
                  <Shield className="h-4 w-4" />
                  Konto-Typ
                </div>
                <p className="text-sm font-medium">E-Mail Authentifizierung</p>
              </div>
            </div>
          </div>

          {/* Upgrade CTA */}
          {tier === "FREE" && (
            <div className="rounded-2xl bg-gradient-to-r from-amber-950/30 to-orange-950/30 border border-amber-900/30 p-6 text-center space-y-4">
              <Crown className="h-8 w-8 text-accent mx-auto" />
              <div>
                <h3 className="text-lg font-bold">Upgrade auf Premium</h3>
                <p className="text-sm text-muted mt-1">
                  Echtzeit-Nachrichten, GEI-Verlauf, interaktive Konfliktkarte und mehr.
                </p>
              </div>
              <Link
                href="/pricing"
                className="inline-flex items-center px-6 py-3 bg-accent text-gray-950 rounded-xl font-semibold hover:bg-accent-hover transition-colors"
              >
                Preise ansehen
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
