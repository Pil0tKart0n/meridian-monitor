# Rule Files — Übersicht

Projekt-spezifische Engineering-Standards. Werden bei jedem Skill-Start gelesen (Pre-Flight Check).

## Nach Workflow-Phase

**Alle Phasen (Session-Start):**
- `general.md` § Context-Compaction Safeguard — Working Tree clean bevor neuer Code

**Phase 0–1 (Planning):**
- `general.md` § Git Workflow, Code Quality, Tracking

**Phase 2 (Design):**
- Architecture Diagrams — Mermaid in `docs/architecture/` (System Context, Container, ER, Sequence) — siehe `/architecture` Skill
- `design.md` — Design Tokens, Animation, Responsive, Dark Mode, Charts & Data Viz
- `security.md` — Auth, Secrets, PII, Headers, SSO/OIDC, Audit Logging
- `authorization.md` — RBAC-Schema, Permission-Naming, Middleware-Pattern, Row-Level Filtering
- `content.md` — Voice & Tone, Messaging, Terminology, Content Patterns (wenn Content-Governance aktiv)
- `audio.md` — Sonic Palette, Audio-Budgets, AudioContext Lifecycle, Accessibility (wenn Audio-Features aktiv)
- `documentation.md` — Doku-Plan, Doku-Inventar, Freshness-Policy (wenn Doku-Governance aktiv)
- `performance.md` — Performance Budgets definieren, Caching-Strategie, Load-Test-Planung (wenn Perf-Governance aktiv)
- `feature-flags.md` — Flag-Strategie festlegen (wenn Features stufenweise ausgerollt werden)
- `i18n.md` — Internationalisierung (wenn mehrsprachig)

**Sprint-Close (Ende jedes Sprints):**
- `general.md` § Sprint-Close-Protokoll — CHANGELOG versionieren, README abgleichen, Playwright MCP Checks, Retro
- `general.md` § Playwright MCP Visual Check — 320px, 768px, 1440px auf Main Pages
- `general.md` § Retro Action-Item Tracking — Jeder Action Item → GitHub Issue

**Phase 3 (Build):**
- `testing.md` — Single Source of Truth für Test-Timing, Execution, Coverage, Typen, CI-Debug
- `general.md` § Commit-Cadence (HARD RULE), Build-Verify, Dependency-Management
- `general.md` § Playwright MCP Visual Check — nach jeder UI-Story
- `general.md` § E2E-Coverage für neue User-Flows
- `frontend.md` — Components, Styling, State, SEO, a11y
- `backend.md` — API Design, Validation, Error Handling, DB, Third-Party Integration
- `authorization.md` — Permission-Middleware, Row-Level Filtering, Authorization-Tests
- `audio.md` — Audio-Engine, Asset Pipeline, Anti-Ermüdung, Performance (wenn Audio-Features aktiv)
- `content.md` — Microcopy-Specs, Error Message Templates, Terminology (wenn Content-Governance aktiv)
- `documentation.md` — Doku parallel zum Code schreiben, API-Doku, Code-Beispiele (wenn Doku-Governance aktiv)
- `performance.md` — Baselines messen, Profiling, Caching implementieren, Load-Test-Scripts (wenn Perf-Governance aktiv)
- `feature-flags.md` — Flags implementieren, beide Pfade testen

**Phase 4 (Verify):**
- `code-review.md` — PR Review Standards, Merge-Regeln, Skill-spezifische Checklisten
- `audio.md` — Audio QA Checklist, Loudness-Konsistenz, Browser-Kompatibilität (wenn Audio-Features aktiv)
- `content.md` — Content QA Checklist (wenn Content-Governance aktiv)
- `documentation.md` — Doku-Audit, Freshness-Check, Link-Validation (wenn Doku-Governance aktiv)
- `performance.md` — Full Load Test, Soak Test, Regression Detection, Performance Gate (wenn Perf-Governance aktiv)

**Phase 5 (Release):**
- `feature-flags.md` § Cleanup — Flags die älter als 2 Sprints sind entfernen
- `documentation.md` — README final, CHANGELOG versioniert, API-Docs deployed (wenn Doku-Governance aktiv)
- `performance.md` — Production-Validation, RUM aktiv, Baselines aktualisieren (wenn Perf-Governance aktiv)

## Nach Skill

