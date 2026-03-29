"use client";

import { useState } from "react";
import {
  Flame, Clock, TrendingUp, ThumbsUp, MessageCircle, Share2,
  Smile, Filter, CheckCircle, AlertTriangle, XCircle, Zap,
} from "lucide-react";
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
  factCheck?: {
    status: "true" | "mostly-true" | "misleading" | "false" | "satire";
    context: string;
    sources: string[];
  };
}

const FACT_CHECK_CONFIG = {
  true: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-950/50", border: "border-green-500/20", label: "Faktenbasiert" },
  "mostly-true": { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-950/50", border: "border-emerald-500/20", label: "Weitgehend korrekt" },
  misleading: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-950/50", border: "border-amber-500/20", label: "Irreführend" },
  false: { icon: XCircle, color: "text-red-400", bg: "bg-red-950/50", border: "border-red-500/20", label: "Falsch" },
  satire: { icon: Smile, color: "text-purple-400", bg: "bg-purple-950/50", border: "border-purple-500/20", label: "Satire" },
};

const DEMO_MEMES: Meme[] = [
  {
    id: "1",
    title: "Wenn der UN-Sicherheitsrat mal wieder ein Veto einlegt",
    imageUrl: "https://placehold.co/600x500/1a1a2e/f97316?text=🙄+UN+Veto+%23247&font=montserrat",
    author: "DiplomacyDave",
    likes: 847,
    comments: 63,
    createdAt: "2h",
    tags: ["UN", "Diplomatie"],
    liked: false,
    factCheck: {
      status: "true",
      context: "Russland und China haben seit 2011 gemeinsam 17 Mal ihr Veto im Sicherheitsrat eingelegt, zuletzt gegen eine Gaza-Resolution.",
      sources: ["UN Security Council Records"],
    },
  },
  {
    id: "2",
    title: "Oelpreis-Trader wenn Huthi-Milizen ein Schiff angreifen",
    imageUrl: "https://placehold.co/600x600/1a0a0a/ef4444?text=📈+BRENT+GO+BRRR&font=montserrat",
    author: "PetroDollarPete",
    likes: 1243,
    comments: 89,
    createdAt: "5h",
    tags: ["Wirtschaft", "Rotes Meer"],
    liked: true,
    factCheck: {
      status: "mostly-true",
      context: "Huthi-Angriffe haben die Versicherungspraemien fuer Rotes-Meer-Transporte um 300% erhoeht. Der direkte Oelpreis-Impact ist aber geringer als dargestellt.",
      sources: ["Lloyd's of London", "Reuters"],
    },
  },
  {
    id: "3",
    title: "IAEA-Inspektoren auf dem Weg nach Iran — zum 247. Mal",
    imageUrl: "https://placehold.co/600x500/1a0a2e/a855f7?text=☢️+IAEA+AGAIN&font=montserrat",
    author: "NuklearNerd",
    likes: 556,
    comments: 42,
    createdAt: "12h",
    tags: ["Nuklear", "Iran"],
    liked: false,
    factCheck: {
      status: "misleading",
      context: "Die IAEA fuehrt regelmaessige Inspektionen durch, hat aber seit 2023 eingeschraenkten Zugang zu iranischen Anlagen. Die Darstellung als 'nutzlos' ist vereinfacht.",
      sources: ["IAEA Board Reports", "Arms Control Association"],
    },
  },
  {
    id: "4",
    title: "NATO: 'Wir sind zutiefst besorgt' — Pressekonferenz #4782",
    imageUrl: "https://placehold.co/600x500/0a1a2e/0ea5e9?text=😐+DEEPLY+CONCERNED&font=montserrat",
    author: "BrusselsInsider",
    likes: 2103,
    comments: 156,
    createdAt: "1d",
    tags: ["NATO", "Diplomatie"],
    liked: false,
    factCheck: {
      status: "satire",
      context: "Uebertreibung fuer komischen Effekt. NATO hat aber tatsaechlich die Formulierung 'deeply concerned' in ueber 200 offiziellen Statements seit 2022 verwendet.",
      sources: ["NATO Press Releases"],
    },
  },
  {
    id: "5",
    title: "Mein Prepper-Freund vs. die Realitaet — Runde 3 geht an ihn",
    imageUrl: "https://placehold.co/600x600/0a1a0a/22c55e?text=🏆+PREPPER+WINS&font=montserrat",
    author: "SurvivalSteve",
    likes: 3421,
    comments: 234,
    createdAt: "1d",
    tags: ["Community", "Humor"],
    liked: true,
    factCheck: {
      status: "satire",
      context: "Kommentar zur steigenden Relevanz von Krisenvorsorge. Die Bundesregierung empfiehlt tatsaechlich einen 10-Tage-Notvorrat.",
      sources: ["BBK Ratgeber"],
    },
  },
  {
    id: "6",
    title: "VIX Fear Index vs. mein Portfolio — Name a more iconic duo",
    imageUrl: "https://placehold.co/600x500/1a1a0a/eab308?text=💀+VIX+vs+PORTFOLIO&font=montserrat",
    author: "WallStreetWarrior",
    likes: 1876,
    comments: 98,
    createdAt: "2d",
    tags: ["Wirtschaft", "Boerse"],
    liked: false,
    factCheck: {
      status: "true",
      context: "Der VIX ist 2025-2026 tatsaechlich mehrfach ueber 25 gestiegen (Normal: 12-18), korreliert mit geopolitischen Eskalationen.",
      sources: ["CBOE", "Bloomberg"],
    },
  },
  {
    id: "7",
    title: "Iron Dome MVP des Jahres — zum dritten Mal in Folge",
    imageUrl: "https://placehold.co/600x500/0a0a1e/3b82f6?text=🛡️+IRON+DOME+MVP&font=montserrat",
    author: "TelAvivTech",
    likes: 4521,
    comments: 312,
    createdAt: "6h",
    tags: ["Militaer", "Israel"],
    liked: false,
    factCheck: {
      status: "mostly-true",
      context: "Iron Dome hat eine Abfangrate von ~90% gegen Kurzstreckenraketen. Gegen Praezisionswaffen ist die Rate deutlich niedriger.",
      sources: ["CSIS Missile Defense Project"],
    },
  },
  {
    id: "8",
    title: "Erdogan: 'Wir stehen auf der richtigen Seite der Geschichte' — welche Seite wechselt er heute?",
    imageUrl: "https://placehold.co/600x600/1a0e0a/f97316?text=🇹🇷+WHICH+SIDE+TODAY&font=montserrat",
    author: "BosphorusBanter",
    likes: 2890,
    comments: 187,
    createdAt: "8h",
    tags: ["NATO", "Diplomatie"],
    liked: true,
    factCheck: {
      status: "satire",
      context: "Die Tuerkei verfolgt tatsaechlich eine komplexe Aussenpolitik zwischen NATO-Mitgliedschaft, Russland-Naehe und regionaler Machtprojektion.",
      sources: ["Council on Foreign Relations"],
    },
  },
  {
    id: "9",
    title: "FPV-Drohne fuer 500$ zerstoert Panzer fuer 3 Mio$ — Wirtschaft 101",
    imageUrl: "https://placehold.co/600x500/0a1a1a/06b6d4?text=🤖+DRONE+vs+TANK&font=montserrat",
    author: "DroneWarfare",
    likes: 5120,
    comments: 423,
    createdAt: "3h",
    tags: ["Militaer", "Technik"],
    liked: false,
    factCheck: {
      status: "true",
      context: "FPV-Drohnen kosten 300-800$ und haben im Ukraine-Krieg hunderte gepanzerte Fahrzeuge zerstoert. Die asymmetrische Kosten-Nutzen-Rechnung veraendert moderne Kriegsfuehrung.",
      sources: ["RUSI", "Oryx OSINT"],
    },
  },
];

const SORT_OPTIONS = [
  { key: "hot", label: "Hot", icon: Flame },
  { key: "new", label: "Neu", icon: Clock },
  { key: "top", label: "Top", icon: TrendingUp },
] as const;

const TAG_FILTERS = ["Alle", "Diplomatie", "Militaer", "Wirtschaft", "Nuklear", "Community", "NATO", "Iran", "Rotes Meer", "Israel", "Technik", "Humor"];

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
            <Zap className="h-7 w-7 text-accent" />
            Signal vs. Noise
          </h1>
          <p className="text-sm text-muted mt-1">Geopolitische Memes — mit Faktencheck</p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 bg-zinc-900 rounded-xl p-1 border border-white/[0.06]">
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
                : "bg-transparent border-white/[0.06] text-muted hover:text-foreground hover:border-white/[0.12]"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {filtered.map((meme) => {
          const fc = meme.factCheck ? FACT_CHECK_CONFIG[meme.factCheck.status] : null;
          const FcIcon = fc?.icon;

          return (
            <div
              key={meme.id}
              className="break-inside-avoid rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent border border-white/[0.06] overflow-hidden group hover:border-white/[0.12] transition-all"
            >
              {/* Image */}
              <div className="relative bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={meme.imageUrl}
                  alt={meme.title}
                  className="w-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <p className="text-sm font-bold leading-snug">{meme.title}</p>

                {/* Fact Check — Signal vs Noise */}
                {meme.factCheck && fc && FcIcon && (
                  <div className={cn("rounded-xl p-3 border", fc.bg, fc.border)}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <FcIcon className={cn("h-4 w-4", fc.color)} />
                      <span className={cn("text-xs font-bold uppercase tracking-wider", fc.color)}>
                        {fc.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{meme.factCheck.context}</p>
                    {meme.factCheck.sources.length > 0 && (
                      <p className="text-[10px] text-muted mt-1.5">
                        Quellen: {meme.factCheck.sources.join(", ")}
                      </p>
                    )}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {meme.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-muted border border-white/[0.06]">
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
                        "flex items-center gap-1.5 text-sm transition-all active:scale-90",
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
                    <button type="button" className="text-muted hover:text-foreground transition-colors active:scale-90">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-muted">von <span className="font-medium text-zinc-400">@{meme.author}</span></p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
