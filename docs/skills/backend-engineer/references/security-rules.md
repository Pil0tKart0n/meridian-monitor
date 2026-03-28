# Security Rules

Prioritized security rules for backend applications. Every rule has an ID for reference in code reviews, CI, and ADRs.

---

## Security Mindset: Think Before You Code

### `sec-threat-model` – Threat Modeling

Before building auth, payments, or any security-sensitive feature, ask:

1. **What are we protecting?** (user data, financial transactions, admin access)
2. **Who would attack this?** (external hacker, malicious user, compromised insider)
3. **How would they attack?** (injection, stolen credentials, privilege escalation, data exfiltration)
4. **What's the impact?** (data breach, financial loss, reputation damage)

**Lightweight approach:** For each new feature, spend 10 minutes on these 4 questions. Document the answers in the PR description or ADR. For critical systems (payments, auth, PII), conduct a formal threat modeling session using STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).

**Rule:** Security is cheapest to fix in design. Every hour spent threat modeling saves 10 hours fixing vulnerabilities in production.

---

## Priority: CRITICAL

These vulnerabilities are actively exploited. Fix immediately.

### `sec-injection` – SQL / NoSQL / Command Injection

**Rule:** Never interpolate user input into queries or shell commands.

```python
# ❌ SQL injection
query = f"SELECT * FROM users WHERE email = '{email}'"

# ✅ Parameterized (SQLAlchemy)
result = await db.execute(select(User).where(User.email == email))

# ✅ Parameterized (raw)
result = await db.execute(text("SELECT * FROM users WHERE email = :email"), {"email": email})
```

```typescript
// ❌ SQL injection
const users = await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ Parameterized
const users = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;

// ✅ ORM (always safe)
const users = await prisma.user.findMany({ where: { email } });
```

**Command injection:**
```python
# ❌ Shell injection
os.system(f"convert {filename} output.png")

# ✅ Use subprocess with list args (no shell)
subprocess.run(["convert", filename, "output.png"], check=True)
```

### `sec-auth-bypass` – Authentication Bypass

**Rule:** Every non-public endpoint must verify authentication. Use middleware/dependency, never manual checks.

```python
# ❌ Manual check in each handler (easy to forget)
@router.get("/users")
async def list_users(request: Request):
    token = request.headers.get("Authorization")
    if not token: ...

# ✅ Dependency injection (impossible to forget once wired)
@router.get("/users")
async def list_users(current_user: User = Depends(get_current_user)):
    ...
```

**Rule:** Apply auth at the router/plugin level, not per-handler, to prevent accidental exposure.

```python
# Python: Apply to all routes in router
router = APIRouter(dependencies=[Depends(get_current_user)])
```

```typescript
// TypeScript: Fastify plugin-level auth
app.addHook('onRequest', app.authenticate);
// Or per-route: { preHandler: [app.authenticate] }
```

### `sec-secrets` – Secret Management

**Rule:** Secrets in environment variables. Never in code, logs, error messages, or version control.

| Secret | Storage | Access |
|--------|---------|--------|
| DB password | Env var / secret manager | Config module only |
| JWT secret | Env var / secret manager | Auth module only |
| API keys | Env var / secret manager | Relevant service only |
| Encryption keys | Secret manager (AWS KMS, Vault) | Crypto module only |

```bash
# .gitignore (always)
.env
.env.*
*.pem
*.key
```

```python
# ❌ Secret in code
JWT_SECRET = "my-super-secret-key-123"

# ✅ From validated config
settings = Settings()  # Reads from env, fails if missing
```

**Rule:** Rotate secrets periodically. Support multiple active keys during rotation (accept old + new).

### `sec-password` – Password Storage

**Rule:** bcrypt or Argon2id. Never MD5, SHA-1, SHA-256, or plaintext.

```python
# Python (bcrypt directly – passlib is unmaintained, avoid it)
import bcrypt

def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(plain_password.encode(), bcrypt.gensalt(rounds=12)).decode()

def verify_password(plain_password: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed.encode())
```

