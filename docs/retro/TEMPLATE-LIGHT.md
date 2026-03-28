# Retrospective Template (Light)

> Für kurze Sprints (≤1 Woche) oder Sprints mit wenigen Commits (≤10).
> Für größere Sprints: `TEMPLATE.md` (vollständig) verwenden.
> Kopiere diese Datei als `RETRO-[YYYY-MM-DD]-sprint-N.md`.

---

# Retrospective — Sprint [N] ([YYYY-MM-DD])

## Kontext

| Feld | Wert |
|------|------|
| **Zeitraum** | [YYYY-MM-DD] — [YYYY-MM-DD] |
| **Commits** | [Anzahl] |
| **Issues geschlossen** | [N] / [Gesamt geplant] |

---

## Quick-Metriken

| Metrik | Ist | Status |
|--------|-----|--------|
| Tests geschrieben + ausgeführt | Ja / Nein | ✅ / ❌ |
| CHANGELOG bei user-facing Commits | Ja / Nein | ✅ / ❌ |
| Retro am Sprint-Ende (nicht batch) | Ja / Nein | ✅ / ❌ |

---

## Was lief gut

- [1-3 Punkte]

---

## Was lief schlecht

- [1-3 Punkte]

---

## Action Items

- [ ] [Aktion] → **P[1/2/3]** → `gh issue create --title "RETRO: [titel]" --label "type:tech-debt,priority:P[N]"`

> **HARD RULE:** P1/P2 Action Items MÜSSEN als GitHub Issues angelegt werden.

---

## Nächste Schritte

- Genehmigte Fixes committen: `git commit -m "docs: retro [datum] findings implemented"`
- `docs/retro/INDEX.md` aktualisieren

---

_Wenn dieser Sprint signifikante Probleme, viele Commits (>10) oder mehrere Skills umfasst → vollständiges Template `TEMPLATE.md` verwenden._
