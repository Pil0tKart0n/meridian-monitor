# Postgres Patterns Reference

Common patterns for the Database Engineer Skill. Use as a lookup — not all patterns apply to every project.

---

## Common Table Expressions (CTEs)

### Readable multi-step queries

```sql
WITH active_users AS (
    SELECT id, email, created_at
    FROM users
    WHERE deleted_at IS NULL
      AND last_login_at > now() - interval '30 days'
),
user_orders AS (
    SELECT u.id AS user_id, count(o.id) AS order_count, sum(o.amount_minor) AS total_spent
    FROM active_users u
    JOIN orders o ON o.user_id = u.id
    WHERE o.status = 'completed'
    GROUP BY u.id
)
SELECT u.email, uo.order_count, uo.total_spent
FROM active_users u
JOIN user_orders uo ON uo.user_id = u.id
WHERE uo.order_count >= 5
ORDER BY uo.total_spent DESC;
```

**Note:** In Postgres 12+, CTEs are automatically inlined (not optimization barriers) unless they have side effects or are referenced multiple times. Use `MATERIALIZED` / `NOT MATERIALIZED` hints if needed.

### Recursive CTE (tree/hierarchy)

```sql
WITH RECURSIVE category_tree AS (
    -- Base case: root categories
    SELECT id, name, parent_id, 0 AS depth, ARRAY[id] AS path
    FROM categories
    WHERE parent_id IS NULL

    UNION ALL

    -- Recursive case
    SELECT c.id, c.name, c.parent_id, ct.depth + 1, ct.path || c.id
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
    WHERE ct.depth < 10  -- Safety limit
)
SELECT * FROM category_tree ORDER BY path;
```

**Rule:** Always include a depth limit to prevent infinite recursion from data bugs.

---

## Window Functions

### Running totals

```sql
SELECT
    date,
    amount_minor,
    sum(amount_minor) OVER (ORDER BY date) AS running_total,
    avg(amount_minor) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS rolling_7day_avg
FROM daily_revenue;
```

### Row numbering (deduplication, top-N per group)

```sql
-- Top 3 orders per user
SELECT * FROM (
    SELECT
        o.*,
        row_number() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
    FROM orders o
) ranked
WHERE rn <= 3;
```

### Pagination with total count (efficient)

```sql
SELECT *, count(*) OVER() AS total_count
FROM orders
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

**Warning:** `count(*) OVER()` can be expensive on large result sets. For very large tables, prefer a separate count query or keyset pagination.

---

## LATERAL Joins

Use LATERAL when you need to reference the outer query in a subquery — especially for "top-N per group" or correlated aggregations.

```sql
-- Latest 3 orders per user (more efficient than window function for sparse access)
SELECT u.id, u.email, latest_orders.*
FROM users u
CROSS JOIN LATERAL (
    SELECT o.id AS order_id, o.amount_minor, o.created_at
    FROM orders o
    WHERE o.user_id = u.id
    ORDER BY o.created_at DESC
    LIMIT 3
) latest_orders
WHERE u.deleted_at IS NULL;
```

**When LATERAL wins:** When you need a subset per row and the outer set is small relative to the inner table.

---

## Advisory Locks

For application-level coordination without row locks:

```sql
-- Acquire a lock on a specific resource (non-blocking)
SELECT pg_try_advisory_lock(hashtext('process_batch_42'));

-- Release
SELECT pg_advisory_unlock(hashtext('process_batch_42'));

-- Transaction-scoped (auto-releases at commit/rollback)
SELECT pg_advisory_xact_lock(hashtext('import_job_7'));
```

**Use cases:** Prevent duplicate cron job execution, serialize access to shared resources, batch processing coordination.

**Warning:** Advisory locks are global per database. Use a consistent naming/hashing scheme to avoid collisions.

---

## LISTEN / NOTIFY

Lightweight pub/sub built into Postgres:

```sql
-- Subscriber (Backend application listens on channel)
LISTEN order_events;

-- Publisher (trigger or application)
NOTIFY order_events, '{"order_id": "abc-123", "event": "created"}';
```

**Use cases:** Real-time notifications to application, cache invalidation, light event-driven patterns.

**Limitations:** Messages are lost if no listener is connected. Not persistent — for durable messaging, use a proper message broker (Architect decides).

**Connection mode:** Requires `session` mode in PgBouncer (not compatible with `transaction` mode). Plan for a dedicated connection if using LISTEN/NOTIFY.

---

## Full-Text Search (Postgres)

### Basic setup

```sql
-- Add tsvector column + GIN index
ALTER TABLE articles ADD COLUMN search_vector tsvector;

CREATE INDEX idx_articles_search ON articles USING gin(search_vector);

-- Populate (trigger or manual)
UPDATE articles SET search_vector =
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'B');

-- Search
SELECT id, title, ts_rank(search_vector, query) AS rank
FROM articles, to_tsquery('english', 'postgres & performance') AS query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;
```

### When Postgres FTS is enough vs. dedicated search

| Postgres FTS | Dedicated search (Elasticsearch, Typesense, Meilisearch) |
|---|---|
| < 1M documents, simple search | > 1M documents, complex facets, fuzzy matching |
| Exact/stemmed word matching | Typo tolerance, synonyms, relevance tuning |
| No additional infrastructure | Requires separate service + sync |
| Good for "search within a feature" | Good for "search is the feature" |

---

## Keyset (Cursor-Based) Pagination

More efficient than OFFSET for large datasets:

```sql
-- First page
SELECT id, created_at, title
FROM articles
WHERE published = true
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Next page (cursor = last row's created_at + id)
SELECT id, created_at, title
FROM articles
WHERE published = true
  AND (created_at, id) < ($cursor_created_at, $cursor_id)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

**Advantages:** Stable performance regardless of page depth (no OFFSET scan). Consistent results even with concurrent inserts.

**Requirement:** Needs a unique, ordered column combination for the cursor. `(created_at, id)` is the common pattern.

---

## Batch Operations

### Chunked backfill

```sql
-- Backfill in batches of 5000
DO $$
DECLARE
    batch_size integer := 5000;
    rows_updated integer;
BEGIN
    LOOP
        UPDATE orders
        SET status_new = status_old
        WHERE id IN (
            SELECT id FROM orders
            WHERE status_new IS NULL
            LIMIT batch_size
            FOR UPDATE SKIP LOCKED
        );

        GET DIAGNOSTICS rows_updated = ROW_COUNT;
        RAISE NOTICE 'Updated % rows', rows_updated;

        EXIT WHEN rows_updated = 0;

        PERFORM pg_sleep(0.1);  -- Rate limit: 100ms pause between batches
        COMMIT;
    END LOOP;
END $$;
```

### Bulk upsert

```sql
INSERT INTO products (external_id, name, price_minor, updated_at)
VALUES
    ($1, $2, $3, now()),
    ($4, $5, $6, now())
ON CONFLICT (external_id)
DO UPDATE SET
    name = EXCLUDED.name,
    price_minor = EXCLUDED.price_minor,
    updated_at = now()
WHERE products.name IS DISTINCT FROM EXCLUDED.name
   OR products.price_minor IS DISTINCT FROM EXCLUDED.price_minor;
```

**`IS DISTINCT FROM`:** Handles NULL comparison correctly (unlike `!=`). Prevents unnecessary updates (and trigger fires) when data hasn't changed.
