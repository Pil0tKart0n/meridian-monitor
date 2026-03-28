# Workflow — Vom Projekt-Idee bis zum fertigen Code

> Dieses Dokument ist der Master-Orchestrator für dein Skill-System (12 Core + 6 Optional Plugins).
> Es funktioniert in **Claude.ai** (Project Knowledge) und **Claude Code** (als Referenz).
> Tracking läuft über **GitHub Issues** (Labels + Milestones).
> Ziel: Du gibst eine Idee → Claude führt dich interaktiv durch Planung → codet dann autonom.

---

## Wie es funktioniert

```
DU: "Ich will X bauen"
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 0: KICKOFF (interaktiv, 5–15 Min)                       │
│  Claude fragt nach: Zielgruppe, Kernfeatures, Constraints,     │
│  Tech-Präferenzen, Timeline → produziert CLAUDE.md              │
│  → richtet GitHub Labels + Milestones ein (init-project.sh)     │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: DISCOVERY (interaktiv → dann autonom)                 │
│  Requirements Engineer zerlegt Idee in Epics + Stories          │
│  → erstellt GitHub Issues + Feature-Specs (Hybrid)              │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: DESIGN (interaktiv bei Entscheidungen)                │
│  Architect: Tech-Entscheidungen, Contracts, Diagrams, ADRs, SLOs│
│  Security: Threat Model, Auth-Plan (wenn PII/Auth)              │
│  Content Strategist: Voice & Tone, Messaging, Terminology       │
│    (optional Plugin — wenn Content-Governance aktiv)             │
│  Audio Engineer: Sonic Palette, Audio-Budgets, Event-Map         │
│    (optional Plugin — wenn Audio-Features aktiv)                 │
│  Accessibility Engineer: WCAG Baseline, Contrast, Keyboard Specs │
│    (optional Plugin — empfohlen für alle UI-Projekte)            │
│  Documentation Writer: Doku-Inventar, Freshness-Policy           │
│    (optional Plugin — wenn Doku-Governance aktiv)                │
│  Performance Engineer: Perf-Budgets, Baseline-Strategie          │
│    (optional Plugin — wenn Perf-Governance aktiv)                │
│  Designer: Design System, Tokens, Theming, Animation            │
│    + Art Direction (docs/design/art-direction.md)                │
│    + Asset-Generierung via PixelLab MCP (Pixel-Art-Projekte)    │
│    + Asset-Generierung via n8n/Scenario.com (Illustrated/Hi-Res)│
│  → produziert ADRs + OpenAPI + Architecture Diagrams (Mermaid)  │
│    + Threat Model + Voice Profile + Terminology                 │
│    + Sonic Palette + Audio-Budgets + A11y Specs + Perf-Budgets  │
│    + Design Tokens + Art Direction + Master Style Prompt         │
│    + Asset-Tracker + generierte Assets                           │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2.5: CI SETUP (autonom)                                  │
│  DevOps: Basic CI-Pipeline (lint, typecheck, test runner)       │
│  → produziert GitHub Actions / CI Config                        │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: BUILD (autonom — Claude codet)                        │
│  DB/BE/Game Engineers implementieren Story für Story            │
│  Audio Engineer: Audio-Engine, SFX, Adaptive Music              │
│    (optional Plugin — wenn Audio-Features aktiv)                 │
│  Designer poliert Komponenten, Animationen, Responsive          │
│  Frontend Engineer integriert alles mit Logik                   │
│  Challenge Engineer: Mid-Sprint Check (optional, on-demand)     │
│  → produziert Code, Tests, Migrations, Audio-Assets              │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: VERIFY (autonom)                                      │
│  QA Engineer: Tests, Coverage, Quality Gates                    │
│  Accessibility Engineer: WCAG Audit, Keyboard + SR Testing      │
│    (optional Plugin — empfohlen für alle UI-Projekte)            │
│  Security Engineer: Final Security Check + Hardening            │
│  Challenge Engineer: Pre-Release Check ("Was kann schiefgehen?")│
│  → produziert Testergebnisse, Quality + Security + A11y Report  │
│    + Challenge Report (Pre-Release Risiken)                      │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4.5: DEPLOYMENT READINESS (autonom)                      │
│  Docker build + compose up + health check                       │
│  → bei Self-hosted/Docker Projekten, sonst überspringen         │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: RELEASE (interaktiv für Approval)                     │
│  DevOps: Deployment, Docker, Production-Readiness               │
│  → produziert Docker/Deployment Config, PRR                     │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  RETRO (interaktiv — PFLICHT nach Phase 3 + am Ende, optional)  │
│  Retrospective Engineer: Sammelt Feedback, analysiert Prozess   │
│  → User entscheidet welche Verbesserungen umgesetzt werden      │
│  → produziert Retro-Report + genehmigte Fixes                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Kickoff — "Ich will X bauen"

### Was du sagst (Beispiele)
```
"Ich will eine Aufgabenverwaltung für kleine Teams bauen, mit Projekten,
 Tasks, Zuweisungen und Fortschrittstracking."

"Fix den Bug: Login-Seite zeigt 500er Fehler nach Passwort-Reset."

