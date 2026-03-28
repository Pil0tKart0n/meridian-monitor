# Testing Guide

## Philosophy

- Test **behavior**, not implementation.
- Tests must survive refactoring.
- Every component ships with tests.
- Name: `[subject] [condition] [expected result]`

## When Unit vs E2E

| Scenario | Unit/Component (Vitest) | E2E (Playwright) |
|----------|------------------------|-------------------|
| Component renders correctly | ✅ | — |
| User interaction triggers callback | ✅ | — |
| Form validation + submission | ✅ | — |
| Keyboard navigation within component | ✅ | — |
| Route navigation flow | — | ✅ |
| Auth login/logout cycle | — | ✅ |
| Critical business flow (checkout, signup) | — | ✅ |
| Third-party integration (payment, OAuth) | — | ✅ |
| Visual layout across viewports | — | Visual regression |

**Rule:** If the test needs a browser URL bar or multi-page navigation → E2E. Everything else → unit/component.

---

## Setup (Vitest + Testing Library)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

---

## Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label text', () => {
    render(<Button label="Save" />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button label="Save" onClick={handleClick} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button label="Save" onClick={handleClick} isDisabled />);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows spinner and disables button in loading state', () => {
    render(<Button label="Save" isLoading />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## Hook Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with given value', () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it('increments', () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => result.current.increment());
    expect(result.current.count).toBe(1);
  });
});
```

## Keyboard & Focus Testing

Most developers skip keyboard tests. Don't – they catch the most critical a11y bugs.

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from './Tabs';

describe('Tabs keyboard navigation', () => {
  it('moves focus with arrow keys', async () => {
    const user = userEvent.setup();
    render(<Tabs items={['Tab 1', 'Tab 2', 'Tab 3']} />);

    // Tab to first tab
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus();

    // Arrow right to next tab
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus();
  });

  it('traps focus inside dialog', async () => {
    const user = userEvent.setup();
    render(<Dialog isOpen onClose={vi.fn()} title="Confirm" />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    closeButton.focus();

    // Tab through all focusable elements, should cycle back
    await user.tab();
    await user.tab();
    await user.tab(); // wraps around
    expect(closeButton).toHaveFocus();
  });

  it('closes dialog on Escape', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(<Dialog isOpen onClose={handleClose} title="Confirm" />);

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('returns focus to trigger after dialog closes', () => {
    const { rerender } = render(
      <>
        <button data-testid="trigger">Open</button>
        <Dialog isOpen onClose={vi.fn()} title="Test" />
      </>
    );
    rerender(
      <>
        <button data-testid="trigger">Open</button>
        {/* dialog closed */}
      </>
    );
    expect(screen.getByTestId('trigger')).toHaveFocus();
  });
});
```

**Test these interactions on every interactive component:** Tab order, Enter/Space activation, Escape dismiss, Arrow key navigation, focus return.

---

## API / Service Tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchUserProfile } from './userApi';

describe('fetchUserProfile', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('returns data on success', async () => {
    const mockUser = { id: '1', name: 'Jane', email: 'jane@test.com' };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockUser), { status: 200 }),
    );
    const result = await fetchUserProfile('1');
    expect(result.data).toEqual(mockUser);
    expect(result.error).toBeNull();
  });

  it('returns error on 404', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 404, statusText: 'Not Found' }),
    );
    const result = await fetchUserProfile('999');
    expect(result.data).toBeNull();
    expect(result.error?.status).toBe(404);
  });

  it('handles network failure', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const result = await fetchUserProfile('1');
    expect(result.error?.status).toBe(0);
  });
});
```

## Utility Tests (Parameterized)

```typescript
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it.each([
    [1000, 'en-US', 'USD', '$1,000.00'],
    [1000, 'de-DE', 'EUR', '1.000,00\u00a0€'],
    [0, 'en-US', 'USD', '$0.00'],
  ])('formats %d in %s/%s as %s', (amount, locale, currency, expected) => {
    expect(formatCurrency(amount, locale, currency)).toBe(expected);
  });
});
```

---

## MSW (Mock Service Worker)

Preferred over `vi.spyOn(fetch)` for integration-style tests.

```bash
npm install -D msw
```

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users/:userId', ({ params }) => {
    return HttpResponse.json({ id: params.userId, name: 'Jane Doe' });
  }),
  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 'new-1', ...body }, { status: 201 });
  }),
];
```

```typescript
// src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);
```

```typescript
// src/test/setup.ts (extend)
import { server } from './mocks/server';
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Override in single test

```typescript
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

it('shows error on server failure', async () => {
  server.use(
    http.get('/api/users/:userId', () => {
      return HttpResponse.json({ message: 'Error' }, { status: 500 });
    }),
  );
  render(<UserProfile userId="1" />);
  expect(await screen.findByRole('alert')).toHaveTextContent(/error/i);
});
```

---

## Accessibility Testing (axe)

```bash
npm install -D vitest-axe
```

```typescript
// src/test/setup.ts (add)
import 'vitest-axe/extend-expect';
```

```typescript
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { LoginForm } from './LoginForm';

