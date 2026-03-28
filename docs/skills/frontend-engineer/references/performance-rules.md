# Performance Rules

Prioritized performance rules for React applications. Inspired by Vercel react-best-practices (40+ rules, 8 categories). Each rule has an ID for referencing in code reviews.

---

## Performance Budgets

Set budgets early. Without numbers, "fast enough" is subjective.

| Budget | Target | Why |
|--------|--------|-----|
| **Total transfer** | < 1.5 MB (mobile 3G) | Page must be usable on slow connections |
| **JS (gzip/br)** | < 300 KB | JS is the most expensive byte (parse + execute) |
| **CSS (gzip/br)** | < 100 KB | Blocks rendering if not inlined/deferred |
| **Third-party** | < 200 KB | Often the hidden budget buster |
| **LCP image** | < 500 KB | Largest Contentful Paint is the first impression |
| **Fonts** | < 100 KB total | Subset + variable fonts keep this in check |

Adjust per project. Enforce in CI with `bundlesize`, `size-limit`, or Lighthouse CI budget assertions. A budget that isn't measured is a wish.

**Rule: A performance fix without before/after measurement does not count as done.**

---

## Priority: CRITICAL

These yield the largest real-world gains. Fix before anything else.

### Eliminating Waterfalls

> Waterfalls are the #1 performance killer. Each sequential `await` adds full network latency.

- **`perf-waterfall-parallel`** Use `Promise.all()` for independent operations. Never await sequentially when requests don't depend on each other.

```typescript
// ❌ Sequential – each adds full latency
const user = await fetchUser(userId);
const orders = await fetchOrders(userId);
const prefs = await fetchPreferences(userId);

// ✅ Parallel – total latency = slowest request
const [user, orders, prefs] = await Promise.all([
  fetchUser(userId),
  fetchOrders(userId),
  fetchPreferences(userId),
]);
```

- **`perf-waterfall-defer`** Move `await` into branches where actually used. Don't block code paths that don't need the result.

```typescript
// ❌ Blocks everything
const config = await loadConfig();
if (request.type === 'admin') {
  return adminHandler(config);
}
return publicHandler(); // didn't need config

// ✅ Defer
const configPromise = loadConfig(); // start early
if (request.type === 'admin') {
  return adminHandler(await configPromise); // await late
}
return publicHandler();
```

- **`perf-waterfall-suspense`** Use `<Suspense>` boundaries to stream independent sections. Each boundary unblocks its content independently.

### Bundle Size

- **`perf-bundle-no-barrels`** Avoid barrel files (`index.ts` that re-export everything) in performance-critical paths. Bundlers often can't tree-shake them properly. Prefer direct imports. Exception: small, stable packages where every export is typically used together.

```typescript
// ❌ Pulls in entire module
import { Button } from '@/components';

// ✅ Direct import
import { Button } from '@/components/Button/Button';
```

- **`perf-bundle-dynamic`** Use `React.lazy()` + dynamic `import()` for heavy UI components (charts, editors, rich text, maps). Load them on demand, not at page load.

- **`perf-bundle-third-party`** Defer third-party scripts that aren't needed for initial render. Analytics, chat widgets, tracking → load after hydration.

- **`perf-bundle-icons`** Import individual icons, not the entire icon library. Tree-shaking only works with named imports from tree-shakeable packages.

```typescript
// ❌ Entire library in bundle
import * as Icons from 'lucide-react';

// ✅ Only what you use
import { Search, Menu } from 'lucide-react';
```

### Critical Rendering Path

> The fastest way to improve LCP: eliminate what blocks first paint.

- **`perf-crp-preconnect`** Preconnect to critical third-party origins (CDN, API, fonts) to save DNS + TLS time.

```html
<link rel="preconnect" href="https://cdn.example.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
```

- **`perf-crp-preload`** Preload the LCP image and critical fonts. Only preload 2–3 assets – over-preloading competes with itself.

```html
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />
<link rel="preload" as="font" href="/inter-var.woff2" type="font/woff2" crossorigin />
```

- **`perf-crp-fetchpriority`** Set `fetchpriority="high"` on the LCP image. Set `fetchpriority="low"` on below-the-fold images and non-critical scripts.

