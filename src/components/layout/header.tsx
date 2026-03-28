"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { Activity, Globe, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/news", label: t("news") },
    { href: "/map", label: t("map") },
    { href: "/economy", label: t("economy") },
    { href: "/pricing", label: t("pricing") },
  ];

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
          <div className="pt-3 border-t border-border flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="px-3 py-2 text-sm text-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {t("login")}
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium bg-accent text-gray-950 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              {t("signup")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
