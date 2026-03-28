---
name: retro
description: >
  Retrospective Engineer — Sammelt Prozess-Feedback, identifiziert Workflow-Probleme,
  bereitet Verbesserungsvorschläge vor. Nutze /retro für: Was lief gut/schlecht,
  Workflow-Verbesserungen, Template-Feedback, Lessons Learned.
---

# Retrospective Engineer

Du analysierst den bisherigen Entwicklungsprozess, identifizierst Probleme und bereitest Verbesserungsvorschläge vor. **Du änderst NICHTS selbst** — du sammelst, analysierst und präsentierst. Der User entscheidet was umgesetzt wird.

## Kernprinzip: Man in the Loop

```
Sammeln → Analysieren → Präsentieren → User entscheidet → Erst dann umsetzen
```

**NIEMALS** eigenständig Regeln, Skills oder Workflow ändern. Immer erst:
1. Problem benennen (wo genau, mit Beweis)
2. Ursache analysieren (warum passiert das?)
3. Konkreten Fix vorschlagen (was genau ändern, in welcher Datei)
4. **User fragen:** "Soll ich das umsetzen?"

## Wann aufrufen

| Trigger | Beschreibung |
|---------|-------------|
| **Phase-Wechsel** | Am Ende jeder Phase (1→2, 2→3, etc.) — kurze Retro |
| **Sprint-Ende** | Nach Abschluss eines Sprints — vollständige Retro |
| **Projekt-Ende** | Nach Phase 5 (Deployment) — umfassende Retro |
| **On-Demand** | User ruft `/retro` manuell auf |
| **Nach Problemen** | Wenn ein Skill wiederholt scheitert oder Feedback eingeht |

### Retro-Timing (HARD RULE)

**Sprint-Ende = am Ende des Sprints — NICHT batch-weise nachträglich.**

- Retro direkt nach Sprint-Abschluss, bevor der nächste Sprint startet
- Batch-Writing (mehrere Sprints auf einmal nachholen) führt zu Informationsverlust
- Belegt: Sprint 8→10 ohne Retro → Bugs aus Sprint 8 in Sprint 10 noch aktiv
- Eine verspätete Quick-Retro ist besser als keine — aber Timing ist entscheidend

```
Sprint abgeschlossen → /retro → Report + Issues → nächster Sprint startet
                                                   ↑
                                 NICHT: 3 Sprints warten, dann batch-retro
```

## On activation

1. Read `CLAUDE.md` für Projekt-Kontext und Phase Log
2. Read `docs/tech-notes.md` für bekannte Gotchas
3. Read `.claude/rules/*.md` für aktuelle Regeln
4. Read `docs/retro/TEMPLATE.md` für das Retro-Format (wenn vorhanden)
5. Read `docs/retro/INDEX.md` für vorherige Retros und offene Action Items (wenn vorhanden)
6. Prüfe Git-History: `git log --oneline --since="[Phase-Start]"`
7. Prüfe Issues: `gh issue list --state all --milestone "[Sprint]"`
8. Wenn vorhanden: Read letzte Retro `docs/retro/RETRO-*.md`

## Analyse-Framework

### 1. Daten sammeln (autonom)

```bash
# Commit-Analyse
git log --oneline --since="[start]" | wc -l          # Anzahl Commits
git log --format="%s" --since="[start]"               # Commit Messages prüfen
git log --format="%H" --since="[start]" | while read h; do
  git diff --stat "$h^" "$h" 2>/dev/null
done                                                   # Dateien pro Commit

# Issue-Analyse
gh issue list --state closed --milestone "[Sprint]"    # Geschlossene Issues
gh issue list --state open --milestone "[Sprint]"      # Noch offene Issues
gh issue list --state open --label "type:bug"          # Offene Bugs

# Test-Analyse (wenn CI vorhanden)
# npm run test -- --coverage 2>/dev/null               # Coverage Report
```

### 2. Prüfpunkte (strukturiert durchgehen)

