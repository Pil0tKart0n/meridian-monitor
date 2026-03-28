# Architecture Patterns Reference

> Deep-dive reference for architecture styles, patterns, and decision frameworks.
> Read this when selecting patterns for system design.

---

## 1. Architecture Styles — Detailed Comparison

### Modular Monolith

**What:** Single deployment unit with strict internal module boundaries. Each module has its own package/namespace, data schema, and public API. Modules communicate via interfaces and domain events — never via direct DB access.

**When:**
- 1–3 teams, unclear or evolving domain boundaries, MVP / early stage
- Team wants fast iteration without distributed systems overhead
- Domain boundaries will emerge with time (extract later)

**Structure:**
```
app/
├── modules/
│   ├── orders/           # Bounded Context: Orders
│   │   ├── api/          # Public API (internal + external)
│   │   ├── domain/       # Entities, Value Objects, Events
│   │   ├── service/      # Use Cases / Application Services
│   │   ├── repository/   # Data access (schema: orders.*)
│   │   └── events/       # Published domain events
│   ├── billing/          # Bounded Context: Billing
│   │   └── ...
│   └── users/            # Bounded Context: Users
│       └── ...
├── shared/               # Shared kernel (minimal! auth primitives, base types)
├── infrastructure/       # Cross-cutting (DB, messaging, HTTP server)
└── main.py / main.ts     # Composition root
```

**Rules:**
- Each module owns its DB schema (e.g. `orders.*`, `billing.*`). No cross-schema joins.
- Public API of a module = exported functions/classes. Everything else is internal.
- Communication between modules: function calls (same process) or domain events (for decoupling).
- When a module becomes too large or a team needs independent deployment → extract to a service.

**Migration path to Microservices:**
1. Module already has clear interface → expose as HTTP/gRPC API
2. Replace in-process calls with network calls
3. Extract module's DB schema to its own database
4. Deploy independently

### Microservices

**What:** Many small, independently deployable services, each owning its data and domain.

**When:**
- Multiple teams (>3) working on the same system
- Domains are well-understood and stable
- Independent deployment cadence per domain is valuable
- Different scaling requirements per domain

