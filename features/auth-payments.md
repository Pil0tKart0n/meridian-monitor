# Auth & Payments

## Overview

This epic covers user authentication, profile management, and the Stripe-based subscription payment system. It enables the three-tier monetization model (Free, Premium, Professional) that gates access to advanced features like immediate news access, the economic dashboard, and API access. Authentication uses NextAuth.js with email/password and Google OAuth. Payments are handled entirely through Stripe Checkout and the Stripe Customer Portal.

## User Stories

### AP-1: NextAuth.js Setup

**As a** user, **I want to** create an account and log in, **so that** I can access personalized features and premium content.

**Acceptance Criteria:**

- [ ] NextAuth.js v5 (Auth.js) configured with App Router
- [ ] Providers: Credentials (email + password) and Google OAuth
- [ ] Email/password: registration with email verification (confirmation link)
- [ ] Password requirements: min 8 characters, at least 1 number and 1 special character
- [ ] Passwords hashed with bcrypt (cost factor 12)
- [ ] Login: email + password form with proper error messages ("Invalid email or password" — never reveal which is wrong)
- [ ] Google OAuth: one-click login, auto-creates account on first login
- [ ] Session strategy: JWT (short-lived, 15 min) + refresh token (httpOnly cookie, 7 days)
- [ ] Protected routes: middleware redirects unauthenticated users to login page
- [ ] CSRF protection enabled
- [ ] Rate limiting on login endpoint (5 attempts per email per 15 minutes)
- [ ] All auth secrets as environment variables

---

### AP-2: User Profile Page

**As a** user, **I want to** view and edit my profile, **so that** I can manage my account settings.

**Acceptance Criteria:**

- [ ] Profile page at `/profile` (protected route)
- [ ] Displays: name, email, avatar (from Google or Gravatar fallback), subscription tier, member since
- [ ] Editable fields: name, email (with re-verification), password change
- [ ] Password change requires current password confirmation
- [ ] Subscription section shows: current tier, billing period, next billing date, manage subscription link
- [ ] Account deletion: "Delete Account" button with confirmation dialog and consequences explained
- [ ] Account deletion: cancels Stripe subscription, anonymizes user data (DSGVO), sends confirmation email
- [ ] Responsive: works on all viewports
- [ ] All form changes save with explicit "Save" button (no auto-save)

---

### AP-3: Stripe Checkout Integration

**As a** user, **I want to** upgrade to Premium or Professional, **so that** I can access advanced features.

**Acceptance Criteria:**

- [ ] "Upgrade" CTA on pricing page and in-app upgrade prompts creates a Stripe Checkout session
- [ ] Two products in Stripe:
  - Premium: EUR 9.99/month or EUR 99.90/year
  - Professional: EUR 29.99/month or EUR 299.90/year
- [ ] Checkout session pre-fills user email
- [ ] Success redirect to `/profile?upgraded=true` with confirmation message
- [ ] Cancel redirect back to pricing page
- [ ] Stripe Checkout handles: payment method collection, SCA/3DS, tax calculation
- [ ] No card data touches our server (Stripe-hosted checkout)
- [ ] Stripe API keys as environment variables (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
- [ ] Test mode with Stripe test keys in development

---

### AP-4: Subscription Management

**As a** subscriber, **I want to** manage my subscription (upgrade, downgrade, cancel), **so that** I have full control over my billing.

**Acceptance Criteria:**

- [ ] Subscription management via Stripe Customer Portal (redirect from profile page)
- [ ] Upgrade: immediate (prorated billing)
- [ ] Downgrade: takes effect at end of current billing period
- [ ] Cancel: takes effect at end of current billing period, user retains access until then
- [ ] After cancellation: user reverts to Free tier (no data deleted, just access restricted)
- [ ] Reactivation: user can re-subscribe at any time via checkout
- [ ] Portal configured in Stripe Dashboard (allowed changes: upgrade, downgrade, cancel, payment method update)
- [ ] "Manage Subscription" button on profile page

---

### AP-5: Tier-based Content Gating Middleware

**As a** system, **I want to** enforce tier-based access control, **so that** premium features are only accessible to paying users.

**Acceptance Criteria:**

- [ ] Middleware checks user's subscription tier on protected routes/API endpoints
- [ ] Tier hierarchy: Free < Premium < Professional
- [ ] Gating rules:
  - Free: news feed (24-48h delay), basic GEI, basic map
  - Premium: immediate news, full map, economic dashboard, source comparison
  - Professional: everything in Premium + API access (`/api/v1/*` with API key)
- [ ] Gated pages show upgrade prompt instead of 403
- [ ] Gated API endpoints return `403` with `{ error: "upgrade_required", requiredTier: "premium" }`
- [ ] User tier stored in DB (`users.tier` column), synced from Stripe via webhooks
- [ ] Tier check utility: `requireTier('premium')` middleware pattern
- [ ] Caching: user tier cached in session/JWT, refreshed on webhook events

---

### AP-6: Webhook Handler for Stripe Events

**As a** system, **I want to** process Stripe webhook events, **so that** subscription status stays in sync with Stripe.

**Acceptance Criteria:**

- [ ] Webhook endpoint: `POST /api/webhooks/stripe`
- [ ] Stripe signature verification (HMAC) before processing any event
- [ ] Handled events:
  - `checkout.session.completed` — activate subscription, update user tier
  - `customer.subscription.updated` — handle upgrade/downgrade, update tier
  - `customer.subscription.deleted` — revert user to Free tier
  - `invoice.payment_succeeded` — log successful payment
  - `invoice.payment_failed` — notify user, log failure (grace period before downgrade)
- [ ] Idempotent: event ID stored in `processed_webhooks` table, duplicates skipped
- [ ] Responds 200 immediately, processes async if needed
- [ ] Webhook secret as environment variable (`STRIPE_WEBHOOK_SECRET`)
- [ ] Failed webhook processing logged with full event context
- [ ] Grace period on payment failure: 3 days before downgrade to Free

## Technical Notes

- **NextAuth.js v5:** Use the App Router integration (`auth.ts` config file). Prisma adapter for DB-backed sessions/accounts.
- **Database tables:** `users`, `accounts` (OAuth), `sessions`, `verification_tokens` (NextAuth managed) + `subscriptions` (Stripe sync) + `processed_webhooks` (idempotency)
- **Stripe sync:** User tier is the local cache of Stripe subscription status. Stripe is the source of truth. Never update tier without a Stripe event.
- **API keys for Professional tier:** Generate unique API keys per user, stored hashed in DB. Rate limited (1000 requests/day). Key rotation supported.
- **DSGVO compliance:** Account deletion must anonymize PII (name, email) but can retain aggregated/anonymized analytics. Deletion confirmation email sent before processing (72h window to cancel).
- **Security:** All auth endpoints rate-limited. No PII in logs. Passwords never logged. Stripe webhook endpoint excluded from CSRF (uses Stripe signature instead).
- **Testing:** Test Stripe integration with Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`). Test all webhook events with fixture payloads.
- **ADR required:** Session strategy (JWT vs database sessions), email verification service, account deletion timeline (immediate vs 30-day grace period)