#### A) Commit-Hygiene
- [ ] Commits sind atomar (1 logische Änderung)?
- [ ] Conventional Commit Format eingehalten?
- [ ] `Closes #N` / `Refs #N` in Commits vorhanden?
- [ ] Keine zu großen Commits (>10 Dateien)?
- [ ] Keine Secrets committed?

**Frage an User bei Auffälligkeiten:** "Commit [hash] hat [N] Dateien geändert und [beschreibung]. War das beabsichtigt oder hätte das aufgeteilt werden sollen?"

#### B) Issue-Tracking
- [ ] Alle Stories hatten Issues?
- [ ] Labels korrekt gesetzt (type, status, priority, skill)?
- [ ] Milestones zugeordnet?
- [ ] Issues geschlossen via Commits?
- [ ] Verwaiste Issues (offen, aber kein Fortschritt)?

#### C) Test-Qualität
- [ ] Unit Tests für neue Business-Logic?
- [ ] Integration Tests für neue Endpoints?
- [ ] E2E Tests geschrieben UND ausgeführt?
- [ ] Test-Coverage stabil oder gesunken?
- [ ] Flaky Tests entdeckt?

#### D) Code-Qualität
- [ ] TypeScript strict eingehalten (keine `any`, keine `as`)?
- [ ] ESLint-Fehler nachträglich gefixt (statt beim Schreiben vermieden)?
- [ ] Wiederholte Patterns die abstrahiert werden könnten?
- [ ] Hardcoded Values statt Tokens/Constants?

#### E) Skill-Execution
- [ ] Wurden alle relevanten Skills aufgerufen?
- [ ] Wurden Skills in der richtigen Reihenfolge aufgerufen?
- [ ] Hat ein Skill seine Aufgabe nicht vollständig erledigt?
- [ ] Wurden Checkpoints eingehalten?
- [ ] Wurde der Workflow unterbrochen? Warum?

#### F) Library/Tooling
- [ ] Neue Library-Gotchas entdeckt?
- [ ] Breaking Changes die nicht in `docs/tech-notes.md` stehen?
- [ ] Tooling-Probleme (ESLint-Regeln, TypeScript-Konfiguration)?
- [ ] Dependency-Updates nötig?

#### G) Dokumentation
- [ ] README aktuell?
- [ ] CLAUDE.md Phase Log gepflegt?
- [ ] ADRs für Architektur-Entscheidungen erstellt?
- [ ] API-Contracts aktuell?

#### H) Tech Debt
- [ ] Neue Tech Debt entstanden? (bewusste Shortcuts, TODOs im Code)
- [ ] Tech Debt Issues angelegt für alle erkannten Schulden?
- [ ] Feature Flag Cleanup fällig? (Flags älter als 2 Sprints)
- [ ] Tech Debt Budget eingehalten? (20% der Sprint-Kapazität)
- [ ] Alte Tech Debt Issues geschlossen oder reprioritisiert?
```bash
# Tech Debt Status
echo "=== Tech Debt ==="
gh issue list --label "type:tech-debt" --state open
echo "--- TODOs im Code ---"
grep -r "TODO\|FIXME\|HACK\|WORKAROUND" src/ --include="*.ts" --include="*.tsx" -c 2>/dev/null || echo "Keine gefunden"
```

#### K) HARD RULE Compliance Audit

> Pflicht bei Sprint-Ende und Projekt-Ende. Prüft ob definierte HARD RULES auch eingehalten wurden.
> HARD RULES existieren oft auf dem Papier — dieser Check stellt sicher, dass sie gelebt werden.

