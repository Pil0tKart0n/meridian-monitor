# Frontend Design Patterns

Patterns to apply when the situation calls for them.

---

## Standard Component Template

Use this template for every new component:

```tsx
// UserCard.tsx
import { type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';

interface UserCardProps {
  user: UserProfile;
  variant?: 'compact' | 'detailed';
  onSelect?: (userId: string) => void;
  isDisabled?: boolean;
}

export function UserCard({
  user,
  variant = 'compact',
  onSelect,
  isDisabled = false,
}: UserCardProps) {
  return (
    <article
      className={cn(
        'rounded-lg border p-4',
        isDisabled && 'opacity-50 pointer-events-none',
        variant === 'detailed' && 'p-6',
      )}
    >
      <h3 className="text-lg font-semibold">{user.name}</h3>
      {variant === 'detailed' && <p className="text-sm text-gray-600">{user.email}</p>}
      {onSelect && (
        <button
          onClick={() => onSelect(user.id)}
          disabled={isDisabled}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Select
        </button>
      )}
    </article>
  );
}
```

**Checklist for every component:**
- [ ] Props interface exported and typed (no `any`)
- [ ] Defaults via destructuring
- [ ] All states considered (disabled, loading, error, empty)
- [ ] `cn()` for conditional classes
- [ ] Semantic HTML element (`article`, `section`, `button` – not `div` for everything)
- [ ] Keyboard accessible
- [ ] Co-located test file: `UserCard.test.tsx`

---

## Design Tokens Template

Create `src/styles/tokens.css` and import globally:

```css
:root {
  /* Spacing (4px base) */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* Typography */
  --font-family-sans: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', ui-monospace, monospace;

  --font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8rem);
  --font-size-sm: clamp(0.875rem, 0.83rem + 0.2vw, 0.925rem);
  --font-size-base: clamp(1rem, 0.95rem + 0.25vw, 1.0625rem);
  --font-size-lg: clamp(1.125rem, 1.05rem + 0.4vw, 1.25rem);
  --font-size-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --font-size-2xl: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
  --font-size-3xl: clamp(1.875rem, 1.4rem + 2.4vw, 2.5rem);

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Colors – semantic */
  --color-surface: #ffffff;
  --color-on-surface: #0f172a;
  --color-surface-muted: #f8fafc;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-on-primary: #ffffff;
  --color-error: #dc2626;
  --color-on-error: #ffffff;
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-border: #e2e8f0;
  --color-border-strong: #cbd5e1;
  --color-text-muted: #64748b;

  /* Radii */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px rgb(0 0 0 / 0.07);
  --shadow-lg: 0 10px 15px rgb(0 0 0 / 0.1);

  /* Transitions */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);

  /* Focus */
  --focus-ring: 2px solid var(--color-primary);
  --focus-offset: 2px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: #0f172a;
    --color-on-surface: #f1f5f9;
    --color-surface-muted: #1e293b;
    --color-primary: #60a5fa;
    --color-primary-hover: #93bbfd;
    --color-on-primary: #0f172a;
    --color-error: #f87171;
    --color-success: #4ade80;
    --color-warning: #fbbf24;
    --color-border: #334155;
    --color-border-strong: #475569;
    --color-text-muted: #94a3b8;
  }
}

/* Manual override */
[data-theme="dark"] {
  --color-surface: #0f172a;
  --color-on-surface: #f1f5f9;
  /* ... same as above */
}

/* Focus style (WCAG 2.2) */
:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-offset);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Token Hierarchy (Design Systems)

When building a shared design system, organize tokens in three layers:

| Layer | Example | Purpose |
|-------|---------|---------|
| **Primitive** | `--blue-500: #3b82f6` | Raw color palette, spacing scale, type scale |
| **Semantic** | `--color-primary: var(--blue-500)` | Meaning-based (primary, error, surface). Theme switching changes this layer. |
| **Component** | `--button-bg: var(--color-primary)` | Component-specific. Optional layer – use for complex design systems only. |

