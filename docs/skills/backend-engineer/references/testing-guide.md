# Testing Guide

Testing patterns for backend applications. Test behavior, not implementation.

---

## Testing Philosophy

1. **Test what matters.** Business logic, edge cases, error paths. Not framework boilerplate.
2. **Test behavior, not implementation.** Test WHAT happens, not HOW it happens. Refactoring should not break tests.
3. **Fast feedback loop.** Unit tests: < 5ms each. Integration tests: < 500ms each. Total suite: < 2 minutes.
4. **Tests are documentation.** Test names describe expected behavior. A new developer reads tests to understand the system.
5. **One assertion per concept.** A test can have multiple `assert` statements, but they should verify one logical concept.

---

## Test Pyramid

```
          ┌─────────┐
          │  E2E    │  Few – critical user journeys only
          │ (API)   │  Full stack, real DB, slow
          ├─────────┤
          │  Integ- │  Moderate – endpoint behavior
          │  ration │  Real DB (test instance), HTTP
          ├─────────┤
          │  Unit   │  Many – business logic, utils
          │  Tests  │  Fast, no I/O, mocked dependencies
          └─────────┘
```

| Type | Scope | Speed | Dependencies |
|------|-------|-------|--------------|
| **Unit** | Single function/class | < 5ms | Mocked |
| **Integration** | Endpoint → DB round-trip | < 500ms | Real DB (test instance) |
| **E2E / API** | Full request lifecycle | < 2s | Real stack |
| **Contract** | Schema agreement (API ↔ consumer) | < 100ms | Schema only |
| **Load** | Performance under stress | Minutes | Full stack |

---

## Test Naming

**Python (pytest):**
```python
# Pattern: test_[subject]_[condition]_[expected]
def test_create_user_with_valid_data_returns_201():
def test_create_user_with_duplicate_email_returns_409():
def test_create_user_without_auth_returns_401():
def test_list_users_with_pagination_returns_correct_page():
def test_delete_user_as_viewer_returns_403():
```

**TypeScript (Vitest):**
```typescript
// Pattern: describe(subject) → it(condition → expected)
describe('createUser', () => {
  it('returns 201 with valid data', async () => {});
  it('returns 409 when email is duplicate', async () => {});
  it('returns 401 without authentication', async () => {});
});

describe('listUsers', () => {
  it('returns paginated results with correct meta', async () => {});
  it('filters by role when role param provided', async () => {});
});
```

---

## Unit Tests

Test pure business logic. No I/O, no database, no HTTP. Mock external dependencies.

### Python (pytest)

```python
# services/user_service.py
class UserService:
    def __init__(self, user_repo: UserRepository, hasher: PasswordHasher):
        self.user_repo = user_repo
        self.hasher = hasher

    async def create_user(self, data: CreateUserRequest) -> User:
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise ConflictError("Email is already registered", {"email": "This email is already in use"})

        hashed_password = self.hasher.hash(data.password)
        user = User(id=str(uuid4()), name=data.name, email=data.email, hashed_password=hashed_password, role=data.role)
        return await self.user_repo.create(user)


# tests/test_user_service.py
import pytest
from unittest.mock import AsyncMock, MagicMock

@pytest.fixture
def mock_user_repo():
    repo = AsyncMock(spec=UserRepository)
    repo.get_by_email.return_value = None
    repo.create.side_effect = lambda user: user
    return repo

@pytest.fixture
def mock_hasher():
    hasher = MagicMock(spec=PasswordHasher)
    hasher.hash.return_value = "hashed_password_123"
    return hasher

@pytest.fixture
def user_service(mock_user_repo, mock_hasher):
    return UserService(user_repo=mock_user_repo, hasher=mock_hasher)


async def test_create_user_with_valid_data_creates_and_returns_user(user_service, mock_user_repo):
    request = CreateUserRequest(name="Jane Doe", email="jane@example.com", password="securepass123", role="editor")

    result = await user_service.create_user(request)

    assert result.name == "Jane Doe"
    assert result.email == "jane@example.com"
    assert result.role == "editor"
    mock_user_repo.create.assert_called_once()


async def test_create_user_with_duplicate_email_raises_conflict(user_service, mock_user_repo):
    mock_user_repo.get_by_email.return_value = User(id="existing", name="Existing", email="jane@example.com", hashed_password="x", role="viewer")
    request = CreateUserRequest(name="Jane Doe", email="jane@example.com", password="securepass123")

    with pytest.raises(ConflictError) as exc_info:
        await user_service.create_user(request)

    assert exc_info.value.error_code == "CONFLICT"
    assert "already registered" in exc_info.value.message
```