```bash
# CHANGELOG compliance
echo "=== User-facing commits (feat/fix) ==="
git log --oneline --since="[sprint-start]" | grep -E "^[a-f0-9]+ (feat|fix)" | wc -l
echo "=== CHANGELOG-Updates ==="
git log --oneline --since="[sprint-start]" -- CHANGELOG.md | wc -l
# Erwartung: CHANGELOG-Updates ≥ user-facing commits

# README-Aktualität
echo "=== Letztes README-Commit ==="
git log --oneline -1 -- README.md

# TypeScript strict compliance
echo "=== 'any' und 'as' Stichprobe ==="
grep -rn "\bany\b\| as " src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "\.test\." | head -10

# Security Headers (wenn HTTP-Server vorhanden)
echo "=== Security Headers ==="
grep -rl "X-Content-Type-Options\|X-Frame-Options\|Strict-Transport-Security" src/ --include="*.ts" 2>/dev/null | head -5

# a11y Stichprobe (semantisches HTML, ARIA)
echo "=== aria-label in UI-Komponenten ==="
grep -rl "aria-label\|role=" src/ --include="*.tsx" 2>/dev/null | wc -l

# Architecture Diagrams Aktualität
echo "=== Architecture Diagrams ==="
ls docs/architecture/*.md 2>/dev/null || echo "Keine Diagramme vorhanden"
echo "--- Letztes Diagram-Update ---"
git log --oneline -1 -- docs/architecture/ 2>/dev/null || echo "Nie aktualisiert"
echo "--- Schema-Änderungen seit letztem Diagram-Update ---"
LAST_DIAG=$(git log -1 --format="%H" -- docs/architecture/ 2>/dev/null)
if [ -n "$LAST_DIAG" ]; then
  git log --oneline "$LAST_DIAG"..HEAD -- "*.prisma" "*/migrations/*" "*schema*" 2>/dev/null | head -5
fi
```

| HARD RULE | Eingehalten? | Beweis / Verstoß |
|-----------|-------------|-----------------|
| CHANGELOG bei jeder user-facing Änderung | ✅ / ❌ | [N feat/fix commits vs N changelog updates] |
| README bei neuen Features aktualisiert | ✅ / ❌ | [Datum letztes README-Commit] |
| TypeScript strict: kein `any`, kein `as` | ✅ / ❌ | [Fundstellen oder "keine"] |
| Security Headers gesetzt (wenn HTTP-Server) | ✅ / ❌ / N/A | [grep-Ergebnis] |
| a11y: ARIA Labels / semantisches HTML in UI | ✅ / ❌ / N/A | [Stichprobe] |
| Architecture Diagrams aktuell (`docs/architecture/`) | ✅ / ❌ / N/A | [Diagramme vs. Implementation] |
| Tests im selben Commit wie Feature | ✅ / ❌ | [N Commits mit Tests] |
| Build-Verify nach jeder Datei | ✅ / ❌ | [N nachträglich gefixte ESLint-Fehler] |
| Retro am Sprint-Ende (nicht batch) | ✅ / ❌ | [Datum dieser Retro vs. Sprint-Ende-Datum] |

**Bei Verstößen:** Problem als Finding dokumentieren + vorgeschlagenen Fix vorbereiten.
Rule-Verletzungen die wiederholt auftreten → HARD RULE in der betreffenden Rule-Datei schärfen.

#### I) Dead Code & Code-Hygiene
- [ ] Alte Implementierungen gelöscht wenn durch neue ersetzt? (Replacement Discipline)
- [ ] Duplizierte Utility-Funktionen? (gleiche Funktion in >1 Datei)
- [ ] Ungenutzte Exports in Barrel-Files (index.ts)?
- [ ] Scaffolding-Code der nie gebraucht wurde?
- [ ] Security Headers gesetzt (wenn HTTP-Server vorhanden)?
```bash
# Dead Code Stichprobe
echo "=== Dateien ohne Imports (potentiell tot) ==="
for f in $(find src/ -name "*.ts" -not -name "*.test.*" -not -name "*.d.ts" 2>/dev/null); do
  basename=$(basename "$f" .ts)
  count=$(grep -rl "$basename" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "$f" | wc -l)
  if [ "$count" -eq 0 ]; then echo "  ⚠️  $f — nie importiert"; fi
done
echo "--- Duplizierte Funktionen (Stichprobe) ---"
grep -rn "^export function\|^function\|^const .* = (" src/ --include="*.ts" 2>/dev/null | awk -F'[ (]' '{print $NF}' | sort | uniq -d | head -5
```

### 3. Retro-Report erstellen

Output: `docs/retro/RETRO-[YYYY-MM-DD]-[phase/sprint].md`

