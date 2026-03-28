# Tech Stack Decision Guide

## Decision Axes

**Axis 1 – Language:**
- Python: Data-heavy, ML integration, rapid prototyping, script-to-service
- Node.js/TypeScript: Full-stack JS teams, shared types with frontend, real-time, complex business logic

**Axis 2 – Scale:**
- Single API / microservice → FastAPI or Fastify
- Larger monolith → Fastify + modules or FastAPI + domain packages
- Enterprise, many teams → Consider NestJS (opinionated, Angular-like structure)

---

## Python Stack (FastAPI)

**Choose when:** APIs, data services, ML endpoints, quick backends, teams with Python expertise.

### Libraries (2026)

| Concern | Library | Notes |
|---------|---------|-------|
| Framework | **FastAPI** | Async, auto OpenAPI, Pydantic integration |
| Validation | **Pydantic v2** | Fast, strict, BaseSettings for config |
| ORM | **SQLAlchemy 2.0** | Async support, mature, flexible |
| Migrations | **Alembic** | SQLAlchemy-native, autogenerate |
| Async DB driver | **asyncpg** (Postgres) | High-performance async Postgres |
| Testing | **pytest** + **httpx** | pytest-asyncio for async tests |
| HTTP client | **httpx** | Async-native, requests-compatible API |
| Task queue | **Celery** + Redis or **ARQ** | Celery for complex, ARQ for simple async |
| Caching | **Redis** via **redis-py** | Cache-aside, sessions, rate limiting |
| Logging | **structlog** | Structured JSON logging |
| Linting/Format | **Ruff** | Replaces flake8 + isort + black. Fast. |
| Type checking | **mypy** or **pyright** | `--strict` mode in CI |
| Security | **PyJWT** (JWT), **bcrypt** (hashing) | Or `argon2-cffi` for Argon2 |
| Error reporting | **Sentry SDK** | Production error tracking |
| ASGI server | **uvicorn** + **gunicorn** | uvicorn for dev, gunicorn+uvicorn workers for production |

### Scaffolding

```bash
# Project setup
mkdir my-api && cd my-api
python -m venv .venv && source .venv/bin/activate

# pyproject.toml (modern Python packaging)
cat > pyproject.toml << 'EOF'
[project]
name = "my-api"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115",
    "uvicorn[standard]>=0.30",
    "pydantic>=2.9",
    "pydantic-settings>=2.5",
    "sqlalchemy>=2.0",
    "asyncpg>=0.30",
    "alembic>=1.14",
    "httpx>=0.28",
    "structlog>=24.4",
    "redis>=5.2",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.3",
    "pytest-asyncio>=0.24",
    "pytest-cov>=6.0",
    "httpx",
    "ruff>=0.8",
    "mypy>=1.13",
    "sentry-sdk[fastapi]>=2.19",
]

[tool.ruff]
target-version = "py312"
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP", "B", "SIM", "RUF"]

[tool.mypy]
strict = true
plugins = ["pydantic.mypy"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
EOF

pip install -e ".[dev]"

# Alembic init
alembic init migrations
```

### FastAPI App Template

```python
# src/app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import users, health
from app.lib.database import engine
from app.middleware.error_handler import register_error_handlers

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # await create_db_pool(), warm caches, etc.
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs" if settings.environment != "production" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    allow_credentials=True,
)

register_error_handlers(app)

app.include_router(health.router)
app.include_router(users.router, prefix="/api/v1")
```

---

## Node.js Stack (TypeScript + Fastify)

**Choose when:** Full-stack JS teams, complex apps, shared types with React frontend, WebSocket needs.

### Libraries (2026)

| Concern | Library | Notes |
|---------|---------|-------|
| Framework | **Fastify** | Performance, plugin system, schema validation |
| Validation | **Zod** | Shared with frontend, type inference |
| ORM | **Prisma** (default) or **Drizzle** | Prisma: DX + migrations. Drizzle: SQL-close, lighter |
| Testing | **Vitest** + **supertest** or `inject()` | Fastify has built-in `inject()` for testing |
| HTTP client | **undici** (built-in) or **ky** | `fetch` is native in Node 18+ |
| Task queue | **BullMQ** + Redis | Robust, typed, dashboard available |
| Caching | **Redis** via **ioredis** | Mature, cluster support |
| Logging | **pino** | Built into Fastify, JSON, fast |
| Linting/Format | **ESLint** + **Prettier** | Or Biome for all-in-one |
| Security | **@fastify/jwt**, **@fastify/rate-limit** | Plugin ecosystem |
| Error reporting | **Sentry** | Production error tracking |

