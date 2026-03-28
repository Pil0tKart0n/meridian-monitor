# Database Patterns

Patterns for database access, migrations, and query optimization in backend applications.

---

## ORM Choice

| Factor | SQLAlchemy 2.0 (Python) | Prisma (Node.js) | Drizzle (Node.js) |
|--------|------------------------|-------------------|-------------------|
| Philosophy | Full ORM + Core (SQL builder) | Schema-first, codegen | SQL-close, typed builder |
| Migrations | Alembic (autogenerate) | Prisma Migrate | Drizzle Kit |
| Type safety | Good (with type stubs) | Excellent (generated types) | Excellent (inferred) |
| Complex queries | Excellent (Core for raw) | Limited (use `$queryRaw`) | Good (SQL-like API) |
| Learning curve | Moderate | Low | Low |

**Rule:** Use ORM for CRUD operations. Drop to raw SQL for complex reporting/analytics queries. Never fight the ORM.

---

## SQLAlchemy 2.0 Patterns (Python)

### Model Definition

```python
from datetime import datetime
from uuid import UUID
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# UUIDv7: time-sortable → B-tree friendly → no index fragmentation (unlike UUIDv4)
# Priority: (1) DB-native: PostgreSQL 18+ DEFAULT uuidv7()
#           (2) Stdlib:    Python 3.14+ uuid.uuid7()
#           (3) Backport:  uuid-utils (Rust-based, fast) for Python <3.14
import uuid
try:
    uuid7 = uuid.uuid7  # Python 3.14+
except AttributeError:
    from uuid_utils import uuid7  # Backport for Python 3.12/3.13

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(),
    )

class SoftDeleteMixin:
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None


class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid7()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="viewer")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    orders: Mapped[list["Order"]] = relationship(back_populates="user", lazy="selectin")
```

**UUIDv7 vs UUIDv4:** UUIDv7 embeds a timestamp → sequential → inserts go to the end of the B-tree → significantly less page splits and fragmentation. Always prefer UUIDv7 for primary keys.

### Async Session Setup

```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

engine = create_async_engine(
    settings.database_url,
    pool_size=20,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,  # Recycle connections after 30min
    echo=settings.environment == "development",
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

### Repository Pattern

```python
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: str) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id, User.deleted_at.is_(None)))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email, User.deleted_at.is_(None)))
        return result.scalar_one_or_none()

    async def list_users(
        self,
        page: int = 1,
        page_size: int = 20,
        role: str | None = None,
        search: str | None = None,
    ) -> tuple[list[User], int]:
        query = select(User).where(User.deleted_at.is_(None))

        if role:
            query = query.where(User.role == role)
        if search:
            query = query.where(User.name.ilike(f"%{search}%"))

        # Count
        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar_one()

        # Data
        query = query.offset((page - 1) * page_size).limit(page_size).order_by(User.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all()), total

    async def create(self, user: User) -> User:
        self.db.add(user)
        await self.db.flush()
        return user

    async def soft_delete(self, user: User) -> None:
        user.deleted_at = func.now()
        await self.db.flush()
```

---

## Prisma Patterns (Node.js)

### Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  // Prisma @default(uuid()) generates UUIDv4. For UUIDv7, omit @default and generate
  // the ID in application code: { id: uuidv7(), ... } — then pass it to Prisma create().
  id             String    @id
  email          String    @unique
  name           String    @db.VarChar(100)
  hashedPassword String    @map("hashed_password")
  role           String    @default("viewer") @db.VarChar(20)
  isActive       Boolean   @default(true) @map("is_active")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  deletedAt      DateTime? @map("deleted_at")
  orders         Order[]

  @@map("users")
}
```

### Repository Pattern

