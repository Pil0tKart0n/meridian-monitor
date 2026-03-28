"use client";

import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { useState } from "react";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface HotSpot {
  name: string;
  coords: [number, number];
  color: string;
  emoji: string;
  size: "lg" | "md" | "sm";
}

// Only the 5 most important hotspots — clean and readable
const HOTSPOTS: HotSpot[] = [
  { name: "Gaza", coords: [34.45, 31.5], color: "#ef4444", emoji: "💥", size: "lg" },
  { name: "Libanon", coords: [35.5, 33.8], color: "#eab308", emoji: "🚀", size: "md" },
  { name: "Iran", coords: [53.0, 32.5], color: "#a855f7", emoji: "☢️", size: "md" },
  { name: "Rotes Meer", coords: [40.0, 15.0], color: "#ef4444", emoji: "🚢", size: "md" },
  { name: "US Carrier", coords: [33.5, 34.5], color: "#0ea5e9", emoji: "🛳️", size: "sm" },
];

const SUPPLY_ROUTES: Array<{ from: [number, number]; to: [number, number]; color: string }> = [
  { from: [53.0, 32.5], to: [35.5, 33.8], color: "#a855f7" }, // Iran -> Hezbollah
  { from: [53.0, 32.5], to: [44.0, 15.5], color: "#a855f7" }, // Iran -> Houthis
];

const CONFLICT_COUNTRIES = ["Israel", "Palestine", "Lebanon", "Syria", "Yemen", "Iran"];
const ME_COUNTRIES = [
  "Turkey", "Iraq", "Egypt", "Jordan", "Saudi Arabia",
  "United Arab Emirates", "Qatar", "Kuwait", "Oman", "Bahrain", "Cyprus",
  ...CONFLICT_COUNTRIES,
];

export function AnimatedGlobe({ className = "" }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className={`relative ${className}`}>
      {/* Tooltip */}
      {active && (
        <div className="absolute top-3 left-3 z-10 bg-zinc-900/95 border border-zinc-700 rounded-lg px-3 py-2 backdrop-blur-sm shadow-xl">
          <span className="text-sm font-bold text-white">{active}</span>
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [42, 26], scale: 550 }}
        width={500}
        height={400}
        className="w-full h-full"
      >
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
                  fill={isConflict ? "#2a1515" : isME ? "#1a1a2e" : "#111118"}
                  stroke={isME ? "#333355" : "#1a1a28"}
                  strokeWidth={isME ? 0.8 : 0.3}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: isME ? "#222240" : "#111118" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Supply routes */}
        {SUPPLY_ROUTES.map((route, i) => (
          <Line key={i} from={route.from} to={route.to} stroke={route.color} strokeWidth={1.2} strokeLinecap="round" strokeDasharray="6 4" opacity={0.35} />
        ))}

        {/* Hotspots */}
        {HOTSPOTS.map((spot) => {
          const emojiSize = spot.size === "lg" ? 18 : spot.size === "md" ? 14 : 11;
          const pulseR = spot.size === "lg" ? 10 : 7;

          return (
            <Marker
              key={spot.name}
              coordinates={spot.coords}
              onMouseEnter={() => setActive(spot.name)}
              onMouseLeave={() => setActive(null)}
            >
              {/* Pulse for active conflicts */}
              {spot.size !== "sm" && (
                <circle r={pulseR} fill="none" stroke={spot.color} strokeWidth={0.8} opacity={0.4}>
                  <animate attributeName="r" values={`${pulseR - 2};${pulseR + 6};${pulseR - 2}`} dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Glow */}
              <circle r={spot.size === "lg" ? 8 : 5} fill={spot.color} opacity={0.12} />

              {/* Emoji */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={emojiSize}
                className="cursor-pointer select-none"
                style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.9))" }}
              >
                {spot.emoji}
              </text>
            </Marker>
          );
        })}

        {/* Single animated jet */}
        <Marker coordinates={[35.0, 32.0]}>
          <text fontSize={12} className="select-none" style={{ filter: "drop-shadow(0 0 3px rgba(0,0,0,0.9))" }}>
            <animateMotion dur="8s" repeatCount="indefinite" path="M0,0 Q12,-6 8,-12 Q4,-6 -4,0 Q0,4 0,0" />
            ✈️
          </text>
        </Marker>
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

      {/* Minimal legend */}
      <div className="absolute bottom-3 left-3 bg-zinc-950/90 border border-zinc-800 rounded-lg px-2.5 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-[9px] text-zinc-500">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Konflikt</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Iran</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-cyan-500" /> NATO</span>
        </div>
      </div>
    </div>
  );
}
