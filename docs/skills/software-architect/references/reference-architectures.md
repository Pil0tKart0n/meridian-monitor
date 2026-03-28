# Reference Architecture Pack

Common architecture patterns for typical product classes. Use as starting point — adapt via ADRs for project-specific needs.

---

## 1. SaaS Web Application (B2B/B2C)

**Examples:** Project management, CRM, analytics dashboard, document editor.

### Default Architecture

```
Client (SPA / SSR)
    │
    ▼
API Gateway / Load Balancer (TLS termination, rate limiting)
    │
    ├── Web App (Next.js / Remix SSR)
    │       └── Static assets → CDN
    │
    ├── API Server (REST / GraphQL)
    │       ├── Auth Service (OAuth2/OIDC)
    │       ├── Business Logic Services
    │       └── Background Workers (queues)
    │
    ├── Database (PostgreSQL — primary store)
    │       └── Read replica (for analytics/reports)
    │
    ├── Cache (Redis — sessions, hot data)
    │
    └── Object Storage (S3 — uploads, exports)

Observability: OTel → Collector → Metrics/Traces/Logs backend
```

### Key Decisions

| Decision | Default | Alternative (when) |
|----------|---------|-------------------|
| **Architecture style** | Modular monolith | Microservices only when team > 8 and clear domain boundaries |
| **Rendering** | SSR + Hydration (Next.js) | SPA if internal tool, no SEO needed |
| **Auth** | OIDC provider (Auth0/Keycloak) | Custom only for special compliance requirements |
| **Multi-tenancy** | Shared DB, `tenant_id` column | Schema-per-tenant if strict isolation required (compliance, large tenants) |
| **Background jobs** | Queue (Redis/SQS) + workers | Cron only for simple scheduled tasks |
| **File storage** | S3-compatible object storage | Never local filesystem in containers |

### Key Risks

- **Noisy neighbor** in multi-tenant: enforce per-tenant rate limits + query budgets.
- **Session management** at scale: use stateless JWT for API, server-side session for SSR. Never store sensitive data in JWT payload.
- **Migration complexity** grows: enforce expand/contract from day 1.
- **Feature flag debt**: review + clean up flags quarterly.

---

## 2. E-Commerce Platform

**Examples:** Online shop, marketplace, subscription commerce.

### Default Architecture

```
Storefront (SSR — SEO critical)
    │
    ▼
API Gateway (rate limiting, geo-routing)
    │
    ├── Product Catalog Service (read-heavy, cacheable)
    ├── Cart/Checkout Service (write-heavy, consistency critical)
    ├── Payment Service (PCI-DSS scope isolation)
    ├── Order Service (state machine, event sourcing recommended)
    ├── Inventory Service (eventual consistency acceptable for display, strong for checkout)
    ├── Search Service (Elasticsearch/Typesense)
    │
    ├── PostgreSQL (orders, users, payments — ACID required)
    ├── Redis (cart sessions, product cache, rate limiting)
    ├── CDN (product images, static assets)
    │
    └── Event Bus (order events → fulfillment, notifications, analytics)
```

### Key Decisions

| Decision | Default | Alternative (when) |
|----------|---------|-------------------|
| **Payment** | External provider (Stripe) — minimize PCI scope | Custom only if marketplace with complex splits |
| **Catalog** | CDN-cached, ISR for product pages | Real-time pricing only if dynamic pricing engine |
| **Inventory** | Reservation pattern (soft lock at cart → hard lock at payment) | Skip reservation only for digital goods |
| **Order state** | State machine (created → paid → fulfilled → completed/refunded) | Event sourcing if audit trail + replay required |
| **Search** | Dedicated search index, async sync from DB | Direct DB queries only for < 10k products |

### Key Risks

- **Money handling:** `amountMinor` (integer cents) everywhere. Never floats. Currency as ISO 4217.
- **Race conditions at checkout:** Use idempotency keys + pessimistic locking for inventory.
- **PCI compliance:** Isolate payment flows. Never log card data. Use tokenization.
- **Flash sales / traffic spikes:** Queue-based checkout flow, circuit breakers on payment provider.
- **Cart abandonment analytics:** Track funnel events (view → add → checkout → payment → confirmed).

---

## 3. Social / Content Platform

**Examples:** Social network, content feed, community platform, forum.

### Default Architecture

