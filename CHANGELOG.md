# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] — 2026-03-28

### Added
- **Smart Brevity News Cards:** Semafor-inspiriertes Design mit farbiger Kategorien-Border, Threat-Level-Dots (5-Punkte), Source-Flags, Pulse-Dot bei aktuellen Artikeln
- **Signal vs. Noise Memes:** Jedes Meme hat jetzt einen Faktencheck (Faktenbasiert/Irreführend/Falsch/Satire) mit Quellen — inspiriert von Ground News
- **Mobile Bottom Navigation:** 5-Tab-Navigation (Home, News, Karte, Memes, Profil) fuer mobile Nutzer
- **Verbessertes Farbsystem:** Subtile transluzente Surfaces (`from-white/[0.02]`), Glow bei aktuellen Artikeln, modernere Border-Behandlung (`border-white/[0.06]`)

### Changed
- News Cards komplett redesignt: Smart Brevity Format, HTML-Bereinigung, Country-Flags
- Meme-Galerie erweitert um Faktencheck-Karten mit 5 Statustypen
- Body hat jetzt `pb-16` fuer Mobile Bottom Nav Platz

## [0.3.0] — 2026-03-28

### Added
- **Bento Grid Landing Page:** Modernes Layout mit Gradient-Text, animiertem Grid-Background, Quick Stats, Mini-Headline-Feed
- **Meme-Galerie (/memes):** Masonry Grid mit geopolitischem Humor, Like/Share/Comment, Sort (Hot/Neu/Top), Tag-Filter
- **Interaktive Konfliktkarte (/map):** SVG-basiert mit 8 Fraktionen, animierte Pulse-Ringe, Klick-Details mit Intensitaetsbalken und Event-Listen, Versorgungsrouten-Linien
- **Fraktions-System:** 8 Fraktionen mit eigenen Farben (Israel, Hamas, Hisbollah, Iran, Huthi, NATO, Russland, Tuerkei)
- Neues Farbschema (Zinc-basiert, waermer), Gradient-Text-Utility, Glow-Effekte

### Changed
- Landing Page komplett redesignt fuer juengere Zielgruppe (18-35)
- Navigation um Memes-Link erweitert
- Konfliktkarte von Premium-Preview zu interaktiver SVG-Karte upgraded

## [0.2.0] — 2026-03-28

### Added
- **Auth System:** NextAuth.js mit Email/Password, Registrierung, Login, Profil-Seite
- **GPT-Summarization:** OpenAI GPT-4o-mini fuer deutsche Artikelzusammenfassungen und verbesserte Kategorisierung
- **Admin Dashboard:** Pipeline-Management UI mit DB-Stats, RSS-Fetch und Summarization-Buttons
- **GEI History Chart:** Recharts AreaChart mit 30-Tage-Verlauf und Kategorie-Breakdown (Premium)
- **GEI History API:** GET /api/gei/history mit konfigurierbarem Zeitraum
- **SQLite-Datenbank:** Lokale Entwicklungsdatenbank mit Prisma 6, 391 echte Artikel
- **Pipeline API:** POST /api/pipeline (RSS-Fetch + GEI-Update), POST /api/pipeline/summarize (GPT)
- **SEO:** sitemap.xml, robots.txt, Meta-Tags auf allen Seiten
- **Session-aware Header:** Zeigt User-Name, Tier-Badge, Logout wenn eingeloggt
- **Profil-Seite:** Tier-Anzeige, Upgrade-CTA fuer Free-Nutzer

## [0.1.0] — 2026-03-28

### Added
- **Meridian Monitor MVP** — geopolitische Intelligence-Plattform mit Echtzeit-Eskalationsindex
- **Global Escalation Index (GEI):** Datengetriebener Konfliktindex (0-100) mit 5 gewichteten Kategorien, exponentiellem Decay (14-Tage-Halbwertszeit) und 90-Tage-Rolling-Window
- **Landing Page:** Hero mit Live-GEI-Gauge, Feature-Highlights, Pricing-Section, Newsletter-Signup, Breaking-News-Ticker
- **News-Feed:** Artikel mit Kategorie-Filtern (Militaer, Diplomatie, Wirtschaft, Humanitaer, Nuklear) und Regions-Filtern (Gaza, Israel, Libanon, Syrien, Jemen, Iran, Rotes Meer, Europa)
- **Data Pipeline:** GDELT DOC API Client (15-Min-Updates), RSS-Aggregator (20+ Quellen), Event-Kategorisierung, GEI-Scoring
- **API-Routen:** /api/gei (Eskalationsindex), /api/news (Artikel), /api/news/live (GDELT Echtzeit), /api/rss (RSS-Feeds)
- **Methodology-Seite:** Vollstaendige GEI-Transparenz (Kategorien, Scoring, Decay, Datenquellen, Skala)
- **Konfliktkarte (Preview):** Premium-gated Vorschau mit animierten Markern
- **Wirtschafts-Dashboard:** VIX, Oelpreis, Gold, Defense-Stocks mit Kontextinformationen
- **i18n:** Deutsch und Englisch via next-intl, vollstaendige Translations
- **Pricing-Seite:** Free / Premium / Professional Tier-Vergleich
- **9 Feature-Specs:** Detaillierte Epics mit User Stories fuer alle geplanten Features
- **Prisma Schema:** Users, NewsArticles, ConflictEvents, EscalationSnapshots, MarketData
- Dark Theme mit professionellem Intelligence-Design

