# UI Quality Rules

Baseline rules for production-grade interfaces. Inspired by Vercel Web Interface Guidelines.
Flag violations during code review. Rules are grouped by category.

---

## Forms

- **`form-labels`** Every `<input>`, `<select>`, `<textarea>` has an associated `<label>` or `aria-label`.
- **`form-autocomplete`** Set `autocomplete` and meaningful `name` attributes to enable browser autofill (`autocomplete="email"`, `name="email"`).
- **`form-type-inputmode`** Use correct `type` and `inputmode` for better mobile keyboards. `type="email"`, `inputmode="numeric"` for numbers, `inputmode="tel"` for phone.
- **`form-no-paste-block`** Never disable paste on any input. Password managers and accessibility tools depend on it.
- **`form-error-placement`** Show errors inline next to their field. On submit, focus the first error field. Optionally add an `aria-live="polite"` error summary.
- **`form-error-focus`** After failed submission, programmatically focus the first invalid field.
- **`form-submit-state`** Keep submit button enabled until submission starts. Disable during in-flight request + show spinner. Never pre-disable submit before the user tries.
- **`form-dont-block-typing`** Even if a field only accepts numbers, allow any input and show validation feedback. Blocking keystrokes confuses users (no explanation).
- **`form-unsaved-changes`** Warn before navigation when form data could be lost (`beforeunload` or router guard).
- **`form-spellcheck`** Disable `spellcheck` for emails, codes, usernames, URLs.
- **`form-placeholder`** Placeholders show example values or patterns (e.g., `sk-012345…`, `+1 (123) 456-7890`). End with ellipsis.
- **`form-enter-submits`** Single input: Enter submits. Multiple inputs: Enter on last control submits. `<textarea>`: ⌘/⌃+Enter submits, Enter inserts newline.
- **`form-button-type`** Every `<button>` inside a `<form>` MUST declare `type`. Use `type="submit"` for the submit action, `type="button"` for everything else. Missing type defaults to `submit` → accidental form submissions.
- **`form-enterkeyhint`** Set `enterKeyHint` on mobile-facing inputs to control the virtual keyboard action label: `"search"`, `"send"`, `"next"`, `"done"`, `"go"`.

---

## Touch & Mobile

- **`touch-manipulation`** Set `touch-action: manipulation` on interactive elements to prevent double-tap zoom delay.
- **`touch-tap-highlight`** Set `-webkit-tap-highlight-color` intentionally to match design, or suppress for custom feedback.
- **`touch-target-size`** Hit targets ≥ 44px on mobile (WCAG 2.5.8 says 24px minimum, but 44px for touch). If visual target is smaller, expand the hit area via padding or `::after`.
- **`touch-overscroll`** Set `overscroll-behavior: contain` in modals, drawers, and sheets to prevent background scroll bleed.
- **`touch-safe-area`** For full-bleed layouts: use `env(safe-area-inset-*)` to account for notches and rounded corners.
- **`touch-input-font`** Input font size ≥ 16px on mobile to prevent iOS Safari auto-zoom on focus.

---

## Typography & Copy Quality

- **`type-ellipsis-char`** Use the ellipsis character `…` (U+2026), not three periods `...`.
- **`type-tabular-nums`** Use `font-variant-numeric: tabular-nums` for number columns, prices, stats, timers – anywhere numbers need to align.
- **`type-text-wrap`** Use `text-wrap: balance` on headings and `text-wrap: pretty` on body text to avoid widows/orphans (baseline 2025+).
- **`type-nbsp-glue`** Use `&nbsp;` to keep units and shortcuts together: `10 MB`, `⌘ + K`, `Vercel SDK`.
- **`type-curly-quotes`** Prefer typographic quotes `" "` over straight quotes `" "` in user-facing copy.

---

## Hydration Safety (SSR / React)

These are the classic hydration mismatch traps:

- **`hydration-datetime`** `Date.now()`, `new Date().toLocaleString()`, random IDs differ between server and client. Wrap in `suppressHydrationWarning` or defer to `useEffect`.
- **`hydration-random`** `Math.random()`, `crypto.randomUUID()` produce different values. Use `useId()` for stable IDs, or generate server-side and pass as prop.
- **`hydration-matchmedia`** `window.matchMedia`, `navigator.*` don't exist on server. Guard with `typeof window !== 'undefined'` or use a `useIsClient()` hook.
- **`hydration-suppress`** `suppressHydrationWarning` is for known, expected mismatches only (timestamps, locale formatting). Never use it to hide real bugs.

---

## Interactions & UX

- **`ux-url-state`** Persist state in URL for share, refresh, back/forward: filters, tabs, pagination, expanded panels. Anything that uses `useState` for UI state should be a URL param candidate.
- **`ux-optimistic`** Update UI immediately when success is likely. Roll back on failure.
- **`ux-loading-delay`** If showing a spinner/skeleton, add show-delay (~150–300ms) and minimum visible time (~300–500ms) to avoid flicker on fast responses.
- **`ux-confirm-destructive`** Require confirmation or provide Undo for destructive actions (delete, discard, disconnect).
- **`ux-no-dead-ends`** Every screen offers a next step or recovery path.
- **`ux-scroll-restore`** Back/Forward restores prior scroll position.
- **`ux-links-are-links`** Use `<a>` / `<Link>` for navigation (not `<button>` or `<div>`). Enables Cmd/Ctrl+Click, middle-click, right-click → new tab.
- **`ux-keyboard-everywhere`** All flows are keyboard-operable. Follow WAI-ARIA Authoring Patterns.
- **`ux-announce-async`** Use `aria-live="polite"` for toasts, inline validation results, and async status updates.