For Argon2id (preferred for new projects):
```python
# Python (argon2-cffi)
from argon2 import PasswordHasher

ph = PasswordHasher(time_cost=3, memory_cost=65536)  # 64MB, 3 iterations
hashed = ph.hash(plain_password)
is_valid = ph.verify(hashed, plain_password)  # raises VerifyMismatchError on failure
```

```typescript
// TypeScript (bcrypt)
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;
const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);
const isValid = await bcrypt.compare(plainPassword, hashed);
```

**Rules:**
- bcrypt: cost factor ≥ 12. Argon2id: memory ≥ 64MB, iterations ≥ 3.
- Never log passwords (even hashed).
- Never return password hash in API responses.
- Timing-safe comparison (bcrypt/argon2 libraries do this automatically).

---

## Priority: HIGH

Serious vulnerabilities that need attention in every project.

### `sec-authz` – Authorization (Broken Access Control)

**Rule:** Always check authorization, not just authentication. "Who are you" ≠ "What can you do."

```python
# ❌ Only checks authentication
@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(get_current_user)):
    await user_service.delete(user_id)  # Any authenticated user can delete anyone!

# ✅ Checks authorization
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = require_permission(Permission.DELETE_USERS),
):
    await user_service.delete(user_id)
```

**IDOR (Insecure Direct Object Reference):**
```python
# ❌ User can access any order by guessing ID
@router.get("/orders/{order_id}")
async def get_order(order_id: str, current_user: User = Depends(get_current_user)):
    return await order_repository.get_by_id(order_id)

# ✅ Scope query to current user
@router.get("/orders/{order_id}")
async def get_order(order_id: str, current_user: User = Depends(get_current_user)):
    order = await order_repository.get_by_id_and_user(order_id, current_user.id)
    if not order:
        raise NotFoundError("Order", order_id)
    return order
```

### `sec-input-validation` – Input Validation

**Rule:** Validate ALL external input at boundaries. Schema-based (Pydantic/Zod), never manual `if` chains.

```python
# ❌ Manual validation
@router.post("/users")
async def create_user(body: dict):
    if "email" not in body: ...
    if len(body["name"]) > 100: ...

# ✅ Schema validation
class CreateUserRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    role: Literal["admin", "editor", "viewer"] = "viewer"

@router.post("/users")
async def create_user(body: CreateUserRequest):
    ...  # body is guaranteed valid and typed
```

**Additional input rules:**
- Limit request body size (default: 1MB. Configurable per route for file uploads).
- Validate path params and query params (type, range, enum).
- Sanitize filenames for file uploads (`pathlib.Path(name).name`, remove path traversal).
- Reject unexpected fields (`model_config = ConfigDict(extra="forbid")` in Pydantic).

### `sec-rate-limit` – Rate Limiting

**Rule:** Rate limit auth endpoints, public APIs, and expensive operations.

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Login / Register | 5 req | 1 min |
| Password reset | 3 req | 1 min |
| Public API | 100 req | 1 min |
| Authenticated API | 1000 req | 1 min |
| File upload | 10 req | 1 min |

**Response:** `429 Too Many Requests` + `Retry-After` header.

**Implementation:** Redis-backed for distributed systems. In-memory for single-instance.

### `sec-cors` – CORS Configuration

**Rule:** Never `allow_origins=["*"]` in production. Explicit allow list only.

```python
# ❌ Wide open
allow_origins=["*"]

# ✅ Explicit
allow_origins=["https://app.example.com", "https://admin.example.com"]
```

**Rules:**
- `allow_credentials=True` requires explicit origins (not `*`).
- Only allow methods the API actually uses.
- Only allow headers the frontend actually sends.

### `sec-headers` – Security Headers

Set via middleware:

```python
# Python (FastAPI – use @app.middleware, NOT BaseHTTPMiddleware which has perf issues)
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-XSS-Protection"] = "0"  # Modern browsers: CSP instead
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response
```