### TypeScript (Vitest)

```typescript
// modules/users/user.service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { UserService } from './user.service';
import { ConflictError } from '../../lib/errors';

function createMockRepo() {
  return {
    getByEmail: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation((data) => ({ id: 'new-id', ...data })),
  };
}

function createMockHasher() {
  return {
    hash: vi.fn().mockResolvedValue('hashed_password_123'),
  };
}

describe('UserService.createUser', () => {
  it('creates and returns user with valid data', async () => {
    const repo = createMockRepo();
    const hasher = createMockHasher();
    const service = new UserService(repo, hasher);

    const result = await service.createUser({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'securepass123',
      role: 'editor',
    });

    expect(result.name).toBe('Jane Doe');
    expect(result.email).toBe('jane@example.com');
    expect(repo.create).toHaveBeenCalledOnce();
  });

  it('throws ConflictError when email is duplicate', async () => {
    const repo = createMockRepo();
    repo.getByEmail.mockResolvedValue({ id: 'existing', email: 'jane@example.com' });
    const service = new UserService(repo, createMockHasher());

    await expect(
      service.createUser({ name: 'Jane', email: 'jane@example.com', password: 'pass123' }),
    ).rejects.toThrow(ConflictError);
  });
});
```

---

## Integration / API Tests

Test the full HTTP request → response cycle with a real (test) database.

### Python (pytest + httpx + TestClient)

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.lib.database import get_db, Base

TEST_DATABASE_URL = "postgresql+asyncpg://test:test@localhost:5432/test_db"

test_engine = create_async_engine(TEST_DATABASE_URL)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

@pytest.fixture(scope="session", autouse=True)
async def setup_database():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()

@pytest.fixture(autouse=True)
async def db_session():
    async with TestSessionLocal() as session:
        async with session.begin():
            yield session
        await session.rollback()  # Each test gets clean state

@pytest.fixture
async def override_db(db_session):
    async def _get_db():
        yield db_session
    app.dependency_overrides[get_db] = _get_db
    yield
    app.dependency_overrides.clear()

@pytest.fixture
async def client(override_db):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def auth_client(client):
    """Client with valid auth token."""
    # Register + login to get token (or mock auth dependency)
    response = await client.post("/api/v1/auth/login", json={"email": "admin@test.com", "password": "testpass"})
    token = response.json()["accessToken"]
    client.headers["Authorization"] = f"Bearer {token}"
    return client


# tests/test_users_api.py
async def test_create_user_returns_201(auth_client):
    response = await auth_client.post("/api/v1/users", json={
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "editor",
    })

    assert response.status_code == 201
    data = response.json()["data"]
    assert data["name"] == "Jane Doe"
    assert data["email"] == "jane@example.com"
    assert "id" in data
    assert "Location" in response.headers

async def test_create_user_duplicate_email_returns_409(auth_client):
    await auth_client.post("/api/v1/users", json={"name": "First", "email": "dupe@test.com"})
    response = await auth_client.post("/api/v1/users", json={"name": "Second", "email": "dupe@test.com"})

    assert response.status_code == 409
    assert response.json()["errorCode"] == "CONFLICT"

async def test_create_user_invalid_email_returns_422(auth_client):
    response = await auth_client.post("/api/v1/users", json={"name": "Jane", "email": "not-an-email"})

    assert response.status_code == 422
    assert response.json()["errorCode"] == "VALIDATION_ERROR"
    assert "email" in response.json()["details"]

async def test_create_user_without_auth_returns_401(client):
    response = await client.post("/api/v1/users", json={"name": "Jane", "email": "jane@test.com"})
    assert response.status_code == 401

