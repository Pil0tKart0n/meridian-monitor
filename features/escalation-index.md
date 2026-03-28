# Global Escalation Index (GEI)

## Overview

The Global Escalation Index is the core differentiator of WW3News. It is a single composite metric (0-100) that quantifies how close the world is to a large-scale military conflict, based on real-time event data across five weighted categories. The GEI is computed continuously, stored historically, and displayed as a prominent gauge widget throughout the platform.

The GEI draws inspiration from the Doomsday Clock but is data-driven rather than expert-opinion-based, with transparent methodology and category breakdowns.

## User Stories

### GEI-1: GEI Calculation Engine

**As a** system, **I want to** compute a composite Global Escalation Index from five weighted categories, **so that** users see a single authoritative escalation metric.

**Acceptance Criteria:**

- [ ] GEI is a value from 0 (calm) to 100 (critical)
- [ ] Five category weights:
  - Military Activity: 30%
  - Diplomatic Relations: 25%
  - Active Conflicts: 25%
  - Economic Indicators: 10%
  - Nuclear Threats: 10%
- [ ] Each category produces a sub-score (0-100) based on aggregated event scores
- [ ] Final GEI = weighted sum of category sub-scores
- [ ] Recalculated every 15 minutes (aligned with GDELT ingestion)
- [ ] Category weights configurable in a config file (for tuning without code changes)
- [ ] Calculation logic is a pure function with unit tests covering edge cases

---

### GEI-2: Event Scoring System

**As a** data analyst, **I want to** score individual events on a -10 to +10 scale, **so that** each event contributes proportionally to the GEI.

**Acceptance Criteria:**

- [ ] Scale: -10 (strong de-escalation) to +10 (extreme escalation)
- [ ] Scoring approaches (decide via ADR):
  - Rule-based: CAMEO Goldstein scale mapped to -10/+10 range
  - GPT-assisted: prompt scores event with justification
  - Hybrid: rule-based default, GPT for ambiguous events
- [ ] Score stored per event with: value, method (rule/gpt), confidence, timestamp
- [ ] Example scores:
  - Ceasefire agreement: -7
  - Peace talks announced: -4
  - Troop mobilization: +5
  - Missile strike on civilian area: +8
  - Nuclear test: +10
- [ ] Scores are immutable once computed (append-only, no retroactive changes)
- [ ] Unscored events default to 0 (neutral) until processed

---

### GEI-3: Exponential Decay with Rolling Window

**As a** system, **I want to** apply exponential time decay to event scores, **so that** recent events matter more than older ones.

**Acceptance Criteria:**

- [ ] Half-life: 14 days (an event's contribution halves every 14 days)
- [ ] Rolling window: 90 days (events older than 90 days are excluded entirely)
- [ ] Decay formula: `weight = 2^(-age_days / 14)`
- [ ] Category sub-score = sum of (event_score * decay_weight) / normalization_factor
- [ ] Normalization prevents score inflation when many events occur simultaneously
- [ ] Decay is applied at calculation time, not stored (raw scores are preserved)
- [ ] Unit tests verify decay curve at key points: day 0 (1.0), day 14 (0.5), day 28 (0.25), day 90 (~0.013)

---

### GEI-4: Historical Storage

**As a** data analyst, **I want to** store daily GEI snapshots, **so that** we can show historical trends and perform analysis.

**Acceptance Criteria:**

- [ ] Daily snapshot stored at 00:00 UTC: overall GEI + all 5 category sub-scores
- [ ] Schema: `gei_snapshots(id, date, overall_score, military_score, diplomatic_score, conflict_score, economic_score, nuclear_score, created_at)`
- [ ] Historical data backfilled on initial deployment (from available event data)
- [ ] Snapshots are immutable (no updates, append-only)
- [ ] Retention: indefinite (small data volume, ~365 rows/year)
- [ ] Index on `date` column for efficient range queries

---

### GEI-5: GEI API Endpoint

**As a** frontend developer, **I want to** fetch the current GEI and historical data via API, **so that** I can render the GEI widget and charts.

**Acceptance Criteria:**

- [ ] `GET /api/v1/gei/current` returns:
  ```json
  {
    "data": {
      "overall": 62.4,
      "categories": {
        "military": 71.2,
        "diplomatic": 55.8,
        "conflict": 68.3,
        "economic": 45.1,
        "nuclear": 52.0
      },
      "trend": "rising",
      "updatedAt": "2026-03-28T12:15:00Z"
    }
  }
  ```
- [ ] `GET /api/v1/gei/history?days=30` returns daily snapshots
- [ ] `GET /api/v1/gei/history?from=2026-01-01&to=2026-03-28` returns date range
- [ ] `trend` field: "rising" (7-day avg > 14-day avg), "falling" (opposite), "stable" (within 2 points)
- [ ] Response cached for 15 minutes (aligned with recalculation interval)
- [ ] No auth required for current GEI (public data)
- [ ] History beyond 7 days requires Premium tier

---

### GEI-6: GEI Widget Component

**As a** user, **I want to** see a visual gauge showing the current GEI, **so that** I can instantly understand the global escalation level.

**Acceptance Criteria:**

- [ ] Gauge visualization: semi-circular or radial gauge, 0-100 scale
- [ ] Color zones: 0-30 green (low), 30-50 yellow (elevated), 50-70 orange (high), 70-100 red (critical)
- [ ] Current value displayed prominently with 1 decimal place
- [ ] Trend indicator: arrow up/down/stable next to the value
- [ ] Category breakdown: 5 horizontal bars below the gauge showing sub-scores
- [ ] Mini trend line: last 30 days sparkline
- [ ] Responsive: works at widget size (300px) and full-width
- [ ] Animated on load (gauge fills to current value, respects `prefers-reduced-motion`)
- [ ] Updates via polling every 60 seconds (or WebSocket if implemented)
- [ ] Accessible: `aria-label` with current value and trend in text form

## Technical Notes

- **Calculation purity:** The GEI calculation engine should be a pure function (events in, score out) with no side effects, making it trivially testable
- **Normalization:** Critical to prevent score inflation. Options: cap per-category event count, use percentile ranking, or log-scale normalization. Decide via ADR.
- **Caching:** Current GEI value cached in Redis or in-memory (recalculated every 15 min, served from cache between recalculations)
- **Gauge library:** Consider D3.js for custom gauge, or a lightweight library like `react-gauge-chart`. Custom SVG preferred for full design control.
- **Historical chart:** Recharts or Chart.js for the trend line
- **ADR required:** Scoring methodology (rule-based vs GPT vs hybrid), normalization approach, gauge visualization library