**Token changes = API changes.** When tokens are consumed by multiple teams/apps, treat changes as semver: adding a token = minor, renaming/removing = major.

For token pipelines at scale: Style Dictionary / Tokens Studio → CSS variables + Tailwind config. CI validates token schema on PR.

---

## Form Pattern (React Hook Form + Zod)

Standard form template – covers ~80% of form use cases:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof ContactFormSchema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  async function onSubmit(values: ContactFormValues) {
    const result = await submitContactForm(values);

    if (result.error) {
      // Map server errors to fields
      if (result.error.fieldErrors) {
        for (const [field, message] of Object.entries(result.error.fieldErrors)) {
          setError(field as keyof ContactFormValues, { message });
        }
        return;
      }
      // Global server error
      setError('root', { message: result.error.message });
      return;
    }

    // Success handling (toast, redirect, etc.)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {errors.root && (
        <div role="alert" className="text-sm text-red-600 mb-4">
          {errors.root.message}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          {...register('name')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          rows={4}
          {...register('message')}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <p id="message-error" className="text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
```

**Form rules:**
- Schema-first: Zod schema defines validation. Form types inferred with `z.infer<>`.
- `aria-invalid` + `aria-describedby` link inputs to error messages.
- Server errors mapped to individual fields via `setError`.
- `root` error for global failures.
- Button disabled during submission. Label changes to show state.
- `noValidate` on form – we handle validation, not the browser.

---

## Controlled vs Uncontrolled Components

Essential for design system input components – consumers need both modes:

```tsx
interface InputProps {
  value?: string;              // controlled
  defaultValue?: string;       // uncontrolled
  onChange?: (value: string) => void;
}

export function Input({ value, defaultValue, onChange, ...props }: InputProps) {
  // If value is provided → controlled by parent. Otherwise → uncontrolled (browser manages state).
  // onChange is called in both modes: form libraries, analytics, or parent components
  // may want to observe changes without owning the state.
  return (
    <input
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onChange={(e) => onChange?.(e.target.value)}
      {...props}
    />
  );
}
```

**When:** Reusable input components in design systems. Let consumers choose the mode.
**Rule:** Never mix `value` and `defaultValue`. If `value` is passed, component is controlled.

---

## Avoid Boolean Props → Use Composition / Variants

Boolean props create exponential complexity. Each boolean doubles possible states.

```tsx
// ❌ Boolean explosion – 2^4 = 16 possible combinations
<Composer isThread isDMThread={false} isEditing isForwarding={false} />

// ✅ Explicit variant components – each is self-documenting
<ThreadComposer channelId="abc" />
<EditMessageComposer messageId="xyz" />
<ForwardMessageComposer messageId="123" />
```

For visual variants, use a union type instead of boolean flags:

```tsx
// ❌ Boolean flags
<Button isPrimary isSmall isOutline />

// ✅ Explicit variants
<Button variant="primary" size="sm" />

// Or with cva (class-variance-authority):
const buttonVariants = cva('rounded font-medium', {
  variants: {
    variant: { primary: 'bg-blue-600 text-white', secondary: 'bg-gray-100', ghost: 'bg-transparent' },
    size: { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3 text-lg' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});
```

**When:** Component has > 2 boolean props or modes that affect rendering. Library/design system components.
**Rule:** If you add a third boolean prop → refactor to composition or variant union.

---

## Compound Components

Use when a component has related parts sharing implicit state:

```tsx
// Usage – declarative, composable API
<Select value={selected} onValueChange={setSelected}>
  <Select.Trigger>Choose a fruit</Select.Trigger>
  <Select.Content>
    <Select.Item value="apple">Apple</Select.Item>
    <Select.Item value="banana">Banana</Select.Item>
  </Select.Content>
</Select>
```

Implementation pattern – the critical pieces:

```tsx
import { createContext, useContext, type ReactNode } from 'react';

// 1. Shared context
interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

// 2. Context guard – crashes early if used outside provider
function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) throw new Error('Select.* must be used within <Select>');
  return context;
}

// 3. Root provides context
function Select({ value, onValueChange, children }: SelectContextValue & { children: ReactNode }) {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      {children}
    </SelectContext.Provider>
  );
}

// 4. Sub-components consume context
function Item({ value, children }: { value: string; children: ReactNode }) {
  const { value: selected, onValueChange } = useSelectContext();
  return (
    <button role="option" aria-selected={value === selected} onClick={() => onValueChange(value)}>
      {children}
    </button>
  );
}

Select.Item = Item;
// ... Select.Trigger, Select.Content follow same pattern
```

**When:** Dropdown, Tabs, Accordion, Menu, Dialog.
See Radix UI / headless UI for production-grade, accessible implementations.

---

## State Machines

Use `useReducer` with explicit states for complex flows:

```tsx
type AuthState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; message: string }
  | { status: 'success'; user: UserProfile }
  | { status: 'mfa_required'; challengeId: string };

type AuthAction =
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS'; user: UserProfile }
  | { type: 'ERROR'; message: string }
  | { type: 'MFA_REQUIRED'; challengeId: string }
  | { type: 'RESET' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SUBMIT':
      return state.status === 'idle' || state.status === 'error'
        ? { status: 'submitting' } : state;
    case 'SUCCESS':
      return state.status === 'submitting'
        ? { status: 'success', user: action.user } : state;
    case 'ERROR':
      return state.status === 'submitting'
        ? { status: 'error', message: action.message } : state;
    case 'RESET':
      return { status: 'idle' };
    default:
      return state;
  }
}
```

**When:** Login, multi-step forms, wizards, payment flows.
**Why tagged unions:** TypeScript narrows state automatically – you can't access `user` in `'error'` state. Makes invalid states unrepresentable.

---

## Optimistic UI

Update before server confirms, rollback on failure:

```tsx
function useOptimisticToggle(initial: boolean, serverAction: () => Promise<void>) {
  const [isActive, setIsActive] = useState(initial);
  const [isPending, setIsPending] = useState(false);

  async function toggle() {
    const previous = isActive;
    setIsActive(!isActive);
    setIsPending(true);
    try {
      await serverAction();
    } catch {
      setIsActive(previous); // rollback
    } finally {
      setIsPending(false);
    }
  }

  return { isActive, isPending, toggle };
}
```

**When:** Like/bookmark, toggles, reordering – instant feedback, failure rare.

---

## Fetch Wrapper (Timeout / Retry / Abort / Error Envelope)

Standard API client wrapper for production. Prevents hung requests, handles transient failures, and normalizes error shapes.

```typescript
interface ApiError {
  status: number;
  errorCode: string;
  message: string;
  details?: Record<string, string>;
  requestId?: string;
}

type ApiResult<T> = { data: T; error: null } | { data: null; error: ApiError };

const DEFAULT_TIMEOUT_MS = 10_000;

async function apiFetch<T>(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {},
): Promise<ApiResult<T>> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal: externalSignal, ...init } = options;

  // Combine external abort signal with timeout
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  const combinedSignal = externalSignal
    ? AbortSignal.any([externalSignal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(url, { ...init, signal: combinedSignal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return {
        data: null,
        error: {
          status: response.status,
          errorCode: body.errorCode ?? 'UNKNOWN',
          message: body.message ?? response.statusText,
          details: body.details,
          requestId: response.headers.get('x-request-id') ?? undefined,
        },
      };
    }

    const data: T = await response.json();
    return { data, error: null };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: { status: 0, errorCode: 'TIMEOUT', message: 'Request timed out' } };
    }
    return { data: null, error: { status: 0, errorCode: 'NETWORK', message: 'Network error' } };
  }
}
```

### Retry (only safe requests)

```typescript
async function apiFetchWithRetry<T>(
  url: string,
  options: RequestInit & { timeoutMs?: number; maxRetries?: number } = {},
): Promise<ApiResult<T>> {
  const { maxRetries = 2, ...fetchOptions } = options;
  const retryableStatuses = new Set([408, 429, 500, 502, 503, 504]);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await apiFetch<T>(url, fetchOptions);
    const shouldRetry =
      result.error &&
      retryableStatuses.has(result.error.status) &&
      attempt < maxRetries;

    if (!shouldRetry) return result;

    // Exponential backoff: 500ms, 1000ms, 2000ms...
    await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
  }

  return { data: null, error: { status: 0, errorCode: 'EXHAUSTED', message: 'All retries failed' } };
}
```

**Rules:**
- **Never retry POST/PUT/DELETE** unless the endpoint is idempotent (has an idempotency key).
- Retry only on: network errors, timeouts, `429`, `5xx`.
- Handle `401` → redirect to login or trigger token refresh. Handle `403` → show permission error.
- Validate response shape with Zod at the boundary when the backend is not fully trusted.

---

## Error Taxonomy

Categorize errors to determine the right UI response. Every error state needs a specific pattern:

| Category | Cause | UI Pattern | Action |
|----------|-------|------------|--------|
| **User error** | Bad input, missing fields, invalid format | Inline field error, form-level summary | Guide user to fix (clear message, focus first error) |
| **System error** | 5xx, network failure, timeout | Error banner / fallback UI | Retry button + "Contact support" if persistent |
| **Auth error** | 401/403, expired session | Redirect to login or permission message | Clear, never show raw status codes |
| **Not found** | 404, deleted resource | Empty state with navigation | "Go back" or "Create new" action |
| **Empty state** | No data yet (not an error) | Illustration + CTA | Guide user to create first item |

**Rules:**
- Never show raw error codes or stack traces to users.
- System errors: log to Sentry with `requestId` for correlation.
- User errors: always actionable – tell users what to do, not just what went wrong.
- Empty states are not errors. Design them as onboarding opportunities.
- Every error UI must have a recovery path (retry, go back, contact support). No dead ends.

---

## Error Boundaries

```tsx
class ErrorBoundary extends Component<ErrorBoundaryProps, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info); // → Sentry
  }

  render() {
    if (this.state.error) {
      const { fallback } = this.props;
      return typeof fallback === 'function'
        ? fallback(this.state.error, () => this.setState({ error: null }))
        : fallback;
    }
    return this.props.children;
  }
}
```

Wrap every route. Wrap risky third-party integrations. Never one boundary for entire app.

---

## Suspense Boundaries

```tsx
import { Suspense, lazy } from 'react';

