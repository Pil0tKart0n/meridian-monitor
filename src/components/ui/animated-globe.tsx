"use client";

/**
 * Animated radar/globe SVG — gives the feel of a live monitoring system.
 * Pure CSS animations, no external assets needed.
 */
export function AnimatedGlobe({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Outer glow */}
        <defs>
          <radialGradient id="globe-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.08" />
            <stop offset="70%" stopColor="#f97316" stopOpacity="0.02" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="dot-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background glow */}
        <circle cx="200" cy="200" r="180" fill="url(#globe-glow)" />

        {/* Grid circles */}
        {[60, 90, 120, 150, 170].map((r) => (
          <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="#27272a" strokeWidth="0.5" />
        ))}

        {/* Cross lines */}
        <line x1="200" y1="30" x2="200" y2="370" stroke="#27272a" strokeWidth="0.5" />
        <line x1="30" y1="200" x2="370" y2="200" stroke="#27272a" strokeWidth="0.5" />
        <line x1="80" y1="80" x2="320" y2="320" stroke="#27272a" strokeWidth="0.3" />
        <line x1="320" y1="80" x2="80" y2="320" stroke="#27272a" strokeWidth="0.3" />

        {/* Rotating radar sweep */}
        <g className="origin-center" style={{ transformOrigin: "200px 200px", animation: "spin 6s linear infinite" }}>
          <path d="M200,200 L200,30 A170,170 0 0,1 290,55 Z" fill="url(#dot-glow)" opacity="0.15" />
          <line x1="200" y1="200" x2="200" y2="30" stroke="#f97316" strokeWidth="1" opacity="0.4" />
        </g>

        {/* Conflict hotspot dots */}
        {[
          { x: 220, y: 140, size: 4, delay: 0 },     // Mittelmeer
          { x: 240, y: 155, size: 6, delay: 0.5 },   // Israel/Gaza
          { x: 235, y: 145, size: 3, delay: 1 },     // Libanon
          { x: 260, y: 150, size: 4, delay: 1.5 },   // Syrien
          { x: 280, y: 170, size: 5, delay: 2 },     // Iran
          { x: 250, y: 210, size: 4, delay: 2.5 },   // Jemen/Rotes Meer
          { x: 195, y: 130, size: 3, delay: 3 },     // Tuerkei
          { x: 175, y: 115, size: 3, delay: 3.5 },   // Europa
        ].map((dot, i) => (
          <g key={i}>
            {/* Pulse ring */}
            <circle cx={dot.x} cy={dot.y} r={dot.size * 3} fill="none" stroke="#ef4444" strokeWidth="0.5" opacity="0.3">
              <animate attributeName="r" from={String(dot.size)} to={String(dot.size * 4)} dur="2s" begin={`${dot.delay}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.5" to="0" dur="2s" begin={`${dot.delay}s`} repeatCount="indefinite" />
            </circle>
            {/* Core dot */}
            <circle cx={dot.x} cy={dot.y} r={dot.size} fill="#ef4444" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" begin={`${dot.delay}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* Connection lines between hotspots */}
        {[
          { x1: 280, y1: 170, x2: 240, y2: 155 }, // Iran -> Gaza
          { x1: 280, y1: 170, x2: 235, y2: 145 }, // Iran -> Libanon
          { x1: 280, y1: 170, x2: 250, y2: 210 }, // Iran -> Jemen
          { x1: 280, y1: 170, x2: 260, y2: 150 }, // Iran -> Syrien
        ].map((line, i) => (
          <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#a855f7" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3">
            <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="1s" repeatCount="indefinite" />
          </line>
        ))}

        {/* Center pulse */}
        <circle cx="200" cy="200" r="3" fill="#f97316" opacity="0.8" />
        <circle cx="200" cy="200" r="8" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.3">
          <animate attributeName="r" from="3" to="20" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