- **`perf-crp-fonts`** `font-display: swap` (or `optional` for non-critical fonts). Subset to used character ranges. Variable fonts reduce file count. Max 2 font families.

---

## Priority: HIGH

Significant impact on user-perceived performance.

### Server/Client Boundary (if using SSR)

- **`perf-ssr-slim-props`** Only pass fields the client actually uses across the server/client boundary. Don't serialize a 50-field object when the component uses 3 fields.

- **`perf-ssr-directive`** Place `'use client'` at the lowest possible level. Keep server components as the default. Push client boundaries down to leaves.

- **`perf-ssr-hydration`** Never suppress hydration warnings to mask real bugs. Only `suppressHydrationWarning` for known expected mismatches (timestamps, locale).

### Client-Side Fetching

- **`perf-fetch-dedup`** Deduplicate identical requests. TanStack Query handles this automatically. If using fetch directly, implement request deduplication.

- **`perf-fetch-abort`** Use `AbortController` for cancellable requests. Cancel on unmount, navigation, or when a newer request supersedes.

```typescript
useEffect(() => {
  const controller = new AbortController();
  fetchData({ signal: controller.signal });
  return () => controller.abort();
}, [dependency]);
```

- **`perf-fetch-stale`** Set appropriate `staleTime` in TanStack Query. Default (0) refetches on every mount. For data that changes infrequently, use 5–30 minutes.

### Caching Strategy (HTTP)

- **`perf-cache-immutable`** Hashed assets (`main.a1b2c3.js`): `Cache-Control: public, max-age=31536000, immutable`. The hash IS the cache key – no revalidation needed.

- **`perf-cache-swr`** HTML and API responses that tolerate slight staleness: `Cache-Control: public, max-age=0, stale-while-revalidate=60`. Serves cached copy instantly, revalidates in background.

- **`perf-cache-etag`** For dynamic content: rely on `ETag` / `If-None-Match` (server-side). Returns `304 Not Modified` when content hasn't changed – saves transfer, not latency.

**Rule:** Caching is the highest-leverage optimization after eliminating waterfalls. Review cache headers before micro-optimizing component renders.

### Third-Party Facade Pattern

- **`perf-3p-facade`** Defer heavy third-party scripts (YouTube, Google Maps, chat widgets, analytics) behind a static placeholder. Load the real script on interaction or visibility.

```tsx
function YouTubeFacade({ videoId }: { videoId: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (isLoaded) {
    return <iframe src={`https://www.youtube.com/embed/${videoId}`} /* ... */ />;
  }

  return (
    <button
      onClick={() => setIsLoaded(true)}
      className="relative aspect-video w-full bg-gray-900"
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt="Play video"
        className="h-full w-full object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <PlayIcon className="h-16 w-16 text-white" />
      </span>
    </button>
  );
}
```

**When:** Any third-party embed that adds > 100 KB. Analytics → load after hydration. Chat widgets → load on first interaction. Consent-gated loading (GDPR) fits naturally here.

---

## Priority: MEDIUM

Optimize when the basics are covered.

### Re-render Optimization

- **`perf-render-derived`** Derive values directly instead of syncing with `useEffect`. Effects that just transform state are unnecessary re-render triggers.

```typescript
// ❌ Extra render cycle
const [items, setItems] = useState([]);
const [filteredItems, setFilteredItems] = useState([]);
useEffect(() => {
  setFilteredItems(items.filter(i => i.active));
}, [items]);

