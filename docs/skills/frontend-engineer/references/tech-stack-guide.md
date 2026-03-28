# Tech Stack Decision Guide

## Decision Axes

**Axis 1 – Rendering / SEO:**
- SEO critical → SSR/SSG meta-framework (Next.js, Astro, or React Router v7 framework mode)
- Internal tool / app behind auth → SPA

**Axis 2 – Complexity:**
- Interactive UI, fast iteration → React
- Heavy enterprise, many teams, strict architecture → Angular (dedicated skill)
- Zero dependencies, static → Plain HTML/CSS/JS

---

## React + TypeScript + Tailwind CSS (Primary Stack)

**Choose when:** Team 1–8, SPAs, dashboards, tools, prototypes, content sites with SSR needs.

### Libraries (2026)

| Concern | Library | Notes |
|---------|---------|-------|
| Routing | **React Router v7** (default) | Broad ecosystem, framework mode for SSR (merged with Remix) |
| Routing (alt) | TanStack Router | When strict type-safe params/search are a hard requirement |
| Data fetching | TanStack Query v5 | Caching, retry, invalidation, devtools |
| Client state | Zustand | Minimal API, TS-native, no boilerplate |
| Forms | React Hook Form + Zod | Performant, schema-first, typed |
| Styling | Tailwind CSS v4 + `@tailwindcss/vite` | Utility-first, CSS vars for tokens |
| Class merging | `clsx` + `tailwind-merge` (via `cn()`) | Conflict-free conditionals |
| Animation | Motion (ex Framer Motion) | Declarative, layout, gestures |
| Icons | Lucide React | Tree-shakeable, consistent |
| Testing | Vitest + Testing Library | Fast, ESM-native |
| API mocking | MSW v2 | Network-level, tests + dev |
| Error reporting | Sentry (or similar) | Production error tracking |
| Linting | ESLint + Prettier | Consistent style |
| Positioning | Floating UI | Tooltips, popovers, dropdowns (portal + anchor) |

### `cn()` Utility (required)

```typescript
// src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Referenced throughout the skill. Resolves Tailwind class conflicts in conditional styling.

### Scaffolding

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm install tailwindcss @tailwindcss/vite
npm install @tanstack/react-query zustand react-hook-form zod @hookform/resolvers clsx tailwind-merge
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw
# Optional: devtools
npm install -D @tanstack/react-query-devtools
```

### Router Choice

**React Router v7** (default):
- Broad adoption, large ecosystem, well-documented.
- Framework mode available for SSR/file-based routing. **React Router v7 framework mode absorbs Remix patterns** – if someone asks about Remix, point them here.
- Use this unless you have a specific reason not to.

**TanStack Router** (alternative):
- Superior type-safety for route params, search params, loaders.
- Pick when search-param-heavy apps (dashboards, filters) need compile-time safety.
- Smaller ecosystem. More migration risk.

---

## SSR / SSG (SEO-critical)

**When to use:** Public-facing pages, blogs, marketing, e-commerce. Any page that needs search engine indexing or social previews.

### Framework Decision

| Factor | Next.js | Astro | React Router v7 (framework) |
|--------|---------|-------|----------------------------:|
| Interactivity | High | Low–medium (islands) | High |
| Content-heavy | Good | Excellent (zero JS default) | Good |
| React ecosystem | Full | Partial (islands) | Full |
| SSR + SPA hybrid | Excellent | Limited | Good |
| Maturity | Very high | High | Growing |

**Simple rule:**
- Mostly static content, blog, docs → **Astro**
- React SPA + some SSR pages → **Next.js** or **React Router v7 framework mode**
- Full interactive app + SSR → **Next.js**

### If Next.js: Must-Follow Rules

When using Next.js, these rules prevent the most common production bugs:

