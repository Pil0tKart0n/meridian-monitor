"use client";

import Link from "next/link";
import { TrendingUp, Flame, ArrowRight, Radio, MapPin, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

const TRENDING = [
  { rank: 1, topic: "Strait of Hormuz", posts: "24.3K", category: "Militaer", hot: true },
  { rank: 2, topic: "Iron Dome", posts: "18.7K", category: "Technik", hot: true },
  { rank: 3, topic: "Huthi Red Sea", posts: "15.2K", category: "Wirtschaft", hot: false },
  { rank: 4, topic: "FPV Drohnen", posts: "12.8K", category: "Ukraine", hot: false },
  { rank: 5, topic: "IAEA Iran", posts: "9.4K", category: "Nuklear", hot: false },
  { rank: 6, topic: "USS Eisenhower", posts: "7.1K", category: "USNavy", hot: false },
];

const LIVE_ZONES = [
  { name: "Gaza", status: "active", color: "bg-red-500" },
  { name: "Sued-Libanon", status: "active", color: "bg-red-500" },
  { name: "Rotes Meer", status: "active", color: "bg-orange-500" },
  { name: "Hormuz", status: "contested", color: "bg-amber-500" },
  { name: "Ostukraine", status: "active", color: "bg-red-500" },
];

export function SidebarTrending() {
  return (
    <div className="space-y-4">
      {/* Live Zones */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-red-500" />
          <span className="text-sm font-bold">Live Konfliktzonen</span>
          <span className="relative flex h-2 w-2 ml-auto">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        </div>
        <div className="p-3 space-y-1.5">
          {LIVE_ZONES.map((zone) => (
            <Link
              key={zone.name}
              href="/map"
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors group"
            >
              <span className={cn("h-2 w-2 rounded-full shrink-0", zone.color)} />
              <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{zone.name}</span>
              <MapPin className="h-3 w-3 text-zinc-700 ml-auto" />
            </Link>
          ))}
          <Link href="/map" className="flex items-center gap-1 px-2 pt-2 text-xs text-blue-400 hover:text-blue-300 font-medium">
            Karte oeffnen <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Trending */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-bold">Trending</span>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {TRENDING.map((item) => (
            <div key={item.rank} className="px-4 py-2.5 hover:bg-zinc-800/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-600">{item.rank}</span>
                <span className="text-[10px] text-zinc-500">{item.category}</span>
                {item.hot && <Flame className="h-3 w-3 text-orange-500" />}
              </div>
              <p className="text-sm font-bold text-white mt-0.5">{item.topic}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">{item.posts} Posts</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 space-y-2">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Quick Links</p>
        <Link href="/memes" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <Radio className="h-3.5 w-3.5 text-purple-400" />
          Memes & Telegram
        </Link>
        <Link href="/economy" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <TrendingUp className="h-3.5 w-3.5 text-green-400" />
          Wirtschaft & Maerkte
        </Link>
        <Link href="/methodology" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <Crosshair className="h-3.5 w-3.5 text-orange-400" />
          GEI Methodik
        </Link>
      </div>

      {/* Footer */}
      <div className="px-4 text-[10px] text-zinc-700 space-y-1">
        <p>Meridian Monitor — Geopolitische Intelligence</p>
        <p>Daten: GDELT, ACLED, 30+ RSS, OpenAI</p>
        <p>&copy; 2026 Meridian Monitor</p>
      </div>
    </div>
  );
}