const Charts = lazy(() => import('./Charts'));
const Activity = lazy(() => import('./Activity'));

function Dashboard() {
  return (
    <main>
      <DashboardSummary /> {/* critical, not lazy */}
      <Suspense fallback={<ChartsSkeleton />}>
        <Charts />
      </Suspense>
      <Suspense fallback={<ActivitySkeleton />}>
        <Activity />
      </Suspense>
    </main>
  );
}
```

One Suspense per visual section. Skeleton fallbacks, not spinners. Combine with Error Boundaries.

---

## Skeleton vs Spinner

| Use | Pattern | Example |
|-----|---------|---------|
| **Skeleton** | Known layout, content loading | Data table, card list, profile page |
| **Spinner** | Unknown layout or brief action | Button submission, file upload, search-as-you-type |

**Rules:**
- Skeleton when you know the shape of what's coming.
- Spinner when you don't, or when the action is < 1 second.
- Never a blank screen. Always show _something_ immediately.
- Skeleton should match the real layout dimensions to prevent CLS.

---

## Dialog / Modal

### Native `<dialog>` (Default – 2026 Baseline)

Prefer native `<dialog>` with `showModal()`. Handles focus trap, `::backdrop`, Escape key, `aria-modal`, and top-layer rendering natively. Full baseline support since 2022.

```tsx
import { useEffect, useRef, useId, type ReactNode } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (isOpen && !el.open) {
      el.showModal(); // focus trap + backdrop + inert background
    }
    if (!isOpen && el.open) {
      el.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      className="rounded-lg shadow-lg p-6 max-w-lg w-full backdrop:bg-black/50"
    >
      <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
      {children}
      <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
        Close
      </button>
    </dialog>
  );
}
```

**Why native `<dialog>`:**
- `showModal()` automatically: traps focus, renders `::backdrop`, marks background as `inert`, closes on Escape.
- No manual scroll lock, no portal, no focus-trap library needed.
- Style `::backdrop` directly in CSS. Style the dialog itself like any element.

**Caveats:**
- Click-outside-to-close is not built-in for `showModal()`. Add if needed:
  ```tsx
  onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
  ```
- `cancel` and `close` events exist but are not fully consistent across browsers. Use the React `onClose` callback.

### Custom Portal Alternative (Full Visual Control)

Use only when native `<dialog>` styling is insufficient (complex animations, nested modals, non-modal overlays):

```tsx
import { createPortal } from 'react-dom';
import { useEffect, useRef, useCallback, useId, type ReactNode } from 'react';

