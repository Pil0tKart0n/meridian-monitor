# Playwright Reference — Patterns, Debugging & Best Practices

Comprehensive Playwright reference for the QA Test Engineer skill. Complements `testing-playbooks.md` (which covers basic patterns) with advanced strategies, debugging workflows, and decision trees.

---

## Decision Tree: Welches Pattern für welchen Test?

```
Was wird getestet?
│
├─ User-Flow (Login → Dashboard → Action → Result)?
│  → E2E Test mit Page Object Model (§ POM Pattern)
│  → Fixtures für Auth-State (§ Auth Fixtures)
│
├─ Einzelne Komponente isoliert?
│  → Component Test (§ Component Testing)
│  → Mock externe Dependencies
│
├─ API-Endpoint (Request → Response)?
│  → API Test mit `request` Fixture (§ API Testing)
│  → Kein Browser nötig
│
├─ Visuelles Erscheinungsbild / Responsive?
│  → Playwright MCP Visual Check (§ Visual Testing)
│  → Screenshot-Vergleich bei 320/768/1440px
│
├─ Accessibility (ARIA, Keyboard, Kontrast)?
│  → axe-core + browser_snapshot (§ A11y Testing)
│  → Keyboard-Navigation manuell prüfen
│
├─ Mehrere User gleichzeitig (Chat, Collaboration)?
│  → Multi-Context Pattern (§ Multi-User Tests)
│
├─ WebSocket / Real-Time?
│  → WebSocket Interception (§ WebSocket Testing)
│
├─ Netzwerk-Fehler / Offline?
│  → Route Interception (§ Network Mocking)
│
└─ Performance (Ladezeit, Web Vitals)?
   → Lighthouse CI + Performance Observer (§ Performance Testing)
```

---

## 1. Konfiguration

### Basis-Config (TypeScript-Projekt)

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/e2e-results.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Multi-Project Setup (Auth-Abhängigkeiten)

```typescript
// Projekte mit Abhängigkeiten — erst Setup, dann Tests
projects: [
  {
    name: 'setup',
    testMatch: /.*\.setup\.ts/,
  },
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'tests/.auth/user.json',
    },
    dependencies: ['setup'],
  },
],
```

---

## 2. Auth Fixtures (Login einmal, überall nutzen)

### Storage State Pattern

```typescript
// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

setup('authenticate as user', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-Mail').fill('test@example.com');
  await page.getByLabel('Passwort').fill('test-password');
  await page.getByRole('button', { name: 'Anmelden' }).click();

  // Warten bis Login abgeschlossen
  await page.waitForURL('/dashboard');

  // State speichern — wird von allen Tests wiederverwendet
  await page.context().storageState({ path: 'tests/.auth/user.json' });
});
```

```typescript
// tests/auth-admin.setup.ts
setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-Mail').fill('admin@example.com');
  await page.getByLabel('Passwort').fill('admin-password');
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await page.waitForURL('/admin');
  await page.context().storageState({ path: 'tests/.auth/admin.json' });
});
```

### Custom Fixture für Rollen

```typescript
// tests/fixtures.ts
import { test as base } from '@playwright/test';

type Fixtures = {
  adminPage: Page;
  userPage: Page;
};

export const test = base.extend<Fixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'tests/.auth/admin.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  userPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'tests/.auth/user.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});
```

---

## 3. Locator-Strategie (Priorität)

| Priorität | Methode | Wann nutzen | Stabilität |
|-----------|---------|-------------|------------|
| 1 | `getByRole()` | Buttons, Links, Headings, Inputs | Sehr hoch |
| 2 | `getByLabel()` | Form-Felder mit Label | Sehr hoch |
| 3 | `getByText()` | Sichtbarer Text (mit `{ exact: true }`) | Hoch |
| 4 | `getByTestId()` | Komplexe Selektoren, dynamische Elemente | Hoch |
| 5 | `getByPlaceholder()` | Inputs ohne Label (Anti-Pattern!) | Mittel |
| 6 | `locator('css')` | Notfall — CSS-Selektor | Niedrig |
| 7 | XPath | **Nie verwenden** | — |

### Locator Best Practices

