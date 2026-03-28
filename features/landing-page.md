# Landing Page

## Overview

The landing page is the public-facing entry point of WW3News. It serves two purposes: immediately communicating the platform's value through the live GEI gauge and breaking news, and converting visitors into registered (and eventually paying) users. The page must be fast (SSG/ISR), SEO-optimized, and visually compelling without being sensationalist.

## User Stories

### LP-1: Hero Section with Live GEI Gauge

**As a** visitor, **I want to** see the current Global Escalation Index immediately on landing, **so that** I understand the platform's core value proposition in seconds.

**Acceptance Criteria:**

- [ ] GEI gauge component (from `escalation-index.md` GEI-6) rendered prominently
- [ ] Headline: concise value proposition (e.g., "Real-time Geopolitical Risk Intelligence")
- [ ] Sub-headline: 1 sentence explaining what the GEI measures
- [ ] CTA button: "Explore the Dashboard" (scrolls to features or navigates to feed)
- [ ] Secondary CTA: "Start Free" (navigates to registration)
- [ ] Above the fold on all viewports (320px-1440px)
- [ ] No animation on initial load above the fold (LCP optimization)
- [ ] GEI value updates via polling (every 60 seconds)
- [ ] Dark theme: hero uses dark background for gravitas
- [ ] Accessible: GEI value readable by screen readers

---

### LP-2: Breaking News Ticker

**As a** visitor, **I want to** see the latest breaking headlines, **so that** I get immediate proof the platform delivers real-time intelligence.

**Acceptance Criteria:**

- [ ] Horizontal scrolling ticker below the hero section
- [ ] Shows 5-10 most recent article headlines with source badges
- [ ] Auto-scrolls continuously (CSS animation preferred over JS)
- [ ] Pauses on hover (desktop) or tap (mobile)
- [ ] Each headline links to the full article (gated for non-Premium if applicable)
- [ ] Respects `prefers-reduced-motion`: static list instead of scrolling ticker
- [ ] Updates every 5 minutes (ISR or client-side polling)
- [ ] Accessible: `aria-live="off"` on the ticker (auto-scrolling content should not announce)

---

### LP-3: Feature Highlights Section

**As a** visitor, **I want to** understand what the platform offers, **so that** I can decide whether to sign up.

**Acceptance Criteria:**

- [ ] 3-4 feature cards highlighting key capabilities:
  - Global Escalation Index (real-time risk metric)
  - Multi-Source News Feed (30+ international outlets)
  - Interactive Conflict Map (ACLED/GDELT data visualization)
  - Economic Impact Dashboard (market correlation analysis)
- [ ] Each card: icon, title, 1-2 sentence description, optional screenshot/illustration
- [ ] Cards link to the respective feature (feed, map, dashboard)
- [ ] Responsive: 2x2 grid on desktop, single column on mobile
- [ ] Benefits language ("See how global events affect markets" not "We aggregate financial data")

---

### LP-4: Pricing Section with Tier Comparison

**As a** visitor, **I want to** compare subscription tiers, **so that** I can choose the right plan.

**Acceptance Criteria:**

- [ ] Three tiers displayed side by side:
  - **Free:** GEI access, news feed (24-48h delay), basic map
  - **Premium (9.99/month):** Immediate access, full map, economic dashboard, source comparison
  - **Professional (29.99/month):** Everything in Premium + API access, data export, priority support
- [ ] Recommended tier visually highlighted (Premium)
- [ ] Toggle: monthly/yearly pricing (yearly = 2 months free)
- [ ] CTA per tier: "Start Free" / "Go Premium" / "Go Professional"
- [ ] Feature comparison table below cards (detailed feature-by-feature)
- [ ] Prices in EUR (primary market DE), with currency note
- [ ] Responsive: cards stack vertically on mobile, comparison table scrolls horizontally

---

### LP-5: Newsletter Signup

**As a** visitor, **I want to** subscribe to a newsletter, **so that** I receive weekly geopolitical briefings without creating an account.

**Acceptance Criteria:**

- [ ] Email input + submit button, minimal design
- [ ] Placed between pricing and footer (or as a banner)
- [ ] Headline: "Weekly Geopolitical Briefing" with 1-sentence description
- [ ] Email validation (format check client-side, Zod on server)
- [ ] Double opt-in (DSGVO compliance): confirmation email before adding to list
- [ ] Success state: "Check your inbox to confirm" message
- [ ] Error state: inline error message if submission fails
- [ ] Integration: email service provider (Resend, Mailgun, or SendGrid — ADR required)
- [ ] No spam: honeypot field, rate limiting on submission endpoint

---

### LP-6: Footer with Legal/About Links

**As a** visitor, **I want to** find legal information and company details, **so that** I can verify the platform's legitimacy.

**Acceptance Criteria:**

- [ ] Links: Impressum, Datenschutz (Privacy Policy), AGB (Terms of Service), About, Contact
- [ ] Impressum and Datenschutz are mandatory for German law compliance
- [ ] Social media links (if applicable): Twitter/X, LinkedIn
- [ ] Copyright notice with current year
- [ ] Language switcher (DE/EN) — integrates with i18n system
- [ ] Responsive: multi-column on desktop, stacked on mobile
- [ ] Semantic HTML: `<footer>` element with proper landmark

## Technical Notes

- **Rendering:** Static generation (SSG) with ISR for dynamic sections (GEI gauge, breaking news). Revalidate interval: 60 seconds.
- **SEO:** Full `generateMetadata()` with title, description, Open Graph, Twitter Card, JSON-LD (Organization schema). Target keywords: "geopolitical risk", "escalation index", "conflict tracker".
- **Performance:** LCP target < 2.0s. Hero section is static HTML + CSS, GEI value injected server-side then hydrated for polling. No heavy JS in critical path.
- **Legal pages:** Static MDX pages, content reviewed by legal counsel. Impressum must include: name, address, contact, Handelsregister (if applicable), USt-IdNr.
- **Newsletter backend:** `POST /api/v1/newsletter/subscribe` with rate limiting (5 requests/IP/hour). Store subscribers in DB with `confirmed` flag. Confirmation email via transactional email service.
- **A11y:** Landmark regions (`<header>`, `<main>`, `<footer>`), skip link, heading hierarchy (single `<h1>`), all images with alt text.
- **ADR required:** Email service provider choice, pricing model finalization, yearly discount percentage
