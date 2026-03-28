"use client";

/**
 * Animated War Map — Middle East
 *
 * SVG-based animated battlefield map with:
 * - Simplified country outlines
 * - Animated fighter jets flying patrol routes
 * - Explosion animations at conflict zones
 * - Troop markers with animated pulse
 * - Ships in sea lanes
 * - Missile trajectories
 */
export function AnimatedGlobe({ className = "" }: { className?: string }) {
  return (
    <div className={`relative select-none ${className}`}>
      <svg viewBox="0 0 500 450" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Glow filters */}
          <filter id="explosion-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="soft-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Water pattern */}
          <pattern id="water" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#0c1929" />
            <path d="M0 4 Q2 3 4 4 Q6 5 8 4" fill="none" stroke="#1e3a5f" strokeWidth="0.3" opacity="0.5">
              <animate attributeName="d" values="M0 4 Q2 3 4 4 Q6 5 8 4;M0 4 Q2 5 4 4 Q6 3 8 4;M0 4 Q2 3 4 4 Q6 5 8 4" dur="3s" repeatCount="indefinite" />
            </path>
          </pattern>
        </defs>

        {/* === WATER / SEA === */}
        <rect width="500" height="450" fill="url(#water)" />

        {/* === LAND MASSES (simplified Middle East) === */}
        {/* Turkey */}
        <path d="M80,60 L200,50 L240,70 L250,90 L220,100 L170,95 L120,100 L80,90 Z" fill="#1a1a2e" stroke="#2d2d44" strokeWidth="0.8" />
        <text x="150" y="80" fill="#3f3f5a" fontSize="8" fontWeight="bold" textAnchor="middle">TUERKEI</text>

        {/* Syria */}
        <path d="M220,100 L280,95 L290,120 L280,160 L240,160 L220,140 Z" fill="#1a1a2e" stroke="#2d2d44" strokeWidth="0.8" />
        <text x="255" y="130" fill="#3f3f5a" fontSize="7" fontWeight="bold" textAnchor="middle">SYRIEN</text>

        {/* Iraq */}
        <path d="M280,95 L350,90 L370,130 L360,190 L310,200 L280,160 L290,120 Z" fill="#1a1a2e" stroke="#2d2d44" strokeWidth="0.8" />
        <text x="325" y="145" fill="#3f3f5a" fontSize="8" fontWeight="bold" textAnchor="middle">IRAK</text>

        {/* Iran */}
        <path d="M350,90 L450,80 L480,120 L470,200 L440,250 L390,260 L360,230 L360,190 L370,130 Z" fill="#1a1a2e" stroke="#2d2d44" strokeWidth="0.8" />
        <text x="420" y="165" fill="#3f3f5a" fontSize="9" fontWeight="bold" textAnchor="middle">IRAN</text>

        {/* Lebanon */}
        <path d="M210,120 L225,115 L225,150 L210,155 Z" fill="#1a1a2e" stroke="#2d2d44" strokeWidth="0.8" />
        <text x="218" y="138" fill="#3f3f5a" fontSize="5" fontWeight="bold" textAnchor="middle">LB</text>

        {/* Israel/Palestine */}
        <path d="M205,155 L225,150 L228,200 L215,210 L205,200 Z" fill="#1a1a2e" stroke="#2d2d44" strokeWidth="0.8" />
        <text x="217" y="180" fill="#3f3f5a" fontSize="5" fontWeight="bold" textAnchor="middle">ISR</text>

        {/* Jordan */}
        <path d="M228,165 L280,160 L290,200 L260,230 L228,210 Z" fill="#1a1a2e" stroke="#2d2d44" strokeWidth="0.8" />
        <text x="258" y="195" fill="#3f3f5a" fontSize="7" fontWeight="bold" textAnchor="middle">JORDANIEN</text>

        {/* Egypt */}
        <path d="M100,170 L205,155 L205,200 L215,210 L200,280 L140,320 L80,300 L60,240 L80,190 Z" fill="#1a1a2e" stroke="#2d2d44" strokeWidth="0.8" />
        <text x="140" y="250" fill="#3f3f5a" fontSize="9" fontWeight="bold" textAnchor="middle">AEGYPTEN</text>

        {/* Saudi Arabia */}
        <path d="M260,230 L290,200 L310,200 L360,230 L390,260 L400,310 L370,360 L300,380 L240,350 L220,300 L230,260 Z" fill="#1a1a2e" stroke="#2d2d44" strokeWidth="0.8" />
        <text x="310" y="300" fill="#3f3f5a" fontSize="8" fontWeight="bold" textAnchor="middle">SAUDI-ARABIEN</text>

        {/* Yemen */}
        <path d="M300,380 L370,360 L400,370 L420,400 L350,430 L280,420 L270,400 Z" fill="#1a1a2e" stroke="#2d2d44" strokeWidth="0.8" />
        <text x="345" y="405" fill="#3f3f5a" fontSize="7" fontWeight="bold" textAnchor="middle">JEMEN</text>

        {/* Mediterranean Sea label */}
        <text x="130" y="140" fill="#1e3a5f" fontSize="7" fontStyle="italic" textAnchor="middle" opacity="0.6">Mittelmeer</text>

        {/* Red Sea label */}
        <text x="230" y="330" fill="#1e3a5f" fontSize="6" fontStyle="italic" textAnchor="middle" opacity="0.6" transform="rotate(-60, 230, 330)">Rotes Meer</text>

        {/* Persian Gulf label */}
        <text x="400" y="240" fill="#1e3a5f" fontSize="6" fontStyle="italic" textAnchor="middle" opacity="0.6">Persischer Golf</text>

        {/* === GAZA STRIP (highlighted) === */}
        <rect x="200" y="195" width="8" height="12" fill="#ef4444" opacity="0.6" rx="1">
          <animate attributeName="opacity" values="0.6;0.9;0.6" dur="1s" repeatCount="indefinite" />
        </rect>
        <text x="195" y="218" fill="#ef4444" fontSize="5" fontWeight="bold" textAnchor="middle">GAZA</text>

        {/* === EXPLOSIONS === */}
        {/* Gaza explosions */}
        {[{ x: 203, y: 198, d: 0 }, { x: 206, y: 202, d: 0.7 }, { x: 201, y: 205, d: 1.4 }].map((e, i) => (
          <g key={`exp-gaza-${i}`} filter="url(#explosion-glow)">
            <circle cx={e.x} cy={e.y} r="2" fill="#ff6b35" opacity="0">
              <animate attributeName="r" values="1;8;1" dur="1.5s" begin={`${e.d}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" begin={`${e.d}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={e.x} cy={e.y} r="1" fill="#fbbf24" opacity="0">
              <animate attributeName="r" values="0.5;4;0.5" dur="1.5s" begin={`${e.d}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0;1" dur="1.5s" begin={`${e.d}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* Lebanon border explosions */}
        {[{ x: 218, y: 148, d: 0.3 }, { x: 222, y: 152, d: 1.1 }].map((e, i) => (
          <g key={`exp-lb-${i}`} filter="url(#explosion-glow)">
            <circle cx={e.x} cy={e.y} r="2" fill="#ff6b35" opacity="0">
              <animate attributeName="r" values="1;6;1" dur="2s" begin={`${e.d}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" begin={`${e.d}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* Syria explosions */}
        <g filter="url(#explosion-glow)">
          <circle cx="255" cy="115" r="2" fill="#ff6b35" opacity="0">
            <animate attributeName="r" values="1;7;1" dur="3s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" begin="0.5s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* === FIGHTER JETS === */}
        {/* Israeli F-35 patrol over Gaza */}
        <g filter="url(#soft-glow)">
          <g>
            <animateMotion dur="8s" repeatCount="indefinite" path="M190,170 Q210,180 220,190 Q230,200 215,210 Q200,200 190,185 Z" />
            {/* Jet shape */}
            <polygon points="0,-4 -3,3 0,1 3,3" fill="#3b82f6" opacity="0.9" />
            {/* Contrail */}
            <line x1="0" y1="3" x2="0" y2="10" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3" />
          </g>
        </g>

        {/* US F-18 from carrier in Med */}
        <g filter="url(#soft-glow)">
          <g>
            <animateMotion dur="12s" repeatCount="indefinite" path="M120,130 Q180,110 220,120 Q250,130 240,150 Q220,140 180,135 Q140,140 120,130" />
            <polygon points="0,-5 -4,4 0,1 4,4" fill="#0ea5e9" opacity="0.8" />
            <line x1="0" y1="4" x2="0" y2="12" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.3" />
          </g>
        </g>

        {/* Iranian drone */}
        <g>
          <g>
            <animateMotion dur="15s" repeatCount="indefinite" path="M420,170 Q380,190 350,200 Q320,210 300,220 Q320,210 360,195 Q400,180 420,170" />
            <polygon points="0,-3 -4,2 0,0 4,2" fill="#a855f7" opacity="0.7" />
            <line x1="0" y1="2" x2="0" y2="8" stroke="#a855f7" strokeWidth="0.3" opacity="0.3" />
          </g>
        </g>

        {/* Russian Su-35 over Syria */}
        <g filter="url(#soft-glow)">
          <g>
            <animateMotion dur="10s" repeatCount="indefinite" path="M240,100 Q260,95 280,100 Q270,110 250,115 Q240,110 240,100" />
            <polygon points="0,-4 -3,3 0,1 3,3" fill="#f43f5e" opacity="0.8" />
            <line x1="0" y1="3" x2="0" y2="10" stroke="#f43f5e" strokeWidth="0.5" opacity="0.3" />
          </g>
        </g>

        {/* === MISSILE TRAJECTORIES === */}
        {/* Houthi missile toward Red Sea */}
        <line x1="320" y1="390" x2="250" y2="340" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" opacity="0.5">
          <animate attributeName="stroke-dashoffset" from="0" to="-6" dur="0.5s" repeatCount="indefinite" />
        </line>
        <circle r="2" fill="#ef4444" opacity="0.8">
          <animateMotion dur="3s" repeatCount="indefinite" path="M320,390 L250,340" />
        </circle>

        {/* Hezbollah rockets into Israel */}
        <line x1="220" y1="140" x2="215" y2="165" stroke="#eab308" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4">
          <animate attributeName="stroke-dashoffset" from="0" to="-4" dur="0.3s" repeatCount="indefinite" />
        </line>

        {/* Iran missile test */}
        <line x1="430" y1="150" x2="440" y2="100" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 3" opacity="0.3">
          <animate attributeName="stroke-dashoffset" from="0" to="-7" dur="0.8s" repeatCount="indefinite" />
        </line>

        {/* === SHIPS === */}
        {/* US Aircraft Carrier in Med */}
        <g>
          <rect x="115" y="128" width="12" height="4" rx="1" fill="#0ea5e9" opacity="0.8" />
          <rect x="118" y="126" width="6" height="2" rx="0.5" fill="#0ea5e9" opacity="0.6" />
          <text x="121" y="124" fill="#0ea5e9" fontSize="4" textAnchor="middle" fontWeight="bold" opacity="0.7">CVN</text>
          <circle cx="121" cy="130" r="8" fill="none" stroke="#0ea5e9" strokeWidth="0.3" opacity="0.3">
            <animate attributeName="r" values="8;15;8" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Cargo ship in Red Sea */}
        <g>
          <animateMotion dur="20s" repeatCount="indefinite" path="M210,280 Q220,300 230,320 Q240,340 245,355" />
          <rect x="-5" y="-2" width="10" height="4" rx="1" fill="#6b7280" opacity="0.7" />
          <rect x="-3" y="-4" width="2" height="2" fill="#6b7280" opacity="0.5" />
        </g>

        {/* Iranian naval vessel */}
        <g>
          <animateMotion dur="16s" repeatCount="indefinite" path="M400,230 Q410,240 415,250 Q410,245 405,235 Q400,230 400,230" />
          <rect x="-4" y="-2" width="8" height="3" rx="1" fill="#a855f7" opacity="0.7" />
        </g>

        {/* === TROOP MARKERS === */}
        {/* IDF troops near Gaza */}
        <g>
          <circle cx="195" cy="190" r="6" fill="#3b82f6" opacity="0.15" />
          <text x="195" y="192" fill="#3b82f6" fontSize="7" textAnchor="middle" fontWeight="bold">⚔</text>
          <text x="195" y="200" fill="#3b82f6" fontSize="4" textAnchor="middle" opacity="0.7">IDF</text>
        </g>

        {/* Hezbollah in South Lebanon */}
        <g>
          <circle cx="220" cy="145" r="5" fill="#eab308" opacity="0.15" />
          <text x="220" y="147" fill="#eab308" fontSize="6" textAnchor="middle">⚔</text>
          <text x="220" y="155" fill="#eab308" fontSize="3.5" textAnchor="middle" opacity="0.7">HZB</text>
        </g>

        {/* IRGC in Iran */}
        <g>
          <circle cx="430" cy="155" r="7" fill="#a855f7" opacity="0.1" />
          <text x="430" y="158" fill="#a855f7" fontSize="8" textAnchor="middle">⚔</text>
          <text x="430" y="167" fill="#a855f7" fontSize="4" textAnchor="middle" opacity="0.7">IRGC</text>
        </g>

        {/* Houthis in Yemen */}
        <g>
          <circle cx="330" cy="400" r="5" fill="#ef4444" opacity="0.15" />
          <text x="330" y="402" fill="#ef4444" fontSize="6" textAnchor="middle">⚔</text>
          <text x="330" y="410" fill="#ef4444" fontSize="3.5" textAnchor="middle" opacity="0.7">HUTHI</text>
        </g>

        {/* NATO in Eastern Med */}
        <g>
          <circle cx="100" cy="110" r="6" fill="#0ea5e9" opacity="0.1" />
          <text x="100" y="113" fill="#0ea5e9" fontSize="7" textAnchor="middle">🛡</text>
          <text x="100" y="122" fill="#0ea5e9" fontSize="4" textAnchor="middle" opacity="0.7">NATO</text>
        </g>

        {/* Russian base in Syria */}
        <g>
          <circle cx="245" cy="105" r="5" fill="#f43f5e" opacity="0.15" />
          <text x="245" y="107" fill="#f43f5e" fontSize="6" textAnchor="middle">⭐</text>
          <text x="245" y="98" fill="#f43f5e" fontSize="3.5" textAnchor="middle" opacity="0.7">RUS</text>
        </g>

        {/* === SUPPLY ROUTES (animated dashes) === */}
        {/* Iran -> Hezbollah supply */}
        <path d="M420,170 Q350,160 300,140 Q260,130 220,145" fill="none" stroke="#a855f7" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.25">
          <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="2s" repeatCount="indefinite" />
        </path>

        {/* Iran -> Houthis supply */}
        <path d="M420,200 Q400,260 380,320 Q360,370 330,395" fill="none" stroke="#a855f7" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.25">
          <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="2s" repeatCount="indefinite" />
        </path>

        {/* === LEGEND === */}
        <g transform="translate(15, 370)">
          <rect x="0" y="0" width="85" height="70" rx="4" fill="#09090b" opacity="0.85" stroke="#27272a" strokeWidth="0.5" />
          <text x="42" y="12" fill="#71717a" fontSize="5" textAnchor="middle" fontWeight="bold">FRAKTIONEN</text>
          <circle cx="10" cy="22" r="2.5" fill="#3b82f6" /><text x="18" y="24" fill="#a1a1aa" fontSize="5">Israel / IDF</text>
          <circle cx="10" cy="32" r="2.5" fill="#eab308" /><text x="18" y="34" fill="#a1a1aa" fontSize="5">Hisbollah</text>
          <circle cx="10" cy="42" r="2.5" fill="#a855f7" /><text x="18" y="44" fill="#a1a1aa" fontSize="5">Iran / IRGC</text>
          <circle cx="10" cy="52" r="2.5" fill="#ef4444" /><text x="18" y="54" fill="#a1a1aa" fontSize="5">Huthi-Milizen</text>
          <circle cx="10" cy="62" r="2.5" fill="#0ea5e9" /><text x="18" y="64" fill="#a1a1aa" fontSize="5">NATO / USA</text>
        </g>
      </svg>
    </div>
  );
}
