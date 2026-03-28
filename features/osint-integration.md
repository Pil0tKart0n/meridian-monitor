# OSINT Integration

## Overview

The OSINT Integration epic expands WW3News's data sources beyond traditional media and structured conflict databases into open-source intelligence channels. This includes monitoring Telegram public channels used by OSINT analysts, aggregating think tank publications, integrating UN humanitarian data, and tracking social media trend indicators. These sources provide early signals, expert analysis, and ground-truth data that mainstream media often lags behind.

This is a Sprint 3 epic — it builds on the Data Pipeline infrastructure (see `data-pipeline.md`) and feeds into the existing categorization, deduplication, and GEI systems.

## User Stories

### OSINT-1: Telegram Public Channel Monitor

**As a** system, **I want to** monitor public Telegram OSINT channels for early-breaking intelligence, **so that** the platform captures signals before mainstream media reports them.

**Acceptance Criteria:**

- [ ] Monitors 10-20 curated public Telegram channels (no private/invite-only channels)
- [ ] Target channels (configurable list):
  - Intel Slava Z, OSINTdefender, Rybar (English), WarMonitor3, Fighterman_FHTMN
  - Middle East-focused: Aurora Intel, Aleph (conflict), Clash Report
  - Additional channels configurable via YAML config without code changes
- [ ] Polling interval: every 5 minutes
- [ ] Extracts: message text, media links, timestamp, channel name, message ID
- [ ] Deduplication: message ID per channel is unique key (idempotent)
- [ ] Content filtering: only messages with geopolitical/conflict relevance (keyword filter or GPT classification)
- [ ] Noise reduction: skip messages with < 20 characters, skip pure emoji/sticker messages
- [ ] Integration method: Telegram Bot API (read-only, no user interaction) or MTProto client library
- [ ] Messages feed into the standard article pipeline (summarization, categorization, GEI scoring)
- [ ] Source labeled as "Telegram OSINT" with channel name as sub-source
- [ ] Legal compliance: only public channels, no scraping of private data
- [ ] API credentials as environment variables

---

### OSINT-2: Think Tank RSS Aggregation

**As a** user, **I want to** access analysis from major think tanks, **so that** I get expert-level geopolitical assessments alongside breaking news.

**Acceptance Criteria:**

- [ ] RSS/Atom feeds aggregated from 15+ think tanks:
  - **US:** Brookings Institution, CSIS, RAND Corporation, Council on Foreign Relations (CFR), Carnegie Endowment, Atlantic Council, Institute for the Study of War (ISW)
  - **EU:** IISS (London), Chatham House, SIPRI (Stockholm), SWP (Berlin), ECFR
  - **Regional:** Al-Shabaka (Palestinian), Begin-Sadat Center (Israel), Middle East Institute
- [ ] Each source configured with: name, RSS URL, region focus, topic focus
- [ ] Polling interval: every 2 hours (think tanks publish less frequently)
- [ ] Articles stored with "Think Tank" source type for distinct UI treatment
- [ ] Think tank articles bypass the 24-48h content gate (they are analysis, not breaking news)
- [ ] Think tank articles prominently tagged in the news feed ("Analysis" badge)
- [ ] Content categorization applies (Military, Diplomatic, etc.)
- [ ] Deduplication against existing articles (think tanks often reference the same events)

---

### OSINT-3: UN OCHA ReliefWeb Humanitarian Data

**As a** user, **I want to** see UN humanitarian reports and data, **so that** I understand the human impact of conflicts.

**Acceptance Criteria:**

- [ ] Integration with ReliefWeb API (free, well-documented REST API)
- [ ] Filters: Middle East countries, disaster type = "Complex Emergency" or "Conflict"
- [ ] Data pulled: situation reports (sitreps), flash updates, response plans
- [ ] Polling interval: every 6 hours (UN publishes less frequently)
- [ ] Extracted data: title, source organization, date, country, summary, PDF link
- [ ] Humanitarian data tagged with "Humanitarian" category automatically
- [ ] Feeds into GEI "Humanitarian" category sub-score
- [ ] Displayed in news feed with "UN Report" source badge
- [ ] Data used on conflict map: humanitarian crisis markers (distinct icon from military events)
- [ ] ReliefWeb API requires attribution — displayed on relevant UI elements

---

### OSINT-4: Social Media Trend Indicators

**As a** system, **I want to** track social media trend signals for geopolitical keywords, **so that** the platform detects emerging crises from public discourse patterns.

**Acceptance Criteria:**

- [ ] Tracks trending volume for curated keyword sets:
  - Conflict keywords: "airstrike", "missile", "ceasefire", "invasion", "nuclear"
  - Regional keywords: "Gaza", "Hezbollah", "Houthi", "Iran", "IRGC"
  - Escalation keywords: "mobilization", "DEFCON", "emergency", "evacuate"
- [ ] Data sources (decide via ADR, at least one):
  - Google Trends API (free, rate-limited)
  - Twitter/X API (if cost-effective, or scraping alternative)
  - Reddit API (conflict-related subreddits)
- [ ] Trend data stored as time series: keyword, platform, volume/score, timestamp
- [ ] Polling interval: every 30 minutes for active monitoring
- [ ] Spike detection: alert when keyword volume exceeds 2x its 7-day moving average
- [ ] Spike events feed into GEI as a signal (low weight, used for early warning)
- [ ] Dashboard widget showing trending keywords with volume sparklines (Professional tier)
- [ ] No PII collected — only aggregate trend data
- [ ] Rate limits of external APIs respected with proper backoff

## Technical Notes

- **Telegram integration:** Two approaches:
  1. **Telegram Bot API** (simpler): Create a bot, add it to public channels as a reader. Limited to channels where the bot is added. Requires channel admin cooperation.
  2. **MTProto client** (e.g., `gramjs` or `telegram-mtproto`): Full client that can read any public channel without being added. More powerful but requires a user account (phone number) and careful rate limiting. Decide via ADR.
- **Think tank content:** These are long-form analysis pieces, not breaking news. GPT summarization is especially valuable here to distill 3000-word papers into 2-3 sentence summaries.
- **ReliefWeb API:** Well-structured REST API at `https://api.reliefweb.int/v1/`. Free, no API key required but rate-limited. Supports field selection, filtering, and pagination.
- **Social media API costs:** Twitter/X API is expensive (Basic tier: $100/month, Pro: $5000/month). Google Trends is free but limited. Reddit API is free with rate limits. Recommend starting with Google Trends + Reddit, add Twitter only if budget allows.
- **Spike detection algorithm:** Simple z-score approach: `z = (current_volume - mean_7d) / stddev_7d`. Spike if z > 2.0. More sophisticated: compare against seasonal patterns.
- **Data quality:** OSINT sources vary widely in reliability. Consider adding a "confidence" or "verification" tag to distinguish verified reports from unconfirmed claims.
- **Legal considerations:** Only public data. No login-walled content. Attribution required for ReliefWeb and think tank content. Telegram public channels are public by design. Document legal basis in `docs/security/data-sources-legal.md`.
- **ADR required:** Telegram integration approach (Bot API vs MTProto), social media data source selection, OSINT source reliability scoring methodology
