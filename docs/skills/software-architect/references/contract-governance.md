# Contract Governance Reference

> API contract conventions, event schema patterns, versioning strategy, and contract testing.
> Read this when designing APIs, defining event schemas, or managing contract changes.

---

## 1. OpenAPI Conventions (HTTP APIs)

### Standard API Structure

```yaml
openapi: 3.1.0
info:
  title: My Service API
  version: 1.0.0
  description: |
    API for managing orders and related resources.
    
    ## Authentication
    All endpoints require a Bearer token in the Authorization header.
    
    ## Error Format
    All errors follow the standard Error Envelope format.
  
servers:
  - url: https://api.myapp.com/v1
    description: Production
  - url: https://api.staging.myapp.com/v1
    description: Staging

paths:
  /orders:
    get:
      operationId: listOrders
      summary: List orders for the authenticated user
      tags: [Orders]
      parameters:
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/PageSizeParam'
        - name: status
          in: query
          schema:
            $ref: '#/components/schemas/OrderStatus'
      responses:
        '200':
          description: Paginated list of orders
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrderListResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalError'
    
    post:
      operationId: createOrder
      summary: Create a new order
      tags: [Orders]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateOrderRequest'
      responses:
        '201':
          description: Order created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrderResponse'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/Unauthorized'

components:
  schemas:
    # --- Error Envelope (system-wide standard) ---
    ErrorEnvelope:
      type: object
      required: [errorCode, message, requestId]
      properties:
        errorCode:
          type: string
          example: VALIDATION_ERROR
        message:
          type: string
          example: Email is already registered
        details:
          type: object
          additionalProperties:
            type: string
          example:
            email: This email is already in use
        requestId:
          type: string
          example: req_abc123

    # --- Pagination (offset-based) ---
    PaginationMeta:
      type: object
      required: [page, pageSize, total, totalPages]
      properties:
        page:
          type: integer
          minimum: 1
        pageSize:
          type: integer
          minimum: 1
          maximum: 100
        total:
          type: integer
          minimum: 0
        totalPages:
          type: integer
          minimum: 0

    # --- Pagination (cursor-based) ---
    CursorPaginationMeta:
      type: object
      required: [hasMore]
      properties:
        cursor:
          type: string
          nullable: true
        hasMore:
          type: boolean

    # --- Domain schemas ---
    OrderStatus:
      type: string
      enum: [PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED]
    
    OrderResponse:
      type: object
      required: [id, status, totalAmountMinor, currency, createdAt]
      properties:
        id:
          type: string
          format: uuid
        status:
          $ref: '#/components/schemas/OrderStatus'
        totalAmountMinor:
          type: integer
          description: Total in minor currency units (cents)
        currency:
          type: string
          pattern: '^[A-Z]{3}$'
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    OrderListResponse:
      type: object
      required: [data, meta]
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/OrderResponse'
        meta:
          $ref: '#/components/schemas/PaginationMeta'

    CreateOrderRequest:
      type: object
      required: [items]
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/OrderItemRequest'
          minItems: 1
    
    OrderItemRequest:
      type: object
      required: [productId, quantity]
      properties:
        productId:
          type: string
          format: uuid
        quantity:
          type: integer
          minimum: 1

  parameters:
    PageParam:
      name: page
      in: query
      schema:
        type: integer
        minimum: 1
        default: 1
    PageSizeParam:
      name: pageSize
      in: query
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20

  responses:
    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorEnvelope'
          example:
            errorCode: UNAUTHORIZED
            message: Authentication required
            requestId: req_abc123
    ValidationError:
      description: Request validation failed
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorEnvelope'
    InternalError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorEnvelope'
          example:
            errorCode: INTERNAL_ERROR
            message: An unexpected error occurred
            requestId: req_abc123

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

---

## 2. API Design Rules

### URL Conventions

| Rule | Good ✅ | Bad ❌ |
|------|---------|--------|
| Plural nouns for collections | `/orders`, `/users` | `/order`, `/getUsers` |
| Kebab-case | `/order-items` | `/orderItems`, `/order_items` |
| Resource-based, not action-based | `POST /orders` | `POST /createOrder` |
| Nested for relationships | `/orders/{id}/items` | `/orderItems?orderId=x` |
| Query params for filtering | `/orders?status=PENDING` | `/orders/pending` |
| No trailing slashes | `/orders` | `/orders/` |

### HTTP Methods

| Method | Semantics | Idempotent | Response |
|--------|-----------|-----------|----------|
| `GET` | Read resource(s) | Yes | 200 + body |
| `POST` | Create resource | No | 201 + body + Location header |
| `PUT` | Replace resource (full) | Yes | 200 + body |
| `PATCH` | Partial update | No (but should be idempotent when possible) | 200 + body |
| `DELETE` | Remove resource | Yes | 204 (no body) |

### HTTP Status Codes (Standardized)

| Code | Meaning | When |
|------|---------|------|
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation error (client mistake) |
| `401` | Unauthorized | No / invalid auth token |
| `403` | Forbidden | Authenticated but not authorized |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource, version conflict |
| `422` | Unprocessable Entity | Semantically invalid (valid JSON but business rule violation) |
| `429` | Too Many Requests | Rate limit exceeded (include `Retry-After` header) |
| `500` | Internal Server Error | Unexpected server error |
| `502` | Bad Gateway | Upstream service failure |
| `503` | Service Unavailable | Maintenance or overloaded (include `Retry-After`) |

### Pagination Rules

**Offset-based (default for simple UIs):**
```
GET /orders?page=2&pageSize=20
→ { "data": [...], "meta": { "page": 2, "pageSize": 20, "total": 142, "totalPages": 8 } }
```

**Cursor-based (for large datasets, real-time feeds):**
```
GET /events?cursor=eyJ0IjoiMjAyNi0wMS0xNSJ9&limit=50
→ { "data": [...], "meta": { "cursor": "eyJ0IjoiMjAyNi0wMS0xNiJ9", "hasMore": true } }
```

**Decision:** Use offset for admin panels, dashboards. Use cursor for feeds, logs, high-volume lists.

### Filtering, Sorting, Field Selection

```
# Filtering (field=value)
GET /orders?status=PENDING&createdAfter=2026-01-01T00:00:00Z

