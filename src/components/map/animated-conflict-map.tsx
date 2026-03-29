"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Crosshair, Info, Maximize2, Minimize2 } from "lucide-react";

interface ConflictEvent {
  id: string;
  type: "airstrike" | "rocket" | "naval" | "troops" | "nuclear" | "explosion";
  x: number;
  y: number;
  label: string;
  emoji: string;
  faction: keyof typeof FACTIONS;
  animationDelay?: number;
}

interface Country {
  id: string;
  name: string;
  path: string;
  fill: string;
  labelX: number;
  labelY: number;
}

const FACTIONS = {
  israel: { name: "Israel / IDF", color: "#3b82f6", bg: "bg-blue-500" },
  hamas: { name: "Hamas", color: "#16a34a", bg: "bg-green-600" },
  hezbollah: { name: "Hisbollah", color: "#eab308", bg: "bg-yellow-500" },
  iran: { name: "Iran / IRGC", color: "#a855f7", bg: "bg-purple-500" },
  houthi: { name: "Huthi-Milizen", color: "#ef4444", bg: "bg-red-500" },
  nato: { name: "NATO / USA", color: "#0ea5e9", bg: "bg-sky-500" },
  russia: { name: "Russland", color: "#f43f5e", bg: "bg-rose-500" },
  turkey: { name: "Tuerkei", color: "#f97316", bg: "bg-orange-500" },
} as const;

// Simplified country shapes for the Middle East region (SVG paths in viewBox 0 0 800 600)
const COUNTRIES: Country[] = [
  {
    id: "israel",
    name: "Israel",
    path: "M280,245 L285,235 L290,230 L295,235 L292,250 L290,270 L288,285 L285,300 L280,310 L278,295 L280,275 L282,260 Z",
    fill: "#1e3a5f",
    labelX: 275,
    labelY: 265,
  },
  {
    id: "palestine",
    name: "Gaza",
    path: "M268,290 L275,288 L278,295 L275,305 L270,305 L268,298 Z",
    fill: "#1a3d1a",
    labelX: 265,
    labelY: 298,
  },
  {
    id: "lebanon",
    name: "Libanon",
    path: "M282,210 L290,205 L295,210 L295,225 L290,230 L285,235 L280,230 L278,220 Z",
    fill: "#2d1f3d",
    labelX: 278,
    labelY: 218,
  },
  {
    id: "syria",
    name: "Syrien",
    path: "M295,170 L340,155 L380,165 L390,190 L380,215 L350,230 L320,240 L295,235 L290,230 L295,225 L295,210 L300,195 Z",
    fill: "#2a2020",
    labelX: 335,
    labelY: 200,
  },
  {
    id: "jordan",
    name: "Jordanien",
    path: "M295,235 L320,240 L350,230 L360,250 L370,280 L350,320 L320,350 L300,340 L285,310 L280,310 L288,285 L290,270 L292,250 L295,235 Z",
    fill: "#2d2518",
    labelX: 325,
    labelY: 290,
  },
  {
    id: "egypt",
    name: "Aegypten",
    path: "M140,280 L200,260 L250,270 L268,290 L268,298 L270,305 L275,305 L280,310 L285,310 L260,370 L220,420 L180,460 L140,470 L100,450 L80,400 L100,340 L120,300 Z",
    fill: "#1a1a2e",
    labelX: 175,
    labelY: 380,
  },
  {
    id: "saudi",
    name: "Saudi-Arabien",
    path: "M300,340 L350,320 L370,280 L420,300 L500,320 L540,380 L520,440 L480,480 L420,500 L360,490 L320,460 L280,420 L270,380 Z",
    fill: "#1a2218",
    labelX: 400,
    labelY: 410,
  },
  {
    id: "iraq",
    name: "Irak",
    path: "M380,165 L420,150 L470,160 L500,190 L510,230 L490,270 L460,290 L420,300 L370,280 L360,250 L350,230 L380,215 L390,190 Z",
    fill: "#1f1a18",
    labelX: 435,
    labelY: 225,
  },
  {
    id: "iran",
    name: "Iran",
    path: "M500,120 L560,100 L630,110 L680,140 L720,180 L730,240 L710,300 L660,340 L600,350 L540,330 L510,300 L500,270 L510,230 L500,190 L470,160 L480,140 Z",
    fill: "#261a2e",
    labelX: 610,
    labelY: 220,
  },
  {
    id: "turkey",
    name: "Tuerkei",
    path: "M180,100 L250,80 L320,85 L380,95 L420,100 L450,120 L420,150 L380,165 L340,155 L295,170 L260,160 L220,140 L190,130 Z",
    fill: "#2e1a18",
    labelX: 310,
    labelY: 120,
  },
  {
    id: "yemen",
    name: "Jemen",
    path: "M420,500 L480,480 L540,480 L580,490 L600,510 L580,540 L520,560 L460,550 L420,530 Z",
    fill: "#1a1518",
    labelX: 510,
    labelY: 520,
  },
  {
    id: "mediterranean",
    name: "Mittelmeer",
    path: "M20,100 L180,100 L190,130 L220,140 L260,160 L280,180 L282,210 L278,220 L250,270 L200,260 L140,280 L80,250 L40,200 L20,150 Z",
    fill: "#0a1628",
    labelX: 120,
    labelY: 180,
  },
  {
    id: "redsea",
    name: "Rotes Meer",
    path: "M260,370 L280,420 L320,460 L340,480 L360,490 L420,500 L420,530 L380,540 L320,520 L280,480 L250,440 L240,400 Z",
    fill: "#0a1628",
    labelX: 310,
    labelY: 470,
  },
];

