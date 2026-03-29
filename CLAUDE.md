# CLAUDE.md — Project Context

> Auto-loaded by Claude Code at session start. Keep this file updated.

## Project

- **Name:** Meridian Monitor
- **Description:** Geopolitische Nachrichtenplattform mit Fokus auf den Nahostkonflikt und globale Eskalationsrisiken. Kernfeature: ein datengetriebener Global Escalation Index (GEI), der in Echtzeit die Wahrscheinlichkeit einer totalen Eskalation berechnet. Freemium-Modell mit Premium-Abos. Mehrsprachig (DE/EN).
- **Status:** Phase 4 — QA & Polish (Sprint 4 aktiv)
- **Current Sprint:** Sprint 4 — Counters, Karte, Telegram, Tests (2026-03-29)

## Business Model

- **Free Tier:** Breaking News (24-48h Verzögerung bei Tiefenanalysen), Basis-Eskalationsindex (nur aktueller Wert), wöchentlicher Newsletter, werbefinanziert
- **Premium ($9.99/mo | $99/yr):** Echtzeit-GEI mit History, tägliche Intelligence-Briefings, interaktive Konfliktkarte, Push-Alerts, Vollarchiv, wöchentlicher Audio-Briefing, Community-Zugang, werbefrei
- **Professional ($29.99/mo | $299/yr):** Alles aus Premium + Rohdaten-Export (CSV/JSON), API-Zugang, Quartals-Forecasting-Reports, regionale Deep-Dives, Supply-Chain-Risk-Alerts
- **Enterprise (Custom):** Unlimitierter API-Zugang, White-Label-Widgets, Custom Alerting, Analyst-Briefings

## Target Audience

- **Primary:** OSINT-Community, geopolitische Analysten, IR-Studenten, Commodity-Trader, Investoren (Alter 25-45, bereit $10-30/mo zu zahlen)
- **Secondary:** Militärveteranen, Defense-Enthusiasten, Prepper-Community
- **Tertiary (Free Tier):** Allgemeine Öffentlichkeit, krisengetriebener Traffic

## Tech Stack

- **Frontend:** Next.js 15, TypeScript (strict), Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes + tRPC, Node.js Cron-Jobs für Data Pipeline
- **Database:** PostgreSQL (Supabase), Redis (Upstash) für Caching
- **Auth:** NextAuth.js (Credentials + OAuth)
- **Payments:** Stripe (Subscriptions + Checkout)
- **Data Pipeline:** GDELT API, ACLED API, RSS-Feeds (30+ Quellen), FRED/Yahoo Finance
- **Maps:** MapLibre GL JS (Open Source, kostenlos)
- **Charts:** Recharts (Escalation Index Visualisierung)
- **i18n:** next-intl (DE + EN)
- **Deployment:** Vercel (Frontend) + Railway/Supabase (DB + Cron)
- **Testing:** Vitest (unit), Playwright (E2E), MSW (API mocking)
- **CI/CD:** GitHub Actions (Template in `.github/workflows/ci.yml`)

## Git Workflow (PFLICHT)

> Diese Regeln gelten IMMER, auch wenn der Rest noch Platzhalter hat.

**Nach JEDER abgeschlossenen Änderung:**
1. `git add` der geänderten Dateien (spezifisch, nicht `-A`)
2. `git commit` mit Conventional Commit Message
3. `git push` zum Remote

**Niemals** mehrere Features ohne Commit/Push bauen. Jeder logische Schritt = ein Commit + Push.

```bash
# Commit-Format (Conventional Commits)
git commit -m "feat(scope): kurze Beschreibung"
git commit -m "fix(scope): was wurde gefixt"
git commit -m "style(scope): visuelle Änderung"
git commit -m "docs: Dokumentation aktualisiert"

# Immer pushen nach dem Commit
git push
```

Tracking (optional)
Projekt-Tracking über GitHub Issues (wenn eingerichtet):

```bash
gh issue list --milestone "Sprint 1" --state open
gh issue edit #N --remove-label "status:ready" --add-label "status:in-progress"
git commit -m "feat(scope): description\n\nCloses #N"
```

## Key Files

