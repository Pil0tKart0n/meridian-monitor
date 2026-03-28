# Testing Playbooks — Automation Patterns & Code Examples

Concrete patterns for test automation. Adapt tooling to your repo.

---

## 1. E2E Testing (Playwright)

### Stable Selector Strategy

**Priority order (most stable → least stable):**

1. `data-testid` attributes (purpose-built, refactor-safe)
2. ARIA roles + accessible names (`getByRole('button', { name: 'Submit' })`)
3. Text content (`getByText('Add to cart')`) — only for user-visible text
4. CSS class / tag — **avoid** (changes with design, breaks with CSS modules)
5. XPath — **never** (brittle, unreadable)

```typescript
// ✅ Stable
await page.getByTestId('checkout-button').click();
await page.getByRole('button', { name: 'Submit order' }).click();

// ❌ Brittle
await page.locator('.btn-primary.mt-4').click();
await page.locator('#root > div > div:nth-child(3) > button').click();
```

### Wait Strategy (no sleeps)

```typescript
// ✅ Wait for specific state
await page.waitForResponse(resp =>
  resp.url().includes('/api/orders') && resp.status() === 201
);
await expect(page.getByTestId('order-confirmation')).toBeVisible();

// ✅ Wait for network idle after navigation
await page.goto('/dashboard');
await page.waitForLoadState('networkidle');

// ❌ Never
await page.waitForTimeout(3000);
```

### Test Isolation Pattern

```typescript
// Each test gets fresh context + data
test.describe('Checkout flow', () => {
  let testUser: TestUser;

  test.beforeEach(async ({ request }) => {
    // Create isolated test data via API
    testUser = await createTestUser(request, {
      email: `test-${Date.now()}@example.com`,
      cart: [{ sku: 'ITEM-001', quantity: 1 }],
    });
  });

  test.afterEach(async ({ request }) => {
    await cleanupTestUser(request, testUser.id);
  });

  test('completes purchase', async ({ page }) => {
    await page.goto(`/checkout?token=${testUser.authToken}`);
    // ... assertions
  });
});
```

### Screenshot/Video on Failure

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/e2e-results.xml' }],
  ],
});
```

### Page Object Pattern (when E2E suite > 10 tests)

```typescript
// pages/checkout.page.ts
export class CheckoutPage {
  constructor(private page: Page) {}

  async fillShipping(address: ShippingAddress) {
    await this.page.getByTestId('shipping-name').fill(address.name);
    await this.page.getByTestId('shipping-street').fill(address.street);
    await this.page.getByTestId('shipping-city').fill(address.city);
  }

  async submitOrder() {
    await this.page.getByRole('button', { name: 'Place order' }).click();
    await this.page.waitForResponse(r => r.url().includes('/api/orders'));
  }

  async expectConfirmation(orderId: string) {
    await expect(this.page.getByTestId('order-id')).toHaveText(orderId);
  }
}
```

---

## 2. API Testing

### Schema Validation (OpenAPI)

```python
# pytest example with schemathesis
import schemathesis

schema = schemathesis.from_url("http://localhost:8000/openapi.json")

@schema.parametrize()
def test_api_conforms_to_schema(case):
    """Auto-generated tests from OpenAPI spec."""
    response = case.call()
    case.validate_response(response)
```

### Error Envelope Assertion

```typescript
// Verify consistent error shape across all endpoints
test('returns standardized error for invalid input', async ({ request }) => {
  const response = await request.post('/api/orders', {
    data: { items: [] }, // invalid: empty cart
  });

  expect(response.status()).toBe(400);

  const body = await response.json();
  expect(body).toMatchObject({
    errorCode: expect.any(String),
    message: expect.any(String),
    requestId: expect.any(String),
  });
  // details is optional but typed if present
  if (body.details) {
    expect(Array.isArray(body.details)).toBe(true);
  }
});
```

### Auth Boundary Tests

```typescript
const protectedEndpoints = [
  { method: 'GET', path: '/api/admin/users' },
  { method: 'POST', path: '/api/orders' },
  { method: 'DELETE', path: '/api/users/me' },
];