```typescript
// ✅ Semantisch — testet auch Accessibility
await page.getByRole('button', { name: 'Projekt erstellen' }).click();
await page.getByRole('heading', { name: 'Dashboard' }).isVisible();
await page.getByLabel('E-Mail-Adresse').fill('user@example.com');

// ✅ Exakter Text-Match (verhindert Substring-Fehler)
await page.getByText('Speichern', { exact: true }).click();

// ✅ Test-ID für komplexe Fälle
await page.getByTestId('user-avatar-dropdown').click();

// ✅ Chaining für Scoped Selectors
await page.getByRole('row', { name: /Max Mustermann/ })
  .getByRole('button', { name: 'Bearbeiten' }).click();

// ❌ Fragil — bricht bei Design-Änderungen
await page.locator('.btn-primary.mt-4').click();
await page.locator('#root > div:nth-child(3) > button').click();
```

### Filter und Assertions auf Locators

```typescript
// Filter: nur sichtbare Elemente
await page.getByRole('button', { name: 'Löschen' })
  .filter({ hasText: 'Projekt' })
  .click();

// nth() für Listen
const firstRow = page.getByRole('row').nth(1); // 0 = header

// count() für Assertions
await expect(page.getByRole('listitem')).toHaveCount(5);
```

---

## 4. Assertions & Waiting

### Auto-Waiting (kein manuelles Warten nötig)

```typescript
// ✅ Playwright wartet automatisch auf Sichtbarkeit + Interaktivität
await page.getByRole('button', { name: 'Senden' }).click();

// ✅ expect() hat eingebautes Retry (Default: 5s)
await expect(page.getByText('Erfolgreich gespeichert')).toBeVisible();
await expect(page.getByTestId('item-count')).toHaveText('42');
await expect(page).toHaveURL(/\/dashboard/);
await expect(page).toHaveTitle('Dashboard — MyApp');
```

### Wann explizites Warten nötig ist

```typescript
// Nach API-Calls: auf spezifische Response warten
const responsePromise = page.waitForResponse(
  resp => resp.url().includes('/api/users') && resp.status() === 200
);
await page.getByRole('button', { name: 'Laden' }).click();
const response = await responsePromise;
const data = await response.json();

// Navigation abwarten
await page.waitForURL('**/dashboard');

// Netzwerk-Idle (nach komplexen Ladevorgängen)
await page.waitForLoadState('networkidle');

// ❌ NIEMALS: Feste Wartezeiten
await page.waitForTimeout(3000); // VERBOTEN
```

### Custom Assertions

```typescript
// Eigene Matcher für Domain-spezifische Checks
import { expect as baseExpect } from '@playwright/test';

export const expect = baseExpect.extend({
  async toBeLoggedIn(page: Page) {
    const avatar = page.getByTestId('user-avatar');
    const isVisible = await avatar.isVisible();
    return {
      pass: isVisible,
      message: () => isVisible
        ? 'Expected page to not show logged-in state'
        : 'Expected page to show logged-in state (user avatar)',
    };
  },
});
```

---

## 5. Network Mocking & Interception

### API-Responses mocken

```typescript
test('zeigt Fehlermeldung bei Server-Error', async ({ page }) => {
  // Route abfangen BEVOR Navigation
  await page.route('**/api/users', route =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    })
  );

  await page.goto('/users');
  await expect(page.getByText('Daten konnten nicht geladen werden')).toBeVisible();
});
```

### Netzwerk-Fehler simulieren

```typescript
test('zeigt Offline-Hinweis bei Netzwerkfehler', async ({ page }) => {
  await page.goto('/dashboard');

  // Netzwerk-Fehler für spezifische Route
  await page.route('**/api/data', route => route.abort('connectionrefused'));

  await page.getByRole('button', { name: 'Aktualisieren' }).click();
  await expect(page.getByText('Keine Verbindung')).toBeVisible();
});
```

### Slow Network simulieren

```typescript
test('zeigt Loading-State bei langsamer Antwort', async ({ page }) => {
  await page.route('**/api/reports', async route => {
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3s Delay
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ data: [] }),
    });
  });

  await page.goto('/reports');
  await expect(page.getByTestId('loading-skeleton')).toBeVisible();
  await expect(page.getByTestId('loading-skeleton')).not.toBeVisible({ timeout: 5000 });
});
```

### Response modifizieren (Partial Mock)

