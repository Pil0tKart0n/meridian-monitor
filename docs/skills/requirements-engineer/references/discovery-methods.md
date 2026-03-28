# Discovery Methods — Reference

> This file describes elicitation and analysis techniques for requirements discovery.
> Each method includes: when to use, how to apply (adapted for LLM-assisted workflows), output format, and an example.

---

## 1. Impact Mapping

### When to use
- New product or major feature — need to connect business goals to deliverables
- Stakeholder asks "what should we build?" without clear scope
- Need to justify why specific features exist

### How it works

Build a tree: **Goal → Actors → Impacts → Deliverables**

```
Goal: Increase paid conversions by 20%
├── Actor: New visitor
│   ├── Impact: Finds relevant product quickly
│   │   ├── Deliverable: Search with filters
│   │   └── Deliverable: Product recommendations
│   └── Impact: Trusts the platform
│       ├── Deliverable: Reviews & ratings
│       └── Deliverable: Secure checkout badge
├── Actor: Returning customer
│   ├── Impact: Re-orders faster
│   │   └── Deliverable: Order history with re-order button
│   └── Impact: Discovers new products
│       └── Deliverable: Personalized recommendations
└── Actor: Support agent
    └── Impact: Resolves issues without escalation
        └── Deliverable: Order lookup & refund tool
```

### How to apply

1. Ask the user for their **goal** (measurable outcome)
2. Identify **actors** (who can influence the goal?)
3. For each actor, identify **impacts** (what behavior change do we need?)
4. For each impact, propose **deliverables** (what features enable this?)
5. Output as a tree in Markdown, then derive epics from the deliverables

### Output
- Impact map (tree format in Markdown)
- Derived epic list with goal traceability
- Priority recommendation (which impacts matter most?)

---

## 2. Story Mapping

### When to use
- Feature with a user journey — need to find the MVP slice
- Backlog feels like a flat list — need structure and sequencing
- Need to decide what goes into release 1 vs. release 2+

### How it works

```
User Journey (left to right):
  Browse → Search → View Product → Add to Cart → Checkout → Confirm

Backbone (essential steps):

Release 1 (MVP):
  Browse:       Homepage with categories
  Search:       Basic keyword search
  View Product: Product page with images + price
  Add to Cart:  Add button + cart count
  Checkout:     Single-page checkout (card only)
  Confirm:      Confirmation page + email

Release 2:
  Browse:       Personalized recommendations
  Search:       Filters + autocomplete
  View Product: Reviews, size guide
  Add to Cart:  Save for later
  Checkout:     Multiple payment methods
  Confirm:      Order tracking

Release 3:
  Browse:       AI recommendations
  Search:       Visual search
  ...
```

### How to apply

1. Ask the user to describe the **user journey** (or derive it from the feature description)
2. Lay out the **backbone** — the essential steps the user takes (left to right)
3. Under each step, list **stories** from most essential (top) to nice-to-have (bottom)
4. Draw a horizontal line for **release boundaries** — everything above = MVP
5. Convert each cell into a proper user story with ACs

### Output
- Story map as a Markdown table (steps × releases)
- MVP boundary clearly marked
- Stories prioritized top-to-bottom within each step

### Story Map Format (Markdown)

```markdown
| Step | Release 1 (MVP) | Release 2 | Release 3 |
|------|----------------|-----------|-----------|
| Browse | Category listing | Personalized recs | AI recs |
| Search | Keyword search | Filters + autocomplete | Visual search |
| View | Basic product page | Reviews, variants | AR preview |
| Cart | Add/remove items | Save for later | Recommendations |
| Checkout | Card payment | Multi-payment | Express checkout |
| Confirm | Confirmation page | Order tracking | Delivery updates |
```

---

## 3. Event Storming

### When to use
- Complex domain with many business processes
- Need to discover domain events, commands, and policies
- Need to find bounded context boundaries
- Input for the Architect's system design (bounded contexts, aggregates)

### How it works

Identify elements in this order:

1. **Domain Events** (orange) — things that happened, past tense: "Order Placed", "Payment Received"
2. **Commands** (blue) — actions that trigger events: "Place Order", "Process Payment"
3. **Actors** (yellow) — who triggers commands: User, System, Timer, External Service
4. **Policies** (purple) — automated reactions: "When Payment Received, then Ship Order"
5. **Read Models** (green) — data needed to make decisions: "Product Catalog", "Inventory Count"
6. **External Systems** (pink) — integrations: "Stripe", "Email Service"
7. **Aggregates** (large yellow) — consistency boundaries grouping events

### How to apply

1. Start with the **happy path** — list domain events in chronological order
2. Add **commands** — what triggers each event?
3. Add **actors** — who or what initiates each command?
4. Add **policies** — what happens automatically after certain events?
5. Identify **bounded contexts** — group related events that share language
6. Mark **pivotal events** — events where responsibility shifts between contexts

### Output Format