const EVENTS: ConflictEvent[] = [
  { id: "e1", type: "airstrike", x: 272, y: 296, label: "Luftangriffe Gaza", emoji: "💥", faction: "israel", animationDelay: 0 },
  { id: "e2", type: "rocket", x: 282, y: 222, label: "Hisbollah-Raketen", emoji: "🚀", faction: "hezbollah", animationDelay: 200 },
  { id: "e3", type: "rocket", x: 286, y: 248, label: "Gegenfeuer IDF", emoji: "🎯", faction: "israel", animationDelay: 400 },
  { id: "e4", type: "troops", x: 290, y: 270, label: "IDF Bodenoffensive", emoji: "🪖", faction: "israel", animationDelay: 600 },
  { id: "e5", type: "airstrike", x: 340, y: 200, label: "Angriff auf Damaskus", emoji: "💥", faction: "israel", animationDelay: 800 },
  { id: "e6", type: "naval", x: 510, y: 520, label: "Huthi Schiffsangriff", emoji: "🚢", faction: "houthi", animationDelay: 1000 },
  { id: "e7", type: "naval", x: 540, y: 500, label: "US Navy Patrouille", emoji: "⚓", faction: "nato", animationDelay: 1200 },
  { id: "e8", type: "nuclear", x: 640, y: 200, label: "Natanz Anlage", emoji: "☢️", faction: "iran", animationDelay: 1400 },
  { id: "e9", type: "troops", x: 660, y: 300, label: "IRGC Mobilisierung", emoji: "⚔️", faction: "iran", animationDelay: 1600 },
  { id: "e10", type: "explosion", x: 300, y: 345, label: "Drohnenangriff", emoji: "🔥", faction: "houthi", animationDelay: 1800 },
  { id: "e11", type: "rocket", x: 420, y: 155, label: "Tuerkische Ops", emoji: "🇹🇷", faction: "turkey", animationDelay: 2000 },
  { id: "e12", type: "naval", x: 120, y: 170, label: "NATO Flotte", emoji: "🛟", faction: "nato", animationDelay: 2200 },
];

// Supply routes (animated dashed lines)
const SUPPLY_ROUTES = [
  { from: { x: 640, y: 250 }, to: { x: 340, y: 200 }, label: "Iran → Syrien", color: "#a855f7" },
  { from: { x: 340, y: 200 }, to: { x: 282, y: 222 }, label: "Syrien → Hisbollah", color: "#eab308" },
  { from: { x: 640, y: 300 }, to: { x: 510, y: 520 }, label: "Iran → Huthis", color: "#ef4444" },
  { from: { x: 640, y: 250 }, to: { x: 272, y: 296 }, label: "Iran → Hamas", color: "#16a34a" },
];