// ✅ Derive inline
const filteredItems = useMemo(() => items.filter(i => i.active), [items]);
```

- **`perf-render-stable-deps`** Keep callback references stable with `useCallback` when passed as props to memoized children. Don't wrap everything – only when it prevents measurable re-renders.

- **`perf-render-transition`** Use `useTransition` or `useDeferredValue` for non-urgent updates (search-as-you-type, filtering large lists). Keeps input responsive.

- **`perf-render-no-usememo-simple`** Don't `useMemo` simple expressions (boolean checks, string concatenation). The hook overhead exceeds the computation cost.

### Caching

- **`perf-cache-storage`** `localStorage`/`sessionStorage` reads are synchronous and expensive. Cache in memory (variable/Map) if read multiple times per render cycle.

- **`perf-cache-lru`** For data shared across sequential user actions (click A, then click B needing same data), use an LRU cache instead of re-fetching.

### Layout & Paint

- **`perf-layout-thrash`** Batch DOM reads and writes. Reading `offsetHeight` then writing `style.height` in a loop causes forced reflows.

- **`perf-layout-compositor`** Animate only `transform` and `opacity` (GPU-accelerated). Avoid animating `width`, `height`, `top`, `left` which trigger reflow.

- **`perf-layout-workers`** Move expensive computation (parsing, sorting large datasets) to Web Workers to keep the main thread free for interaction.

---

## Priority: LOW (Advanced)

Incremental gains. Apply when profiling identifies specific bottlenecks.

- **`perf-adv-virtualize`** Virtualize lists > 100 items with `@tanstack/react-virtual` or `react-virtuoso`. See virtualization pattern in `design-patterns.md`.

- **`perf-adv-content-visibility`** Use `content-visibility: auto` for off-screen sections in long scrollable pages. Browser skips rendering until needed.

- **`perf-adv-init-once`** Don't put app-wide initialization (analytics, auth check) in `useEffect([], ...)`. Components can remount. Use a module-level guard:

```typescript
let didInit = false;
function App() {
  useEffect(() => {
    if (didInit) return;
    didInit = true;
    initAnalytics();
    checkAuthToken();
  }, []);
}
```

- **`perf-adv-preconnect`** Use `<link rel="preconnect">` for third-party origins (CDN, API, fonts) to save DNS + TLS handshake time.

---

## Measurement

Lab tools find problems. Field data proves they affect real users. Both are necessary.

- **Lab:** Lighthouse, Chrome DevTools Performance panel, WebPageTest. Use for debugging and identifying specific bottlenecks.
- **Field:** CrUX (Chrome User Experience Report), RUM via `web-vitals` library, Sentry Performance. Use for measuring real user impact.

**Rule:** Lab ≠ Field. A Lighthouse 100 doesn't guarantee fast real-world performance (different devices, networks, geography). Investigate deltas.

```typescript
// Instrument Core Web Vitals (install: npm install web-vitals)
import { onLCP, onINP, onCLS } from 'web-vitals';

function sendToAnalytics(metric: { name: string; value: number; id: string }) {
  // Send to your analytics endpoint (Sentry, custom, etc.)
  navigator.sendBeacon('/analytics', JSON.stringify(metric));
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

**CI integration (optional):** Lighthouse CI budget assertions catch regressions before deploy:

```bash
# .lighthouserc.json (simplified)
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "resource-summary:script:size": ["error", { "maxNumericValue": 300000 }]
      }
    }
  }
}
```

---

## Quick Reference Table

| Priority | Rule ID | Impact |
|----------|---------|--------|
| CRITICAL | `perf-waterfall-parallel` | Eliminates sequential latency |
| CRITICAL | `perf-waterfall-defer` | Avoids blocking unused code paths |
| CRITICAL | `perf-bundle-no-barrels` | Reduces bundle by removing dead code |
| CRITICAL | `perf-bundle-dynamic` | Splits heavy UI into on-demand chunks |
| CRITICAL | `perf-crp-preload` | Fastest LCP improvement |
| CRITICAL | `perf-crp-fetchpriority` | Prioritizes LCP asset loading |
| HIGH | `perf-ssr-slim-props` | Reduces serialized HTML size |
| HIGH | `perf-fetch-abort` | Prevents stale responses + memory leaks |
| HIGH | `perf-fetch-stale` | Reduces unnecessary network requests |
| HIGH | `perf-cache-immutable` | Eliminates revalidation for hashed assets |
| HIGH | `perf-3p-facade` | Defers heavy third-party scripts |
| MEDIUM | `perf-render-derived` | Eliminates extra render cycles |
| MEDIUM | `perf-render-transition` | Keeps input responsive during heavy updates |
| MEDIUM | `perf-layout-compositor` | Enables smooth 60fps animations |
| LOW | `perf-adv-virtualize` | Handles large lists efficiently |
