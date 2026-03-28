# API Design Patterns

Patterns for building consistent, predictable, frontend-friendly APIs.

---

## REST Resource Naming

```
GET    /api/v1/users              → List users
POST   /api/v1/users              → Create user
GET    /api/v1/users/:id          → Get user
PUT    /api/v1/users/:id          → Replace user
PATCH  /api/v1/users/:id          → Partial update user
DELETE /api/v1/users/:id          → Delete user

GET    /api/v1/users/:id/orders   → List user's orders (nested resource)
POST   /api/v1/users/:id/orders   → Create order for user
```

**Rules:**
- Plural nouns: `/users`, not `/user`.
- Kebab-case: `/user-profiles`, not `/userProfiles` or `/user_profiles`.
- Nouns, not verbs: `/users`, not `/getUsers`. The HTTP method IS the verb.
- Max 2 levels of nesting. Beyond that → filter params: `GET /orders?userId=123`.
- Consistent across the entire API.

---

## Error Handling Pattern

### Domain Error Classes

**Python:**
```python
class AppError(Exception):
    """Base error for all domain errors."""
    def __init__(self, error_code: str, message: str, status_code: int = 400, details: dict | None = None):
        self.error_code = error_code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)

class NotFoundError(AppError):
    def __init__(self, resource: str, resource_id: str):
        super().__init__(
            error_code="NOT_FOUND",
            message=f"{resource} with id '{resource_id}' not found",
            status_code=404,
        )

class ConflictError(AppError):
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(error_code="CONFLICT", message=message, status_code=409, details=details)

class ForbiddenError(AppError):
    def __init__(self, message: str = "You don't have permission to perform this action"):
        super().__init__(error_code="FORBIDDEN", message=message, status_code=403)
```

**TypeScript:**
```typescript
export class AppError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, resourceId: string) {
    super('NOT_FOUND', `${resource} with id '${resourceId}' not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, string>) {
    super('CONFLICT', message, 409, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You don't have permission to perform this action") {
    super('FORBIDDEN', message, 403);
  }
}
```

### Global Error Handler

**Python (FastAPI):**
```python
import uuid
import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

logger = structlog.get_logger()

def register_error_handlers(app: FastAPI) -> None:

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        request_id = request.state.request_id if hasattr(request.state, "request_id") else str(uuid.uuid4())
        logger.warning("app_error", error_code=exc.error_code, message=exc.message, request_id=request_id)
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "errorCode": exc.error_code,
                "message": exc.message,
                "details": exc.details,
                "requestId": request_id,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def request_validation_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        """Handles invalid request data at the HTTP boundary (path/query/body)."""
        request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        details = {str(e["loc"][-1]): e["msg"] for e in exc.errors()}
        return JSONResponse(
            status_code=422,
            content={
                "errorCode": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "details": details,
                "requestId": request_id,
            },
        )

    @app.exception_handler(ValidationError)
    async def validation_error_handler(request: Request, exc: ValidationError) -> JSONResponse:
        """Handles Pydantic ValidationError raised inside application code (e.g. manual .model_validate())."""
        request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        details = {str(e["loc"][-1]): e["msg"] for e in exc.errors()}
        return JSONResponse(
            status_code=422,
            content={
                "errorCode": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "details": details,
                "requestId": request_id,
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
        request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        logger.error("unhandled_error", error=str(exc), request_id=request_id, exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "errorCode": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "requestId": request_id,
            },
        )
```

**TypeScript (Fastify):**
```typescript
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { randomUUID } from 'node:crypto';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const requestId = request.id ?? randomUUID();

  if (error instanceof AppError) {
    request.log.warn({ errorCode: error.errorCode, requestId }, error.message);
    return reply.status(error.statusCode).send({
      errorCode: error.errorCode,
      message: error.message,
      details: error.details,
      requestId,
    });
  }

  if (error instanceof ZodError) {
    const details = Object.fromEntries(
      error.errors.map((e) => [e.path.join('.'), e.message]),
    );
    return reply.status(422).send({
      errorCode: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details,
      requestId,
    });
  }

  // Unhandled
  request.log.error({ err: error, requestId }, 'Unhandled error');
  return reply.status(500).send({
    errorCode: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    requestId,
  });
}
```

---

## Error Response: RFC 9457 (Problem Details)

Standard-compliant alternative to the custom error envelope above. Use when: public APIs, OpenAPI specs, interoperability with third-party consumers.

**Content-Type:** `application/problem+json`

```json
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation Error",
  "status": 422,
  "detail": "Email is already registered",
  "instance": "/api/v1/users",
  "errors": [
    { "field": "email", "message": "This email is already in use" }
  ],
  "requestId": "req_abc123"
}
```

**Field mapping:**
- `type` → stable URI pointing to error documentation (acts as error catalog). Use `about:blank` if no catalog exists.
- `title` → human-readable summary of the error type (same for all instances of this type).
- `status` → HTTP status code (redundant with response status, but required by spec).
- `detail` → human-readable explanation specific to this occurrence.
- `instance` → URI identifying the specific request/resource.
- Custom extensions (`errors`, `requestId`) → allowed by spec, add as needed.

**When to use which:**
- **Custom envelope** (above): Internal APIs, established codebase with existing conventions.
- **RFC 9457**: Public APIs, new projects, APIs consumed by external teams/partners.
- Both are valid. Pick one per project and be consistent.

---

## Pagination

### Offset-Based (default for simple APIs)

**Request:** `GET /api/v1/users?page=2&pageSize=20`

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "pageSize": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

**Python:**
```python
from pydantic import BaseModel, Field

