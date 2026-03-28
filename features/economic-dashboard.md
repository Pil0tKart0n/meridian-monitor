# Economic Dashboard

## Overview

The Economic Dashboard visualizes financial market indicators that are sensitive to geopolitical escalation. It tracks the VIX fear index, oil prices, gold prices, and defense sector stocks, and correlates them with the Global Escalation Index. This feature is gated to Professional tier (full dashboard) and Premium tier (basic charts), providing a compelling upgrade path for analysts, traders, and researchers.

All market data is sourced from the Data Pipeline (see `data-pipeline.md` DP-4).

## User Stories

### ED-1: VIX Fear Index Chart

**As a** user, **I want to** see a chart of the VIX volatility index, **so that** I can gauge market fear levels alongside geopolitical events.

**Acceptance Criteria:**

- [ ] Line chart showing VIX closing values over a selectable period (7d, 30d, 90d, 1y)
- [ ] Current value displayed prominently with daily change (absolute + percentage)
- [ ] Color indicator: green (VIX < 20), yellow (20-30), red (> 30)
- [ ] Horizontal reference lines at 20 (normal) and 30 (fear threshold)
- [ ] Tooltip on hover: date, close value, daily change
- [ ] Responsive: full-width chart, readable on mobile
- [ ] Accessible: `aria-label` summarizing current value and trend, data table alternative
- [ ] Data source attribution displayed below chart
- [ ] Premium tier: 30d view. Professional tier: full history + 1y view.

---

### ED-2: Oil Price Chart

**As a** user, **I want to** track Brent and WTI crude oil prices, **so that** I can see how Middle East conflicts affect energy markets.

**Acceptance Criteria:**

- [ ] Dual-line chart: Brent Crude (primary) and WTI Crude (secondary)
- [ ] Selectable periods: 7d, 30d, 90d, 1y
- [ ] Current price for both benchmarks displayed with daily change
- [ ] Spread (Brent - WTI) shown as a metric below the chart
- [ ] Tooltip: date, Brent price, WTI price, spread
- [ ] Key event annotations: major geopolitical events overlaid as vertical markers on the chart (stretch goal)
- [ ] Y-axis in USD per barrel
- [ ] Accessible: data table alternative, descriptive `aria-label`
- [ ] Premium tier required

---

### ED-3: Gold Price Chart

**As a** user, **I want to** track gold spot prices, **so that** I can monitor safe-haven demand during geopolitical instability.

**Acceptance Criteria:**

- [ ] Line chart showing gold spot price (USD/oz)
- [ ] Selectable periods: 7d, 30d, 90d, 1y
- [ ] Current price with daily change (absolute + percentage)
- [ ] Color: gold/amber accent color for the line
- [ ] Tooltip: date, close price, daily change
- [ ] Responsive and accessible (same standards as VIX chart)
- [ ] Premium tier required

---

### ED-4: Defense Stock Tracker

**As a** user, **I want to** track defense sector stock performance, **so that** I can see how the defense industry responds to escalation.

**Acceptance Criteria:**

- [ ] Tracks 5 major defense companies:
  - Lockheed Martin (LMT)
  - RTX Corporation (RTX)
  - Northrop Grumman (NOC)
  - General Dynamics (GD)
  - BAE Systems (BA.L)
- [ ] Display mode: normalized performance comparison (percentage change from period start)
- [ ] Multi-line chart with all 5 stocks, color-coded with legend
- [ ] Toggle individual stocks on/off by clicking the legend
- [ ] Current price and daily change per stock in a compact table below the chart
- [ ] Selectable periods: 7d, 30d, 90d, 1y
- [ ] Tooltip: date + all visible stock values
- [ ] Accessible: data table alternative listing all stocks and values
- [ ] Professional tier required

---

### ED-5: Correlation View (GEI vs Market Indicators)

**As an** analyst, **I want to** see how the GEI correlates with market indicators, **so that** I can identify patterns between geopolitical escalation and financial impact.

**Acceptance Criteria:**

- [ ] Dual-axis chart: GEI (left axis) vs selected market indicator (right axis)
- [ ] Selectable indicator: VIX, Brent Oil, Gold, Defense Index (average of 5 stocks)
- [ ] Correlation coefficient (Pearson r) calculated and displayed for selected period
- [ ] Correlation strength label: weak (|r| < 0.3), moderate (0.3-0.7), strong (|r| > 0.7)
- [ ] Selectable periods: 30d, 90d, 1y
- [ ] Scatter plot option: GEI on X-axis, market indicator on Y-axis (for visual correlation)
- [ ] Accessible: correlation coefficient and interpretation available as text
- [ ] Professional tier required
- [ ] Disclaimer: "Correlation does not imply causation. For informational purposes only."

---

### ED-6: Professional Tier Gate

**As a** product owner, **I want to** gate the full economic dashboard behind the Professional tier, **so that** it drives upgrades from Premium.

**Acceptance Criteria:**

- [ ] Access levels:
  - Free: no access to economic dashboard (upgrade CTA on nav link)
  - Premium: VIX chart (30d) + Oil chart (30d) + Gold chart (30d) — basic view
  - Professional: all charts, all time ranges, defense stocks, correlation view, data export
- [ ] Gated sections show a blurred preview with overlay: "Upgrade to Professional for full market analysis"
- [ ] Upgrade CTA links to Stripe checkout for Professional tier
- [ ] API endpoints enforce tier check (not just frontend hiding)
- [ ] Data export (Professional only): CSV download of chart data

## Technical Notes

- **Chart library:** Recharts (React-based, good for responsive line charts) or Chart.js via react-chartjs-2. Recharts preferred for its declarative API and responsive container.
- **Dual-axis charts:** Both Recharts and Chart.js support dual Y-axes. Ensure clear visual distinction (different line styles, labeled axes).
- **Correlation calculation:** Pearson correlation computed server-side on the API. Input: two time series aligned by date. Output: coefficient + p-value.
- **Data freshness:** Market data updates daily (see DP-4). Charts show data up to the last market close. "Last updated" timestamp displayed on each chart.
- **Performance:** Charts render client-side. Data fetched via API on component mount. Skeleton loading states while data loads. Consider `React.lazy` for the dashboard page.
- **Normalization for defense stocks:** Percentage change from period start date, not raw prices (makes stocks with different price levels comparable).
- **Disclaimer:** Financial data is informational only. Not investment advice. Disclaimer text on every chart and on the dashboard page header.
- **Export format:** CSV with columns: date, indicator, value. UTF-8 with BOM for Excel compatibility.
- **ADR required:** Chart library choice (Recharts vs Chart.js vs Visx), data export format and rate limiting
