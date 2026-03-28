# End-to-End Example: User Registration Feature

A complete reference showing how requirements flow from Goal → KPI → Epic → Stories → ACs → Contract → Tests → Monitoring.

---

## Goal & KPI

**Goal:** Enable new users to create accounts and start using the product within 2 minutes.

**KPIs:**
| KPI | Baseline | Target | Data source | Tracking event |
|-----|----------|--------|-------------|----------------|
| Registration completion rate | 0% (new feature) | > 80% of started registrations | Analytics | `registration_started`, `registration_completed` |
| Time to first action | N/A | < 2 min from registration start | Analytics | `registration_started`, `first_action_completed` |
| Registration errors | N/A | < 5% of attempts | Error monitoring | `registration_error` |

---

## Epic

```markdown
# EPIC-001: User Registration

**Goal:** Users can create accounts with email+password to access the product.
**Success Metric:** Registration completion rate > 80%.
**Priority:** Must-Have (P1)
**NFRs:**
- Performance: Registration API ≤ 200ms p95
- Security: Passwords hashed (bcrypt/Argon2), rate limiting on registration endpoint
- Accessibility: WCAG 2.2 AA compliant form
- Privacy: Email stored as PII, consent for marketing optional

**Stories:**
- STORY-001: Registration form (happy path)
- STORY-002: Email verification
- STORY-003: Registration error handling
```

---

## Story (STORY-001: Registration Form)

```markdown
# STORY-001: Registration Form

**Parent:** EPIC-001
**Priority:** Must-Have
**Size:** M (5–8 story points)

## User Story
As a **new visitor**, I want to **create an account with email and password**,
so that **I can access the product's features**.

## Acceptance Criteria

### AC-1: Successful registration
**Given** I am on the registration page
**When** I enter a valid email and a password meeting requirements
**And** I click "Create Account"
**Then** my account is created, I see a success message, and I am redirected to the dashboard

### AC-2: Password requirements
**Given** I am filling in the registration form
**When** I enter a password shorter than 8 characters
**Then** I see an inline error "Password must be at least 8 characters"
**And** the form does not submit

### AC-3: Duplicate email
**Given** an account with "user@example.com" already exists
**When** I try to register with "user@example.com"
**Then** I see "An account with this email already exists" with a link to login
**And** no new account is created

### AC-4: Rate limiting
**Given** I have made 5 registration attempts in 1 minute from the same IP
**When** I try to register again
**Then** I see "Too many attempts. Please try again later." (HTTP 429)

## Edge Cases
- Empty form submission → inline validation errors on all required fields
- Very long email (254 chars) → accepted (RFC 5322 max)
- Email with special characters (e.g., `user+tag@example.com`) → accepted
- Concurrent registration with same email → first wins, second gets AC-3 error (409)

## Data Dictionary
| Field | Type | Required | Constraints | Source | Example |
|-------|------|----------|-------------|--------|---------|
| email | string | yes | RFC 5322, max 254, unique per account | User input | "user@example.com" |
| password | string | yes | min 8 chars, max 128 | User input | (not stored in plain text) |

## NFRs (story-level)
- Registration API: ≤ 200ms p95
- Form accessible: keyboard navigable, labels on all inputs, contrast ≥ 4.5:1
- No PII in logs (no email in error logs)

## Tracking Events
- `registration_started` — when registration page loads
- `registration_submitted` — when form is submitted
- `registration_completed` — when account is created successfully
- `registration_error` — when registration fails (with error_code, no PII)
```

---

## Contract Stub (OpenAPI)

```yaml
# docs/contracts/auth/auth.openapi.yaml (excerpt)
paths:
  /api/v1/auth/register:
    post:
      operationId: registerUser
      summary: Create a new user account
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                  maxLength: 254
                password:
                  type: string
                  minLength: 8
                  maxLength: 128
      responses:
        '201':
          description: Account created
          content:
            application/json:
              schema:
                type: object
                properties:
                  userId:
                    type: string
                    format: uuid
                  email:
                    type: string
        '409':
          description: Email already registered
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorEnvelope'
        '422':
          description: Validation error
        '429':
          description: Rate limited
```

---

## Test Mapping

| AC | Test type | Description |
|----|-----------|-------------|
| AC-1 | Unit (BE) | `registerUser` service creates user + returns 201 |
| AC-1 | Integration (BE) | POST `/api/v1/auth/register` → 201 + user in DB |
| AC-1 | E2E (FE) | Fill form → submit → redirected to dashboard |
| AC-2 | Unit (FE) | Password validation Zod schema rejects < 8 chars |
| AC-2 | Component (FE) | Registration form shows inline error for short password |
| AC-3 | Integration (BE) | POST with existing email → 409 + correct error envelope |
| AC-3 | E2E (FE) | Submit duplicate email → error message + login link visible |
| AC-4 | Integration (BE) | 6th request in 1 min → 429 |

---

## Monitoring (post-launch)

| Signal | Source | Alert |
|--------|--------|-------|
| Registration error rate | Sentry / error monitoring | > 5% of registration_submitted → P2 alert |
| Registration p95 latency | Backend RUM / traces | > 500ms → P3 alert |
| Completion rate | Analytics dashboard | < 60% sustained over 24h → investigate |

---

## How this maps across skills

| Artifact | Owner | Consumers |
|----------|-------|-----------|
| Epic + Stories + ACs | **Requirements Engineer** | All skills |
| Contract (OpenAPI) | **Software Architect** (defines) / **Backend** (implements) | Frontend, QA |
| Schema (DB migration) | **Database Engineer** | Backend |
| API implementation | **Backend Engineer** | Frontend |
| UI implementation | **Frontend Engineer** | QA |
| Test strategy | **QA Test Engineer** | All skills |
| Monitoring/Alerts | **DevOps Engineer** | All skills |