```typescript
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export const userRepository = {
  async getById(userId: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
  },

  async listUsers(params: {
    page?: number;
    pageSize?: number;
    role?: string;
    search?: string;
  }): Promise<{ users: User[]; total: number }> {
    const { page = 1, pageSize = 20, role, search } = params;
    const where = {
      deletedAt: null,
      ...(role && { role }),
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    };

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  },

  async create(data: { name: string; email: string; hashedPassword: string; role?: string }): Promise<User> {
    return prisma.user.create({ data });
  },

  async softDelete(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  },
};
```

---

## Migrations

### Strategy

1. **Always use migrations.** Never modify schema manually. Every change tracked in version control.
2. **One migration per change.** Don't combine unrelated schema changes.
3. **Test rollback.** Every migration must have a working `downgrade` / rollback.
4. **Two-phase column removal:**
   - Phase 1: Deploy code that stops using the column. Migration: make column nullable / set default.
   - Phase 2: Deploy migration that removes the column.
   - Never remove a column in the same deploy that stops using it.

### Alembic (Python)

```bash
# Generate migration from model changes
alembic revision --autogenerate -m "add user role column"

# Apply
alembic upgrade head

# Rollback
alembic downgrade -1

# Show history
alembic history
```

```python
# migrations/versions/xxxx_add_user_role.py
def upgrade():
    op.add_column('users', sa.Column('role', sa.String(20), server_default='viewer'))

def downgrade():
    op.drop_column('users', 'role')
```

### Prisma Migrate (Node.js)

```bash
# Generate migration from schema changes
npx prisma migrate dev --name add_user_role

# Apply in production
npx prisma migrate deploy

# Reset (dev only)
npx prisma migrate reset
```

---

## Query Optimization

### N+1 Prevention

The #1 backend performance issue.

```python
# ❌ N+1: 1 query for users + N queries for orders
users = await db.execute(select(User))
for user in users.scalars():
    orders = await db.execute(select(Order).where(Order.user_id == user.id))  # N queries!

# ✅ Eager load
users = await db.execute(
    select(User).options(selectinload(User.orders))
)

# ✅ Or join
users = await db.execute(
    select(User).join(Order).where(Order.status == "active")
)
```

```typescript
// ❌ N+1 with Prisma
const users = await prisma.user.findMany();
for (const user of users) {
  const orders = await prisma.order.findMany({ where: { userId: user.id } }); // N queries!
}

// ✅ Include (eager load)
const users = await prisma.user.findMany({
  include: { orders: true },
});
```

### Indexing Strategy

```sql
-- Index columns used in WHERE, JOIN, ORDER BY
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);

-- Partial index (only active records)
CREATE INDEX idx_users_active ON users(email) WHERE deleted_at IS NULL;
```

**Rules:**
- Index foreign keys (always).
- Index columns used in `WHERE` and `ORDER BY`.
- Composite indexes: most selective column first.
- Use `EXPLAIN ANALYZE` to verify index usage.
- Don't over-index: each index slows writes.

### Connection Pooling

| Setting | Dev | Production |
|---------|-----|------------|
| Pool size | 5 | 20–50 (depending on workers) |
| Max overflow | 5 | 10 |
| Pool timeout | 30s | 30s |
| Pool recycle | 3600s | 1800s |

**Rule:** `pool_size × number_of_workers ≤ max_db_connections`. Each Gunicorn/PM2 worker gets its own pool.

---

## Transactions

```python
# Python – explicit transaction
async with db.begin():
    user = await user_repository.create(db, user_data)
    await order_repository.create(db, Order(user_id=user.id, ...))
    await notification_service.send_welcome(user)
    # Commits on exit. Rolls back on exception.
```

```typescript
// TypeScript – Prisma transaction
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.order.create({ data: { userId: user.id, ...orderData } });
  // Commits on return. Rolls back on throw.
});
```

**Rules:**
- Wrap multi-step writes in a transaction. If step 2 fails, step 1 rolls back.
- Keep transactions short. Don't include HTTP calls or slow operations inside transactions.
- Use serializable isolation only when strictly necessary (inventory, financial operations).

