# Retro Index

> Alle Retrospektiven dieses Projekts — chronologisch, mit Action Item Status.
> **Nach jeder Retro:** Neuen Eintrag hinzufügen + offene Action Items aktualisieren.

## Retros

| Datum | Scope | Typ | Commits | Issues geschlossen | Offene Action Items | Datei |
|-------|-------|-----|---------|-------------------|---------------------|-------|
| _noch keine_ | — | — | — | — | — | — |

<!-- Eintrag-Vorlage:
| 2026-03-15 | Sprint 1 | Sprint-Ende | 23 | 8/10 | 2 (#45, #46) | [RETRO-2026-03-15-sprint-1.md](RETRO-2026-03-15-sprint-1.md) |
-->

---

## Offene Action Items (kumulativ)

> Action Items aus Retros die noch nicht als GitHub Issue geschlossen sind.
> P1/P2 müssen als Issue vorliegen — sonst "Documentation Theater".

| Issue | Priorität | Aus Retro | Beschreibung | Status |
|-------|-----------|-----------|--------------|--------|
| _noch keine_ | — | — | — | — |

<!-- Vorlage:
| #45 | P1 | 2026-03-15 | CHANGELOG bei jeder user-facing Änderung erzwingen | open |
| #46 | P2 | 2026-03-15 | a11y CI Gate mit axe-core hinzufügen | open |
-->

---

## Hinweise

**Template:** Neue Retros aus `docs/retro/TEMPLATE.md` kopieren.

**Namenskonvention:** `RETRO-[YYYY-MM-DD]-[scope].md`
- Sprint-Ende: `RETRO-2026-03-15-sprint-1.md`
- Phase-Wechsel: `RETRO-2026-03-15-phase-2-to-3.md`
- Projekt-Ende: `RETRO-2026-03-15-project-end.md`
- On-Demand: `RETRO-2026-03-15-hotfix.md`

**Action Items verfolgen:**
```bash
# Alle offenen Retro-Issues
gh issue list --label "type:tech-debt" --state open --search "RETRO:"

# Retro-Issues für nächsten Sprint
gh issue list --label "type:tech-debt" --state open --milestone "Sprint [N]"
```