```typescript
// TypeScript (Fastify hook)
app.addHook('onSend', async (_request, reply) => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
});
```

### `sec-jwt` – JWT Security

**Rules:**
- Access tokens: short-lived (15 min). Contains `sub` (user ID), `role`, `exp`, `iat`.
- Refresh tokens: long-lived (7–30 days), stored in httpOnly secure cookie. Stored hashed in DB for revocation.
- Cookie flags: `HttpOnly`, `Secure`, `SameSite=Lax` (or `Strict`). If `SameSite=None` is required (cross-origin deployment), add CSRF protection (Double Submit Cookie or Origin header check).
- Always verify `exp`, `iss`, `aud`. Reject tokens missing required claims.
- Algorithm: `HS256` (symmetric, simple) or `RS256` (asymmetric, for distributed systems).
- Never store sensitive data in JWT payload (visible to anyone with the token).

```python
# Token creation (PyJWT – actively maintained; avoid python-jose which is unmaintained)
import jwt  # PyJWT
from datetime import datetime, timedelta, timezone

def create_access_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
```

**Refresh flow (with token rotation):**
1. Client sends refresh token (httpOnly cookie) to `/auth/refresh`.
2. Server validates refresh token against DB record (stored hashed, with `jti`, `user_id`, `family_id`, `expires_at`, `revoked_at`).
3. Server **invalidates** the old refresh token, issues new access token + **new** refresh token (rotation).
4. On **reuse detection** (revoked token presented again): revoke ALL tokens in that `family_id` – the family is compromised.
5. On logout: delete refresh token from DB and clear cookie.
6. On password change: invalidate ALL refresh tokens for user.

### `sec-error-exposure` – Error Information Leakage

**Rule:** Never expose stack traces, internal paths, or implementation details to clients.

```python
# ❌ Exposes internals
return JSONResponse(status_code=500, content={"error": str(exc), "traceback": traceback.format_exc()})

# ✅ Generic message + server-side logging
logger.error("unhandled_error", error=str(exc), traceback=traceback.format_exc(), request_id=request_id)
return JSONResponse(status_code=500, content={
    "errorCode": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "requestId": request_id,
})
```

**Rules:**
- `500` errors: log everything server-side, return generic message to client.
- `4xx` errors: return specific, helpful messages (but no internal details).
- Disable debug mode / stack trace pages in production (`docs_url=None`, `debug=False`).

---

## Priority: MEDIUM

Important for production applications.

### `sec-deps` – Dependency Auditing

**Rule:** Audit dependencies in CI. Block deploys on known critical vulnerabilities.

```bash
# Python
pip-audit
safety check

# Node.js
npm audit
npx audit-ci --critical
```

**Rules:**
- Pin exact versions in lockfile (`pip freeze > requirements.txt`, `package-lock.json`).
- Renovate or Dependabot for automated updates.
- Review changelogs before major version bumps.

### `sec-logging` – Secure Logging

**Rule:** Log operations, not data. Never log secrets or PII.

| ✅ Log | ❌ Never Log |
|--------|-------------|
| Request ID | Passwords (even hashed) |
| User ID | Auth tokens / API keys |
| Operation name | Credit card numbers |
| Status code | PII (email, phone, SSN) |
| Duration | Request bodies with sensitive fields |
| Error type + message | Full stack traces in response |

```python
# ❌ Logs sensitive data
logger.info("login_attempt", email=email, password=password)

# ✅ Logs operation safely
logger.info("login_attempt", email_hash=hashlib.sha256(email.encode()).hexdigest()[:8], success=True)
```

### `sec-file-upload` – File Upload Security

**Rules:**
- Validate file type by magic bytes, not just extension.
- Limit file size per route (`max_size: 10MB` for images, configurable).
- Rename uploaded files (UUID + original extension). Never use user-provided filename as-is.
- Store outside of webroot (S3, dedicated storage). Never serve uploaded files from app server directly.
- Scan for malware if accepting from untrusted sources.