### Upsert (INSERT ... ON CONFLICT)

Create-or-update in a single atomic operation. Prevents race conditions.

```python
# Python (SQLAlchemy + PostgreSQL)
from sqlalchemy.dialects.postgresql import insert

stmt = insert(UserSetting).values(user_id=user_id, key=key, value=value)
stmt = stmt.on_conflict_do_update(
    index_elements=["user_id", "key"],
    set_={"value": stmt.excluded.value, "updated_at": func.now()},
)
await db.execute(stmt)
```

```typescript
// TypeScript (Prisma)
await prisma.userSetting.upsert({
  where: { userId_key: { userId, key } },
  update: { value },
  create: { userId, key, value },
});
```

```sql
-- Raw SQL (PostgreSQL)
INSERT INTO user_settings (user_id, key, value) VALUES ($1, $2, $3)
ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
```

### Pessimistic Locking (SELECT FOR UPDATE)

Lock rows during a transaction to prevent concurrent modification. Use for inventory, balance updates, sequential counters.

```python
# Python – Lock the row, then update within transaction
async with db.begin():
    result = await db.execute(
        select(Account).where(Account.id == account_id).with_for_update()
    )
    account = result.scalar_one()
    if account.balance < amount:
        raise InsufficientFundsError()
    account.balance -= amount
    # Row stays locked until transaction commits
```

```typescript
// TypeScript (Prisma raw query – Prisma doesn't have native FOR UPDATE)
await prisma.$transaction(async (tx) => {
  const [account] = await tx.$queryRaw<Account[]>`
    SELECT * FROM accounts WHERE id = ${accountId} FOR UPDATE
  `;
  if (account.balance < amount) throw new InsufficientFundsError();
  await tx.account.update({ where: { id: accountId }, data: { balance: { decrement: amount } } });
});
```

**Rules:**
- Only use `FOR UPDATE` when concurrent writes to the same row are expected (inventory, balances, counters).
- Always within a transaction. Keep the transaction as short as possible to minimize lock contention.
- Use `FOR UPDATE SKIP LOCKED` for worker queue patterns (grab next unprocessed row).
- For read-heavy workloads, prefer optimistic locking (version column + retry on conflict) instead.

---

## Audit Trail

For compliance-sensitive data, track who changed what:

```python
class AuditMixin:
    created_by: Mapped[str | None] = mapped_column(String(36), default=None)
    updated_by: Mapped[str | None] = mapped_column(String(36), default=None)
```

For full audit log (changelog):

```sql
CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT uuidv7(),  -- PG 18+; use gen_random_uuid() on PG 17
    table_name  VARCHAR(100) NOT NULL,
    record_id   VARCHAR(36) NOT NULL,
    action      VARCHAR(10) NOT NULL,  -- INSERT, UPDATE, DELETE
    old_values  JSONB,
    new_values  JSONB,
    user_id     VARCHAR(36),
    created_at  TIMESTAMPTZ DEFAULT now()
);
```

**When:** Financial data, user data changes, compliance requirements (GDPR, SOX). Not for every table.

---

## Transactional Outbox Pattern

**Problem:** You need to write to DB AND publish an event (queue/Kafka). If you write to DB then the queue publish fails, data is inconsistent. If you publish first then DB fails, same problem.

**Solution:** Write the event to an `outbox` table in the SAME database transaction as the business data. A separate poller/CDC process reads the outbox and publishes to the queue.

```sql
CREATE TABLE outbox (
    id          UUID PRIMARY KEY DEFAULT uuidv7(),  -- PG 18+; use gen_random_uuid() on PG 17
    event_type  VARCHAR(100) NOT NULL,     -- 'order.created', 'user.registered'
    payload     JSONB NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now(),
    published   BOOLEAN DEFAULT FALSE
);
```

