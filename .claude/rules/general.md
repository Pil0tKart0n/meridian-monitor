# General Rules

## Git Workflow
- Conventional Commits: `feat(scope):`, `fix(scope):`, `docs:`, `test:`, `refactor:`, `perf:`, `chore:`
- Branch naming: `feat/short-description`, `fix/bug-description`
- Commit messages: imperative mood, max 72 chars, body for "why"
- Use `Closes #N` in commit body to auto-close GitHub Issues
- Never commit secrets, .env files, node_modules, or build artifacts

## Code Quality
- TypeScript strict mode — no `any`, no `as` casts (prefer type guards)
- No `console.log` in production code — use structured logging
- No commented-out code — delete it (Git has history)
- No magic numbers — use named constants
- Functions: single responsibility, max 30 lines preferred, always typed return
- Error handling: never swallow errors silently, always handle or propagate

## Type-Reuse (HARD RULE)
- **Existierende Types/Interfaces importieren, nie als Inline-Literal duplizieren**
- Vor dem Erstellen eines neuen Types: prüfen ob bereits einer existiert (`grep -r "type TypeName"`)
- String-Literal-Unions die an mehreren Stellen vorkommen → als Type exportieren
- Beispiel: `type MapTheme = "classic" | "tennis"` einmal definieren und überall importieren

## Replacement Discipline (HARD RULE)
- Wenn ein Modul, eine Funktion oder ein Ansatz durch einen neuen ersetzt wird:
  - Alte Implementierung im **SELBEN Commit** löschen
  - Alte Tests im **SELBEN Commit** löschen oder updaten
  - Alte Exports entfernen
- "Ich lösche das später" → **nein, jetzt**. Git hat History falls man es zurückbraucht.
- Gilt auch für Scaffolding-Code der durch eine Library ersetzt wird (z.B. eigener GameLoop → PixiJS Ticker)

## Shared-First (HARD RULE)
- **Bevor du eine Utility-Funktion schreibst** (escapeHtml, formatDate, debounce, clamp, etc.):
  1. Suche ob sie bereits im Projekt existiert (`grep -rn "functionName" src/`)
  2. Wenn ja → importieren, nicht kopieren
  3. Wenn nein → in `shared/utils/` oder dem nächsten gemeinsamen Elternverzeichnis anlegen
- **Niemals** die gleiche Funktion in >1 Datei implementieren
- Erweitert Type-Reuse: gilt für Types UND Funktionen

## Export-Hygiene
- Exportiere nur was mindestens 1 externer Consumer importiert
- Kein spekulatives `export` ("könnte jemand brauchen")
- Barrel-Files (`index.ts`) re-exportieren nur was aktuell genutzt wird
- Interne Interfaces/Types die nur innerhalb der eigenen Datei genutzt werden → NICHT exportieren
- Bei Scaffolding: lieber nachträglich exportieren als vorsorglich

## File Size (EMPFEHLUNG)
- Dateien > 300 Zeilen: beim nächsten logischen Anlass splitten
- Nicht proaktiv refactoren, aber bei der nächsten Änderung an der Datei berücksichtigen
- God-Files (>500 Zeilen) sind ein Zeichen für fehlende Modularisierung

## File Organization
- One component/module per file
- Co-locate tests: `MyComponent.test.tsx` next to `MyComponent.tsx`
- Index files only for barrel exports, never for logic
- Naming: `kebab-case` for files, `PascalCase` for components/types, `camelCase` for functions/variables

## Documentation
- **README.md** muss den aktuellen Projektstand widerspiegeln — nach Kickoff, neuen Features oder Tech-Stack-Änderungen aktualisieren
- `CLAUDE.md` ist die interne Projekt-Referenz (für Claude Code), `README.md` ist die externe (für Menschen/GitHub)
- Bei jedem Phase-Wechsel (Planning → Building → Testing → Live) README prüfen und aktualisieren
- **README-Audience:** README ist für Menschen/GitHub, nicht für Claude. Sektionen:
  1. Was ist das? (User/Player-Perspektive)
  2. Quickstart / How to use
  3. Deployment (wenn relevant)
  4. Development Setup
  5. Tech Stack (kompakt)
