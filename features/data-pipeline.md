# Data Pipeline

## Overview

The Data Pipeline epic covers all data ingestion, processing, and enrichment systems that feed the WW3News platform. It integrates multiple external data sources (GDELT, RSS feeds, ACLED, financial APIs), processes raw data through summarization and deduplication, categorizes events, and orchestrates all jobs on a reliable schedule.

This is the foundational epic — all other features (GEI, News Feed, Conflict Map, Economic Dashboard) depend on the data pipeline producing clean, categorized, deduplicated data.

## User Stories

### DP-1: GDELT DOC API Integration

**As a** system, **I want to** fetch news events from the GDELT DOC API every 15 minutes, **so that** we have near-real-time global event data.

**Acceptance Criteria:**

- [ ] Polling job runs every 15 minutes via cron
- [ ] Queries filter by Middle East geography (Israel, Palestine, Iran, Lebanon, Syria, Yemen, Saudi Arabia, Iraq)
- [ ] Queries filter by conflict-relevant CAMEO codes (material conflict, verbal conflict, military force)
- [ ] Raw events are stored in PostgreSQL with full GDELT metadata (event ID, source URL, tone, Goldstein scale, actors)
- [ ] Duplicate GDELT event IDs are skipped (idempotent ingestion)
- [ ] API errors are logged with context and retried (max 3 retries, exponential backoff)
- [ ] Metrics tracked: events fetched per run, errors, latency

---

### DP-2: RSS Feed Aggregator

**As a** system, **I want to** aggregate articles from 30+ RSS sources, **so that** users get multi-perspective coverage.

**Acceptance Criteria:**

- [ ] RSS sources configured in a YAML/JSON config file (easy to add/remove)
- [ ] Minimum sources: Reuters, BBC, Al Jazeera, Times of Israel, Al-Monitor, Haaretz, The Guardian, AP News, France24, DW, TASS, Xinhua, Iran Press, SANA (Syria), Middle East Eye, The National (UAE), Arab News, i24 News, Ynet, Jerusalem Post
- [ ] Feed polling interval configurable per source (default: 30 minutes)
- [ ] Articles stored with: title, URL, source name, published date, full text (if available), summary
- [ ] ETag/Last-Modified headers respected to avoid re-fetching unchanged feeds
- [ ] Feed errors (timeout, malformed XML, 404) logged per source, do not block other sources
- [ ] Source metadata table: name, logo URL, region, political leaning (for source comparison feature)

---

### DP-3: ACLED Conflict Events Integration

**As a** system, **I want to** pull curated conflict event data from ACLED weekly, **so that** the conflict map and GEI have verified ground-truth data.

**Acceptance Criteria:**

- [ ] Weekly pull job (configurable day/time)
- [ ] Filters: Middle East & North Africa region
- [ ] Data stored: event type, sub-event type, actors, location (lat/lng), fatalities, date, notes
- [ ] ACLED event IDs used for deduplication (idempotent)
- [ ] API key stored as environment variable, never in code
- [ ] Data feeds into Conflict Map markers and GEI conflict category

---

### DP-4: FRED/Yahoo Finance Market Data

**As a** system, **I want to** fetch daily market indicators, **so that** the Economic Dashboard has current financial data.

**Acceptance Criteria:**

- [ ] Daily pull job (after market close, ~18:00 UTC)
- [ ] Indicators: VIX (CBOE), Brent Crude, WTI Crude, Gold spot price
- [ ] Defense stocks: Lockheed Martin (LMT), Raytheon/RTX, Northrop Grumman (NOC), General Dynamics (GD), BAE Systems (BA.L)
- [ ] Historical data backfilled on first run (1 year minimum)
- [ ] Data stored with: ticker/indicator, date, open, high, low, close, volume (where applicable)
- [ ] FRED API key and Yahoo Finance approach documented in tech notes
- [ ] Weekend/holiday gaps handled gracefully (carry forward last known value)

---

