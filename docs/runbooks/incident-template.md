# Incident Response Runbook

## Severity Levels

| Level | Beschreibung | Response-Zeit | Beispiel |
|-------|-------------|---------------|---------|
| **SEV1** | Service komplett down, Datenverlust | < 15 min | DB korrupt, Auth kaputt, 500er auf allen Endpoints |
| **SEV2** | Kernfeature kaputt, viele User betroffen | < 1h | Checkout funktioniert nicht, Login-Loop |
| **SEV3** | Feature teilweise kaputt, Workaround existiert | < 4h | Suche langsam, Export-Button defekt |
| **SEV4** | Kosmetisch, einzelne User | Nächster Sprint | Layout-Shift, falsches Icon |

## Incident-Ablauf

### 1. Erkennung & Meldung
```bash
# Incident-Issue erstellen
gh issue create --title "INCIDENT: [SEV-Level] [Kurzbeschreibung]" \
  --label "type:incident,priority:P0" \
  --body "## Incident Report
**Severity:** SEV[1-4]
**Entdeckt:** [Zeitpunkt]
**Entdeckt durch:** [Monitoring/User-Report/Manuell]
**Betroffene User:** [Alle/Teilgruppe/Einzelne]
**Betroffenes Feature:** [Feature-Name]

## Symptome
- [Was genau passiert]
- [Error Messages / Logs]

## Status: INVESTIGATING
"
```

### 2. Sofortmaßnahmen (SEV1/SEV2)
```
1. Kommunikation:  Status-Update an Stakeholder
2. Scoping:        Was genau ist betroffen? Seit wann?
3. Mitigation:     Kann ein Feature Flag deaktiviert werden?
                   Kann ein Rollback auf letztes Deployment helfen?
4. Rollback:       Wenn ja → sofort ausführen
```

#### Rollback-Checkliste
- [ ] Letztes stabiles Deployment identifiziert
- [ ] Rollback durchgeführt (Vercel: Dashboard → Deployments → Promote)
- [ ] Verifiziert: Service funktioniert nach Rollback
- [ ] Feature Flag deaktiviert (wenn applicable)
- [ ] Status-Update gepostet

### 3. Investigation
```bash
# Logs prüfen (Vercel)
vercel logs --since 1h

# Letztes Deployment prüfen
git log --oneline -5

# DB-Status prüfen (wenn applicable)
# Endpoint testen
curl -s https://[app-url]/api/health | jq .
```

### 4. Fix
- Hotfix-Branch: `fix/incident-[kurzbeschreibung]`
- Minimaler Fix — keine Refactorings im Hotfix
- Tests für den Fix-Case schreiben
- Review: beschleunigt (1 Reviewer reicht bei SEV1/SEV2)
- Deploy + verifizieren

### 5. Post-Mortem (PFLICHT bei SEV1/SEV2)

Innerhalb von 48h nach Incident-Resolution erstellen:

```markdown
# Post-Mortem — [Incident-Titel] ([Datum])

## Timeline
| Zeit | Ereignis |
|------|----------|
| [HH:MM] | Incident entdeckt durch [Quelle] |
| [HH:MM] | Investigation gestartet |
| [HH:MM] | Root Cause identifiziert |
| [HH:MM] | Fix deployed |
| [HH:MM] | Verifiziert: Service stabil |

## Impact
- **Dauer:** [X] Minuten/Stunden
- **Betroffene User:** [Anzahl/Prozent]
- **Datenverlust:** [Ja/Nein — Details]
- **Finanzieller Impact:** [Wenn messbar]

## Root Cause
[Technische Beschreibung: Was genau ist schiefgelaufen und warum]

## Was hat die Erkennung verzögert?
[Fehlende Alerts? Fehlende Logs? Monitoring-Lücke?]

## Action Items
| # | Aktion | Verantwortlich | Deadline | Status |
|---|--------|---------------|----------|--------|
| 1 | [Monitoring verbessern] | [Name/Skill] | [Datum] | TODO |
| 2 | [Test hinzufügen] | [Name/Skill] | [Datum] | TODO |
| 3 | [Architektur-Änderung] | [Name/Skill] | [Datum] | TODO |

## Lessons Learned
- [Was haben wir gelernt?]
- [Was ändern wir am Prozess?]

## Blameless
Dieser Post-Mortem ist blameless. Ziel ist Lernen, nicht Schuldzuweisung.
```

**Speichern unter:** `docs/runbooks/post-mortem/PM-[YYYY-MM-DD]-[titel].md`

## Kill Switches (schnellste Mitigation)

Feature Flags als Kill Switch nutzen:
```typescript
// Sofort-Deaktivierung eines Features
// 1. In Vercel/CI: Environment Variable auf 'false' setzen
// 2. Redeploy (oder bei Runtime-Flags: sofortige Wirkung)

// Beispiel: Externer Payment-Provider down
if (!flags.enablePaymentProvider) {
  return <MaintenanceBanner message="Zahlung vorübergehend nicht verfügbar" />;
}
```

## Kommunikation während Incident

### Status-Updates
```bash
# Alle 30 min bei SEV1, alle 1h bei SEV2
gh issue comment #N --body "## Status Update [HH:MM]
**Status:** [INVESTIGATING / IDENTIFIED / MITIGATED / RESOLVED]
**Update:** [Was wurde seit dem letzten Update getan]
**ETA:** [Geschätzte Zeit bis Resolution]"
```

### Nach Resolution
```bash
gh issue comment #N --body "## RESOLVED [HH:MM]
**Fix:** [Kurzbeschreibung des Fixes]
**Deployed:** [Commit-Hash]
**Post-Mortem:** Folgt innerhalb 48h"

gh issue close #N
```
