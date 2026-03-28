# Tech Notes — Library-Gotchas & Breaking Changes

> Dieses Dokument wird bei jedem Skill-Start gelesen (Pre-Flight Check).
> Hier werden versionsspezifische Eigenheiten, Breaking Changes und
> Workarounds dokumentiert, die sonst zu wiederholten Fehlern führen.

## Wie benutzen
- **Jeder Skill** liest diese Datei bei Aktivierung
- **Einträge hinzufügen** wenn ein Library-spezifischer Fehler > 1 Roundtrip kostet
- **Format:** Library + Version, Was ist anders, Wie lösen
- **Aufräumen** wenn eine neue Major-Version die alte ablöst

## Einträge

### Environment Variables — Zentrales Schema
Env-Variablen verstreut zu pflegen (`.env.example`, `.env.production.example`, Code, Docs) ist fehleranfällig.
**Empfehlung:** Zentrales Schema mit Runtime-Validierung nutzen:
- **Next.js:** `@t3-oss/env-nextjs` — validiert `NEXT_PUBLIC_*` und Server-Env getrennt
- **Generisch:** `envalid` oder Zod-basiertes Schema in `src/lib/env.ts`
- **Vorteil:** App crasht beim Start wenn Env fehlt, nicht erst zur Laufzeit
- **ADR dafür anlegen** in Phase 2 (Architecture)

```typescript
// Beispiel mit @t3-oss/env-nextjs
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
```

### NextAuth / Auth.js v5 — authorize() Error Swallowing
`@auth/core` fängt **alle Exceptions** aus der `authorize()` Callback ab und wirft sie als generisches `CredentialsSignin` — die eigentliche Fehlermeldung (DB-Fehler, bcrypt-Fehler, Validation-Fehler) geht verloren.

**Lösung:** `authorize()` immer in try-catch wrappen und Fehler explizit loggen:
```typescript
async authorize(credentials) {
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  } catch (error) {
    console.error("[auth] authorize error:", error);
    return null; // Fehler geloggt, CredentialsSignin wird trotzdem geworfen
  }
}
```

**Ohne try-catch:** DB-Connection-Fehler, Query-Timeouts etc. erscheinen nur als "CredentialsSignin" — Blindflug beim Debuggen.

### E2E Test-Fixtures — Zod-Schema-Grenzen beachten
Test-Helfer die User/Entities erstellen (z.B. `registerAndLogin()`) müssen die **gleichen Validation-Constraints** einhalten wie das echte Schema:

- `displayName` hat max 20 Zeichen? → Test-Prefix + unique ID dürfen zusammen nicht mehr ergeben
- Enums in Zod? → Test-Daten müssen gültige Enum-Werte nutzen
- **Empfehlung:** Fixture-Constraints als Kommentar bei den E2E-Helpern dokumentieren:
```typescript
// CONSTRAINT: displayName max 20 chars (Zod schema)
// Prefix "E2E" (3) + "-" (1) + nanoid(8) = 12 chars → safe
const displayName = `E2E-${nanoid(8)}`;
```

**Symptom wenn verletzt:** API gibt 400 zurück, aber wenn der Test-Helper den Status nicht prüft → Registration schlägt still fehl → Login failed → CredentialsSignin → stundenlanger Blindflug.

### Next.js Standalone Mode — E2E Pitfalls
`next build` mit `output: "standalone"` hat eigene Komplexität für E2E in CI:
- Static Files müssen manuell kopiert werden (`public/`, `.next/static/`)
- Environment Variables werden zur **Build-Zeit** eingebrannt, nicht zur Runtime
- **Empfehlung für E2E in CI:** Dev Server (`npm run dev`) oder regulärer `next start` statt Standalone — deutlich einfacher und zuverlässiger

<!-- Beispiel-Format:

### React 19
- `setState` in `useEffect` ist strenger — nicht synchron im Effect-Body aufrufen
- Refs dürfen nicht während Render gesetzt werden — `useRef` + `useEffect` nutzen
- Forward-References auf Funktionen in `useCallback` vermeiden

### Zod v4
- `.errors` heißt jetzt `.issues` auf ZodError-Objekten
- `z.object().parse()` wirft `ZodError` mit `.issues` Array

### Prisma v7
- Neues Adapter-Pattern: `PrismaClient` braucht expliziten DB-Adapter
- Generator-Syntax geändert — siehe Prisma v7 Migration Guide

### Next.js 15+
- `next/font` Import-Pfade geändert
- App Router: `generateStaticParams` ersetzt `getStaticPaths`
-->
