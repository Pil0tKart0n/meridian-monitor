# NFR Assessment Checklist — Reference

> This file provides a systematic checklist for non-functional requirements elicitation.
> Walk through each category for every feature. Not all items apply — mark as N/A when irrelevant.
> Express all NFRs as measurable scenarios using the ASR format (Stimulus → Environment → Response → Measure).

---

## How to Use This Checklist

1. For each feature/epic, walk through all categories below
2. For each applicable item, write a measurable scenario
3. Assign priority: MUST / SHOULD / COULD
4. Hand off to the **Architect Skill** — they formalize as ASRs and SLOs
5. Hand off to **QA Test Engineer Skill** — they define how to test/verify

### NFR Scenario Format

```
Category:    [e.g. Performance]
Requirement: [plain language description]
Stimulus:    [what triggers the scenario]
Environment: [under what conditions]
Response:    [what the system does]
Measure:     [how we verify success]
Priority:    MUST | SHOULD | COULD
```

---

## 1. Performance

| # | Question | Typical measure | Priority guide |
|---|----------|----------------|----------------|
| P1 | What is the target response time for key user actions? | API: p95 ≤ Xms, UI: LCP ≤ Xs | MUST for user-facing |
| P2 | What throughput is expected? (requests/sec, events/sec) | N req/s under normal load | SHOULD |
| P3 | What is the expected concurrent user count? | N users at peak | MUST |
| P4 | Are there batch/bulk operations? What's the volume? | N items, completed in ≤ X minutes | SHOULD |
| P5 | What's the frontend bundle size budget? | ≤ X kB initial JS | SHOULD |
| P6 | What's the Time to Interactive target? | TTI ≤ Xs on 4G/mid-tier device | SHOULD for public |
| P7 | Are there real-time requirements? (WebSocket, SSE) | Latency ≤ Xms for updates | If applicable |

### Example Scenario

```
Category:    Performance
Requirement: Search results load quickly under normal conditions
Stimulus:    500 concurrent users submit search queries
Environment: Normal operation, production database with 1M products
Response:    Search results returned
Measure:     p95 response time ≤ 300ms, p99 ≤ 500ms
Priority:    MUST
```

---

## 2. Security

| # | Question | Typical measure | Priority guide |
|---|----------|----------------|----------------|
| S1 | What authentication is required? | JWT, OAuth2, MFA | MUST |
| S2 | What authorization model? (RBAC, ABAC, per-resource) | Roles defined, permissions tested | MUST |
| S3 | Is input validation required? (Which fields, what rules?) | All user input validated server-side | MUST |
| S4 | What data needs encryption at rest? | PII encrypted (AES-256) | MUST for PII |
| S5 | What data needs encryption in transit? | TLS 1.2+ for all connections | MUST |
| S6 | Are there CSRF/XSS/SQLi protections needed? | OWASP Top 10 mitigated | MUST |
| S7 | Rate limiting required? (Which endpoints, what limits?) | N requests/minute per user/IP | SHOULD |
| S8 | API key / secret management? | No hardcoded secrets, vault/env | MUST |
| S9 | Audit trail required? (Which actions?) | Sensitive actions logged with actor + timestamp | Compliance-dependent |
| S10 | Session management? (Timeout, concurrent sessions) | Session timeout, max N concurrent | SHOULD |

### Example Scenario

```
Category:    Security
Requirement: Brute force login protection
Stimulus:    Attacker attempts 100 login requests in 1 minute for a single account
Environment: Production, public-facing login endpoint
Response:    Account temporarily locked, user notified via email
Measure:     Lock after 5 failed attempts, 15-minute cooldown, alert triggered
Priority:    MUST
```

---

## 3. Privacy

