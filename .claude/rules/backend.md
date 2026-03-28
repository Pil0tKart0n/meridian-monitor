# Backend Rules

## API Design
- REST: resource-oriented URLs, correct HTTP methods, plural nouns
- Response format: `{ data, meta }` for success, RFC 9457 Problem Details for errors
- Always return `requestId` in responses and error objects
- Pagination: keyset-based (cursor), max 100 items per page
- Versioning: URL prefix `/api/v1/` for breaking changes

## Validation & Security
- Validate ALL inputs at boundary (Zod schemas or equivalent, never trust client)
- Allowlist response fields per role — never return full DB rows
- **Parameterized queries only — never string concatenation for SQL** (auch nicht mit vorheriger Allowlist-Prüfung — das Pattern ist fragil)
- Rate limiting on auth endpoints (login, register, password reset)
- Auth check on every protected endpoint (not just middleware assumption)
- CORS: explicit origins, no wildcards in production
- Never log PII, passwords, tokens, or full request bodies

## Security Headers (bei Server-Erstellung — NICHT aufschieben)
Wenn ein HTTP-Server erstellt wird (Express, Fastify, Hono, http.createServer, etc.):
- [ ] Security Headers Middleware sofort einrichten:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy` (projektspezifisch)
- [ ] CORS korrekt konfiguriert (explizite Origins)
- [ ] Body-Size-Limit gesetzt
- **Nicht** "machen wir beim Security-Audit" — sofort bei Server-Erstellung. Siehe `.claude/rules/security.md` für Details.

## Error Handling
- Catch errors at handler level, return structured error responses
- Log errors with context: requestId, userId (if authed), endpoint, params
- Never expose stack traces or internal details in API responses
- Use error codes (not just HTTP status) for client-specific handling
- **API→UI Error-Mapping:** Backend liefert maschinenlesbare Errors (RFC 9457 Problem Details: `type`, `status`, `title`, `detail`, `errorCode`). Frontend/Content mappt `errorCode` auf menschliche Nachrichten (PatternFly-Formel: Description + Reason + Resolution aus `content.md`). Backend schreibt KEINE user-facing Texte — das ist Content/Frontend-Verantwortung.
- **Niemals leere catch-Blöcke** — jeder catch MUSS loggen:
  ```typescript
  // SCHLECHT — Fehler unsichtbar, stundenlange Debug-Sessions
  catch { return Response.json({ error: "Internal server error" }, { status: 500 }); }

  // GUT — Fehler sofort sichtbar in Logs
  catch (error) {
    console.error(`[${endpoint}]`, error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
  ```

## Database Interaction
- ORM/Query builder for standard CRUD, raw SQL only for complex queries
- Always use transactions for multi-table writes
- N+1 prevention: use joins/includes, never query in loops
- Connection pooling: never create connections per request (Ausnahme: SQLite — single-connection by design)
- Migrations: forward-only in production, test up + down locally
- **Queries nie "aus dem Kopf" schreiben** — immer gegen Docs oder existierende Queries im Projekt verifizieren:
  - Vor dem Commit: Syntax gegen ORM/DB-Docs prüfen
  - Neue Query-Patterns → mindestens einen Unit-Test der die Where-Clause verifiziert
  - Bei Unsicherheit: existierende Queries im Projekt als Vorlage nutzen, nicht raten
- **Stack-Beispiele:**
  - *Prisma:* `NOT: { field }` ist ungültig → `{ field: { not: value } }` für Feld-Level-Negation. Verschachtelte `where` mit `some`/`every`/`none` gegen Docs prüfen.
  - *Drizzle:* `where(eq(...))` Syntax, Builder-Pattern für komplexe Queries
  - *Raw SQL (better-sqlite3, pg):* Prepared Statements mit `?` oder `$1` Platzhaltern, nie Template-Literals für Werte

## Contract-Aktualisierung (HARD RULE)
- **Neuer API-Endpoint → API-Contract aktualisieren** (`docs/contracts/api-v1.yaml` oder äquivalent)
- **Neue WebSocket-Message → WS-Contract aktualisieren** (`docs/contracts/websocket-v1.yaml` oder äquivalent)
- **Geändertes Response-Schema → Contract aktualisieren**
- Contracts sind die Source of Truth für Frontend-Integration und QA-Contract-Tests
- Kein Backend-Commit mit neuen Endpoints ohne Contract-Update

## Third-Party API Integration
- **Webhook Receiver:**
  - Signature-Verification (HMAC-SHA256) BEVOR Payload verarbeitet wird
  - Idempotency: Event-ID speichern, doppelte Events ignorieren (`processed_webhooks` Tabelle oder Cache)
  - Schema-Validation: Payload mit Zod validieren bevor Business-Logik startet
  - Response sofort (200 OK), Verarbeitung async (Queue oder Background-Job)
  - Fehlerhafte Webhooks loggen (nicht 500 zurückgeben — Provider stoppt sonst Delivery)
- **Outbound API Calls (zu externen Services):**
  - Retry mit Exponential Backoff: 1s → 2s → 4s → max 3 Retries
  - Rate Limits des Providers respektieren (z.B. `Retry-After` Header auswerten)
  - Circuit Breaker: nach N konsekutiven Fehlern → Service als "down" markieren, Fallback nutzen
  - Timeout: max 10s pro Request, konfigurierbar
  - Niemals PII in Logs bei externen API-Calls (Request-/Response-Bodies filtern)
- **Sync-Strategie:**
  - Webhook-first, Polling als Fallback (für verpasste Events)
  - Conflict Resolution definieren: "Last Write Wins" oder "Source of Truth gewinnt"
  - Sync-Status pro Entity tracken (synced_at, sync_status, last_error)

## Testing
- Unit: business logic functions (no DB, no HTTP)
- Integration: API endpoints against real DB (Testcontainers, test DB, or in-memory DB)
- Contract: API spec validation for response shapes
- No mocking the database for integration tests
- **Beide Modi testen** wenn dev/production Mode-Split existiert
