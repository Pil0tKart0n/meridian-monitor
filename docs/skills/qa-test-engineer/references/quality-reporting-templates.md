# Quality Reporting Templates

Extended templates for quality documentation. Use as starting point — adapt to project needs.

---

## 1. Feature Test Plan (Full)

```markdown
# Test Plan: [Feature Name] — [Epic/Ticket ID]

**Author:** [Name]
**Date:** [YYYY-MM-DD]
**Status:** DRAFT | REVIEW | APPROVED

---

## 1. Feature Summary
[1–3 sentences: what the feature does, who it serves, why it matters]

## 2. Risk Assessment

| Risk Area | Impact | Likelihood | Detectability | Priority | Notes |
|-----------|--------|-----------|--------------|----------|-------|
| Payment processing | Critical | Medium | Hard (silent corruption) | P1 | Double-charge risk |
| Cart calculation | High | High | Easy (visible to user) | P1 | Rounding edge cases |
| UI rendering | Medium | Low | Easy | P3 | Cosmetic issues |

## 3. Scope

**In scope:**
- [List features/flows to test]
- [Include NFRs: performance, a11y, security]

**Out of scope:**
- [What we're NOT testing and why]

**Assumptions:**
1. [Assumption 1 — e.g., "payment provider sandbox is available"]
2. [Assumption 2]

## 4. Test Matrix

| AC / Scenario | Unit | Integration | Contract | E2E | Manual | Perf | Security |
|---------------|------|-------------|----------|-----|--------|------|----------|
| AC-1: User adds item to cart | ✓ | ✓ | | | | | |
| AC-2: Checkout with valid card | ✓ | ✓ | ✓ | ✓ | | | ✓ |
| AC-3: Checkout with invalid card | ✓ | ✓ | ✓ | | | | |
| Edge: Empty cart checkout | ✓ | | | ✓ | | | |
| Edge: Concurrent cart modification | | ✓ | | | | | |
| NFR: Checkout p95 < 2s | | | | | | ✓ | |
| NFR: WCAG AA on checkout | | | | | ✓ | | |

## 5. Test Data Requirements

| Data | How to create | Cleanup |
|------|--------------|---------|
| User with active subscription | Factory: `UserFactory({ plan: 'pro' })` | Auto (test isolation) |
| Product catalog (10 items) | Seed script: `db/seed/products.ts` | Reset between E2E runs |
| Payment sandbox credentials | Environment variable | N/A |

## 6. Environments

| Environment | Tests | Notes |
|-------------|-------|-------|
| Local (Docker Compose) | Unit, Integration, Component | Developer machine |
| CI (GitHub Actions) | Unit, Integration, Contract, Smoke E2E | Every PR |
| Staging | Full E2E, Performance, Security | Pre-release |

## 7. Quality Gates

| Gate | Pass criteria | Blocking? |
|------|-------------|-----------|
| Merge | Unit + component + contract lint pass | Yes |
| Release | Integration + contract + E2E critical path | Yes |
| Post-deploy | Synthetic smoke + error rate stable | Yes (rollback trigger) |

## 8. Schedule

| Activity | When | Owner |
|----------|------|-------|
| Test plan review | [date] | QA + Tech Lead |
| Automation implementation | [sprint] | FE + BE |
| E2E test execution | [date] | QA |
| Performance test | [date] | QA + DevOps |
| Release sign-off | [date] | QA |

## 9. Risks & Dependencies

| Risk | Mitigation |
|------|-----------|
| Payment sandbox downtime | Mock fallback for CI, manual test on sandbox when available |
| Staging environment instability | Retry + dedicated test window |

## 10. Exit Criteria (sign-off)

- [ ] All P1 scenarios pass
- [ ] No open Critical/High bugs
- [ ] Performance within budget
- [ ] A11y scan clean
- [ ] Release quality report produced
```

---

## 2. Release Quality Report (Full)

