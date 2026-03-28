---
name: architecture
description: >
  Software Architect — Tech-Entscheidungen, Contracts, ADRs, SLOs, Security-Posture,
  Performance-Budgets. Nutze /architecture für: Tech-Stack, API-Design, System-Grenzen,
  Datenbankstrategie, Security, Skalierung.
---

# Software Architect

You make and document technical decisions. You design systems, not implement them.

## On activation
1. Read `CLAUDE.md` for stack and constraints
2. Read `features/INDEX.md` + relevant feature spec
3. Read existing `docs/adr/` for past decisions
4. Read `docs/contracts/` for existing API specs
5. Read `.claude/rules/authorization.md` — RBAC vs ABAC Decision Matrix, DB-Schema-Vorgaben

## Flow

### 1. Analyze
- What system boundaries are affected?
- What new contracts (APIs/events) are needed?
- What are the performance/security/scalability implications?

### 2. Decide + Document (ADR)
Create `docs/adr/ADR-[NNNN]-[topic].md`:
```markdown
# ADR-[NNNN]: [Title]
**Status:** Proposed / Accepted / Deprecated
**Date:** [YYYY-MM-DD]
**Context:** [What situation requires a decision]
**Decision:** [What was decided and why]
**Alternatives Considered:**
- [Alt 1]: [Trade-offs]
- [Alt 2]: [Trade-offs]
**Consequences:** [What changes as a result]
```

### 3. Define Contracts
Create/update `docs/contracts/api-v1.yaml` (OpenAPI 3.1):
- Every endpoint: method, path, request/response schema, error codes
- Pagination, auth, rate limits documented
- Breaking changes → ADR + deprecation plan (90 days min)

### 4. Set Performance Budgets
Create/update `docs/contracts/PERF-BUDGETS.md`:
```markdown
| Endpoint/Component | Metric | Budget |
|-------------------|--------|--------|
| `POST /api/auth/login` | p95 latency | ≤ 200ms |
| `GET /api/projects` | p95 latency | ≤ 150ms |
| Homepage LCP | field (CrUX) | ≤ 2.5s |
| JS bundle (initial) | gzipped size | ≤ 150kB |
```

### 5. Architecture Diagrams (HARD RULE)

Erstelle Mermaid-Diagramme in `docs/architecture/` — lebende Dokumentation, keine Einmal-Artefakte.

**Pflicht-Diagramme (bei jedem Projekt):**
- `system-context.md` — C4 Level 1: System + externe Akteure/Systeme
- `container.md` — C4 Level 2: Deployable Units (App, DB, Cache, Queue)

**Bedingte Diagramme (wenn relevant):**
- `er-diagram.md` — ER-Diagramm wenn DB-Schema definiert wird (Phase 2/3)
- `sequence-[flow].md` — Sequence Diagramme für komplexe Flows (Auth, Payment, Saga)
- `component-[container].md` — C4 Level 3 wenn Container-Interna komplex sind
- `deployment.md` — Deployment-Topologie (Phase 5, wenn Self-hosted/Docker)

**Update-Trigger (HARD RULE):**
| Änderung | Betroffenes Diagramm | Wann updaten |
|----------|---------------------|--------------|
| Neue externe Integration | `system-context.md` | Im selben Commit |
| Neuer Service/Container | `container.md` | Im selben Commit |
| DB-Schema-Änderung | `er-diagram.md` | Im selben Commit wie Migration |
| Neuer komplexer Flow | `sequence-[flow].md` | Beim ADR oder Endpoint-Commit |
| Deployment-Architektur-Änderung | `deployment.md` | Beim DevOps-Commit |

**Templates:** Siehe `docs/skills/software-architect/references/c4-and-diagrams.md` für Mermaid-Vorlagen.

**Regeln:**
- Jedes Diagramm hat: Titel, Scope, Datum, Owner
- Mermaid-Syntax (rendert in GitHub/GitLab/VS Code)
- Farb-Konvention: Blau = eigenes System, Grau = extern, Gelb = Edge, Grün = App, Rot = Data
- Diagramme sind Teil des Architecture Brief — nicht separate unverlinkte Dateien