for (const endpoint of protectedEndpoints) {
  test(`${endpoint.method} ${endpoint.path} requires auth`, async ({ request }) => {
    const response = await request[endpoint.method.toLowerCase()](endpoint.path);
    expect(response.status()).toBe(401);
  });

  test(`${endpoint.method} ${endpoint.path} rejects expired token`, async ({ request }) => {
    const response = await request[endpoint.method.toLowerCase()](endpoint.path, {
      headers: { Authorization: `Bearer ${EXPIRED_TOKEN}` },
    });
    expect(response.status()).toBe(401);
  });
}
```

### Idempotency Test

```typescript
test('duplicate order submission returns same order', async ({ request }) => {
  const idempotencyKey = crypto.randomUUID();
  const orderData = { items: [{ sku: 'ITEM-001', qty: 1 }] };

  const first = await request.post('/api/orders', {
    data: orderData,
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  const second = await request.post('/api/orders', {
    data: orderData,
    headers: { 'Idempotency-Key': idempotencyKey },
  });

  expect(first.status()).toBe(201);
  expect(second.status()).toBe(201);

  const firstBody = await first.json();
  const secondBody = await second.json();
  expect(firstBody.data.id).toBe(secondBody.data.id); // same order, not duplicate
});
```

---

## 3. Contract Testing

### Provider Contract Test (Backend validates against OpenAPI)

```python
# pytest: verify endpoints match OpenAPI spec
import openapi_core
from openapi_core.contrib.requests import RequestsOpenAPIRequest, RequestsOpenAPIResponse

spec = openapi_core.Spec.from_file_path("openapi.yaml")

def test_list_orders_matches_contract(client, auth_headers):
    response = client.get("/api/orders", headers=auth_headers)

    openapi_request = RequestsOpenAPIRequest(response.request)
    openapi_response = RequestsOpenAPIResponse(response)
    result = openapi_core.unmarshal_response(openapi_request, openapi_response, spec=spec)

    assert result.errors == [], f"Contract violations: {result.errors}"
```

### Consumer Contract Test (Frontend validates assumptions)

```typescript
// Zod boundary validation: FE defines expected shape
import { z } from 'zod';

const OrderSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['created', 'paid', 'shipped', 'delivered', 'cancelled']),
  items: z.array(z.object({
    sku: z.string(),
    quantity: z.number().int().positive(),
    priceMinor: z.number().int(), // cents
  })),
  totalMinor: z.number().int(),
  createdAt: z.string().datetime(),
});

test('API response matches expected schema', async () => {
  const response = await fetch('/api/orders/test-order-id');
  const data = await response.json();

  const result = OrderSchema.safeParse(data);
  expect(result.success).toBe(true);
  if (!result.success) {
    console.error('Schema mismatch:', result.error.issues);
  }
});
```

### Breaking Change Detection (CI)

```yaml
# GitHub Actions: OpenAPI diff check
- name: Check for breaking API changes
  uses: oasdiff/oasdiff-action/breaking@main
  with:
    base: 'main'
    revision: 'HEAD'
    fail-on: ERR  # fail on breaking changes
```

---

## 4. Performance Testing (k6)

### Smoke Load Script

```javascript
// tests/load/smoke.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // ramp up
    { duration: '1m', target: 10 },   // steady state
    { duration: '10s', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],    // p95 < 500ms
    http_req_failed: ['rate<0.01'],      // error rate < 1%
    checks: ['rate>0.99'],               // 99% checks pass
  },
};