| # | Question | Typical measure | Priority guide |
|---|----------|----------------|----------------|
| PR1 | What PII is collected? (List all fields) | PII inventory complete | MUST |
| PR2 | Is explicit consent required? (GDPR Art. 6/7) | Consent mechanism, opt-in | MUST for EU |
| PR3 | Data retention policy? (How long, then what?) | Retention period defined, auto-delete | MUST for EU |
| PR4 | Right to deletion? (GDPR Art. 17) | Deletion API/process, cascading | MUST for EU |
| PR5 | Right to data export? (GDPR Art. 20) | Export in machine-readable format | SHOULD for EU |
| PR6 | Data residency requirements? | Data stored in [region] | Compliance-dependent |
| PR7 | Third-party data sharing? (Who gets what?) | Data processing agreements | MUST if sharing |
| PR8 | PII in logs/traces/errors? | No PII in logs, masked in errors | MUST |
| PR9 | Cookie policy? (Essential vs. tracking) | Cookie consent banner, classification | MUST for EU |
| PR10 | Data minimization? (Collect only what's needed) | Each field justified | SHOULD |

### Example Scenario

```
Category:    Privacy
Requirement: User can delete their account and all associated data
Stimulus:    User requests account deletion via settings page
Environment: Normal operation, user authenticated
Response:    Account soft-deleted immediately, hard-deleted after 30-day grace period
Measure:     All PII removed from primary DB within 30 days, removed from backups within 90 days
Priority:    MUST (GDPR Art. 17)
```

---

## 4. Accessibility

| # | Question | Typical measure | Priority guide |
|---|----------|----------------|----------------|
| A1 | WCAG conformance level? | WCAG 2.2 AA (default) | MUST for public |
| A2 | Keyboard navigable? (All interactive elements) | Tab, Enter, Escape, Arrow keys work | MUST |
| A3 | Screen reader compatible? | Semantic HTML, ARIA labels, live regions | MUST for public |
| A4 | Color contrast? | 4.5:1 text, 3:1 large text/UI components | MUST |
| A5 | Focus management? | Visible focus indicator, logical focus order | MUST |
| A6 | Reduced motion? | `prefers-reduced-motion` respected | SHOULD |
| A7 | Text resizing? | Content usable at 200% zoom | SHOULD |
| A8 | Error identification? | Errors linked to fields, announced to SR | MUST |
| A9 | Form labels? | All inputs labeled (visible or aria-label) | MUST |
| A10 | Image alt text? | All images have appropriate alt text | MUST |

### Example Scenario

```
Category:    Accessibility
Requirement: Registration form is fully accessible
Stimulus:    Screen reader user navigates registration form
Environment: VoiceOver on macOS, latest Chrome
Response:    All fields announced with labels, errors announced on submit, success confirmed
Measure:     vitest-axe passes, manual screen reader test passes, keyboard-only completion possible
Priority:    MUST
```

---

## 5. Reliability

| # | Question | Typical measure | Priority guide |
|---|----------|----------------|----------------|
| R1 | SLO target? (Availability) | 99.9% (43.8 min downtime/month) | MUST |
| R2 | Acceptable error rate? | < 0.1% of requests return 5xx | MUST |
| R3 | Degradation strategy? | Graceful degradation defined per feature | SHOULD |
| R4 | Retry behavior? (Which operations, how many retries?) | Exponential backoff, max N retries | SHOULD |
| R5 | Idempotency? (Which operations must be idempotent?) | POST with idempotency key, safe retries | MUST for payments |
| R6 | Data consistency model? (Strong, eventual?) | Defined per operation | SHOULD |
| R7 | Backup & restore? | RPO ≤ X hours, RTO ≤ Y hours | MUST for production |
| R8 | Failover strategy? | Automated failover, tested quarterly | SHOULD |
| R9 | Circuit breaker for external services? | Defined per integration | SHOULD |
| R10 | Health checks? | Liveness + readiness probes defined | MUST for K8s |

### Example Scenario

```
Category:    Reliability
Requirement: Checkout remains functional during payment provider outage
Stimulus:    Payment provider returns 503 for all requests
Environment: Production, peak traffic
Response:    System queues payment for retry, shows "payment processing" to user
Measure:     No orders lost, user notified within 5 minutes, payments processed within 1 hour of recovery
Priority:    MUST
```

---

## 6. Observability

| # | Question | Typical measure | Priority guide |
|---|----------|----------------|----------------|
| O1 | What metrics to collect? | Business metrics + technical metrics | MUST |
| O2 | What to log? (And at what level?) | Structured JSON, request context | MUST |
| O3 | Distributed tracing required? | requestId propagated end-to-end | SHOULD |
| O4 | What alerts are needed? | Error rate spike, latency degradation, SLO breach | MUST |
| O5 | Dashboard requirements? | Key flows visualized, SLO burn rate | SHOULD |
| O6 | Log retention period? | 30 days hot, 90 days cold (example) | Compliance-dependent |
| O7 | What analytics events to track? | User behavior events for product decisions | SHOULD |
| O8 | Error tracking? | Sentry/similar with grouping + context | MUST |

### Example Scenario

```
Category:    Observability
Requirement: Search performance is continuously monitored
Stimulus:    Search p95 latency exceeds SLO (300ms) for 5 minutes
Environment: Production
Response:    Alert fires in PagerDuty, dashboard shows degradation
Measure:     Alert within 2 minutes of threshold breach, includes requestId sample for debugging
Priority:    MUST
```

---

## 7. Scalability

| # | Question | Typical measure | Priority guide |
|---|----------|----------------|----------------|
| SC1 | Expected user growth? (6 months, 1 year, 3 years) | Growth curve / targets | SHOULD |
| SC2 | Data growth rate? | GB/month, rows/day | SHOULD |
| SC3 | Peak vs. average load ratio? | Peak = Nx average | SHOULD |
| SC4 | Horizontal scaling possible? | Stateless services, shared-nothing | SHOULD |
| SC5 | Database scaling strategy? | Read replicas, sharding triggers | COULD for MVP |
| SC6 | Cost scaling model? | Cost grows sub-linearly with users | COULD |

---

## 8. Compliance

| # | Question | Typical measure | Priority guide |
|---|----------|----------------|----------------|
| C1 | GDPR applicable? | Data processing register, DPO, consent | MUST for EU |
| C2 | Industry-specific regulations? | PCI-DSS, HIPAA, SOC2, etc. | Compliance-dependent |
| C3 | Audit logging requirements? | Sensitive actions logged immutably | Compliance-dependent |
| C4 | Data residency? | Data must stay in [region] | Compliance-dependent |
| C5 | Accessibility legislation? | EAA, Section 508, EN 301 549 | MUST for public in EU |
| C6 | Cookie/tracking regulations? | ePrivacy, TTDSG | MUST for EU |

---

## Quick Assessment Template

For each feature, fill in this summary:

```markdown
## NFR Assessment: [Feature Name]

| Category | Applicable? | Key requirement | Priority | Scenario ref |
|----------|------------|-----------------|----------|-------------|
| Performance | ✅ | p95 ≤ 200ms, 500 concurrent users | MUST | NFR-P1 |
| Security | ✅ | Auth required, input validation | MUST | NFR-S1, S3 |
| Privacy | ✅ | PII: email, name. GDPR consent needed | MUST | NFR-PR1 |
| Accessibility | ✅ | WCAG 2.2 AA | MUST | NFR-A1 |
| Reliability | ✅ | 99.9% SLO | MUST | NFR-R1 |
| Observability | ✅ | Structured logging, error tracking | MUST | NFR-O1 |
| Scalability | ⚠️ | 10x growth in 12 months | SHOULD | NFR-SC1 |
| Compliance | ✅ | GDPR, EAA | MUST | NFR-C1, C5 |
```

---

## Default NFR Stance

When the user provides no explicit NFRs, apply these defaults:

| Category | Default | Rationale |
|----------|---------|-----------|
| Performance | p95 ≤ 500ms for API, LCP ≤ 2.5s for pages | Acceptable baseline for most web apps |
| Security | Auth required for non-public routes, OWASP Top 10 mitigated | Non-negotiable baseline |
| Privacy | No PII in logs, GDPR basics if EU users possible | Safe default |
| Accessibility | WCAG 2.2 AA | Legal requirement in EU (EAA), ethical baseline |
| Reliability | 99.9% availability target | Reasonable for most SaaS |
| Observability | Structured logging + error tracking | Minimum for debugging |
| Scalability | Design for 10x current load | Don't over-engineer, don't paint yourself into a corner |

**Always state defaults explicitly** so the user can override them.