# Sorting (sort=field:direction)
GET /orders?sort=createdAt:desc

# Field selection (fields=list) — optional, for optimization
GET /orders?fields=id,status,totalAmountMinor
```

---

## 3. AsyncAPI Conventions (Events / Messages)

### Event Schema Template

```yaml
asyncapi: 3.0.0
info:
  title: Order Events
  version: 1.0.0
  description: Domain events published by the Order service

channels:
  orderCreated:
    address: orders.created
    messages:
      OrderCreated:
        $ref: '#/components/messages/OrderCreated'
  
  orderConfirmed:
    address: orders.confirmed
    messages:
      OrderConfirmed:
        $ref: '#/components/messages/OrderConfirmed'

components:
  messages:
    OrderCreated:
      name: OrderCreated
      title: Order Created
      summary: Published when a new order is placed
      contentType: application/json
      headers:
        type: object
        properties:
          eventId:
            type: string
            format: uuid
            description: Unique event ID for idempotency
          eventType:
            type: string
            const: OrderCreated
          eventVersion:
            type: string
            const: "1.0"
          timestamp:
            type: string
            format: date-time
          correlationId:
            type: string
            description: End-to-end correlation ID (requestId)
      payload:
        type: object
        required: [orderId, userId, items, totalAmountMinor, currency]
        properties:
          orderId:
            type: string
            format: uuid
          userId:
            type: string
            format: uuid
          items:
            type: array
            items:
              type: object
              properties:
                productId:
                  type: string
                  format: uuid
                quantity:
                  type: integer
                unitPriceMinor:
                  type: integer
          totalAmountMinor:
            type: integer
          currency:
            type: string
            pattern: '^[A-Z]{3}$'
    
    OrderConfirmed:
      name: OrderConfirmed
      title: Order Confirmed
      summary: Published when payment is successful and order is confirmed
      contentType: application/json
      headers:
        $ref: '#/components/messages/OrderCreated/headers'
      payload:
        type: object
        required: [orderId, confirmedAt]
        properties:
          orderId:
            type: string
            format: uuid
          confirmedAt:
            type: string
            format: date-time