describe('LoginForm a11y', () => {
  it('has no axe violations', async () => {
    const { container } = render(<LoginForm />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in error state', async () => {
    const { container } = render(<LoginForm error="Invalid credentials" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

**Use axe on:** All shared/design system components, form components (all states), navigation.
**Skip for:** Feature-specific components (manual keyboard test is enough).

---

## TanStack Query: Query Key Design

Query keys are API contracts. Consistent key design prevents cache chaos.

### Key Structure

```typescript
// keys.ts – central query key factory per feature
export const userKeys = {
  all:      ['users'] as const,
  lists:    () => [...userKeys.all, 'list'] as const,
  list:     (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details:  () => [...userKeys.all, 'detail'] as const,
  detail:   (userId: string) => [...userKeys.details(), userId] as const,
};
```

### Usage

```typescript
// Fetch
const { data } = useQuery({
  queryKey: userKeys.detail(userId),
  queryFn: () => fetchUserProfile(userId),
  staleTime: 5 * 60 * 1000, // 5 min
});

// Invalidate after mutation
const mutation = useMutation({
  mutationFn: updateUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: userKeys.details() }); // all details
    queryClient.invalidateQueries({ queryKey: userKeys.lists() });   // all lists
  },
});
```

### Invalidation Rules

| After... | Invalidate... |
|----------|--------------|
| Create item | All lists for that entity |
| Update item | That item's detail + all lists |
| Delete item | That item's detail + all lists |
| Bulk action | All keys for entity (`userKeys.all`) |

**Rule:** Invalidate broad, not surgical. Over-invalidation causes a refetch. Under-invalidation causes stale UI.

---

## API Response Validation (Zod)

When backend contracts are unreliable:

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']),
});

type User = z.infer<typeof UserSchema>;

// In service:
const parsed = UserSchema.safeParse(rawData);
if (!parsed.success) {
  console.error('Validation failed:', parsed.error.flatten());
  return { data: null, error: { status: 0, message: 'Invalid response' } };
}
```

**When:** Third-party APIs, unreliable backends, any boundary where shape isn't guaranteed.
**Skip:** APIs you fully control with typed contracts (e.g., tRPC).

---

## E2E (Playwright)

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  baseURL: 'http://localhost:5173',
  use: { trace: 'on-first-retry', screenshot: 'only-on-failure' },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

```typescript
import { test, expect } from '@playwright/test';

test('login redirects to dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/dashboard');
});
```

---

## Mocking Strategy

| What | How | When |
|------|-----|------|
| API calls | MSW (preferred) or `vi.spyOn(fetch)` | Always |
| Timers | `vi.useFakeTimers()` | Debounce, polling |
| Browser APIs | Manual mock | `matchMedia`, `IntersectionObserver` |
| Routing | `MemoryRouter` wrapper | Navigation hooks |

**Mock at boundaries** (network, browser APIs), never inside your own code.

---

## Snapshot Testing Policy

Snapshots are a double-edged sword. Use with discipline:

**✅ Use snapshots for:**
- Small, stable UI primitives (Button, Badge, Avatar) – changes are intentional and visible in review.
- Serialized data structures (API response transforms, config objects).

**❌ Don't use snapshots for:**
- Large pages or feature components – snapshots become noise, reviewers rubber-stamp updates.
- Components with dynamic content (dates, IDs, animations).
- Anything that changes frequently during development.

**Rules:**
- Snapshots must be reviewed line-by-line on update – never auto-accept.
- Prefer inline snapshots (`toMatchInlineSnapshot()`) for small outputs – the expected value lives in the test file.
- If a snapshot fails on every minor change → delete it, write a behavior test instead.

---

## Coverage Guardrails

Coverage is a guardrail, not a goal. Don't chase 100%.

**Recommended minimums (not religion):**
- **Shared/design system components:** 80%+ (behavior tests, not snapshot-only).
- **Domain/business logic (utils, services, reducers):** 90%+ – this is where bugs cost the most.
- **Feature components:** No hard minimum. Test critical user flows and edge cases.
- **E2E-covered flows:** Unit coverage may be lower – the E2E is the safety net.

```bash
# vitest.config.ts – add coverage thresholds per folder
test: {
  coverage: {
    thresholds: {
      'src/utils/**': { statements: 90 },
      'src/components/**': { statements: 80 },
    },
  },
}
```

**Rule:** Measure coverage for critical packages. Use it to find untested paths, not as a KPI.

---

## Performance Regression Testing

Catch performance regressions before they reach production.

**Lightweight CI approach:** Run Lighthouse CI on critical pages (home, listing, detail) after each build. Set budget assertions for performance score and resource sizes.

```bash
# Install
npm install -D @lhci/cli

# Run (in CI after build + start)
npx lhci autorun --config=.lighthouserc.json
```

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/", "http://localhost:3000/products"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "resource-summary:script:size": ["warn", { "maxNumericValue": 350000 }]
      }
    }
  }
}
```

**Rule:** Performance budgets in CI catch the "death by a thousand cuts" problem – each PR adds a little, nobody notices until it's too late.

**When:** Always for user-facing apps with SSR/SSG. Optional for internal tools where load time isn't critical.

---

## Contract Tests (API Schema ↔ UI)

Backend changes can silently break the frontend. Contract tests validate that your fixtures match the actual API schema.

```typescript
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { UserSchema, OrderSchema } from '../schemas';
import userFixture from '../test/fixtures/user.json';
import orderFixture from '../test/fixtures/order.json';

describe('API contract: User', () => {
  it('fixture matches schema', () => {
    const result = UserSchema.safeParse(userFixture);
    expect(result.success).toBe(true);
  });
});

describe('API contract: Order', () => {
  it('fixture matches schema', () => {
    const result = OrderSchema.safeParse(orderFixture);
    expect(result.success).toBe(true);
  });
});
```

**How it works:**
1. Define Zod schemas for every API entity your UI consumes.
2. Keep fixture files that represent real API responses.
3. Test that fixtures pass schema validation.
4. When the backend changes → fixture breaks → contract test fails → you know before users do.

**When:** Third-party or cross-team APIs. Skip when you control both frontend and backend with end-to-end type safety (tRPC, GraphQL codegen).