```typescript
test('modifiziert API-Response für Edge Case', async ({ page }) => {
  await page.route('**/api/users', async route => {
    const response = await route.fetch(); // echten Request ausführen
    const json = await response.json();

    // Response modifizieren
    json.data = json.data.map(user => ({ ...user, role: 'viewer' }));

    await route.fulfill({ response, body: JSON.stringify(json) });
  });

  await page.goto('/users');
});
```

---

## 6. Multi-User Tests

### Zwei User in einem Test (z.B. Chat, Collaboration)

```typescript
test('Echtzeit-Chat zwischen zwei Usern', async ({ browser }) => {
  // Zwei separate Browser-Kontexte = zwei Sessions
  const aliceContext = await browser.newContext({
    storageState: 'tests/.auth/alice.json',
  });
  const bobContext = await browser.newContext({
    storageState: 'tests/.auth/bob.json',
  });

  const alicePage = await aliceContext.newPage();
  const bobPage = await bobContext.newPage();

  // Beide öffnen denselben Chat
  await alicePage.goto('/chat/room-1');
  await bobPage.goto('/chat/room-1');

  // Alice sendet Nachricht
  await alicePage.getByLabel('Nachricht').fill('Hallo Bob!');
  await alicePage.getByRole('button', { name: 'Senden' }).click();

  // Bob sieht die Nachricht
  await expect(bobPage.getByText('Hallo Bob!')).toBeVisible({ timeout: 10000 });

  // Cleanup
  await aliceContext.close();
  await bobContext.close();
});
```

### Rollenbasierte Tests (Admin vs. User)

```typescript
test('Admin sieht Delete-Button, User nicht', async ({ browser }) => {
  const adminContext = await browser.newContext({
    storageState: 'tests/.auth/admin.json',
  });
  const userContext = await browser.newContext({
    storageState: 'tests/.auth/user.json',
  });

  const adminPage = await adminContext.newPage();
  const userPage = await userContext.newPage();

  await adminPage.goto('/users/123');
  await userPage.goto('/users/123');

  // Admin: Delete-Button sichtbar
  await expect(adminPage.getByRole('button', { name: 'User löschen' })).toBeVisible();

  // User: Delete-Button NICHT sichtbar
  await expect(userPage.getByRole('button', { name: 'User löschen' })).not.toBeVisible();

  await adminContext.close();
  await userContext.close();
});
```

---

## 7. WebSocket Testing

### WebSocket-Messages abfangen

```typescript
test('empfängt WebSocket-Notification', async ({ page }) => {
  // WebSocket-Verbindung überwachen
  const wsPromise = page.waitForEvent('websocket');

  await page.goto('/dashboard');
  const ws = await wsPromise;

  // Auf spezifische Message warten
  const messagePromise = new Promise<string>(resolve => {
    ws.on('framereceived', frame => {
      const data = JSON.parse(frame.payload as string);
      if (data.type === 'notification') {
        resolve(data.message);
      }
    });
  });

  // Aktion triggern die WebSocket-Message auslöst
  // (z.B. über API oder zweiten User)

  const message = await messagePromise;
  expect(message).toContain('Neue Nachricht');
});
```

### WebSocket-Server mocken

```typescript
test('reagiert auf WebSocket-Disconnect', async ({ page }) => {
  await page.goto('/dashboard');

  // WebSocket-Verbindung finden und schließen
  const ws = await page.waitForEvent('websocket');
  // Server-seitig trennen simulieren
  await page.evaluate(() => {
    // Alle WebSocket-Verbindungen schließen
    window.dispatchEvent(new Event('offline'));
  });

  await expect(page.getByText('Verbindung verloren')).toBeVisible();
});
```

---

## 8. Visual Testing & Responsive

### Screenshot-Vergleich

```typescript
test('Dashboard Layout', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  // Ganzseitiger Screenshot-Vergleich
  await expect(page).toHaveScreenshot('dashboard.png', {
    maxDiffPixelRatio: 0.01, // 1% Toleranz
    animations: 'disabled',
  });
});
```

### Responsive Testing (3 Viewports)

