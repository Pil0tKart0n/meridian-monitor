# Delivery Playbook — Project Lead Reference

> Detailed templates and procedures for sprint planning, release coordination,
> stakeholder communication, incident management, and retrospective facilitation.

---

## 1. Sprint Planning Playbook

### Pre-Planning (1 day before)

**Project Lead responsibilities:**
1. Review GitHub Issues (`gh issue list --label "status:ready"`) — identify candidates for next sprint
2. Verify DoR status for all candidate stories
3. Prepare capacity overview (available person-days minus meetings, PTO, tech-debt budget)
4. Flag dependencies between stories and between skills
5. Share agenda and candidate stories async (Slack/doc) 24h before planning session

### Planning Session (time-boxed: 2h max)

**Agenda:**
```
1. [10 min] Review last sprint: what shipped, what carried over, why
2. [15 min] Capacity check: available days per skill, tech-debt budget (15–20%)
3. [45 min] Story selection: walk through candidates, confirm DoR, estimate (S/M/L)
4. [20 min] Dependency mapping: which stories block others, what sequence
5. [15 min] Risk review: top 3 risks for this sprint
6. [15 min] Commitment: team agrees on sprint scope. Write sprint goal (1 sentence).
```

**Output:**
- Sprint goal (1 sentence, set as Milestone description)
- Stories committed with owners and estimates
- Dependencies and sequence documented
- Known risks with mitigations

### Sprint Goal Format
```
Sprint [YYYY-WXX] Goal: [One sentence describing the main outcome]
Example: "Sprint 2025-W08 Goal: Users can register, log in, and reset their password."
```

### Estimation Quick Reference

| Size | Max duration | Complexity | Example |
|------|-------------|------------|---------|
| **S** | 1 day | Well-understood, no unknowns | Bug fix, config change, simple UI component |
| **M** | 3 days | Known patterns, some integration | New API endpoint + tests, FE feature with state |
| **L** | 5 days | Multiple skills, integration, unknowns | New service boundary, DB migration + API + FE |
| **XL** | — | **Must be split.** Too large for a single story. | Epic-level. Break down into S/M/L stories. |

**Rule:** If a story is L, actively look for ways to split it. If XL, it MUST be split before entering sprint. No story should take more than 5 days.

---

## 2. Backlog Refinement Playbook

### Session Format (mid-sprint, 1h max)

**Participants:** Project Lead + Requirements Engineer + relevant skill leads

**Agenda:**
```
1. [10 min] Upcoming stories: review next sprint candidates
2. [30 min] Refinement: clarify ACs, identify edge cases, estimate
3. [10 min] DoR check: which stories are Ready, which need more work
4. [10 min] Discovery pipeline: what new items need exploration
```

**Key Questions per Story:**
- Is the "why" clear? (Business value / user outcome)
- Are ACs testable? (QA can confirm "Given/When/Then" works)
- Are NFRs measurable? (SLI defined, threshold set)
- Are dependencies identified? (Which skills, which contracts, which external systems)
- Is the scope bounded? ("Out of scope" is explicit)
- Is test data specified? (Fixtures, personas, states)
- Is the design available? (Figma, copy, SEO constraints — if user-facing)

### Refinement Output
- Updated stories as GitHub Issues with `status:discovery` label
- Stories that pass DoR → moved to Ready section
- Action items for stories that need more work (assigned, with due date)

---

## 3. Release Coordination Playbook

### Pre-Release Checklist (expanded)

