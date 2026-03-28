# Cross-Skill Standards — Unified Reference

> This document defines the shared standards that all 17 engineering skills adhere to.
> Owned by Project Lead. Technical content governed by Software Architect.
> All skills reference this document for consistency.

---

## 1. Canonical Repo Layout (Single Source of Truth)

Defined by **Software Architect Skill**. All skills MUST follow this layout:

```
project-root/
├── apps/                       # Application code (monorepo: apps/web, apps/api, apps/game-server)
│   ├── web/                    # Frontend application
│   ├── api/                    # Backend API
│   └── game-server/            # Game server (when applicable)
├── packages/                   # Shared libraries (monorepo: packages/shared, packages/ui)
├── docs/
│   ├── adr/                    # ALL architecture decisions (ADR-XXXX-[topic].md)
│   │   └── ADR-0001-...md     # Scoped prefixes: db:, fe:, devops:, game:, process:
│   ├── contracts/              # OpenAPI/AsyncAPI specs
│   │   └── PERF-BUDGETS.md    # Performance budgets (API latency, DB query, CWV)
│   ├── architecture/           # Mermaid diagrams (C4, ER, Sequence, Deployment), architecture briefs
│   ├── runbooks/               # Operational runbooks (DevOps + all skills)
│   ├── quality/                # Quality reports, release readiness (QA + Project Lead)
│   └── requirements/           # Requirement artifacts (discovery outputs)
├── tests/
│   ├── fixtures/               # Shared test fixtures
│   │   └── golden/            # Golden files for snapshot/replay tests
│   ├── e2e/                   # End-to-end tests
│   ├── integration/           # Integration tests
│   └── performance/           # k6/Locust scripts + baselines
├── **GitHub Issues** (labels + milestones)  # Living backlog (Project Lead)
├── CHANGELOG.md                # Auto-generated from Conventional Commits
├── .commitlintrc.json          # Conventional Commits enforcement
└── .github/
    └── workflows/              # CI/CD pipelines
```

**Critical rules:**
- **ADR location:** `docs/adr/` only — NO parallel `docs/database/decisions/` or `docs/architecture/decisions/`
- **Scope prefixes in ADR titles:** `ADR-XXXX-db-topic.md`, `ADR-XXXX-fe-topic.md`, `ADR-XXXX-process-topic.md`
- **Contracts location:** `docs/contracts/` only — OpenAPI, AsyncAPI, performance budgets
- **Deviations:** Require an ADR documenting why

---

## 2. Shared Vocabulary

All skills use these exact terms. No synonyms, no abbreviations (except listed ones).

### Core Process Terms

| Concept | Standard Term | Definition | Owner |
|---------|--------------|-----------|-------|
| Story readiness | **Definition of Ready (DoR)** | All mandatory DoR fields present and verified | Project Lead enforces, Requirements fills |
| Story completeness | **Definition of Done (DoD)** | All code, tests, docs, observability criteria met | Project Lead enforces, all skills contribute |
| Phase check | **Quality Gate** | Automated (CI) + manual criteria before phase transition | QA defines, CI enforces, Project Lead tracks |
| Decision record | **ADR** (Architecture Decision Record) | Numbered, dated, status-tracked. Template from Architect. | Architect owns format, all skills contribute |
| Delivery progress | **GitHub Issues** | Single source of truth via labels + milestones | Project Lead maintains |
| Work unit | **Story** | User-facing or technical increment. Max 3 days (M), 1 day (S). | Requirements writes, team estimates |
| Work group | **Epic** | Collection of related stories towards one outcome | Requirements defines scope, Project Lead tracks |

### Technical Standards

| Concept | Standard Term | Specification | Owner |
|---------|--------------|--------------|-------|
| API description | **OpenAPI 3.1** | YAML in `docs/contracts/` | Architect governs, Backend implements |
| Event description | **AsyncAPI 3.x** | YAML in `docs/contracts/` | Architect governs, Backend implements |
| Commit format | **Conventional Commits 1.0.0** | `type(scope): description` — enforced by commitlint | All skills |
| Version format | **SemVer 2.0.0** | MAJOR.MINOR.PATCH — tied to conventional commits | DevOps automates, all skills follow |
| Branch strategy | **Trunk-based** | `main` + short-lived feature branches (max 2 days) | All skills |
| Trace propagation | **W3C Trace Context** | `traceparent` + `tracestate` headers propagated across all services | Architect mandates, DevOps implements OTel, all skills instrument |
| Request correlation | **requestId** | UUID per request, propagated via header, logged in every service | All skills |
| Error format | **RFC 9457** (Problem Details) | JSON: `{ type, title, status, detail, instance, requestId, traceId }` | Backend implements, Frontend handles, QA verifies |
| Error envelope (WS) | **Error Envelope** | `{ errorCode, message, details, requestId }` for WebSocket | Game Engineer implements |
| Structured logging | **JSON structured logs** | Fields: `timestamp`, `level`, `service`, `requestId`, `traceId`, `message` | All skills |
| Feature toggling | **Feature Flag** | Runtime toggle for progressive rollout, A/B, kill switch | Architect decides tooling, all skills use |

