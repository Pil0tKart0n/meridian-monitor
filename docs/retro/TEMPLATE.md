# Retrospective Template

> Kopiere diese Datei als `RETRO-[YYYY-MM-DD]-[phase|sprint-N].md`.
> Fülle alle Pflicht-Abschnitte aus. Optionale Abschnitte nur wenn relevant.
> **TIMING-REGEL:** Retro wird AM ENDE des Sprints/der Phase geschrieben — nicht batch-weise nachträglich.

---

# Retrospective — [Phase X / Sprint N] ([YYYY-MM-DD])

## Kontext

| Feld | Wert |
|------|------|
| **Typ** | Phase-Wechsel / Sprint-Ende / Projekt-Ende / On-Demand |
| **Zeitraum** | [YYYY-MM-DD] — [YYYY-MM-DD] |
| **Commits** | [Anzahl] |
| **Issues geschlossen** | [N] / [Gesamt geplant] |
| **Vorherige Retro** | [Link oder "Erste Retro"] |

---

## Pflicht-Metriken

| Metrik | Ist | Ziel | Status |
|--------|-----|------|--------|
| Commits pro Story (Median) | [N] | 2–5 | ✅ / ⚠️ / ❌ |
| Dateien pro Commit (Median) | [N] | ≤10 | ✅ / ⚠️ / ❌ |
| Issues mit `Closes #N` | [N]% | 100% | ✅ / ⚠️ / ❌ |
| Tests geschrieben + ausgeführt | [N]% | 100% | ✅ / ⚠️ / ❌ |
| CHANGELOG bei user-facing Commits | [N]% | 100% | ✅ / ⚠️ / ❌ |
| README aktuell (nach neuen Features) | Ja / Nein | Ja | ✅ / ❌ |
| TODOs/FIXMEs im Code | [N] | 0 | ✅ / ⚠️ / ❌ |
| Tech Debt Issues offen | [N] | ≤5 | ✅ / ⚠️ / ❌ |
| ESLint-Fehler nachträglich gefixt | [N] | 0 | ✅ / ⚠️ / ❌ |
| Retro am Sprint-Ende (nicht batch) | Ja / Nein | Ja | ✅ / ❌ |

---

## Was lief gut

- [Konkrete Beobachtung mit Beweis — Commit-Hash, Datei, Metrik]
- [...]

---

## Was lief schlecht

- [Konkrete Beobachtung mit Beweis]
- [...]

---

## Identifizierte Probleme

### Problem 1: [Titel]

**Beobachtung:** [Was genau passiert ist — mit Commit-Hash, Datei, Zeile wenn möglich]
**Ursache:** [Warum es passiert ist — fehlende Regel? Unklare Anweisung? Tooling-Gap?]
**Betroffene Datei(en):** [Welche Rule/Skill/Config betroffen ist]
**Vorgeschlagener Fix:**
```diff
- [Alte Regel/Anweisung]
+ [Neue Regel/Anweisung]
```
**Priorität:** CRITICAL / HIGH / MEDIUM / LOW
**Scope:** Nur dieses Projekt / Template-Verbesserung

---

## K) HARD RULE Compliance Audit

> Pflicht bei Sprint-Ende und Projekt-Ende-Retros.

```bash
# CHANGELOG compliance: user-facing commits vs. CHANGELOG-Updates
echo "User-facing commits:"
git log --oneline --since="[sprint-start]" | grep -v "^.*\s\(docs:\|test:\|chore:\|ci:\|refactor:\)" | wc -l
echo "CHANGELOG-Commits:"
git log --oneline --since="[sprint-start]" -- CHANGELOG.md | wc -l

# TypeScript strict compliance
grep -r "any\|as " src/ --include="*.ts" --include="*.tsx" -l 2>/dev/null | head -10

# Security headers (wenn HTTP-Server vorhanden)
grep -r "X-Content-Type-Options\|X-Frame-Options\|Strict-Transport-Security" src/ --include="*.ts" -l 2>/dev/null
```

