# Feature Flags Rules

## Grundprinzip
Neue Features werden hinter Feature Flags entwickelt und schrittweise freigeschaltet.
Flags ermöglichen Rollback ohne Deployment und kontrollierte Rollouts.

## Wann Feature Flags nutzen
- **IMMER:** Neue User-facing Features, die riskant sind oder A/B-getestet werden
- **IMMER:** Breaking Changes an bestehenden Features
- **OPTIONAL:** Interne Refactorings die schrittweise migriert werden
- **NICHT NÖTIG:** Bug-Fixes, rein kosmetische Änderungen, Docs

## Flag-Typen

| Typ | Lebensdauer | Beispiel |
|-----|-------------|---------|
| **Release Flag** | Kurz (1-2 Sprints) | `NEW_CHECKOUT_FLOW` — neues Feature ausrollen |
| **Ops Flag** | Mittel | `ENABLE_CACHE_V2` — Infrastructure-Switch |
| **Experiment Flag** | Kurz (A/B-Test) | `EXPERIMENT_PRICING_PAGE` — Conversion testen |
| **Kill Switch** | Permanent | `ENABLE_THIRD_PARTY_API` — externer Dienst abschaltbar |

## Naming Convention
```
FEATURE_[SCOPE]_[NAME]
```
- `FEATURE_CHECKOUT_NEW_FLOW` — Release Flag
- `FEATURE_API_RATE_LIMIT_V2` — Ops Flag
- `EXPERIMENT_LANDING_HERO_B` — Experiment
- `KILL_PAYMENT_PROVIDER` — Kill Switch

## Implementation

### Einfach (Environment-basiert)
Für Solo-Projekte oder MVPs — Flags als Environment Variables:

```typescript
// src/lib/flags.ts
export const flags = {
  newCheckoutFlow: process.env.NEXT_PUBLIC_FF_NEW_CHECKOUT === 'true',
  cacheV2: process.env.FF_CACHE_V2 === 'true',
} as const;

// Typsicher — neues Flag = hier hinzufügen + .env.example updaten
```

```typescript
// Usage in Component
import { flags } from '@/lib/flags';

export function Checkout() {
  if (flags.newCheckoutFlow) {
    return <NewCheckoutFlow />;
  }
  return <LegacyCheckout />;
}
```

### Fortgeschritten (Library-basiert)
Für Teams oder Projekte mit A/B-Testing:
- **Vercel:** `@vercel/flags` + `@vercel/toolbar`
- **Open Source:** `unleash-proxy-client`, `flagsmith`
- **Entscheidung:** ADR anlegen in `docs/adr/`

## Flag-Lifecycle (HARD RULE)

```
1. Flag erstellen → Code hinter Flag → PR + Review
2. Deploy mit Flag OFF (Default)
3. Flag ON für Testgruppe (Staging, Internes Team)
4. Gradual Rollout: 10% → 50% → 100%
5. Flag entfernen nach 2 Sprints (max!)
```

**Kein Flag darf länger als 2 Sprints existieren** (außer Kill Switches).
Nach 2 Sprints: Feature ist entweder live (Flag entfernen) oder tot (Code + Flag entfernen).

### Aufräum-Tracking
```bash
# Bei Flag-Erstellung: Cleanup-Issue anlegen
gh issue create --title "CLEANUP: Remove flag FEATURE_[NAME]" \
  --label "type:tech-debt,priority:P2" \
  --milestone "Sprint [N+2]" \
  --body "Flag created in Sprint [N]. Remove after rollout complete."
```

## Testing mit Flags
- Tests müssen BEIDE Pfade abdecken (Flag ON und Flag OFF)
- E2E: mindestens den neuen Pfad (Flag ON) testen
- CI: Tests laufen mit allen Flags OFF (Default) + einmal mit allen Flags ON

```typescript
// Test-Beispiel
describe('Checkout', () => {
  it('renders legacy flow when flag is off', () => {
    // flags.newCheckoutFlow = false (default)
    render(<Checkout />);
    expect(screen.getByText('Legacy Checkout')).toBeInTheDocument();
  });

  it('renders new flow when flag is on', () => {
    // Mock flag
    vi.mock('@/lib/flags', () => ({ flags: { newCheckoutFlow: true } }));
    render(<Checkout />);
    expect(screen.getByText('New Checkout')).toBeInTheDocument();
  });
});
```

## .env.example Pflicht
Jedes neue Flag MUSS in `.env.example` mit Default-Wert und Kommentar:
```bash
# Feature Flags (true/false)
NEXT_PUBLIC_FF_NEW_CHECKOUT=false  # New checkout flow (Sprint 3)
FF_CACHE_V2=false                   # Cache v2 migration (Sprint 4)
```

## Anti-Patterns
- **Flag-Nesting:** Kein Flag innerhalb eines anderen Flags
- **Business-Logic in Flags:** Flag entscheidet nur "welcher Pfad", nicht "wie die Logik funktioniert"
- **Zombie-Flags:** Flags die nie aufgeräumt werden — Cleanup-Issue ist PFLICHT
- **Flag-Explosion:** Max 5 aktive Release-Flags gleichzeitig
