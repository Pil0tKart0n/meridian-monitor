"use client";

import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { useState, useEffect } from "react";

// 50m resolution for smoother country borders at high zoom
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

/**
 * Events represent things that HAPPEN — not countries.
 * A rocket flies FROM somewhere TO somewhere.
 * An airstrike happens AT a location.
 * Troops gather AT a border.
 */

interface MapEvent {
  id: string;
  type: "rocket" | "airstrike" | "naval" | "troops" | "nuclear";
  from?: [number, number];
  to?: [number, number];
  at?: [number, number];
  label: string;
  color: string;
  active: boolean;
}

// Events with emojis — spaced out so nothing overlaps
const EVENTS: MapEvent[] = [
  // Rockets: Hezbollah -> Northern Israel
  { id: "hzb-rockets", type: "rocket", from: [35.5, 33.4], to: [35.4, 33.0], label: "Hisbollah-Raketen", color: "#eab308", active: true },
  // Rockets: Gaza -> Beer Sheva
  { id: "gaza-rockets", type: "rocket", from: [34.42, 31.48], to: [34.7, 31.2], label: "Raketenbeschuss aus Gaza", color: "#22c55e", active: true },
  // Airstrike: IDF on Gaza
  { id: "idf-gaza", type: "airstrike", at: [34.35, 31.4], label: "IDF Luftangriffe Gaza", color: "#3b82f6", active: true },
  // Airstrike: IDF on South Lebanon
  { id: "idf-leb", type: "airstrike", at: [35.55, 33.2], label: "IDF Schlaege Sued-Libanon", color: "#3b82f6", active: true },
  // Troops: IDF at Gaza border
  { id: "idf-troops", type: "troops", at: [34.55, 31.55], label: "IDF Bodenoffensive", color: "#3b82f6", active: true },
  // US Navy
  { id: "us-navy", type: "naval", at: [33.8, 34.0], label: "USS Gerald Ford", color: "#0ea5e9", active: false },
];

const ME_COUNTRIES = [
  "Turkey", "Syria", "Iraq", "Iran", "Israel", "Palestine", "Lebanon",
  "Jordan", "Egypt", "Saudi Arabia", "Yemen", "Oman",
  "United Arab Emirates", "Qatar", "Kuwait", "Bahrain", "Cyprus",
  "Libya", "Sudan", "Eritrea", "Djibouti", "Somalia",
];
const CONFLICT_COUNTRIES = ["Israel", "Palestine", "Lebanon", "Syria", "Yemen", "Iran"];