async def test_list_users_returns_paginated_response(auth_client):
    # Create test data
    for i in range(25):
        await auth_client.post("/api/v1/users", json={"name": f"User {i}", "email": f"user{i}@test.com"})

    response = await auth_client.get("/api/v1/users?page=2&pageSize=10")

    assert response.status_code == 200
    body = response.json()
    assert len(body["data"]) == 10
    assert body["meta"]["page"] == 2
    assert body["meta"]["total"] >= 25

async def test_delete_user_as_viewer_returns_403(viewer_client):
    response = await viewer_client.delete("/api/v1/users/some-id")
    assert response.status_code == 403
```

### TypeScript (Vitest + Fastify inject)

```typescript
// tests/setup.ts
import { buildApp } from '../src/app';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;

export async function getTestApp(): Promise<FastifyInstance> {
  if (!app) {
    app = await buildApp();
    await app.ready();
  }
  return app;
}

// tests/users.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { getTestApp } from './setup';
import type { FastifyInstance } from 'fastify';

describe('POST /api/v1/users', () => {
  let app: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    app = await getTestApp();
    // Get auth token
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'admin@test.com', password: 'testpass' },
    });
    authToken = loginResponse.json().accessToken;
  });

  it('returns 201 with valid data', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/users',
      headers: { authorization: `Bearer ${authToken}` },
      payload: { name: 'Jane Doe', email: 'jane@example.com', role: 'editor' },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.name).toBe('Jane Doe');
    expect(response.headers.location).toBeDefined();
  });

  it('returns 409 when email is duplicate', async () => {
    const payload = { name: 'First', email: 'dupe@test.com' };
    await app.inject({ method: 'POST', url: '/api/v1/users', headers: { authorization: `Bearer ${authToken}` }, payload });
    const response = await app.inject({ method: 'POST', url: '/api/v1/users', headers: { authorization: `Bearer ${authToken}` }, payload });

    expect(response.statusCode).toBe(409);
    expect(response.json().errorCode).toBe('CONFLICT');
  });

  it('returns 401 without authentication', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/users',
      payload: { name: 'Jane', email: 'jane@test.com' },
    });

    expect(response.statusCode).toBe(401);
  });
});
```

---

## Database Tests

Test queries directly when complex logic lives in the repository layer.

```python
async def test_list_users_filters_soft_deleted(db_session):
    repo = UserRepository(db_session)
    active_user = await repo.create(User(id="1", name="Active", email="a@test.com", hashed_password="x"))
    deleted_user = await repo.create(User(id="2", name="Deleted", email="d@test.com", hashed_password="x"))
    await repo.soft_delete(deleted_user)

    users, total = await repo.list_users()

    assert total == 1
    assert users[0].id == active_user.id

async def test_list_users_search_by_name(db_session):
    repo = UserRepository(db_session)
    await repo.create(User(id="1", name="Alice Smith", email="a@test.com", hashed_password="x"))
    await repo.create(User(id="2", name="Bob Jones", email="b@test.com", hashed_password="x"))

    users, total = await repo.list_users(search="alice")

    assert total == 1
    assert users[0].name == "Alice Smith"
```

---

## Test Fixtures & Factories

### Python (Factory Pattern)

```python
# tests/factories.py
from dataclasses import dataclass, field
from uuid import uuid4

@dataclass
class UserFactory:
    id: str = field(default_factory=lambda: str(uuid4()))
    name: str = "Test User"
    email: str = field(default_factory=lambda: f"user-{uuid4().hex[:8]}@test.com")
    hashed_password: str = "hashed_test_password"
    role: str = "viewer"
    is_active: bool = True

    def build(self, **overrides) -> User:
        data = {**self.__dict__, **overrides}
        return User(**data)

    async def create(self, db: AsyncSession, **overrides) -> User:
        user = self.build(**overrides)
        db.add(user)
        await db.flush()
        return user


# Usage in tests
async def test_example(db_session):
    factory = UserFactory()
    admin = await factory.create(db_session, role="admin", name="Admin User")
    viewer = await factory.create(db_session, role="viewer")
    ...
```

### TypeScript (Builder Pattern)

```typescript
// tests/helpers/user-factory.ts
import { randomUUID } from 'node:crypto';
import { prisma } from '../../src/lib/db';

