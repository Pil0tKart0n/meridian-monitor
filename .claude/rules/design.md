# Design Rules

## Tokens & Consistency (HARD RULES)
- Never use hardcoded color/spacing/font-size/shadow values in components — always tokens
- Token layers: Primitives → Semantics → Components. Never skip layers.
- Spacing: fluid scale with `clamp()` — no arbitrary pixel values
- Border radius: token scale (sm/md/lg/xl/full), not arbitrary
- Shadows: elevation tokens (sm/md/lg), not custom box-shadow
- No magic numbers anywhere — every value from a token or the design scale

## Color System
- Define colors in OKLCH (`oklch(L C H)`) for perceptual uniformity
- Provide hex/rgb fallbacks for older browsers
- Semantic color mapping: bg, text, accent, border, semantic (success/warning/error/info)
- Dark mode: separate designed palette (never mechanical inversion)
- Dark backgrounds: gray-950 (not pure black). Light text: gray-50 (not pure white)
- Contrast: WCAG AA minimum (4.5:1 normal, 3:1 large text, 3:1 UI components)
- Colored shadows: box-shadow uses semi-transparent accent color

## Typography
- Font loading: `next/font` only (no external CDN), `display: swap`, preload main weights
- Fluid sizing: `clamp(min, preferred, max)` — no fixed breakpoint jumps
- Body text: 16px base, 1.5 line-height, max 65ch line length (`max-w-prose`)
- Headings: modular scale (~1.25), 1.2-1.3 line-height, `-0.02em` tracking
- `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs
- `font-optical-sizing: auto` on variable fonts
- Variable fonts preferred (Inter, Geist, Plus Jakarta Sans)

## Animation (HARD RULES)
- Only animate `transform` and `opacity` — never width/height/margin/padding
- `prefers-reduced-motion`: always respect — provide alternative feedback (not just disabled)
- Duration: entry ≤ 300ms, exit ≤ 200ms, hover ≤ 150ms
- Easing: custom curves from tokens, not just `ease-in-out`
- No `transition: all` — list properties explicitly
- CSS-first: use CSS transitions/keyframes before JS libraries
- No animation on initial page load (above the fold)

## Dark Mode
- Toggle: `class` on `<html>` (Tailwind `darkMode: 'class'`)
- Elevation in dark: lighter surface, not deeper shadow
- Reduce accent chroma slightly (avoid neon look)
- Test every component in both themes

## Icons
- One icon library per project (Lucide or Heroicons)
- Consistent sizes: 16px inline, 20px buttons, 24px headers
- `aria-label` on standalone, `aria-hidden="true"` on decorative
- Stroke width consistent with body font weight

## Responsive
- Mobile-first: base styles = mobile, breakpoints add complexity
- Test at: 320px, 640px, 768px, 1024px, 1440px
- Touch targets: 44x44px minimum, 8px gap between targets
- No horizontal scroll at any viewport width

## Anti-Slop (MANDATORY)
- No generic gradients as primary identity
- No mixed icon libraries
- No Lorem Ipsum in reviews — use realistic content
- No "default SaaS" look without distinct brand character
- Proportional inner radii: inner = outer − padding
- Shadows follow consistent light source

## Charts & Data Visualization
- **Chart-Typ nach Daten wählen:** Trend → Line, Vergleich → Bar, Anteil → Donut, Verteilung → Histogram
- Maximal 5 Kategorien in Pie/Donut — darüber hinaus Bar Chart nutzen
- Legende immer sichtbar, nah am Chart — nicht unterhalb eines Scroll-Folds
- Tooltips mit exakten Werten bei Hover (Desktop) / Tap (Mobile)
- Achsen beschriftet mit Einheit und lesbarer Skala
- **A11y:** Farbe nie als einziges Unterscheidungsmerkmal — Patterns, Labels oder Texturen ergänzen
- **A11y:** `aria-label` mit zusammenfassender Beschreibung des Chart-Insights für Screen Reader
- **A11y:** Datentabelle als Alternative für komplexe Charts (Screen Reader, Export)
- Interaktive Chart-Elemente (Punkte, Balken, Segmente): Touch Target ≥ 44px
- Responsive: Charts vereinfachen auf kleinen Screens (weniger Ticks, horizontale Balken statt vertikale)
- Gridlines dezent (gray-200) — dürfen nicht mit Daten konkurrieren
- Eingangs-Animationen respektieren `prefers-reduced-motion`
- Ladezeit: Skeleton/Shimmer während Daten laden, kein leeres Chart-Gerüst
- Error-State: Fehlermeldung mit Retry-Action, kein kaputtes/leeres Chart

## Component State Matrix (HARD RULE)
Jede interaktive Komponente MUSS folgende Zustände definieren (visuell + im Code):

| State | Wann | Visuelles Signal |
|-------|------|-----------------|
| **Default** | Ruhezustand | Basis-Styling |
| **Hover** | Maus über Element (Desktop) | Subtle Elevation/Color-Shift, 150ms ease-out |
| **Active/Pressed** | Klick/Tap | Scale(0.97–0.98), dunklerer Ton, 100ms |
| **Focus-Visible** | Keyboard-Navigation | 2px Outline, Kontrast ≥ 3:1, offset 2px |
| **Disabled** | Nicht interagierbar | Opacity 0.5, cursor: not-allowed, Tooltip mit Grund |
| **Loading** | Aktion läuft | Spinner/Skeleton im Element, pointer-events: none |
| **Error** | Validation fehlgeschlagen | Rote Border + Icon + Message via `aria-describedby` |
| **Empty** | Kein Inhalt | Guidance-Text + CTA (siehe content.md § Empty States) |

- **Kein Button ohne Hover + Focus + Disabled.** Kein Input ohne Error + Disabled.
- States müssen in Dark Mode separat geprüft werden
- `reduced-motion`: Hover/Active-Transitions auf instant, keine Animation

## Micro-Interaction Patterns (HARD RULE)
Standardisierte Feedback-Patterns — nicht pro Komponente neu erfinden:

### Loading Feedback
| Pattern | Wann | Dauer | Implementierung |
|---------|------|-------|----------------|
| **Skeleton** | Strukturierter Content (Listen, Karten, Formulare) | Beliebig | Graue Blöcke in Layout-Form, pulse-Animation |
| **Shimmer** | Kurzes Laden (<1s), einfache Elemente | <1s | Linear-gradient sweep, 1.5s loop |
| **Spinner** | Unbekannte Dauer, einzelne Aktion | Beliebig | 20-24px, mit Label, nach 150-300ms delay einblenden |
| **Progress Bar** | Bekannter Fortschritt (Upload, Multi-Step) | Beliebig | Determinate bar, prozentual, accessible via `aria-valuenow` |
| **Optimistic UI** | Schnelle Aktionen (Toggle, Like, Delete) | Instant | Sofort anzeigen, bei Fehler zurückrollen + Toast |

**HARD RULE:** Loading-Feedback erst nach **150–300ms Delay** anzeigen — verhindert Flicker bei schnellen Responses. Minimum sichtbare Dauer: **300ms** — verhindert "Blitz-Skeleton".

### State Transitions
```
Eintritt (Enter):     200-300ms, ease-out (schnell rein)
Austritt (Exit):      150-200ms, ease-in  (schnell raus)
Hover:                100-150ms, ease-out
Color-Change:         200ms, ease
Layout-Shift:         300ms, ease-in-out (Container-Größe)
Opacity:              200ms, linear
```

### Feedback-Signale
| Aktion | Feedback | Timing |
|--------|----------|--------|
| **Button Click** | Scale(0.97) + Color-Shift | 100ms active, spring back |
| **Form Submit Success** | Grüner Checkmark + kurze Message | 1.5-3s auto-dismiss |
| **Form Submit Error** | Shake-Animation (optional) + Error-Summary + Field-Focus | Persistent bis gefixt |
| **Delete/Destructive** | Confirmation-Dialog VOR Aktion, Undo-Toast NACH Aktion | Toast: 5-8s mit Undo |
| **Toggle** | Smooth slide + Color-Transition | 200ms ease |
| **Drag & Drop** | Grab-Cursor + Elevation + Drop-Zone-Highlight | Immediate, 150ms transitions |
| **Notification/Toast** | Slide-in von oben/rechts | 300ms enter, 200ms exit, 3-8s visible |

## Animation Choreography
Wenn mehrere Elemente zusammen animieren — **Choreographie statt Chaos:**

### Stagger Pattern (Listen, Grids)
```css
/* Items erscheinen nacheinander, nicht alle gleichzeitig */
.item { animation: fadeSlideUp 300ms ease-out both; }
.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }
/* Max 5 sichtbare Items staggern, Rest instant */
/* Stagger-Delay: 30-80ms pro Item */
```

### Page Transitions
- **Inhalt wechseln:** Alter Content fade-out (150ms) → Neuer Content fade-in (200ms)
- **Seitennavigation:** Slide + Fade in Navigationsrichtung (links→rechts = vorwärts)
- **Modal öffnen:** Backdrop fade-in (200ms) + Content scale(0.95→1) + fade-in (250ms)
- **Modal schließen:** Content fade-out (150ms) + Backdrop fade-out (200ms)
- **Drawer/Sheet:** Slide from edge (300ms ease-out), Backdrop parallel

### Hierarchie in Motion
```
1. Wichtigstes Element zuerst (Hero, Hauptaktion)
2. Supporting Elements folgen (50-100ms verzögert)
3. Peripherie zuletzt (Navigation, Footer — oder instant)
```
- Nie mehr als **3 Animations-Ebenen** pro View
- `prefers-reduced-motion`: Alle Stagger/Choreographie auf instant, nur Opacity beibehalten

## Visual Polish Checklist (EMPFOHLEN vor Sprint-Close)
Konkrete Prüfpunkte — der Unterschied zwischen "funktioniert" und "fühlt sich professionell an":

### Hierarchy & Rhythm
- [ ] Klare 1./2./3. Lese-Reihenfolge erkennbar (Headline → Subtext → CTA)
- [ ] Spacing aus Token-Scale (keine willkürlichen Werte)
- [ ] Konsistente Abstände innerhalb und zwischen Sektionen
- [ ] Whitespace als Gestaltungselement (nicht "leerer Platz")

### Affordance & Interactivity
- [ ] Buttons sehen klickbar aus (Farbe + Elevation oder Border)
- [ ] Links erkennbar (Farbe + Underline oder Icon)
- [ ] Form Inputs erkennbar (Border + Background-Unterschied zu Fläche)
- [ ] Disabled-States visuell distinct + Erklärung warum disabled
- [ ] Hover/Focus-States auf JEDEM interaktiven Element

### Consistency
- [ ] Gleiche Komponente = gleiche visuelle Regeln überall
- [ ] Icon-Größen konsistent (16/20/24px System)
- [ ] Button-Styles konsistent (Primary/Secondary/Ghost/Destructive)
- [ ] Spacing konsistent (nicht willkürlich pro Sektion)
- [ ] Border-Radius konsistent (Token-Scale, nicht gemischt)

### Polish Details
- [ ] Shadows folgen konsistenter Lichtquelle
- [ ] Inner Radius = Outer Radius − Padding (proportional)
- [ ] Keine pixeligen Bilder (2x für Retina, oder SVG)
- [ ] Keine abgeschnittenen Texte ohne Ellipsis + Title-Tooltip
- [ ] Tabular Numbers in Tabellen und Zahlenreihen (`font-variant-numeric: tabular-nums`)
- [ ] Echte Anführungszeichen (" " statt " ") und Gedankenstriche (— statt --)
- [ ] Keine visuellen Artefakte bei Theme-Switch (Flash of Wrong Theme)

### Restraint & Intentionality
- [ ] Max 1-2 Akzentfarben pro Screen
- [ ] Max 1-2 "Wow"-Momente (animierter Entrance, highlighted CTA)
- [ ] Dekorative Elemente konkurrieren nicht mit Content
- [ ] Jedes visuelle Element dient einem klaren Zweck

## Design Critique Protocol (EMPFOHLEN)
Formalisierte Design-Bewertung vor Code Review:

### Wann
- Nach jeder UI-Story (Self-Review durch den implementierenden Skill)
- Vor Sprint-Close (Gesamteindruck aller neuen Screens)

### Wie
1. **Playwright MCP Visual Check** — Screenshots bei 320px, 768px, 1440px
2. **Taste Rubric prüfen** (8 Kriterien aus Design SKILL: Hierarchy, Rhythm, Contrast, Affordance, Density, Consistency, Restraint, Intentionality)
3. **State Coverage** — Sind alle States implementiert? (Loading, Error, Empty, Disabled)
4. **Motion Check** — Fühlen sich Transitions smooth und intentional an?
5. **Dark Mode** — Beide Themes geprüft?
6. **Polish Checklist** — Obige Checklist durchgehen

### Gate-Kriterien
- **Blocker:** Fehlende States (kein Loading, kein Error), gebrochene Accessibility, kaputtes Responsive
- **Verbesserung:** Taste Rubric < 6/8 Kriterien, inkonsistente Transitions, fehlende Polish Details
- **Akzeptabel:** Taste Rubric ≥ 6/8, alle States implementiert, alle Viewports getestet

## AI Asset Pipeline (HARD RULE wenn AI-generierte Assets genutzt werden)
Governance für AI-generierte Bilder, Illustrationen, Icons und Grafiken:

### Wann AI-Assets nutzen
| Situation | Empfehlung |
|-----------|-----------|
| **Prototyping / Placeholder** | AI-generiert OK (wird später ersetzt) |
| **Production Hero Images** | AI-generiert OK wenn Style-konsistent und Quality Gate bestanden |
| **Icons** | Lieber Icon-Library (Lucide/Heroicons) — AI-generierte Icons sind inkonsistent |
| **Logos / Branding** | AI als Inspiration, finale Version manuell oder von Designer — Lizenz-Risiko |
| **Pixel-Art / Game Assets** | PixelLab MCP — speziell dafür gebaut |
| **Illustrationen / Hi-Res** | Scenario.com via n8n — kontrollierte Generierung |

### Quality Gates für AI-Assets
- [ ] **Style-Konsistenz:** Passt zum Art-Direction-Dokument (`docs/design/art-direction.md`)?
- [ ] **Keine Artefakte:** Keine verzerrten Hände, Gesichter, Text, Logos
- [ ] **Auflösung:** Mindestens 2x Display-Größe (Retina-ready)
- [ ] **Transparenz:** Hintergrund korrekt entfernt (wenn nötig)
- [ ] **Format:** WebP/AVIF für Photos, SVG für Vektoren, PNG für Transparenz
- [ ] **Lizenz:** AI-generierte Assets dokumentieren (Tool + Prompt + Datum) in `docs/design/asset-log.md`
- [ ] **Consistency Check:** Neben existierende Assets legen — passt der Stil?

### Master Style Prompt
Für Style-Konsistenz über mehrere AI-Generierungen:
- **Ein** Master-Prompt pro Projekt in `docs/design/art-direction.md` § Style Prompt
- Beschreibt: Stil, Farbpalette, Stimmung, Perspektive, Level-of-Detail
- Jede Generierung nutzt den Master-Prompt als Basis + Asset-spezifische Ergänzungen
- Prompt-History in `docs/design/asset-log.md` festhalten (Reproduzierbarkeit)

### Anti-Patterns
- **Style-Inkonsistenz:** 5 verschiedene AI-Stile in einem Projekt → Master Style Prompt nutzen
- **Ungeprüfte Assets:** AI-Output direkt in Production → Quality Gate ist Pflicht
- **Lizenz-Ignoranz:** "Ist ja AI-generiert, gehört mir" → Nutzungsrechte projektspezifisch klären
- **Logo-Generierung:** AI-generierte Logos haben rechtliche Graubereiche → für finale Logos manuell erstellen oder Lizenz klären

## Performance as Design
- `content-visibility: auto` on off-screen sections
- `aspect-ratio` on images/video (prevent CLS)
- CLS < 0.1, LCP < 2.5s, INP < 200ms