```python
# Write business data + outbox event in ONE transaction
async with db.begin():
    order = Order(user_id=user.id, total=total)
    db.add(order)
    db.add(OutboxEvent(
        event_type="order.created",
        payload={"order_id": order.id, "user_id": user.id, "total": total},
    ))
    # Both committed or both rolled back – guaranteed consistency

# Separate poller (background job) publishes and marks as published
async def process_outbox():
    async with db.begin():
        # FOR UPDATE SKIP LOCKED: safe for multiple concurrent pollers –
        # each worker claims a non-overlapping batch, no double-publish.
        events = await db.execute(
            select(OutboxEvent)
            .where(OutboxEvent.published == False)
            .limit(100)
            .with_for_update(skip_locked=True)
        )
        for event in events.scalars():
            await queue.publish(event.event_type, event.payload)
            event.published = True
```

**When:** Any time you need DB write + message publish to be atomic. Common in: order processing, user registration with email, payment events.

**Alternative:** Change Data Capture (CDC) with Debezium – reads DB WAL directly, no outbox table needed. More complex to set up but eliminates polling.

---

## Inbox Pattern (Inbound Event Dedup)

**Problem:** Events from queues/webhooks are delivered **at-least-once**. Without dedup, you process the same event multiple times (double charges, duplicate notifications).

```sql
CREATE TABLE processed_events (
    event_id    VARCHAR(255) PRIMARY KEY,  -- ID from the incoming event
    event_type  VARCHAR(100) NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT now()
);
```

```python
async def handle_event(event: IncomingEvent) -> None:
    # Try to insert – unique constraint prevents duplicates
    try:
        await db.execute(
            insert(ProcessedEvent).values(event_id=event.id, event_type=event.type)
        )
    except IntegrityError:
        logger.info("Duplicate event, skipping", event_id=event.id)
        return  # Already processed

    # Process the event (only runs once per event_id)
    await process_order_completed(event.data)
    await db.commit()
```

**When:** Consuming events from queues (SQS, RabbitMQ, Kafka) or receiving webhooks. Always when at-least-once delivery is possible (which is almost always).

**Cleanup:** Periodically delete old entries (e.g., `WHERE processed_at < now() - interval '30 days'`).

---

## Zero-Downtime Migration Strategy

For breaking schema changes (rename column, change type, remove column), use a multi-phase deploy:

```
Phase 1: ADD (backward compatible)
  → Add new column/table. Deploy code that writes to BOTH old and new.
  → No data loss if rollback needed.

Phase 2: BACKFILL
  → Backfill existing data from old to new column.
  → Use cursor-based batching for large tables:

    UPDATE users SET new_email = email
    WHERE id > $last_processed_id
    ORDER BY id LIMIT 1000;

  → Checkpoint: store last_processed_id. Resumable on failure.

Phase 3: SWITCH
  → Deploy code that reads from new column (with fallback to old).
  → Verify data consistency.

Phase 4: CLEANUP (separate deploy, days/weeks later)
  → Remove old column. Remove dual-write code.
  → This is the only irreversible step.
```

**Rules:**
- Never rename or remove a column in the same deploy that changes the code reading it.
- Backfills on large tables: batch with `LIMIT` + cursor, sleep between batches to avoid locking.
- Prefer `CREATE INDEX CONCURRENTLY` in PostgreSQL to avoid table locks.
- Test rollback of every migration before deploying.

---

## Common Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Raw SQL concatenation | SQL injection | Use parameterized queries / ORM |
| No connection pool | Connection exhaustion | Always pool |
| `SELECT *` everywhere | Over-fetching, CLS on schema change | Select specific columns |
| Business logic in queries | Untestable, hard to change | Keep logic in service layer |
| No soft delete (when needed) | Data loss, compliance risk | `deleted_at` column + filter |
| Migrations without rollback | Can't recover from bad deploy | Always write `downgrade()` |
| UUID as primary key without index | Fragmented B-tree | Use `uuidv7()` (PG 18+ native, time-ordered) or add index |