- Technische Interna (Phase Log, ADR-Übersicht, Sprint-Tracking) → `CLAUDE.md`, nicht README

## README-Update-Trigger (HARD RULE)
README MUSS aktualisiert werden wenn:
- **Neues user-facing Feature fertig** → Feature in README beschreiben (Benefits-Sprache: "Du kannst jetzt...")
- **Tech-Stack Änderung** → Tech-Stack-Tabelle aktualisieren
- **Deployment-Änderung** → Deployment-Sektion aktualisieren
- **Sprint-Abschluss** → README-Stand mit Ist-Zustand abgleichen
- **Phase-Wechsel** → README Quickstart testen: funktioniert er noch?

**NICHT:** Am Projekt-Ende alles nachziehen — dann ist es zu spät und zu viel.
```bash
# Letztes README-Update prüfen
git log --oneline -- README.md | head -3
# Wenn letzter Commit > 1 Sprint alt → README aktualisieren
```

## Tracking (GitHub Issues)
- All tracking via GitHub Issues with labels + milestones
- Start story: `gh issue edit #N --remove-label "status:ready" --add-label "status:in-progress"`
- **`status:in-progress` erst setzen wenn TATSÄCHLICH an der Story gearbeitet wird** — nicht bei Sprint-Planning alle batch-mäßig setzen
- Complete story: `git commit -m "feat(scope): description\n\nCloses #N"`
- Update `features/INDEX.md` when creating new feature specs
- Create ADR in `docs/adr/` for architectural decisions

