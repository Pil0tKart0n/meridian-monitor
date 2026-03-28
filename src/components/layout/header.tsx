"use client";

import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Activity, Menu, X, User, LogOut, Crown } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const t = useTranslations("nav");
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/news", label: t("news") },
    { href: "/map", label: t("map") },
    { href: "/memes", label: "Memes" },
    { href: "/economy", label: t("economy") },
    { href: "/pricing", label: t("pricing") },
  ];

  const userTier = (session?.user as unknown as Record<string, unknown>)?.tier as string | undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <Activity className="h-6 w-6 text-orange-500 group-hover:text-orange-400 transition-colors" />
          <span className="text-lg font-bold tracking-tight">
            Meridian<span className="text-orange-500">Monitor</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          {session?.user ? (
            <div className="flex items-center gap-3">
              {userTier && userTier !== "FREE" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 text-xs font-medium text-orange-400">
                  <Crown className="h-3 w-3" />
                  {userTier}
                </span>
              )}
              <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/50">
                <User className="h-4 w-4" />
                {session.user.name ?? session.user.email}
              </Link>
              <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/50">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors">{t("login")}</Link>
              <Link href="/signup" className="px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">{t("signup")}</Link>
            </>
          )}
        </div>

        <button type="button" className="md:hidden p-2 text-zinc-400 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" aria-expanded={mobileOpen}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg" onClick={() => setMobileOpen(false)}>{item.label}</Link>
          ))}
          <div className="pt-3 border-t border-zinc-800 flex items-center gap-3">
            <LanguageSwitcher />
            {!session?.user && (
              <>
                <Link href="/login" className="px-3 py-2 text-sm text-zinc-400" onClick={() => setMobileOpen(false)}>{t("login")}</Link>
                <Link href="/signup" className="px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg" onClick={() => setMobileOpen(false)}>{t("signup")}</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