### Alternative: Express

Express is still viable for simple APIs or teams already familiar with it. Choose Fastify for new projects (better performance, built-in validation, schema-first). Choose Express only if ecosystem requirements (specific middleware) demand it.

### Alternative: NestJS

Choose NestJS when: 5+ developers, enterprise, strict architecture needed, team prefers opinionated frameworks. NestJS provides DI, modules, guards, interceptors – similar philosophy to Angular. Higher learning curve but better structure at scale.

### Scaffolding

```bash
mkdir my-api && cd my-api
npm init -y
npm install fastify @fastify/cors @fastify/jwt @fastify/rate-limit
npm install zod @prisma/client ioredis pino
npm install -D typescript @types/node vitest supertest @types/supertest
npm install -D prisma eslint prettier @sentry/node

npx tsc --init  # Then set strict: true, module: "ESNext", etc.
npx prisma init
```

### Fastify App Template

```typescript
// src/app.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config';
import { userRoutes } from './modules/users/user.routes';
import { healthRoutes } from './modules/health/health.routes';
import { errorHandler } from './middleware/error-handler';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport: env.NODE_ENV === 'development'
        ? { target: 'pino-pretty' }
        : undefined,
    },
  });

  await app.register(cors, {
    origin: env.CORS_ORIGINS,
    credentials: true,
  });

  app.setErrorHandler(errorHandler);

  await app.register(healthRoutes);
  await app.register(userRoutes, { prefix: '/api/v1' });

  return app;
}
```

```typescript
// src/server.ts
import { buildApp } from './app';
import { env } from './config';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, shutting down...`);
      await app.close();
      process.exit(0);
    });
  }
}

start();
```

### Node.js Concurrency Patterns

**worker_threads** – for CPU-intensive tasks without blocking the event loop:

```typescript
// lib/worker-pool.ts
import { Worker } from 'node:worker_threads';

export function runInWorker<T>(workerPath: string, data: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerPath, { workerData: data });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
    });
  });
}

// Usage: Heavy PDF generation, data parsing, hashing
const result = await runInWorker<Buffer>('./workers/generate-pdf.js', { orderId });
```

**AsyncLocalStorage** – request-scoped context without prop-drilling (tracing, user context):

```typescript
import { AsyncLocalStorage } from 'node:async_hooks';