export function buildUser(overrides: Partial<UserCreateInput> = {}) {
  return {
    id: randomUUID(),
    name: 'Test User',
    email: `user-${randomUUID().slice(0, 8)}@test.com`,
    hashedPassword: 'hashed_test_password',
    role: 'viewer',
    isActive: true,
    ...overrides,
  };
}

export async function createUser(overrides: Partial<UserCreateInput> = {}) {
  return prisma.user.create({ data: buildUser(overrides) });
}

// Usage
const admin = await createUser({ role: 'admin', name: 'Admin' });
```

---

## Mocking External Services

### HTTP Calls

```python
# Python (respx for httpx mocking)
import respx

@respx.mock
async def test_payment_service_handles_timeout():
    respx.post("https://payment.example.com/charge").mock(side_effect=httpx.TimeoutException("timeout"))

    result = await payment_service.charge(amount=99.99, token="tok_123")

    assert result.status == "failed"
    assert result.error == "Payment provider timeout"
```

```typescript
// TypeScript (msw for HTTP mocking)
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.post('https://payment.example.com/charge', () => {
    return HttpResponse.json({ id: 'ch_123', status: 'succeeded' });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('processes payment successfully', async () => {
  const result = await paymentService.charge({ amount: 99.99, token: 'tok_123' });
  expect(result.status).toBe('succeeded');
});

it('handles payment provider timeout', async () => {
  server.use(
    http.post('https://payment.example.com/charge', () => {
      return HttpResponse.error();
    }),
  );

  const result = await paymentService.charge({ amount: 99.99, token: 'tok_123' });
  expect(result.status).toBe('failed');
});
```

### Redis / Cache

```python
# Python – use fakeredis for testing
import fakeredis.aioredis

@pytest.fixture
def redis_client():
    return fakeredis.aioredis.FakeRedis()

async def test_cache_stores_and_retrieves(redis_client):
    cache = CacheService(redis_client)
    await cache.set("user:123", {"name": "Jane"}, ttl=60)

    result = await cache.get("user:123")
    assert result == {"name": "Jane"}
```

---

## Contract Tests

Verify that API responses match the schema the frontend expects.

```python
# Python – Pydantic schema as contract
async def test_user_response_matches_contract(auth_client):
    response = await auth_client.get("/api/v1/users/existing-id")
    body = response.json()

    # Validate against the response schema
    user = UserResponse.model_validate(body["data"])
    assert user.id
    assert user.email
    assert user.role in ("admin", "editor", "viewer")
```

```typescript
// TypeScript – Zod schema as contract
import { UserResponseSchema } from '../src/modules/users/user.schema';

it('user response matches frontend contract', async () => {
  const response = await app.inject({ method: 'GET', url: '/api/v1/users/existing-id', headers: { authorization: `Bearer ${token}` } });

  const parsed = UserResponseSchema.safeParse(response.json().data);
  expect(parsed.success).toBe(true);
});
```

**When:** Cross-team APIs, public APIs, frontend consuming backend. Ensures changes don't break consumers.

---

## Property-Based Testing

Instead of writing specific test cases, define **properties** that should always hold. The framework generates hundreds of random inputs automatically. Finds edge cases you don't think of.

### Python (Hypothesis)

```python
from hypothesis import given, strategies as st, assume
from app.services.pricing import calculate_discount

@given(
    price=st.floats(min_value=0.01, max_value=100_000, allow_nan=False, allow_infinity=False),
    quantity=st.integers(min_value=1, max_value=10_000),
)
def test_discount_never_exceeds_original_price(price: float, quantity: int):
    """No matter what inputs, discount should never make the total negative."""
    total = calculate_discount(price=price, quantity=quantity)
    assert total >= 0
    assert total <= price * quantity


@given(data=st.text(min_size=1, max_size=1000))
def test_serialize_deserialize_roundtrip(data: str):
    """Serialization → deserialization must return the original input."""
    serialized = serialize(data)
    deserialized = deserialize(serialized)
    assert deserialized == data


# Test Pydantic schema accepts valid data and rejects invalid
from hypothesis import given
from hypothesis_jsonschema import from_schema

@given(from_schema(CreateUserRequest.model_json_schema()))
def test_create_user_schema_accepts_valid_json(data):
    """Schema should accept any data that matches its own JSON schema."""
    CreateUserRequest.model_validate(data)
```

### TypeScript (fast-check)

```typescript
import fc from 'fast-check';

test('discount never exceeds original price', () => {
  fc.assert(
    fc.property(
      fc.float({ min: 0.01, max: 100_000, noNaN: true }),
      fc.integer({ min: 1, max: 10_000 }),
      (price, quantity) => {
        const total = calculateDiscount(price, quantity);
        return total >= 0 && total <= price * quantity;
      },
    ),
  );
});

test('JSON serialize/deserialize roundtrip', () => {
  fc.assert(
    fc.property(fc.anything(), (data) => {
      const serialized = JSON.stringify(data);
      const deserialized = JSON.parse(serialized);
      expect(deserialized).toEqual(data);
    }),
  );
});
```

### When to use Property-Based Testing

| ✅ Use for | ❌ Skip for |
|-----------|------------|
| Serialization / deserialization roundtrips | Simple CRUD endpoint behavior |
| Mathematical invariants (pricing, tax, discounts) | UI-specific logic |
| Parsers and validators (schema accepts valid, rejects invalid) | Mocked service interactions |
| Encoding/decoding (base64, URL encoding, compression) | Tests that need specific fixtures |
| Data transformations (sort stability, filter completeness) | Slow integration tests |

**Rule:** Property-based tests complement, not replace, example-based tests. Use both.

---

## Load / Performance Tests

Use for pre-launch validation and after major changes.

```python
# k6 (JavaScript-based, runs outside app)
# load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up to 50 users
    { duration: '1m', target: 50 },     // Stay at 50
    { duration: '10s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],     // < 1% errors
  },
};

export default function () {
  const response = http.get('http://localhost:8000/api/v1/users', {
    headers: { Authorization: `Bearer ${__ENV.TOKEN}` },
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

```bash
# Run
k6 run --env TOKEN=your_token load-test.js
```

**Targets (baseline):**
- p95 response time: < 500ms for CRUD, < 2s for complex queries
- Error rate: < 1%
- Throughput: depends on expected traffic (define before testing)

---

## Test Configuration

### pytest.ini / pyproject.toml

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"  # Requires: pip install pytest-asyncio
testpaths = ["tests"]
markers = [
    "slow: marks tests as slow (use -m 'not slow' to skip)",
    "integration: marks integration tests",
]
filterwarnings = ["ignore::DeprecationWarning"]
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['tests/**', '**/*.d.ts', '**/types/**'],
    },
    setupFiles: ['tests/setup.ts'],
  },
});
```

---

## CI Pipeline

```yaml
# .github/workflows/test.yml (simplified)
test:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:18
      env:
        POSTGRES_DB: test_db
        POSTGRES_USER: test
        POSTGRES_PASSWORD: test
      ports: ["5432:5432"]
    redis:
      image: redis:7
      ports: ["6379:6379"]
  steps:
    - uses: actions/checkout@v4
    - name: Setup Python
      uses: actions/setup-python@v5
      with: { python-version: "3.12" }
    - run: pip install -e ".[dev]"
    - run: ruff check . && ruff format --check .
    - run: mypy .
    - run: pytest --cov --cov-report=xml
```

---

## What NOT to Test

- Framework boilerplate (FastAPI/Fastify routing itself works).
- Third-party library internals (Pydantic validation rules work).
- Private methods directly (test through public interface).
- Exact error messages (test error codes and status codes, messages change).
- Database auto-generated fields (timestamps, UUIDs – test that they exist, not exact values).

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Testing implementation details | Refactoring breaks tests | Test behavior (inputs → outputs) |
| Shared mutable test state | Tests affect each other | Isolate: fresh DB state per test |
| Slow test suite | Developers skip tests | Unit tests fast, integration tests parallelized |
| No assertion | Test passes but verifies nothing | Every test must assert expected behavior |
| Over-mocking | Tests pass but code is broken | Integration tests with real DB for critical paths |
| Snapshot testing for APIs | Fragile, hard to review | Explicit assertions on key fields |