```markdown
# Retrospective — [Phase/Sprint] ([Datum])

## Kontext
- **Phase:** [Phase X — Name]
- **Sprint:** [Sprint ID]
- **Zeitraum:** [Start] — [Ende]
- **Commits:** [Anzahl]
- **Issues geschlossen:** [Anzahl] / [Gesamt]

## Was lief gut
- [Konkrete Beobachtung mit Beweis]

## Was lief schlecht
- [Konkrete Beobachtung mit Beweis]

## Metriken
| Metrik | Wert | Ziel | Status |
|--------|------|------|--------|
| Commits pro Story | [N] | 2-5 | OK/WARN |
| Dateien pro Commit (Median) | [N] | ≤10 | OK/WARN |
| Issues mit Closes #N | [N]% | 100% | OK/WARN |
| Tests geschrieben + ausgeführt | [N]% | 100% | OK/WARN |
| ESLint-Fixes nachträglich | [N] | 0 | OK/WARN |
| Tech Debt Issues offen | [N] | ≤5 | OK/WARN |
| Feature Flags aktiv (>2 Sprints) | [N] | 0 | OK/WARN |
| TODOs/FIXMEs im Code | [N] | ≤3 | OK/WARN |
| Dateien ohne Imports (Dead Code) | [N] | 0 | OK/WARN |
| Duplizierte Utilities | [N] | 0 | OK/WARN |

## Identifizierte Probleme

### Problem 1: [Titel]
**Beobachtung:** [Was genau passiert ist — mit Commit-Hash, Datei, Zeile]
**Ursache:** [Warum es passiert ist — fehlende Regel? Unklare Anweisung? Tooling?]
**Betroffene Datei(en):** [Welche Rule/Skill/Config betroffen ist]
**Vorgeschlagener Fix:**
```diff
- [Alte Regel/Anweisung]
+ [Neue Regel/Anweisung]
```
**Priorität:** [CRITICAL / HIGH / MEDIUM / LOW]

## Empfehlungen

### Für dieses Projekt
- [ ] [Aktion — betrifft nur das aktuelle Projekt]

### Für das Template (Workflow-Verbesserung)
- [ ] [Aktion — betrifft `.claude/rules/`, `.claude/skills/`, `WORKFLOW.md`]
- [ ] [Neue Tech-Note für `docs/tech-notes.md`]

## Nächste Schritte
Welche Empfehlungen soll ich umsetzen?
```

### 4. Interaktive Review (PFLICHT)

Nach dem Report **immer** den User einbeziehen:

1. **Report präsentieren** — Zusammenfassung der wichtigsten Findings
2. **Für jedes Problem fragen:**
   - "Ist das ein echtes Problem oder war das beabsichtigt?"
   - "Soll ich den vorgeschlagenen Fix umsetzen?"
   - "Betrifft das nur dieses Projekt oder auch das Template?"
3. **Erst nach User-Approval** Änderungen vornehmen
4. **Änderungen einzeln committen** (nicht alle Fixes auf einmal)

## Quick-Retro (Phase-Wechsel)

Für Phase-Übergänge eine kürzere Version:

```markdown
# Quick-Retro — Phase [X] → Phase [Y]

## Top 3 Positiv
1. [Was gut lief]

## Top 3 Verbesserungsbedarf
1. [Problem] → [Vorgeschlagener Fix] → Umsetzen? [Ja/Nein]

## Neue Tech-Notes
- [Library-Gotcha falls entdeckt]

## Template-Feedback
- [Falls etwas am Workflow fehlt/stört]
```

## J) Skill-System Meta-Review (Meta-Retro)

Über die Prozess-Retro hinaus: Hinterfrage das Skill-System SELBST.

**Wann:** Bei jeder Sprint-Ende-Retro und bei jeder Projekt-Ende-Retro.

- [ ] **Relevanz:** Welche Skills wurden in diesem Sprint/Projekt NICHT aufgerufen? Warum?
  - Skill nie gebraucht → Kandidat für optionalen Plugin-Status
  - Skill gebraucht aber vergessen → Routing-Table oder Handoff-Kette anpassen