```markdown
# Release Quality Report: v[X.Y.Z]

**Date:** [YYYY-MM-DD]
**Author:** [QA Lead]
**Build:** [commit SHA / CI build number]

---

## 1. Executive Summary

[2–3 sentences: overall quality assessment, key findings, recommendation]

**Recommendation:** ✅ Go | ⚠️ Go with documented risk | ❌ No-Go

## 2. Test Execution Summary

| Category | Total | Passed | Failed | Skipped | Pass Rate |
|----------|-------|--------|--------|---------|-----------|
| Unit | 450 | 450 | 0 | 0 | 100% |
| Integration | 85 | 84 | 1 | 0 | 98.8% |
| Contract | 24 | 24 | 0 | 0 | 100% |
| E2E (critical) | 12 | 12 | 0 | 0 | 100% |
| E2E (regression) | 38 | 36 | 0 | 2 | 94.7% |
| Performance | 3 | 3 | 0 | 0 | 100% |
| A11y | 5 | 5 | 0 | 0 | 100% |

## 3. New Features Tested

| Feature | Test coverage | Notes |
|---------|-------------|-------|
| [Feature 1] | Full (unit + integration + E2E) | All ACs verified |
| [Feature 2] | Partial (unit + integration) | E2E deferred: low risk |

## 4. Known Issues

| ID | Title | Severity | Workaround | Release risk |
|----|-------|----------|-----------|-------------|
| BUG-123 | Rounding error on 3+ decimal currencies | Medium | Display only, no data loss | Low |
| BUG-124 | Slow load on dashboard with 1000+ items | Low | Pagination mitigates | Low |

## 5. Performance Results

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| API p95 latency | < 500ms | 320ms | ✅ |
| FE LCP (p75) | < 2.5s | 1.8s | ✅ |
| FE INP (p75) | < 200ms | 120ms | ✅ |
| Error rate | < 0.1% | 0.02% | ✅ |

## 6. Security & Compliance

- Dependency scan: 0 critical, 2 moderate (accepted: non-exploitable in our context)
- Auth boundary tests: pass
- OWASP basic checks: pass

## 7. Test Stability

- Flake rate: 1.2% (target: < 2%) ✅
- Quarantined tests: 2 (owners assigned, fix ETA: [date])

## 8. SLO / Error Budget

- Current error budget: 98.5% remaining (healthy)
- No SLO violations in last 30 days

## 9. Follow-up Actions

- [ ] Fix BUG-123 in next sprint
- [ ] Add E2E for [Feature 2] when stable
- [ ] Fix quarantined tests by [date]
- [ ] Monitor dashboard performance after release (BUG-124)

## 10. Sign-off

| Role | Name | Decision | Date |
|------|------|----------|------|
| QA Lead | [name] | Go | [date] |
| Tech Lead | [name] | [pending] | |
| Product | [name] | [pending] | |
```

---

## 3. Escaped Defect Analysis

```markdown
# Escaped Defect Analysis: [BUG-ID]

**Found by:** [user report / monitoring / support ticket]
**Environment:** Production
**Severity:** [Critical / High / Medium / Low]
**Impact:** [X users affected, Y transactions impacted, Z duration]

## What happened
[Concise description of the defect and user impact]

## Root cause
[Technical root cause — not just "what was wrong" but "why it happened"]

## Why it escaped testing
| Prevention layer | Was it in place? | Why it didn't catch this? |
|-----------------|-----------------|--------------------------|
| Requirements | Partially | AC didn't cover this edge case |
| Unit test | No | Logic path not tested |
| Integration test | No | Combination of inputs not considered |
| Contract test | N/A | Not a contract issue |
| E2E test | No | Scenario not in critical path suite |
| Code review | Yes | Reviewer didn't spot the issue |
| Monitoring | Partial | Alert threshold too high |

## Corrective actions
| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| Add regression test | [name] | [date] | TODO |
| Update DoR checklist | QA | [date] | TODO |
| Lower alert threshold | DevOps | [date] | TODO |
| Add edge case to AC template | Requirements | [date] | TODO |

## Prevention for future
[What systemic change prevents this class of defect from escaping again?]
```

---

## 4. Flaky Test Tracking

```markdown
# Flaky Test Dashboard — [Sprint/Month]

## Summary
- Total quarantined: [count]
- Fixed this period: [count]
- New flakes this period: [count]
- Overall flake rate: [X%] (target: < 2%)

## Active Flaky Tests

| Test | Suite | Root cause | Owner | Created | Fix ETA | Status |
|------|-------|-----------|-------|---------|---------|--------|
| `checkout.spec.ts:42` | E2E | Timing: animation wait | [name] | [date] | [date] | In progress |
| `api-orders.test.ts:88` | Integration | Data: shared state | [name] | [date] | [date] | Assigned |

## Resolved This Period

| Test | Root cause | Fix | Days to resolve |
|------|-----------|-----|----------------|
| `login.spec.ts:15` | Timing: race condition | Added waitForResponse | 3 |

## Trends
- [Month-over-month flake rate trend]
- [Common root cause patterns]
- [Improvement actions taken]
```

---

## 5. Sprint Quality Review

```markdown
# Sprint Quality Review — Sprint [N]

## Quality Metrics

| Metric | Target | Actual | Trend |
|--------|--------|--------|-------|
| DoR compliance | 100% | [X%] | ↑↓→ |
| AC test coverage | 100% | [X%] | ↑↓→ |
| CI pass rate | > 95% | [X%] | ↑↓→ |
| Flake rate | < 2% | [X%] | ↑↓→ |
| Escaped defects | 0 | [count] | ↑↓→ |
| Mean defect fix time | < 3 days | [X days] | ↑↓→ |

## What Went Well
- [Quality win 1]
- [Quality win 2]

## What Needs Improvement
- [Issue 1 + action]
- [Issue 2 + action]

## Action Items for Next Sprint
- [ ] [Action 1] — [owner]
- [ ] [Action 2] — [owner]
```