```

### Event Design Rules

1. **Events are facts (past tense):** `OrderCreated`, `PaymentCompleted`, `UserRegistered` — not `CreateOrder`.
2. **Events are immutable:** Once published, never modified. New version = new event type.
3. **Include metadata:** `eventId` (for idempotency), `eventType`, `eventVersion`, `timestamp`, `correlationId`.
4. **Minimal payload:** Include IDs and essential data. Consumers fetch details if needed (or include snapshot).
5. **Schema ownership:** The publishing service owns the event schema. Consumers must tolerate unknown fields.
6. **Idempotency:** Consumers must handle receiving the same event twice. Use `eventId` for deduplication.

### Event Naming Convention

```
{domain}.{entity}.{action}

Examples:
  orders.order.created
  orders.order.confirmed
  orders.order.cancelled
  payments.payment.completed
  payments.payment.failed
  users.user.registered
  inventory.stock.reserved
  inventory.stock.released
```

---

## 4. Versioning Strategy Playbook

### Non-Breaking Changes (No Version Bump)

These changes are safe to deploy without version bump:

| Change | Safe? | Why |
|--------|-------|-----|
| Add new optional field to response | ✅ Yes | Consumers ignore unknown fields |
| Add new optional query parameter | ✅ Yes | Doesn't affect existing requests |
| Add new endpoint | ✅ Yes | Existing endpoints unchanged |
| Add new enum value | ⚠️ Careful | Only if consumers tolerate unknown values (they should) |
| Widen field type (int → float) | ⚠️ Careful | May break strongly-typed consumers |
| Make required field optional | ✅ Yes | Relaxes constraint |

### Breaking Changes (Requires Version Bump)

| Change | Breaking? | Migration |
|--------|-----------|-----------|
| Remove field from response | ❌ Yes | Deprecate → sunset → remove |
| Rename field | ❌ Yes | Add new field → deprecate old → remove old |
| Change field type | ❌ Yes | New field with new type → migrate consumers → remove old |
| Remove endpoint | ❌ Yes | Deprecate with Sunset header → remove after window |
| Make optional field required | ❌ Yes | New version of endpoint |
| Change error codes | ❌ Yes | Document change → migration window |

### Expand/Contract Migration Pattern

For breaking changes, use the expand/contract pattern:

```
Phase 1: EXPAND
  - Add new field alongside old field
  - Both fields populated in responses
  - Server accepts both in requests
  - Deploy to all instances

Phase 2: MIGRATE
  - Update all consumers to use new field
  - Verify via monitoring that old field is no longer used

Phase 3: CONTRACT
  - Mark old field as deprecated (Sunset header)
  - After deprecation window: remove old field
  - Remove handling code
```

### Deprecation Process

1. **Announce:** Add `Deprecated: true` in OpenAPI spec. Communicate to all consumers.
2. **Header:** Add `Sunset: Sat, 01 Nov 2026 00:00:00 GMT` to responses.
3. **Monitor:** Track usage of deprecated endpoints/fields. Alert when still used.
4. **Remind:** Notify consumers at 3 months, 1 month, 1 week before sunset.
5. **Remove:** After sunset date, return `410 Gone` for the endpoint.

**Minimum deprecation window:** 6 months for external APIs, 1 month for internal APIs.

---

## 5. Contract Testing Strategy

### Provider Contract Tests (Backend CI)

The Backend validates that its responses match the OpenAPI spec:

**Python (FastAPI + schemathesis):**
```python
# Run in CI after API is started
# schemathesis validates all endpoints against openapi.yaml
# Command:
# schemathesis run http://localhost:8000/openapi.json --checks all
```

**Node.js (Fastify + openapi-validator):**
```typescript
// Integration test validates response shapes
import { createTestApp } from './test-utils';
import openApiSpec from '../docs/contracts/openapi.json';