**When NOT:**
- 1–2 teams (coordination overhead > benefit)
- Unclear domain boundaries (you'll split wrong and pay for it)
- Low complexity (a monolith is simpler and cheaper)

**Service Decomposition Strategies:**
- **By business capability:** Each service maps to a business function (Orders, Payments, Shipping)
- **By subdomain (DDD):** Each service maps to a bounded context
- **Strangler Fig:** Incrementally extract from monolith, one capability at a time

**Challenges to address upfront:**
- Service discovery and routing
- Distributed tracing (OpenTelemetry end-to-end)
- Data consistency (eventual consistency, sagas)
- Testing across services (contract tests mandatory)
- Deployment orchestration (CI/CD per service)
- Observability per service (SLOs, dashboards, alerts)

### Serverless / FaaS

**What:** Functions triggered by events (HTTP, queue, schedule, file upload). Managed scaling and billing per invocation.

**When:**
- Highly variable load (scale to zero, scale to thousands)
- Event-driven processing (file upload → process → store)
- Cost optimization for low-traffic workloads
- Quick prototyping / glue code

**When NOT:**
- Long-running processes (>15min)
- Consistent high throughput (always-on is cheaper)
- Complex state management across invocations
- Need for fine-grained infrastructure control

**Risks:**
- Cold starts (mitigate: provisioned concurrency, keep-warm)
- Vendor lock-in (mitigate: Ports & Adapters pattern, business logic in pure functions)
- Debugging difficulty (distributed, ephemeral)
- Cost unpredictability at scale

---

## 2. Architecture Patterns — Deep Dive

### Hexagonal Architecture (Ports & Adapters)

**Core idea:** Business logic is at the center. All external dependencies (DB, HTTP, queue, file system) are behind ports (interfaces) with swappable adapters.

```
          ┌─────────────────────┐
          │    HTTP Adapter      │ (Primary / Driving)
          │    CLI Adapter       │
          └──────────┬──────────┘
                     │
              ┌──────▼──────┐
              │              │
              │   DOMAIN     │  ← Pure business logic
              │   (Ports)    │  ← Interfaces for I/O
              │              │
              └──────┬───────┘
                     │
          ┌──────────▼──────────┐
          │   DB Adapter         │ (Secondary / Driven)
          │   Queue Adapter      │
          │   External API       │
          └─────────────────────┘
```

**When:** Systems where testability, swappability, and long-term maintainability matter.
**Architect role:** Mandate the pattern and define port interfaces. Backend implements adapters.

### Clean Architecture (Onion)

Same principle as Hexagonal, with explicit layers:

1. **Entities** — Enterprise business rules (domain objects)
2. **Use Cases** — Application business rules (orchestration)
3. **Interface Adapters** — Controllers, presenters, gateways
4. **Frameworks & Drivers** — DB, web, external services

**Dependency Rule:** Dependencies point inward. Inner layers never depend on outer layers.

### CQRS (Command Query Responsibility Segregation)

**What:** Separate the read model from the write model. Commands mutate state. Queries read optimized projections.

```
Command → Write Model → Event Store / DB
                              │
                         Projection
                              │
Query → Read Model (optimized for reads)
```

**When:**
- Read and write patterns are very different (many reads, few writes — or vice versa)
- Read model needs denormalized/pre-aggregated data
- Complex domain where write validation differs from read needs

**When NOT:**
- Simple CRUD with balanced read/write
- Small team unfamiliar with the pattern
- No clear performance or modeling benefit

**Variants:**
- **Simple CQRS:** Separate query and command handlers, same DB
- **CQRS + separate stores:** Write to normalized DB, project to read-optimized store (e.g. Elasticsearch, Redis)
- **CQRS + Event Sourcing:** Events as write model, projections as read models

### Event Sourcing

**What:** Instead of storing current state, store all events (facts) that led to current state. State is derived by replaying events.

**When:**
- Audit trail is a core requirement (financial, legal, compliance)
- Temporal queries ("what was the state on March 15?")
- Complex domain events are the natural model
- Need event replay for analytics, debugging, or migration

**When NOT:**
- Simple CRUD with no audit requirement
- Team has no experience with event sourcing
- Real-time read performance is critical and projections are complex to maintain

**Key challenges:**
- Event versioning (forward/backward compatibility mandatory)
- Projection rebuilds (can be slow for large event stores)
- Snapshot strategy (periodic snapshots to limit replay)

### Saga Pattern

**What:** Coordinate distributed transactions across services without a single atomic transaction.

**Orchestration Saga:**
- Central coordinator (Saga orchestrator) tells each service what to do
- Easier to understand, central visibility
- Risk: single point of coordination

**Choreography Saga:**
- Each service listens for events and reacts independently
- More decoupled, no central coordinator
- Risk: hard to debug, implicit flow

**When to choose:**
- **Orchestration:** Complex flows (>3 steps), need central monitoring, team prefers explicit control
- **Choreography:** Simple flows (2–3 steps), high autonomy, services already event-driven

**Compensation:**
Every saga step must have a compensation action (undo). If step 3 fails → compensate step 2 → compensate step 1.

### Strangler Fig Pattern

**What:** Incrementally replace a legacy system by routing requests through a façade. New functionality goes to the new system; old functionality is migrated over time.

```
Client → Façade/Proxy → New System (new routes)
                      → Legacy System (remaining routes)
```

**When:** Modernizing a legacy system without big-bang rewrite.

**Steps:**
1. Add a routing proxy in front of the legacy system
2. Implement new feature in new system, route to it
3. Migrate existing features one by one
4. When all routes point to new system → decommission legacy

### Backend for Frontend (BFF)

**What:** A dedicated API layer per client type (web, mobile, internal tool) that aggregates and transforms backend service responses.

**When:**
- Multiple client types with significantly different data needs
- Frontend teams want to move fast without waiting for backend changes
- Need to reduce over-fetching for mobile clients

**When NOT:**
- Single client type (unnecessary layer)
- Backend APIs are already well-tailored to client needs

---

## 3. Domain-Driven Design — Strategic Patterns

### Context Mapping Patterns (Detailed)

#### Shared Kernel
Two bounded contexts share a small, stable subset of the model. Changes require agreement from both teams.
- **Use when:** Two contexts genuinely need the same model (e.g. shared auth primitives, common value objects like Money or Address).
- **Risk:** Change coordination overhead. Keep the kernel minimal.

#### Customer/Supplier
Upstream (supplier) serves downstream (customer). Downstream has some influence over upstream priorities.
- **Use when:** One service depends on another within the same org. Downstream can request changes.
- **Example:** Order service (customer) depends on Inventory service (supplier).

#### Conformist
Downstream accepts upstream's model as-is, with no influence.
- **Use when:** External API or third-party service where you have no control.
- **Example:** Integrating with a government tax API.

#### Anti-Corruption Layer (ACL)
A translation layer that protects your domain model from a messy or different upstream model.
- **Use when:** Integrating with legacy systems, external services with poor models, or any upstream whose model doesn't match yours.
- **Implementation:** Adapter + translator at the boundary. Never let external models leak into your domain.

#### Open Host Service + Published Language
Upstream provides a well-defined, documented API (published language) for many consumers.
- **Use when:** Building a platform or service consumed by multiple teams/clients.
- **Example:** Public REST API with OpenAPI spec.

### Aggregate Design Rules

1. **Small aggregates.** Prefer single-entity aggregates. Multi-entity aggregates only when true invariants span entities.
2. **Reference by ID.** Aggregates reference other aggregates by ID, not by object. No lazy loading across aggregate boundaries.
3. **One transaction = one aggregate.** If a use case modifies multiple aggregates → domain events for eventual consistency.
4. **Protect invariants.** The aggregate root enforces all business rules within its boundary.

---

## 4. Decision Matrices

### "Which Architecture Style?" Matrix

| Factor | Modular Monolith | Microservices | Serverless |
|--------|-------------------|---------------|------------|
| Team size | 1–15 | 15+ | 1–10 |
| Domain clarity | Evolving | Well-understood | Simple / event-driven |
| Deployment independence | Not needed yet | Critical | Per-function |
| Operational overhead | Low | High | Medium (managed) |
| Debugging | Easy (single process) | Hard (distributed) | Hard (ephemeral) |
| Cost (small scale) | Low | High | Very low |
| Cost (large scale) | Medium | Medium | Can be high |
| Migration from | — | Modular Monolith | Any |

### "Which Communication Pattern?" Matrix

| Factor | REST | gRPC | GraphQL | Events | WebSocket |
|--------|------|------|---------|--------|-----------|
| Client type | Any | Internal services | Multi-client | Service-to-service | Real-time UI |
| Coupling | Medium | Higher | Medium | Very low | Medium |
| Latency | Medium | Low | Medium | Async | Low |
| Caching | Easy (HTTP) | Hard | Complex | N/A | N/A |
| Learning curve | Low | Medium | High | Medium | Medium |
| Browser support | Native | Needs proxy | Native | N/A | Native |
| Streaming | Limited (SSE) | Bidirectional | Subscriptions | Natural | Bidirectional |

### "Which Database?" Decision Flow

```
Structured data + ACID + complex queries?
  → PostgreSQL (ALWAYS evaluate first)

Need full-text search + facets at scale?
  → PostgreSQL FTS (simple) OR Elasticsearch (complex, dedicated)

Need caching + sessions + pub/sub + rate limiting?
  → Redis

Graph-heavy domain (social, permissions)?
  → Neo4j OR PostgreSQL recursive CTEs (evaluate pg first)

Time-series at high volume?
  → TimescaleDB (pg extension) or InfluxDB

AI/ML embeddings + similarity search?
  → pgvector (pg extension) or dedicated Vector DB (Qdrant, Pinecone)

Extreme throughput + simple access patterns?
  → DynamoDB or Redis

Multiple of the above?
  → Polyglot persistence (sync via CDC / Debezium)
  → But: always justify. One less DB = less operational burden.
```

### "Which Message Broker?" Decision Flow

```
Simple async + already have Redis?
  → Redis Streams

Need reliable routing + exchanges?
  → RabbitMQ

Need high throughput + event log + replay?
  → Apache Kafka

Managed + cloud-native preferred?
  → AWS SQS/SNS, Google Pub/Sub, Azure Service Bus

Need schema enforcement?
  → Add Schema Registry (Confluent, Apicurio) to Kafka
  → Or use AsyncAPI + JSON Schema validation
```

---

## 5. Build vs. Buy vs. Open Source

| Domain type | Strategy | Examples |
|-------------|----------|---------|
| **Core** (competitive advantage) | Build in-house | Main product logic, proprietary algorithms |
| **Supporting** (needed but not differentiating) | Evaluate OSS → Build if no fit | Admin panels, reporting, internal tools |
| **Generic** (commodity) | Buy / SaaS | Payments (Stripe), Auth (Auth0/Clerk), Email (SendGrid), Monitoring (Datadog) |

**Evaluation criteria for Buy/OSS:**
- Total cost of ownership (license + integration + maintenance)
- Vendor lock-in risk (data portability, API standards)
- Security and compliance posture
- Community health (for OSS): contributors, release cadence, issue response time
- Exit strategy: can you migrate away if needed?

---

## 6. Team Topologies (Conway's Law)

> "Organizations design systems that mirror their communication structure." — Conway

### Team Types (Skelton & Pais)

| Type | Purpose | Example |
|------|---------|---------|
| **Stream-aligned** | Delivers features for a bounded context | Orders team, User team |
| **Platform** | Internal developer platform / shared services | CI/CD, monitoring, shared infra |
| **Enabling** | Temporary coaching / capability transfer | Architecture guidance, security training |
| **Complicated Subsystem** | Deep specialist knowledge | ML team, crypto team |

### Interaction Modes

| Mode | When |
|------|------|
| **Collaboration** | Two teams co-create (temporary, high-bandwidth) |
| **X-as-a-Service** | Clear API contract, minimal communication |
| **Facilitating** | Enabling team helps stream-aligned team adopt a practice |

### Cognitive Load Rule

One team should own **at most** one bounded context (two in exceptional cases). If a team owns too many domains → split the team or merge the domains.

**Inverse Conway Maneuver:** Design team structure to produce the desired architecture, not the other way around.