### DP-5: GPT-powered Article Summarization

**As a** system, **I want to** summarize ingested articles to 2-3 sentences using OpenAI API, **so that** users can quickly scan news.

**Acceptance Criteria:**

- [ ] Summarization runs as a post-ingestion step (after RSS/GDELT articles are stored)
- [ ] Uses OpenAI API (GPT-4o-mini for cost efficiency, configurable model)
- [ ] Prompt instructs: summarize in 2-3 sentences, neutral tone, preserve key facts (who, what, where)
- [ ] Summary stored alongside the article record
- [ ] Rate limiting: respects OpenAI rate limits, queues overflow
- [ ] Cost tracking: tokens used per run logged
- [ ] Fallback: if API fails, article is flagged as "unsummarized" and retried next cycle
- [ ] OpenAI API key as environment variable

---

### DP-6: Duplicate Detection

**As a** system, **I want to** detect and link duplicate/near-duplicate articles, **so that** the news feed shows unique stories instead of repetitions.

**Acceptance Criteria:**

- [ ] Cosine similarity computed on article titles and first 200 words of content
- [ ] Similarity threshold: 0.85 (configurable)
- [ ] Duplicates are linked (not deleted) — stored as a cluster with a canonical article
- [ ] Canonical article selected by: earliest publication date, then source priority
- [ ] Deduplication runs as a batch job after each ingestion cycle
- [ ] Performance: handles 1000+ articles per batch within 60 seconds
- [ ] Embedding model: sentence-transformers or OpenAI text-embedding-3-small

---

### DP-7: Event Categorization

**As a** system, **I want to** classify every event/article into categories, **so that** users can filter by topic.

**Acceptance Criteria:**

- [ ] Categories: Military, Diplomatic, Economic, Humanitarian, Nuclear
- [ ] Classification via GPT (prompt-based) or keyword/CAMEO-code mapping
- [ ] Each article can have 1 primary category and 0-2 secondary categories
- [ ] Confidence score stored per classification
- [ ] Low-confidence classifications (< 0.7) flagged for review
- [ ] Category stored as a foreign key to a categories table
- [ ] GDELT events: CAMEO code mapped to categories (mapping table)
- [ ] ACLED events: event type mapped to categories

---

### DP-8: Cron Job Orchestration

**As a** system operator, **I want to** have all pipeline jobs scheduled with proper error handling, **so that** the platform runs reliably without manual intervention.

**Acceptance Criteria:**

- [ ] Job scheduler: node-cron or BullMQ (decision via ADR)
- [ ] Job schedule:
  - GDELT: every 15 minutes
  - RSS: every 30 minutes
  - Summarization: every 15 minutes (processes unsummarized queue)
  - Deduplication: every 30 minutes
  - Categorization: every 15 minutes (processes uncategorized queue)
  - ACLED: weekly (Sunday 02:00 UTC)
  - Market data: daily (18:00 UTC)
- [ ] Each job logs: start time, end time, items processed, errors
- [ ] Failed jobs retry with exponential backoff (max 3 retries)
- [ ] Job health endpoint: `/api/internal/jobs/health` returns status of all jobs
- [ ] Dead letter queue for permanently failed items
- [ ] Jobs are idempotent (safe to re-run)

## Technical Notes

- **Database:** PostgreSQL with separate tables per data source (gdelt_events, rss_articles, acled_events, market_data) plus shared tables (categories, article_clusters)
- **Queue:** Consider BullMQ with Redis for job orchestration if complexity grows beyond simple cron
- **Embedding storage:** pgvector extension for cosine similarity queries, or compute in-memory for small batches
- **API keys:** All external API keys via environment variables, documented in `.env.example`
- **Error isolation:** Each data source pipeline is independent — one source failing must not block others
- **Backpressure:** If summarization queue grows beyond 500 items, log a warning and skip oldest items
- **ADR required:** Job scheduler choice (node-cron vs BullMQ), embedding model choice, GDELT vs EventRegistry comparison