class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

class PaginatedResponse[T](BaseModel):
    data: list[T]
    meta: PaginationMeta

class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int
```

### Cursor-Based (for large datasets)

**Request:** `GET /api/v1/events?cursor=eyJpZCI6MTIzfQ&limit=20`

**Response:**
```json
{
  "data": [...],
  "meta": {
    "nextCursor": "eyJpZCI6MTQzfQ",
    "hasMore": true
  }
}
```

**When:** > 10k rows, infinite scroll on frontend, realtime feeds, data that changes during pagination.

**Rule:** Both styles must keep defaults out of the URL (matches Frontend Skill's URL-as-State pattern). Frontend sends `?page=2` only when not on page 1.

---

## API Versioning

**Preferred: URL path versioning** – simple, explicit, easy to route.

```
/api/v1/users
/api/v2/users
```

**Alternative:** Header-based `Accept: application/vnd.myapp.v2+json` – cleaner URLs but harder to test/cache. Use URL path unless the repo already uses headers.

**What IS a breaking change:**
- Field removed or renamed
- Field type changed (string → number)
- Required field added to request
- Behavior/semantics changed (same endpoint, different result)
- Error code changed for same condition

**What is NOT a breaking change:**
- New optional field in response
- New endpoint added
- New optional query parameter
- New enum value added (if clients handle unknown values gracefully)

**Deprecation strategy:**
1. Announce deprecation ≥ 3 months before removal. Add `Sunset` header (RFC 8594).
2. Add `Deprecation: true` header + `Link` header pointing to successor.
3. Run both versions in parallel. Monitor traffic split.
4. Remove old version only when < 5% of traffic still uses it.

```http
HTTP/1.1 200 OK
Sunset: Sat, 01 Jun 2026 00:00:00 GMT
Deprecation: true
Link: <https://api.example.com/v2/users>; rel="successor-version"
```

**Rule:** When in doubt, don't break the contract. Add a new field instead of changing an existing one.

---

## Authentication Patterns

### JWT (Access + Refresh)

```
Client                          Server
  │                               │
  │─── POST /auth/login ─────────►│  Validate credentials
  │◄── { accessToken, refresh } ──│  accessToken: 15min, refresh: httpOnly cookie 7d
  │                               │
  │─── GET /users (Bearer token) ─►│  Validate JWT, extract userId
  │◄── { data: [...] } ───────────│
  │                               │
  │─── POST /auth/refresh ────────►│  Validate refresh cookie
  │◄── { accessToken } ───────────│  Issue new access token
  │                               │
  │─── POST /auth/logout ─────────►│  Invalidate refresh token
  │◄── 204 ───────────────────────│  Clear cookie
