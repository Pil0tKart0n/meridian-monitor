"use client";

import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { useState } from "react";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Middle East focus: center on Iraq/Syria region
const MAP_CENTER: [number, number] = [42, 28];
const MAP_ZOOM = 3.5;

interface ConflictZone {
  name: string;
  coords: [number, number];
  faction: string;
  color: string;
  emoji: string;
  intensity: number; // 1-5
  description: string;
}

const CONFLICT_ZONES: ConflictZone[] = [
  { name: "Gaza", coords: [34.45, 31.5], faction: "Hamas", color: "#22c55e", emoji: "💥", intensity: 5, description: "Bodenoffensive & Luftangriffe" },
  { name: "Sued-Libanon", coords: [35.5, 33.3], faction: "Hisbollah", color: "#eab308", emoji: "🚀", intensity: 4, description: "Raketenbeschuss" },
  { name: "Damaskus", coords: [36.3, 33.5], faction: "Iran/IRGC", color: "#a855f7", emoji: "✈️", intensity: 3, description: "Israelische Luftangriffe" },
  { name: "Natanz", coords: [51.7, 33.5], faction: "Iran", color: "#a855f7", emoji: "☢️", intensity: 3, description: "Urananreicherung 60%" },
  { name: "Rotes Meer", coords: [40.0, 14.5], faction: "Huthi", color: "#ef4444", emoji: "🚢", intensity: 4, description: "Angriffe auf Handelsschiffe" },
  { name: "Hormuz", coords: [56.0, 26.5], faction: "Iran", color: "#a855f7", emoji: "⚓", intensity: 3, description: "Marinepraesenz verstaerkt" },
  { name: "Tel Aviv", coords: [34.78, 32.08], faction: "Israel/IDF", color: "#3b82f6", emoji: "🛡️", intensity: 2, description: "Hauptquartier IDF" },
  { name: "Mittelmeer", coords: [33.0, 34.5], faction: "NATO/USA", color: "#0ea5e9", emoji: "🛳️", intensity: 2, description: "USS Gerald Ford Carrier Group" },
  { name: "Latakia", coords: [35.8, 35.5], faction: "Russland", color: "#f43f5e", emoji: "⭐", intensity: 2, description: "Russische Marinebasis" },
];

// Supply/attack routes
const ROUTES: Array<{ from: [number, number]; to: [number, number]; color: string; type: "supply" | "attack" }> = [
  { from: [51.7, 33.5], to: [35.5, 33.3], color: "#a855f7", type: "supply" },  // Iran -> Hezbollah
  { from: [51.7, 33.5], to: [44.0, 15.5], color: "#a855f7", type: "supply" },  // Iran -> Houthis
  { from: [51.7, 33.5], to: [36.3, 33.5], color: "#a855f7", type: "supply" },  // Iran -> Syria
  { from: [44.0, 15.5], to: [40.0, 14.5], color: "#ef4444", type: "attack" },  // Houthi -> Red Sea
  { from: [35.5, 33.3], to: [34.78, 32.5], color: "#eab308", type: "attack" }, // Hezbollah -> Israel
];

// Highlight these countries
const HIGHLIGHT_COUNTRIES = [
  "Israel", "Palestine", "Lebanon", "Syria", "Iraq", "Iran",
  "Turkey", "Egypt", "Jordan", "Saudi Arabia", "Yemen", "Oman",
  "United Arab Emirates", "Qatar", "Bahrain", "Kuwait", "Cyprus",
  "Libya", "Sudan", "Eritrea", "Djibouti", "Somalia",
];

