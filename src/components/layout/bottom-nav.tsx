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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[56px]", isActive ? "text-orange-500" : "text-zinc-500 hover:text-zinc-300")}>
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