---

## Anti-Patterns (Flag These)

| Rule ID | Anti-Pattern | Why it's bad | Fix |
|---------|-------------|-------------|-----|
| `anti-transition-all` | `transition: all` | Animates layout-affecting properties, causes jank | Explicitly list properties: `transition: opacity 200ms, transform 200ms` |
| `anti-zoom-disable` | `user-scalable=no` / `maximum-scale=1` | Breaks accessibility, violates WCAG | Remove it. Respect browser zoom. |
| `anti-click-div` | Click handler on `<div>` or `<span>` | Not focusable, no keyboard support, no role | Use `<button>` or `<a>`. If impossible: add `role="button"`, `tabIndex={0}`, Enter/Space handler. |
| `anti-img-no-dims` | `<img>` without `width`/`height` | Causes CLS (Cumulative Layout Shift) | Always set explicit dimensions or use `aspect-ratio`. |
| `anti-outline-none` | `:focus { outline: none }` without replacement | Removes keyboard accessibility | Use `:focus-visible` with a visible focus ring. |
| `anti-nested-buttons` | `<button>` inside `<button>` or `<a>` inside `<a>` | Invalid HTML, unpredictable behavior | Restructure: one action per interactive wrapper. |
| `anti-all-state-global` | Everything in Zustand/Redux | Over-sharing state causes unnecessary re-renders | Use local state first. Global only when truly shared. |
| `anti-console-log` | `console.log` in production | Leaks info, pollutes console | Remove or replace with structured logging (Sentry, error reporting). |

---

## Accessibility (Beyond ARIA)

- **`a11y-skip-link`** Every page must have a "Skip to main content" link as the first focusable element. Target is `<main id="main">`. Visible on focus, hidden otherwise.

```html
<a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2">
  Skip to main content
</a>
<!-- ... nav ... -->
<main id="main">
```

- **`a11y-landmarks`** Use semantic landmarks: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`. Screen reader users navigate by landmark. Only one `<main>` per page.
- **`a11y-heading-hierarchy`** One `<h1>` per page. Headings must not skip levels (`h1` → `h3`). Heading level = document structure, not visual size.
- **`a11y-focus-not-obscured`** Focused elements must not be hidden behind sticky headers, floating toolbars, toasts, or overlays. Use `scroll-padding-top` to account for sticky headers and `scroll-margin-top` on target elements.

```css
html { scroll-padding-top: 4rem; } /* height of sticky header */
```

- **`a11y-reduced-motion`** Respect `prefers-reduced-motion: reduce`. Disable or minimize animations. The token template already includes the global rule – verify it's applied.
- **`a11y-forced-colors`** Test in Windows High Contrast Mode (`@media (forced-colors: active)`). Borders and outlines become the only visible boundaries. Ensure focus indicators and interactive states rely on `outline` or `border`, not just `background-color` or `box-shadow`.
- **`a11y-focus-visible`** Style `:focus-visible` (not `:focus`) with ≥ 2px outline and ≥ 3:1 contrast. Never remove focus styles without a visible replacement.

---

## CSS Architecture

- **`css-layer-order`** Use `@layer` to control cascade priority. Define order once, upfront:

```css
@layer reset, base, components, utilities, overrides;
```

Reset → base tokens/typography → component styles → utility classes → one-off overrides. Third-party CSS goes in `base` or a dedicated `vendor` layer.

**Tailwind v4:** `@import "tailwindcss"` manages its own native cascade layers (`theme`, `base`, `components`, `utilities`) automatically. Do NOT manually re-declare these layers when using Tailwind v4. Only define custom layers for non-Tailwind CSS that needs cascade control alongside Tailwind.

- **`css-tokens-ssot`** CSS custom properties are the single source of truth for design decisions. Tailwind config consumes tokens, not the other way around. Arbitrary values (`bg-[#1a2b3c]`) require justification in code review.
- **`css-no-arbitrary-abuse`** Tailwind arbitrary values (`text-[13px]`, `mt-[7px]`) bypass the design system. Allow only when no token matches. Flag in review.

---

## Dark Mode & Theming

- **`dark-color-scheme`** Set `color-scheme: dark` on `<html>` in dark themes so scrollbars and native UI adapt.
- **`dark-theme-color`** Set `<meta name="theme-color">` to match page background for consistent browser chrome.
- **`dark-select-bg`** Explicitly set `background-color` and `color` on native `<select>` to avoid contrast bugs on Windows dark mode.
- **`dark-semantic-tokens`** Use semantic color tokens (not raw hex). Theme switching = changing token values, not rewriting components.

---

## Images & Media

- **`img-dimensions`** Always set `width` and `height` (or use CSS `aspect-ratio`) to prevent CLS.
- **`img-lazy`** Lazy-load below-the-fold images. Preload only above-the-fold / LCP images.
- **`img-format`** Serve WebP/AVIF via `<picture>` with fallback.
- **`img-alt`** Every `<img>` has meaningful `alt` text. Decorative images: `alt=""`.
- **`img-preconnect`** Use `<link rel="preconnect">` for CDN domains serving images/fonts.