```
Web/Mobile Client
    │
    ▼
API Gateway (auth, rate limiting, abuse detection)
    │
    ├── User Service (profiles, relationships, preferences)
    ├── Content Service (posts, comments, media)
    ├── Feed Service (fan-out on write or read)
    ├── Notification Service (push, email, in-app)
    ├── Moderation Service (content policy, reports, auto-flag)
    ├── Media Pipeline (upload → process → CDN)
    │
    ├── PostgreSQL (users, relationships, content metadata)
    ├── Redis (feed cache, session, online status, rate limiting)
    ├── Object Storage + CDN (images, videos)
    │
    └── Event Bus (content events → feed rebuild, notifications, moderation, analytics)
```

### Key Decisions

| Decision | Default | Alternative (when) |
|----------|---------|-------------------|
| **Feed algorithm** | Fan-out on write (pre-computed feeds) | Fan-out on read if graph is very dense (celebrity problem) |
| **Content storage** | PostgreSQL + full-text search | Dedicated search index if > 1M posts or complex search |
| **Media processing** | Async pipeline (queue → resize/transcode → CDN) | Synchronous only for tiny images (avatars) |
| **Moderation** | Automated pre-screening + human review queue | Purely manual only if < 100 posts/day |
| **Notifications** | Event-driven, per-channel (push/email/in-app) | Batch digest for non-urgent notifications |

### Key Risks

- **Hot user problem:** Celebrity users with millions of followers → fan-out on write becomes expensive. Hybrid approach: fan-out for normal users, pull-based for hot users.
- **Content moderation at scale:** Automate first pass (spam, explicit content), queue for human review.
- **Feed consistency vs. speed:** Accept eventual consistency (seconds, not minutes). Users accept slight delay.
- **Abuse/scraping:** Rate limiting per user + IP. CAPTCHA on suspicious patterns. Account verification for posting.
- **Data retention:** Define content lifecycle (soft delete → archive → hard delete) aligned with GDPR.

---

## 4. Real-Time / Chat Application

**Examples:** Messaging, collaboration tool, live dashboard, multiplayer game lobby.

### Default Architecture

```
Client (WebSocket connection)
    │
    ▼
WebSocket Gateway (connection management, auth, routing)
    │
    ├── Presence Service (who's online, typing indicators)
    ├── Message Service (persistence, ordering, delivery tracking)
    ├── Channel/Room Service (membership, permissions)
    ├── Media Service (file sharing, link previews)
    │
    ├── PostgreSQL (users, channels, message history)
    ├── Redis Pub/Sub (real-time message fan-out between server instances)
    ├── Redis (presence state, typing indicators, rate limiting)
    │
    └── Event Bus (message events → search indexing, notifications, moderation)
```

### Key Decisions

| Decision | Default | Alternative (when) |
|----------|---------|-------------------|
| **Transport** | WebSocket (bidirectional) | SSE for one-way updates (dashboards). Long polling as fallback only. |
| **Message ordering** | Per-channel sequence numbers (server-assigned) | Vector clocks only for true P2P / CRDT collaboration |
| **Delivery guarantee** | At-least-once + client-side deduplication | Exactly-once too expensive for chat; use for payments only |
| **Presence** | Heartbeat-based (30s TTL in Redis) | WebSocket disconnect event + grace period |
| **Scaling WebSocket** | Redis Pub/Sub for cross-instance fan-out | Kafka if message volume > 100k/sec or durability required |
| **Message history** | PostgreSQL (paginated, indexed by channel + timestamp) | Time-series DB only for extreme volume |

### Key Risks

- **Reconnect handling:** Client must handle: reconnect with exponential backoff, replay missed messages (last sequence number), re-subscribe to channels.
- **Ordering guarantees:** Server-assigned sequence numbers per channel. Client must reorder if messages arrive out of sequence.
- **Backpressure:** If a client can't keep up, buffer up to N messages, then drop oldest or disconnect.
- **Horizontal scaling:** WebSocket connections are stateful → sticky sessions or Redis Pub/Sub for cross-instance delivery.
- **Security:** Authenticate on connect, authorize per channel. Rate limit messages per user. Content moderation pipeline.

---

## Usage

1. **Start from the matching pattern** above as your C4 Container diagram baseline.
2. **Create ADRs** for every decision you change from the default.
3. **Map to skills:** Each component maps to a skill owner (Backend builds, Frontend consumes, DevOps deploys, DB designs data layer).
4. **Refine with NFRs:** Requirements Engineer provides concrete performance/availability/security targets → Architect translates to SLOs → skills implement.