"Erweitere die App um Stripe-Payment-Integration."
```

### Was Claude tut
Claude erkennt automatisch den **Request-Typ** und wählt den passenden Flow:

| Du sagst... | Claude erkennt | Flow |
|-------------|---------------|------|
| "Baue X" / "Neues Projekt für Y" | **Greenfield-Projekt** | Phase 0 → 1 → 2 → 2.5 → 3 → Retro → 4 → 4.5 → 5 → Retro |
| "Erweitere um Feature X" | **Feature-Erweiterung** | Phase 1 → 2 → 3 → Retro → 4 → 4.5 → Retro |
| "Fix Bug: X" / "Fehler in Y" | **Bug-Fix** | Fast-Path (siehe unten) |
| "Refactore X" / "Verbessere Performance von Y" | **Tech-Debt/Refactoring** | Phase 2 → 3 → Retro → 4 |
| "Security-Audit" / "Prüfe die Sicherheit" | **Security Review** | Phase 2 (Security) → 4 |

### Greenfield: Interaktive Kickoff-Fragen

Claude fragt (nur was unklar ist, nicht alles):

1. **Was soll es tun?** — Kernproblem, Zielgruppe, wichtigste 3 Features
2. **Wer nutzt es?** — Rollen/Personas (Admin, User, Gast?)
3. **Constraints?** — Budget, Timeline, Compliance (DSGVO?), bestehende Systeme
4. **Tech-Präferenzen?** — Stack-Vorlieben (Next.js? Supabase? Self-hosted?)
5. **Scope?** — MVP first oder full-featured? Was ist explizit out-of-scope?

Danach produziert Claude:
- `CLAUDE.md` (Vision, Stack, Constraints)
- GitHub Setup via `init-project.sh` (Labels, Milestones, Issue Templates)
- Erstes Epic als GitHub Issue

**Du reviewst das, gibst OK → weiter zu Phase 1.**

---

## Phase 1: Discovery — Epics & Stories

### Was Claude tut (Requirements Engineer Skill)

1. Zerlegt die Kernfeatures in **Epics** (GitHub Issues mit `type:epic`)
2. Zerlegt Epics in **Stories** (GitHub Issues mit `type:story`)
3. Schreibt für jede Story: ACs (Given/When/Then), Edge Cases, NFRs
4. **Hybrid-Entscheidung:** Kleine Stories → alles im Issue Body. Große Epics → Spec-File unter `features/*.md`
5. Setzt Labels: type, status, skill, priority, size
6. Weist Stories Milestones (Sprints) zu

### Interaktionspunkt
Claude zeigt dir die Issues und fragt:
- "Stimmt die Priorisierung?"
- "Soll ich ein Epic ändern/entfernen/hinzufügen?"
- "Ist der MVP-Scope realistisch?"

**Du gibst OK → weiter zu Phase 2.**

---

## Phase 2: Design — Architektur, Security & Visual Design

### Was Claude tut (bis zu 8 Skills nacheinander, mit Checkpoints)

**Step 1 — Software Architect (`/architecture`):**
1. Tech-Entscheidungen als **ADRs**
2. **API Contracts** (OpenAPI)
3. **Architecture Diagrams** (Mermaid in `docs/architecture/`):
   - System Context (C4 Level 1) — PFLICHT
   - Container Diagram (C4 Level 2) — PFLICHT
   - ER-Diagram — wenn DB-Schema definiert wird
   - Sequence Diagrams — für komplexe Flows (Auth, Payment, etc.)
4. **Architecture Brief** (Systemgrenzen, Datenfluss, Diagramm-Links)
5. **Performance Budgets** und **SLOs**
6. **Asset-Pipeline-Entscheidung** (ADR, wenn Projekt visuelle Assets braucht):

```
"Braucht dieses Projekt generierte Grafiken?"
  → Nein                → Kein Asset-Pipeline-Setup, /design macht nur Tokens + SVGs
  → Ja, Pixel Art       → PixelLab MCP (direkt, kein n8n nötig)
  → Ja, Illustrated     → Scenario.com via n8n-Workflows (Custom Style Model)
  → Ja, beides          → Beide Pipelines parallel
```

Output bei "Ja": ADR mit Entscheidung + Trigger für `/design` Art Direction

**Step 2 — Security Engineer (`/security`, wenn PII/Auth/External Input):**
1. **Threat Model** (STRIDE) basierend auf Architektur-Entscheidungen
2. **Privacy Checkpoint** für PII-Features
3. **Auth-Architektur** definieren (falls nötig → ADR)
4. Security-ACs in Stories einfügen
5. Security-Issues erstellen für identifizierte Risiken
6. Output: `docs/security/threat-model-[feature].md`

**Step 3 — Content Strategist (`/content`, optional Plugin — wenn user-facing App):**
1. **Voice & Tone Profile** (NN/G 4-Dimension Framework, Tone Variation Map)
2. **Messaging Hierarchy** (Primary → Secondary → Tertiary Messages)
3. **Terminology/Glossary** (Preferred Terms, i18n Key Taxonomy)
4. **Content Patterns** (Error Messages, Empty States, Buttons, Notifications)
5. Output: `docs/content/voice-and-tone.md`, `docs/content/terminology.md`, `docs/content/patterns/`

**Step 4 — Immersive Audio Engineer (`/audio`, optional Plugin — wenn Audio-Features aktiv):**
1. **Audio-Kontext** verstehen (Projekttyp, Zielgerät, emotionale Ziele)
2. **Sonic Palette** definieren (visuelle Identität → Klangidentität übersetzen)
3. **Audio-Budget** definieren (Gesamt-Budget, Kategorie-Split, Voice-Limits)
4. **Audio-Event-Map** erstellen (Events → Sounds mit Prioritäten)
5. **Audio-Asset-Prompts** erstellen (strukturierte Prompts für Audio-KIs)
6. Output: `docs/audio/sonic-palette.md`, `docs/contracts/AUDIO-BUDGETS.md`, `docs/audio/event-map.md`

**Step 5 — Accessibility Engineer (`/a11y`, optional Plugin — empfohlen für alle UI-Projekte):**
1. **A11y Baseline Assessment** (WCAG Level, Zielgruppe, rechtliche Anforderungen)
2. **Color & Contrast System** designen (Token-basiert, Kontrast-Matrix)
3. **Keyboard & Focus Architecture** (Tab-Reihenfolge, Skip Links, Focus-Indicator)
4. **Component A11y Specs** (ARIA-Rollen, Keyboard-Verhalten, SR-Ankündigungen pro Komponente)
5. **A11y Testing Strategy** (axe-core CI, Screen Reader Scripts, Playwright MCP Checks)
6. Output: `docs/a11y/contrast-matrix.md`, `docs/a11y/focus-architecture.md`, `docs/a11y/component-specs.md`

**Step 6 — Documentation Writer (`/docs`, optional Plugin — wenn Doku-Governance aktiv):**
1. **Doku-Inventar** erstellen → `docs/documentation/INDEX.md`
2. **Diataxis-Klassifikation** pro Dokument (Tutorial / How-to / Reference / Explanation)
3. **Freshness-Trigger** definieren (was triggert ein Update pro Dokument?)
4. **README-Struktur** planen (User-Perspektive zuerst)
5. **API-Doku-Strategie** festlegen (wenn API vorhanden)

**Step 7 — Performance Engineer (`/perf`, optional Plugin — wenn Performance-Governance aktiv):**
1. **Performance Budgets** definieren/verfeinern (Frontend: CWV, Backend: p95/p99, DB: Query-Time)
2. **Baseline-Strategie** festlegen (wie und wann messen?)
3. **CI-Gate-Strategie** festlegen (welche Checks blockieren PRs?)
4. **Load-Test-Strategie** festlegen (Test-Typen, Frequenz)
5. Output: `docs/contracts/PERF-BUDGETS.md` (erweitert), `docs/performance/` Struktur

**Step 8 — Frontend Designer (`/design`):**
1. **Design Tokens** (Farben, Typography, Spacing, Motion)
2. **Tailwind Config** erweitern mit semantischen Tokens
3. **Component Patterns** (Elevation, Shadows, Radius)
4. **Dark Mode** Palette
5. **Animation System** (Transitions, Micro-Interactions)
6. **Art Direction + Asset-Generierung** (wenn ADR aus Step 1 eine Asset-Pipeline vorsieht):
   - `docs/design/art-direction.md` erstellen (Single Source of Truth für visuellen Stil)
   - Master Style Prompt definieren (konsistenter Prompt-Prefix für alle Assets)
   - Asset-Inventar + Tracker erstellen (`docs/design/asset-prompts.md`)
   - Pixel-Art-Assets via PixelLab MCP generieren (wenn Pixel-Art-Pipeline)
   - Illustrated/Hi-Res-Asset-Prompts dokumentieren (wenn Scenario.com-Pipeline)

### Pre-Mortem (EMPFOHLEN nach Phase-2-Skills, vor Design-Validation)

Bevor die Design-Validation startet, führt `/challenge` einen Pre-Mortem durch:

```
Szenario: Es ist 4 Wochen später. Das Projekt ist gescheitert. Warum?
```

1. **Technische Risiken:** Falsche Tech-Entscheidung? Skalierungsproblem? Integration bricht?
2. **UX-Risiken:** User versteht den Flow nicht? Edge Cases vergessen? Mobile untauglich?
3. **Business-Risiken:** Anforderungen ändern sich? Zeitplan unrealistisch? Rollback-Plan fehlt?
4. **Integrations-Risiken:** API-Contract instabil? Externe Abhängigkeit unzuverlässig?

**Output:** Challenge Report mit Risiko-Bewertung (Kritisch / Wichtig / Notiz).
Kritische Findings → ADR oder Story erstellen BEVOR Phase 3 startet.

> Vollständige Pre-Mortem-Methodik: `.claude/skills/challenge/SKILL.md` § Pre-Mortem

### Design-Validation (PFLICHT nach allen Phase-2-Skills)

Bevor Phase 2.5 startet, prüft der Architect ob alle Phase-2-Outputs **kompatibel** sind:

- [ ] **Performance vs. Audio:** Audio-Budget (MB) passt in Performance-Budget (Bundle-Size)?
- [ ] **Performance vs. A11y:** A11y-Anforderungen (extra ARIA, Skip-Links) vs. Performance-Budget (JS-Size)?
- [ ] **Security vs. UX:** Auth-Flow (MFA, Token-Refresh) vs. Content-Copy (Fehlermeldungen definiert)?
- [ ] **Design vs. A11y:** Farb-Tokens erfüllen Kontrast-Anforderungen (4.5:1 Text, 3:1 UI)?
- [ ] **Observability-Strategie definiert:** Was wird instrumentiert? (siehe unten)

**Bei Konflikten:** ADR erstellen mit Entscheidung + Trade-off-Begründung.
**Kein Konflikt?** Weiter zu Phase 2.5.

### Observability-Strategie (Phase 2, Architect-Output)

Der Architect definiert die Observability-Strategie **bevor Code geschrieben wird** — nicht erst beim Deployment:

1. **Structured Logging:** Log-Format (JSON), Log-Levels (debug/info/warn/error), was wird geloggt (requestId, userId, endpoint, duration)
2. **Error Tracking:** Tool-Entscheidung (Sentry, Highlight, etc.) + welche Errors erfasst werden
3. **Health Checks:** Welche Abhängigkeiten prüft `/api/health`? (DB, Redis, externe APIs)
4. **Metriken/SLIs:** Welche Metriken werden getrackt? (Error Rate, p95 Latency, Apdex)
5. **Alerting-Schwellen:** Ab wann wird alarmiert? (Error Rate > 1%, p95 > Budget × 1.5)

Output: Abschnitt im Architecture Brief oder separates `docs/observability-strategy.md`.
**Backend setzt diese Strategie in Phase 3 um** — kein Ad-hoc-Logging, sondern planmäßig.

### Interaktionspunkt
Bei **wichtigen Entscheidungen** fragt Claude:
- "SSR oder SPA für die Hauptseiten?" (→ Architect)
- "Braucht das Projekt generierte Grafiken? Pixel Art oder Illustrated?" (→ Architect)
- "Eigenes Design System oder shadcn/ui erweitern?" (→ Designer)
- "Dezente oder auffällige Animationen?" (→ Designer)
- "Welche Auth-Strategie? JWT, Session, OAuth?" (→ Security)

**Du entscheidest, Claude dokumentiert → weiter zu Phase 2.5.**

---

## Phase 2.5: CI Setup — Grundlegendes CI/CD

### Was Claude tut (DevOps Engineer Skill — 1. Durchlauf)

1. **GitHub Actions** Basis-Pipeline: lint, typecheck, test runner
2. Pipeline läuft bei jedem Push → Fehler werden ab Phase 3 sofort sichtbar
3. Kein Deployment-Setup in diesem Schritt (kommt in Phase 5)

### Output
- `.github/workflows/ci.yml` (oder äquivalent)
- Scripts in `package.json` verifiziert (`lint`, `typecheck`, `test`)

### Empfohlene Erweiterungen (nach Sprint 1 — wenn erste Tests laufen)

> Diese Gates NICHT in Sprint 1 erzwingen — sie blockieren die frühe Entwicklung.
> Nach dem ersten stabilen Build schrittweise hinzufügen.

| Gate | Tool | Wann hinzufügen | Warum |
|------|------|----------------|-------|
| **Bundle-Size** | `size-limit` | Nach erstem Build | Verhindert unbemerkte Bundle-Explosion (belegt: 141KB → 565KB ohne Gate) |
| **Coverage Threshold** | `vitest --coverage` | Nach Sprint 1 | Warnt bei sinkender Coverage, verhindert Test-Verfall |
| **a11y CI** | `axe-core` in Playwright | Wenn E2E vorhanden | ARIA-Fehler automatisch finden — nicht erst im Security-Audit |
| **Dependency Security** | `npm audit --audit-level=high` | Sofort | Kritische Vulnerabilities blockieren PR automatisch |

```yaml
# Beispiel: .github/workflows/ci.yml (erweitert)
- name: Dependency Security
  run: npm audit --audit-level=high

- name: Bundle Size
  run: npx size-limit  # benötigt .size-limit.json

- name: Coverage
  run: npm run test -- --coverage --reporter=text
  # Optional: threshold in vitest.config.ts setzen
```

**Automatisch weiter zu Phase 3.**

---

## Phase 3: Build — Code schreiben

### Was Claude tut (DB/BE/Game/Design/FE Engineer Skills)

Claude arbeitet **Story für Story** ab (aus GitHub Issues: `status:ready`):

1. Nächste Story starten: `gh issue edit #N --add-label "status:in-progress"`
2. Implementiert Code (Komponenten, Endpoints, Migrations, Design, Tests)
3. Story abschließen: `git commit -m "feat(scope): description\n\nCloses #N"`
4. Geht zur nächsten Story

### Skill-Reihenfolge in Phase 3

```
1.  /database   (wenn relevant) — Schema/Migration + Test
2.  /backend    — API-Endpoints + Auth + DB-Queries + Test
3.  ── Integration Checkpoint ── (API-Endpoints komplett? OpenAPI aktuell? Auth funktioniert?)
4.  /game       (optional Plugin, wenn relevant) — Game Engine, Netcode, Server
5.  /content    (optional Plugin) — Content Briefs für UI-Stories, Microcopy-Specs
6.  /audio      (optional Plugin) — Audio-Engine, SFX, Adaptive Music
7.  /design     (2. Durchlauf) — Component Polish, Animation, Responsive
8.  /frontend   — UI + API-Anbindung + Design-Integration + Content-Integration + Test
9.  /docs       (optional Plugin) — Doku parallel zum Code: API-Doku, Guides, README
10. /perf       (optional Plugin) — Baselines messen, Smoke Load Test in CI, Profiling
```

### Skill-Rotation (ERINNERUNG)

> Wiederkehrender Fehler: /security, /qa, /devops werden nur am Projekt-Ende aktiviert.
> Das ist zu spät — Sicherheitslücken und Qualitätsprobleme akkumulieren über Sprints.

- **`/security`** gehört zu JEDEM Sprint mit neuen Endpoints oder Auth-Änderungen
- **`/qa`** gehört zu JEDEM Sprint — Coverage-Trends erkennen, bevor sie kritisch werden
- **`/a11y`** gehört zu JEDEM Sprint mit neuen UI-Komponenten (wenn A11y-Governance aktiv) — ARIA, Keyboard, Kontrast pro Komponente prüfen
- **`/retro`** MUSS am Sprint-Ende durchgeführt werden — NICHT batch-weise nach mehreren Sprints
- **`/devops`** mindestens alle 2 Sprints prüfen: CI grün? Deployment noch funktionsfähig?

```
✅ Gutes Muster:   Sprint 1: /backend → /frontend → /qa → /retro
❌ Schlechtes:     Sprint 1-5: /backend → /frontend | Sprint 6: alles auf einmal
```

**Jeder Skill schreibt seine eigenen Tests** (Unit/Integration).
CI-Pipeline aus Phase 2.5 verifiziert nach jedem Commit automatisch.

### Post-Feature Self-Review (PFLICHT — nach jeder abgeschlossenen Story)

Bevor ein Skill den Commit macht, prüft er:
- [ ] `npm run typecheck` — keine Fehler
- [ ] `npm run lint` — keine Fehler
- [ ] Tests geschrieben UND ausgeführt (`npm run test`)
- [ ] Keine hardcodierten Werte (URLs, Ports, Secrets, localhost)
- [ ] CHANGELOG.md aktualisiert (wenn user-facing Änderung — auch Style, Copy, UX-Tweaks zählen als user-facing!)
- [ ] API/WS-Contracts aktuell (wenn neue Endpoints/Messages)
- [ ] Architecture Diagrams aktuell (wenn neue Integration, Schema-Änderung, neuer Flow)
- [ ] `git diff --stat` — Änderungen fokussiert, kein Scope Creep
- [ ] **Playwright MCP Visual Check** (wenn UI-Änderung):
  - `browser_navigate` zur geänderten Seite
  - `browser_resize` auf 320px + 768px + 1440px prüfen
  - `browser_snapshot` für Accessibility-Tree-Check
  - Probleme als Bug-Issue erfassen, nicht ignorieren

**Erst nach grünem Self-Review:** `git commit` + `git push`

### Agent-Delegation-Regeln (für Sub-Agents in Phase 3)

Wenn Skills als Sub-Agents laufen (`agent: true`), gelten zusätzliche Regeln:

**Commit-Granularität:**
- Sub-Agents committen **pro logischer Einheit** (1 Endpoint, 1 Component, 1 Migration)
- Nicht: "alles am Ende als ein großer Commit"
- Jeder Commit enthält `Closes #N` oder `Refs #N`

**Parallele Agents — File Ownership:**
- Wenn mehrere Agents parallel laufen, dürfen sie **nicht dieselben Dateien editieren**
- Vor dem Start paralleler Agents: Dateien pro Agent klar zuweisen
- Shared Files (z.B. `types/`, `lib/config.ts`) → nur ein Agent editiert, andere importieren

**Context-Window-Schutz:**
- Sub-Agents mit `maxTurns` begrenzt (30-50 je nach Komplexität)
- Bei Überschreitung: Checkpoint zeigen, Fortschritt committen, neuen Agent starten

### Integration Checkpoint (nach Backend, vor Frontend UI)

Bevor der Frontend Engineer mit der UI-Implementation startet:
- [ ] Alle API-Endpoints implementiert und getestet?
- [ ] OpenAPI-Spec (`docs/contracts/api-v1.yaml`) aktuell und matcht Implementation?
- [ ] Architecture Diagrams aktuell? (Container + ER matchen Implementation)
- [ ] Error-Responses dokumentiert (Codes + Messages)?
- [ ] Auth-Middleware funktioniert (Token-Validierung, Role-Check)?
- [ ] Health-Check Endpoint vorhanden (`GET /api/health`)?

**Falls nicht komplett:** Backend-Issues erstellen. Frontend startet trotzdem mit Mock-Daten
(MSW) für nicht-blockierende Stories, aber API-abhängige Stories warten.

### Sprint-Close-Ritual (PFLICHT — unmittelbar nach letztem Story-Commit)

> Dieses Ritual wird am Ende JEDES Sprints durchgeführt, nicht nur am Ende von Phase 3.
> Belegt: Pong vergaß 6 Doku-Updates + CHANGELOG-Versionierung. Zombie-Killer: 3/12 Sprints ohne Retro.

```
1. npm run test -- --run                    → 0 Failures bestätigen
2. CHANGELOG.md versionieren               → [Unreleased] → [X.Y.Z] — YYYY-MM-DD
3. CLAUDE.md aktualisieren                 → Current Sprint + Phase Log
4. README.md abgleichen                    → Neue Features? Quickstart korrekt?
5. Playwright MCP Visual Checks            → 320px, 768px, 1440px auf Main Pages
6. Epic-Issues schließen                   → Alle Stories done/deferred → Epic close
7. git commit -m "chore(sprint): close Sprint N"
8. /retro aktivieren                       → PFLICHT, kein Sprint ohne Retro
```

**Regel:** Sprint-Close-Commit MUSS vor Retro-Start gepusht sein.
Action Items aus Retro → **immer** als GitHub Issues (nie nur Markdown).

### Phase 3 Exit Gate (PFLICHT — bevor Phase 4 startet)

Bevor QA beginnt, müssen folgende Bedingungen erfüllt sein:
- [ ] Alle geplanten Stories für diesen Sprint sind `status:done` oder explizit verschoben
- [ ] Alle Post-Feature Self-Reviews bestanden
- [ ] `npm run typecheck && npm run lint && npm run test` grün
- [ ] Alle Commits gepusht, keine uncommitted Changes
- [ ] CHANGELOG.md unter `[Unreleased]` aktuell
- [ ] API/WS-Contracts matchen Implementation
- [ ] Architecture Diagrams matchen Implementation (`docs/architecture/`)
- [ ] Sprint-Close-Ritual durchgeführt (siehe oben)
- [ ] `/retro` (PFLICHT nach Phase 3) durchgeführt — Findings addressiert oder als Issues erfasst

---

## Phase 4: Verify — Testen & Security-Hardening

### Was Claude tut (bis zu 5 Skills, mit Checkpoints)

**Step 1 — QA Engineer (`/qa`):**
1. Test-Coverage pro Story prüfen
2. Fehlende Tests ergänzen (E2E, Integration)
3. Quality Gate Checks (a11y, Performance)
4. **Playwright MCP Visual Audit** (wenn UI-Projekt):
   - Alle Screens auf 320px, 375px, 768px, 1440px per `browser_resize` + `browser_take_screenshot`
   - `browser_snapshot` für Accessibility-Tree (fehlende Labels, kaputte ARIA)
   - Touch-Targets < 44px identifizieren, horizontales Scrollen prüfen
   - Overlay-/Z-Index-Probleme erkennen (Menus die Content verdecken)
   - Screenshots als Evidenz an Quality Report anhängen
5. **Quality Report** als Issue-Kommentar
6. Bugs als neue Issues erstellen

**Step 1.5 — Accessibility Engineer (`/a11y`, optional Plugin — WCAG Audit):**
1. Kontrast-Audit gegen `docs/a11y/contrast-matrix.md`
2. Keyboard-Navigation: alle Flows per Keyboard-only durchspielen
3. Screen Reader Test (NVDA/VoiceOver) auf kritische Flows
4. axe-core CI-Gate verifizieren (Lighthouse A11y ≥ 90)
5. Focus-Management prüfen (Skip Links, Modal Focus Trap, Tab-Reihenfolge)
6. **A11y Report** als Issue-Kommentar, Bugs als Issues

**Step 2 — Security Engineer (`/security`, 2. Durchlauf — Final Check):**
1. `npm audit` — keine High/Critical Vulnerabilities
2. Security Headers überprüfen
3. Auth-Flow validieren (Penetrationstest-Vorbereitung)
4. Keine PII in Logs/Error Messages
5. Rate Limiting auf Auth-Endpoints verifizieren
6. **Security Report** als Issue-Kommentar

**Step 3 — Documentation Writer (`/docs`, optional Plugin — Doku-Audit):**
1. Freshness-Check (Doku kontradiert aktuellen Code?)
2. Vollständigkeits-Check (jeder Endpoint, jedes Feature dokumentiert?)
3. Link-Validation (keine broken internal links)
4. Doku-Inventar updaten

**Step 4 — Performance Engineer (`/perf`, optional Plugin — Performance Verification):**
1. Full Load Test (erwarteter Traffic, 15 Min)
2. Regression Check (p95/p99 within budget?)
3. Bundle Size Audit
4. Performance Report mit Before/After Zahlen

---

## Phase 4.5: Deployment Readiness Checkpoint

> Zwischen QA/Security (Phase 4) und Release (Phase 5). Verhindert, dass Deployment-Probleme erst am Ende auffallen.

### Wann diesen Checkpoint ausführen
- **Immer** wenn das Projekt Docker/Self-hosted Deployment nutzt
- **Immer** wenn ein separater Server-Prozess existiert (WebSocket, Game-Server, Worker)
- **Überspringen** bei reinem Vercel/Railway/Serverless Deployment

### Checklist (muss GRÜN sein bevor Phase 5 startet)

**Build & Services:**
- [ ] `docker build` erfolgreich (alle Dockerfiles im Repo)
- [ ] `docker compose -f docker-compose.prod.yml up` → alle Services starten
- [ ] Health Check: `curl http://localhost:PORT/api/health` → 200
- [ ] Alle Services erreichbar (App, DB, WS-Server, Redis — je nach Stack)
- [ ] `build:server` Script existiert und funktioniert (wenn separater Server-Prozess)
- [ ] Keine TypeScript/Path-Alias Fehler im Build-Output
- [ ] Container-Logs zeigen keine Startup-Errors

**Configuration & Environment:**
- [ ] `.env.production.example` vorhanden mit allen benötigten Variablen
- [ ] Keine hardcodierten `localhost` / `127.0.0.1` URLs im Code (alles via ENV)
- [ ] Client funktioniert hinter Reverse-Proxy (relative URLs oder konfigurierbare Base-URL)
- [ ] WebSocket-URLs konfigurierbar (nicht hardcoded `ws://localhost:...`)

**Dokumentation:**
- [ ] README.md Deployment-Sektion vorhanden oder verlinkt
- [ ] Server-Info gesammelt (IP, Domain, Ports, OS) — wenn Self-hosted
- [ ] Bestehende Services auf dem Server bekannt (Port-Konflikte vermieden)

### Bei Fehlern
Rücksprung zum zuständigen Skill:
- Dockerfile kaputt → `/devops`
- Build-Script fehlt → `/architecture` (ADR + Script definieren)
- Server-Code TypeScript-Fehler → `/backend` oder `/game`
- Dependencies fehlen → `/devops` (Dockerfile Dependencies prüfen)

Erst wenn dieser Checkpoint grün ist → weiter zu Phase 5.

---

## Phase 5: Release — Deployment vorbereiten

### Was Claude tut

**Step 1 — Content Strategist (`/content`, optional Plugin — Release Copy):**
1. Release Notes schreiben (user-facing, benefits-focused)
2. CHANGELOG-Einträge reviewen (user-facing Sprache?)
3. README polieren (Voice-konsistent, aktueller Stand)

**Step 2 — Documentation Writer (`/docs`, optional Plugin — Final Documentation):**
1. README finalisieren (aktueller Stand, Quickstart funktioniert)
2. CHANGELOG versionieren ([Unreleased] → Version)
3. API-Doku deployen (wenn extern)
4. Freshness-Triggers verifizieren

**Step 3 — Performance Engineer (`/perf`, optional Plugin — Production Validation):**
1. Production-Baselines aktualisieren
2. Alerting-Thresholds setzen (p95 > budget → alert)
3. RUM aktivieren (wenn noch nicht)

**Step 4 — DevOps Engineer (`/devops`, 2. Durchlauf):**
1. Erstellt/aktualisiert Dockerfile, docker-compose.prod.yml
2. Generiert Nginx-Config (deploy/nginx.conf) mit SSL + Security Headers
3. Production Deployment Config (Environment, Secrets)
4. **Deployment Diagram finalisieren** (`docs/architecture/deployment.md` — Mermaid)
5. Production Readiness Review (PRR) als Issue-Kommentar
6. **Deployment-Runbook generieren** (`docs/runbooks/deploy.md`)
   — Basierend auf `docs/runbooks/deploy-template.md`
   — Platzhalter mit echten Projekt-Werten ersetzen
   — Copy-paste Befehle für Ersteinrichtung + Updates
7. Monitoring/Health-Check Setup
8. CLAUDE.md Deployment-Sektion ausfüllen

### Interaktionspunkt
Claude zeigt den Deployment-Plan und fragt:
- "Deployment-Config und Runbook bereit. Soll ich deployen?"
- "README und CHANGELOG finalisiert. Passt alles?"
- "Performance-Baselines aktualisiert. Finales Go?"

**Du gibst das finale Go → Deployment wird ausgeführt → Retro.**

---

## Fast-Path: Bug-Fix

```
DU: "Fix Bug: Login zeigt 500er nach Passwort-Reset"
     │
     ▼
Claude:
  1. Liest relevanten Code
  2. Analysiert Ursache
  3. Implementiert Fix + Regression-Test
  4. git commit -m "fix(auth): resolve 500 on password reset\n\nCloses #N"
```

---

## Welcher Skill wann? (Automatische Aktivierung)

| Situation | Primär-Skill | Support-Skills |
|-----------|-------------|----------------|
| "Neue Projekt-Idee" | **Project Lead** → **Requirements** | Architect, Security |
| "Erstelle Stories für Feature X" | **Requirements** | QA (Testability), Security (PII) |
| "Welcher Tech-Stack?" | **Architect** | Security (Auth) |
| "Design System aufsetzen" | **Designer** | Frontend |
| "Baue die Login-Page" | **Frontend** + **Designer** | Backend (API), Security (Auth) |
| "Erstelle den API-Endpoint" | **Backend** | DB (Queries), Architect (Contract) |
| "Schema für Users-Tabelle" | **Database** | Backend (Queries), Security (Encryption) |
| "Security-Audit" | **Security** | Alle (Fixes) |
| "Teste Feature X" | **QA** | Alle (Fixes) |
| "Deploye das Projekt" | **DevOps** | Architect (PRR), Security (Headers) |
| "Baue das Multiplayer-Game" | **Game** | Backend, DevOps, Audio, Designer (PixelLab Assets) |
| "Sounds/Audio für das Projekt" / "Sonic Branding" | **Audio Engineer** | Designer, Frontend, Game |
| "Das fühlt sich tot an" / "mehr Immersion" | **Audio Engineer** | Designer |
| "Erstelle Grafiken/Sprites" / "Pixel Art" | **Designer** (PixelLab MCP) | Game, Frontend |
| "Generiere Tilesets/Characters" | **Designer** (PixelLab MCP) | Game |
| "Generiere Hi-Res Assets/Illustrationen" | **Designer** (n8n → Scenario.com) | Game, Frontend |
| "Trainiere Style Model" / "Konsistenter Stil" | **Designer** (n8n → Scenario.com) | — |
| "Content-Strategie definieren" / "Voice festlegen" | **Content Strategist** | Designer, Frontend, i18n |
| "Was soll auf dem Button stehen?" | **Content Strategist** | Frontend |
| "Schreib bessere Fehlermeldungen" | **Content Strategist** | Backend |
| "Release Notes schreiben" | **Content Strategist** | DevOps |
| "Schreib API-Doku" / "README updaten" / "Doku-Audit" | **Documentation Writer** | Backend, Frontend, Architect |
| "Ist die Doku aktuell?" / "Onboarding-Guide" | **Documentation Writer** | Alle (als Input) |
| "Warum ist das langsam?" / "Performance optimieren" | **Performance Engineer** | Backend, Frontend, Database |
| "Load Test" / "Bundle Size" / "Caching-Strategie" | **Performance Engineer** | Backend, DevOps |
| "Was ist der Status?" | **Project Lead** | — |
| "Prüfe die UI visuell" / "Visual Check" | **QA** (Playwright MCP) | Frontend, Designer |
| "MCP Server einrichten" | **DevOps** | Architect (Entscheidung) |
| "Was könnte schiefgehen?" / `/challenge` | **Challenge** | Alle (als Input) |
| "Was lief gut/schlecht?" / `/retro` | **Retro** | Alle (als Input) |

---

## Zusammenarbeit: Interaktiv vs. Autonom

| Phase | Modus | Warum |
|-------|-------|-------|
| **0 Kickoff** | Interaktiv | Du definierst Was und Warum |
| **1 Discovery** | Interaktiv → Autonom | Du bestätigst Scope, Claude schreibt Stories |
| **2 Design** | Interaktiv bei Entscheidungen | Du wählst bei Architektur, Security, Design Trade-offs |
| **2.5 CI Setup** | **Autonom** | Standard-Pipeline, keine Entscheidungen nötig |
| **3 Build** | **Autonom** | Claude codet Story für Story |
| **4 Verify** | **Autonom** | Claude testet + Security-Hardening |
| **5 Release** | Interaktiv für Approval | Du gibst das finale Go |
| **Retro** | **Interaktiv** | Du entscheidest was umgesetzt wird |

**Regel:** Claude fragt nur, wenn etwas wirklich unklar ist — nicht bei jedem Schritt.

---

## Checkpoint-Protokoll (PFLICHT)

> Diese Regel gilt für JEDEN Skill-Übergang. Kein Skill darf einfach enden ohne Checkpoint.

### Was ist ein Checkpoint?
Nach Abschluss eines Skills zeigt Claude:
1. **Zusammenfassung** — Was wurde erledigt (Dateien, Commits, Key Decisions)
2. **Nächster Schritt** — Welcher Skill als nächstes kommt und warum
3. **Frage** — "Möchtest du den aktuellen Stand prüfen oder soll ich direkt weiter machen mit `/next-skill`?"

### Checkpoint-Format
```
✅ [Skill-Name] abgeschlossen.
   Erledigt: [1-3 Bullet Points]
   Commits: [commit hashes]

➡️ Nächster Schritt: /[next-skill] — [Grund]

Möchtest du den aktuellen Stand prüfen oder soll ich direkt weiter machen?
```

### Regeln
- **NIEMALS** einfach aufhören ohne Checkpoint — auch wenn ein Fehler auftritt
- **NIEMALS** den nächsten Skill starten ohne den User zu fragen
- **IMMER** den konkreten nächsten Skill benennen (nicht "du könntest X oder Y machen")
- Wenn der User "weiter" sagt → sofort den genannten Skill starten, nicht nochmal fragen
- Wenn der User "prüfen" sagt → warten, dann nach Review weiter
- Bei Fehlern: Checkpoint trotzdem zeigen, Problem benennen, Lösungsvorschlag machen

### Phasen-Übergänge (automatische Reihenfolge)
Wenn kein abweichender Kontext vorliegt, folgt die Skill-Kette diesem Standard:

```
Phase 0:   /pm (Project Lead)
Phase 1:   /requirements (Epics + Stories)
Phase 2:   /architecture → /security (Threat Model, wenn PII/Auth)
           → /content (optional Plugin, Voice + Terminology + Patterns)
           → /audio (optional Plugin, Sonic Vision + Audio-Budgets + Event-Map)
           → /a11y (optional Plugin, WCAG Baseline + Contrast + Keyboard Specs)
           → /docs (optional Plugin, Doku-Inventar + Doku-Plan)
           → /perf (optional Plugin, Performance Budgets + Baseline-Strategie)
           → /design (System)
Phase 2.5: /devops (Basic CI: lint, typecheck, test runner)
Phase 3:   /database (wenn relevant) → /backend → Integration Checkpoint
           → /game (optional Plugin, wenn relevant)
           → /content (optional Plugin, Content Briefs für UI-Stories)
           → /audio (optional Plugin, Audio-Engine + SFX + Adaptive Music)
           → /design (Component Polish) → /frontend
           → /docs (optional Plugin, Doku parallel zum Code)
           → /perf (optional Plugin, Baselines + Smoke Load Test)
           → Phase 3 Exit Gate
           → /retro (PFLICHT — Build-Phase Retrospektive)
Phase 4:   /qa (inkl. Content QA Checklist)
           → /a11y (optional Plugin, WCAG Audit + Keyboard + Screen Reader)
           → /security (Final Check + Hardening)
           → /docs (optional Plugin, Doku-Audit + Freshness-Check)
           → /perf (optional Plugin, Full Load Test + Regression Check)
Phase 4.5: Deployment Readiness Checkpoint (Docker build, compose up, health check)
Phase 5:   /content (optional Plugin, Release Notes + README Polish)
           → /docs (optional Plugin, README finalisieren + CHANGELOG versionieren)
           → /perf (optional Plugin, Production-Baselines + Alerting)
           → /devops (Deployment, Docker, Production)
Retro:     /retro (nach Phase 5 pflicht, nach jeder anderen Phase optional)
```

Skills mit "(wenn relevant)" werden übersprungen wenn nicht benötigt.
`/retro` ist **pflicht** nach Phase 3 (Build) und am Projekt-Ende. Optional nach jeder anderen Phase.
Begründung: Nach der Build-Phase ist der wichtigste Feedback-Zeitpunkt — Prozess-Probleme hier erkannt können für Phase 4-5 noch korrigiert werden.
Jeder Pfeil = ein Checkpoint. Claude schlägt den nächsten Skill vor, User bestätigt oder ändert.

### Meta-Retro (EMPFOHLEN alle 3–4 Sprints)

Retrospektive des Retro-Prozesses selbst. Analysiert ob Retros effektiv sind:
1. Folgen alle Retros dem `docs/retro/TEMPLATE.md` Standard?
2. Wurden Action Items als GitHub Issues erfasst (nicht nur Markdown)?
3. Timing: Retro am Sprint-Ende oder verzögert?
4. Playwright-Evidence: Vor Sprint-Close gesammelt (nicht erst in der Retro)?
5. Test-Coverage-Trends: Unit vs. Integration vs. E2E — systematische Lücken?

Output: `docs/retro/META-RETRO-YYYY-MM-DD.md`

**Belegt:** Zombie-Killer Meta-Retro über 17 Retros fand: 3 Sprints ohne Retro, ~20% Action Items nie als Issue erfasst, inkonsistente Formate.

---

## Skill-Dependency-Graph (Was braucht was?)

> Zeigt welche Outputs ein Skill braucht bevor er starten kann.
> Verhindert dass Skills starten ohne ihre Voraussetzungen zu prüfen.

### Daten-Abhängigkeiten

| Skill | Braucht Input von | Produziert Output für |
|-------|-------------------|----------------------|
| `/pm` | User-Anforderungen | Alle (CLAUDE.md, GitHub Setup) |
| `/requirements` | `/pm` (Scope, Constraints) | `/architecture`, `/security`, `/design` (Stories, ACs) |
| `/architecture` | `/requirements` (Stories, NFRs) | `/backend`, `/frontend`, `/database`, `/devops`, `/security` (ADRs, Contracts, Diagrams) |
| `/security` | `/architecture` (Systemgrenzen, Auth-Design) | `/backend` (Auth-ACs), `/frontend` (CSRF, CSP), `/devops` (Headers) |
| `/content` | `/requirements` (User-Stories), `/design` (Brand) | `/frontend` (Copy-Specs, Error Messages), `/docs` (Voice Profile) |
| `/a11y` | `/design` (Tokens, Colors), `/architecture` (Component-Plan) | `/frontend` (A11y-Specs), `/qa` (Test-Kriterien) |
| `/design` | `/architecture` (Tech-Stack), `/content` (Voice) | `/frontend` (Tokens, Component-Specs), `/audio` (Sonic Palette Input) |
| `/audio` | `/design` (Sonic Palette Direction), `/architecture` (Tech-Stack) | `/frontend`, `/game` (Audio-Event-Map, Assets) |
| `/database` | `/architecture` (ER-Diagram, Schema-Design) | `/backend` (Tabellen, Queries) |
| `/backend` | `/architecture` (API-Contract), `/database` (Schema), `/security` (Auth-ACs) | `/frontend` (API-Endpoints), `/qa` (Testbare Endpoints) |
| `/game` | `/architecture` (Netcode-ADR), `/backend` (API), `/audio` (Events) | `/frontend` (Game-UI), `/qa` (Game-Flows) |
| `/frontend` | `/backend` (API), `/design` (Tokens), `/content` (Copy), `/a11y` (Specs) | `/qa` (UI-Flows), `/perf` (Bundle) |
| `/docs` | Alle Skills (als Input) | User-facing Doku, API-Doku |
| `/perf` | `/backend` (Endpoints), `/frontend` (Bundle), `/database` (Queries) | `/devops` (CI-Gates, Budgets) |
| `/qa` | `/backend`, `/frontend`, `/game` (Implementierter Code) | Bug-Issues, Quality Report |
| `/devops` | `/architecture` (Deployment-ADR), `/perf` (CI-Gates) | Production-Infra, CI-Pipeline |
| `/challenge` | Alle Skills (Pläne, ADRs, Code-Reviews) | Risiko-Reports, Edge-Case-Listen, Decision-Reviews |
| `/retro` | Alle Skills (Commits, Issues, Metriken) | Action Items, Prozess-Verbesserungen |

### Checkliste vor Skill-Start

Bevor ein Skill aktiviert wird, prüfe ob seine **kritischen Inputs** vorhanden sind:

```
/frontend starten?
  → API-Contract vorhanden?     (docs/contracts/api-v1.yaml)
  → Design-Tokens definiert?     (tailwind.config.ts, CSS Custom Properties)
  → Content-Specs vorhanden?     (docs/content/patterns/ — wenn /content aktiv)
  → A11y-Specs vorhanden?        (docs/a11y/component-specs.md — wenn /a11y aktiv)

/backend starten?
  → ADRs getroffen?              (docs/adr/)
  → DB-Schema definiert?         (prisma/schema.prisma oder äquivalent)
  → Auth-Strategie entschieden?  (ADR + Security Threat Model)

/qa starten?
  → Alle Stories implementiert?  (status:done auf geplanten Issues)
  → API-Contract aktuell?       (OpenAPI matcht Implementation)
  → E2E-fähige App läuft?       (npm run dev oder docker compose up)
```

**Regel:** Fehlender Input ≠ Blocker. Der Skill benennt was fehlt und erstellt ein Issue für den zuständigen Skill. Bei nicht-blockierenden Lücken kann mit Mock-Daten oder Platzhaltern gearbeitet werden.

---

## Pre-Flight Check (bei jedem Skill-Start)

> Jeder Skill liest bei Aktivierung nicht nur seine SKILL.md, sondern prüft auch den Kontext.

### Pflicht-Reads bei Aktivierung
1. `CLAUDE.md` — Projekt-Kontext, Tech-Stack, Constraints
2. `docs/tech-notes.md` — Library-Gotchas, Breaking Changes, bekannte Workarounds
3. **Output des Vorgänger-Skills prüfen** — Was wurde gebaut? Welche Dateien? Welche Entscheidungen?
4. Relevante bestehende Dateien lesen bevor neue erstellt werden

### Übergabe-Check
Bevor ein Skill mit der Arbeit beginnt:
- [ ] Verstanden was der Vorgänger-Skill gebaut hat?
- [ ] Sind alle Voraussetzungen da? (z.B. DB-Schema bevor Backend startet)
- [ ] Gibt es Einträge in `docs/tech-notes.md` die relevant sind?
- [ ] Domain Language aus `CLAUDE.md` gelesen? (Begriffe konsistent verwenden)

---

## Phase Summaries (Context-Brücke)

> Jeder Skill schreibt beim Checkpoint eine kurze Zusammenfassung, damit der nächste Skill den Kontext hat.

### Wo
In `CLAUDE.md` unter einem Abschnitt `## Phase Log` (wird automatisch ergänzt):

```markdown
## Phase Log
### Phase 2 — Architecture
- ADR-001: Next.js API Routes statt Express
- API Contract: docs/contracts/api-v1.yaml
- Auth: JWT + httpOnly Cookie Refresh Token

### Phase 2 — Security
- Threat Model: docs/security/threat-model-auth.md
- Findings: Rate Limiting auf /api/auth/* erforderlich

### Phase 3 — Backend
- 5 API Endpoints implementiert (siehe OpenAPI spec)
- Auth-Middleware: src/middleware/auth.ts
- Prisma Schema: 4 Tabellen (User, Session, Room, Score)
```

### Regel
- Jeder Skill ergänzt seinen Eintrag im Phase Log **beim Checkpoint**
- Nächster Skill **liest das Phase Log** beim Pre-Flight Check
- Maximal 3-5 Zeilen pro Eintrag — nur Key Decisions und wichtige Dateipfade

---

## Error Recovery (Rücksprung-Logik)

> Was passiert wenn etwas schiefgeht?

### Build-Fehler (Phase 3)
```
Fehler in /backend → Fix im selben Skill → erneut testen → weiter
Fehler erfordert Schema-Änderung → Rücksprung zu /database → dann /backend nochmal
```

### Kritisches Security-Finding (Phase 4)
```
Security findet kritische Lücke → erstellt P0-Issue
→ Rücksprung zum betroffenen Skill (/backend, /frontend)
→ Fix implementieren + Test
→ /security nochmal Final Check
```

### Architektur-Problem während Build
```
User merkt in Phase 3: "Die Architektur passt nicht"
→ Pause → /architecture Revision (neues ADR)
→ Betroffene Skills in Phase 3 nochmal durchlaufen
```

### Generelle Regel
- **Kleine Fixes:** Im aktuellen Skill beheben, kein Rücksprung nötig
- **Cross-Skill-Fixes:** Rücksprung zum zuständigen Skill, dann vorwärts
- **Architektur-Revisionen:** Checkpoint an User, dann gezielte Nacharbeit
- **Immer:** Checkpoint zeigen, Problem benennen, Rücksprung vorschlagen — User entscheidet

---

## Referenz: Build-Phase-Regeln

> Die folgenden Regeln sind in den Rule-Files definiert (Single Source of Truth) und gelten während Phase 3:

| Regel | Quelle | Kurzfassung |
|-------|--------|-------------|
| **Build-Verify** | `.claude/rules/general.md` § Build-Verify | Nach jeder neuen Datei: `typecheck` + `lint`. Fehler sofort fixen. |
| **Test-Coverage** | `.claude/rules/testing.md` § Test-Coverage | Jede Logik-Datei braucht Tests. Phase 4 ergänzt E2E, schreibt keine Basis-Tests nach. |
| **Tech Notes** | `docs/tech-notes.md` | Library-Gotchas — jeder Skill liest bei Aktivierung. Einträge bei > 1 Roundtrip Kosten. |
| **Commit-Cadence** | `.claude/rules/general.md` § Commit-Cadence | 1 logische Änderung = 1 Commit. Max ~10 Dateien pro Commit. |

---

## Wie du eine Session startest

### Neues Greenfield-Projekt
```
Ich möchte ein neues Projekt starten: [Beschreibung in 2-5 Sätzen].
Bitte aktiviere den Project Lead und führe mich durch den Kickoff.
```

### Feature hinzufügen (bestehendes Projekt)
```
[Lade CLAUDE.md + relevanten Code]
Erweitere das Projekt um: [Feature-Beschreibung].
```

### Bug fixen
```
[Lade relevanten Code + Fehlermeldung/Screenshot]
Fix diesen Bug: [Beschreibung]. Fehlermeldung: [Error].
```

### Weiterarbeiten (Session fortsetzen)
```
[Lade CLAUDE.md]
Arbeite am Backlog weiter — nimm die nächste Story aus "Ready".
→ gh issue list --label "status:ready" --milestone "Sprint 1" --limit 1
```

### Context-Compaction Safeguard (HARD RULE bei jedem Session-Start)

Beim Start jeder neuen Session oder nach Context-Compaction:
```bash
git status                  # Alles committed?
git diff                    # Unstaged Changes?
git diff --cached           # Staged Changes?
```

**Kein neuer Code wird geschrieben bevor Working Tree clean ist.**
Uncommitted Changes → sofort committen oder bewusst verwerfen (nach Review).

**Belegt:** Zombie-Killer: Audio-Entries nach Context-Compaction unstaged — `audio.play()` scheiterte silent.

---
