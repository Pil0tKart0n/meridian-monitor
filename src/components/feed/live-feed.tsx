"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  MessageCircle, Share2, Bookmark, ThumbsUp,
  Play, Eye, ExternalLink, RotateCw, Verified,
} from "lucide-react";

type PostType = "breaking" | "analysis" | "video" | "meme" | "alert" | "osint";

interface FeedPost {
  id: string;
  type: PostType;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  media?: {
    type: "image" | "video" | "map";
    url: string;
    thumbnail?: string;
    duration?: string;
    views?: string;
  };
  tags: string[];
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  bookmarked: boolean;
  liked: boolean;
  source?: string;
  priority: "urgent" | "high" | "normal";
}

const POST_TYPE_CONFIG: Record<PostType, { label: string; color: string; bg: string }> = {
  breaking: { label: "BREAKING", color: "text-red-400", bg: "bg-red-500/10" },
  analysis: { label: "ANALYSE", color: "text-blue-400", bg: "bg-blue-500/10" },
  video: { label: "VIDEO", color: "text-purple-400", bg: "bg-purple-500/10" },
  meme: { label: "MEME", color: "text-amber-400", bg: "bg-amber-500/10" },
  alert: { label: "ALERT", color: "text-orange-400", bg: "bg-orange-500/10" },
  osint: { label: "OSINT", color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

const DEMO_POSTS: FeedPost[] = [
  {
    id: "1",
    type: "breaking",
    author: { name: "Meridian Monitor", handle: "@meridian", avatar: "🔴", verified: true },
    content: "BREAKING: Iranische IRGC-Schnellboote haben ein Containerschiff im Persischen Golf abgefangen. US Navy 5th Fleet ist in erhoehter Alarmbereitschaft. Strait of Hormuz Passage temporaer eingeschraenkt.\n\nDer GEI ist in den letzten 30 Minuten um 4 Punkte gestiegen.",
    tags: ["Iran", "USNavy", "Hormuz"],
    timestamp: "vor 12 Min",
    likes: 2847,
    comments: 342,
    shares: 1203,
    bookmarked: false,
    liked: false,
    source: "OSINT / Ship Tracking",
    priority: "urgent",
  },
  {
    id: "2",
    type: "video",
    author: { name: "Frontline Intel", handle: "@frontline_intel", avatar: "🎯", verified: true },
    content: "Neue Drohnenaufnahmen aus dem suedlichen Libanon zeigen massive Hisbollah-Stellungen die in den letzten 48h errichtet wurden. Die IDF hat bisher nicht reagiert.\n\n⚠️ Grafische Inhalte",
    media: {
      type: "video",
      url: "#",
      thumbnail: "https://placehold.co/640x360/0a0a0a/ef4444?text=🔴+LIVE+FOOTAGE+—+South+Lebanon",
      duration: "2:34",
      views: "847K",
    },
    tags: ["Libanon", "Hisbollah", "IDF"],
    timestamp: "vor 28 Min",
    likes: 5621,
    comments: 892,
    shares: 3401,
    bookmarked: false,
    liked: true,
    priority: "high",
  },
  {
    id: "3",
    type: "osint",
    author: { name: "OSINT Tracker", handle: "@osint_track", avatar: "🛰️", verified: true },
    content: "Satellitenbilder zeigen neue Aktivitaet an Irans Natanz-Anlage. Mindestens 3 neue Gebaeude seit letztem Monat. IAEA hat bisher keinen Zugang zu den neuen Bereichen erhalten.\n\nBild: Planet Labs, 28. Maerz 2026",
    media: {
      type: "image",
      url: "https://placehold.co/640x400/0a0a1e/a855f7?text=🛰️+SATELLITE+—+Natanz+Facility+2026",
    },
    tags: ["Iran", "Nuklear", "IAEA", "Satellite"],
    timestamp: "vor 1 Std",
    likes: 3210,
    comments: 445,
    shares: 1876,
    bookmarked: true,
    liked: false,
    source: "Planet Labs",
    priority: "high",
  },
  {
    id: "4",
    type: "meme",
    author: { name: "GeoPol Memes", handle: "@geopol_memes", avatar: "😂", verified: false },
    content: "NATO-Sprecher: 'Wir sind zutiefst besorgt'\n\nDie Welt: 'Und was macht ihr jetzt?'\n\nNATO-Sprecher: 'Wir haben eine Pressekonferenz angesetzt um unsere tiefe Besorgnis auszudruecken'",
    media: {
      type: "image",
      url: "https://placehold.co/640x480/0a1a2e/0ea5e9?text=😐+DEEPLY+CONCERNED+%234782",
    },
    tags: ["NATO", "Satire"],
    timestamp: "vor 2 Std",
    likes: 12450,
    comments: 1893,
    shares: 5621,
    bookmarked: false,
    liked: false,
    priority: "normal",
  },
  {
    id: "5",
    type: "video",
    author: { name: "Drone Warfare", handle: "@drone_war", avatar: "🤖", verified: true },
    content: "FPV-Drohne trifft russischen T-72 Panzer in der Naehe von Avdiivka. Die Drohne kostete ~400$, der Panzer 3 Mio$.\n\nDie Zukunft der Kriegsfuehrung in 30 Sekunden.\n\n⚠️ Grafisch",
    media: {
      type: "video",
      url: "#",
      thumbnail: "https://placehold.co/640x360/0a0a0a/22c55e?text=🤖+FPV+DRONE+STRIKE+—+Avdiivka",
      duration: "0:31",
      views: "2.1M",
    },
    tags: ["Ukraine", "Drohnen", "FPV"],
    timestamp: "vor 3 Std",
    likes: 34200,
    comments: 4521,
    shares: 12800,
    bookmarked: false,
    liked: true,
    priority: "normal",
  },
  {
    id: "6",
    type: "analysis",
    author: { name: "Meridian Monitor", handle: "@meridian", avatar: "🔴", verified: true },
    content: "ANALYSE: Warum der Huthi-Angriff auf die MSC Mediterranean III eine neue Eskalationsstufe darstellt:\n\n1. Erstmals Einsatz einer ballistischen Anti-Schiff-Rakete\n2. Trefferquote hat sich verdreifacht seit Januar\n3. Versicherungspraemien fuer Rotes Meer +400%\n4. 12% des Welthandels betroffen\n\nDer GEI-Subindex 'Economic Stress' steht bei 78/100.",
    tags: ["Huthis", "RotesMeer", "Wirtschaft"],
    timestamp: "vor 4 Std",
    likes: 8930,
    comments: 1234,
    shares: 4560,
    bookmarked: true,
    liked: false,
    source: "Meridian Analysis Desk",
    priority: "high",
  },
  {
    id: "7",
    type: "alert",
    author: { name: "Tzeva Adom Bot", handle: "@tzevaadom", avatar: "🚨", verified: true },
    content: "🚨 RAKETENALARM — Nordisrael\n\nSirenen in: Kiryat Shmona, Metula, Kfar Giladi\nQuelle: Suedlibanon (Hisbollah)\nTyp: Kurzstreckenrakete\nIron Dome: Aktiviert\n\nBevoelkerung in Schutzraeumen.",
    tags: ["Israel", "Hisbollah", "IronDome"],
    timestamp: "vor 5 Std",
    likes: 1520,
    comments: 234,
    shares: 890,
    bookmarked: false,
    liked: false,
    priority: "urgent",
  },
  {
    id: "8",
    type: "video",
    author: { name: "Naval Watch", handle: "@naval_watch", avatar: "⚓", verified: false },
    content: "USS Dwight D. Eisenhower Traegergruppe passiert Suezkanal Richtung Rotes Meer. Begleitet von 2 Zerstoerern und 1 U-Boot.\n\nDas ist die dritte US-Traegergruppe im Nahen Osten seit Oktober.",
    media: {
      type: "video",
      url: "#",
      thumbnail: "https://placehold.co/640x360/0a0a1a/3b82f6?text=⚓+USS+EISENHOWER+—+Suez+Transit",
      duration: "1:12",
      views: "1.3M",
    },
    tags: ["USNavy", "Suezkanal", "Carrier"],
    timestamp: "vor 6 Std",
    likes: 7840,
    comments: 923,
    shares: 3200,
    bookmarked: false,
    liked: false,
    priority: "normal",
  },
];

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export function LiveFeed() {
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [filter, setFilter] = useState<PostType | "all">("all");

  function toggleLike(id: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  }

  function toggleBookmark(id: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, bookmarked: !p.bookmarked } : p))
    );
  }

  const filtered = filter === "all" ? posts : posts.filter((p) => p.type === filter);

  const FILTERS: { key: PostType | "all"; label: string }[] = [
    { key: "all", label: "Alle" },
    { key: "breaking", label: "Breaking" },
    { key: "video", label: "Videos" },
    { key: "osint", label: "OSINT" },
    { key: "analysis", label: "Analyse" },
    { key: "alert", label: "Alerts" },
    { key: "meme", label: "Memes" },
  ];

  return (
    <div className="space-y-0">
      {/* Filter tabs */}
      <div className="sticky top-16 z-30 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800">
        <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors",
                filter === f.key
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              )}
            >
              {f.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPosts([...DEMO_POSTS])}
            className="ml-auto p-1.5 text-zinc-500 hover:text-white transition-colors"
            aria-label="Feed aktualisieren"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="divide-y divide-zinc-800/50">
        {filtered.map((post) => {
          const typeConfig = POST_TYPE_CONFIG[post.type];

          return (
            <article
              key={post.id}
              className={cn(
                "px-4 py-4 hover:bg-zinc-900/50 transition-colors cursor-pointer",
                post.priority === "urgent" && "border-l-2 border-l-red-500 bg-red-500/[0.02]",
                post.priority === "high" && "border-l-2 border-l-orange-500/50",
              )}
            >
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-lg">
                    {post.author.avatar}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Author line */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-white truncate">{post.author.name}</span>
                    {post.author.verified && <Verified className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                    <span className="text-sm text-zinc-600">{post.author.handle}</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-sm text-zinc-600">{post.timestamp}</span>
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-auto shrink-0", typeConfig.color, typeConfig.bg)}>
                      {typeConfig.label}
                    </span>
                  </div>

                  {/* Text */}
                  <p className="text-sm text-zinc-200 mt-1.5 whitespace-pre-line leading-relaxed">{post.content}</p>

                  {/* Source */}
                  {post.source && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <ExternalLink className="h-3 w-3 text-zinc-600" />
                      <span className="text-[11px] text-zinc-600">{post.source}</span>
                    </div>
                  )}

                  {/* Media */}
                  {post.media && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-zinc-800 relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.media.thumbnail ?? post.media.url}
                        alt=""
                        className="w-full object-cover max-h-[360px]"
                        loading="lazy"
                      />
                      {post.media.type === "video" && (
                        <>
                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Play className="h-6 w-6 text-black ml-1" fill="black" />
                            </div>
                          </div>
                          {/* Duration + Views */}
                          <div className="absolute bottom-2 left-2 flex items-center gap-2">
                            {post.media.duration && (
                              <span className="text-[11px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded">
                                {post.media.duration}
                              </span>
                            )}
                          </div>
                          {post.media.views && (
                            <div className="absolute bottom-2 right-2 flex items-center gap-1">
                              <Eye className="h-3 w-3 text-white/80" />
                              <span className="text-[11px] font-medium text-white/80">{post.media.views}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs text-blue-400 hover:underline cursor-pointer">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions bar */}
                  <div className="flex items-center justify-between mt-3 max-w-md">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-zinc-600 hover:text-blue-400 transition-colors group/action"
                      aria-label={`${post.comments} Kommentare`}
                    >
                      <MessageCircle className="h-4 w-4 group-hover/action:bg-blue-400/10 rounded-full" />
                      <span className="text-xs">{formatCount(post.comments)}</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-zinc-600 hover:text-green-400 transition-colors group/action"
                      aria-label={`${post.shares} mal geteilt`}
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="text-xs">{formatCount(post.shares)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLike(post.id)}
                      className={cn(
                        "flex items-center gap-1.5 transition-colors",
                        post.liked ? "text-red-500" : "text-zinc-600 hover:text-red-400"
                      )}
                      aria-label={`${post.likes} Likes`}
                    >
                      <ThumbsUp className={cn("h-4 w-4", post.liked && "fill-current")} />
                      <span className="text-xs">{formatCount(post.likes)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(post.id)}
                      className={cn(
                        "transition-colors",
                        post.bookmarked ? "text-blue-400" : "text-zinc-600 hover:text-blue-400"
                      )}
                      aria-label="Bookmark"
                    >
                      <Bookmark className={cn("h-4 w-4", post.bookmarked && "fill-current")} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
