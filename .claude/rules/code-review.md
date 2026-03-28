# Code Review Rules

## Merge-Regeln (HARD RULES)
- **Kein Self-Merge** — der Autor merged nicht seinen eigenen PR
- **Min. 1 Approval** vor Merge (bei Solo-Projekten: min. CI grün + eigene Review-Checklist)
- **CI muss grün sein** — kein Merge bei roten Checks
- **Keine Force-Pushes** auf `main`/`master`
- **Squash-Merge** bevorzugt (1 Commit pro PR auf main)

## PR-Größe
- **Ziel:** ≤ 400 Zeilen geändert (ohne generierte Dateien)
- **> 400 Zeilen:** Split in kleinere PRs oder explizite Begründung im PR-Body
- **Ausnahme:** Initiale Scaffolding-PRs, Migrations, Dependency-Locks

## Review-Checklist (pro Skill-Typ)

### Backend-PR
- [ ] API-Contract eingehalten (Request/Response matcht OpenAPI Spec)
- [ ] Input-Validation vorhanden (Zod Schema, keine `any`)
- [ ] Auth-Check auf jedem geschützten Endpoint
- [ ] Fehlerbehandlung: strukturierte Responses, keine Stack-Traces
- [ ] SQL: parametrisierte Queries, keine String-Concatenation
- [ ] Tests: Unit + Integration, keine gemockten DB-Calls bei Integration
- [ ] Keine Secrets im Code

### Frontend-PR
- [ ] Responsive getestet (320px, 768px, 1024px, 1440px)
- [ ] Edge States: Loading, Error, Empty behandelt
- [ ] Component State Matrix: alle States definiert (Default/Hover/Active/Focus/Disabled/Loading/Error/Empty) — siehe `design.md`
- [ ] Micro-Interactions: Loading-Delay ≥ 150ms, Transitions smooth (Entry ≤300ms, Exit ≤200ms, Hover ≤150ms)
- [ ] Accessibility: semantisches HTML, Keyboard-Navigation, ARIA wo nötig
- [ ] Performance: keine unnötigen Re-Renders, dynamic imports für schwere Components
- [ ] Design-Tokens statt hardcoded Values
- [ ] Visual Polish: Taste Rubric ≥ 6/8 Kriterien (Playwright MCP Screenshots als Evidenz)
- [ ] Dark Mode: alle States in beiden Themes getestet (wenn Dark Mode aktiv)
- [ ] Tests: Unit + E2E, `data-testid` gesetzt
- [ ] Keine `console.log` im Production-Code

### Authorization-PR (wenn Endpoints, Rollen oder Permissions betroffen)
- [ ] `requirePermission()` Middleware auf jedem geschützten Endpoint (kein hardcoded `if role ===`)
- [ ] Permission-Naming folgt `resource:action:scope` Convention
- [ ] Row-Level Filtering via `scopedWhere()` — kein `findMany()` ohne Scope-Filter
- [ ] Neue Permission → DB-Migration + Seed-Script im selben Commit
- [ ] Authorization-Tests: no-auth → 401, wrong-permission → 403, correct → 200
- [ ] Row-Level Test: User sieht nur Daten die der Scope erlaubt
- [ ] Kein Frontend-only Permission-Check — Backend MUSS ebenfalls prüfen

### SEO-PR (wenn öffentliche Seiten oder Meta-Tags betroffen)
- [ ] `<title>` einzigartig, 50-60 Zeichen, Keyword vorn
- [ ] `<meta description>` einzigartig, 120-155 Zeichen, mit Benefit/CTA
- [ ] Open Graph Tags vollständig (`og:title`, `og:description`, `og:image`, `og:url`)
- [ ] Canonical URL gesetzt (keine Duplicate-Content-Gefahr)
- [ ] Structured Data (JSON-LD) valide (Google Rich Results Test)
- [ ] Heading-Hierarchie korrekt (eine `h1`, keine Ebenen übersprungen)
- [ ] Kein Client-Side-Only Rendering für SEO-relevante Inhalte
- [ ] `sitemap.xml` und `robots.txt` aktuell

### Architecture-PR (wenn Systemgrenzen, Integrationen oder DB-Schema betroffen)
- [ ] ADR vorhanden für signifikante Entscheidungen
- [ ] Architecture Diagrams aktualisiert (`docs/architecture/`):
  - [ ] Neue externe Integration → System Context Diagram updated
  - [ ] Neuer Service/Container → Container Diagram updated
  - [ ] DB-Schema-Änderung → ER-Diagram updated
  - [ ] Neuer komplexer Flow → Sequence Diagram erstellt/updated
- [ ] API-Contract aktualisiert (OpenAPI/AsyncAPI)
- [ ] Performance-Budgets berücksichtigt
- [ ] Diagramme haben Titel, Scope, Datum

### Allgemein (jeder PR)
- [ ] TypeScript strict, kein `any`, kein `as`
- [ ] Conventional Commit Messages
- [ ] Issue-Referenz vorhanden (`Closes #N` oder `Refs #N`)
- [ ] Keine auskommentierten Code-Blöcke
- [ ] Keine neuen Dependencies ohne Begründung
- [ ] Tests geschrieben UND ausgeführt

