# Security Architecture Reference

> Security design patterns, auth strategies, threat modeling templates, and compliance checklists.
> Read this when designing security for a system or making auth decisions.

---

## 1. Authentication Strategies — Decision Matrix

### Token-Based (JWT) — Default for Modern Web Apps

| Aspect | Access Token | Refresh Token | ID Token (OIDC) |
|--------|-------------|---------------|-----------------|
| **Purpose** | Authorize API requests | Obtain new access token | User identity claims |
| **Lifetime** | Short (15 min) | Long (7 days) | Short (1 hour) |
| **Storage** | Memory (SPA) or httpOnly cookie | httpOnly, Secure, SameSite cookie | Memory only, used at login |
| **Format** | JWT (signed, not encrypted) | Opaque or JWT | JWT |
| **Rotation** | Not rotated (expires) | Rotated on each use | Not rotated |
| **Revocation** | Not revocable (short-lived) | Revocable (stored in DB) | Not needed |

**JWT Claims (access token):**
```json
{
  "sub": "user_abc123",
  "iss": "https://auth.myapp.com",
  "aud": "https://api.myapp.com",
  "exp": 1740000000,
  "iat": 1739999100,
  "roles": ["customer"],
  "tenant_id": "tenant_xyz"
}
```

**Rules:**
- Never store access tokens in localStorage (XSS vulnerable).
- SPA: keep access token in memory. Use refresh cookie for persistence.
- Validate JWT on every request: signature, `exp`, `iss`, `aud`.
- Include minimal claims. No PII beyond user ID.

### Session-Based — For Server-Rendered Apps

| Aspect | Detail |
|--------|--------|
| **Mechanism** | Server stores session in DB/Redis. Client gets session cookie. |
| **Storage** | httpOnly, Secure, SameSite=Lax cookie |
| **Revocation** | Immediate (delete session from store) |
| **Scalability** | Needs shared session store for multiple instances |
| **Use when** | Server-rendered apps, need immediate revocation, simpler model |

### OAuth 2.0 + OIDC — When to Use

| Flow | Use when | Frontend role | Backend role |
|------|----------|--------------|-------------|
| **Authorization Code + PKCE** | User login via third-party (Google, GitHub) or own IdP | Initiates flow, handles callback | Exchanges code for tokens, validates |
| **Client Credentials** | Machine-to-machine (service-to-service) | N/A | Both client and server |
| **Device Flow** | Smart TVs, CLI tools (no browser) | Shows code to user | Polls for token |

**PKCE is mandatory** for all public clients (SPAs, mobile apps). No implicit flow.

### API Keys — Service-to-Service

| Aspect | Detail |
|--------|--------|
| **Format** | Random string, prefixed (e.g. `sk_live_...`, `pk_test_...`) |
| **Storage** | Hash in DB (bcrypt/argon2). Never store plaintext. |
| **Transport** | Header: `Authorization: Bearer sk_live_...` or `X-API-Key: ...` |
| **Rotation** | Support multiple active keys for zero-downtime rotation |
| **Scope** | Each key has explicit permissions (read/write/admin) |
| **Use when** | Third-party integrations, webhook verification, internal service auth |

---

## 2. Authorization Models

### RBAC (Role-Based Access Control) — Default

```
User → has Role(s) → Role has Permission(s) → Permission grants Access
```

| Role | Permissions | Example |
|------|------------|---------|
| `customer` | `orders:read`, `orders:create`, `profile:read`, `profile:update` | Regular user |
| `support` | `orders:read`, `users:read`, `tickets:*` | Support agent |
| `admin` | `*:*` | Full access |

**Implementation:**
- Roles stored in JWT claims or session.
- Permission check in middleware: `require_permission("orders:create")`.
- Backend validates on every request. Frontend checks for UI display only (not security).

### ABAC (Attribute-Based Access Control)

```
Access = f(Subject attributes, Resource attributes, Action, Environment)
```

