"use client";

import { useState } from "react";
import { Flame, Clock, TrendingUp, ThumbsUp, MessageCircle, Share2, Smile, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Meme {
  id: string;
  title: string;
  imageUrl: string;
  author: string;
  likes: number;
  comments: number;
  createdAt: string;
  tags: string[];
  liked: boolean;
}

const DEMO_MEMES: Meme[] = [
  {
    id: "1",
    title: "Wenn der UN-Sicherheitsrat mal wieder ein Veto einlegt",
    imageUrl: "https://placehold.co/600x500/1a1a2e/f59e0b?text=UN+Veto+%F0%9F%99%84&font=montserrat",
    author: "DiplomacyDave",
    likes: 847,
    comments: 63,
    createdAt: "2h",
    tags: ["UN", "Diplomatie"],
    liked: false,
  },
  {
    id: "2",
    title: "Oelpreis-Trader wenn Huthi-Milizen ein Schiff angreifen",
    imageUrl: "https://placehold.co/600x600/1a1a2e/ef4444?text=%F0%9F%93%88+Oil+go+brrr&font=montserrat",
    author: "PetroDollarPete",
    likes: 1243,
    comments: 89,
    createdAt: "5h",
    tags: ["Wirtschaft", "Rotes Meer"],
    liked: true,
  },
  {
    id: "3",
    title: "IAEA-Inspektoren auf dem Weg nach Iran",
    imageUrl: "https://placehold.co/600x500/1a1a2e/a855f7?text=IAEA+%E2%98%A2%EF%B8%8F&font=montserrat",
    author: "NuklearNerd",
    likes: 556,
    comments: 42,
    createdAt: "12h",
    tags: ["Nuklear", "Iran"],
    liked: false,
  },
  {
    id: "4",
    title: "NATO: 'Wir sind sehr besorgt' — zum 47. Mal diese Woche",
    imageUrl: "https://placehold.co/600x500/1a1a2e/0ea5e9?text=NATO+concerns+%F0%9F%98%90&font=montserrat",
    author: "BrusselsInsider",
    likes: 2103,
    comments: 156,
    createdAt: "1d",
    tags: ["NATO", "Diplomatie"],
    liked: false,
  },
  {
    id: "5",
    title: "Wenn dein Prepper-Freund zum 3. Mal diese Woche recht hat",
    imageUrl: "https://placehold.co/600x600/1a1a2e/22c55e?text=Prepper+wins+%F0%9F%8F%86&font=montserrat",
    author: "SurvivalSteve",
    likes: 3421,
    comments: 234,
    createdAt: "1d",
    tags: ["Community", "Humor"],
    liked: true,
  },
  {
    id: "6",
    title: "VIX Fear Index vs. mein Portfolio",
    imageUrl: "https://placehold.co/600x500/1a1a2e/eab308?text=VIX+vs+Portfolio+%F0%9F%92%80&font=montserrat",
    author: "WallStreetWarrior",
    likes: 1876,
    comments: 98,
    createdAt: "2d",
    tags: ["Wirtschaft", "Boerse"],
    liked: false,
  },
];

const SORT_OPTIONS = [
  { key: "hot", label: "Hot", icon: Flame },
  { key: "new", label: "Neu", icon: Clock },
  { key: "top", label: "Top", icon: TrendingUp },
] as const;

const TAG_FILTERS = ["Alle", "Diplomatie", "Militaer", "Wirtschaft", "Nuklear", "Community", "NATO", "Iran"];

export function MemeGallery() {
  const [sort, setSort] = useState<string>("hot");
  const [activeTag, setActiveTag] = useState("Alle");
  const [memes, setMemes] = useState(DEMO_MEMES);

  function toggleLike(id: string) {
    setMemes((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, liked: !m.liked, likes: m.liked ? m.likes - 1 : m.likes + 1 }
          : m
      )
    );
  }

  function formatLikes(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return String(n);
  }

  const filtered = activeTag === "Alle" ? memes : memes.filter((m) => m.tags.includes(activeTag));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
            <Smile className="h-7 w-7 text-accent" />
            Memes
          </h1>
          <p className="text-sm text-muted mt-1">Geopolitischer Humor aus der Community</p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 bg-surface rounded-xl p-1 border border-border">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSort(opt.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors",
                sort === opt.key
                  ? "bg-accent text-background font-semibold"
                  : "text-muted hover:text-foreground"
              )}
            >
              <opt.icon className="h-3.5 w-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2">
        <Filter className="h-4 w-4 text-muted mt-1.5" />
        {TAG_FILTERS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full border transition-colors",
              activeTag === tag
                ? "bg-accent/10 text-accent border-accent/30 font-medium"
                : "bg-transparent border-border text-muted hover:text-foreground hover:border-border-hover"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {filtered.map((meme) => (
          <div
            key={meme.id}
            className="break-inside-avoid rounded-2xl bg-surface border border-border overflow-hidden group hover:border-border-hover transition-colors"
          >
            {/* Image */}
            <div className="relative aspect-square bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={meme.imageUrl}
                alt={meme.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <p className="text-sm font-semibold leading-snug">{meme.title}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {meme.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-background text-muted border border-border">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => toggleLike(meme.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-sm transition-colors",
                      meme.liked ? "text-accent font-medium" : "text-muted hover:text-foreground"
                    )}
                  >
                    <ThumbsUp className={cn("h-4 w-4", meme.liked && "fill-current")} />
                    {formatLikes(meme.likes)}
                  </button>
                  <span className="flex items-center gap-1.5 text-sm text-muted">
                    <MessageCircle className="h-4 w-4" />
                    {meme.comments}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{meme.createdAt}</span>
                  <button type="button" className="text-muted hover:text-foreground transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Author */}
              <p className="text-xs text-muted">von <span className="font-medium text-foreground/70">@{meme.author}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