// Use express-openapi-validator or similar to validate
// every response against the spec during integration tests
```

### Consumer Contract Tests (Frontend CI)

The Frontend validates that its fixtures match the expected contract:

```typescript
import { z } from 'zod';

// Schema matches the OpenAPI definition
const OrderResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  totalAmountMinor: z.number().int(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

const OrderListResponseSchema = z.object({
  data: z.array(OrderResponseSchema),
  meta: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Test: validate fixtures against schemas
describe('Order API Contract', () => {
  it('fixture matches order list schema', () => {
    const fixture = loadFixture('order-list-response.json');
    const result = OrderListResponseSchema.safeParse(fixture);
    expect(result.success).toBe(true);
  });
});
```

### Contract Test Matrix

| Test Type | Where | What it validates | When it runs |
|-----------|-------|-------------------|-------------|
| **Provider (Backend)** | Backend CI | API responses match OpenAPI spec | Every PR |
| **Consumer (Frontend)** | Frontend CI | Fixtures match Zod/JSON schemas derived from contract | Every PR |
| **Integration** | Staging | Real requests between Frontend and Backend | Pre-release |
| **Schema validation** | Both CIs | Generated types are up-to-date with contract | Every PR |

---

## 6. Wire Format Standards

### JSON Field Naming

Choose **one** per system:

| Convention | When | Example |
|-----------|------|---------|
| `camelCase` | JavaScript/TypeScript-heavy consumers (default for web) | `totalAmountMinor`, `createdAt` |
| `snake_case` | Python-heavy consumers, data pipelines | `total_amount_minor`, `created_at` |

**Rule:** The wire format (JSON) uses the chosen convention. Internal code uses language conventions. Mapping at the boundary.

### Standard Fields

Every API response entity should include:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string (uuid)` | UUIDv7, time-sortable |
| `createdAt` | `string (date-time)` | RFC 3339, UTC |
| `updatedAt` | `string (date-time)` | RFC 3339, UTC |

### Standard Headers

| Header | Direction | Purpose |
|--------|-----------|---------|
| `Authorization: Bearer {token}` | Request | Auth |
| `X-Request-Id: {uuid}` | Request + Response | End-to-end correlation |
| `Content-Type: application/json` | Both | Format |
| `Accept: application/json` | Request | Expected format |
| `Sunset: {date}` | Response | Deprecation notice |
| `Retry-After: {seconds}` | Response (429, 503) | Rate limit / maintenance |
| `X-RateLimit-Limit: {n}` | Response | Rate limit info |
| `X-RateLimit-Remaining: {n}` | Response | Rate limit info |

---

## 7. Contract Change Process

### Before Merging Any Contract Change

```
1. Update OpenAPI / AsyncAPI / JSON Schema
2. Regenerate types (if using codegen)
3. Update provider contract tests
4. Update consumer fixtures and tests
5. Update relevant documentation (README, API docs)
6. If breaking: Create ADR + plan migration
7. Review by Architect (for conventions compliance)
8. Merge
```

### Contract PR Review Checklist

- [ ] Contract file (OpenAPI/AsyncAPI/JSON Schema) updated
- [ ] Version bumped (if applicable)
- [ ] Error responses follow Error Envelope standard
- [ ] Pagination follows standard format
- [ ] Dates use RFC 3339 UTC
- [ ] Money uses integer minor units
- [ ] IDs use UUIDv7 format
- [ ] Field naming matches system convention (camelCase or snake_case)
- [ ] Enums use UPPER_SNAKE_CASE strings
- [ ] No breaking changes without ADR + deprecation plan
- [ ] Provider tests updated
- [ ] Consumer fixtures updated (or notification sent to consumers)