### Performance Budgets (canonical targets)

Defined by Architect, enforced by CI, tracked by Project Lead:

| Layer | Metric | Budget | Measurement |
|-------|--------|--------|-------------|
| **API** | p95 latency | ≤ 200ms (standard), ≤ 50ms (critical path) | k6, OTel traces |
| **API** | p99 latency | ≤ 500ms | k6, OTel traces |
| **DB** | Query time | ≤ 50ms p95 per query | EXPLAIN ANALYZE, pg_stat |
| **DB** | Max rows returned | ≤ 1000 per page (keyset pagination) | Application code |
| **FE** | LCP | ≤ 2.5s | Lighthouse (lab) + CrUX/RUM (field) |
| **FE** | INP | ≤ 200ms | Lighthouse (lab) + CrUX/RUM (field) |
| **FE** | CLS | ≤ 0.1 | Lighthouse (lab) + CrUX/RUM (field) |
| **FE** | JS bundle | ≤ 150 kB gzipped (initial) | Bundler analysis, CI gate |
| **Game** | Tick budget | ≤ 50ms per tick (20 Hz) | Server profiling |
| **Game** | State snapshot | ≤ 16 kB per delta | Wire protocol analysis |

### Reliability Targets

| Tier | SLO | Error Budget (30d) | Example |
|------|-----|-------------------|---------|
| **Tier 1** (critical path) | 99.95% | 21.6 min/month | Auth, payments, core API |
| **Tier 2** (important) | 99.9% | 43.2 min/month | Search, notifications |
| **Tier 3** (best effort) | 99.5% | 3.6 h/month | Analytics, admin tools |

---

## 3. Cross-Skill Contract Standards

### Contract-First Workflow

```
1. Requirements → delivers story with ACs + NFRs
2. Architect → defines/updates OpenAPI/AsyncAPI contract in docs/contracts/
3. Backend → implements against contract. PR must include contract diff if changed.
4. Frontend → implements against contract. Zod schemas at boundary validate shape.
5. QA → contract tests verify provider matches spec, consumer assumptions hold.
6. CI → OpenAPI diff gate blocks breaking changes without ADR + deprecation plan.
```

### Breaking Change Policy

| Change Type | Classification | Gate |
|-------------|---------------|------|
| Add optional field | Non-breaking | Auto-merge OK |
| Add required field | **Breaking** | ADR required, deprecation window ≥ 90 days |
| Remove field | **Breaking** | ADR + Sunset header + client migration plan |
| Change field type | **Breaking** | New field + deprecate old + migration |
| Change endpoint URL | **Breaking** | ADR + redirect + sunset old endpoint |
| Add new endpoint | Non-breaking | Auto-merge OK |
| Remove endpoint | **Breaking** | ADR + Sunset header (min 90 days) + client notification |

### Deprecation Headers (mandatory)

When deprecating an endpoint or field:
```
Sunset: Sat, 01 Jun 2025 00:00:00 GMT    # RFC 7231 date
Deprecation: true                          # Signal to clients
Link: <https://docs.example.com/migration>; rel="sunset"
```

---

## 4. Quality Gate Matrix

| Gate | When | What passes | What fails | Who enforces |
|------|------|------------|------------|-------------|
| **DoR** | Before BUILD | ACs, NFRs, edge cases, test data, design, privacy check | Missing ACs, untestable criteria, no estimate | Project Lead |
| **Architecture Review** | Before BUILD (if new boundary) | ADR approved, contracts defined, SLOs set, threat model done | No ADR for new tech, missing contracts | Architect |
| **CI: Lint + Type** | Every commit | Zero errors | Any error | Automated |
| **CI: Unit + Integration** | Every PR | All pass, coverage ≥ threshold | Failures or coverage drop | Automated + QA |
| **CI: Contract** | Every PR touching contracts | OpenAPI diff clean, provider/consumer tests pass | Breaking change without ADR | Automated |
| **CI: Security** | Every PR | No new CVEs (high/critical), SAST clean | New vulnerability | Automated + DevOps |
| **CI: Performance** | Nightly + PRs touching perf-sensitive code | Budgets met, no regression > 10% | Budget exceeded | Automated + Architect |
| **QA Gate** | Before RELEASE | Quality report green, no P1/P2, a11y pass | Open blockers, test failures | QA |
| **PRR** | Before first production release | Observability, rollback, on-call, SLOs, runbooks | Missing runbook, no monitoring | Architect + DevOps + QA |
| **Migration Safety** | Every PR with migrations | Linter pass, expand/contract, no ACCESS EXCLUSIVE on large tables | Lock risk, missing rollback | DB + CI |