```typescript
const viewports = [
  { name: 'mobile', width: 320, height: 568 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

for (const vp of viewports) {
  test(`Dashboard responsive: ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/dashboard');

    // Kein horizontales Scrollen
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalScroll).toBe(false);

    // Screenshot pro Viewport
    await expect(page).toHaveScreenshot(`dashboard-${vp.name}.png`);
  });
}
```

### Playwright MCP Integration (Sprint-Close)

```
Playwright MCP Visual Check Workflow:
1. browser_navigate → Seite laden
2. browser_resize(320, 568) → Mobile prüfen
3. browser_take_screenshot → Evidenz sichern
4. browser_snapshot → Accessibility-Tree checken
5. browser_resize(768, 1024) → Tablet
6. browser_resize(1440, 900) → Desktop
7. browser_console_messages → Console Errors?
8. browser_network_requests → 404s?
```

---

## 9. A11y Testing mit Playwright

### axe-core Integration

```typescript
import AxeBuilder from '@axe-core/playwright';

test('Seite erfüllt WCAG 2.2 AA', async ({ page }) => {
  await page.goto('/dashboard');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();

  // Violations mit Details loggen
  if (results.violations.length > 0) {
    console.error('A11y Violations:', JSON.stringify(results.violations, null, 2));
  }
  expect(results.violations).toEqual([]);
});
```

### Keyboard-Navigation testen

```typescript
test('Modal per Keyboard bedienbar', async ({ page }) => {
  await page.goto('/settings');

  // Tab zum Button, Enter zum Öffnen
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');

  // Modal offen, Focus im Modal
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();

  // Focus ist auf erstem interaktiven Element im Modal
  const firstInput = modal.getByRole('textbox').first();
  await expect(firstInput).toBeFocused();

  // Escape schließt Modal
  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();

  // Focus zurück auf Trigger-Button
  await expect(page.getByRole('button', { name: 'Einstellungen' })).toBeFocused();
});
```

### Screen Reader Announcements prüfen

```typescript
test('Fehlermeldung wird als aria-live announced', async ({ page }) => {
  await page.goto('/login');

  // Falsches Passwort
  await page.getByLabel('E-Mail').fill('user@example.com');
  await page.getByLabel('Passwort').fill('wrong');
  await page.getByRole('button', { name: 'Anmelden' }).click();

  // aria-live Region enthält Fehlermeldung
  const liveRegion = page.locator('[aria-live]');
  await expect(liveRegion).toContainText('Anmeldedaten ungültig');
});
```

---

## 10. Performance Testing

### Web Vitals messen

```typescript
test('Core Web Vitals innerhalb Budget', async ({ page }) => {
  // Performance Observer einrichten
  await page.goto('/');

  const metrics = await page.evaluate(() => {
    return new Promise<Record<string, number>>(resolve => {
      const results: Record<string, number> = {};

      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            results.lcp = entry.startTime;
          }
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // CLS
      let cls = 0;
      new PerformanceObserver(list => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) cls += entry.value;
        }
        results.cls = cls;
      }).observe({ type: 'layout-shift', buffered: true });

      // Nach 5s sammeln
      setTimeout(() => resolve(results), 5000);
    });
  });

  expect(metrics.lcp).toBeLessThan(2500);   // LCP < 2.5s
  expect(metrics.cls).toBeLessThan(0.1);     // CLS < 0.1
});
```

---

## 11. Debugging

### Debugging-Workflow bei fehlgeschlagenen Tests

```
Test schlägt fehl
│
├─ 1. Trace ansehen
│  npx playwright show-trace test-results/[test-name]/trace.zip
│  → Zeigt jeden Schritt: Screenshots, Netzwerk, Console
│
├─ 2. Im UI Mode debuggen
│  npx playwright test --ui
│  → Visueller Debugger mit Step-by-Step
│
├─ 3. Headed Mode (Browser sichtbar)
│  npx playwright test --headed --debug
│  → Browser öffnet sich, Playwright Inspector aktiv
│
├─ 4. Spezifischen Test isolieren
│  npx playwright test -g "test name" --debug
│
└─ 5. Console-Output prüfen
   page.on('console', msg => console.log('BROWSER:', msg.text()));
   page.on('pageerror', err => console.error('PAGE ERROR:', err));
```

### Flaky Tests diagnostizieren

```bash
# Test mehrfach wiederholen um Flakiness zu erkennen
npx playwright test --repeat-each=10 tests/e2e/checkout.spec.ts