## [0.4.0] — 2026-03-13

### Added
- **Challenge skill** (`.claude/skills/challenge/SKILL.md`) — Devil's Advocate / Pre-Mortem skill: systematisches Hinterfragen von Plänen, Annahmen und Entscheidungen. Methoden: Pre-Mortem, Assumption Stress-Test, Edge-Case-Hunting, Decision Freshness Review, Architecture Stress-Test. Integriert in Phase 2 (vor Design-Validation), Phase 3 (Mid-Sprint Check) und Phase 4 (Pre-Release Check).
- **Testing rules** (`.claude/rules/testing.md`) — Consolidated single source of truth for all test rules: Test-Timing, Test-Execution, Test-Coverage, Test-Typen (Unit/Integration/E2E/Contract), Bug-Fix Testing (Red-Green), Feature-Flag Testing, CI-Debug-Strategie, skill-spezifische Ergänzungen, Anti-Patterns
- **Retro Light template** (`docs/retro/TEMPLATE-LIGHT.md`) — Lightweight retro template for short sprints (≤1 week, ≤10 commits) with Quick-Metriken and focused action items
- **Authorization rules** (`.claude/rules/authorization.md`) — Permission-basiertes RBAC als Standard: DB-Schema (5 Tabellen), Permission-Naming (`resource:action:scope`), `requirePermission()` Middleware-Pattern, Row-Level Filtering via `scopedWhere()`, Feature Flags × Permissions Zusammenspiel, Seed-Scripts, Anti-Patterns
- Authorization review checklist integrated into code-review.md
- **Accessibility Engineer skill** — Optional Plugin #6 for WCAG 2.2 compliance, color/contrast systems, keyboard/focus architecture, screen reader optimization, form accessibility, motion sensitivity, a11y testing, AcDRs
- Accessibility governance rules (`.claude/rules/a11y.md`) with HARD RULES for WCAG compliance, contrast, keyboard, semantic HTML, ARIA, forms, motion, touch, testing
- Accessibility review checklist integrated into code-review.md
- Accessibility integrated into WORKFLOW.md Phase 2 (Strategy) and Phase 4 (Audit)
- **Context7 MCP** and **GitHub MCP** documented as recommended MCP servers in ONBOARDING.md
- **Playwright MCP pre-configured** — `.claude/settings.json` includes mcpServers config with `@playwright/mcp --headless`, `mcp__playwright__*` auto-allowed
- **6 production-tested HARD RULES** from 3 real project retros (Sprint-Close-Protokoll, Playwright Visual Checks, Retro Action-Item Tracking, Context-Compaction Safeguard, E2E-Coverage, Meta-Retro)
- Sprint-Close-Ritual integrated into WORKFLOW.md (mandatory before sprint-end)
- Context-Compaction Safeguard in general.md (git status check at session start)
- Meta-Retro trigger every 3-4 sprints in retro template
- MCP Server Setup section in ONBOARDING.md (Windows + macOS configs)