interface PortalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function PortalDialog({ isOpen, onClose, title, children }: PortalDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') { onClose(); return; }
    if (event.key !== 'Tab' || !dialogRef.current) return;

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    // Mark background as inert (removes from a11y tree + prevents interaction)
    const appRoot = document.getElementById('root');
    appRoot?.setAttribute('inert', '');

    // Prevent background scroll
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    // Focus first focusable element
    requestAnimationFrame(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    });

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      appRoot?.removeAttribute('inert');

      // Restore scroll
      document.body.style.position = '';
      document.body.style.top = '';
      window.scrollTo(0, scrollY);

      // Return focus
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mx-4"
      >
        <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}
```

**Why `inert` instead of `aria-hidden`?**
- `inert` on `#root` removes background from a11y tree AND prevents pointer/keyboard interaction.
- `aria-hidden="true"` on the overlay would hide the dialog itself (it's a child). That was a bug.

---

## Animation Patterns (Motion)

Use Motion (ex Framer Motion) for declarative animations. Respect `prefers-reduced-motion`.

### Entrance / Exit

```tsx
import { AnimatePresence, motion } from 'motion/react';

function PageTransition({ children, routeKey }: { children: ReactNode; routeKey: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Layout Animations

```tsx
<motion.div layout layoutId={`card-${id}`}>
  {isExpanded ? <DetailView /> : <CompactView />}
</motion.div>
```

### Reduced Motion

```tsx
import { useReducedMotion } from 'motion/react';

function AnimatedCard({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

**Rules:**
- **Always** respect `prefers-reduced-motion`. Use `useReducedMotion()` hook or CSS `@media (prefers-reduced-motion: reduce)`.
- Entrance: 150–250ms. Exit: 100–150ms. Never > 500ms.
- Easing: `ease-out` for entrance, `ease-in` for exit, `ease-in-out` for layout shifts.
- Prefer CSS transitions for simple opacity/transform. Use Motion for: layout animations, `AnimatePresence` (exit animations), gesture-based interactions, staggered lists.
- **No animation for animation's sake.** Every animation must communicate something: state change, spatial relationship, or feedback.

---

## URL-as-State (Filters / Sort / Pagination)

Keep UI state in URL search params for shareable, bookmarkable, back-button-friendly pages:

```tsx
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';

const FiltersSchema = z.object({
  query: z.string().default(''),
  status: z.enum(['all', 'active', 'archived']).default('all'),
  page: z.coerce.number().int().positive().default(1),
  sort: z.enum(['name', 'created', 'updated']).default('created'),
});

type Filters = z.infer<typeof FiltersSchema>;

function useUrlFilters(): [Filters, (updates: Partial<Filters>) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = FiltersSchema.parse(Object.fromEntries(searchParams));

  function updateFilters(updates: Partial<Filters>) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const defaults: Record<string, string> = { query: '', status: 'all', page: '1', sort: 'created' };

      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || String(value) === defaults[key]) {
          next.delete(key); // Remove defaults from URL → clean URLs
        } else {
          next.set(key, String(value));
        }
      }
      // Reset page on filter change
      if ('query' in updates || 'status' in updates || 'sort' in updates) {
        next.delete('page');
      }
      return next;
    });
  }

  return [filters, updateFilters];
}
```

**Usage:**
```tsx
function UserListPage() {
  const [filters, updateFilters] = useUrlFilters();
  const { data, isLoading, error } = useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => fetchUsers(filters),
  });

  return (
    <>
      <SearchInput value={filters.query} onChange={(query) => updateFilters({ query })} />
      <StatusFilter value={filters.status} onChange={(status) => updateFilters({ status })} />
      {isLoading ? <TableSkeleton /> : error ? <ErrorMessage /> : <UserTable users={data} />}
      <Pagination page={filters.page} onChange={(page) => updateFilters({ page })} />
    </>
  );
}
```

**Rules:**
- Validate params with Zod (malformed URLs don't crash the app).
- Remove default values from URL (clean URLs).
- Reset page to 1 on filter/sort change.
- Query key includes filters → TanStack Query auto-refetches on change.

### Pagination Strategy

| Type | URL param | Use when |
|------|-----------|----------|
| **Offset (page-based)** | `?page=3&size=20` | Known total count, user needs "jump to page N", SEO-friendly |
| **Cursor-based** | `?cursor=abc123&size=20` | Large/realtime datasets, infinite scroll, no "page N" needed |

**Rules:**
- Always reset page/cursor on filter or sort change.
- Keep `page` or `cursor` in URL for shareability and back-button support.
- "Load more" button or infinite scroll? → cursor. Page numbers? → offset.
- Backend must support the chosen strategy. Discuss early.

---

## Virtualization (Long Lists / Tables)

Render only visible items. Essential for lists > 100 items.

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface VirtualListProps<T> {
  items: T[];
  estimateSize: number; // px per row
  renderItem: (item: T, index: number) => React.ReactNode;
}

export function VirtualList<T>({ items, estimateSize, renderItem }: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
              width: '100%',
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**When:** > 100 items in a scrollable list or table. Data grids. Infinite scroll feeds.
**Libraries:** `@tanstack/react-virtual` (headless, flexible) or `react-virtuoso` (higher-level API).
**Alternative to virtualization:** Pagination or "Load more" button – simpler UX, less technical complexity.

### List / Table UX Decision

| Data size | Approach | When |
|-----------|----------|------|
| < 50 items | Render all | Simple, no perf concern |
| 50–500 items | Paginate or "Load more" | When users need to scan/compare and layout is known |
| 500+ items | Virtualize | Infinite scroll, data grids, realtime feeds |

**Large table extras:**
- Sticky header: `position: sticky; top: 0` on `<thead>` (account for sticky nav with `top` offset).
- Keyboard: Arrow keys move between cells, Enter activates. Follow WAI-ARIA grid pattern for data grids.
- Column resize/sort: use a headless table library (TanStack Table) rather than building from scratch.

---

## Container Queries

```css
.card-grid {
  container-type: inline-size;
  container-name: cards;
}

@container cards (min-width: 30rem) {
  .card { grid-template-columns: 1fr 2fr; }
}
```

Layout wrappers declare containers. Children consume. Name containers referenced from multiple places.

---

## Responsive Layout

```css
.container {
  width: min(80rem, 100% - 3rem);
  margin-inline: auto;
}

.full-bleed {
  width: 100vw;
  margin-inline: calc(50% - 50vw);
}
```

Mobile-first. Breakpoints: `40rem` (sm), `48rem` (md), `64rem` (lg), `80rem` (xl).

---

## WCAG 2.2 Focus Indicator

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
/* Never: :focus { outline: none; } without visible replacement */
```

Focused elements must not be hidden by sticky headers/footers/overlays (2.4.11).