```markdown
## Event Storm: [Feature/Domain]

### Timeline (Happy Path)

| # | Actor | Command | → Event | Policy/Reaction |
|---|-------|---------|---------|-----------------|
| 1 | Customer | Submit Order | Order Placed | → Validate inventory |
| 2 | System | Check Inventory | Inventory Reserved | → Process payment |
| 3 | System | Charge Payment | Payment Received | → Initiate fulfillment |
| 4 | System | Create Shipment | Shipment Created | → Notify customer |
| 5 | System | Send Notification | Customer Notified | — |

### Error/Alternative Flows

| Trigger | Event | Policy/Reaction |
|---------|-------|-----------------|
| Inventory check fails | Inventory Insufficient | → Notify customer, cancel order |
| Payment fails | Payment Failed | → Release inventory, notify customer |
| Shipment delayed | Shipment Delayed | → Update tracking, notify customer |

### Bounded Context Candidates

| Context | Events owned | Key aggregate |
|---------|-------------|---------------|
| Commerce | Order Placed, Order Cancelled | Order |
| Payment | Payment Received, Payment Failed | Payment |
| Logistics | Shipment Created, Shipment Delivered | Shipment |
| Notification | Customer Notified | — (listener only) |

### Pivotal Events
- **Order Placed** → handoff from Commerce to Payment
- **Payment Received** → handoff from Payment to Logistics
```

---

## 4. Example Mapping

### When to use
- Refining a single user story — need to discover rules and edge cases
- ACs feel incomplete — "are we missing something?"
- Quick method to validate story readiness

### How it works

For each story, collect:
- **Rules** (blue cards) — business rules that govern behavior
- **Examples** (green cards) — concrete scenarios illustrating each rule
- **Questions** (red cards) — things we don't know yet

### How to apply

1. Take a story with basic ACs
2. For each AC, extract the **rule** it represents
3. For each rule, generate **2–3 concrete examples** (including edge cases)
4. Identify **questions** — things that aren't clear or have no rule yet
5. If too many questions → story isn't ready (needs more discovery)

### Output Format

```markdown
## Example Map: STORY-X.Y — [Name]

### Rule 1: [Business rule in plain language]
- ✅ Example: [Concrete scenario — specific input → expected output]
- ✅ Example: [Edge case scenario]
- ✅ Example: [Another edge case]

### Rule 2: [Another business rule]
- ✅ Example: [Scenario]
- ✅ Example: [Boundary case]

### Rule 3: [Validation rule]
- ✅ Example: [Valid input → success]
- ❌ Example: [Invalid input → specific error]
- ❌ Example: [Boundary input → specific behavior]

### Open Questions
- ❓ [Question 1 — what happens when...?]
- ❓ [Question 2 — is this rule correct for...?]
- ❓ [Question 3 — who decides...?]

### Readiness Assessment
- Rules: [N] identified
- Examples: [N] documented
- Questions: [N] open → [Ready / Needs clarification]
```

### Readiness Heuristic

| Questions | Status | Action |
|-----------|--------|--------|
| 0–2 open | ✅ Ready | Proceed to build |
| 3–5 open | ⚠️ Risky | Resolve critical questions first |
| 6+ open | ❌ Not ready | More discovery needed |

---

## 5. Assumption Busting

### When to use
- High uncertainty — new domain, new market, new technology
- Stakeholder says "we assume users want X" without evidence
- Architecture depends on unverified constraints

### How it works

1. **Surface assumptions** — list everything taken for granted
2. **Classify risk** — what's the impact if this assumption is wrong?
3. **Define validation** — how can we test this assumption cheaply?
4. **Track status** — validated, invalidated, or still open

### Output Format

```markdown
## Assumption Register: [Feature/Project]

| # | Assumption | Risk if wrong | Confidence | Validation method | Status |
|---|-----------|---------------|------------|-------------------|--------|
| A1 | Users prefer email login over social | Need to add social login (+3 stories) | Medium | User survey / A/B test | ⏳ Open |
| A2 | Max 100 concurrent users at launch | Infrastructure needs redesign | Low | Analytics from similar product | ✅ Validated |
| A3 | Payment provider supports EUR | Need alternative provider | High | API docs review | ✅ Validated |
| A4 | Users have modern browsers (ES2020+) | Need polyfills, larger bundle | Medium | Analytics / user research | ⏳ Open |

### Action Items
- A1: [Run survey before Sprint 3 — blocks payment feature stories]
- A4: [Check analytics data — blocks browser support decision]

### Invalidated Assumptions → Scope Impact
- [If A1 invalidated: Add STORY-2.4 (Social Login) to MVP, +2 days]
```

---

## Method Selection Guide

| Situation | Recommended method | Why |
|-----------|-------------------|-----|
| "What should we build?" | **Impact Mapping** | Connects goals to features |
| "What's the MVP?" | **Story Mapping** | Visualizes journey + slice |
| "What happens in this domain?" | **Event Storming** | Discovers events + boundaries |
| "Is this story complete?" | **Example Mapping** | Finds missing rules + edge cases |
| "Are we building on solid ground?" | **Assumption Busting** | Surfaces hidden risks |
| Complex feature, full discovery | **Impact Mapping** → **Story Mapping** → **Example Mapping** per story | Full pipeline |
| Simple feature, clear scope | **Example Mapping** per story | Just validate completeness |
