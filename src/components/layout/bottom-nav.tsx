"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Newspaper, Map, Smile, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Activity, label: "Home" },
  { href: "/news", icon: Newspaper, label: "News" },
  { href: "/map", icon: Map, label: "Karte" },
  { href: "/memes", icon: Smile, label: "Memes" },
  { href: "/profile", icon: User, label: "Profil" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-white/[0.06] bg-background/90 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[56px]",
                isActive
                  ? "text-accent"
                  : "text-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "fill-accent/20")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