**T-2 days (preparation):**
- [ ] All stories for release meet DoD (verify in CI dashboard)
- [ ] QA sign-off: quality report generated, no P1/P2 open bugs
- [ ] Release notes drafted (auto-generated from Conventional Commits, reviewed for clarity)
- [ ] Rollback plan documented: steps, responsible person, max rollback time
- [ ] On-call engineer identified and aware
- [ ] Stakeholder notification drafted (what's shipping, expected user impact)

**T-1 day (staging validation):**
- [ ] Full test suite passes on staging/preview environment
- [ ] Performance regression check: compare against baseline (k6/Lighthouse)
- [ ] Migration dry-run successful (if DB changes)
- [ ] Feature flags configured correctly
- [ ] Monitoring dashboards show green on staging

**T-0 (deploy day):**
- [ ] Final "go/no-go" decision (Project Lead + QA + DevOps)
- [ ] Deploy to production (canary → full if applicable)
- [ ] Smoke tests pass on production
- [ ] Monitoring verified: SLOs, error rates, latency within bounds
- [ ] Stakeholders notified: "Release [version] is live"
- [ ] GitHub Issues closed via `Closes #N` commits

**T+1 day (post-release):**
- [ ] No new errors in monitoring (check next morning)
- [ ] User-facing changes verified (spot check)
- [ ] Any issues? → Triage immediately, rollback if P1

### Release Communication Template

```markdown
## Release [VERSION] — [DATE]

**Summary:** [1-2 sentences: what shipped and for whom]

**Key changes:**
- [Feature/fix 1]: [brief description]
- [Feature/fix 2]: [brief description]

**Impact:** [Who is affected, what changes for users/team]

**Known issues:** [Any known limitations or follow-ups]

**Rollback plan:** [Link to rollback procedure]

**Monitoring:** [Link to dashboard]
```

---

## 4. Incident Communication Playbook

### Incident Roles (assign at incident start)

| Role | Responsibility | Who |
|------|---------------|-----|
| **Incident Commander (IC)** | Owns technical resolution. Makes decisions. Delegates tasks. | Most senior available engineer from affected skill |
| **Communications Lead (Comms)** | External/stakeholder updates. Status page. Slack announcements. | Project Lead (default) or designated person |
| **Scribe** | Documents timeline, decisions, actions in real-time. | Assigned at incident start |

**Rule:** IC never does Comms. Separation prevents context switching during active troubleshooting.

### Incident Severity Levels

| Severity | Definition | Response Time | Communication Cadence |
|----------|-----------|---------------|----------------------|
| **P1 — Critical** | Service down, data loss risk, >10% users affected | 15 min | Every 30 min until mitigated |
| **P2 — Major** | Degraded performance, feature broken, <10% users | 30 min | Every 60 min until mitigated |
| **P3 — Minor** | Cosmetic issue, workaround available | Next business day | As needed |
| **P4 — Low** | Enhancement request, non-urgent bug | Backlog | No active communication |

### Incident Communication Templates

**Initial notification (within response time):**
```
🔴 INCIDENT — [P1/P2] — [Brief title]

Detected: [time]
Impact: [What's broken, who's affected]
Status: Investigating
IC: @[name]
Comms: @[name]

Updates every [30/60] min in #incidents channel.
```

**Update notification:**
```
🟡 UPDATE — [Brief title] — [HH:MM]

Status: [Investigating / Identified / Mitigating / Monitoring / Resolved]
Current understanding: [What we know]
Actions in progress: [What we're doing]
ETA: [Best estimate or "unknown"]

Next update: [time]
```

**Resolution notification:**
```
🟢 RESOLVED — [Brief title] — [HH:MM]

Duration: [start → end]
Root cause: [Brief summary]
Fix: [What was done]
Impact: [Users affected, data impact]

Postmortem scheduled: [date/time]
```

### Statuspage Management

For P1/P2 incidents visible to external users:

| Phase | Statuspage State | Message |
|-------|-----------------|---------|
| Detection | **Investigating** | "We're investigating reports of [issue]. Updates to follow." |
| Identified | **Identified** | "We've identified the cause of [issue]. Working on a fix." |
| Fix deployed | **Monitoring** | "A fix has been deployed. We're monitoring the situation." |
| Confirmed stable | **Resolved** | "This incident has been resolved. [Brief summary of what happened]." |

### Postmortem Template

Run within 48 hours of P1/P2 resolution:

```markdown
# Postmortem: [Incident Title] — [Date]

## Summary
[2-3 sentences: what happened, impact, duration]

## Timeline
| Time (UTC) | Event |
|-----------|-------|
| HH:MM | [First alert / detection] |
| HH:MM | [IC assigned, investigation started] |
| HH:MM | [Root cause identified] |
| HH:MM | [Fix deployed] |
| HH:MM | [Confirmed resolved] |

## Root Cause
[What actually caused the incident — technical detail]

## Impact
- Users affected: [count/percentage]
- Duration: [minutes/hours]
- Data impact: [none / describe]
- SLO impact: [error budget consumed]

## What Went Well
- [Thing 1]
- [Thing 2]

## What Went Poorly
- [Thing 1]
- [Thing 2]

## Action Items
| # | Action | Owner | Due | Status |
|---|--------|-------|-----|--------|
| 1 | [Specific action] | @[name] | [date] | Open |
| 2 | [Specific action] | @[name] | [date] | Open |

## Lessons Learned
[What did we learn that we want to remember?]
```

**Rule:** Postmortems are blameless. Focus on systems and processes, not individuals. "How did our system allow this?" not "Who caused this?"

---

## 5. Game Day Exercises

### Purpose
Regularly practice incident response to build muscle memory and find gaps.

### Game Day Format (quarterly)

**Preparation (Game Day Lead = Project Lead):**
1. Choose a realistic failure scenario (network partition, DB failover, dependency down, deploy gone wrong)
2. Prepare the injection method (chaos engineering tool, manual trigger, or tabletop)
3. Inform only the Game Day Lead and 1 observer — rest of team doesn't know the scenario
4. Schedule 2-hour window where team is available

**Execution:**
1. Inject failure or announce tabletop scenario
2. Team responds using real incident process (IC, Comms, Scribe)
3. Observer takes notes on: time to detect, time to triage, communication quality, runbook usage
4. After resolution (or 90 min), debrief with full team

**Debrief template:**
```
Game Day: [Scenario] — [Date]

Detection time: [minutes]
Triage time: [minutes]
Resolution time: [minutes or "not resolved in window"]

What worked:
- [Item]

What didn't:
- [Item]

Runbook gaps:
- [Missing or outdated runbook]

Action items:
- [Action] → [Owner] → [Due date]
```

**Scenarios library (rotate quarterly):**
1. Primary database fails over to replica
2. Third-party API returns 500s for 30 minutes
3. Deploy introduces a P1 regression — rollback needed
4. Memory leak causes service to OOM every 2 hours
5. DNS change propagation issue
6. Certificate expiration (simulated)
7. Spike in traffic (3x normal) during off-hours

---

## 6. Stakeholder Communication Playbook

### Stakeholder Map

| Stakeholder | Needs | Communication | Frequency |
|-------------|-------|---------------|-----------|
| **Product Owner / Customer** | Feature progress, delivery dates | Sprint demos, release notes | Per sprint + per release |
| **Engineering Leadership** | Quality, velocity, risks | DORA metrics dashboard, monthly summary | Monthly |
| **External Users** | What's new, what's fixed | Changelog, statuspage | Per release |
| **Support Team** | Known issues, workarounds | Internal release notes, known-issues doc | Per release |

### Stakeholder Update Template (monthly)

```markdown
## Engineering Update — [Month Year]

**Highlights:**
- [Major feature/milestone shipped]
- [Key quality improvement]

**Metrics:**
- Deployment frequency: [X per week]
- Lead time: [X hours/days]
- Change failure rate: [X%]
- MTTR: [X hours]

**Upcoming:**
- [Next major milestone with expected date]

**Risks:**
- [Top risk with mitigation status]
```

---

## 7. Retrospective Facilitation Playbook

### Format Options (rotate to prevent staleness)

**Format A: Start / Stop / Continue**
```
What should we START doing?
What should we STOP doing?
What should we CONTINUE doing?
```

**Format B: 4 Ls — Liked / Learned / Lacked / Longed For**
```
What did you LIKE about this sprint?
What did you LEARN?
What was LACKING?
What did you LONG FOR?
```

**Format C: Sailboat**
```
🌬️ Wind (what pushed us forward):
⚓ Anchor (what slowed us down):
🪨 Rocks (risks ahead):
🏝️ Island (our goal):
```

### Facilitation Protocol

1. **Set the stage** (5 min): Remind of retro rules (blameless, constructive, specific). Review last retro's action items.
2. **Gather data** (10 min): Silent brainstorming → sticky notes (physical or virtual). One idea per note.
3. **Group and vote** (10 min): Cluster similar items. Dot-vote (3 dots per person) to prioritize.
4. **Generate insights** (10 min): Discuss top 3–5 items. Ask "why" to get to root causes.
5. **Decide actions** (10 min): 2–3 concrete actions with owners and due dates. Max 3 actions — more won't get done.
6. **Close** (5 min): Summarize actions. Quick round: "How useful was this retro? 1–5"

### Retro Anti-Patterns to Avoid

| Anti-pattern | Symptom | Fix |
|-------------|---------|-----|
| **Groundhog Day** | Same issues every sprint | Review action items first. If recurring, escalate or change approach. |
| **Blame game** | Pointing fingers at individuals | Redirect to systems: "What allowed this to happen?" |
| **Action graveyard** | Actions written but never done | Start every retro by reviewing last actions. No new actions until old ones are addressed. |
| **Only negatives** | Retro feels demoralizing | Ensure format includes positive category. Celebrate wins. |
| **Too many actions** | Nothing gets done because list is too long | Max 3 actions per retro. Fewer is better. |

---

## 8. Cross-Skill Handoff Checklists

### Requirements → Architect Handoff
```
- [ ] Stories with ACs (Given/When/Then format)
- [ ] NFRs with measurable targets and SLI definitions
- [ ] Privacy checkpoint completed (if PII)
- [ ] Domain model / key entities identified
- [ ] Constraints documented (budget, timeline, compliance, existing systems)
- [ ] Stakeholder priorities clear (MoSCoW or equivalent)
```

### Architect → Engineers Handoff
```
- [ ] Architecture Brief delivered (scope, boundaries, tech stack)
- [ ] ADRs for all significant decisions
- [ ] Architecture Diagrams erstellt (docs/architecture/):
  - [ ] System Context (C4 Level 1)
  - [ ] Container Diagram (C4 Level 2)
  - [ ] ER-Diagram (wenn DB-Schema definiert)
  - [ ] Sequence Diagrams (für komplexe Flows)
- [ ] Contracts defined (OpenAPI/AsyncAPI)
- [ ] Performance budgets set (API latency, DB query, CWV)
- [ ] Security posture defined (auth flow, threat model)
- [ ] SLOs defined and agreed with DevOps
```

### Engineers → QA Handoff
```
- [ ] DoD met (code reviewed, unit/integration tests pass, no lint errors)
- [ ] Feature deployed to preview/staging environment
- [ ] Test data / fixtures available
- [ ] Known limitations documented
- [ ] Observability instrumented (logs, metrics, traces)
```

### QA → DevOps (Release) Handoff
```
- [ ] QA gate passed (quality report generated)
- [ ] No P1/P2 open bugs
- [ ] Performance regression check passed
- [ ] A11y scan passed (if user-facing)
- [ ] Contract tests passed
```

### Engineers → Documentation Writer Handoff (when activated)
```
- [ ] New endpoints / schema changes / features identified for documentation
- [ ] Code examples available (working test cases that can be adapted)
- [ ] Error codes and validation rules documented in code
- [ ] Architecture decisions (ADRs) available
- [ ] Known limitations and gotchas communicated
```

### Documentation Writer → QA Handoff (when activated)
```
- [ ] Documentation Audit Report delivered (what's current, stale, missing)
- [ ] All code examples tested and verified
- [ ] All internal links validated (no 404s)
- [ ] Prose linting passed (Vale, markdownlint)
- [ ] API documentation matches current OpenAPI spec
- [ ] Documentation QA Checklist provided
```

### Documentation Writer → DevOps (Release) Handoff (when activated)
```
- [ ] README finalized and reflects release state
- [ ] CHANGELOG versioned (moved from [Unreleased] to version)
- [ ] API documentation ready for deployment (if docs site exists)
- [ ] Migration guide written (if breaking changes)
- [ ] Runbooks reviewed for accuracy
```

### Architect → Performance Engineer Handoff (when activated)
```
- [ ] Performance budgets defined (docs/contracts/PERF-BUDGETS.md)
- [ ] SLOs and SLIs specified for all critical paths
- [ ] Architecture brief with scalability constraints
- [ ] Expected traffic patterns and growth projections
- [ ] Technology constraints that affect performance (e.g., cold starts, connection limits)
```

### Performance Engineer → Engineers Handoff (when activated)
```
- [ ] Profiling results with identified bottlenecks
- [ ] Optimization recommendations per endpoint/component
- [ ] Caching strategy with invalidation rules
- [ ] Load test scripts for new endpoints
- [ ] Performance anti-patterns identified in code review
```

### Performance Engineer → QA Handoff (when activated)
```
- [ ] Performance test suite (smoke, average, stress, soak)
- [ ] Performance baselines for regression detection
- [ ] CI gate configuration for performance checks
- [ ] Performance budget matrix with measurement methods
- [ ] Known performance limitations documented
```

### Performance Engineer → DevOps Handoff (when activated)
```
- [ ] Monitoring dashboard specifications (metrics, panels, thresholds)
- [ ] Alerting rules for performance budget violations
- [ ] Capacity plan with scaling triggers
- [ ] RUM strategy (sampling rates, segmentation)
- [ ] CI pipeline performance stages defined
```

### Architect → Accessibility Engineer Handoff (when activated)
```
- [ ] Design tokens defined (colors, spacing, typography)
- [ ] Component library scope identified (which components need a11y specs)
- [ ] Target WCAG level decided (AA standard, AAA for critical features)
- [ ] Legal requirements identified (BFSG/EAA, ADA, Section 508)
- [ ] Target platforms and assistive technologies identified
```

### Accessibility Engineer → Engineers Handoff (when activated)
```
- [ ] Contrast matrix delivered (docs/a11y/contrast-matrix.md)
- [ ] Focus architecture defined (docs/a11y/focus-architecture.md)
- [ ] Component a11y specs delivered (ARIA roles, keyboard behavior, SR announcements)
- [ ] A11y testing strategy defined (automated + manual checks)
- [ ] AcDRs for any WCAG exceptions
```

### Accessibility Engineer → QA Handoff (when activated)
```
- [ ] axe-core CI integration configured
- [ ] Screen reader test scripts per user flow
- [ ] Keyboard navigation test checklist
- [ ] WCAG compliance audit checklist (Perceivable, Operable, Understandable, Robust)
- [ ] Known a11y limitations documented with planned fix dates
```

### DevOps → All (Post-Release) Handoff
```
- [ ] Deployed to production
- [ ] Monitoring active and verified
- [ ] Smoke tests passed in production
- [ ] On-call aware and briefed
- [ ] Stakeholders notified
```

### Challenge Engineer Handoffs

**Requirements → Challenge (Phase 1→2 Übergang):**
```
- [ ] User Stories + ACs vorhanden
- [ ] Challenge: Edge-Case-Hunting auf Stories ("Was fehlt in den ACs?")
- [ ] Ergänzte Edge Cases als AC-Erweiterung oder separate Story
```

**Architect → Challenge (Phase 2, nach ADRs):**
```
- [ ] ADRs erstellt + Contracts definiert
- [ ] Challenge: Pre-Mortem ("Stell dir vor, das Projekt scheitert — warum?")
- [ ] Challenge: Assumption Stress-Test auf kritische ADRs
- [ ] Kritische Findings als ADR-Ergänzung oder neue Story
```

**Challenge → QA (Phase 4, Pre-Release):**
```
- [ ] Challenge Report mit Risiko-Bewertung (Kritisch/Wichtig/Notiz)
- [ ] Edge-Case-Listen als Testfall-Input für QA
- [ ] Pre-Release Risk Assessment dokumentiert
```

---

## 9. Prioritization Frameworks Quick Reference

### WSJF (Weighted Shortest Job First) — SAFe-derived
```
WSJF = Cost of Delay / Job Duration

Cost of Delay = User/Business Value + Time Criticality + Risk Reduction

Score: 1–10 for each factor.
Higher WSJF → do first.
```

### MoSCoW
```
MUST:   Without this, the release has no value / is non-compliant
SHOULD: Important, but release is viable without it
COULD:  Nice to have, do if capacity allows
WON'T:  Explicitly out of scope (this time)
```

### RICE
```
RICE = (Reach × Impact × Confidence) / Effort

Reach: How many users per period
Impact: 3 (massive) / 2 (high) / 1 (medium) / 0.5 (low) / 0.25 (minimal)
Confidence: 100% / 80% / 50% — how sure are we about estimates
Effort: Person-weeks
```

**When to use which:**
- **WSJF:** When cost of delay matters (time-sensitive features, compliance deadlines)
- **MoSCoW:** When scope-cutting for a fixed deadline (MVP, release planning)
- **RICE:** When comparing many diverse features (backlog prioritization, roadmap)

---

## 10. Tech Debt Management

### Classification

| Category | Description | Example | Priority signal |
|----------|-----------|---------|-----------------|
| **Reckless + Deliberate** | "We know this is wrong but ship anyway" | Hardcoded config, skipped tests | Fix next sprint |
| **Prudent + Deliberate** | "We'll do it this way for now and improve later" | Simple solution before scale needed | Track + schedule |
| **Reckless + Inadvertent** | "We didn't know better" | N+1 queries, missing indices | Fix when discovered |
| **Prudent + Inadvertent** | "Now we know a better way" | Refactor after learning | Backlog + prioritize |

### Tech Debt Budget Rules

1. **Reserve 15–20% of sprint capacity** for tech debt and quality improvements
2. **Every sprint must include at least 1 tech debt item** — non-negotiable
3. **Tech debt items follow the same DoD** as feature stories
4. **Track tech debt ROI:** What was the cost of not fixing? What did fixing enable?
5. **Escalate if budget is consistently consumed by features** — this signals timeline/scope problems, not tech debt problems

### Tech Debt Story Template

```markdown
## [DEBT-XXX]: [Brief title]

**Category:** [Reckless/Prudent] + [Deliberate/Inadvertent]
**Impact:** [What's the cost of NOT fixing? Performance? Developer velocity? Risk?]
**Effort:** [S/M/L]
**Dependencies:** [What else needs to change?]

**Current state:** [What exists now and why it's problematic]
**Target state:** [What it should look like after]
**Acceptance criteria:**
- [ ] [Specific, verifiable outcome]
- [ ] Tests updated/added
- [ ] Documentation updated
```

---