export function AnimatedConflictMap() {
  const [selectedEvent, setSelectedEvent] = useState<ConflictEvent | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState<Set<string>>(new Set());
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Stagger event appearance
  useEffect(() => {
    const timers = EVENTS.map((event) =>
      setTimeout(() => {
        setVisibleEvents((prev) => new Set([...prev, event.id]));
      }, (event.animationDelay ?? 0) + 500)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const getEventColor = useCallback((event: ConflictEvent) => {
    return FACTIONS[event.faction]?.color ?? "#888";
  }, []);

  return (
    <div className={cn(
      "relative rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950",
      isFullscreen && "fixed inset-0 z-50 rounded-none border-none"
    )}>
      {/* Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/90 border border-zinc-800 backdrop-blur-sm">
          <Crosshair className="h-3.5 w-3.5 text-red-500" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Live Konfliktzone</span>
          <span className="relative flex h-1.5 w-1.5 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-zinc-950/90 border border-zinc-800 backdrop-blur-sm text-zinc-400 hover:text-white transition-colors"
        aria-label={isFullscreen ? "Vollbild beenden" : "Vollbild"}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>

      {/* SVG Map */}
      <svg
        viewBox="0 0 800 600"
        className="w-full"
        style={{ aspectRatio: isFullscreen ? "auto" : "4/3", height: isFullscreen ? "100vh" : undefined }}
      >
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Pulse animation for active events */}
          <filter id="pulseGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Animated dash pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(63,63,70,0.15)" strokeWidth="0.5" />
          </pattern>

          {/* Gradient for water */}
          <radialGradient id="waterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0a2540" />
            <stop offset="100%" stopColor="#050d18" />
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width="800" height="600" fill="#09090b" />
        <rect width="800" height="600" fill="url(#grid)" />

        {/* Countries */}
        {COUNTRIES.map((country) => (
          <g key={country.id}>
            <path
              d={country.path}
              fill={hoveredCountry === country.id
                ? (country.id === "mediterranean" || country.id === "redsea" ? "#0d1e35" : "#2a2a35")
                : country.fill
              }
              stroke={country.id === "mediterranean" || country.id === "redsea" ? "transparent" : "#3f3f46"}
              strokeWidth={country.id === "mediterranean" || country.id === "redsea" ? 0 : 1}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredCountry(country.id)}
              onMouseLeave={() => setHoveredCountry(null)}
              opacity={hoveredCountry && hoveredCountry !== country.id ? 0.7 : 1}
            />
            {/* Country labels */}
            {country.id !== "mediterranean" && country.id !== "redsea" && (
              <text
                x={country.labelX}
                y={country.labelY}
                textAnchor="middle"
                className="pointer-events-none select-none"
                fill={hoveredCountry === country.id ? "#fafafa" : "#525252"}
                fontSize="10"
                fontWeight="700"
                letterSpacing="0.05em"
              >
                {country.name}
              </text>
            )}
            {/* Water labels */}
            {(country.id === "mediterranean" || country.id === "redsea") && (
              <text
                x={country.labelX}
                y={country.labelY}
                textAnchor="middle"
                className="pointer-events-none select-none"
                fill="#1e3a5f"
                fontSize="9"
                fontWeight="600"
                fontStyle="italic"
                letterSpacing="0.1em"
              >
                {country.name}
              </text>
            )}
          </g>
        ))}

        {/* Supply Routes (animated) */}
        {SUPPLY_ROUTES.map((route, i) => (
          <g key={`route-${i}`}>
            <line
              x1={route.from.x}
              y1={route.from.y}
              x2={route.to.x}
              y2={route.to.y}
              stroke={route.color}
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.3"
              className="animate-dash"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-20"
                dur="2s"
                repeatCount="indefinite"
              />
            </line>
            {/* Arrow at destination */}
            <circle
              cx={route.to.x}
              cy={route.to.y}
              r="3"
              fill={route.color}
              opacity="0.4"
            >
              <animate
                attributeName="r"
                values="2;4;2"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.4;0.1;0.4"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}

        {/* Conflict Events */}
        {EVENTS.map((event) => {
          const isVisible = visibleEvents.has(event.id);
          const isSelected = selectedEvent?.id === event.id;
          const color = getEventColor(event);

          return (
            <g
              key={event.id}
              className={cn("cursor-pointer transition-all", isVisible ? "opacity-100" : "opacity-0")}
              onClick={() => setSelectedEvent(isSelected ? null : event)}
            >
              {/* Outer pulse ring */}
              <circle cx={event.x} cy={event.y} r="12" fill="none" stroke={color} strokeWidth="1" opacity="0.2">
                <animate attributeName="r" values="8;18;8" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
              </circle>

              {/* Inner glow */}
              <circle cx={event.x} cy={event.y} r="6" fill={color} opacity="0.15" filter="url(#pulseGlow)">
                <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* Core dot */}
              <circle
                cx={event.x}
                cy={event.y}
                r={isSelected ? 5 : 3.5}
                fill={color}
                stroke={isSelected ? "#fff" : "none"}
                strokeWidth={isSelected ? 1.5 : 0}
                className="transition-all duration-200"
              />

              {/* Emoji label */}
              <text
                x={event.x}
                y={event.y - 14}
                textAnchor="middle"
                fontSize="14"
                className="pointer-events-none select-none"
              >
                {event.emoji}
              </text>

              {/* Tooltip on hover/select */}
              {isSelected && (
                <g>
                  <rect
                    x={event.x + 12}
                    y={event.y - 16}
                    width={event.label.length * 6.5 + 16}
                    height="24"
                    rx="6"
                    fill="#18181b"
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x={event.x + 20}
                    y={event.y + 1}
                    fill="#fafafa"
                    fontSize="10"
                    fontWeight="600"
                    className="pointer-events-none"
                  >
                    {event.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Bottom Legend Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pt-8 pb-3 px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {Object.entries(FACTIONS).map(([key, faction]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", faction.bg)} />
              <span className="text-[10px] text-zinc-500">{faction.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Detail Panel */}
      {selectedEvent && (
        <div className="absolute bottom-16 left-4 right-4 sm:left-auto sm:right-4 sm:w-72 rounded-xl bg-zinc-900/95 border border-zinc-800 backdrop-blur-sm p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedEvent.emoji}</span>
            <div>
              <p className="text-sm font-bold">{selectedEvent.label}</p>
              <p className="text-[10px] text-zinc-500">
                {FACTIONS[selectedEvent.faction].name} — {selectedEvent.type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: FACTIONS[selectedEvent.faction].color }} />
            <span className="text-xs text-zinc-400">{FACTIONS[selectedEvent.faction].name}</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedEvent(null)}
            className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 py-1 transition-colors"
          >
            Schliessen
          </button>
        </div>
      )}
    </div>
  );
}