- `features/INDEX.md` — Feature specs for large epics
- `docs/adr/` — Architecture decisions
- `docs/architecture/` — Mermaid diagrams (C4, ER, Sequence, Deployment)
- `docs/contracts/` — OpenAPI/AsyncAPI specs
- `docs/security/` — Threat models, privacy checkpoints
- `docs/tech-notes.md` — Library-Gotchas, Breaking Changes (jeder Skill liest das)
- `docs/runbooks/` — Incident Response, Post-Mortems
- `docs/rules-index.md` — Übersicht aller Regel-Dateien (Phase- + Skill-Mapping)
- `docs/ONBOARDING.md` — Quick-Start Guide für neue Entwickler/Sessions

## Conventions

- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`)
- **Branches:** Trunk-based (short-lived feature branches off `main`)
- **Code Style:** ESLint + Prettier, TypeScript strict, no `any`
- **Naming:** camelCase (variables/functions), PascalCase (components/types), kebab-case (files)
- **Tests:** Co-located (`*.test.ts` next to source) or in `tests/`

## Deployment

- **Target:** Vercel (Frontend + API Routes) + Supabase (PostgreSQL) + Railway (Cron-Worker)
- **Server:** [TBD — nach Phase 5]
- **Domain:** [TBD — meridian-monitor.com o.ä.]
- **App Path:** N/A (Vercel Serverless)
- **Runbook:** `docs/runbooks/deploy.md`

## Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm run test       # Run tests
npm run lint       # Lint check
npm run typecheck  # TypeScript check
```

## Skills System

This project uses an engineering skill system (12 Core + 6 Optional Plugins). Skills are available via `/command`:

| Command | Skill | Use for |
|---------|-------|---------|
| `/pm` | Project Lead | Status, priorities, sprint planning, coordination |
| `/requirements` | Requirements Engineer | Feature specs, stories, acceptance criteria |
| `/architecture` | Software Architect | Tech decisions, contracts, ADRs, SLOs |
| `/design` | Frontend Designer | Design system, tokens, animation, visual polish |
| `/security` | Security Engineer | Threat modeling, auth, DSGVO, security audit |
| `/frontend` | Frontend Engineer | UI components, pages, state, a11y, performance |
| `/backend` | Backend Engineer | APIs, business logic, auth implementation, integrations |
| `/database` | Database Engineer | Schema, migrations, queries, performance |
| `/devops` | DevOps Engineer | CI/CD, Docker, deployment, monitoring |
| `/qa` | QA Test Engineer | Test strategy, execution, quality reports |
| `/game` | Game Engineer (optional) | Multiplayer server, netcode, game logic |
| `/challenge` | Devil's Advocate | Pre-mortem, assumption stress-tests, edge-case hunting, decision reviews |
| `/retro` | Retrospective Engineer | Process feedback, workflow improvements, lessons learned |
| `/content` | Content Strategist (optional) | Voice/tone, microcopy, terminology, content patterns, docs copy |
| `/docs` | Documentation Writer (optional) | Doc lifecycle, API docs, guides, audits, freshness |
| `/perf` | Performance Engineer (optional) | Profiling, load testing, caching, capacity planning, optimization |
| `/audio` | Immersive Audio Engineer (optional) | Sound design, adaptive music, spatial audio, sonic branding, audio budgets |
| `/a11y` | Accessibility Engineer (optional) | WCAG 2.2 audits, contrast systems, keyboard/focus, screen reader, a11y testing |

Full skill references: `docs/skills/[skill-name]/SKILL.md` (if available)

## MCP Tools (External Integrations)

| MCP Server | Zweck | Verfügbar für | Status |
|------------|-------|---------------|--------|
| **Playwright** | Visual Testing, Accessibility-Audits, Responsive Checks, E2E-Verification | `/qa`, `/frontend`, `/design`, `/a11y`, alle UI-Skills | **Pflicht** für UI-Projekte |
| **Context7** | Aktuelle Library-Docs in Kontext laden (verhindert veraltete API-Nutzung) | Alle Skills | **Empfohlen** |
| **PixelLab** | Pixel-Art-Generierung (Characters, Tilesets, Animations, Map Objects) | `/design`, `/game`, `/frontend` | Optional (per ADR) |
| **GitHub** | 87 strukturierte GitHub-Tools (Issues, PRs, Actions, Dependabot, Code Search) | `/pm`, `/qa`, `/devops` | Optional |
| **n8n** | Workflow-Automatisierung (n8n auf `n8n.schaper-style.de`) | Alle Skills | Optional |