## CHANGELOG (HARD RULE)
- **User-facing Änderungen → CHANGELOG-Eintrag im SELBEN Commit wie das Feature**
- Kein `feat:`-Commit ohne CHANGELOG-Eintrag — das ist kein Optional
- Interne Refactorings, Tests, CI-Änderungen → kein CHANGELOG-Eintrag nötig
- Format: [Keep a Changelog](https://keepachangelog.com/) (Added/Changed/Fixed/Removed)
- Unter `[Unreleased]` sammeln, bei Sprint-Abschluss in Version umwandeln
- **Nie den CHANGELOG erst am Sprint-Ende nachziehen** — dann fehlen 80% der Einträge
- Self-Review-Checklist: vor jedem `feat:`-Commit → "Ist CHANGELOG aktualisiert?" ✅

## Build-Verify (HARD RULE)
- After **every newly created file** → run `npm run typecheck && npm run lint`
- Fix errors immediately before writing more files
- After each logical block (endpoint done, component done) → verify + commit
- **Warum per-file statt per-batch:** Bei Context-Compaction gehen Lint-Fehler aus früheren Dateien verloren. Per-file-Lint verhindert das.

## Commit-Cadence (HARD RULE)
- **1 logische Änderung = 1 Commit.** Nie 3+ Features in einem Commit bündeln.
- "Logische Änderung" = ein Endpoint, ein Component, ein Schema, ein Test-Block
- Bei Unsicherheit: lieber zu klein als zu groß committen
- `git diff --stat` vor jedem Commit prüfen — mehr als ~10 Dateien = zu viel
- Jeder Commit MUSS `Closes #N` oder `Refs #N` enthalten (Issue-Referenz)
- Kein Commit ohne Issue? → Erst Issue erstellen, dann committen
- **Nie `git commit --amend` nach `git push`** — immer neuen Commit erstellen (verhindert non-fast-forward rejections)

## Testing (HARD RULES → Details in `testing.md`)
- **Test-Timing:** Tests im SELBEN Commit wie das Feature — nie als separater Batch
- **Test-Execution:** Tests MÜSSEN ausgeführt werden — `npm run test` nach jedem Test-File
- **Test-Coverage:** Jede Datei mit Logik braucht mindestens einen Test
- **E2E-Pflicht:** Neue User-Flows brauchen E2E-Tests, nicht nur Unit-Tests
- **Bug-Fixes:** Regression-Test ZUERST schreiben (Red-Green), dann Fix implementieren
- **Rote Tests = Blocker.** Nie committen mit failing Tests.

→ Vollständige Regeln: `.claude/rules/testing.md` (Test-Typen, CI-Debug, Anti-Patterns, Skill-spezifisch)

## UX-Änderungen: Beschreiben vor Bauen
Bei UI/UX-Features die Interaktion **kurz beschreiben bevor Code geschrieben wird**:
- "Ich mache die Namen klickbar" vs. "Ich baue ein Suchfeld" sind komplett verschiedene Implementierungen
- Bei Mehrdeutigkeit → User fragen, nicht annehmen
- Gilt für alle Skills die UI anfassen (Frontend, Design, Game)

## Sprint-Close-Protokoll (HARD RULE)
Nach dem letzten Story-Commit eines Sprints — **unmittelbar, nicht "später":**

1. **Tests grün:** `npm run test -- --run` → 0 Failures
2. **CHANGELOG versionieren:** `[Unreleased]` → `[X.Y.Z] — YYYY-MM-DD`
3. **CLAUDE.md aktualisieren:** Current Sprint → "Sprint N — DONE", Phase Log ergänzen
4. **README abgleichen:** Neue Features beschrieben? Quickstart noch korrekt?
5. **Playwright MCP Visual Checks** (wenn UI-Projekt):
   - `browser_navigate` → Landing/Main Pages
   - `browser_resize` auf 320px, 768px, 1440px prüfen
   - `browser_snapshot` für Accessibility-Tree-Check
6. **Epic-Issues schließen:** Wenn alle Stories eines Epics done/deferred → Epic schließen
7. **Sprint-Close-Commit:** `git commit -m "chore(sprint): close Sprint N"`
8. **`/retro` aktivieren** — PFLICHT, kein Sprint ohne Retro

**Belegt:** Pong vergaß 6 Doku-Updates + CHANGELOG-Versionierung über mehrere Sprints.
Zombie-Killer: 3 von 12 Sprints ohne Retro — Action Items gingen verloren.

## Playwright MCP Visual Check (HARD RULE für UI-Stories)
Nach jeder Story die UI-Komponenten, Responsive Design oder visuelle Änderungen betrifft:

1. `browser_navigate` → betroffene Seite/Komponente
2. `browser_resize` auf 320px (Mobile), 768px (Tablet), 1440px (Desktop)
3. `browser_take_screenshot` → Evidenz in `/tmp/` oder als Referenz
4. `browser_snapshot` → Accessibility-Tree prüfen (fehlende Labels, kaputte ARIA)
5. Touch-Targets < 44px? Horizontales Scrollen? → Bug-Issue erstellen

**Erst DANN:** `git commit`. Kein "Ich mache die Visual Checks am Sprint-Ende."

### Manuell vs. CI — wann was?

| Situation | Methode | Warum |
|-----------|---------|-------|
| **Neue UI-Story** (Phase 3) | **Manuell** via Playwright MCP | Neue Layouts müssen visuell bewertet werden, nicht nur automatisch geprüft |
| **Regression nach Refactoring** | **CI** via Playwright E2E Tests | Bekannte Layouts automatisch gegen Screenshots vergleichen |
| **Sprint-Close** | **Manuell** via Playwright MCP | Gesamteindruck auf Main Pages, nicht nur Einzelstories |
| **Phase 4 QA Audit** | **Beides** | CI-Tests + manueller Visual Audit auf allen Viewports |

**Ziel:** Neue Stories = manuell (braucht menschliches Urteil). Bestehende Layouts = automatisiert in CI (Regression).
Wenn CI-basierte Visual Regression Tests existieren (z.B. Playwright `toHaveScreenshot()`), ersetzt das die manuelle Prüfung für **bereits geprüfte** Seiten — nicht für neue.

**Belegt:** Pong entdeckte Layout-Overflow bei 320px und 28px Touch-Targets erst nach Sprint-Ende.
ElektroVorteil fand PWA-Icon-404s nur durch Playwright MCP Check.

## Retro Action-Item Tracking (HARD RULE)
- **JEDER** Action Item aus einer Retro MUSS als GitHub Issue angelegt werden
- P1 → Issue mit `priority:P1`, sofort im nächsten Sprint
- P2 → Issue mit `priority:P2`, spätestens im übernächsten Sprint
- P3 → Issue mit `priority:P3`, aber MUSS existieren (kein Markdown-only)
- Offene Items aus der letzten Retro → Review in der nächsten Sprint-Planung

**Belegt:** Zombie-Killer Meta-Retro: ~20% der Action Items verschwanden in Markdown ohne Issue.

## Context-Compaction Safeguard (HARD RULE)
Bei **jedem Session-Start** (neue Session oder nach Context-Compaction):

1. `git status` — alle Dateien committed?
2. `git diff` → unstaged Changes? → sofort committen oder bewusst verwerfen
3. `git diff --cached` → staged Changes? → sofort committen

**Kein neuer Code wird geschrieben bevor Working Tree clean ist.**

**Belegt:** Zombie-Killer: Audio-Entries nach Context-Compaction unstaged — `audio.play()` scheiterte silent zur Laufzeit.

## E2E-Coverage für neue User-Flows (HARD RULE)
Neue User-facing Flows MÜSSEN E2E-Tests haben (nicht nur Unit-Tests):
- **Beispiel:** Quick Match Flow: Login → Lobby → Quick Match Button → Mode Select → Searching → Cancel → Back to Lobby
- Unit-Tests prüfen "API funktioniert", E2E-Tests prüfen "User Experience funktioniert"
- QA-Checkpoint vor Phase 4: "Welche neuen Flows wurden gebaut? Haben sie E2E-Tests?"

**Belegt:** Pong: Quick Match + Game Juice Features hatten Unit-Tests aber keine E2E-Tests — Bugs in der User-Journey blieben unentdeckt.

## Meta-Retro (EMPFOHLEN alle 3–4 Sprints)
Retrospektive des Retro-Prozesses selbst:
1. Folgen alle Retros dem Template-Standard?
2. Wurden Action Items tatsächlich als GitHub Issues erfasst?
3. Timing: Retro am Sprint-Ende oder verzögert?
4. Playwright-Evidence: Vor oder während Retro gesammelt?
5. Test-Coverage-Analyse: Unit vs. Integration vs. E2E — Lücken?

Output: `docs/retro/META-RETRO-YYYY-MM-DD.md`

**Belegt:** Zombie-Killer: Meta-Retro über 17 Retros fand systematische Gaps in Action-Item-Tracking und Template-Konsistenz.

## Dependency-Management (HARD RULE)
Bevor `npm install [package]` ausgeführt wird — gilt für JEDEN Skill, nicht nur DevOps:
- [ ] **Notwendigkeit:** Gibt es das Feature nicht schon im Stack? (`fetch` statt `axios`, `Date` statt `moment`)
- [ ] **Bundle Size:** Passt in Performance-Budget? (`npx bundlephobia [package]`)
- [ ] **Lizenz:** MIT/Apache/ISC OK. GPL/AGPL → ADR-Entscheidung
- [ ] **Wartung:** Letzter Commit < 6 Monate, aktive Maintainer
- [ ] **TypeScript:** Hat `@types/[package]` oder built-in Support?

→ Vollständige Dependency-Regeln (Updates, Security-Audit, Freeze): `/devops` Skill § Dependency Management

## Solo-Modus (wenn 1 Person = Entwickler + Reviewer)
Folgende Regeln aus `code-review.md` werden für Solo-Projekte angepasst:
- **Kein Self-Merge** → entfällt (es gibt nur einen Contributor)
- **Min. 1 Approval** → ersetzt durch: **Self-Review-Checklist** (Post-Feature Self-Review in WORKFLOW.md) + CI grün
- **PR-Pflicht** → optional. Direkter Push auf `main` erlaubt wenn CI grün und Self-Review bestanden
- **Review-Turnaround** → entfällt

**Was NICHT entfällt:**
- CI muss grün sein — immer
- Conventional Commits — immer
- Test-Coverage — immer
- CHANGELOG-Updates — immer
- Sprint-Close-Protokoll — immer
- Retros — immer (Selbstreflexion ist genauso wichtig wie Team-Reflexion)

**Wann Solo-Modus aktiv?**
- Wenn in `CLAUDE.md` kein Team definiert ist oder explizit "Solo-Projekt" steht
- Kann jederzeit auf Team-Modus umgestellt werden (PR-Pflicht + Reviews aktivieren)

## When Uncertain
- Check `CLAUDE.md` for project conventions
- Check `docs/adr/` for past decisions
- Check `docs/contracts/` for API specs
- If still unclear: ask the user, don't guess
