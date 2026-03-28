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

  const userTier = (session?.user as Record<string, unknown>)?.tier as string | undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Activity className="h-6 w-6 text-accent group-hover:text-accent-hover transition-colors" />
          <span className="text-lg font-bold tracking-tight">
            Meridian<span className="text-accent">Monitor</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm text-muted hover:text-foreground transition-colors rounded-md hover:bg-surface-hover"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />

          {session?.user ? (
            <div className="flex items-center gap-3">
              {userTier && userTier !== "FREE" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 border border-accent/30 px-2.5 py-1 text-xs font-medium text-accent">
                  <Crown className="h-3 w-3" />
                  {userTier}
                </span>
              )}
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground transition-colors rounded-md hover:bg-surface-hover"
              >
                <User className="h-4 w-4" />
                {session.user.name ?? session.user.email}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted hover:text-foreground transition-colors rounded-md hover:bg-surface-hover"
              >
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                {t("login")}
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium bg-accent text-gray-950 rounded-lg hover:bg-accent-hover transition-colors"
              >
                {t("signup")}
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 text-muted hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-surface-hover rounded-md"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border space-y-2">
            <LanguageSwitcher />
            {session?.user ? (
              <>
                <Link href="/profile" className="block px-3 py-2 text-sm text-muted hover:text-foreground" onClick={() => setMobileOpen(false)}>
                  {t("profile")}
                </Link>
                <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="block px-3 py-2 text-sm text-muted hover:text-foreground w-full text-left">
                  {t("logout")}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="px-3 py-2 text-sm text-muted" onClick={() => setMobileOpen(false)}>{t("login")}</Link>
                <Link href="/signup" className="px-4 py-2 text-sm font-medium bg-accent text-gray-950 rounded-lg" onClick={() => setMobileOpen(false)}>{t("signup")}</Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