**Example policy:** "A user can edit an order if they are the order owner AND the order status is PENDING AND it's within 24 hours of creation."

**When:** RBAC is insufficient because access depends on resource attributes or context.
**Implementation:** Policy engine (OPA, Cedar) or custom middleware.

### ReBAC (Relationship-Based Access Control)

```
User → has Relationship → to Resource → grants Permission
```

**Inspired by:** Google Zanzibar (used in Google Docs, Drive).
**Example:** "User A can edit Document X because User A is a member of Team Y which has editor access to Document X."

**When:** Collaboration features, document sharing, complex organizational hierarchies.
**Implementation:** Dedicated authorization service (SpiceDB, Ory Keto, AuthZed).

---

## 3. Threat Modeling

### When to Threat Model

- New service or major feature
- New data flow (especially with PII, financial, health data)
- Auth model changes
- New external integration
- Incident with security root cause

### Lightweight Threat Model Template

```markdown
# Threat Model: [Service/Feature Name]

## Date: YYYY-MM-DD
## Author: [Name]
## Scope: [What's included / excluded]

## 1. Assets (What are we protecting?)
- User PII (email, name, address)
- Payment tokens (Stripe customer IDs)
- Session data
- Business data (orders, products)
- API keys and secrets

## 2. Actors (Who interacts with the system?)
- Authenticated users (customers)
- Unauthenticated visitors
- Admin users
- External services (Stripe, SendGrid)
- Internal services (worker, scheduler)
- Potential attackers (external, insider)

## 3. Entry Points
| Entry Point | Protocol | Auth Required | Data Sensitivity |
|-------------|----------|--------------|-----------------|
| Public API `/api/v1/*` | HTTPS | Yes (JWT) | High (PII, orders) |
| Admin API `/admin/*` | HTTPS | Yes (JWT + admin role) | High (all data) |
| Webhook `/webhooks/stripe` | HTTPS | Signature verification | Medium (payment events) |
| Background worker | Queue (Redis) | Internal only | Medium |

## 4. Trust Boundaries
```
[Internet] ──TLS──> [API Gateway] ──internal──> [API Service] ──TLS──> [Database]
                         │                           │
                    Rate limiting              Auth validation
                    IP allowlist (admin)       Input validation
```

## 5. Threats (STRIDE)

| Category | Threat | Entry Point | Impact | Likelihood | Risk | Mitigation |
|----------|--------|-------------|--------|------------|------|------------|
| **S**poofing | Stolen JWT used by attacker | Public API | High | Medium | High | Short token lifetime (15min), refresh rotation, token binding |
| **T**ampering | Modified request body | Public API | High | Low | Medium | Input validation (Pydantic/Zod), integrity checks |
| **R**epudiation | User denies placing order | Public API | Medium | Low | Low | Audit log with requestId, user action logging |
| **I**nfo Disclosure | PII leaked in logs | All | High | Medium | High | PII scrubbing in logs, no PII in error messages |
| **D**enial of Service | API overwhelmed | Public API | High | Medium | High | Rate limiting, auto-scaling, CDN caching |
| **E**levation | Customer accesses admin API | Admin API | Critical | Low | High | RBAC, separate admin auth, IP allowlist |

## 6. Mitigations Applied
- [ ] Rate limiting: 100 req/min per user, 1000 req/min per IP
- [ ] JWT validation on every request (signature, expiry, audience)
- [ ] Input validation at API boundary (Pydantic models)
- [ ] PII scrubbed from all log output
- [ ] Admin API behind VPN / IP allowlist
- [ ] Webhook signature verification (Stripe)
- [ ] CORS restricted to frontend domain
- [ ] CSP headers configured

## 7. Residual Risks
- Insider threat (trusted employee) → Mitigated by audit logging + least privilege
- Zero-day in dependency → Mitigated by SCA scanning in CI + Dependabot
```

### STRIDE Categories

| Letter | Threat | Counter |
|--------|--------|---------|
| **S** | Spoofing (pretending to be someone else) | Authentication |
| **T** | Tampering (modifying data) | Integrity checks, input validation |
| **R** | Repudiation (denying actions) | Audit logging |
| **I** | Information Disclosure (leaking data) | Encryption, access control, PII handling |
| **D** | Denial of Service (making it unavailable) | Rate limiting, scaling, CDN |
| **E** | Elevation of Privilege (gaining unauthorized access) | Authorization, least privilege |

---

## 4. Security Headers (Full List)

These headers should be set on every HTTP response:

```
# Transport Security
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

# Content Security
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.myapp.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY

# Information Leakage Prevention
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()

# Cache Control (for authenticated responses)
Cache-Control: no-store, no-cache, must-revalidate, private
Pragma: no-cache
```

**Notes:**
- CSP: Start with `Content-Security-Policy-Report-Only` in staging, then enforce.
- HSTS: Only set after confirming HTTPS works everywhere. `preload` is permanent.
- Architect defines the header policy. Backend implements. Frontend validates (no violations).

---

## 5. Secrets Management

### Rules (Non-Negotiable)

1. **Never** commit secrets to Git. Not even in "test" branches.
2. **Never** bake secrets into Docker images or CI/CD configuration.
3. **Never** pass secrets as command-line arguments (visible in process list).
4. **Never** log secrets (even accidentally in debug mode).

### Secrets Hierarchy

| Type | Storage | Rotation | Example |
|------|---------|----------|---------|
| **API keys (external)** | Secret manager (Vault, AWS SM) | Per provider policy, min annually | Stripe API key |
| **Database credentials** | Secret manager, injected at runtime | Quarterly or on compromise | PostgreSQL password |
| **JWT signing key** | Secret manager, loaded at startup | Annually or on compromise | RS256 private key |
| **Encryption keys** | KMS (AWS KMS, GCP KMS) | Per policy, auto-rotation preferred | Data encryption key |
| **Service-to-service** | mTLS certs or API keys in secret manager | Auto-rotation (cert-manager) | Internal service auth |

### Secret Injection Pattern

```
Secret Manager (Vault / AWS SM / GCP SM)
       │
       ▼
Environment Variable (injected at container start)
       │
       ▼
Application reads at startup (never from disk)
```

**In Kubernetes:** Use External Secrets Operator or CSI Secret Store Driver. Never store secrets in ConfigMaps.

---

## 6. Data Protection Patterns

### Encryption Strategy

| Layer | Mechanism | When |
|-------|-----------|------|
| **In Transit** | TLS 1.3 (minimum TLS 1.2) | Always. Every connection. No exceptions. |
| **At Rest** | AES-256 (disk encryption, DB encryption) | All persistent storage in production. |
| **Application-Level** | Field-level encryption (AES-256-GCM) | Highly sensitive fields (SSN, health data, payment tokens) |

### PII Handling Rules

- **Logs:** Never log PII. Use user IDs, not names/emails. If PII must appear → redact or mask.
- **Error messages:** Never include PII in error responses to clients.
- **Analytics:** Anonymize or pseudonymize before sending to analytics services.
- **Caching:** No PII in shared caches (CDN, shared Redis). User-scoped cache only.
- **Backups:** Encrypted. Same retention policy as live data.
- **Data transfer:** Document all cross-border data transfers (GDPR requirement).

### Right to Deletion (GDPR Art. 17)

Design data model to support deletion:
- User data in dedicated tables/columns (not mixed with operational data)
- Soft delete → hard delete after grace period
- Cascade deletion to all related data (orders → anonymize, logs → purge PII)
- Third-party data: API call to delete (Stripe, SendGrid, analytics)
- Backup data: document retention period (data may persist in backups until backup expires)

---

## 7. Compliance Checklists

### GDPR / DSGVO (EU Data Protection)

| Requirement | Technical Implementation |
|-------------|------------------------|
| **Lawful basis** | Consent management UI + storage |
| **Data minimization** | Collect only what's needed. Review fields quarterly. |
| **Purpose limitation** | Tag data with purpose. Don't repurpose without consent. |
| **Storage limitation** | Retention policies + automated deletion |
| **Right to access** | Data export API (JSON/CSV) |
| **Right to delete** | Deletion API + cascade logic |
| **Right to portability** | Machine-readable export (JSON) |
| **Data breach notification** | Incident process, 72-hour notification |
| **Privacy by design** | Encryption, pseudonymization, access controls |
| **DPA with processors** | Legal agreement with all data processors (cloud, SaaS) |

### SOC 2 (Trust Service Criteria)

| Principle | Key Technical Controls |
|-----------|----------------------|
| **Security** | Access controls, encryption, vulnerability management, incident response |
| **Availability** | SLOs, redundancy, disaster recovery, capacity planning |
| **Confidentiality** | Data classification, encryption, access logging |
| **Processing Integrity** | Input validation, error handling, monitoring |
| **Privacy** | Consent, data minimization, retention, deletion |

### PCI DSS (Payment Card Data)

**Strategy: Minimize scope.** Use Stripe/Adyen/Braintree to handle card data. Your system never sees raw card numbers.

| Control | Implementation |
|---------|---------------|
| **Never store card numbers** | Use payment provider tokenization |
| **Network segmentation** | Payment service in isolated network segment |
| **Strong access control** | MFA for payment admin, audit logging |
| **Monitoring** | Log all access to payment-related data |
| **Vulnerability management** | Regular scanning of payment-adjacent services |

---

## 8. Security Review Checklist

Use during architecture reviews for security-sensitive changes:

```markdown
### Authentication
- [ ] Auth mechanism defined (JWT / Session / API Key)
- [ ] Token lifetime appropriate (access: ≤15min, refresh: ≤7d)
- [ ] Token storage secure (httpOnly cookie / memory, not localStorage)
- [ ] Token validation on every request
- [ ] Refresh token rotation implemented

### Authorization
- [ ] Authorization model defined (RBAC / ABAC / ReBAC)
- [ ] Permissions checked on every endpoint (not just UI)
- [ ] Admin endpoints restricted (role + network level)
- [ ] No horizontal privilege escalation (user A accessing user B's data)

### Input Validation
- [ ] All external input validated at boundary
- [ ] No SQL injection vectors (parameterized queries / ORM)
- [ ] No XSS vectors (output encoding, CSP)
- [ ] File upload restrictions (type, size, scanning)
- [ ] Rate limiting on auth endpoints and public APIs

### Data Protection
- [ ] Data classification applied
- [ ] PII handling rules followed (no PII in logs/errors/caches)
- [ ] Encryption in transit (TLS 1.2+) and at rest (AES-256)
- [ ] Secrets managed via secret manager (not env files or git)

### Supply Chain
- [ ] Dependency scanning in CI (SCA)
- [ ] SBOM generated
- [ ] Docker images scanned
- [ ] Base images pinned to digest

### Operational
- [ ] Security headers configured
- [ ] CORS restricted to allowed origins
- [ ] Audit logging for sensitive actions
- [ ] Incident response plan includes security incidents
```

---

## 9. Zero Trust Architecture Principles

1. **Never trust, always verify** — every request is authenticated and authorized, even internal.
2. **Least privilege** — grant minimum permissions needed. Review quarterly.
3. **Assume breach** — design as if the network is already compromised. Encrypt everything.
4. **Microsegmentation** — services can only talk to services they need to talk to. Network policies enforce this.
5. **Continuous verification** — don't just auth at the edge. Verify at every service boundary.
6. **Audit everything** — who accessed what, when, from where. Immutable audit logs.