---

## 5. Fixture & Test Data Standards (team-wide)

### Strategy

| Strategy | When | Tool | Ownership |
|----------|------|------|-----------|
| **Factory/Faker** | Unit tests, component tests | Factory functions with deterministic seeds | Skill that owns the tests |
| **Testcontainers** | Integration tests (DB, Redis, Queue) | Docker containers spun up per test suite | Backend / DB |
| **Golden files** | Snapshot/regression tests | `tests/fixtures/golden/` — reviewed line-by-line on changes | QA + skill owner |
| **Record/Replay** | Game simulation, API replay | `tests/fixtures/golden/replay-*.json` — versioned | Game + QA |
| **Schema-tied** | DB fixtures | Regenerated when schema changes. Same PR that changes schema updates fixtures. | DB + QA |

### Determinism Rules

1. **No `Math.random()` / `Date.now()` in tests** — use seeded PRNG and injectable clocks
2. **No network calls** in unit tests — mock at boundary
3. **Fixture file changes require review** — golden file diffs are always reviewed
4. **Seed format:** `FIXTURE-[domain]-[scenario]-[version]` (e.g., `FIXTURE-user-registration-v3`)
5. **Schema changes → fixture regeneration** in the same PR

### Time Handling

| Context | Rule |
|---------|------|
| Tests | Use injectable clock (`vi.useFakeTimers()`, `freezegun`, custom `Clock` interface) |
| Fixtures | Timestamps as relative offsets, not absolute dates |
| DB seeds | Use deterministic `created_at` values (e.g., `2025-01-01T00:00:00Z + offset`) |
| Logs | UTC everywhere. ISO 8601 format. |

---

## 6. OpenTelemetry MUST Subset (team-wide)

All services MUST implement:

### Trace Propagation
- **W3C Trace Context** (`traceparent` + `tracestate` headers) on ALL HTTP requests
- **Custom propagation** for non-HTTP (WebSocket, message queues): include `traceId` + `spanId` in message metadata
- **Never break the chain:** Every service that receives a request MUST extract and continue the trace context

### Resource Attributes (mandatory)
```
service.name        = "[service-name]"
service.version     = "[semver]"
deployment.environment = "production" | "staging" | "preview"
```

### Semantic Conventions
- HTTP: `http.method`, `http.status_code`, `http.route`, `http.url`
- DB: `db.system`, `db.statement` (parameterized), `db.operation`
- Messaging: `messaging.system`, `messaging.destination`, `messaging.operation`

### Correlation IDs
- `requestId` (UUID) — propagated in header, logged in every span
- `sessionId` — for user session tracking
- `traceId` — from W3C Trace Context

---

## 7. Delivery Phase → Skill Mapping

Quick reference for who does what in each delivery phase:

```
DISCOVERY ──────────────────────────────────────────────────────
  Requirements: Elicits stories, ACs, NFRs, privacy checkpoints
  Architect:    Feasibility check, early ADR if needed
  QA:           Confirms testability, identifies test data needs
  Perf Eng:     Reviews NFRs for performance requirements (when activated)
  Project Lead: Enforces DoR, tracks progress

DESIGN ─────────────────────────────────────────────────────────
  Architect:    ADRs, contracts, architecture diagrams (Mermaid), SLOs, threat model
  DB:           Schema design, migration plan
  DevOps:       Environment + infra planning
  Doc Writer:   Documentation plan, initial architecture overview (when activated)
  Perf Eng:     Performance budgets, caching strategy, load test plan (when activated)
  Project Lead: Tracks ADR completion, dependency mapping

BUILD ──────────────────────────────────────────────────────────
  Frontend:     UI components, pages, client-side logic
  Backend:      API endpoints, business logic, integrations
  DB:           Migrations, queries, indices
  Game:         Game server, netcode, simulation (when applicable)
  Doc Writer:   API docs, guides, data dictionary parallel to code (when activated)
  Perf Eng:     Baselines, profiling, load test scripts, caching impl (when activated)
  QA:           Writes automated tests in parallel with build
  Project Lead: Daily progress tracking, unblocking

VERIFY ─────────────────────────────────────────────────────────
  QA:           Test execution, quality report, regression
  Doc Writer:   Documentation audit, freshness check (when activated)
  Perf Eng:     Full load test, soak test, performance report (when activated)
  All skills:   Fix issues found by QA
  Project Lead: Tracks quality gate compliance

RELEASE ────────────────────────────────────────────────────────
  DevOps:       Deploy to production, canary, monitoring
  Doc Writer:   README final, CHANGELOG, API docs deployed (when activated)
  Perf Eng:     Production validation, RUM active, baselines updated (when activated)
  QA:           Release sign-off
  Architect:    PRR sign-off (first release)
  Project Lead: Release coordination, stakeholder communication

OPERATE ────────────────────────────────────────────────────────
  DevOps:       SLO monitoring, alerting, incident response lead
  Doc Writer:   Runbook updates, knowledge base maintenance (when activated)
  Perf Eng:     SLO compliance, capacity review, optimization (when activated)
  All skills:   On-call rotation, bug fixes
  Project Lead: Incident communication, postmortem facilitation
```

