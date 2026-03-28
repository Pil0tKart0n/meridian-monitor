# Testing Rules

> Single Source of Truth für alle Test-Regeln. Skill-spezifische Ergänzungen in `frontend.md` und `backend.md`.

## Test-Timing (HARD RULE)
- **Tests werden im SELBEN Commit wie das Feature geschrieben** — nie als separater Batch danach
- Kein Feature-Commit ohne mindestens einen Test (Unit oder Integration)
- Phase 4 (QA) ergänzt E2E und Lücken — schreibt NICHT die Basis-Tests nach

## Test-Execution (HARD RULE)
- Tests schreiben ist NICHT genug — Tests MÜSSEN ausgeführt werden
- **Unit/Integration Tests:** `npm run test` nach jedem Test-File
- **E2E Tests:** `npx playwright test` mindestens 1x pro Story (braucht laufende App)
- Wenn E2E nicht lokal möglich: explizit dokumentieren ("E2E: nicht lokal getestet, braucht CI")
- Rote Tests = Blocker. Nie committen mit failing Tests.

## Test-Coverage (HARD RULE)
- Every new file with logic needs at least one co-located test (`*.test.ts`)
- Pure functions: always unit-tested
- API endpoints: at least happy-path + error-path
- Components: at least render-test + key interaction
- Read `docs/tech-notes.md` at session start for library-specific gotchas

## Test-Typen

### Unit Tests
- Business logic functions (no DB, no HTTP)
- Naming: `describe('[ModuleName]', () => { it('should [behavior]', ...) })`
- Mock **externe** Dependencies (APIs, Services), **nicht** interne Logik
- Fast: < 1s per test, keine Netzwerk-Calls, kein Filesystem
- Co-located: `*.test.ts` neben der Quelldatei

### Integration Tests
- API-Endpoints gegen echte DB (Testcontainers, Test-DB, oder In-Memory-DB)
- **Keine gemockte DB** bei Integration-Tests — das verfehlt den Zweck
- Contract-Tests: API-Response-Shape gegen OpenAPI-Spec validieren
- **Beide Modi testen** wenn dev/production Mode-Split existiert
- Auth: vollständiger Flow (Register → Login → Token → geschützter Endpoint)

### E2E Tests (HARD RULE)
- **Playwright** für kritische User-Flows
- **Neue User-facing Flows MÜSSEN E2E-Tests haben** (nicht nur Unit-Tests)
  - Unit-Tests prüfen "API funktioniert", E2E prüft "User Experience funktioniert"
  - QA-Checkpoint vor Phase 4: "Welche neuen Flows gibt es? Haben sie E2E-Tests?"
- Test IDs: `data-testid="descriptive-name"` für stabile Selektoren
- **API-Calls: IMMER Response-Status prüfen** — kein fire-and-forget
  - Registration/Login-Helpers MÜSSEN `response.ok` verifizieren
  - Silent 4xx/5xx in Setup-Steps = stundenlange Debug-Sessions
- Selectors: `{ exact: true }` für `getByText` wenn Text Substring anderer Elemente ist
- **Lokal zuerst:** E2E-Tests lokal ausführen bevor gepusht wird (spart CI-Roundtrips)
- axe-core Assertions für Accessibility

### Contract Tests
- API-Spec-Validation für Response-Shapes
- OpenAPI-Spec-Änderungen → Contract-Tests updaten im selben Commit
- Response-Felder matchen Spec (keine Extra-Felder, keine fehlenden Pflicht-Felder)

## Bug-Fix Testing (HARD RULE)
Bevor ein Bug-Fix implementiert wird (gilt für JEDEN Skill, nicht nur QA):
1. **Reproduzieren** — Was genau passiert? Was sollte passieren? Lokal nachstellbar?
2. **Wenn nicht reproduzierbar** → Rückfrage an User. Nie einen Fix "auf Verdacht" bauen.
3. **Regression-Test ZUERST schreiben** — Test muss fehlschlagen (Red), dann Fix implementieren (Green)
4. **Verifizieren** dass der Fix das Problem löst (nicht nur dass der Code kompiliert)

## Feature-Flag Testing
- Tests müssen **BEIDE Pfade** abdecken (Flag ON und Flag OFF)
- E2E: mindestens den neuen Pfad (Flag ON) testen
- CI: Tests laufen mit allen Flags OFF (Default) + einmal mit allen Flags ON

## CI Debug-Strategie (bei CI-only Failures)
Bevor du blinden Logging-Roundtrips durch CI machst (jeder Run = 5+ Minuten):
1. **Response-Codes prüfen** — Geben API-Calls in Setup-Steps überhaupt 2xx zurück?
2. **Validation-Schema-Grenzen** — Überschreiten Test-Fixtures Zod-Schema-Limits?
3. **Environment-Unterschiede** — Fehlen Env-Vars in CI die lokal gesetzt sind?
4. **Erst dann** Diagnostic Logging hinzufügen und erneut pushen
5. **E2E lokal reproduzieren** wenn irgend möglich — spart 5+ Minuten pro Roundtrip

## Skill-spezifische Ergänzungen

### Frontend (→ `frontend.md` § Testing)
- Behavior testen, nicht Implementation (Testing Library)
- `data-testid` für E2E-Selektoren
- axe-core Assertions für A11y

### Backend (→ `backend.md` § Testing)
- Integration: gegen echte DB, nicht gemockt
- Contract: Response-Shapes gegen OpenAPI-Spec
- Beide Modi testen wenn dev/prod Mode-Split

### Authorization (→ `authorization.md` § Testing)
- Jeder Endpoint: no-auth → 401, wrong-permission → 403, correct → 200
- Row-Level Filtering: User sieht nur Daten die der Scope erlaubt
- Privilege Escalation: Seller kann nicht auf Admin-Endpoints zugreifen

## Anti-Patterns (vermeiden)
- **Tests die Implementation statt Behavior testen** — "wurde setState aufgerufen?" statt "zeigt UI den neuen Wert?"
- **Gemockte DB bei Integration-Tests** — verfehlt den Zweck, findet keine echten Query-Bugs
- **E2E ohne Response-Status-Checks** — silent Failures in Setup-Steps kosten Stunden
- **"Tests machen wir in Phase 4"** — Phase 4 ergänzt, Phase 3 schreibt die Basis
- **Tests ohne Ausführung** — geschriebene Tests die nie `npm run test` durchlaufen
- **Flaky Tests ignorieren** — flaky = broken. Fix oder entferne sie, nie ignorieren
- **Test-Daten hardcoded** — verwende Factories/Fixtures, nicht magic strings
- **Zu viel Mocking** — wenn > 50% des Tests aus Mock-Setup besteht, ist der Test falsch geschnitten