export function AnimatedGlobe({ className = "" }: { className?: string }) {
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [time, setTime] = useState(0);

  // Animation tick — throttled to ~10fps for battery efficiency
  useEffect(() => {
    let animId: number;
    let last = 0;
    function tick(now: number) {
      if (now - last >= 100) {
        setTime((t) => t + 1);
        last = now;
      }
      animId = requestAnimationFrame(tick);
    }
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Event detail tooltip */}
      {selectedEvent && (
        <div className="absolute top-3 left-3 z-10 bg-zinc-900/95 border border-zinc-700 rounded-xl px-3.5 py-2.5 backdrop-blur-sm shadow-xl max-w-[220px]">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: selectedEvent.color }} />
            <span className="text-xs font-bold text-white">{selectedEvent.label}</span>
          </div>
          <p className="text-[10px] text-zinc-400">
            {selectedEvent.type === "rocket" && "Raketenflugbahn aktiv"}
            {selectedEvent.type === "airstrike" && "Luftangriff-Zone"}
            {selectedEvent.type === "naval" && "Marinepraesenz"}
            {selectedEvent.type === "troops" && "Truppenkonzentration"}
            {selectedEvent.type === "nuclear" && "Nuklearer Standort"}
          </p>
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [35.5, 32], scale: 3500 }}
        width={500}
        height={450}
        className="w-full h-full"
      >
        {/* Countries */}
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = geo.properties.name;
              const isConflict = CONFLICT_COUNTRIES.includes(name);
              const isME = ME_COUNTRIES.includes(name);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isConflict ? "#251515" : isME ? "#181828" : "#101018"}
                  stroke={isME ? "#2a2a45" : "#161625"}
                  strokeWidth={isME ? 0.6 : 0.2}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: isME ? "#202038" : "#101018" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* === COUNTRY LABELS === */}
        {[
          { name: "ISRAEL", coords: [34.85, 31.8] as [number, number] },
          { name: "LIBANON", coords: [35.8, 33.85] as [number, number] },
          { name: "SYRIEN", coords: [36.5, 33.2] as [number, number] },
          { name: "JORDANIEN", coords: [36.2, 31.5] as [number, number] },
          { name: "AEGYPTEN", coords: [33.5, 30.5] as [number, number] },
          { name: "GAZA", coords: [34.2, 31.65] as [number, number] },
        ].map((label) => (
          <Marker key={label.name} coordinates={label.coords}>
            <text
              textAnchor="middle"
              fontSize={label.name === "GAZA" ? 3 : 4}
              fill={label.name === "GAZA" || label.name === "ISRAEL" ? "#555570" : "#333348"}
              fontWeight="bold"
              letterSpacing="0.15em"
              style={{ pointerEvents: "none" }}
            >
              {label.name}
            </text>
          </Marker>
        ))}

        {/* === EVENTS WITH EMOJIS === */}
        {EVENTS.map((event) => {
          const EMOJI_MAP: Record<string, string> = {
            rocket: "🚀",
            airstrike: "💥",
            troops: "🪖",
            naval: "🚢",
            nuclear: "☢️",
          };
          const emoji = EMOJI_MAP[event.type] ?? "⚠️";

          // ROCKET: emoji moves from A to B
          if (event.type === "rocket" && event.from && event.to) {
            const progress = ((time * 2) % 100) / 100;
            const x = event.from[0] + (event.to[0] - event.from[0]) * progress;
            const y = event.from[1] + (event.to[1] - event.from[1]) * progress;

            return (
              <g key={event.id}>
                <Line from={event.from} to={event.to} stroke={event.color} strokeWidth={0.8} strokeDasharray="3 2" opacity={0.25} strokeLinecap="round" />
                <Marker coordinates={[x, y]}>
                  <text textAnchor="middle" dominantBaseline="central" fontSize={8} className="select-none" style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.9))" }}>
                    {emoji}
                  </text>
                </Marker>
              </g>
            );
          }

          // AIRSTRIKE: emoji at location with pulse
          if (event.type === "airstrike" && event.at) {
            return (
              <Marker key={event.id} coordinates={event.at}>
                <circle r={3} fill="none" stroke={event.color} strokeWidth={0.5} opacity={0.3}>
                  <animate attributeName="r" values="2;6;2" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <text
                  textAnchor="middle" dominantBaseline="central" fontSize={7}
                  className="select-none cursor-pointer"
                  style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.9))" }}
                  onMouseEnter={() => setSelectedEvent(event)}
                  onMouseLeave={() => setSelectedEvent(null)}
                >
                  {emoji}
                </text>
              </Marker>
            );
          }

          // TROOPS / NAVAL / OTHER: emoji at location
          if (event.at) {
            return (
              <Marker key={event.id} coordinates={event.at}>
                <text
                  textAnchor="middle" dominantBaseline="central" fontSize={7}
                  className="select-none cursor-pointer"
                  style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.9))" }}
                  onMouseEnter={() => setSelectedEvent(event)}
                  onMouseLeave={() => setSelectedEvent(null)}
                >
                  {emoji}
                </text>
              </Marker>
            );
          }

          return null;
        })}
      </ComposableMap>

      {/* LIVE badge */}
      <div className="absolute top-3 right-3 bg-zinc-950/90 border border-zinc-800 rounded-lg px-3 py-1.5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Event type legend */}
      <div className="absolute bottom-3 left-3 bg-zinc-950/90 border border-zinc-800 rounded-lg px-3 py-2 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-4 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-500/30" />
            Rakete
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
            Luftangriff
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-3 rounded-sm bg-cyan-500/70" />
            Marine
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            Nuklear
          </span>
        </div>
      </div>
    </div>
  );
}
