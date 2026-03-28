# ADR & RFC Templates Reference

> Templates and examples for Architecture Decision Records and Requests for Comments.
> Read this when writing any ADR, RFC, or architecture proposal.

---

## 1. ADR Template

```markdown
# ADR-NNN: [Short Decision Title]

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-NNN]

## Date

YYYY-MM-DD

## Context

[What is the problem? What forces are at play?
Include NFRs, team constraints, technical debt, user needs.
2–5 sentences. Be specific — name technologies, numbers, constraints.]

## Decision

[What did we decide? Be concrete.
"We will use X because Y" — not just "We chose X".]

## Alternatives Considered

### Alternative A: [Name]
- **Pros:** ...
- **Cons:** ...
- **Why rejected:** ...

### Alternative B: [Name]
- **Pros:** ...
- **Cons:** ...
- **Why rejected:** ...

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Trade-off 1] → Mitigation: [how]
- [Trade-off 2] → Mitigation: [how]

### Risks
- [Risk 1] → Likelihood: [L/M/H], Impact: [L/M/H], Mitigation: [plan]

## Re-evaluation Trigger

[When should this decision be revisited?
E.g. "When team exceeds 8 engineers", "When traffic exceeds 10k RPS",
"When contract with Provider X ends", "Q3 2026 review".]

## Related
- Links to RFCs, Jira tickets, contracts, diagrams
```

---

## 2. ADR Examples

### Example: Database Selection

```markdown
# ADR-001: PostgreSQL as Primary Database

## Status
Accepted

## Date
2026-01-15

## Context
We are starting a new e-commerce platform (MVP, team of 5).
Requirements: ACID transactions for orders, full-text product search,
JSON storage for flexible product attributes, future AI feature (vector search).
Expected scale: 10k users in Year 1, 100k in Year 3.

## Decision
PostgreSQL 17 as the sole database. We will use:
- Standard relational tables for orders, users, payments
- `tsvector` for product search (sufficient for MVP scale)
- `jsonb` columns for flexible product attributes
- pgvector extension reserved for future AI features

We will NOT add Elasticsearch or Redis at MVP stage.

## Alternatives Considered

### Alternative A: PostgreSQL + Redis + Elasticsearch
- **Pros:** Dedicated tools for caching and search
- **Cons:** 3 systems to operate, sync complexity, higher cost
- **Why rejected:** Premature optimization. PostgreSQL handles all three needs
  at our current scale. Add specialized tools when PostgreSQL bottlenecks appear.

### Alternative B: MongoDB
- **Pros:** Flexible schema, horizontal scaling
- **Cons:** No ACID for multi-document transactions (needed for orders),
  team has no MongoDB experience, PostgreSQL jsonb covers flexible schema needs
- **Why rejected:** ACID requirement for orders + team expertise in PostgreSQL

## Consequences

### Positive
- Single database to operate, monitor, back up
- Team already proficient in PostgreSQL
- Clear upgrade path (add Redis when caching needed, add Elasticsearch when search outgrows tsvector)

### Negative
- Full-text search less powerful than Elasticsearch → Mitigation: sufficient for MVP, monitor query performance
- No dedicated cache layer → Mitigation: PostgreSQL with proper indexing handles MVP load; add Redis when p95 exceeds 200ms

### Risks
- Search quality insufficient for complex faceted queries → L: Low, I: Medium, Mitigation: Elasticsearch migration path documented

## Re-evaluation Trigger
- Product search query p95 exceeds 200ms
- Cache-worthy endpoints identified via observability (>50 RPS on same data)
- Team grows beyond 8 engineers
```

### Example: Architecture Style