| HARD RULE | Eingehalten? | Beweis / Verstoß |
|-----------|-------------|-----------------|
| CHANGELOG bei jeder user-facing Änderung | ✅ / ❌ | [N commits vs N changelog] |
| README bei neuen Features aktualisiert | ✅ / ❌ | [letztes README-Commit] |
| TypeScript strict: kein `any`, kein `as` | ✅ / ❌ | [Fundstellen oder "keine"] |
| Security Headers vorhanden (wenn HTTP-Server) | ✅ / ❌ / N/A | [Ergebnis grep] |
| a11y: ARIA Labels / semantisches HTML | ✅ / ❌ / N/A | [Stichprobe] |
| Architecture Diagrams aktuell (`docs/architecture/`) | ✅ / ❌ / N/A | [Diagramme vs. aktuelle Implementation] |
| Tests im selben Commit wie Feature | ✅ / ❌ | [N violations] |
| Build-Verify nach jeder Datei | ✅ / ❌ | [ESLint-Nachfixes] |
| Retro am Sprint-Ende (nicht batch) | ✅ / ❌ | [Datum dieser Retro vs. Sprint-Ende] |

---

## Decision Freshness Review

> EMPFOHLEN bei Sprint-Ende, PFLICHT bei Phase-Wechsel und Projekt-Ende.
> Prüft ob vergangene Entscheidungen noch gültig sind.

```bash
# Älteste 3 ADRs identifizieren (die am längsten nicht angefasst wurden)
ls -t docs/adr/ADR-*.md 2>/dev/null | tail -3

# Alle Decision Records überblicken
ls docs/adr/ADR-*.md docs/content/decisions/CDR-*.md docs/performance/decisions/PDR-*.md docs/documentation/decisions/DDR-*.md 2>/dev/null
```

**Sample-Review (3 älteste Entscheidungen):**

| Decision | Datum | Noch gültig? | Re-evaluation Trigger erreicht? | Aktion |
|----------|-------|-------------|--------------------------------|--------|
| [ADR-001: ...] | [YYYY-MM-DD] | ✅ / ⚠️ / ❌ | Ja / Nein | [Keine / Supersede / Update] |
| [ADR-002: ...] | [YYYY-MM-DD] | ✅ / ⚠️ / ❌ | Ja / Nein | [Keine / Supersede / Update] |
| [ADR-003: ...] | [YYYY-MM-DD] | ✅ / ⚠️ / ❌ | Ja / Nein | [Keine / Supersede / Update] |

**Fragen pro Entscheidung:**
- Hat sich der Kontext geändert? (Team, Anforderungen, Tech-Landschaft)
- Gibt es jetzt bessere Alternativen?
- Waren die vorhergesagten Trade-offs korrekt?
- Steht der Re-evaluation Trigger im ADR und ist er erreicht?

**Veraltete Entscheidung → neuen ADR vorschlagen** (Status: "Supersedes ADR-NNN")

---

## Skill Usage Analytics

> Pflicht bei Sprint-Ende und Projekt-Ende-Retros. Quantitative Analyse der Skill-Nutzung.

### Nutzungsfrequenz