interface RequestContext {
  requestId: string;
  userId?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

// Middleware: set context per request
app.addHook('onRequest', async (request) => {
  requestContext.enterWith({
    requestId: request.id,
    userId: request.user?.id,
  });
});

// Access anywhere in the call chain – no prop-drilling
export function getRequestId(): string {
  return requestContext.getStore()?.requestId ?? 'unknown';
}
```

**When to use what:**

| Task | Solution |
|------|----------|
| HTTP calls, DB queries, file I/O | `async`/`await` (default, event loop handles it) |
| CPU-heavy: parsing, hashing, PDF gen | `worker_threads` |
| Request-scoped context (tracing, auth) | `AsyncLocalStorage` |
| Streaming large files | Node.js Streams (backpressure-aware) |

---

## When Python vs Node.js

| Factor | Python (FastAPI) | Node.js (Fastify) |
|--------|-----------------|-------------------|
| **Shared types with React FE** | ❌ Need OpenAPI codegen | ✅ Same Zod schemas, same TS types |
| **Data / ML integration** | ✅ Pandas, NumPy, scikit-learn native | ❌ Limited ML ecosystem |
| **Real-time (WebSocket)** | Possible but not idiomatic | ✅ Native, well-supported |
| **Performance** | Good (async), but GIL for CPU | Excellent I/O, single-threaded |
| **Team expertise** | Python team → FastAPI | JS/TS team → Fastify |
| **Rapid prototyping** | ✅ Less boilerplate | Comparable |
| **Type safety depth** | Good (mypy/pyright) | Excellent (native TS) |
| **Ecosystem maturity** | Very mature | Very mature |

**Simple rule:**
- Team writes React frontend? → **Node.js** (shared types, one language)
- Data-heavy or ML? → **Python**
- Either works? → Choose what the team knows best

---

## Docker (Both Stacks)

```dockerfile
# Python – Multi-Stage Build
FROM python:3.13-slim AS builder
WORKDIR /build
COPY pyproject.toml .
COPY src/ src/
RUN pip install --no-cache-dir --prefix=/install .

FROM python:3.13-slim
WORKDIR /app
COPY --from=builder /install /usr/local
COPY src/ src/
RUN useradd --no-create-home --shell /bin/false appuser
USER appuser
EXPOSE 8000
HEALTHCHECK CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health/live')" || exit 1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Node.js – Multi-Stage Build
FROM node:24-slim AS builder
WORKDIR /build
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ src/
RUN npm run build

FROM node:24-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /build/dist dist/
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser
EXPOSE 3000
HEALTHCHECK CMD node -e "fetch('http://localhost:3000/health/live').then(r => r.ok ? process.exit(0) : process.exit(1))" || exit 1
CMD ["node", "dist/server.js"]
```

**Rules:**
- Multi-stage builds: builder stage for compilation, production stage with minimal footprint.
- `.dockerignore`: `node_modules`, `.venv`, `__pycache__`, `.git`, `.env`, `tests/`, `*.md`.
- Non-root user in production (see examples above).
- Health check in Dockerfile or orchestrator.

### Docker Compose (Local Development)

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports: ["8000:8000"]
    env_file: .env
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
    volumes:
      - ./src:/app/src  # Hot-reload in development

  postgres:
    image: postgres:18
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s

volumes:
  pgdata:
```

**Rules:**
- `depends_on` with `condition: service_healthy` – ensures DB is ready before app starts.
- Volume mount `./src:/app/src` only for development. Never mount source code in production images.
- Use `.env` file for local config. Never commit `.env` (only `.env.example` with dummy values).
- Add `Makefile` or `justfile` with shortcuts: `make dev` → `docker compose up`, `make test` → `docker compose run app pytest`.

---

## Message Queue Decision Table

| | **Celery** (Python) | **BullMQ** (Node.js) | **Kafka** |
|---|---|---|---|
| **Type** | Task queue | Task queue | Event stream (log-based) |
| **Broker** | Redis / RabbitMQ | Redis | Kafka cluster |
| **Ordering** | No (by default) | Per queue (FIFO) | Per partition |
| **Replay** | No | No | Yes (consumer offset reset) |
| **Throughput** | Medium | Medium | Very high |
| **Best for** | Async tasks, email, PDF gen | Async tasks, email, PDF gen | Event sourcing, analytics, cross-service events |
| **DLQ** | Built-in (configurable) | Built-in | Topic-based DLQ |

**Decision rule:**
- **Single service, async tasks** → Celery (Python) or BullMQ (Node.js) with Redis.
- **Multi-service event broadcasting** → Kafka or RabbitMQ (topic exchange).
- **Ordered processing required** → BullMQ (per queue) or Kafka (per partition).
- **Need to replay events** → Kafka only.
- **Simple and small** → Start with Celery/BullMQ. Graduate to Kafka when you need multi-consumer replay.

**Always:**
- Every consumer MUST be idempotent (dedup via Inbox pattern, see `references/database-patterns.md`).
- Every queue MUST have a DLQ strategy. No messages silently dropped.
- Log: `job_id`, `attempt`, `queue`, `duration`, `outcome` per execution.

---

## Library Evaluation

Before adding any dependency:

1. **Maintenance** – actively maintained? Security patches? Last release < 6 months?
2. **Size** – worth the dependency? Can a 50-line utility replace it?
3. **Types** – first-class TypeScript types? Typed stubs for Python?
4. **License** – compatible with project license?
5. **Escape hatch** – can you replace it without rewriting the app?

Every dependency is a liability. Add only what earns its place.