### Playwright MCP (STANDARD für UI-Projekte)
Playwright MCP ist der Standard-Quality-Gate für alle UI-Änderungen:

**Wann nutzen:**
- **Post-Feature Self-Review:** Nach jeder UI-Story → `browser_navigate` + `browser_resize(320/768/1440)` + `browser_snapshot`
- **Sprint-Close:** Visual Check auf Landing/Main Pages bei 3 Viewports
- **QA Phase 4:** Vollständiger Visual Audit aller Screens + Accessibility-Tree-Check
- **Bug-Verification:** Screenshot vor und nach dem Fix

**Verfügbare Tools:**
- `browser_navigate` — Seite laden
- `browser_resize` — Viewport ändern (320px Mobile, 768px Tablet, 1440px Desktop)
- `browser_take_screenshot` — Screenshot als Evidenz
- `browser_snapshot` — Accessibility-Tree (ARIA, Labels, Semantik)
- `browser_click` / `browser_fill_form` — Interaktive Flows testen
- `browser_evaluate` — JS ausführen (z.B. `scrollWidth > clientWidth` für Overflow-Detection)
- `browser_console_messages` — Console-Errors prüfen
- `browser_network_requests` — 404s, fehlende Assets erkennen

**Setup:** Siehe `docs/ONBOARDING.md` § MCP Server Setup (inkl. Windows-Gotchas)

### PixelLab MCP-Tools
- `create_character` — Pixel-Art-Charakter (4/8 Richtungen, transparenter Hintergrund, max 400x400px)
- `animate_character` — Skeleton-Animation aus statischem Character
- `create_topdown_tileset` — Wang-basiertes Top-Down-Tileset
- `create_sidescroller_tileset` — Sidescroller-Tileset
- `create_isometric_tile` — Isometrische Tiles
- `create_map_object` — Props, Items, Gebäude (transparenter Hintergrund)

### Scenario.com via n8n (Illustrated/Hi-Res Assets)
Drei Workflows auf `n8n.schaper-style.de` (müssen pro Projekt aktiviert + API Key konfiguriert werden):

| Webhook-Pfad | Zweck |
|---|---|
| `POST /webhook/scenario-generate-tile` | Tile/Asset generieren (txt2img + polling) |
| `POST /webhook/scenario-train-model` | Custom Style Model trainieren/Status prüfen/auflisten |
| `POST /webhook/scenario-process-asset` | Hintergrund entfernen, Upscale, Vektorisieren |

**Nutzung:** Nur wenn in Phase 2 (Architect Step) per ADR entschieden. Siehe `/design` Step 7 für Workflow-Details.

Assets werden in `public/assets/` gespeichert. Art Direction in `docs/design/art-direction.md`.

## Rule Files

Projekt-spezifische Regeln in `.claude/rules/` — überschreiben Defaults. Phase- und Skill-Mapping: `docs/rules-index.md`.

| Rule File | Scope |
|-----------|-------|
| `general.md` | Git Workflow, Code Quality, Commit-Cadence (alle Skills) |
| `frontend.md` | Components, Styling, State, Performance |
| `backend.md` | API Design, Validation, Error Handling, DB |
| `design.md` | Tokens, Color, Typography, Animation, Responsive |
| `security.md` | Secrets, Auth, Headers, Data Protection |
| `code-review.md` | PR Review Standards, Merge-Regeln, Checklisten |
| `feature-flags.md` | Flag-Typen, Lifecycle, Cleanup-Pflicht |
| `i18n.md` | Internationalisierung, next-intl, ICU Format |
| `content.md` | Voice & Tone, Terminology, Error Messages, Microcopy, CDRs |
| `documentation.md` | Doc Lifecycle, Diataxis, Accuracy, API Coverage, Freshness |
| `performance.md` | Budgets, Measurement, Regression Detection, Caching, Load Testing, PDRs |
| `audio.md` | AudioContext Lifecycle, Audio-Budgets, Anti-Ermüdung, Asset Pipeline, Accessibility |
| `a11y.md` | WCAG 2.2 Compliance, Color & Contrast, Keyboard/Focus, ARIA, Forms, Motion, Testing |
| `authorization.md` | Permission-basiertes RBAC, DB-Schema, Middleware-Pattern, Row-Level Filtering, Seed-Scripts |
| `testing.md` | Test-Timing, Test-Execution, Test-Typen (Unit/Integration/E2E/Contract), Bug-Fix Testing, CI-Debug |

