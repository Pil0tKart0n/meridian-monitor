# News Feed

## Overview

The News Feed is the primary content consumption interface of WW3News. It presents a curated, categorized, and filterable stream of geopolitical news articles sourced from 30+ international outlets. Key differentiators include multi-source perspective comparison, region-based filtering, and a premium gate that delays deep analysis access for free-tier users.

All articles displayed here are ingested, summarized, deduplicated, and categorized by the Data Pipeline (see `data-pipeline.md`).

## User Stories

### NF-1: News List Page with Infinite Scroll

**As a** user, **I want to** browse news articles in a continuously loading feed, **so that** I can consume news without pagination friction.

**Acceptance Criteria:**

- [ ] Default view: reverse-chronological list of articles
- [ ] Each article card shows: title, source badge, category tag, published time (relative), 2-3 sentence summary, region tag
- [ ] Infinite scroll: next batch (20 articles) loads when user scrolls within 200px of the bottom
- [ ] Loading state: skeleton cards while fetching
- [ ] Empty state: message when no articles match current filters
- [ ] Error state: retry button if fetch fails
- [ ] API: keyset pagination (cursor-based), max 20 items per page
- [ ] Scroll position preserved on back-navigation
- [ ] Responsive: single column on mobile, two columns on tablet+
- [ ] Performance: LCP < 2.5s for initial load

---

### NF-2: Source Badge System

**As a** user, **I want to** see which outlet published each article with a recognizable badge, **so that** I can assess source credibility at a glance.

**Acceptance Criteria:**

- [ ] Each article card displays a source badge (logo + name)
- [ ] Source logos stored locally (not hotlinked) in `public/assets/sources/`
- [ ] Logos: 24x24px, consistent style (grayscale or color, decide in design phase)
- [ ] Sources without a logo show a colored initial avatar (first letter, deterministic color from source name)
- [ ] Clicking a source badge filters the feed to that source
- [ ] Source metadata includes: name, logo, website URL, region, known editorial leaning (for transparency)
- [ ] At least 30 sources with badges at launch

---

### NF-3: Category Filter

**As a** user, **I want to** filter news by category, **so that** I can focus on the topics I care about.

**Acceptance Criteria:**

- [ ] Filter bar with toggle chips: Military, Diplomatic, Economic, Humanitarian, Nuclear
- [ ] Multiple categories can be selected (OR logic)
- [ ] No selection = show all categories
- [ ] Active filters reflected in URL query params (`?category=military,diplomatic`)
- [ ] Article count per category shown on each chip (updated with current filters)
- [ ] Filter state persists on page refresh (via URL)
- [ ] Responsive: horizontal scroll on mobile, wraps on desktop

---

### NF-4: Region Filter

**As a** user, **I want to** filter news by geographic region, **so that** I can follow specific conflict zones.

**Acceptance Criteria:**

- [ ] Region options: Gaza, Lebanon, Yemen, Iran, Syria, Red Sea, Iraq, Israel, Saudi Arabia, Ukraine (expandable)
- [ ] Multiple regions selectable (OR logic)
- [ ] Combinable with category filter (AND between filter types, OR within)
- [ ] Region derived from: GDELT geo-data, ACLED location, or keyword extraction from article content
- [ ] Region tags displayed on article cards
- [ ] Filter state in URL query params (`?region=gaza,yemen`)
- [ ] Responsive: dropdown on mobile, chip bar on desktop

---

### NF-5: Source Comparison View

**As a** user, **I want to** see how different media outlets cover the same event, **so that** I can understand multiple perspectives.

**Acceptance Criteria:**

- [ ] Triggered from an article card via "Compare sources" action
- [ ] Shows all articles in the same duplicate cluster (from deduplication pipeline)
- [ ] Side-by-side layout (2-3 columns on desktop, stacked on mobile)
- [ ] Each column shows: source badge, headline, summary, link to full article
- [ ] Highlights differences in framing (stretch goal: GPT-generated comparison summary)
- [ ] Minimum 2 sources required to show comparison view
- [ ] If only 1 source exists, "Compare" action is hidden
- [ ] Accessible: proper heading hierarchy, keyboard-navigable between sources

---

### NF-6: Search Functionality

**As a** user, **I want to** search articles by keyword, **so that** I can find specific events or topics.

**Acceptance Criteria:**

- [ ] Search bar at the top of the news feed
- [ ] Full-text search on: title, summary, source name
- [ ] Debounced input (300ms) to avoid excessive API calls
- [ ] Search results ranked by relevance (keyword match) with recency as tiebreaker
- [ ] Search term highlighted in results
- [ ] Combinable with category and region filters
- [ ] Empty results: helpful message with suggestions ("Try broader terms or remove filters")
- [ ] Search query in URL (`?q=ceasefire`)
- [ ] Minimum 2 characters to trigger search
- [ ] Performance: results returned within 500ms

---

### NF-7: Premium Content Gate

**As a** product owner, **I want to** gate deep analysis content behind a 24-48h delay for free users, **so that** premium subscribers get early access.

**Acceptance Criteria:**

- [ ] Free tier: articles visible after 24-48h delay (configurable per content type)
- [ ] Premium tier: immediate access to all articles
- [ ] Professional tier: immediate access + API access
- [ ] Gated articles show: headline, source, category, and a blurred/truncated summary with upgrade CTA
- [ ] Gate applied via middleware that checks user tier and article publish date
- [ ] No gate on breaking news (articles tagged as "breaking" are always public)
- [ ] Gate delay configurable in environment variable (`CONTENT_GATE_HOURS=24`)
- [ ] CTA: "Upgrade to Premium for immediate access" with link to pricing page
- [ ] Logged-out users treated as free tier

## Technical Notes

- **API design:** `GET /api/v1/articles?cursor=X&category=military&region=gaza&q=ceasefire` with keyset pagination
- **Search:** PostgreSQL full-text search (`tsvector/tsquery`) for MVP. Consider Meilisearch or Typesense if performance requires it.
- **Source comparison:** Relies on the duplicate cluster data from the deduplication pipeline (DP-6). Each cluster has a `cluster_id`; comparison view fetches all articles with the same `cluster_id`.
- **Content gate middleware:** Next.js middleware or API-level check. Compare `article.publishedAt + GATE_HOURS` against `now()` for free users.
- **Caching:** Article list responses cached for 5 minutes. Search results cached for 1 minute.
- **Image strategy:** Article cards are text-based (no thumbnails) for MVP. Source logos are the only images.
- **ADR required:** Search engine choice (PostgreSQL FTS vs dedicated search), content gate granularity