```

**Python (FastAPI dependency):**
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt  # PyJWT (actively maintained; avoid python-jose)

bearer_scheme = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = await user_repository.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
```

**TypeScript (Fastify plugin):**
```typescript
import fp from 'fastify-plugin';
import fjwt from '@fastify/jwt';

export const authPlugin = fp(async (app) => {
  await app.register(fjwt, { secret: env.JWT_SECRET });

  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ errorCode: 'UNAUTHORIZED', message: 'Invalid or expired token' });
    }
  });
});

// Usage in route:
app.get('/users', { preHandler: [app.authenticate] }, handler);
```

### Authorization (RBAC)

```python
# Python – permission dependency
from enum import StrEnum

class Permission(StrEnum):
    READ_USERS = "read:users"
    WRITE_USERS = "write:users"
    DELETE_USERS = "delete:users"

ROLE_PERMISSIONS: dict[str, set[Permission]] = {
    "viewer": {Permission.READ_USERS},
    "editor": {Permission.READ_USERS, Permission.WRITE_USERS},
    "admin": {Permission.READ_USERS, Permission.WRITE_USERS, Permission.DELETE_USERS},
}

def require_permission(permission: Permission):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        user_permissions = ROLE_PERMISSIONS.get(current_user.role, set())
        if permission not in user_permissions:
            raise ForbiddenError()
        return current_user
    return Depends(dependency)

# Usage:
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = require_permission(Permission.DELETE_USERS),
):
    ...
```

---

## Rate Limiting

**Architecture:** Prefer rate limiting at the edge/gateway (Nginx, API Gateway, CDN) as primary defense – stable, language-independent, no app overhead. Use app-level rate limiting only for per-user/per-route granularity or when no gateway is available.

**Where:** Auth endpoints (login, register, password reset), public APIs, expensive operations.

**Python (SlowAPI or custom):**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, body: LoginRequest):
    ...
```

**TypeScript (Fastify):**
```typescript
import rateLimit from '@fastify/rate-limit';

await app.register(rateLimit, {
  max: 100,        // requests per window
  timeWindow: '1 minute',
});