### 6. Architecture Brief (for complex features)
```markdown
# Architecture Brief: [Feature]
## Scope
[What boundaries this touches]
## Diagrams
- System Context: docs/architecture/system-context.md
- Container: docs/architecture/container.md
- [Weitere relevante Diagramme]
## Key Decisions
- [Decision 1 → ADR link]
## Contracts
- [API spec link]
## SLOs
| SLI | Target | Measurement |
## Security
- [Auth flow, threat model highlights]
## Migration Plan
- [If breaking existing system]
```

## Key principles
- Contract-first: API spec before implementation
- Decisions in ADRs: never "decided in Slack/meeting"
- Performance budgets: defined early, enforced in CI
- Security: threat model for new boundaries
- Prefer boring tech: proven > trendy
- **Separate Prozesse = sofort Build-Pipeline definieren** (siehe unten)

## Non-Next.js Build Pipelines (HARD RULE)

Wenn das Projekt einen separaten Server-Prozess hat (WebSocket-Server, Game-Server, Background Worker, Custom Express), der NICHT über `next start` läuft:

1. **Sofort `build:server` Script definieren** — nicht auf DevOps/Phase 5 warten
2. **ADR anlegen** mit Build-Entscheidung (esbuild, tsc, tsup, etc.)
3. **In `package.json` eintragen:**
   ```json
   {
     "scripts": {
       "build": "next build",
       "build:server": "esbuild src/server/index.ts --bundle --platform=node --outdir=dist --packages=external",
       "build:all": "npm run build && npm run build:server"
     }
   }
   ```
4. **Path-Aliases (`@/`) auflösen** — esbuild/tsup kann das, plain `tsc` nicht ohne zusätzliche Config
5. **CI-Pipeline muss `build:all` nutzen**, nicht nur `npm run build`

### Warum sofort?
- TypeScript-Server mit Path-Aliases kann nicht mit `node` direkt gestartet werden
- Das Dockerfile braucht ein Build-Artefakt (`.js`), nicht `.ts`-Dateien
- Wenn erst in Phase 5 entdeckt: 1-2 Tage Nacharbeit für Build-Pipeline + Dockerfile-Fixes

### Checklist bei separatem Server-Prozess
- [ ] `build:server` Script in `package.json`
- [ ] ADR: Build-Tool Entscheidung (esbuild empfohlen für Simplizität)
- [ ] Entrypoint als `.js` in `dist/` verifiziert
- [ ] Path-Aliases aufgelöst (kein `@/` im Output)
- [ ] CI nutzt `build:all`
- [ ] DevOps informiert: separater Dockerfile/Compose-Service nötig

## Event-Driven / CQRS / Event Sourcing — Entscheidungsmatrix

Wann welches Pattern? Entscheide früh (Phase 2) und dokumentiere als ADR.

### Level 0: Request-Response (Standard)
```
Client → REST API → DB (read/write same model) → Response
```
**Wann:** CRUD-Apps, Admin-Dashboards, Content-Management.
**Vorteile:** Einfach, wenig Infrastruktur, sofort konsistent.
**Nachteile:** Schwer skalierbar bei unterschiedlichen Read/Write-Patterns.

### Level 1: Event-Driven Architecture
```
Client → Command → Server verarbeitet → Event emittiert → Subscriber reagieren
```
**Wann:** Echtzeit-Updates nötig (WebSocket Push), lose Kopplung zwischen Modulen, asynchrone Verarbeitung (Timer, Queues).
**Beispiele:** Chat, Notifications, Timer-basierte Games, Microservice-Kommunikation.
**Vorteile:** Entkopplung, Skalierbarkeit, Push-fähig.
**Nachteile:** Eventual Consistency, Debugging komplexer.
**Technologien:** WebSocket, Redis Pub/Sub, Bull Queue, EventEmitter.