# Mit Sharding für parallele Isolation
npx playwright test --shard=1/3
```

### Häufige Ursachen für Flaky Tests

| Symptom | Ursache | Fix |
|---------|---------|-----|
| Element nicht gefunden | Race Condition — Element noch nicht gerendert | `await expect(locator).toBeVisible()` VOR Interaktion |
| Timeout bei Navigation | Langsamer Server, unerwarteter Redirect | `waitForURL` mit Pattern, nicht exakter URL |
| Unterschiedliche Daten | Shared Test-State zwischen Tests | Test-Isolation: eigener User/Daten pro Test |
| Nur in CI fehlerhaft | Timing-Unterschiede, fehlende Env-Vars | `retries: 2` in CI, Env-Vars prüfen |
| Reihenfolge-abhängig | Test A beeinflusst Test B | `fullyParallel: true`, keine shared State |
| Intermittent 401/403 | Auth-Token abgelaufen zwischen Tests | Storage State refreshen, Token-TTL prüfen |

### Debug-Helpers im Test

```typescript
// Screenshot an beliebiger Stelle
await page.screenshot({ path: '/tmp/debug-step-1.png', fullPage: true });

// Console-Output mitloggen
page.on('console', msg => {
  if (msg.type() === 'error') console.error('BROWSER:', msg.text());
});

// Netzwerk-Requests loggen
page.on('response', resp => {
  if (resp.status() >= 400) {
    console.warn(`${resp.status()} ${resp.url()}`);
  }
});

// Pause — öffnet Playwright Inspector
await page.pause();
```

---

## 12. CI/CD Best Practices

### GitHub Actions Config

```yaml
name: E2E Tests
on: [pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Run E2E Tests
        run: npx playwright test
        env:
          BASE_URL: http://localhost:3000
          CI: true

      - name: Upload Traces
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-traces
          path: test-results/
          retention-days: 7
```

### Parallelisierung in CI

```typescript
// playwright.config.ts — CI-optimiert
export default defineConfig({
  workers: process.env.CI ? 2 : undefined, // CI: 2 Worker (stabil)
  retries: process.env.CI ? 2 : 0,         // CI: 2 Retries
  reporter: process.env.CI
    ? [['junit', { outputFile: 'test-results/results.xml' }], ['html']]
    : [['list']],
});
```

### Sharding für große Test-Suites

```yaml
# GitHub Actions Matrix — 3 Shards parallel
strategy:
  matrix:
    shard: [1/3, 2/3, 3/3]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}
```

---

## 13. Anti-Patterns & Häufige Fehler

### ❌ Vermeiden

| Anti-Pattern | Problem | Richtig |
|-------------|---------|---------|
| `waitForTimeout(3000)` | Willkürliche Wartezeit, flaky | `expect(locator).toBeVisible()` |
| `page.locator('.btn')` | Fragil, bricht bei Redesign | `getByRole('button', { name })` |
| `page.$eval()` | Veraltet, Playwright hat bessere API | `locator.evaluate()` |
| Tests teilen State | Reihenfolge-abhängig, flaky | Isolation: eigene Daten pro Test |
| `{ force: true }` | Überspringt Actionability-Checks | Root Cause fixen (Element verdeckt?) |
| `response.body()` ohne Status-Check | Silent Failures (4xx/5xx ignoriert) | Erst `expect(response.status()).toBe(200)` |
| Screenshot als einziger Test | Fragil, false positives | Semantische Assertions + Screenshot |
| Globale Fixtures für Testdaten | Coupling zwischen Tests | Factory Pattern pro Test |

### ✅ Best Practices Zusammenfassung

1. **Semantische Locators** — `getByRole` > `getByTestId` > `locator`
2. **Auto-Waiting nutzen** — kein `waitForTimeout`, kein `sleep`
3. **Test-Isolation** — jeder Test hat eigene Daten, eigenen User
4. **Response-Status prüfen** — API-Calls in Setup MÜSSEN Status checken
5. **`{ exact: true }`** — bei `getByText` wenn Substring-Matches möglich
6. **Trace on Failure** — `trace: 'retain-on-failure'` in Config
7. **E2E lokal erst** — `npx playwright test` vor `git push`
8. **3 Viewports** — 320px, 768px, 1440px für jede UI-Story
9. **axe-core in CI** — Accessibility-Regression automatisch erkennen
10. **Keine parallelen Tests mit shared State** — `fullyParallel` nur mit Isolation
