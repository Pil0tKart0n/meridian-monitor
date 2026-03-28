# Frontend Rules

## Components
- Functional components only (no class components, where applicable)
- Props/inputs: always typed (interface/type), destructured in signature
- Default export for page components, named export for reusable components
- Edge states: always handle loading, error, empty, and success states — visuelle Contracts siehe `design.md` § Component State Matrix + § Micro-Interaction Patterns
- Microcopy: follow content specs from `docs/content/patterns/` (wenn vorhanden) — never improvise button labels, error messages, or empty states when content patterns exist
- Accessibility: semantic HTML, ARIA only when needed, keyboard navigable, WCAG 2.2 AA

## Styling
- Use the project's design token system — never hardcode colors, spacing, shadows
- Responsive: mobile-first, test at 320px, 768px, 1024px, 1440px
- No inline styles (use utility classes or CSS modules depending on stack)
- **Stack-Beispiele:**
  - *Next.js/React:* Tailwind CSS utility classes, shadcn/ui for complex components (Dialog, Dropdown, Toast)
  - *Vite/Vanilla:* CSS Custom Properties + utility classes, or CSS Modules
  - *Game/Canvas:* Design tokens in config objects, CSS only for UI overlays

## State & Data
- Minimize client-side state — prefer server-side data fetching where framework supports it
- Local state for UI-only concerns, shared state for cross-component data
- Forms: validate with Zod (or equivalent schema) at the boundary before submission
- API responses: validate at boundary with schema before use
- **Stack-Beispiele:**
  - *Next.js:* Server Components by default, `"use client"` only for interactivity/hooks/browser APIs. Data fetching in Server Components or Route Handlers.
  - *React SPA:* `useState` for local, `useReducer` for complex, Zustand/Jotai for global. React Hook Form + Zod for forms.
  - *Vite/Vanilla:* EventBus pattern, custom state management, or minimal reactive library. Native HTML forms with Zod validation.

## Performance
- Images: optimized format (WebP/AVIF), lazy loading, explicit dimensions to prevent CLS
- Fonts: self-hosted or bundled (no external CDN), `display: swap`, preload main weights
- Heavy components: lazy load / dynamic import where supported
- Core Web Vitals targets: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1
- **Stack-Beispiele:**
  - *Next.js:* `next/image` with width/height, `next/font`, `dynamic(() => import(...))`
  - *Vite:* Manual `<img>` with `loading="lazy"` + explicit `width`/`height`, `@fontsource` for fonts
  - *Canvas/Game:* Object pooling, viewport culling, sprite atlases, requestAnimationFrame decoupled from logic

## Bundle & Import Hygiene (HARD RULE)
- **Keine Barrel-Imports in Performance-kritischem Code** — `import { Button } from '@/components/Button'` statt `import { Button } from '@/components'`. Barrel-Files (`index.ts`) re-exportieren alles → Tree-Shaking bricht, Bundle wächst.
- **Third-Party Scripts nach Hydration laden** — Analytics, Tracking, Chat-Widgets per `next/script strategy="afterInteractive"` oder dynamischem Import. Nie im Critical Path.
- **Conditional Imports** — Features hinter Feature Flags: `const Module = flags.newFeature ? await import('./NewModule') : await import('./LegacyModule')`. Nie beides in den Bundle laden.
- **Preload on Hover** — Für wahrscheinliche Navigationen: `<Link prefetch={true}>` (Next.js) oder `import()` on hover/focus für perceived speed.

## Server Component Patterns (Next.js)
- **Daten minimieren die an Client Components fließen** — nur die Felder übergeben die der Client braucht, nicht das ganze DB-Objekt. Serialisierung kostet.
- **Parallele Fetches** — unabhängige Daten-Requests mit `Promise.all()` statt sequentiellen `await`s. Wasserfall-Fetches sind der #1 Performance-Killer in RSC.
  ```typescript
  // ❌ Wasserfall — 2. Request wartet auf 1.
  const user = await getUser(id);
  const orders = await getOrders(id);

  // ✅ Parallel — beide gleichzeitig
  const [user, orders] = await Promise.all([getUser(id), getOrders(id)]);
  ```
- **`React.cache()` für Request-Deduplication** — wenn mehrere Server Components dieselben Daten brauchen, `cache()` verhindert doppelte DB-Queries im selben Request.
- **Static I/O auf Modul-Ebene hoisten** — Fonts, Logos, Config die sich nicht ändern: außerhalb der Component-Funktion laden, nicht bei jedem Render.

