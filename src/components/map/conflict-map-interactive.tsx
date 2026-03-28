"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Hotspot {
  id: string;
  name: string;
  x: number;
  y: number;
  faction: string;
  status: "active" | "contested" | "calm";
  intensity: number; // 1-5
  description: string;
  events: string[];
}

const FACTIONS = {
  israel: { name: "Israel / IDF", color: "#3b82f6", emoji: "🇮🇱" },
  hamas: { name: "Hamas", color: "#16a34a", emoji: "🟩" },
  hezbollah: { name: "Hisbollah", color: "#eab308", emoji: "🟡" },
  iran: { name: "Iran / IRGC", color: "#a855f7", emoji: "🇮🇷" },
  houthi: { name: "Huthi-Milizen", color: "#ef4444", emoji: "🔴" },
  nato: { name: "NATO / USA", color: "#0ea5e9", emoji: "🔵" },
  russia: { name: "Russland", color: "#f43f5e", emoji: "🇷🇺" },
  turkey: { name: "Tuerkei", color: "#f97316", emoji: "🇹🇷" },
} as const;

const HOTSPOTS: Hotspot[] = [
  { id: "gaza", name: "Gaza", x: 34, y: 48, faction: "hamas", status: "active", intensity: 5, description: "Bodenoffensive und Luftangriffe", events: ["Humanitaere Krise", "Waffenstillstandsverhandlungen", "UNRWA-Hilfslieferungen blockiert"] },
  { id: "westbank", name: "Westjordanland", x: 36, y: 44, faction: "israel", status: "contested", intensity: 3, description: "Razzien und Siedlungsexpansion", events: ["IDF-Operationen in Jenin", "Siedlergewalt nimmt zu"] },
  { id: "south-lebanon", name: "Sued-Libanon", x: 36, y: 36, faction: "hezbollah", status: "active", intensity: 4, description: "Taeglicher Raketenbeschuss", events: ["Hisbollah-Raketen auf Nordisrael", "IDF-Vergeltungsschlaege", "100.000 Evakuierte"] },
  { id: "syria", name: "Damaskus", x: 40, y: 34, faction: "iran", status: "active", intensity: 3, description: "Israelische Luftangriffe auf IRGC", events: ["Angriff auf Waffendepot", "Iranische Berater getoetet"] },
  { id: "yemen", name: "Jemen / Rotes Meer", x: 48, y: 72, faction: "houthi", status: "active", intensity: 4, description: "Angriffe auf Handelsschiffe", events: ["3 Schiffe in 7 Tagen angegriffen", "US-Navy Abfangoperationen", "Versicherungspraemien +300%"] },
  { id: "hormuz", name: "Strasse von Hormuz", x: 62, y: 55, faction: "iran", status: "contested", intensity: 3, description: "Marinepraesenz verstaerkt", events: ["IRGC-Schnellboote patrouillieren", "US-Traegergruppe stationiert"] },
  { id: "iran-nuclear", name: "Natanz / Isfahan", x: 60, y: 42, faction: "iran", status: "active", intensity: 3, description: "Urananreicherung 60%", events: ["IAEA-Inspektionen eingeschraenkt", "Zentrifugen-Ausbau"] },
  { id: "east-med", name: "Oestliches Mittelmeer", x: 30, y: 30, faction: "nato", status: "calm", intensity: 2, description: "NATO-Marineverband stationiert", events: ["USS Gerald Ford Traegergruppe", "Aufklaerungsfluege"] },
];

