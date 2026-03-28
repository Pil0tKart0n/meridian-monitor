# C4 & Architecture Diagrams Reference

> Mermaid templates for C4 diagrams, sequence diagrams, data flow diagrams, and ER diagrams.
> All diagrams are Markdown-embeddable and renderable in GitHub/GitLab.

---

## 1. C4 Model Overview

The C4 model (Simon Brown) provides four levels of abstraction:

| Level | Name | Shows | When |
|-------|------|-------|------|
| **1** | System Context | System + external actors/systems | Always (every system) |
| **2** | Container | Deployable units (apps, DBs, queues) | Always (every system) |
| **3** | Component | Internal structure of a container | When container internals are complex |
| **4** | Code | Classes / functions | Rarely (for critical modules only) |

**Every diagram must include:** Title, Scope (what's in/out), Legend, Date, Owner.

---

## 2. C4 Level 1 — System Context

Shows the system as a black box with its users and external systems.

```mermaid
graph TB
    subgraph External
        User["👤 User<br/><i>Web Browser</i>"]
        Admin["👤 Admin<br/><i>Admin Dashboard</i>"]
        PaymentProvider["🏦 Payment Provider<br/><i>Stripe API</i>"]
        EmailService["📧 Email Service<br/><i>SendGrid</i>"]
        IdentityProvider["🔑 Identity Provider<br/><i>Auth0 / Keycloak</i>"]
    end

    subgraph System["🏗️ [System] My Application"]
        App["My Application<br/><i>Handles orders, users,<br/>payments, notifications</i>"]
    end

    User -->|"Places orders,<br/>manages profile"| App
    Admin -->|"Manages users,<br/>views reports"| App
    App -->|"Processes payments"| PaymentProvider
    App -->|"Sends notifications"| EmailService
    App -->|"Authenticates users"| IdentityProvider

    style System fill:#1168bd,stroke:#0b4884,color:#fff
    style User fill:#08427b,stroke:#052e56,color:#fff
    style Admin fill:#08427b,stroke:#052e56,color:#fff
    style PaymentProvider fill:#999,stroke:#666,color:#fff
    style EmailService fill:#999,stroke:#666,color:#fff
    style IdentityProvider fill:#999,stroke:#666,color:#fff
```

**Template (adapt per project):**
```mermaid
graph TB
    subgraph External
        Actor1["👤 [Actor Name]<br/><i>[Description]</i>"]
        ExtSystem1["🔲 [External System]<br/><i>[Technology/Protocol]</i>"]
    end

    subgraph System["🏗️ [System] [System Name]"]
        App["[System Name]<br/><i>[Brief description of<br/>what it does]</i>"]
    end

    Actor1 -->|"[Interaction description]"| App
    App -->|"[Interaction description]"| ExtSystem1

    style System fill:#1168bd,stroke:#0b4884,color:#fff
    style Actor1 fill:#08427b,stroke:#052e56,color:#fff
    style ExtSystem1 fill:#999,stroke:#666,color:#fff
```

---

## 3. C4 Level 2 — Container Diagram

Shows the major deployable units within the system.

```mermaid
graph TB
    User["👤 User<br/><i>Web Browser</i>"]

    subgraph System["🏗️ [System] My Application"]
        SPA["📱 SPA<br/><i>React + TypeScript</i><br/>Single Page Application"]
        API["⚙️ API Service<br/><i>FastAPI / Python</i><br/>REST API + Business Logic"]
        Worker["⏰ Background Worker<br/><i>Python + Celery</i><br/>Async job processing"]
        DB[("🗄️ PostgreSQL<br/><i>Primary Database</i><br/>Users, Orders, Products")]
        Cache[("⚡ Redis<br/><i>Cache + Queue</i><br/>Sessions, rate limits, job queue")]
        Queue["📨 Message Queue<br/><i>Redis Streams / RabbitMQ</i><br/>Event bus"]
    end

    ExtPayment["🏦 Stripe API"]
    ExtEmail["📧 SendGrid"]

    User -->|"HTTPS"| SPA
    SPA -->|"JSON/HTTPS"| API
    API -->|"SQL"| DB
    API -->|"GET/SET"| Cache
    API -->|"Publish events"| Queue
    Worker -->|"Consume events"| Queue
    Worker -->|"SQL"| DB
    API -->|"HTTPS"| ExtPayment
    Worker -->|"HTTPS"| ExtEmail

    style System fill:#e8f4f8,stroke:#1168bd
    style SPA fill:#438dd5,stroke:#2e6295,color:#fff
    style API fill:#438dd5,stroke:#2e6295,color:#fff
    style Worker fill:#438dd5,stroke:#2e6295,color:#fff
    style DB fill:#f5a623,stroke:#c7841a,color:#fff
    style Cache fill:#f5a623,stroke:#c7841a,color:#fff
    style Queue fill:#f5a623,stroke:#c7841a,color:#fff
    style ExtPayment fill:#999,stroke:#666,color:#fff
    style ExtEmail fill:#999,stroke:#666,color:#fff
```

---

## 4. C4 Level 3 — Component Diagram

Shows the internal structure of a single container (e.g. the API Service).

```mermaid
graph TB
    subgraph API["⚙️ API Service"]
        Router["🔀 Router<br/><i>FastAPI Routes</i>"]
        AuthMiddleware["🔒 Auth Middleware<br/><i>JWT Validation</i>"]
        
        subgraph Modules["Application Modules"]
            OrderModule["📦 Order Module<br/><i>Order management</i>"]
            UserModule["👤 User Module<br/><i>User management</i>"]
            PaymentModule["💳 Payment Module<br/><i>Payment processing</i>"]
        end
        
        subgraph Infrastructure
            DBAdapter["🗄️ DB Adapter<br/><i>SQLAlchemy</i>"]
            CacheAdapter["⚡ Cache Adapter<br/><i>Redis Client</i>"]
            EventPublisher["📨 Event Publisher<br/><i>Queue Client</i>"]
            PaymentGateway["🏦 Payment Gateway<br/><i>Stripe SDK</i>"]
        end
    end

    Router --> AuthMiddleware
    AuthMiddleware --> OrderModule
    AuthMiddleware --> UserModule
    AuthMiddleware --> PaymentModule
    
    OrderModule --> DBAdapter
    OrderModule --> EventPublisher
    UserModule --> DBAdapter
    UserModule --> CacheAdapter
    PaymentModule --> PaymentGateway
    PaymentModule --> DBAdapter

    style API fill:#e8f4f8,stroke:#438dd5
    style OrderModule fill:#438dd5,stroke:#2e6295,color:#fff
    style UserModule fill:#438dd5,stroke:#2e6295,color:#fff
    style PaymentModule fill:#438dd5,stroke:#2e6295,color:#fff
```

---

## 5. Sequence Diagrams

### Auth Flow (JWT + Refresh Token)

```mermaid
sequenceDiagram
    actor User
    participant SPA as Frontend (SPA)
    participant API as Backend API
    participant Auth as Auth Service
    participant DB as Database

    User->>SPA: Login with credentials
    SPA->>API: POST /auth/login {email, password}
    API->>Auth: Validate credentials
    Auth->>DB: Lookup user + verify hash
    DB-->>Auth: User found, hash matches
    Auth-->>API: User authenticated
    API-->>SPA: 200 OK<br/>Body: {accessToken (15min)}<br/>Set-Cookie: refreshToken (httpOnly, 7d)
    
    Note over SPA,API: Subsequent requests use accessToken

    SPA->>API: GET /orders<br/>Authorization: Bearer {accessToken}
    API->>API: Validate JWT
    API->>DB: Fetch orders
    DB-->>API: Orders data
    API-->>SPA: 200 OK {data, meta}

    Note over SPA,API: Access token expired

    SPA->>API: POST /auth/refresh<br/>Cookie: refreshToken
    API->>Auth: Validate refresh token
    Auth->>DB: Check token, rotate
    DB-->>Auth: Valid, new token stored
    Auth-->>API: New tokens
    API-->>SPA: 200 OK<br/>Body: {accessToken (new)}<br/>Set-Cookie: refreshToken (new, rotated)
```

### Order Processing (Multi-Service / Saga)

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant OrderSvc as Order Service
    participant PaymentSvc as Payment Service
    participant InventorySvc as Inventory Service
    participant NotifySvc as Notification Service
    participant Queue as Event Bus

    User->>FE: Place order
    FE->>OrderSvc: POST /orders {items, paymentMethod}
    OrderSvc->>OrderSvc: Validate & create order (status: PENDING)
    OrderSvc->>Queue: Publish: OrderCreated
    OrderSvc-->>FE: 202 Accepted {orderId, status: PENDING}

    Queue->>InventorySvc: OrderCreated
    InventorySvc->>InventorySvc: Reserve items
    InventorySvc->>Queue: Publish: ItemsReserved

    Queue->>PaymentSvc: ItemsReserved
    PaymentSvc->>PaymentSvc: Charge payment
    PaymentSvc->>Queue: Publish: PaymentCompleted

    Queue->>OrderSvc: PaymentCompleted
    OrderSvc->>OrderSvc: Update order (status: CONFIRMED)
    OrderSvc->>Queue: Publish: OrderConfirmed

    Queue->>NotifySvc: OrderConfirmed
    NotifySvc->>NotifySvc: Send confirmation email

    Note over PaymentSvc,Queue: If payment fails → compensation
    
    alt Payment fails
        PaymentSvc->>Queue: Publish: PaymentFailed
        Queue->>InventorySvc: PaymentFailed
        InventorySvc->>InventorySvc: Release reserved items
        Queue->>OrderSvc: PaymentFailed
        OrderSvc->>OrderSvc: Update order (status: CANCELLED)
    end
```

---

## 6. Data Flow Diagram (for sensitive data)

```mermaid
graph LR
    subgraph Client["Client Layer"]
        Browser["Browser<br/>(TLS encrypted)"]
    end

    subgraph Edge["Edge Layer"]
        CDN["CDN<br/>(Static assets only,<br/>no PII cached)"]
        Gateway["API Gateway<br/>(Rate limit, Auth,<br/>request logging)"]
    end

    subgraph App["Application Layer"]
        API["API Service<br/>(PII processed in memory,<br/>never logged)"]
        Worker["Worker<br/>(PII: only IDs,<br/>no raw data in logs)"]
    end

    subgraph Data["Data Layer"]
        DB[("PostgreSQL<br/>(Encrypted at rest,<br/>PII columns marked)")]
        Cache[("Redis<br/>(No PII,<br/>session IDs only)")]
        Backup[("Backups<br/>(Encrypted,<br/>retention: 90d)")]
    end

    subgraph External["External"]
        Payment["Stripe<br/>(PCI DSS,<br/>tokenized)"]
        Analytics["Analytics<br/>(Anonymized,<br/>no PII)"]
    end

    Browser -->|"HTTPS/TLS 1.3"| CDN
    Browser -->|"HTTPS/TLS 1.3"| Gateway
    Gateway -->|"Internal TLS"| API
    API -->|"SQL (TLS)"| DB
    API -->|"Redis Protocol"| Cache
    API -->|"Events"| Worker
    Worker -->|"SQL (TLS)"| DB
    DB -->|"Automated"| Backup
    API -->|"HTTPS (tokenized)"| Payment
    Worker -->|"HTTPS (anonymized)"| Analytics

    style Client fill:#e8f4f8,stroke:#1168bd
    style Edge fill:#fff3cd,stroke:#ffc107
    style App fill:#d4edda,stroke:#28a745
    style Data fill:#f8d7da,stroke:#dc3545
    style External fill:#e2e3e5,stroke:#6c757d
```

---

## 7. Deployment Diagram

```mermaid
graph TB
    subgraph Internet
        Users["👤 Users"]
    end

    subgraph Cloud["Cloud Provider (AWS / GCP)"]
        subgraph Edge["Edge Layer"]
            CDN["CloudFront / Cloudflare<br/><i>Static assets</i>"]
            LB["Load Balancer<br/><i>TLS termination</i>"]
        end

        subgraph K8s["Kubernetes Cluster"]
            subgraph NS_App["Namespace: app"]
                API_Pod1["API Pod (x3)<br/><i>FastAPI</i>"]
                Worker_Pod["Worker Pod (x2)<br/><i>Celery</i>"]
            end
        end

        subgraph Data["Data Layer (Managed)"]
            RDS[("RDS PostgreSQL<br/><i>Multi-AZ, encrypted</i>")]
            ElastiCache[("ElastiCache Redis<br/><i>Cluster mode</i>")]
        end

        subgraph Monitoring["Monitoring"]
            Grafana["Grafana Stack<br/><i>Loki + Tempo + Prometheus</i>"]
            Sentry["Sentry<br/><i>Error tracking</i>"]
        end
    end

    Users -->|HTTPS| CDN
    Users -->|HTTPS| LB
    LB --> API_Pod1
    API_Pod1 --> RDS
    API_Pod1 --> ElastiCache
    Worker_Pod --> RDS
    Worker_Pod --> ElastiCache
    API_Pod1 -.->|logs/traces/metrics| Grafana
    Worker_Pod -.->|logs/traces/metrics| Grafana
    API_Pod1 -.->|errors| Sentry
```

---

## 8. Entity Relationship Diagram (Conceptual)

```mermaid
erDiagram
    USER ||--o{ ORDER : "places"
    USER {
        uuid id PK
        string email UK
        string name
        string password_hash
        enum role "CUSTOMER | ADMIN"
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER ||--|{ ORDER_ITEM : "contains"
    ORDER {
        uuid id PK
        uuid user_id FK
        enum status "PENDING | CONFIRMED | SHIPPED | CANCELLED"
        int total_amount_minor
        string currency
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        int unit_price_minor
        string currency
    }

    PRODUCT ||--o{ ORDER_ITEM : "referenced in"
    PRODUCT {
        uuid id PK
        string name
        string description
        int price_minor
        string currency
        int stock_quantity
        boolean is_active
        timestamp created_at
    }
```

---

## 9. Bounded Context Map

```mermaid
graph TB
    subgraph Core["Core Domain"]
        Orders["📦 Orders<br/><i>Bounded Context</i><br/>Order lifecycle,<br/>fulfillment"]
    end

    subgraph Supporting["Supporting Domain"]
        Users["👤 Users<br/><i>Bounded Context</i><br/>Registration,<br/>profile, roles"]
        Inventory["📊 Inventory<br/><i>Bounded Context</i><br/>Stock management,<br/>reservations"]
        Notifications["📧 Notifications<br/><i>Bounded Context</i><br/>Email, SMS,<br/>push notifications"]
    end

    subgraph Generic["Generic Domain (Buy/SaaS)"]
        Payments["💳 Payments<br/><i>Stripe</i><br/>Payment processing"]
        Auth["🔑 Auth<br/><i>Auth0 / Keycloak</i><br/>Authentication"]
        Analytics["📈 Analytics<br/><i>PostHog / Mixpanel</i><br/>User analytics"]
    end

    Orders -->|"Customer/Supplier<br/>(API contract)"| Inventory
    Orders -->|"Conformist<br/>(Stripe API)"| Payments
    Orders -->|"Domain Events<br/>(OrderConfirmed)"| Notifications
    Users -->|"Shared Kernel<br/>(UserId, Email)"| Orders
    Users -->|"Open Host<br/>(OAuth/OIDC)"| Auth
    Orders -->|"ACL<br/>(anonymized data)"| Analytics

    style Core fill:#d4edda,stroke:#28a745
    style Supporting fill:#fff3cd,stroke:#ffc107
    style Generic fill:#e2e3e5,stroke:#6c757d
```

---

## 10. Diagram Checklist

Before publishing any diagram, verify:

- [ ] **Title** — clearly states what the diagram shows
- [ ] **Scope** — explicitly states what's included and excluded
- [ ] **Legend** — colors / shapes explained (if non-obvious)
- [ ] **Date / Version** — when was this last updated
- [ ] **Owner** — who maintains this diagram
- [ ] **Labels** — all arrows and connections are labeled with the protocol/interaction type
- [ ] **Technology** — each box states the technology (e.g. "FastAPI", "PostgreSQL")
- [ ] **Consistent style** — same colors/shapes for same categories across all diagrams

---

## 11. Mermaid Tips

- Use `graph TB` (top-bottom) for hierarchical diagrams
- Use `graph LR` (left-right) for flow diagrams
- Use `sequenceDiagram` for interaction sequences
- Use `erDiagram` for data models
- Use `subgraph` to group related elements
- Use `style` to color-code categories (blue = your system, gray = external, etc.)
- Use `-->|"label"|` for labeled connections
- Use `-.->` for async / monitoring connections
- Mermaid renders in GitHub, GitLab, Notion, and most Markdown renderers