---

## 8. Skill System Overview (12 Core + 6 Optional Plugins)

| # | Skill | Scope | Primary Output |
|---|-------|-------|---------------|
| 1 | **Project Lead** | Delivery process, phases, gates, tracking, coordination | GitHub Issues, RACI, quality reports |
| 2 | **Requirements Engineer** | Problem → testable specification | Stories with ACs, NFRs, privacy checkpoints |
| 3 | **Software Architect** | System design, contracts, SLOs, security posture | ADRs, OpenAPI/AsyncAPI, C4, performance budgets |
| 4 | **Frontend Designer** | Design system, tokens, animation, theming, visual polish | Design tokens, Tailwind config, component patterns |
| 5 | **Security Engineer** | Threat modeling, auth architecture, DSGVO, hardening | Threat models, privacy checkpoints, security ACs |
| 6 | **Frontend Engineer** | Client-side UI, a11y, performance, design integration | React/TS components, pages, client-side tests |
| 7 | **Backend Engineer** | Server-side logic, API, integrations, security impl | Endpoints, business logic, API tests, migrations |
| 8 | **Database Engineer** | Schema, migrations, performance, operations | DDL, indices, migration scripts, backup/restore |
| 9 | **DevOps Engineer** | CI/CD, infrastructure, observability, SRE | Pipelines, Dockerfiles, dashboards, runbooks |
| 10 | **QA Test Engineer** | Test strategy, execution, quality gates, reporting | Test plans, automated tests, quality reports |
| 11 | **Devil's Advocate** | Pre-Mortem, assumption stress-tests, edge-case hunting, decision reviews | Challenge Reports, risk assessments, edge-case lists |
| 12 | **Retrospective Engineer** | Process feedback, workflow improvements, lessons learned | Retro reports, template fixes, tech-notes |
| 13 | **Game Engineer** (Optional Plugin) | Multiplayer netcode, game server, anti-cheat | Game server, tick loop, state sync, game tests |
| 14 | **Content Strategist** (Optional Plugin) | Voice/tone, microcopy, terminology, content patterns | Voice profile, terminology, content briefs, CDRs |
| 15 | **Documentation Writer** (Optional Plugin) | Doc lifecycle, API docs, guides, audits, freshness | README, API reference, data dictionary, DDRs |
| 16 | **Performance Engineer** (Optional Plugin) | Profiling, load testing, caching, capacity planning, optimization | PDRs, baselines, load test reports, capacity plans |
| 17 | **Immersive Audio Engineer** (Optional Plugin) | Sound design, adaptive music, spatial audio, audio budgets | Sonic palette, audio engine, event map, AuDRs |
| 18 | **Accessibility Engineer** (Optional Plugin) | WCAG 2.2, color/contrast, keyboard/focus, screen reader, a11y testing | Contrast matrix, component specs, WCAG audit, AcDRs |

**Orchestration flow:**
```
Requirements → [Challenge: Stress-Test Stories] → Security Review → Architect + Designer
    → [Challenge: Pre-Mortem] → [FE + BE + DB + Game (opt.)] → QA + Security
    → [Challenge: Pre-Release] → DevOps → Retro
                                        ↑                        ↑
                                  Content (opt.)           Doc Writer (opt.)
                                  Perf Eng (opt.)          Perf Eng (opt.)
                                        ↑                        ↑
                              Project Lead (gates, tracking, coordination)
```

---