export function AnimatedGlobe({ className = "" }: { className?: string }) {
  const [tooltip, setTooltip] = useState<ConflictZone | null>(null);

  return (
    <div className={`relative ${className}`}>
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute top-4 left-4 z-10 bg-zinc-900/95 border border-zinc-700 rounded-xl p-3 backdrop-blur-sm max-w-[200px] shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{tooltip.emoji}</span>
            <span className="text-sm font-bold text-white">{tooltip.name}</span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-1.5">{tooltip.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium" style={{ color: tooltip.color }}>{tooltip.faction}</span>
            <div className="flex gap-0.5 ml-auto">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`h-1.5 w-3 rounded-sm ${i < tooltip.intensity ? "bg-red-500" : "bg-zinc-800"}`} />
              ))}
            </div>
          </div>
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: MAP_CENTER, scale: 600 }}
        width={500}
        height={450}
        className="w-full h-full"
      >
        {/* Country shapes */}
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = geo.properties.name;
              const isHighlighted = HIGHLIGHT_COUNTRIES.includes(name);
              const isConflictCountry = ["Israel", "Palestine", "Lebanon", "Syria", "Yemen", "Iran"].includes(name);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isConflictCountry ? "#2a1a1a" : isHighlighted ? "#1a1a2e" : "#111118"}
                  stroke={isHighlighted ? "#3f3f5a" : "#1e1e2e"}
                  strokeWidth={isHighlighted ? 0.8 : 0.3}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: isHighlighted ? "#252540" : "#111118" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Supply/Attack routes */}
        {ROUTES.map((route, i) => (
          <Line
            key={i}
            from={route.from}
            to={route.to}
            stroke={route.color}
            strokeWidth={route.type === "attack" ? 1.5 : 1}
            strokeLinecap="round"
            strokeDasharray={route.type === "supply" ? "4 3" : "2 2"}
            opacity={0.4}
          />
        ))}

        {/* Conflict zone markers */}
        {CONFLICT_ZONES.map((zone) => (
          <Marker
            key={zone.name}
            coordinates={zone.coords}
            onMouseEnter={() => setTooltip(zone)}
            onMouseLeave={() => setTooltip(null)}
          >
            {/* Pulse ring for active zones */}
            {zone.intensity >= 4 && (
              <>
                <circle r={8} fill="none" stroke={zone.color} strokeWidth={0.5} opacity={0.4}>
                  <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle r={5} fill="none" stroke={zone.color} strokeWidth={0.3} opacity={0.3}>
                  <animate attributeName="r" values="4;10;4" dur="2s" begin="0.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" begin="0.5s" repeatCount="indefinite" />
                </circle>
              </>
            )}

            {/* Glow background */}
            <circle r={zone.intensity >= 4 ? 6 : 4} fill={zone.color} opacity={0.15} />

            {/* Emoji icon */}
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={zone.intensity >= 4 ? 14 : 11}
              className="cursor-pointer select-none"
              style={{ filter: "drop-shadow(0 0 3px rgba(0,0,0,0.8))" }}
            >
              {zone.emoji}
            </text>

            {/* Label */}
            <text
              textAnchor="middle"
              y={zone.intensity >= 4 ? 16 : 13}
              fontSize={5}
              fill={zone.color}
              fontWeight="bold"
              opacity={0.8}
              style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.9))" }}
            >
              {zone.name}
            </text>
          </Marker>
        ))}

        {/* Animated "flying" objects along routes */}
        {/* Fighter jet Israel -> Gaza patrol */}
        <Marker coordinates={[34.5, 31.8]}>
          <text fontSize={10} className="select-none" style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }}>
            <animateMotion dur="6s" repeatCount="indefinite" path="M0,0 Q10,-5 5,-10 Q0,-5 -5,0 Q0,5 0,0" />
            ✈️
          </text>
        </Marker>

        {/* US jet from carrier */}
        <Marker coordinates={[33.5, 34.0]}>
          <text fontSize={9} className="select-none" style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }}>
            <animateMotion dur="10s" repeatCount="indefinite" path="M0,0 Q15,-8 25,-5 Q15,0 5,5 Q-5,3 0,0" />
            ✈️
          </text>
        </Marker>

        {/* Drone Iran */}
        <Marker coordinates={[48.0, 32.0]}>
          <text fontSize={8} className="select-none" style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }}>
            <animateMotion dur="14s" repeatCount="indefinite" path="M0,0 Q-15,5 -25,8 Q-15,3 0,0" />
            🛩️
          </text>
        </Marker>

        {/* Missile from Yemen */}
        <Marker coordinates={[43.0, 15.0]}>
          <text fontSize={8} className="select-none" style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }}>
            <animateMotion dur="4s" repeatCount="indefinite" path="M0,0 L-8,-3 L0,0" />
            🚀
          </text>
        </Marker>
      </ComposableMap>

      {/* Legend overlay */}
      <div className="absolute bottom-3 left-3 bg-zinc-950/90 border border-zinc-800 rounded-xl px-3 py-2.5 backdrop-blur-sm">
        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Fraktionen</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {[
            { color: "#3b82f6", name: "Israel/IDF" },
            { color: "#eab308", name: "Hisbollah" },
            { color: "#a855f7", name: "Iran/IRGC" },
            { color: "#ef4444", name: "Huthi" },
            { color: "#0ea5e9", name: "NATO/USA" },
            { color: "#f43f5e", name: "Russland" },
          ].map((f) => (
            <div key={f.name} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: f.color }} />
              <span className="text-[9px] text-zinc-400">{f.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Animated info bar */}
      <div className="absolute top-3 right-3 bg-zinc-950/90 border border-zinc-800 rounded-xl px-3 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-[10px] text-red-400 font-medium">LIVE SITUATION</span>
        </div>
      </div>
    </div>
  );
}