### Changed
- **Design rules massiv erweitert** (`design.md`) — Component State Matrix (HARD RULE: 8 Pflicht-States pro interaktiver Komponente), Micro-Interaction Patterns (Loading/Hover/Error/Success mit Timings), Animation Choreography (Stagger, Page Transitions, Hierarchie in Motion), Visual Polish Checklist (Hierarchy, Affordance, Consistency, Restraint), Design Critique Protocol (formalisierte Bewertung vor Code Review), AI Asset Pipeline (Quality Gates, Master Style Prompt, Lizenz-Governance)
- **Pre-Mortem** als empfohlener Schritt in WORKFLOW.md Phase 2 (vor Design-Validation) — systematische Risiko-Analyse bevor gebaut wird
- **Decision Freshness Review** als neuer Abschnitt im Retro-Template — 3 älteste Entscheidungen pro Retro prüfen (Kontext noch gültig? Bessere Alternativen? Re-evaluation Trigger erreicht?)
- **Challenge Engineer** in WORKFLOW.md Phase 3 (Mid-Sprint Check) und Phase 4 (Pre-Release Check) integriert
- **Skill count** korrigiert: 11→12 Core Skills in ONBOARDING.md, skills INDEX.md, cross-skill-standards.md (Challenge als Core Skill #11)
- **Taste Rubric** auf 8 Kriterien erweitert (+ Density, Intentionality) in Design SKILL.md — konsistent mit design.md
- **Frontend-PR Review** erweitert (code-review.md): Component State Matrix, Micro-Interactions, Visual Polish (Taste Rubric ≥6/8), Dark Mode
- **Animation Performance** als neue Sektion in performance.md: transform+opacity only, Duration-Budgets, Stagger-Budget, kein initial-load above-fold
- **Frontend Edge States** verweist jetzt auf design.md § Component State Matrix + Micro-Interaction Patterns
- **Challenge Handoff Chains** in delivery-playbook.md: Requirements→Challenge, Architect→Challenge, Challenge→QA
- **Orchestration Flow** in cross-skill-standards.md aktualisiert mit Challenge-Einstiegspunkten
- **Skill-Dependency-Graph** added to WORKFLOW.md — explicit data dependencies between all 17 skills (who produces what for whom), pre-start checklists to prevent missing inputs
- **Solo-Modus** added to general.md — explicit adaptations for solo projects (self-review replaces PR approval, direct push allowed, CI/tests/retro still mandatory)
- **Dependency-Management HARD RULE** added to general.md — pre-install checklist (necessity, bundle size, license, maintenance, TypeScript) for all skills, cross-references DevOps skill for full rules
- **Testing rules consolidated** — general.md test sections condensed to summary with reference to `testing.md` as single source of truth; frontend/backend/QA skill files updated with cross-references to testing.md
- **API→UI Error-Mapping** clarified in backend.md (RFC 9457 machine-readable codes) and content.md (PatternFly formula mapping table) — clear responsibility split between skills
- **Design-Validation step** added to WORKFLOW.md Phase 2 — 5 compatibility checks between all Phase 2 skill outputs before Phase 3 starts
- **Playwright MCP clarity** — general.md now includes Manuell vs. CI table (new stories = manual, existing layouts = CI regression, sprint-close = manual, Phase 4 = both)
- **Observability-Strategie** added to WORKFLOW.md Phase 2 — structured logging, error tracking, health checks, SLIs, alerting defined during architecture, not post-release
- **DevOps skill expanded** with comprehensive Incident-Response (SEV1-4 classification, incident timeline, rollback methods by deployment type, DB migration rollback rules, post-incident review template)
- **Retro skill expanded** with Skill Usage Analytics (commit-scope frequency, issue-label counting, skill-gap detection, IST vs. SOLL ordering) and Architecture Diagram compliance check in HARD RULE audit
- **Architecture Diagrams as Code (HARD RULE)** — Mermaid diagrams in `docs/architecture/` with update triggers: System Context + Container (Pflicht), ER/Sequence/Component/Deployment (bedingt). Diagramme werden bei Architektur-Änderungen im selben Commit aktualisiert.
- Architecture review checklist integrated into code-review.md
- Architecture diagrams integrated into WORKFLOW.md (Phase 2 creation, Phase 3 updates, Phase 5 deployment diagram)
- Architect→Engineers handoff checklist expanded with diagram artifacts
- **Project Lead command renamed from `/kickoff` to `/pm`** — shorter, clearer, avoids conflict with Claude Code's built-in Plan Mode
- **Frontend rules expanded** with SEO & Discoverability (Meta Tags, Open Graph, Canonical URLs, Structured Data/JSON-LD, Crawlability, Semantic Structure), Bundle & Import Hygiene (barrel-import ban, third-party defer, conditional imports), Server Component Patterns (parallel fetches, React.cache(), serialization minimization)
- **Backend rules expanded** with Third-Party API Integration patterns (webhook receivers, retry/backoff, circuit breaker, sync strategy)
- **Security rules expanded** with SSO/OIDC patterns (PKCE, claim-mapping, token validation) and Audit Logging (DSGVO Art. 32, immutable logs, retention)
- **Design rules expanded** with Charts & Data Visualization (chart type selection, a11y for charts, responsive, loading/error states)
- **Bug-Fix-Protokoll** updated: Regression-Test ZUERST schreiben (Red-Green pattern from TDD)
- **Playwright reference doc** added (`docs/skills/qa-test-engineer/references/playwright-reference.md`) — decision tree, auth fixtures, network mocking, multi-user tests, WebSocket testing, debugging workflows
- SEO review checklist integrated into code-review.md
- Skill system expanded to 12 Core + 6 Optional Plugins (+ Challenge, Retro as Core; Audio Engineer, Accessibility Engineer as Optional)
- Playwright MCP visual checks integrated into Phase 4 (QA) and Phase 5 (Release)
- general.md: 6 new evidence-based rules with project citations

### Fixed
- WORKFLOW.md Phase 5: duplicate step numbering (two "6." entries)
- WORKFLOW.md: DRY violation — Build-Verify, Test-Coverage Gate, Tech Notes sections duplicated from `.claude/rules/general.md` and `testing.md`, replaced with compact reference table
- Playwright MCP cross-platform: ONBOARDING.md clarified that `.claude/settings.json` is the macOS/Linux default, Windows users override in `.claude/settings.local.json` (gitignored)
- `.gitignore`: added `.claude/settings.local.json` to prevent committing platform-specific MCP configs

## [0.3.0] — 2026-02-20

### Added
- **Performance Engineer skill** — Optional Plugin #4 for end-to-end performance lifecycle: profiling (USE/RED), load testing (7 types, Coordinated Omission-aware), caching architecture (6-level pyramid), capacity planning (Little's Law, USL), regression detection CI pipeline, algorithm & runtime optimization, memory management, Core Web Vitals, RUM strategy, PDRs
- Performance governance rules (`.claude/rules/performance.md`) with HARD RULES for budgets, measurement methodology, regression detection, caching, load testing, algorithm complexity
- Performance QA checklist integrated into code-review.md
- Performance handoff checklists in delivery-playbook.md (Architect→Perf, Perf→Engineers, Perf→QA, Perf→DevOps)
- `docs/performance/` directory as Single Source of Truth for performance artifacts (budgets, baselines, reports, decisions, dashboards)
- **Documentation Writer skill** — Optional Plugin #3 for documentation lifecycle management, Diataxis classification, API docs, data dictionaries, migration guides, freshness management, documentation audits, DDRs
- Documentation governance rules (`.claude/rules/documentation.md`) with HARD RULES for Diataxis classification, accuracy, API coverage, freshness tracking
- Documentation QA checklist integrated into code-review.md
- Documentation handoff checklists in delivery-playbook.md (Engineers→Doc Writer, Doc Writer→QA, Doc Writer→DevOps)
- `docs/documentation/` directory for documentation artifacts (INDEX.md, decisions/)
- **Content Strategist skill** — Optional Plugin #2 for voice/tone strategy, messaging hierarchy, terminology governance, content patterns (errors, empty states, buttons, notifications), content briefs, documentation copy, and CDRs
- Content governance rules (`.claude/rules/content.md`) with HARD RULES for voice consistency, terminology, error messages, microcopy standards
- Content QA checklist integrated into code-review.md
- Content cross-references in frontend.md and backend.md rules
- `docs/content/` directory as Single Source of Truth for content artifacts

### Changed
- Skill system expanded to 11 Core + 4 Optional Plugins (Game + Content + Documentation Writer + Performance Engineer)
- WORKFLOW.md: Content Strategist integrated at Phase 2 (voice/terminology), Phase 3 (content briefs), Phase 5 (release notes)
- init-project.sh: added `skill:content` GitHub label
- DevOps skill extended with Server Deployment Preparation (Docker + Nginx + SSL runbook generation)
- Added handoff protocols: Design→Frontend, Backend↔Database, QA blocker dependencies
- Added cross-skill security references (Backend→Security, QA→Security Testing)
- Integration checkpoint added between Backend and Frontend (Phase 3)
- Retro now mandatory after Phase 3 (Build), not just at project end
- Business value perspective added to Project Lead kickoff questions + Definition of Ready

## [0.2.0] — 2026-01-15

### Added
- Deployment runbook template (`docs/runbooks/deploy-template.md`) with copy-paste server commands
- Deployment section in CLAUDE.md template for project-specific server info
- E2E validation rules, CI debug strategy, auth library gotchas (from real project feedback)
- CI pipeline: template-safe mode (skips gracefully when no package.json), build step, security audit

## [0.1.0] — 2025-12-01

### Added
- Initial project setup with skill engineering system (11 Core + 2 Optional Plugins)
- GitHub Issues tracking with labels and milestones
