# User Story Templates — Reference

> This file provides copy-paste-ready templates for all requirements artifacts.
> Use as-is or adapt to context. Templates are opinionated defaults — deviate when justified.

---

## 1. Epic Template

```markdown
# Epic: [Name]

**Status:** PLANNING | READY | IN PROGRESS | DONE
**Priority:** CRITICAL | HIGH | MEDIUM | LOW
**Owner:** [Who requested / who is accountable]

## Problem Statement

[2–4 sentences: What problem are we solving? For whom? Why now?]

## Goal & Success Metrics

**Goal:** [1 sentence — what does success look like?]

| Metric | Current | Target | How to measure |
|--------|---------|--------|----------------|
| [KPI 1] | [baseline or "unknown"] | [target] | [tool/method] |
| [KPI 2] | [baseline] | [target] | [tool/method] |

## Scope

### In Scope
- [Feature/capability 1]
- [Feature/capability 2]

### Out of Scope
- [Explicitly excluded item 1]
- [Explicitly excluded item 2]

### MVP Boundary
- **MVP:** [minimal stories that solve the core problem]
- **Iteration 2:** [enhancements deferred]

## Personas

| Persona | Description | Primary goal |
|---------|-------------|-------------|
| [Name] | [Role, context, tech comfort] | [What they want to achieve] |

## User Journey (high-level)

1. [Step 1 — entry point]
2. [Step 2 — core action]
3. [Step 3 — outcome]

## NFRs (Epic-level)

- **Performance:** [target]
- **Security:** [constraints]
- **Privacy:** [PII handling, consent, GDPR]
- **Accessibility:** [WCAG level, key requirements]
- **Reliability:** [SLO target]

## Risks & Assumptions

| # | Type | Description | Impact | Mitigation / Validation |
|---|------|-------------|--------|------------------------|
| R1 | Risk | [description] | [HIGH/MEDIUM/LOW] | [mitigation] |
| A1 | Assumption | [description] | [impact if wrong] | [how to validate] |

## Dependencies

- [Service/team/third-party dependency 1]
- [Service/team/third-party dependency 2]

## Stories

→ See GitHub Issues (`gh issue list --label "status:ready"`) for prioritized story list with ACs
→ See docs/requirements/EPIC-X-[name].md for detailed specs (if needed)
```

---

## 2. User Story Template

```markdown
### STORY-X.Y: [Name]

**As** [persona]
**I want to** [capability — what the user does, not how the system works]
**So that** [benefit — why this matters to the user]

**Priority:** CRITICAL | HIGH | MEDIUM | LOW
**Estimate:** S (≤1d) | M (1-2d) | L (2-3d)
**Dependencies:** [STORY-X.Z, External API, Design] or "none"
**Feature Flag:** yes / no (yes if rollout risk > low)

#### Acceptance Criteria

**AC-1: [Descriptive name — e.g. "Successful registration"]**
- Given [precondition — state of the system before the action]
- When [action — what the user or system does]
- Then [outcome — observable, verifiable result]
- And [additional verification — optional]

**AC-2: [Error/edge case — e.g. "Duplicate email rejection"]**
- Given [precondition]
- When [action]
- Then [expected error behavior]

**AC-3: [Another edge case]**
- Given ...
- When ...
- Then ...

#### Edge Cases Checked
- [ ] Empty/null input → [expected behavior]
- [ ] Validation failure → [expected error message]
- [ ] Unauthorized (401) → [redirect to login]
- [ ] Forbidden (403) → [show access denied]
- [ ] Not found (404) → [show not found state]
- [ ] Conflict (409) → [show conflict resolution]
- [ ] Rate limit → [show retry message]
- [ ] Timeout → [show timeout + retry option]

#### UI States (if user-facing)
- **Empty:** [what user sees when no data]
- **Loading:** [skeleton / spinner / progressive]
- **Success:** [expected result]
- **Error:** [error message + available action]
- **Offline:** [cached data / offline notice] (if applicable)

#### NFRs
- Performance: [e.g. "Form submission completes in ≤ 500ms p95"]
- Security: [e.g. "CSRF token required", "Input sanitized"]
- A11y: [e.g. "Form fields labeled, keyboard navigable, error announced to SR"]
- Privacy: [e.g. "Email not logged, password never stored in plaintext"]

#### Out of Scope
- [What this story does NOT include — be explicit]

#### Open Questions
1. [Unresolved question — include proposed default if possible]

#### Tracking / Analytics
- Event: `[category]_[action]` (e.g. `registration_completed`, `registration_failed`)
- Properties: [relevant properties, e.g. `{errorCode, method}`]
```

---

## 3. BDD Scenario Template (Gherkin-style)

For more complex scenarios with multiple examples:

```gherkin
Feature: [Feature name]

  Background:
    Given [common preconditions shared across scenarios]

  Scenario: [Happy path — descriptive name]
    Given [specific precondition]
    And [additional context]
    When [user action]
    Then [expected outcome]
    And [additional verification]

  Scenario: [Error case — descriptive name]
    Given [precondition]
    When [action that triggers error]
    Then [error behavior — specific message, HTTP status, UI state]

  Scenario Outline: [Parameterized scenario name]
    Given [precondition with <variable>]
    When [action with <input>]
    Then [outcome with <expected>]

    Examples:
      | variable | input | expected |
      | context1 | valid_input | success |
      | context2 | invalid_input | error_message |
      | context3 | edge_case | specific_behavior |
```

---

## 4. Data Dictionary Template

For every data entity in the feature:

```markdown
## Data Dictionary: [Entity Name]

**Bounded Context:** [e.g. Commerce, Auth, Logistics]
**Owner:** [Service or team that owns this entity]

| Field | Type | Required | Constraints | Default | Source | Example |
|-------|------|----------|-------------|---------|--------|---------|
| id | UUIDv7 | yes | Auto-generated, immutable | — | System | "01912345-..." |
| email | string | yes | RFC 5322, max 254 chars, unique per account, case-insensitive | — | User input | "user@example.com" |
| displayName | string | yes | 1–100 chars, trimmed, UTF-8 | — | User input | "Jane Doe" |
| role | enum | yes | ADMIN, MEMBER, VIEWER | VIEWER | System/Admin | "MEMBER" |
| createdAt | datetime | yes | RFC 3339 UTC, immutable | now() | System | "2026-02-17T10:30:00Z" |
| updatedAt | datetime | yes | RFC 3339 UTC | now() | System | "2026-02-17T14:22:00Z" |
| deletedAt | datetime | no | RFC 3339 UTC, soft delete | null | System | null |

**Validation Rules:**
- email: Must be unique per account. Case-insensitive comparison (lowercase before storing).
- displayName: Trimmed. No leading/trailing whitespace. No control characters.

**Privacy Classification:**
- PII fields: email, displayName
- Handling: Not logged in cleartext. Encrypted at rest. Deleted on account deletion (GDPR Art. 17).
```

---

## 5. PRD / Feature Brief Template (1–3 pages)

For complex features that need stakeholder-facing documentation:

```markdown
# PRD: [Feature Name]

**Status:** Draft | In Review | Approved
**Author:** [name]
**Last Updated:** [date]
**Stakeholders:** [list]

## 1. Problem

[3–5 sentences: What problem exists? Evidence/data? Who is affected? What is the cost of inaction?]

## 2. Goal

[1–2 sentences: What does success look like?]

### Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| [metric] | [baseline] | [target] | [when to measure] |

## 3. Solution Overview

[3–5 sentences: High-level approach. What will the user experience?]

## 4. Scope

### In Scope
- [item]

### Out of Scope
- [item]

### Future Considerations
- [item — explicitly deferred, may be revisited]

## 5. User Flows

[Describe or link to flow diagrams. Key paths: happy path, error path, edge cases.]

## 6. Requirements Summary

| ID | Requirement | Priority | AC Reference |
|----|-------------|----------|--------------|
| R1 | [functional requirement] | MUST | STORY-X.Y |
| R2 | [functional requirement] | SHOULD | STORY-X.Z |
| NR1 | [non-functional requirement] | MUST | NFR section |

## 7. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [risk] | [H/M/L] | [H/M/L] | [mitigation] |

## 8. Timeline & Milestones

| Milestone | Target Date | Dependencies |
|-----------|-------------|-------------|
| [milestone] | [date] | [dependency] |

## 9. Open Questions

1. [question — with proposed answer if possible]
```

---

## 6. Change Request Template

```markdown
## Change Request: [Title]

**Requested by:** [who]
**Date:** [when]
**Affected Epic/Stories:** [EPIC-X, STORY-Y.Z]

### What Changed
[Description of the change]

### Why
[Business reason / new information / stakeholder feedback]

### Impact Analysis

| Dimension | Impact |
|-----------|--------|
| **Scope** | [stories added/removed/modified] |
| **Effort** | [estimated delta: +X days / -Y days] |
| **Risk** | [new risks introduced] |
| **Dependencies** | [new dependencies / broken dependencies] |
| **Timeline** | [delay impact] |

### Options

| Option | Description | Trade-off |
|--------|-------------|-----------|
| A: Accept | [implement the change] | [scope grows, timeline shifts] |
| B: Defer | [move to next iteration] | [current scope preserved, feature delayed] |
| C: Reject | [don't implement] | [no impact, request unfulfilled] |

### Recommendation
[Option X, because...]

### Decision
[Filled after stakeholder decision]
```
