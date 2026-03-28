"use client";

import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { useState, useEffect } from "react";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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

// Events focused on Israel/Gaza/Lebanon area (zoomed in)
const EVENTS: MapEvent[] = [
  // Rockets: Hezbollah -> Northern Israel (Kiryat Shmona)
  {
    id: "hzb-rockets-1",
    type: "rocket",
    from: [35.55, 33.35],
    to: [35.57, 33.2],
    label: "Hisbollah-Raketen auf Nordisrael",
    color: "#eab308",
    active: true,
  },
  // Rockets: Hezbollah -> Haifa direction
  {
    id: "hzb-rockets-2",
    type: "rocket",
    from: [35.4, 33.28],
    to: [35.0, 32.8],
    label: "Hisbollah-Raketen Richtung Haifa",
    color: "#eab308",
    active: true,
  },
  // Rockets: Gaza -> Sderot/Beer Sheva
  {
    id: "gaza-rockets",
    type: "rocket",
    from: [34.47, 31.45],
    to: [34.6, 31.25],
    label: "Raketenbeschuss aus Gaza",
    color: "#22c55e",
    active: true,
  },
  // Airstrike: IDF -> Gaza City
  {
    id: "idf-gaza-city",
    type: "airstrike",
    at: [34.44, 31.52],
    label: "IDF Luftangriffe Gaza-Stadt",
    color: "#3b82f6",
    active: true,
  },
  // Airstrike: IDF -> Rafah
  {
    id: "idf-rafah",
    type: "airstrike",
    at: [34.25, 31.28],
    label: "IDF Luftangriffe Rafah",
    color: "#3b82f6",
    active: true,
  },
  // Airstrike: IDF -> South Lebanon (Hezbollah positions)
  {
    id: "idf-lebanon",
    type: "airstrike",
    from: [35.2, 32.9],
    to: [35.45, 33.25],
    label: "IDF Vergeltungsschlag Libanon",
    color: "#3b82f6",
    active: true,
  },
  // IDF troops at Gaza border
  {
    id: "idf-gaza-border",
    type: "troops",
    at: [34.5, 31.5],
    label: "IDF Bodenoffensive",
    color: "#3b82f6",
    active: true,
  },
  // IDF troops at Lebanon border
  {
    id: "idf-leb-border",
    type: "troops",
    at: [35.3, 33.08],
    label: "IDF Truppenaufbau Nordgrenze",
    color: "#3b82f6",
    active: false,
  },
  // US Navy eastern Mediterranean
  {
    id: "us-navy",
    type: "naval",
    at: [34.0, 33.5],
    label: "USS Gerald Ford Carrier Group",
    color: "#0ea5e9",
    active: false,
  },
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

  // Simple animation tick
  useEffect(() => {
    const interval = setInterval(() => setTime((t) => t + 1), 100);
    return () => clearInterval(interval);
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

        {/* === EVENTS === */}
        {EVENTS.map((event) => {
          // ROCKET / MISSILE: animated line from A to B with moving dot
          if (event.type === "rocket" && event.from && event.to) {
            const progress = ((time * 3) % 100) / 100; // 0..1 cycling
            const midX = event.from[0] + (event.to[0] - event.from[0]) * progress;
            const midY = event.from[1] + (event.to[1] - event.from[1]) * progress;

            return (
              <g key={event.id}>
                {/* Trail line */}
                <Line
                  from={event.from}
                  to={event.to}
                  stroke={event.color}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  opacity={0.3}
                  strokeLinecap="round"
                />
                {/* Moving projectile dot */}
                <Marker coordinates={[midX, midY]}>
                  <circle r={3} fill={event.color} opacity={0.9}>
                    <animate attributeName="r" values="2;4;2" dur="0.5s" repeatCount="indefinite" />
                  </circle>
                  {/* Small trail behind projectile */}
                  <circle r={6} fill={event.color} opacity={0.15} />
                </Marker>
                {/* Origin marker */}
                <Marker coordinates={event.from}>
                  <circle
                    r={3} fill="none" stroke={event.color} strokeWidth={0.8} opacity={0.5}
                    onMouseEnter={() => setSelectedEvent(event)}
                    onMouseLeave={() => setSelectedEvent(null)}
                    className="cursor-pointer"
                  />
                </Marker>
              </g>
            );
          }

          // AIRSTRIKE at a location: expanding rings
          if (event.type === "airstrike" && event.from && event.to) {
            return (
              <g key={event.id}>
                <Line
                  from={event.from}
                  to={event.to}
                  stroke={event.color}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.25}
                  strokeLinecap="round"
                />
                {/* Impact zone */}
                <Marker coordinates={event.to}>
                  <circle r={4} fill={event.color} opacity={0.2}>
                    <animate attributeName="r" values="3;8;3" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle r={2} fill={event.color} opacity={0.5}
                    onMouseEnter={() => setSelectedEvent(event)}
                    onMouseLeave={() => setSelectedEvent(null)}
                    className="cursor-pointer"
                  />
                </Marker>
              </g>
            );
          }

          if (event.type === "airstrike" && event.at) {
            return (
              <Marker key={event.id} coordinates={event.at}>
                {/* Impact ripples */}
                <circle r={5} fill="none" stroke={event.color} strokeWidth={0.8} opacity={0.4}>
                  <animate attributeName="r" values="3;10;3" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle r={3} fill="none" stroke={event.color} strokeWidth={0.5} opacity={0.3}>
                  <animate attributeName="r" values="2;7;2" dur="2s" begin="0.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" begin="0.5s" repeatCount="indefinite" />
                </circle>
                {/* Center flash */}
                <circle r={2.5} fill={event.color} opacity={0.6}
                  onMouseEnter={() => setSelectedEvent(event)}
                  onMouseLeave={() => setSelectedEvent(null)}
                  className="cursor-pointer"
                >
                  <animate attributeName="opacity" values="0.6;0.9;0.6" dur="1s" repeatCount="indefinite" />
                </circle>
              </Marker>
            );
          }

          // NAVAL: ship icon with sonar rings
          if (event.type === "naval" && event.at) {
            return (
              <Marker key={event.id} coordinates={event.at}>
                <circle r={6} fill="none" stroke={event.color} strokeWidth={0.4} opacity={0.2}>
                  <animate attributeName="r" values="5;12;5" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle r={3} fill={event.color} opacity={0.3}
                  onMouseEnter={() => setSelectedEvent(event)}
                  onMouseLeave={() => setSelectedEvent(null)}
                  className="cursor-pointer"
                />
                <rect x={-4} y={-1.5} width={8} height={3} rx={1} fill={event.color} opacity={0.7} />
              </Marker>
            );
          }

          // TROOPS: pulsing circle
          if (event.type === "troops" && event.at) {
            return (
              <Marker key={event.id} coordinates={event.at}>
                <circle r={5} fill={event.color} opacity={0.08} />
                <circle r={3} fill={event.color} opacity={0.15}
                  onMouseEnter={() => setSelectedEvent(event)}
                  onMouseLeave={() => setSelectedEvent(null)}
                  className="cursor-pointer"
                >
                  <animate attributeName="opacity" values="0.15;0.3;0.15" dur="2s" repeatCount="indefinite" />
                </circle>
              </Marker>
            );
          }

          // NUCLEAR: hazard pulse
          if (event.type === "nuclear" && event.at) {
            return (
              <Marker key={event.id} coordinates={event.at}>
                <circle r={6} fill="none" stroke={event.color} strokeWidth={0.6} opacity={0.3}>
                  <animate attributeName="r" values="4;9;4" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle r={3} fill={event.color} opacity={0.4}
                  onMouseEnter={() => setSelectedEvent(event)}
                  onMouseLeave={() => setSelectedEvent(null)}
                  className="cursor-pointer"
                >
                  <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1.5s" repeatCount="indefinite" />
                </circle>
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