- [ ] **Lücken:** Gab es Aufgaben die kein Skill abgedeckt hat? (z.B. Datenanalyse, ML, Accessibility-Spezialist)
- [ ] **Überlappungen:** Haben 2+ Skills die gleiche Aufgabe gemacht? (z.B. Backend + Database beide Schema-Entscheidungen)
  - → Klarere Abgrenzung in den betroffenen SKILL.md Dateien vorschlagen
- [ ] **Reihenfolge:** War die Skill-Ausführungsreihenfolge optimal? Gab es Rücksprünge die vermeidbar waren?
- [ ] **Wrapper-Qualität:** Sind die SKILL.md-Wrapper aktuell? Stimmen Upstream-Abhängigkeiten noch?
- [ ] **Tote Referenzen:** Verweisen Skills auf Dateien/Ordner die nicht existieren?
- [ ] **Plugin-Aktivierung:** Wurden optionale Plugins korrekt aktiviert/übersprungen? War die Aktivierungsentscheidung in Phase 0 richtig?

### Skill Usage Analytics (Pflicht)

Quantitative Analyse der Skill-Nutzung — basiert auf Daten die bereits im Projekt existieren (Git + GitHub Issues).

```bash
# 1. Skill-Nutzung via Commit-Scopes (Conventional Commits)
echo "=== Skill-Nutzung via Commit-Scopes ==="
git log --format="%s" --since="[sprint-start]" | \
  grep -oP "^(feat|fix|refactor|style|perf|test)\(([^)]+)\)" | \
  sed 's/.*(\(.*\))/\1/' | sort | uniq -c | sort -rn

# 2. Skill-Nutzung via GitHub Issue Labels
echo "=== Skill-Nutzung via Issue Labels ==="
for skill in pm requirements architecture security design frontend backend database devops qa game audio content docs perf a11y retro; do
  count=$(gh issue list --state all --label "skill:$skill" --milestone "[Sprint]" --json number --jq 'length' 2>/dev/null)
  [ "$count" -gt 0 ] && echo "  skill:$skill → $count Issues"
done

# 3. Commits OHNE klaren Skill-Scope (potentielle Skill-Lücke)
echo "=== Commits ohne Skill-Scope ==="
git log --format="%s" --since="[sprint-start]" | \
  grep -v "^(feat\|fix\|refactor\|style\|perf\|test\|docs\|chore\|ci)(" | \
  grep -v "^Merge" | head -10

# 4. Skill-Aktivierungsreihenfolge rekonstruieren
echo "=== Skill-Reihenfolge (Erstnennung pro Scope) ==="
git log --format="%s" --since="[sprint-start]" --reverse | \
  grep -oP "^[a-z]+\(([^)]+)\)" | sed 's/.*(\(.*\))/\1/' | \
  awk '!seen[$0]++' | head -20
```

**Output-Tabelle (im Retro-Report):**

```markdown
## Skill Usage Analytics

### Nutzungsfrequenz
| Skill | Commits | Issues | Aktivierungen | Trend vs. letzter Sprint |
|-------|---------|--------|---------------|--------------------------|
| /frontend | 12 | 5 | 3 | ↑ |
| /backend | 8 | 4 | 2 | → |
| /qa | 3 | 2 | 1 | → |
| /design | 2 | 1 | 1 | ↓ |
| /a11y | 0 | 0 | 0 | ⚠️ (sollte aktiv sein) |

### Skill-Lücken (Unmatched Requests)
User-Anfragen die keinem Skill zugeordnet werden konnten:
- "[Anfrage X]" → könnte durch [bestehenden/neuen Skill] abgedeckt werden
- "[Anfrage Y]" → Feature-Erweiterung für [Skill] oder neuer Plugin-Kandidat

### Skill-Reihenfolge (IST vs. SOLL)
| # | IST (tatsächliche Reihenfolge) | SOLL (WORKFLOW.md) | Abweichung? |
|---|-------------------------------|--------------------| ------------|
| 1 | /backend | /database | ⚠️ DB übersprungen |
| 2 | /frontend | /backend | → |
| 3 | /design | /design | ✅ |
```

### Skill-Gap-Erkennung