| Skill | Relevante Rules |
|-------|----------------|
| Project Lead | `general.md` |
| Requirements | `general.md` |
| Architect | `authorization.md` § Decision Matrix, `general.md`, Architecture Diagrams (`docs/architecture/`) |
| Designer | `design.md` |
| Security | `security.md`, `authorization.md`, `general.md` |
| Frontend | `frontend.md`, `testing.md`, `design.md`, `content.md`, `i18n.md`, `general.md` |
| Backend | `backend.md`, `testing.md`, `authorization.md`, `content.md`, `security.md`, `general.md` |
| Database | `backend.md` § DB, `authorization.md` § DB-Schema, `general.md` |
| DevOps | `general.md` |
| Game (optional Plugin) | `general.md`, `backend.md` § Validation, `audio.md` |
| QA | `testing.md`, `code-review.md`, `authorization.md` § Testing, `content.md`, `audio.md`, `general.md` |
| Immersive Audio Engineer (optional Plugin) | `audio.md`, `design.md`, `frontend.md`, `general.md` |
| Content Strategist (optional Plugin) | `content.md`, `general.md`, `i18n.md` |
| Documentation Writer (optional Plugin) | `documentation.md`, `content.md`, `general.md` |
| Performance Engineer (optional Plugin) | `performance.md`, `backend.md`, `frontend.md`, `general.md` |
| Accessibility Engineer (optional Plugin) | `a11y.md`, `frontend.md`, `design.md`, `content.md`, `general.md` |
| Challenge (Devil's Advocate) | `general.md`, alle Rules (liest um Annahmen zu hinterfragen) |
| Retro | _(liest alle Rules um Einhaltung zu prüfen)_ |

## Dateien

| Datei | Kurzbeschreibung |
|-------|-----------------|
| `general.md` | Git Workflow, Commit-Cadence, Test-Execution, Code Quality, File Organization |
| `frontend.md` | Functional Components, Tailwind, Server Components, Bundle/Import Hygiene, RSC Patterns, SEO & Discoverability, Performance, Testing |
| `backend.md` | REST Design, Validation (Zod), Auth, Error Handling, DB Queries, Third-Party Integration (Webhooks, Retry, Circuit Breaker), Testing |
| `design.md` | Tokens (OKLCH), Typography (fluid), Animation (transform+opacity only), Dark Mode, Charts & Data Viz, Anti-Slop, Component State Matrix, Micro-Interaction Patterns, Animation Choreography, Visual Polish Checklist, Design Critique Protocol, AI Asset Pipeline |
| `security.md` | Secrets Management, Auth (bcrypt, JWT), SSO/OIDC (PKCE, Claim-Mapping), Headers (CSP, HSTS), Audit Logging (DSGVO), GDPR, Dependencies |
| `code-review.md` | Merge-Regeln, PR-Größenlimit, Skill-spezifische Review-Checklisten, Feedback-Konventionen |
| `feature-flags.md` | Flag-Typen, Naming, Implementation, 2-Sprint-Lifecycle, Cleanup-Tracking, Testing |
| `i18n.md` | next-intl, Translation-Struktur, ICU MessageFormat, Server/Client-Trennung |
| `content.md` | Voice & Tone, Terminology, Error Messages, Empty States, Buttons, Microcopy, CDRs |
| `documentation.md` | Doc Lifecycle, Diataxis Classification, Accuracy, API Coverage, Freshness, Prose Style, DDRs |
| `audio.md` | AudioContext Lifecycle, Audio-Budgets, Anti-Ermüdung, Asset Pipeline, Loudness, Accessibility, AuDRs |
| `performance.md` | Budgets, Measurement (Percentiles), Regression Detection, Caching, Load Testing, Algorithm Complexity, PDRs |
| `a11y.md` | WCAG 2.2 Compliance, Color & Contrast, Keyboard/Focus, Semantic HTML, ARIA, Forms, Motion, Touch, Testing, AcDRs |
| `authorization.md` | Permission-basiertes RBAC, DB-Schema (5 Tabellen), Permission-Naming, Middleware-Pattern, Row-Level Filtering, Feature Flags × Permissions, Seed-Scripts, Anti-Patterns |
| `testing.md` | Test-Timing, Test-Execution, Test-Typen (Unit/Integration/E2E/Contract), Bug-Fix Testing, Feature-Flag Testing, CI-Debug, Skill-spezifische Ergänzungen, Anti-Patterns |

**Hinweis:** `security.md` enthält auch Abschnitte zu SSO/OIDC und Audit Logging, die bei regulierten Projekten relevant sind.

## Neue Regeln (aus Feedback-Analyse 2026-03-08)

| Regel | Typ | In Datei | Belegt durch |
|-------|-----|----------|-------------|
| Sprint-Close-Protokoll | HARD RULE | `general.md` | Pong: 6 Doku-Updates vergessen |
| Playwright MCP Visual Check | HARD RULE | `general.md` | Alle 3 Projekte: Responsive-Bugs erst spät entdeckt |
| Retro Action-Item Tracking | HARD RULE | `general.md` | Zombie-Killer: ~20% Action Items nie als Issue |
| Context-Compaction Safeguard | HARD RULE | `general.md` | Zombie-Killer: Unstaged Audio-Entries nach Restart |
| E2E-Coverage für neue Flows | HARD RULE | `general.md` | Pong: Quick Match ohne E2E-Tests |
| Meta-Retro | EMPFEHLUNG | `general.md` | Zombie-Killer: 17 Retros analysiert |