```python
import magic

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

async def validate_upload(file: UploadFile) -> None:
    if file.size and file.size > MAX_FILE_SIZE:
        raise AppError("FILE_TOO_LARGE", f"Max file size is {MAX_FILE_SIZE // (1024*1024)}MB", 413)

    content = await file.read(2048)
    await file.seek(0)
    mime = magic.from_buffer(content, mime=True)
    if mime not in ALLOWED_MIME_TYPES:
        raise AppError("INVALID_FILE_TYPE", f"Allowed types: {', '.join(ALLOWED_MIME_TYPES)}", 415)
```

### `sec-mass-assignment` – Mass Assignment Protection

**Rule:** Never pass raw request body to ORM create/update. Use explicit schemas.

```python
# ❌ Mass assignment – user can set is_admin=True
user = User(**request.body)

# ✅ Explicit schema controls which fields are writable
class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    # is_admin NOT included – can't be set by client

user = User(**body.model_dump())
```

### `sec-timing` – Timing Attacks

**Rule:** Use constant-time comparison for secrets (tokens, API keys, passwords).

```python
import hmac

# ✅ Constant-time comparison
is_valid = hmac.compare_digest(provided_token, stored_token)

# ❌ Regular comparison (leaks info via timing)
is_valid = provided_token == stored_token
```

Note: bcrypt/argon2 libraries handle this automatically for password verification.

---

## Priority: LOW (but important for mature systems)

### `sec-csrf` – Cross-Site Request Forgery

**When:** If using cookie-based authentication (sessions). Not needed for Bearer token auth (CORS already prevents cross-origin requests).

**Pattern:** Double-submit cookie or synchronizer token.

### `sec-ssrf` – Server-Side Request Forgery

**When:** Backend fetches URLs provided by users (webhooks, image URLs, imports).

**Rule:** Validate and restrict target URLs:
- Block private IP ranges (`10.x`, `172.16-31.x`, `192.168.x`, `127.x`, `169.254.x`).
- Allowlist domains if possible.
- Set timeouts on outbound requests.
- Don't follow redirects blindly.

### `sec-encryption` – Data Encryption

**At rest:** Use DB-level encryption or application-level for sensitive fields (PII, payment data).
**In transit:** TLS everywhere. HSTS header. No HTTP in production.
**Keys:** Store in secret manager (AWS KMS, HashiCorp Vault). Never in code.

---

## Quick Reference Table

| ID | Rule | Priority |
|----|------|----------|
| `sec-threat-model` | Think before you code: who attacks, how, what's at stake | MINDSET |
| `sec-injection` | Parameterized queries, no string interpolation | CRITICAL |
| `sec-auth-bypass` | Auth on every non-public endpoint via middleware | CRITICAL |
| `sec-secrets` | Secrets in env vars / secret manager only | CRITICAL |
| `sec-password` | bcrypt or Argon2id, cost ≥ 12 | CRITICAL |
| `sec-authz` | Authorization check + IDOR prevention | HIGH |
| `sec-input-validation` | Schema validation on all external input | HIGH |
| `sec-rate-limit` | Rate limit auth + public + expensive endpoints | HIGH |
| `sec-cors` | Explicit origin allowlist, no wildcard | HIGH |
| `sec-headers` | Security headers via middleware | HIGH |
| `sec-jwt` | Short-lived access, httpOnly refresh, verify claims | HIGH |
| `sec-error-exposure` | No internals in client responses | HIGH |
| `sec-deps` | Audit dependencies in CI | MEDIUM |
| `sec-logging` | No secrets/PII in logs | MEDIUM |
| `sec-file-upload` | Validate type, size, rename, store safely | MEDIUM |
| `sec-mass-assignment` | Explicit schemas, never raw body to ORM | MEDIUM |
| `sec-timing` | Constant-time comparison for secrets | MEDIUM |
| `sec-csrf` | Double-submit cookie (if cookie auth) | LOW |
| `sec-ssrf` | Validate/restrict outbound URLs | LOW |
| `sec-encryption` | TLS in transit, encryption at rest for sensitive data | LOW |
