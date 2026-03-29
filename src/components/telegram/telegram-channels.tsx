"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Users, Video, Eye, Shield, ChevronRight, AlertTriangle } from "lucide-react";

interface TelegramChannel {
  id: string;
  name: string;
  handle: string;
  description: string;
  subscribers: string;
  category: string;
  language: string;
  warningLevel: "safe" | "graphic" | "extreme";
  verified: boolean;
  avatar: string;
  tags: string[];
}

const WARNING_CONFIG = {
  safe: { label: "Sicher", color: "text-green-400", bg: "bg-green-950/50", border: "border-green-500/20", icon: Shield },
  graphic: { label: "Grafisch", color: "text-amber-400", bg: "bg-amber-950/50", border: "border-amber-500/20", icon: AlertTriangle },
  extreme: { label: "Extrem Grafisch", color: "text-red-400", bg: "bg-red-950/50", border: "border-red-500/20", icon: AlertTriangle },
};

const CATEGORIES = ["Alle", "Frontline", "OSINT", "Analyse", "Raketenalarm", "Drohnen & Tech", "Nahost"];

const CHANNELS: TelegramChannel[] = [
  {
    id: "1",
    name: "Intel Slava Z",
    handle: "@inaboron2",
    description: "Russisch-ukrainischer Frontbericht. Drohnenaufnahmen, Truppenbewegungen, Gefechtsvideos aus erster Hand.",
    subscribers: "1.2M",
    category: "Frontline",
    language: "🇷🇺 RU",
    warningLevel: "extreme",
    verified: false,
    avatar: "⚔️",
    tags: ["Ukraine", "Russland", "Frontline"],
  },
  {
    id: "2",
    name: "OSINTdefender",
    handle: "@OSINTdefender",
    description: "Verifizierte OSINT-Analysen. Satellitenbilder, Geolocation, Waffenidentifikation. Gilt als zuverlaessig.",
    subscribers: "480K",
    category: "OSINT",
    language: "🇬🇧 EN",
    warningLevel: "graphic",
    verified: true,
    avatar: "🛰️",
    tags: ["OSINT", "Geolocation", "Verifiziert"],
  },
  {
    id: "3",
    name: "Rybar",
    handle: "@ryaborig",
    description: "Detaillierte Frontkarten und militaerische Lageberichte. Taegliche Updates mit Kartenanalysen.",
    subscribers: "1.4M",
    category: "Analyse",
    language: "🇷🇺 RU",
    warningLevel: "graphic",
    verified: false,
    avatar: "🗺️",
    tags: ["Karten", "Analyse", "Militaer"],
  },
  {
    id: "4",
    name: "Tzeva Adom",
    handle: "@tzaborig",
    description: "Echtzeit-Raketenalarm fuer Israel. Sirenen, Einschlaege, Iron Dome Abfangungen.",
    subscribers: "320K",
    category: "Raketenalarm",
    language: "🇮🇱 HE",
    warningLevel: "safe",
    verified: true,
    avatar: "🚨",
    tags: ["Israel", "Raketen", "Echtzeit"],
  },
  {
    id: "5",
    name: "Gaza Warfare",
    handle: "@gazwarfare",
    description: "Videos und Bilder direkt aus dem Gaza-Konflikt. Ungefilterte Aufnahmen der Bodenoffensive.",
    subscribers: "680K",
    category: "Nahost",
    language: "🇬🇧 EN / 🇸🇦 AR",
    warningLevel: "extreme",
    verified: false,
    avatar: "💀",
    tags: ["Gaza", "IDF", "Hamas"],
  },
  {
    id: "6",
    name: "Ukraine Weapons Tracker",
    handle: "@ukaborig",
    description: "Dokumentation eingesetzter Waffensysteme. HIMARS, Leopard, Drohnen — mit technischen Details.",
    subscribers: "540K",
    category: "Drohnen & Tech",
    language: "🇬🇧 EN",
    warningLevel: "graphic",
    verified: true,
    avatar: "🎯",
    tags: ["Waffen", "Technik", "OSINT"],
  },
  {
    id: "7",
    name: "Middle East Spectator",
    handle: "@meaborig",
    description: "Nahost-Berichterstattung mit Fokus auf Iran, Israel, Libanon. Breaking News und Hintergruende.",
    subscribers: "390K",
    category: "Nahost",
    language: "🇬🇧 EN",
    warningLevel: "graphic",
    verified: false,
    avatar: "🌍",
    tags: ["Iran", "Israel", "Libanon"],
  },
  {
    id: "8",
    name: "Fighterbomber",
    handle: "@fightaborig",
    description: "Russischer Militaerkanal mit Fokus auf Luftwaffe. Kampfjet-Einsaetze, Bombenangriffe, Pilotenperspektive.",
    subscribers: "860K",
    category: "Frontline",
    language: "🇷🇺 RU",
    warningLevel: "extreme",
    verified: false,
    avatar: "✈️",
    tags: ["Luftwaffe", "Russland", "Bomben"],
  },
  {
    id: "9",
    name: "Drone Surveillance",
    handle: "@droneaborig",
    description: "FPV-Drohnen im Kampfeinsatz. First-Person-Aufnahmen von Drohnenangriffen auf Panzer und Stellungen.",
    subscribers: "720K",
    category: "Drohnen & Tech",
    language: "🇬🇧 EN / 🇺🇦 UA",
    warningLevel: "extreme",
    verified: false,
    avatar: "🤖",
    tags: ["FPV", "Drohnen", "Technik"],
  },
];