export default function () {
  const authToken = __ENV.AUTH_TOKEN;

  const listResponse = http.get(`${__ENV.BASE_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  check(listResponse, {
    'list orders: status 200': (r) => r.status === 200,
    'list orders: has data': (r) => JSON.parse(r.body).data.length >= 0,
  });

  sleep(1); // think time between requests
}
```

### Run Commands

```bash
# Local smoke test
k6 run --env BASE_URL=http://localhost:8000 --env AUTH_TOKEN=test-token tests/load/smoke.js

# CI with threshold enforcement
k6 run --env BASE_URL=$STAGING_URL --env AUTH_TOKEN=$TEST_TOKEN \
  --out json=test-results/k6-results.json \
  tests/load/smoke.js
```

---

## 5. Accessibility Testing

### axe-core in Playwright

```typescript
import AxeBuilder from '@axe-core/playwright';

test('checkout page passes a11y checks', async ({ page }) => {
  await page.goto('/checkout');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .exclude('.third-party-widget') // exclude elements you don't control
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### CI Integration (axe + Lighthouse)

```yaml
# GitHub Actions
- name: Accessibility check
  run: |
    npx playwright test tests/a11y/ --reporter=junit
    npx lighthouse $STAGING_URL --output=json --output-path=test-results/lighthouse.json \
      --chrome-flags="--headless" --only-categories=accessibility
```

---

## 6. Security Smoke Tests

### OWASP Basics (automated)

```typescript
// XSS input validation
const xssPayloads = [
  '<script>alert("xss")</script>',
  '"><img src=x onerror=alert(1)>',
  "'; DROP TABLE users; --",
  '../../../etc/passwd',
];

for (const payload of xssPayloads) {
  test(`rejects malicious input: ${payload.substring(0, 30)}...`, async ({ request }) => {
    const response = await request.post('/api/comments', {
      data: { content: payload },
      headers: { Authorization: `Bearer ${validToken}` },
    });

    // Should either reject (400) or sanitize (not reflect raw input)
    if (response.status() === 201) {
      const body = await response.json();
      expect(body.data.content).not.toContain('<script>');
      expect(body.data.content).not.toContain('onerror');
    }
  });
}
```

### Dependency Scan (CI)

```yaml
# GitHub Actions
- name: Dependency vulnerability scan
  run: |
    npm audit --audit-level=critical
    # or: snyk test --severity-threshold=high
```

---

## 7. Test Data Factories

### Factory Pattern (TypeScript)

```typescript
// tests/factories/user.factory.ts
import { faker } from '@faker-js/faker';

faker.seed(42); // deterministic

interface CreateUserOptions {
  role?: 'user' | 'admin';
  verified?: boolean;
  withCart?: boolean;
}

export function buildUser(overrides: CreateUserOptions = {}) {
  return {
    email: `test-${faker.string.nanoid(8)}@example.com`,
    name: faker.person.fullName(),
    role: overrides.role ?? 'user',
    verified: overrides.verified ?? true,
    ...(overrides.withCart && {
      cart: [{ sku: 'ITEM-001', quantity: 1 }],
    }),
  };
}

// Usage in tests:
// const adminUser = buildUser({ role: 'admin' });
// const newUser = buildUser({ verified: false });
```

### Factory Pattern (Python)

```python
# tests/factories/user_factory.py
import factory
from faker import Faker

fake = Faker()
Faker.seed(42)

class UserFactory(factory.Factory):
    class Meta:
        model = dict

    email = factory.LazyFunction(lambda: f"test-{fake.pystr(8)}@example.com")
    name = factory.LazyFunction(fake.name)
    role = "user"
    is_verified = True

# Usage:
# admin = UserFactory(role="admin")
# unverified = UserFactory(is_verified=False)
```

---

## 8. CI Configuration Examples

### GitHub Actions (test pipeline)

```yaml
name: Quality Gates
on: [pull_request]

jobs:
  merge-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup
        uses: actions/setup-node@v4
        with: { node-version: 20 }

      - run: npm ci --ignore-scripts

      - name: Lint + Typecheck
        run: npm run lint && npm run typecheck

      - name: Unit + Component tests
        run: npm test -- --reporter=junit --outputFile=test-results/unit.xml

      - name: Contract lint
        run: npx oasdiff breaking main HEAD

      - name: Security scan
        run: npm audit --audit-level=critical

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
```