### Documentation-PR (wenn Dokumentation erstellt oder geändert wird)
- [ ] Diataxis-Typ korrekt (Tutorial / How-to / Reference / Explanation — nie gemischt)
- [ ] Code-Beispiele vollständig und lauffähig (copy-paste runnable)
- [ ] Keine `foo`, `bar`, `test123` — realistische Variablennamen
- [ ] Alle internen Links aufgelöst (keine broken links)
- [ ] API-Doku vollständig (Summary, Parameters, Examples, Error Codes pro Endpoint)
- [ ] Freshness-Trigger definiert (was triggert ein Update dieses Dokuments?)
- [ ] Prose-Style: 2nd person, active voice, present tense (oder Voice Profile wenn Content aktiv)
- [ ] Kein duplizierter Content — Links zu Single Source of Truth
- [ ] README aktualisiert wenn Feature user-sichtbar ist
- [ ] Documentation Index (`docs/documentation/INDEX.md`) aktualisiert

### Performance-PR (wenn Performance-kritischer Code oder Caching betroffen)
- [ ] Performance Budget eingehalten (p95/p99 within budget, bundle size within limit)
- [ ] Baseline-Vergleich: Before/After Messung vorhanden
- [ ] Keine neuen N+1 Queries (OTel Traces oder Code-Review)
- [ ] Neue DB-Queries: EXPLAIN ANALYZE geprüft, kein Seq Scan auf großen Tabellen
- [ ] Caching: TTL, maxSize, Invalidation-Strategie, Stampede-Schutz definiert
- [ ] Keine unbounded data structures (Map/Array/Cache ohne Limit)
- [ ] Hot-Path-Algorithmen: max O(n log n), keine O(n²) ohne Begründung
- [ ] Streaming statt Buffering für Daten > 1 MB
- [ ] PDR vorhanden bei signifikanten Performance-Entscheidungen
- [ ] Load-Test-Script aktualisiert wenn neuer Endpoint

### Accessibility-PR (wenn UI-Komponenten oder Interaktion betroffen)
- [ ] WCAG 2.2 AA Kontrast eingehalten (4.5:1 Text, 3:1 UI)
- [ ] Keyboard-Navigation: alle interaktiven Elemente erreichbar (Tab, Enter, Escape)
- [ ] Focus-Indicator sichtbar (≥ 2px, Kontrast ≥ 3:1)
- [ ] Semantic HTML statt ARIA-Overengineering (`<button>` statt `<div role="button">`)
- [ ] ARIA-Attribute korrekt (roles, states, properties)
- [ ] Alt-Text auf allen informativen Images
- [ ] Form-Labels vorhanden (kein Placeholder als Label-Ersatz)
- [ ] Error-Messages mit `aria-describedby` verknüpft
- [ ] `prefers-reduced-motion` respektiert
- [ ] Touch Targets ≥ 44x44px auf Mobile
- [ ] axe-core Test vorhanden (oder Lighthouse A11y ≥ 90)

### Content-PR (wenn Content-Artifacts oder user-facing Copy betroffen)
- [ ] Voice consistency: Copy matcht `docs/content/voice-and-tone.md` Profil
- [ ] Terminology: Alle Terme aus `docs/content/terminology.md`, keine Ad-hoc-Synonyme
- [ ] Error Messages: Description + Reason + Resolution Format
- [ ] Empty States: Guidance Text vorhanden (nicht nur leer oder "Keine Daten")
- [ ] Button Labels: Verb-first, specific outcome, sentence case
- [ ] Notifications: Korrekter Typ (Confirmation/Update/Status/Reminder)
- [ ] i18n Keys: Folgen Taxonomy aus `docs/content/terminology.md`
- [ ] Keine hardcoded user-facing Strings (alle in Translation-Files)
- [ ] Accessibility: Aussagekräftiger Alt-Text, beschreibende ARIA Labels
- [ ] CDR vorhanden bei Terminologie- oder Voice-Änderungen

## Review-Feedback Konventionen
- **`nit:`** — Kleinigkeit, kein Blocker (Naming, Formatting)
- **`suggestion:`** — Verbesserungsvorschlag, optional
- **`question:`** — Verständnisfrage, muss beantwortet werden
- **`blocker:`** — Muss gefixt werden vor Merge
- **`praise:`** — Positives Feedback (nicht vergessen!)

## Review-Turnaround
- **Ziel:** Review innerhalb 4h (während Arbeitszeit)
- **Max:** 24h — danach eskalieren
- **Rückfragen:** Inline-Comments statt separater Nachricht
- **Re-Review:** Nach Fixes innerhalb 2h

## Automatisierte Checks (CI als erster Reviewer)
Bevor ein Mensch reviewt, muss CI diese Gates bestehen:
```yaml
# Minimum CI Gates vor Review
- lint: clean
- typecheck: no errors
- tests: all pass
- build: succeeds
- bundle-size: within budget
- security: npm audit clean
```

## Anti-Patterns (vermeiden)
- **Rubber-Stamping:** Approval ohne den Code gelesen zu haben
- **Gatekeeping:** Review als Machtinstrument statt Qualitätssicherung
- **Bikeshedding:** Stundenlange Diskussion über Naming statt echte Probleme
- **Approval mit offenen Threads:** Alle Blocker müssen resolved sein
