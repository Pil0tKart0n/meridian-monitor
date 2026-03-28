# Migration Safety Reference

Detailed patterns for safe database migrations. Supplement to the main SKILL.md §3.

---

## Lock Reference Table (PostgreSQL)

Understanding which DDL operations take which locks is critical for zero-downtime migrations.

| Operation | Lock type | Blocks reads? | Blocks writes? | Safe during traffic? |
|-----------|-----------|--------------|----------------|---------------------|
| `SELECT` | `AccessShareLock` | No | No | ✅ |
| `INSERT/UPDATE/DELETE` | `RowExclusiveLock` | No | No (row-level) | ✅ |
| `CREATE INDEX CONCURRENTLY` | `ShareUpdateExclusiveLock` | No | No | ✅ (slow but safe) |
| `CREATE INDEX` (non-concurrent) | `ShareLock` | No | **Yes** | ❌ |
| `ADD COLUMN` (nullable, no default) | `AccessExclusiveLock` | **Brief** | **Brief** | ⚠️ Very fast, usually OK |
| `ADD COLUMN ... DEFAULT` (PG 11+) | `AccessExclusiveLock` | **Brief** | **Brief** | ⚠️ Fast (metadata only in PG 11+) |
| `ADD COLUMN ... NOT NULL DEFAULT` (PG 11+) | `AccessExclusiveLock` | **Brief** | **Brief** | ⚠️ Fast (metadata only) |
| `DROP COLUMN` | `AccessExclusiveLock` | **Brief** | **Brief** | ⚠️ Fast (marks invisible) |
| `ALTER COLUMN TYPE` | `AccessExclusiveLock` | **Yes** | **Yes** | ❌ Table rewrite! |
| `ADD CONSTRAINT ... NOT VALID` | `ShareUpdateExclusiveLock` | No | No | ✅ |
| `VALIDATE CONSTRAINT` | `ShareUpdateExclusiveLock` | No | No | ✅ (scans but doesn't block) |
| `SET NOT NULL` (direct) | `AccessExclusiveLock` | **Yes** | **Yes** | ❌ Full table scan |
| `RENAME COLUMN` | `AccessExclusiveLock` | **Brief** | **Brief** | ⚠️ Breaks running app code |
| `DROP TABLE` | `AccessExclusiveLock` | **Yes** | **Yes** | ❌ |
| `VACUUM` | `ShareUpdateExclusiveLock` | No | No | ✅ |
| `VACUUM FULL` | `AccessExclusiveLock` | **Yes** | **Yes** | ❌ |

**Key principle:** Anything that takes `AccessExclusiveLock` for more than milliseconds must be avoided during traffic.

---

## Expand/Contract: Detailed Examples

### Example 1: Rename a column

**Never:** `ALTER TABLE users RENAME COLUMN name TO full_name;` (breaks running app)

**Safe sequence:**

```sql
-- EXPAND: Add new column
ALTER TABLE users ADD COLUMN full_name text;

-- BACKFILL (batched)
-- Run in application or migration script with batching
UPDATE users SET full_name = name WHERE full_name IS NULL AND id BETWEEN $start AND $end;

-- APPLICATION: Deploy code that writes to BOTH columns, reads from full_name (fallback to name)

-- CONTRACT: After all rows backfilled + app deployed
ALTER TABLE users ADD CONSTRAINT users_full_name_not_null
  CHECK (full_name IS NOT NULL) NOT VALID;
ALTER TABLE users VALIDATE CONSTRAINT users_full_name_not_null;

-- Next deploy: Remove reads from old column
-- Final: Drop old column (after deprecation window)
ALTER TABLE users DROP COLUMN name;
```

### Example 2: Change column type (e.g., varchar → text, int → bigint)

**Never:** `ALTER TABLE orders ALTER COLUMN amount TYPE bigint;` (table rewrite + AccessExclusiveLock)

**Safe sequence:**

```sql
-- EXPAND: Add new column with target type
ALTER TABLE orders ADD COLUMN amount_new bigint;

-- BACKFILL
UPDATE orders SET amount_new = amount WHERE amount_new IS NULL AND id BETWEEN $start AND $end;

-- APPLICATION: Write to both, read from new (fallback old)

-- CONTRACT: Constraint, switch, drop
ALTER TABLE orders ADD CONSTRAINT orders_amount_new_not_null
  CHECK (amount_new IS NOT NULL) NOT VALID;
ALTER TABLE orders VALIDATE CONSTRAINT orders_amount_new_not_null;
ALTER TABLE orders DROP COLUMN amount;
ALTER TABLE orders RENAME COLUMN amount_new TO amount; -- Safe after old code is gone
```

### Example 3: Add NOT NULL to existing column (large table)

**Never:** `ALTER TABLE users ALTER COLUMN email SET NOT NULL;` (full table scan with AccessExclusiveLock)

**Safe sequence:**

```sql
-- Step 1: Add CHECK constraint NOT VALID (no scan, lightweight lock)
ALTER TABLE users ADD CONSTRAINT users_email_not_null
  CHECK (email IS NOT NULL) NOT VALID;

-- Step 2: Validate (scans table but ShareUpdateExclusiveLock — doesn't block writes)
ALTER TABLE users VALIDATE CONSTRAINT users_email_not_null;

-- Step 3 (optional, PG 12+): The planner now knows email is NOT NULL.
-- If you need the formal NOT NULL attribute (e.g., for ORM compatibility):
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
-- PG 12+ skips the scan if a valid CHECK constraint already exists.
ALTER TABLE users DROP CONSTRAINT users_email_not_null;
```

---

## Backfill Patterns

### Pattern 1: Simple batched UPDATE

```sql
DO $$
DECLARE
  batch_size integer := 5000;
  total_updated integer := 0;
  rows_affected integer;
BEGIN
  LOOP
    UPDATE target_table
    SET new_column = compute_value(old_column)
    WHERE new_column IS NULL
      AND id IN (
        SELECT id FROM target_table
        WHERE new_column IS NULL
        ORDER BY id
        LIMIT batch_size
        FOR UPDATE SKIP LOCKED
      );

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    total_updated := total_updated + rows_affected;
    RAISE NOTICE 'Batch complete: % rows this batch, % total', rows_affected, total_updated;

    EXIT WHEN rows_affected = 0;
    PERFORM pg_sleep(0.1);  -- Rate limit
  END LOOP;

  RAISE NOTICE 'Backfill complete: % rows updated', total_updated;
END $$;
```

### Pattern 2: Application-level backfill (preferred for complex transforms)

When the backfill requires application logic (API calls, encryption, format conversion), run from application code:

```python
# Python example (SQLAlchemy / psycopg)
BATCH_SIZE = 1000
SLEEP_SECONDS = 0.05

while True:
    with db.begin():
        rows = db.execute(text("""
            SELECT id, old_value FROM target_table
            WHERE new_value IS NULL
            ORDER BY id
            LIMIT :batch
            FOR UPDATE SKIP LOCKED
        """), {"batch": BATCH_SIZE}).fetchall()

        if not rows:
            break

        for row in rows:
            new_val = transform(row.old_value)  # Application logic
            db.execute(text("""
                UPDATE target_table SET new_value = :val WHERE id = :id
            """), {"val": new_val, "id": row.id})

    logger.info(f"Backfilled {len(rows)} rows")
    time.sleep(SLEEP_SECONDS)
```

### Pattern 3: Progress tracking

For large backfills, track progress:

```sql
-- Check progress
SELECT
  count(*) FILTER (WHERE new_column IS NOT NULL) AS done,
  count(*) FILTER (WHERE new_column IS NULL) AS remaining,
  round(100.0 * count(*) FILTER (WHERE new_column IS NOT NULL) / count(*), 1) AS pct
FROM target_table;
```

---

## Version-Specific Behaviors (PostgreSQL)

| Version | Key behavior for migrations |
|---------|----------------------------|
| **PG 11+** | `ADD COLUMN ... DEFAULT` no longer rewrites table (metadata-only). Safe for large tables. |
| **PG 12+** | `SET NOT NULL` skips scan if a valid CHECK constraint exists (fast path). |
| **PG 14+** | `REINDEX CONCURRENTLY` available (rebuild indexes without blocking writes). |
| **PG 15+** | `MERGE` statement (SQL standard upsert). `SECURITY INVOKER` views. |
| **PG 16+** | `pg_stat_io` for I/O statistics. Logical replication from standbys. |

**Rule:** Always check the Postgres version in use before relying on version-specific optimizations. Document the minimum required version in the migration comment.

---

## Pre-Migration Checklist

Before running any migration in production:

- [ ] Migration tested on staging with production-size data (or representative subset)
- [ ] Lock type understood for each DDL statement (see lock table above)
- [ ] Estimated duration calculated (row count × per-row cost)
- [ ] Maintenance window scheduled if AccessExclusiveLock is needed for > 1s
- [ ] Rollback plan documented (down migration or manual steps)
- [ ] Monitoring dashboards open: lock waits, replication lag, error rate, query latency
- [ ] Backup verified (recent + restorable)
- [ ] Application compatibility confirmed (old code works with new schema during deploy)
- [ ] Communication sent to team (what's changing, when, what to watch)

---

## Anti-Patterns

| Anti-pattern | Why it's dangerous | Safe alternative |
|---|---|---|
| `ALTER COLUMN TYPE` on large table | Table rewrite + AccessExclusiveLock | Expand/contract with new column |
| `SET NOT NULL` without CHECK trick | Full table scan with heavy lock | Add CHECK NOT VALID → VALIDATE → SET NOT NULL |
| `CREATE INDEX` (non-concurrent) | Blocks writes for duration of build | `CREATE INDEX CONCURRENTLY` |
| Direct column rename | Breaks running application code | Expand/contract |
| Backfill in single transaction | Holds locks, bloats WAL, may timeout | Batch with LIMIT + FOR UPDATE SKIP LOCKED |
| `VACUUM FULL` during traffic | AccessExclusiveLock, blocks everything | Regular VACUUM + `pg_repack` for bloat |
| Migration without rollback plan | Stuck in broken state | Always write DOWN migration or document manual rollback |
| Testing migration only on empty DB | Misses lock contention + performance | Test on staging with realistic data volume |