```markdown
# ADR-002: Modular Monolith Architecture

## Status
Accepted

## Date
2026-01-15

## Context
Team of 5 engineers building an e-commerce MVP. Timeline: 3 months to launch.
Domain boundaries are not yet clear — we have hypotheses about Orders, Users,
Products, Payments but expect them to evolve.
No requirement for independent deployment per domain yet.

## Decision
Modular Monolith with Hexagonal Architecture (Ports & Adapters).
- Single deployable (FastAPI application)
- Internal modules per bounded context (orders, users, products, payments)
- Each module has its own DB schema (e.g. `orders.*`, `users.*`)
- Modules communicate via defined interfaces (function calls + domain events)
- No direct cross-module DB access

## Alternatives Considered

### Alternative A: Microservices from Day 1
- **Pros:** Independent deployment, technology diversity
- **Cons:** Massive overhead for 5 engineers (networking, tracing, deployment per service,
  data consistency), domain boundaries unclear (will split wrong)
- **Why rejected:** Team too small, domain too unclear. Microservices are earned, not assumed.

### Alternative B: Traditional Monolith (no module boundaries)
- **Pros:** Simplest to build initially
- **Cons:** Becomes unmaintainable fast, harder to extract services later,
  no clear ownership boundaries
- **Why rejected:** Module boundaries are cheap to add now and expensive to add later.

## Consequences

### Positive
- Fast development (single process, simple debugging)
- Clear migration path (module = future service boundary)
- Module boundaries enforce clean domain separation early
- Easy to operate (single deployment, single DB, simple CI/CD)

### Negative
- Cannot deploy modules independently → Mitigation: acceptable at current team size
- Shared database (coupling risk) → Mitigation: schema-per-module, no cross-schema joins

### Risks
- Module boundaries violated over time → L: Medium, I: High, Mitigation: ArchUnit-style fitness functions, PR review checklist

## Re-evaluation Trigger
- Team grows beyond 8 engineers
- A module needs different scaling characteristics
- A module needs independent release cadence
- Module boundary violation rate exceeds 5% of PRs
```

### Example: API Versioning

```markdown
# ADR-003: URL-Based API Versioning with Sunset Headers

## Status
Accepted

## Date
2026-01-20

## Context
Our API serves a React SPA (internal) and will serve mobile apps in Q3.
We need a versioning strategy before adding the second client.
Team is 5 engineers, all full-stack. We want simplicity over sophistication.

## Decision
URL-based versioning: `/api/v1/orders`, `/api/v2/orders`.
- Major version in URL path for breaking changes only
- Additive (non-breaking) changes: no version bump needed
- Deprecation: Sunset header on deprecated endpoints, minimum 6 months notice
- Maximum 2 active versions at any time

## Alternatives Considered

### Alternative A: Header-Based Versioning
- **Pros:** Cleaner URLs, content negotiation
- **Cons:** Harder to test (need to set headers), less visible, more complex routing
- **Why rejected:** Simplicity wins for our team size and client count

### Alternative B: No Versioning (additive only)
- **Pros:** Simplest
- **Cons:** Some changes are genuinely breaking (field type changes, semantic changes)
- **Why rejected:** Need at least a path for breaking changes

## Consequences

### Positive
- Easy to test (just change URL)
- Visible in logs and monitoring
- Clear contract per version (OpenAPI spec per version)

### Negative
- URL pollution if many versions → Mitigation: max 2 active versions, aggressive deprecation
- Clients must update URLs for new versions → Mitigation: SDK / API client wrapper

## Re-evaluation Trigger
- More than 10 external API consumers
- Need for fine-grained versioning (per-field, per-endpoint)
```

---

## 3. ADR Lifecycle

```
Proposed → Accepted → [Active] → Deprecated → Superseded (by ADR-NNN)
```

| Status | Meaning |
|--------|---------|
| **Proposed** | Under review, not yet decided |
| **Accepted** | Active decision, currently in effect |
| **Deprecated** | Still in effect but planned for replacement |
| **Superseded** | Replaced by a newer ADR (link to successor) |

**Storage:** `/docs/adr/` with sequential numbering (`001-`, `002-`, ...).
**Review:** Every ADR requires at least one reviewer before acceptance.

---

## 4. RFC Template

For larger proposals that need team discussion before becoming an ADR.