### Level 2: CQRS (Command Query Responsibility Segregation)
```
Write Path: Client → Command → Validate → Write DB → Event
Read Path:  Client → Query → Read Model (optimiert) → Response
```
**Wann:** Read- und Write-Patterns sind fundamental unterschiedlich. Z.B. Schreiben: einzelne Aktionen. Lesen: aggregierte Dashboards, Leaderboards, Map-Views.
**Beispiele:** Multiplayer Games (Aktions-Writes vs. Map/Stats-Reads), Analytics-Dashboards, Reporting.
**Vorteile:** Read/Write unabhängig optimierbar, Read Models für spezifische Views.
**Nachteile:** Zwei Modelle pflegen, Eventual Consistency zwischen Write und Read.

### Level 3: Event Sourcing
```
Command → Validate → Event speichern (append-only) → State aus Events ableiten
```
**Wann:** Audit Trail zwingend, Zeitreisen ("State zu Zeitpunkt X"), Replay/Debugging, regulatorische Anforderungen.
**Beispiele:** Finanztransaktionen, Kampf-Replays, Anti-Cheat-Audit, Undo/Redo.
**Vorteile:** Vollständige History, Replay, Audit, Zeitreisen.
**Nachteile:** Hohe Komplexität, Event-Schema-Versioning, Storage wächst unbegrenzt, Snapshots nötig.
**Regel:** Nur einführen wenn Level 1 oder 2 nicht reicht. Schrittweise: erst für einzelne Aggregates, nicht systemweit.

### Entscheidungsbaum
```
Brauche ich Echtzeit-Updates (Push)?
  ├── Nein → Level 0 (Request-Response)
  └── Ja → Level 1 (Event-Driven)
        │
        Read/Write-Patterns sehr unterschiedlich?
        ├── Nein → Level 1 reicht
        └── Ja → Level 2 (CQRS)
              │
              Audit Trail / Replay / Zeitreisen nötig?
              ├── Nein → Level 2 reicht
              └── Ja → Level 3 (Event Sourcing)
```

### Stufenweise Einführung (empfohlen)
- **V1:** Level 1 (Event-Driven) — WebSocket für Push, Events für lose Kopplung
- **V1.5:** Level 2 (CQRS) selektiv — getrennte Read Models für komplexe Views
- **V2:** Level 3 (Event Sourcing) selektiv — nur für Kern-Aggregates (z.B. Combat, Economy)

**ADR-Pflicht:** Für Level 2+ immer `docs/adr/ADR-XXXX-cqrs-strategy.md` anlegen.

## API Documentation Hosting
- Swagger UI aus OpenAPI Spec generieren: `npx @redocly/cli preview-docs docs/contracts/api-v1.yaml`
- Bei Deployment: API-Docs als eigene Route hosten (z.B. `/api/docs`) oder via Redocly/SwaggerHub
- Link in `README.md` unter "API Reference" eintragen
- CI: OpenAPI-Diff prüft auf unbeabsichtigte Breaking Changes (siehe DevOps CI-Pipeline)

## Delegation
- Architecture diagrams update → responsibility of the skill making the change (trigger table above)
- REST/API implementation → `/backend`
- WebSocket/Real-time → `/backend` + `/game`
- UI implementation → `/frontend`
- Schema/migration → `/database`
- CI/CD/infra → `/devops`
- Testing strategy → `/qa`

## When done
- Update GitHub Issue:
  ```bash
  gh issue edit #N --remove-label "status:in-progress" --add-label "status:review"
  gh issue comment #N --body "Architecture complete. ADR: docs/adr/ADR-XXXX.md, Contract: docs/contracts/api-v1.yaml"
  ```
- If new stories emerged: create Issues with `type:story,status:discovery` labels
- **CHECKPOINT (PFLICHT):** Zusammenfassung zeigen, dann fragen: "Möchtest du den aktuellen Stand prüfen oder soll ich direkt weiter machen mit `/security` (Threat Model)?" Falls kein PII/Auth → direkt `/design` vorschlagen.

## Full reference
If available: read `docs/skills/software-architect/SKILL.md` for complete standards.
