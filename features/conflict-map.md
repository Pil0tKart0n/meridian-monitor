# Conflict Map

## Overview

The Conflict Map provides an interactive geographic visualization of active conflicts, military events, and geopolitical flashpoints across the Middle East and surrounding regions. Built on MapLibre GL JS (open-source, no vendor lock-in), it renders event markers from ACLED and GDELT data, a heatmap layer for conflict intensity, strategic trade route overlays, and a timeline scrubber for historical exploration. The map uses a dark theme consistent with the platform's visual identity.

Premium tier unlocks the full map experience; free users see a limited view with basic markers only.

## User Stories

### CM-1: MapLibre GL JS Base Map

**As a** user, **I want to** see an interactive map focused on the Middle East, **so that** I can explore conflict events geographically.

**Acceptance Criteria:**

- [ ] MapLibre GL JS initialized with a dark-themed base map (e.g., MapTiler Dark or custom style)
- [ ] Default center: Middle East region (~33N, 44E), zoom level 4-5
- [ ] Map tiles: self-hosted or MapTiler free tier (attribution required)
- [ ] Zoom range: min 2 (world view), max 14 (city level)
- [ ] Navigation controls: zoom +/-, compass, geolocate (optional)
- [ ] Responsive: fills container width, minimum height 400px on mobile
- [ ] Touch support: pinch-to-zoom, drag, double-tap zoom
- [ ] Performance: smooth 60fps pan/zoom with up to 5000 markers
- [ ] Accessible: keyboard navigation for map controls, `aria-label` on map container
- [ ] No tile loading errors: fallback to neutral map style if custom tiles fail

---

### CM-2: Event Markers from ACLED/GDELT Data

**As a** user, **I want to** see conflict events plotted on the map, **so that** I can understand where events are happening.

**Acceptance Criteria:**

- [ ] Markers placed at lat/lng from ACLED events and geotagged GDELT events
- [ ] Color-coded by category:
  - Military (red)
  - Diplomatic (blue)
  - Humanitarian (orange)
  - Economic (green)
  - Nuclear (purple)
- [ ] Marker size scales with event severity/score (small: -3 to 3, medium: 4-7, large: 8-10)
- [ ] Clustering at low zoom levels (prevents marker overlap), unclusters on zoom
- [ ] Cluster circles show count and dominant category color
- [ ] Default view: last 30 days of events
- [ ] API: `GET /api/v1/map/events?from=DATE&to=DATE&category=military&bounds=SW_LNG,SW_LAT,NE_LNG,NE_LAT`
- [ ] Map fetches events within current viewport bounds (viewport-based loading)
- [ ] Loading state: subtle spinner overlay during data fetch
- [ ] Maximum 2000 markers rendered simultaneously (server-side limit + client-side clustering)

---

### CM-3: Heatmap Layer for Conflict Intensity

**As a** user, **I want to** see a heatmap overlay showing conflict density, **so that** I can identify hotspots at a glance.

**Acceptance Criteria:**

- [ ] Heatmap layer toggleable via map control button
- [ ] Intensity based on: number of events + severity scores in geographic area
- [ ] Color ramp: transparent (no events) -> yellow -> orange -> red (high intensity)
- [ ] Radius adjusts with zoom level (wider at low zoom, tighter at high zoom)
- [ ] Heatmap and markers can be shown simultaneously or toggled independently
- [ ] Heatmap data aggregated server-side (grid cells) for performance
- [ ] Default: heatmap OFF, markers ON (user can toggle)
- [ ] Accessible: legend explaining color ramp and intensity levels

---

### CM-4: Timeline Scrubber

**As a** user, **I want to** scrub through a timeline to view events from different date ranges, **so that** I can see how conflicts evolve over time.

**Acceptance Criteria:**

- [ ] Horizontal slider at the bottom of the map
- [ ] Range: last 90 days (aligned with GEI rolling window)
- [ ] Draggable range selector: set start and end dates
- [ ] Quick presets: "Last 7 days", "Last 30 days", "Last 90 days"
- [ ] Map markers update when date range changes (debounced, 300ms)
- [ ] Current date range displayed as text label above the slider
- [ ] Play button: auto-advances day by day (1 second per day) to animate conflict evolution
- [ ] Play respects `prefers-reduced-motion` (disabled or slowed)
- [ ] Accessible: keyboard-operable slider (`<input type="range">` or ARIA slider pattern)
- [ ] Premium feature: full 90-day range. Free users: last 7 days only.

---

### CM-5: Trade Route Overlay

**As a** user, **I want to** see strategic trade routes on the map, **so that** I can understand the economic impact of conflicts near shipping lanes.

**Acceptance Criteria:**

- [ ] Toggleable overlay layer showing key trade routes:
  - Suez Canal
  - Red Sea shipping lane (Bab el-Mandeb Strait)
  - Strait of Hormuz
  - Eastern Mediterranean shipping routes
- [ ] Routes rendered as polylines (dashed blue lines, semi-transparent)
- [ ] Key chokepoints labeled with name and daily traffic/volume statistics
- [ ] Events near trade routes (<50km) highlighted with a special indicator
- [ ] Tooltip on route hover: route name, daily vessel traffic, economic significance
- [ ] Route data stored as GeoJSON in the codebase (static data, infrequently changed)
- [ ] Default: overlay OFF (toggled via map control)
- [ ] Premium feature

---

### CM-6: Popup Details on Marker Click

**As a** user, **I want to** click a marker to see event details, **so that** I can understand what happened at that location.

**Acceptance Criteria:**

- [ ] Click on marker opens a popup/tooltip anchored to the marker
- [ ] Popup content:
  - Event title/headline
  - Date and time
  - Category badge
  - Source (ACLED or GDELT + original source name)
  - 2-3 sentence summary
  - Severity score with visual indicator
  - "Read more" link to full article (if available)
- [ ] Only one popup open at a time (clicking another marker closes the previous)
- [ ] Close button on popup (X icon)
- [ ] Popup positioned to avoid going off-screen
- [ ] Mobile: popup appears as a bottom sheet instead of a map popup
- [ ] Accessible: popup focusable, Escape closes it, content readable by screen readers

## Technical Notes

- **MapLibre GL JS:** Open-source fork of Mapbox GL JS. No usage-based pricing. Requires map tile source (MapTiler free tier provides 100k tile requests/month, sufficient for MVP).
- **Tile style:** Use a dark basemap style consistent with the platform's dark theme. Custom style possible via Maputnik editor.
- **Marker rendering:** Use MapLibre's GeoJSON source + symbol/circle layers for performant rendering. Avoid DOM-based markers for large datasets.
- **Clustering:** MapLibre's built-in `cluster` option on GeoJSON sources handles clustering natively.
- **Viewport loading:** Use MapLibre's `moveend` event to fetch events within `map.getBounds()`. Debounce to avoid excessive API calls during pan/zoom.
- **GeoJSON data:** Trade routes stored as static GeoJSON files in `public/geo/` or `src/data/geo/`. ACLED/GDELT events served via API.
- **Timeline animation:** `setInterval` advancing the date range day by day, triggering marker updates. Cancel on pause or component unmount.
- **Bundle size:** MapLibre GL JS is ~200KB gzipped. Load via dynamic import to keep initial bundle small.
- **ADR required:** Map tile provider (MapTiler vs self-hosted tiles vs Protomaps), heatmap aggregation strategy (server-side grid vs client-side)