export function ConflictMapInteractive() {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 rounded-2xl bg-surface border border-border overflow-hidden relative" style={{ aspectRatio: "16/10" }}>
          {/* Dark map background with grid */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(39,39,42,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(39,39,42,0.5)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          {/* Region labels */}
          <div className="absolute inset-0">
            <span className="absolute text-[10px] text-muted/30 font-bold uppercase tracking-widest" style={{ left: "20%", top: "20%" }}>Mittelmeer</span>
            <span className="absolute text-[10px] text-muted/30 font-bold uppercase tracking-widest" style={{ left: "55%", top: "25%" }}>Irak</span>
            <span className="absolute text-[10px] text-muted/30 font-bold uppercase tracking-widest" style={{ left: "45%", top: "80%" }}>Saudi-Arabien</span>
            <span className="absolute text-[10px] text-muted/30 font-bold uppercase tracking-widest" style={{ left: "70%", top: "35%" }}>Iran</span>
            <span className="absolute text-[10px] text-muted/30 font-bold uppercase tracking-widest" style={{ left: "10%", top: "60%" }}>Aegypten</span>
          </div>

          {/* Hotspots */}
          {HOTSPOTS.map((spot) => {
            const faction = FACTIONS[spot.faction as keyof typeof FACTIONS];
            const isSelected = selectedHotspot?.id === spot.id;
            const size = spot.intensity * 4 + 8;

            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => setSelectedHotspot(isSelected ? null : spot)}
                className="absolute group"
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                aria-label={`${spot.name}: ${spot.description}`}
              >
                {/* Pulse ring for active conflicts */}
                {spot.status === "active" && (
                  <span
                    className="absolute rounded-full animate-ping opacity-30"
                    style={{
                      width: size * 2.5,
                      height: size * 2.5,
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: faction.color,
                    }}
                  />
                )}

                {/* Main dot */}
                <span
                  className={cn(
                    "relative block rounded-full border-2 transition-all",
                    isSelected ? "scale-150 border-white" : "border-transparent group-hover:scale-125"
                  )}
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: faction.color,
                    boxShadow: `0 0 ${size}px ${faction.color}80`,
                  }}
                />

                {/* Label */}
                <span className={cn(
                  "absolute left-1/2 -translate-x-1/2 -top-6 text-[10px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm transition-opacity",
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                  {spot.name}
                </span>
              </button>
            );
          })}

          {/* Connection lines (simplified) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Iran to Hezbollah supply route */}
            <line x1="60%" y1="42%" x2="36%" y2="36%" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
            {/* Iran to Houthis */}
            <line x1="60%" y1="55%" x2="48%" y2="72%" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
            {/* Iran to Syria */}
            <line x1="60%" y1="42%" x2="40%" y2="34%" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
          </svg>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected hotspot detail */}
          {selectedHotspot ? (
            <div className="rounded-2xl bg-surface border border-border p-5 space-y-4">
              <div className="flex items-center gap-3">
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: FACTIONS[selectedHotspot.faction as keyof typeof FACTIONS]?.color }}
                />
                <div>
                  <h3 className="font-bold text-lg">{selectedHotspot.name}</h3>
                  <p className="text-xs text-muted">
                    {FACTIONS[selectedHotspot.faction as keyof typeof FACTIONS]?.emoji}{" "}
                    {FACTIONS[selectedHotspot.faction as keyof typeof FACTIONS]?.name}
                  </p>
                </div>
                <span className={cn(
                  "ml-auto text-[10px] font-bold uppercase px-2 py-1 rounded-full",
                  selectedHotspot.status === "active" ? "bg-red-950 text-red-400" :
                  selectedHotspot.status === "contested" ? "bg-amber-950 text-amber-400" :
                  "bg-green-950 text-green-400"
                )}>
                  {selectedHotspot.status === "active" ? "Aktiv" : selectedHotspot.status === "contested" ? "Umkaempft" : "Ruhig"}
                </span>
              </div>

              <p className="text-sm text-muted">{selectedHotspot.description}</p>

              {/* Intensity bar */}
              <div>
                <p className="text-xs text-muted mb-1">Intensitaet</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 flex-1 rounded-full",
                        i < selectedHotspot.intensity ? "bg-red-500" : "bg-border"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Events */}
              <div>
                <p className="text-xs text-muted mb-2">Aktuelle Ereignisse</p>
                <ul className="space-y-2">
                  {selectedHotspot.events.map((event) => (
                    <li key={event} className="flex items-start gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      {event}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-surface border border-border p-5 text-center text-muted">
              <p className="text-sm">Klicke auf einen Hotspot fuer Details</p>
            </div>
          )}

          {/* Faction Legend */}
          <div className="rounded-2xl bg-surface border border-border p-5">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Fraktionen</p>
            <div className="space-y-2">
              {Object.entries(FACTIONS).map(([key, faction]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: faction.color }} />
                  <span>{faction.emoji} {faction.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
