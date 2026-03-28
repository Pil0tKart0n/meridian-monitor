# Performance Rules

## Performance Budgets (HARD RULE)
- Every user-facing feature MUST have performance budgets BEFORE implementation
- Budgets are defined in `docs/contracts/PERF-BUDGETS.md` (or `docs/performance/budgets.md`)
- Budget format: metric + threshold + measurement method + CI gate + owner
- **No "we'll optimize later"** — budgets are set during Design (Phase 2), enforced during Build (Phase 3)
- Budget violation in CI → PR blocked. Budget violation in production → alert + PDR required.

## Measurement (HARD RULE)
- **Percentiles, not averages** — always report p50, p95, p99. Averages hide tail latency.
- **Before/After required** — no optimization claim without measured baseline and measured result
- **Environment documented** — every measurement includes: tool, environment, load level, duration
- **Coordinated Omission awareness** — only use CO-aware tools for load testing (k6, wrk2, Gatling)
- Naive benchmarks (Apache Bench, simple `time curl`) are directional only, never for budget enforcement

## Regression Detection (HARD RULE)
- CI pipeline MUST include performance gates (bundle size, Lighthouse, smoke load test)
- Regression tolerance: p95 ≤ +5%, p99 ≤ +10% vs. baseline
- Baselines are auto-updated from nightly runs (rolling average of 5 runs)
- Manual baseline reset requires a PDR documenting why
- **Ratchet principle:** Performance only moves in one direction — better or same

## Caching (HARD RULE)
- Every cache MUST have: TTL, max size, eviction policy, invalidation strategy, monitoring
- **No unbounded caches** — always set `maxSize` or `maxmemory`
- **No PII in shared caches** (Redis, CDN) — private data → browser cache only or encrypted
- Cache sizing via Little's Law: `items = arrival_rate × TTL`
- Cache stampede protection required for entries with > 10 RPS
- Cache hit rate monitored — if < 80%, review cache strategy

## Database Queries
- New queries MUST have EXPLAIN ANALYZE output reviewed before merge
- Sequential scans on tables > 10k rows → requires index or explicit justification
- Query time budget: p95 ≤ 50ms per query (from cross-skill-standards)
- N+1 detection: OTel traces showing N DB spans per request → fix immediately
- Connection pool sized via Little's Law: `connections = RPS × avg_query_time`

## Frontend Performance
- Core Web Vitals budgets enforced in CI (Lighthouse CI)
- LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 (from cross-skill-standards)
- JS bundle ≤ 150 kB gzipped initial load
- Images: optimized format (WebP/AVIF), explicit dimensions, lazy loading below fold
- No computation > 50ms on main thread — offload to Web Worker
- **Animation constraints:** nur `transform` + `opacity` animieren (CLS-Prävention, siehe `design.md`)
- **Animation durations:** Entry ≤ 300ms, Exit ≤ 200ms, Hover ≤ 150ms — Loading-Feedback erst nach 150-300ms Delay
- **Stagger budget:** max 80ms zwischen Items, max 5 Items gestaffelt (Rest instant)
- **Kein initial page load animation** above the fold — respektiert LCP-Budget

## Algorithm Complexity
- Hot paths (> 100 calls/sec): nothing above O(n log n)
- Request handlers: O(n²) acceptable only for n < 1000
- **Data structure choice matters:** `Map` over `Object` for lookups, `Set` over `Array.includes`, avoid `Array.shift`
- Streaming for data > 1 MB — never buffer unbounded data in memory

## Memory Management
- No growing data structures without bounds (cache, Map, Set, Array) — always bounded
- Event listeners: always `removeEventListener` or `AbortController`
- Temp files: OS temp directory, unique names, try/finally cleanup, size limits
- Memory leak suspected → soak test (4h+) with heap snapshot comparison

## Load Testing
- Smoke test: every PR (5 VUs, 2 min, critical paths)
- Full load test: nightly (expected traffic, 15 min)
- Soak test: weekly (sustained load, 4+ hours)
- Results format: p50/p95/p99 per endpoint, error rate, RPS, tool version, environment

## Documentation (HARD RULE)
- **Performance optimization → PDR required** (Performance Decision Record in `docs/performance/decisions/`)
- PDR format: Problem + Options + Decision + Before/After Measurements + Consequences
- Load test results → `docs/performance/reports/`
- Baselines → `docs/performance/baselines/`
- No undocumented performance decisions — every trade-off gets a PDR

## Anti-Patterns (vermeiden)
- **Premature optimization:** Optimize measured bottlenecks, not guesses
- **Averages without percentiles:** Average latency 50ms means nothing if p99 is 5s
- **Cache without invalidation plan:** "Just set TTL" without understanding data lifecycle
- **Load test without CO awareness:** Results from naive tools are misleading
- **Optimizing the wrong layer:** Profile first, fix the actual bottleneck
- **Memory leak denial:** "RSS grows but GC will clean it up" — verify with soak test