- [ ] **`'use client'` at leaves, not roots.** Push client boundaries as low as possible. Server components are the default.
- [ ] **Slim props across boundaries.** Only serialize fields the client actually uses.
- [ ] **File conventions:** `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`. Missing these = broken UX.
- [ ] **`next/image` for raster images.** Handles optimization, lazy loading, CLS prevention. Exceptions: inline SVG icons, data URIs, and `<picture>` with art direction – use raw `<img>` or `<picture>` there.
- [ ] **`next/font` for fonts.** Self-hosted, zero layout shift, subset automatically.
- [ ] **Hydration traps:** `Date`, `Math.random()`, `window.*` differ server/client. See hydration rules in `ui-quality-rules.md`.
- [ ] **Metadata API** for SEO (`generateMetadata` or `metadata` export, not manual `<head>`).
- [ ] **Route handlers** (`route.ts`) for API, not Express-style middleware hacks.
- [ ] **Suspense boundaries** for async components. Missing `<Suspense>` = full-page loading state.

### SEO Essentials (always include)

```html
<head>
  <title>Page Title – Site Name</title>
  <meta name="description" content="Under 160 chars" />
  <link rel="canonical" href="https://example.com/page" />
  <meta property="og:title" content="Page Title" />
  <meta property="og:description" content="Description" />
  <meta property="og:image" content="https://example.com/og.jpg" />
  <meta name="robots" content="index, follow" />
</head>
```

- Semantic HTML: `<main>`, `<article>`, `<nav>`, `<header>`, `<footer>`.
- Structured data (JSON-LD) for product/article/FAQ when applicable.
- Sitemap + robots.txt.

**SEO is also performance + accessibility.** Core Web Vitals and a11y quality directly affect search ranking. Use Lighthouse / CrUX to track both.

---

## Plain HTML + CSS + JavaScript

**Choose when:** Zero build tools, landing page, email template, embeddable widget.

```
project/
├── index.html
├── styles/
│   ├── reset.css
│   ├── tokens.css
│   └── main.css
├── scripts/
│   └── main.js          # type="module"
└── assets/
```

Modern CSS: Grid, Flexbox, `clamp()`, container queries, `:has()`, nesting, `@scope`.
ES modules (`type="module"`). Progressive enhancement: core works without JS.

---

## Angular (Minimal – dedicated skill)

**Choose when:** Enterprise, 5+ dev teams, strict architecture, long maintenance (3+ years).

Stack: Angular + TypeScript + SCSS (component-scoped) + NgRx SignalStore + Vitest + Playwright.

For Angular patterns, architecture, and detailed setup, use the **dedicated Angular skill**.

---

## Library Evaluation

Before adding any dependency:

1. **Bundle size** (bundlephobia.com) – worth the trade-off?
2. **Maintenance** – actively maintained OR stable & widely adopted with no unpatched security issues?
3. **TypeScript** – first-class types?
4. **Tree-shaking** – supported?
5. **80% rule** – can a 50-line utility replace it?

Every dependency is a liability. Add only what earns its place.

---

## Storybook (Design Systems)

When building a shared component library or design system, use Storybook for isolated development, visual testing, and documentation.

```bash
npx storybook@latest init
```

**Story Template:**
```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'], // auto-generate prop docs
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: 'Button', variant: 'primary' } };
export const Loading: Story = { args: { children: 'Saving...', isLoading: true } };
export const Disabled: Story = { args: { children: 'Submit', isDisabled: true } };
```

**Rules:**
- Every shared component (`src/components/`) has a story file.
- Stories cover all variants + states: default, hover, focus, disabled, loading, error.
- `tags: ['autodocs']` for automatic prop documentation from TypeScript types.
- Use Chromatic or Playwright visual regression on stories for design system stability.

---

## Overlay & Layer Strategy

Define a z-index scale as tokens. Never use arbitrary z-index values.

```css
:root {
  --z-dropdown: 100;
  --z-sticky:   200;
  --z-overlay:  300;
  --z-modal:    400;
  --z-popover:  500;
  --z-toast:    600;
  --z-tooltip:  700;
}
```

**Portal strategy:** Render overlays (modals, tooltips, popovers, toasts) via `createPortal` to `document.body` or a dedicated `#portal-root`. This avoids `overflow: hidden` and stacking context traps from parent elements.

**Floating UI** handles anchor positioning + collision detection for tooltips, popovers, and dropdowns. Use it instead of manual `position: absolute` + JS calculations.