## SEO & Discoverability
- **Meta Tags (PFLICHT für jede öffentliche Seite):**
  - `<title>` — einzigartig, 50-60 Zeichen, Keyword vorn, Brand hinten: `"Feature — Brand"`
  - `<meta name="description">` — 120-155 Zeichen, Call-to-Action oder Benefit, einzigartig pro Seite
  - Kein Duplicate Title/Description über mehrere Seiten — jede Seite hat eigene Meta
- **Open Graph & Social Sharing:**
  - `og:title`, `og:description`, `og:image` (1200×630px), `og:url`, `og:type`
  - `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image`
  - Social Preview testen: nach Deploy mindestens 1x prüfen (LinkedIn, Twitter, Slack zeigen Preview)
  - *Next.js:* `generateMetadata()` in `layout.tsx`/`page.tsx` — nie `<Head>` direkt
- **Canonical URLs:**
  - Jede Seite hat `<link rel="canonical" href="...">` — verhindert Duplicate Content bei Query-Params, Trailing Slashes, www/non-www
  - *Next.js:* `alternates: { canonical: '...' }` in Metadata
  - Bei paginierten Seiten: Canonical zeigt auf sich selbst (nicht auf Seite 1)
- **Structured Data (JSON-LD):**
  - Schema.org Markup für relevante Entitäten: `Organization`, `Product`, `Article`, `FAQ`, `BreadcrumbList`
  - Als `<script type="application/ld+json">` im `<head>` — nicht per JavaScript injiziert
  - Validieren mit Google Rich Results Test vor Deploy
  - *Next.js:* JSON-LD als `<script>` in Server Component oder via `generateMetadata()`
- **Crawlability:**
  - `robots.txt` — korrekt konfiguriert, keine versehentlichen `Disallow: /` in Production
  - `sitemap.xml` — automatisch generiert, alle öffentlichen Seiten, `lastmod` korrekt
  - *Next.js:* `app/sitemap.ts` + `app/robots.ts` (Route Handlers)
  - Kein Client-Side-Only Content für SEO-relevante Seiten — Server-seitig rendern (SSR/SSG)
- **Semantische HTML-Struktur (SEO-Perspektive):**
  - Eine `<h1>` pro Seite, matcht den `<title>` thematisch
  - Heading-Hierarchie: `h1` → `h2` → `h3` ohne Ebenen zu überspringen
  - `<nav>`, `<main>`, `<article>`, `<aside>` für Crawler-verständliche Seitenstruktur
  - Interne Links mit beschreibendem Anchor-Text — nie "hier klicken" oder nackte URLs
- **Performance als SEO-Faktor:**
  - Core Web Vitals sind Google Ranking-Signal (LCP, INP, CLS — Budgets in § Performance)
  - Render-Blocking Resources minimieren: Critical CSS inline, JS async/defer
  - Largest Contentful Paint: Hero-Image preloaden (`<link rel="preload" as="image">`)
- **Internationalisierung (wenn mehrsprachig):**
  - `<html lang="de">` korrekt gesetzt
  - `hreflang` Tags für Sprachvarianten: `<link rel="alternate" hreflang="en" href="...">`
  - Siehe `.claude/rules/i18n.md` für vollständige i18n-Rules
- **Anti-Patterns:**
  - **Client-Side Rendering für Landing Pages** — Crawler sehen leere Seite → SSR/SSG nutzen
  - **Meta Tags per JavaScript setzen** — Crawler führen JS oft nicht aus → Server-seitig setzen
  - **Gleiche Meta Description auf allen Seiten** — Google ignoriert sie dann komplett
  - **Bilder ohne Alt-Text** — SEO + A11y Problem (siehe `a11y.md`)
  - **Infinite Scroll ohne URL-Änderung** — Content nicht indexierbar → Pagination oder URL-Updates

## Testing
- Unit: test behavior, not implementation (Testing Library, Vitest, or equivalent)
- E2E: Playwright for critical user flows
- A11y: axe-core assertions in tests
- Test IDs: `data-testid="descriptive-name"` for E2E selectors
- E2E API calls: ALWAYS check response status — no fire-and-forget requests
  - Registration/Login helpers MUST verify `response.ok` or expected status code
  - Silent 4xx/5xx in setup steps = hours of debugging downstream
- E2E selectors: use `{ exact: true }` for `getByText` when text is substring of other elements
- E2E locally first: run E2E tests locally before pushing (saves CI roundtrips)
