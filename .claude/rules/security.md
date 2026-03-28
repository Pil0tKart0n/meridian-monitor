# Security Rules

## Secrets
- NEVER commit secrets, API keys, tokens, or credentials to Git
- Use environment variables (`.env.local`, never `.env` in repo)
- Server-side only: `process.env.SECRET` — never `NEXT_PUBLIC_` for secrets
- Rotate compromised secrets immediately

## Authentication
- Passwords: bcrypt/argon2, never MD5/SHA for passwords
- Tokens: short-lived JWT (15min) + refresh token (httpOnly cookie)
- Session: httpOnly, Secure, SameSite=Lax cookies
- MFA for admin/sensitive operations

## Headers (configured in next.config or middleware)
- `Content-Security-Policy`: strict, no `unsafe-eval`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Data Protection
- Minimize PII collection (only what's needed)
- Encrypt PII at rest (DB-level or application-level)
- Log access to sensitive data
- Implement data deletion/anonymization capability
- GDPR: consent before collection, right to deletion, data portability

## SSO / OIDC (wenn externes Identity Provider genutzt wird)
- **OIDC Discovery:** `/.well-known/openid-configuration` Endpoint des Providers nutzen, nie URLs hardcoden
- **Token-Validation:** `iss` (Issuer), `aud` (Audience/Client-ID), `exp` (Expiry), `nonce` prüfen
- **Claim-Mapping:** Provider-Claims (z.B. `groups`, `roles`) auf App-Rollen mappen — Mapping in Config, nicht im Code
- **Logout:** Front-Channel Logout (Redirect) + Session invalidieren. Back-Channel Logout wenn Provider es unterstützt
- **PKCE:** Authorization Code Flow mit PKCE (Proof Key for Code Exchange) — kein Implicit Flow
- **State-Parameter:** CSRF-Schutz bei OAuth Redirects — `state` generieren, nach Callback verifizieren
- **Refresh Tokens:** Server-side speichern (httpOnly Cookie oder DB), nie im Client/LocalStorage

## Audit Logging (bei regulierten Projekten — DSGVO, SOC2, etc.)
- **Audit-Schema:** who (user_id + email), what (action), when (UTC timestamp), where (resource_type + resource_id), result (before/after JSON)
- **Immutability:** Audit-Tabelle ist INSERT-only — kein UPDATE, kein DELETE, kein TRUNCATE
- **Retention Policy:** Mindestens 1 Jahr, max per DSGVO Art. 17 (Recht auf Löschung betrifft NICHT Audit-Logs die zur Compliance nötig sind)
- **Was loggen:** Auth-Events (login/logout/failed), Daten-Zugriff auf PII, Berechtigungsänderungen, Admin-Aktionen
- **Was NICHT loggen:** Passwörter, Tokens, vollständige Request-Bodies mit PII
- **Middleware-Pattern:** Zentrale Audit-Middleware, nicht verstreute `auditLog()` Calls in jedem Handler

## Dependencies
- No `npm install` without checking the package (typosquatting risk)
- Lock file (`package-lock.json`) always committed
- `npm audit` as part of CI — no high/critical vulnerabilities