// Per-route override:
app.post('/auth/login', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, handler);
```

**Response on limit:** `429 Too Many Requests` with `Retry-After` header.

---

## Request/Response Patterns

### List Endpoint (complete example)

**Python:**
```python
@router.get("/users", response_model=PaginatedResponse[UserResponse])
async def list_users(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    role: str | None = Query(default=None),
    search: str | None = Query(default=None),
    sort: Literal["name", "created_at"] = Query(default="created_at"),
    order: Literal["asc", "desc"] = Query(default="desc"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    users, total = await user_service.list_users(
        db, page=page, page_size=page_size, role=role, search=search, sort=sort, order=order,
    )
    return PaginatedResponse(
        data=users,
        meta=PaginationMeta(page=page, page_size=page_size, total=total, total_pages=-(-total // page_size)),
    )
```

### Create Endpoint

**TypeScript:**
```typescript
const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
});

app.post<{ Body: z.infer<typeof CreateUserSchema> }>(
  '/users',
  { preHandler: [app.authenticate] },
  async (request, reply) => {
    const body = CreateUserSchema.parse(request.body);
    const user = await userService.createUser(body);
    reply.status(201).header('Location', `/api/v1/users/${user.id}`).send({ data: user });
  },
);
```

---

## Idempotency

For non-idempotent operations (POST), accept an `Idempotency-Key` header:

```
POST /api/v1/orders
Idempotency-Key: ord_req_abc123

→ If key already processed, return cached response.
→ If key is new, process and store result with key.
→ Key expires after 24h.
```

**When:** Payment processing, order creation, any operation where double-submission would be destructive.

---

## Webhooks (Outbound)

When your API notifies external systems:

```json
{
  "id": "evt_abc123",
  "type": "order.completed",
  "created_at": "2026-02-14T10:00:00Z",
  "data": {
    "orderId": "ord_xyz",
    "amountMinor": 9999,
    "currency": "USD"
  }
}
```

**Rules:**
- Sign payloads with HMAC-SHA256. Include signature in header (`X-Webhook-Signature`).
- Retry with exponential backoff (3 attempts: 1min, 5min, 30min).
- Idempotent processing on receiver side (use `event.id` to deduplicate).
- Log delivery attempts. Provide a webhook log / retry UI for consumers.

## Webhooks (Inbound)

When your API receives webhooks from external services (Stripe, GitHub, etc.):

```python
# Python – Verify webhook signature (HMAC-SHA256)
import hmac
import hashlib

async def verify_webhook(request: Request) -> dict:
    body = await request.body()
    signature = request.headers.get("X-Webhook-Signature", "")
    expected = hmac.new(
        settings.webhook_secret.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature, expected):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    payload = json.loads(body)

    # Replay attack prevention: reject events older than 5 minutes
    event_timestamp = datetime.fromisoformat(payload["created_at"])
    if datetime.now(timezone.utc) - event_timestamp > timedelta(minutes=5):
        raise HTTPException(status_code=400, detail="Event too old")

    return payload
```

```typescript
// TypeScript – Verify webhook signature
import crypto from 'node:crypto';

function verifyWebhookSignature(body: Buffer, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

app.post('/webhooks/stripe', {
  config: { rawBody: true }, // Fastify: need raw body for signature verification
}, async (request, reply) => {
  const signature = request.headers['x-webhook-signature'] as string;
  if (!verifyWebhookSignature(request.rawBody!, signature, env.WEBHOOK_SECRET)) {
    return reply.status(401).send({ error: 'Invalid signature' });
  }

  const event = JSON.parse(request.rawBody!.toString());
  await processWebhookEvent(event); // Must be idempotent (dedup by event.id)
  return reply.status(200).send({ received: true });
});
```

**Rules:**
- **Always verify signature** (HMAC-SHA256) before processing.
- **Replay window:** Reject events older than 5 minutes (timestamp in payload).
- **Idempotent processing:** Deduplicate by `event.id` (store processed event IDs in DB with unique constraint).
- **Respond 200 quickly:** Acknowledge receipt, then process async (queue the work). External providers retry on non-2xx.
- **Log everything:** event type, event ID, processing result, duration.

---

## Response Envelope

Standard wrapper for all successful responses:

```json
// Single resource
{ "data": { "id": "1", "name": "Jane" } }

// List
{ "data": [...], "meta": { "page": 1, "pageSize": 20, "total": 156, "totalPages": 8 } }

// Create
{ "data": { "id": "new-1", "name": "Jane" } }
// + 201 status + Location header

// Delete
// 204 No Content (no body)

// Error
{ "errorCode": "NOT_FOUND", "message": "User not found", "requestId": "req_abc" }
```

**Rule:** Consistent envelope across the entire API. Frontend Fetch Wrapper pattern expects this shape.

---

## Resilience Patterns (Service-to-Service)

When your backend calls external services, failures are not exceptional – they're expected. Design for it.

### Circuit Breaker

Prevents cascading failures by stopping calls to a failing service.

```
States: CLOSED → OPEN → HALF_OPEN → CLOSED
        (normal)  (reject fast)  (test recovery)

CLOSED:  Forward all requests. Track failures.
         If failure_count > threshold within window → switch to OPEN.
OPEN:    Reject immediately (return fallback/error). Don't call downstream.
         After timeout → switch to HALF_OPEN.
HALF_OPEN: Allow ONE probe request.
           If success → CLOSED. If failure → OPEN again.
```

**Python:**
```python
import time
from enum import StrEnum
from dataclasses import dataclass, field

class CircuitState(StrEnum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

@dataclass
class CircuitBreaker:
    failure_threshold: int = 5
    recovery_timeout: float = 30.0
    _state: CircuitState = field(default=CircuitState.CLOSED, init=False)
    _failure_count: int = field(default=0, init=False)
    _last_failure_time: float = field(default=0.0, init=False)

    def can_execute(self) -> bool:
        if self._state == CircuitState.CLOSED:
            return True
        if self._state == CircuitState.OPEN:
            if time.monotonic() - self._last_failure_time > self.recovery_timeout:
                self._state = CircuitState.HALF_OPEN
                return True
            return False
        return True  # HALF_OPEN: allow probe

    def record_success(self) -> None:
        self._failure_count = 0
        self._state = CircuitState.CLOSED

    def record_failure(self) -> None:
        self._failure_count += 1
        self._last_failure_time = time.monotonic()
        if self._failure_count >= self.failure_threshold:
            self._state = CircuitState.OPEN


# Usage pattern (wrap in a service)
payment_circuit = CircuitBreaker(failure_threshold=5, recovery_timeout=30)

async def charge_payment(amount: float) -> PaymentResult:
    if not payment_circuit.can_execute():
        raise ServiceUnavailableError("Payment service is temporarily unavailable")
    try:
        result = await payment_client.charge(amount)
        payment_circuit.record_success()
        return result
    except (httpx.TimeoutException, httpx.HTTPStatusError) as exc:
        payment_circuit.record_failure()
        raise
```

**Production alternative:** Use `pybreaker` (Python) or `opossum` (Node.js) for battle-tested implementations.

### Retry with Exponential Backoff + Jitter

```python
import asyncio
import random

async def retry_with_backoff[T](
    operation: Callable[[], Awaitable[T]],
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 30.0,
    retryable_errors: tuple[type[Exception], ...] = (httpx.TimeoutException, httpx.HTTPStatusError),
) -> T:
    for attempt in range(max_retries + 1):
        try:
            return await operation()
        except retryable_errors:
            if attempt == max_retries:
                raise
            delay = min(base_delay * (2 ** attempt), max_delay)
            jitter = delay * random.uniform(0.5, 1.0)  # Jitter prevents thundering herd
            await asyncio.sleep(jitter)
    raise RuntimeError("Unreachable")
```

```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: { maxRetries?: number; baseDelay?: number; maxDelay?: number } = {},
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000 } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = Math.min(baseDelay * 2 ** attempt, maxDelay);
      const jitter = delay * (0.5 + Math.random() * 0.5);
      await new Promise((resolve) => setTimeout(resolve, jitter));
    }
  }
  throw new Error('Unreachable');
}
```

**Rules:**
- Only retry **idempotent** operations (GET, PUT, DELETE). Never retry non-idempotent POST without an idempotency key.
- Only retry **transient** errors (timeout, 503, 429). Never retry 400, 401, 404.
- Always add **jitter** – without it, all retries from all clients hit at the same time (thundering herd).

### Bulkhead

Isolate failures by limiting concurrent calls per downstream service.

```python
import asyncio