```markdown
# RFC-NNN: [Proposal Title]

## Author(s)
[Name(s)]

## Date
YYYY-MM-DD

## Status
[Draft | Under Review | Accepted | Rejected | Withdrawn]

## Summary
[1–2 paragraphs: What is proposed and why? What problem does it solve?]

## Problem Statement
[Detailed description of the problem. Include data, user impact, cost, risk.
Why is the current state unacceptable?]

## Proposed Solution

### Overview
[High-level description of the solution]

### Design
[Technical design: diagrams, data flow, API changes, schema changes.
C4 diagrams (Mermaid), sequence diagrams as needed.]

### Migration Plan
[How do we get from current state to proposed state?
Phased rollout? Feature flag? Parallel running?]

### Rollback Plan
[How do we undo this if it goes wrong?]

## Alternatives Considered

### Alternative A: [Name]
[Description, pros, cons, why not chosen]

### Alternative B: [Name]
[Description, pros, cons, why not chosen]

## Impact Assessment

### Teams Affected
[Which teams need to change their code/process?]

### Performance Impact
[Expected latency/throughput/resource changes]

### Security Impact
[New attack surface? Data flow changes? Auth changes?]

### Cost Impact
[Infrastructure cost changes? Licensing? Team effort?]

## Open Questions
[Things not yet decided that need discussion]

## Timeline
[Proposed phases and dates]

## Success Criteria
[How do we know this worked? Measurable outcomes.]
```

---

## 5. Lightweight Decision Record

For smaller decisions that don't warrant a full ADR but should still be documented:

```markdown
## Decision: [One-line summary]

**Date:** YYYY-MM-DD
**Context:** [1–2 sentences]
**Decision:** [1–2 sentences]
**Reason:** [Why this over alternatives]
**Revisit when:** [Trigger condition]
```

**Use for:** Library choices within a layer, naming conventions, test strategy details, tooling picks.

---

## 6. Architecture Review Checklist

Use when reviewing a new service, feature, or significant change:

```markdown
## Architecture Review: [Feature/Service Name]

### Boundaries & Ownership
- [ ] Bounded context clearly defined
- [ ] Data ownership explicit (which service owns which entities)
- [ ] No cross-service direct DB access

### Contracts
- [ ] API contract defined (OpenAPI/AsyncAPI)
- [ ] Error envelope follows standard
- [ ] Contract versioned
- [ ] Contract tests exist (provider + consumer)

### Data Flow
- [ ] Data flow documented (especially for PII/sensitive data)
- [ ] Data classification applied
- [ ] Retention/deletion policy defined

### Security
- [ ] Threat model exists (at least lightweight)
- [ ] Auth/AuthZ defined
- [ ] Input validation at boundaries
- [ ] Secrets management via vault/secret manager
- [ ] No PII in logs

### Observability
- [ ] Structured logging with requestId
- [ ] SLOs defined (latency, error rate, availability)
- [ ] Alerts configured with runbooks
- [ ] Distributed tracing for cross-service flows

### Reliability
- [ ] Failure modes analyzed (what happens when X is down?)
- [ ] Timeouts, retries, circuit breakers for external calls
- [ ] Graceful degradation defined
- [ ] Rollback plan for deployment

### Performance
- [ ] Latency budget allocated
- [ ] Caching strategy defined (if applicable)
- [ ] Load testing planned (if applicable)

### Operations
- [ ] Runbook exists (deploy, rollback, incident)
- [ ] Health check endpoints defined
- [ ] Monitoring dashboard planned

### Documentation
- [ ] ADR for significant decisions
- [ ] C4 diagrams updated
- [ ] README updated
```

---

## 7. Deprecation Notice Template

```markdown
# Deprecation Notice: [What is deprecated]

## Date
YYYY-MM-DD

## What
[Specific endpoint, service, library, pattern being deprecated]

## Why
[Reason for deprecation — superseded, security issue, simplification]

## Replacement
[What to use instead. Link to documentation.]

## Timeline
- **Deprecation announced:** YYYY-MM-DD
- **Sunset header added:** YYYY-MM-DD
- **End of support:** YYYY-MM-DD (minimum 6 months from announcement)
- **Removal:** YYYY-MM-DD

## Migration Guide
[Step-by-step: how to migrate from old to new]

## Impact
[Who is affected? Which teams/services need to change?]

## Contact
[Who to reach out to with questions]
```