export function TelegramChannels() {
  const [activeCategory, setActiveCategory] = useState("Alle");
  const [acknowledgedWarning, setAcknowledgedWarning] = useState(false);

  const filtered = activeCategory === "Alle" ? CHANNELS : CHANNELS.filter((ch) => ch.category === activeCategory);

  if (!acknowledgedWarning) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-8 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold text-red-400">Inhaltswarnung</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Diese Sektion enthaelt Links zu Telegram-Kanaelen mit potenziell verstoerendem Material
          (Kriegsvideos, grafische Aufnahmen, unzensierte Frontberichte). Der Zugang erfolgt auf eigene Verantwortung.
        </p>
        <p className="text-xs text-zinc-600">
          Meridian Monitor ist nicht fuer den Inhalt externer Kanaele verantwortlich.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setAcknowledgedWarning(true)}
            className="px-6 py-2.5 text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
          >
            Verstanden — Kanaele anzeigen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
            <Video className="h-7 w-7 text-blue-400" />
            Telegram Frontline
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Kuratierte Kanaele — ungefilterte Kriegsberichterstattung
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <Eye className="h-3.5 w-3.5" />
          <span>{CHANNELS.length} Kanaele</span>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full border transition-colors",
              activeCategory === cat
                ? "bg-blue-500/10 text-blue-400 border-blue-500/30 font-medium"
                : "bg-transparent border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Channel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((channel) => {
          const warning = WARNING_CONFIG[channel.warningLevel];
          const WarningIcon = warning.icon;

          return (
            <div
              key={channel.id}
              className="group rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="text-2xl w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                    {channel.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold truncate">{channel.name}</h3>
                      {channel.verified && (
                        <Shield className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-600 font-mono">{channel.handle}</p>
                  </div>
                  <span className={cn(
                    "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border shrink-0",
                    warning.color, warning.bg, warning.border
                  )}>
                    <WarningIcon className="h-2.5 w-2.5 inline mr-0.5" />
                    {warning.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{channel.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {channel.tags.map((tag) => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/50 text-zinc-600">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
                  <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {channel.subscribers}
                    </span>
                    <span>{channel.language}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                    Oeffnen
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="text-center py-4">
        <p className="text-[10px] text-zinc-700 max-w-lg mx-auto">
          Hinweis: Meridian Monitor kuratiert diese Kanaele zu Informationszwecken.
          Die Inhalte werden nicht von uns erstellt oder verifiziert.
          Alle Kanaele sind oeffentlich zugaenglich auf Telegram.
        </p>
      </div>
    </div>
  );
}