class Bulkhead:
    def __init__(self, max_concurrent: int):
        self._semaphore = asyncio.Semaphore(max_concurrent)

    async def execute[T](self, operation: Callable[[], Awaitable[T]], timeout: float = 10.0) -> T:
        try:
            async with asyncio.timeout(timeout):
                async with self._semaphore:
                    return await operation()
        except asyncio.TimeoutError:
            raise ServiceUnavailableError("Bulkhead timeout: too many concurrent requests")

# Usage: Limit to 10 concurrent payment calls
payment_bulkhead = Bulkhead(max_concurrent=10)
result = await payment_bulkhead.execute(lambda: payment_client.charge(amount))
```

**Why:** If payment service is slow, without a bulkhead ALL your threads/connections get consumed waiting for it, and your entire API goes down. With a bulkhead, only 10 connections are at risk.

### Timeouts

**Rule:** Every outbound call needs a timeout. No exceptions.

| Call Type | Timeout | Rationale |
|-----------|---------|-----------|
| HTTP to external API | 5–10s | External services are unpredictable |
| Database query | 5–30s | Long queries should be background jobs |
| Redis | 1–3s | Cache misses must be fast |
| Internal microservice | 3–5s | Should be fast, fail fast if not |

```python
# Python (httpx)
async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0)) as client:
    response = await client.get("https://api.example.com/data")
```

```typescript
// Node.js (fetch with AbortController)
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10_000);
try {
  const response = await fetch(url, { signal: controller.signal });
} finally {
  clearTimeout(timeoutId);
}
```