| Skill | Commits | Issues | Trend vs. letzter Sprint | Bewertung |
|-------|---------|--------|--------------------------|-----------|
| /pm | [N] | [N] | ↑ / → / ↓ | — |
| /requirements | [N] | [N] | ↑ / → / ↓ | — |
| /architecture | [N] | [N] | ↑ / → / ↓ | — |
| /security | [N] | [N] | ↑ / → / ↓ | — |
| /design | [N] | [N] | ↑ / → / ↓ | — |
| /frontend | [N] | [N] | ↑ / → / ↓ | — |
| /backend | [N] | [N] | ↑ / → / ↓ | — |
| /database | [N] | [N] | ↑ / → / ↓ | — |
| /devops | [N] | [N] | ↑ / → / ↓ | — |
| /qa | [N] | [N] | ↑ / → / ↓ | — |
| /challenge | [N] | [N] | ↑ / → / ↓ | — |
| /retro | [N] | [N] | ↑ / → / ↓ | — |
| /game (Plugin) | [N] | [N] | ↑ / → / ↓ / N/A | — |
| /audio (Plugin) | [N] | [N] | ↑ / → / ↓ / N/A | — |
| /content (Plugin) | [N] | [N] | ↑ / → / ↓ / N/A | — |
| /docs (Plugin) | [N] | [N] | ↑ / → / ↓ / N/A | — |
| /perf (Plugin) | [N] | [N] | ↑ / → / ↓ / N/A | — |
| /a11y (Plugin) | [N] | [N] | ↑ / → / ↓ / N/A | — |

### Skill-Reihenfolge (IST vs. SOLL)

| # | IST (tatsächliche Reihenfolge) | SOLL (WORKFLOW.md) | Abweichung? |
|---|-------------------------------|--------------------| ------------|
| 1 | [scope] | [erwarteter skill] | ✅ / ⚠️ |
| 2 | [scope] | [erwarteter skill] | ✅ / ⚠️ |

### Skill-Gaps (Unmatched Requests)

User-Anfragen oder Commits die keinem Skill zugeordnet werden konnten:

| Unmatched Scope/Request | Häufigkeit | Kandidat für |
|------------------------|------------|--------------|
| [z.B. `feat(analytics):`] | [N Commits] | [Neuer Plugin? Bestehender Skill erweitern?] |

### Skill-System Empfehlungen

- [Konkrete Änderung an WORKFLOW.md, SKILL.md, oder Handoff-Kette — oder "keine"]

---

## Empfehlungen & Action Items

### Für dieses Projekt

- [ ] [Aktion] → **P[1/2/3]** → `gh issue create --title "RETRO: [titel]" --label "type:tech-debt,priority:P[N]"`

### Für das Template (Workflow-Verbesserung)

- [ ] [Aktion — betrifft `.claude/rules/`, `.claude/skills/`, `WORKFLOW.md`] → **P[N]**
- [ ] [Neue Tech-Note für `docs/tech-notes.md`] → **P[N]**

> **HARD RULE:** P1/P2 Action Items MÜSSEN als GitHub Issues angelegt werden:
> ```bash
> gh issue create --title "RETRO: [Beschreibung]" \
>   --label "type:tech-debt,priority:P[1/2]" \
>   --milestone "[nächster Sprint]" \
>   --body "Aus Retro [datum]. Problem: [was]. Fix: [was genau ändern]."
> ```

---

## Nächste Schritte

- Welche Empfehlungen werden umgesetzt? → User entscheidet
- **Retro-INDEX aktualisieren:** `docs/retro/INDEX.md` neuen Eintrag hinzufügen
- Genehmigte Fixes committen: `git commit -m "docs: retro [datum] findings implemented"`

---

## Playwright MCP Evidence (wenn UI-Projekt)

> Visual Checks werden VOR der Retro im Sprint-Close-Ritual gemacht.
> Hier nur die Ergebnisse/Screenshots referenzieren.

| Viewport | Seite | Status | Screenshot/Notiz |
|----------|-------|--------|------------------|
| 320px | Landing | ✅ / ❌ | [Beschreibung oder Pfad] |
| 768px | Landing | ✅ / ❌ | — |
| 1440px | Landing | ✅ / ❌ | — |
| 320px | [Hauptseite] | ✅ / ❌ | — |

---

## Meta-Retro Trigger

> Alle 3–4 Sprints eine Meta-Retro durchführen (Retro der Retro-Prozesse).
> Prüfe: Template-Compliance, Action-Item-Tracking, Timing, Evidence-Sammlung.

Letzte Meta-Retro: [Datum oder "noch keine"]
Nächste fällig: [Datum oder "nach Sprint N"]