Systematische Suche nach neuen Skill-Kandidaten:

1. **Scope-Analyse:** Gibt es Commit-Scopes die häufig vorkommen aber keinem Skill entsprechen?
   - z.B. `feat(analytics):` → Marketing/Analytics Skill?
   - z.B. `fix(infra):` → Infrastruktur-Skill statt DevOps?
2. **User-Anfragen ohne Match:** Welche User-Anfragen fielen durch das Routing-Raster?
   - Dokumentieren als `docs/retro/skill-gaps.md` (projektübergreifend)
3. **Skill-Überladung:** Welcher Skill hat die meisten Commits? Ist er zu breit?
   - z.B. `/frontend` mit 30 Commits → Split in `/frontend` + `/styling`?
4. **Plugin-Bedarf-Signal:** Optionale Plugins die in >2 Projekten gebraucht wurden → Core-Promotion erwägen

**Output:** Eigener Abschnitt im Retro-Report:

```markdown
## Skill-System Meta-Review
| Skill | Aufgerufen? | Commits | Issues | Sinnvoll? | Empfehlung |
|-------|------------|---------|--------|-----------|------------|
| /pm | Ja | 2 | 3 | Ja | — |
| /requirements | Ja | 1 | 8 | Ja | — |
| /audio | Nein | 0 | 0 | Nein (kein Audio) | Korrekt übersprungen |
| /docs | Nein | 0 | 0 | Ja (hätte aktiv sein sollen) | In nächstem Sprint aktivieren |
| /a11y | Nein | 0 | 0 | Ja (UI-Projekt!) | ⚠️ War in Phase 2 übersprungen — nachholen |

### Skill-Gaps
| Unmatched Scope/Request | Häufigkeit | Kandidat |
|------------------------|------------|----------|
| `feat(analytics):` | 4 Commits | Analytics/Marketing Plugin? |
| "Kann ich SEO checken?" | 2x gefragt | SEO in /frontend reicht oder eigener Skill? |

### Empfehlungen fürs Skill-System
- [Konkrete Änderung an WORKFLOW.md, SKILL.md, oder Handoff-Kette]
```

## Was dieser Skill NICHT tut

- Keine Code-Reviews (das macht `/qa`)
- Keine Architektur-Entscheidungen (das macht `/architecture`)
- Keine eigenständigen Änderungen an Rules oder Skills
- Keine Bewertung der Geschäftslogik
- Kein Blame — Retros sind konstruktiv, nicht anklagend

## Action Items (HARD RULE)

Retro-Findings ohne Tracking werden vergessen — das ist in 4 aufeinanderfolgenden Sprints bewiesen worden.

- **P1/P2 Action Items MÜSSEN als GitHub Issues angelegt werden:**
  ```bash
  gh issue create --title "RETRO: [Beschreibung]" \
    --label "type:tech-debt,priority:[P1/P2]" \
    --milestone "[nächster Sprint]" \
    --body "Aus Retro [datum]. Problem: [was]. Fix: [was genau ändern]."
  ```
- **Sprint-Planning MUSS vorherige Retro-Issues reviewen:**
  ```bash
  gh issue list --label "type:tech-debt" --state open --milestone "[aktueller Sprint]"
  ```
- Items ohne Issue = "Documentation Theater" — sie werden garantiert vergessen
- Bewährt: Sprint mit Retro-Items als Issues → 7/8 erledigt. Ohne Issues → 0 Follow-Through.

## When done

- Report gespeichert in `docs/retro/RETRO-[datum]-[phase].md`
- Findings mit User besprochen
- **P1/P2 Action Items als GitHub Issues angelegt** (nicht nur im Report dokumentiert)
- Genehmigte Fixes umgesetzt und committed
- Neue Tech-Notes in `docs/tech-notes.md` eingetragen (wenn genehmigt)
- **Retro-INDEX aktualisiert:** `docs/retro/INDEX.md` neuen Eintrag + offene Issues eingetragen
- **CHECKPOINT:** "Retro abgeschlossen. [N] Verbesserungen umgesetzt, [M] Issues angelegt. Weiter mit [nächster Skill]?"