## Data Sources

| Quelle | Typ | Kosten | Update-Frequenz |
|--------|-----|--------|-----------------|
| GDELT DOC API | News-Events, Tone-Analyse | Kostenlos | Alle 15 Min |
| ACLED | Konfliktereignisse (kuratiert) | Kostenlos (Media-Lizenz) | Wöchentlich |
| RSS-Feeds (30+) | Reuters, BBC, Al Jazeera, etc. | Kostenlos | Alle 5 Min |
| FRED API | VIX, Ölpreise, Treasury Yields | Kostenlos (API Key) | Täglich |
| Yahoo Finance | Defense-Stocks, Gold, Commodities | Kostenlos | Täglich |
| UN OCHA ReliefWeb | Humanitäre Reports | Kostenlos | Täglich |
| Telegram (Public Channels) | OSINT-Kanäle | Kostenlos (Bot API) | Echtzeit |
| EIA API | Öl-/Gas-Daten | Kostenlos (API Key) | Wöchentlich |

## Global Escalation Index (GEI)

Datengetriebener Konfliktindex (0-100), basierend auf 5 Kategorien:
- **Military Activity (30%):** Truppenbewegungen, Raketentests, Flottenpositionierung
- **Diplomatic Signals (25%):** Botschafter-Rückrufe, UN-Vetos, Verhandlungsstatus
- **Conflict Events (25%):** Kinetische Konflikte, Opferzahlen-Trends, Grenzübergriffe
- **Economic Stress (10%):** VIX-Spikes, Ölpreis-Schocks, Gold-Nachfrage
- **Nuclear/Strategic (10%):** Nuklear-Rhetorik, ICBM-Tests, Rüstungskontroll-Status

Methodik: CAMEO Event Codes (GDELT) + ACLED Events + NLP Sentiment + Market Data, mit exponentiellem Decay (Halbwertszeit 14 Tage) und 90-Tage-Rolling-Window.

## Phase Log

> Wird beim Checkpoint jeder Phase automatisch ergänzt (siehe WORKFLOW.md).

### Phase 0 — Kickoff (2026-03-28)
- Projektname: Meridian Monitor
- Tech-Stack definiert: Next.js 16 + SQLite/Prisma + Vercel
- Business Model: Freemium (Free/Premium/Professional/Enterprise)
- Zielgruppe: OSINT-Community, Analysten, Investoren
- GEI-Methodik definiert (5 Kategorien, 0-100 Skala)
- Datenquellen identifiziert (GDELT, ACLED, RSS, FRED, Telegram)

### v0.1.0 — MVP Sprint 1 (2026-03-28)
- Landing Page, News Feed, GEI Engine, Data Pipeline, i18n (DE/EN)
- Methodology, Pricing, Conflict Map Preview, Economy Dashboard
- 13 API-Routen, 9 Feature-Specs

### v0.2.0 — Sprint 2 (2026-03-28)
- Auth (NextAuth.js Email/Password), Admin Dashboard
- GPT-4o-mini Summarization (60 Artikel zusammengefasst)
- SQLite DB mit 391 echten Artikeln aus 20+ RSS-Quellen
- GEI History Chart, Profile Page, SEO (sitemap, robots.txt)
- 20 Routen, Production Build erfolgreich

### v0.3.0 — Sprint 3 (2026-03-28)
- Bento Grid Landing Page (modern, Gen-Z-freundlich)
- Meme-Galerie mit Community-Features (Likes, Tags, Sort)
- Interaktive SVG-Konfliktkarte mit 8 Fraktionen
- Neues Farbschema (Zinc-basiert, Gradient-Text, Glow-Effekte)
- 22 Routen, Production Build erfolgreich

### v0.5.0 — Sprint 4 (2026-03-29)
- WW3 Risk Counter + Nuklear-Risiko Counter (sticky, expandierbar)
- Animierte SVG-Konfliktkarte mit Laendersilhouetten und Versorgungsrouten
- Telegram Frontline Sektion (9 kuratierte Kanaele, Content-Warning)
- 9 Memes (3 neue: Iron Dome, Erdogan, FPV-Drohnen)
- Vitest Setup + 25 Unit-Tests (Utils, GEI-Calculator)
- Security Audit: 4 kritische, 6 hohe, 5 mittlere Fixes
- 22 Routen, Production Build erfolgreich
