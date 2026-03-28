# Authorization Rules

## Grundprinzip (HARD RULE)
- **Default Deny** — jeder Endpoint ist gesperrt bis explizit freigegeben
- **Permission-basiertes RBAC** als Standard — Rollen sind Container für Permissions, Code prüft nur Permissions
- **Nie Rollen im Code prüfen** — `if (user.role === 'admin')` ist verboten. Stattdessen: `requirePermission('users:delete')`
- **DB-basiert, nicht hardcoded** — Rollen und Permissions leben in der Datenbank, nicht in Enums oder Config-Files
- Authorization-Entscheidung per ADR dokumentieren: `docs/adr/ADR-NNN-authorization.md`

## Wann welches Modell

| Modell | Wann nutzen | Beispiel |
|--------|-------------|---------|
| **Permission-basiertes RBAC** | Standard für 95% der Projekte. Rollen gruppieren Permissions, Code prüft nur Permissions. | Seller darf `leads:view:own`, Admin darf `leads:view:all` |
| **ABAC (Attribute-Based)** | Wenn Zugriff von dynamischen Attributen abhängt (Zeit, Standort, Abteilung). Erst wenn RBAC nicht mehr reicht. | "Zugriff nur während Geschäftszeiten" oder "nur für DE-Region" |
| **ReBAC (Relationship-Based)** | Wenn Ressourcen-Beziehungen die Zugriffslogik bestimmen (Org-Hierarchien, Team-Zugehörigkeit). | "Manager sieht Leads seines Teams" — Google Zanzibar Pattern |

**Empfehlung:** Mit Permission-basiertem RBAC starten. ABAC/ReBAC erst einführen wenn konkrete Requirements es erfordern — ADR Pflicht.

## DB-Schema (HARD RULE)

Fünf Tabellen, unabhängig vom ORM:

```
users
  id, email, name, ...

roles
  id, name (unique), description
  -- z.B. "admin", "seller", "viewer", "manager"

permissions
  id, resource, action, scope
  -- resource: "leads", "users", "reports", "settings"
  -- action: "view", "create", "update", "delete", "assign", "export"
  -- scope: "own" | "team" | "all"
  -- unique constraint auf (resource, action, scope)

role_permissions (n:m)
  role_id → roles.id
  permission_id → permissions.id

user_roles (n:m)
  user_id → users.id
  role_id → roles.id
  assigned_at, assigned_by
  -- Ein User kann mehrere Rollen haben
```

**Regeln:**
- `permissions` Tabelle ist die Single Source of Truth — neue Features = neue Permissions per Migration
- Rollen werden NICHT im Code definiert — sie werden per Seed-Script oder Admin-UI erstellt
- `scope` ermöglicht Row-Level-Filtering ohne separate Logik: `own` = nur eigene, `team` = Team, `all` = alles
- `assigned_by` in `user_roles` für Audit Trail — wer hat wem welche Rolle gegeben?

### Prisma-Beispiel
```prisma
model Role {
  id          String           @id @default(cuid())
  name        String           @unique
  description String?
  permissions RolePermission[]
  users       UserRole[]
}

model Permission {
  id       String           @id @default(cuid())
  resource String           // "leads", "users", "reports"
  action   String           // "view", "create", "update", "delete"
  scope    String           @default("own") // "own", "team", "all"
  roles    RolePermission[]

  @@unique([resource, action, scope])
}

model RolePermission {
  role         Role       @relation(fields: [roleId], references: [id])
  roleId       String
  permission   Permission @relation(fields: [permissionId], references: [id])
  permissionId String

  @@id([roleId, permissionId])
}

model UserRole {
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  role       Role     @relation(fields: [roleId], references: [id])
  roleId     String
  assignedAt DateTime @default(now())
  assignedBy String?  // userId des Zuweisenden

  @@id([userId, roleId])
}
```

## Permission-Naming (HARD RULE)

Format: `resource:action` oder `resource:action:scope`

```
leads:view          → Leads sehen (eigener Scope als Default)
leads:view:all      → Alle Leads sehen
leads:assign        → Leads zuweisen
leads:export        → Leads exportieren
users:create        → Neue User anlegen
users:delete        → User löschen
settings:update     → Einstellungen ändern
reports:view:team   → Team-Reports sehen
```

**Regeln:**
- `resource` = Plural, lowercase, matcht API-Resource-Name
- `action` = Verb, lowercase: `view`, `create`, `update`, `delete`, `assign`, `export`, `approve`
- `scope` = optional, Default ist `own` wenn nicht angegeben
- Neue Permission = DB-Migration + Zuordnung zu Rolle(n) im selben Commit
- Wildcard `*` nur für Super-Admin, nie für normale Rollen

## Middleware-Pattern (HARD RULE)

Zentrale `requirePermission()` Middleware — nicht verstreute if-Checks:

```typescript
// SCHLECHT — hardcoded Rolle, verstreut im Code
if (user.role === 'admin') { /* ... */ }

// SCHLECHT — Permission-Check im Handler statt Middleware
export async function handler(req) {
  if (!user.permissions.includes('leads:view')) return forbidden();
  // ...
}

// GUT — zentrale Middleware, deklarativ
export const GET = withAuth(
  requirePermission('leads:view'),
  async (req, { user }) => {
    // User hat 'leads:view' — sicher
  }
);
```

**Implementation:**
- `requirePermission(permission: string)` — prüft ob User die Permission hat (via Rollen)
- `requireAnyPermission(...permissions: string[])` — mindestens eine der Permissions
- `requireAllPermissions(...permissions: string[])` — alle Permissions nötig
- Permissions werden bei Login/Token-Refresh aus DB geladen und im JWT oder Session gecacht
- Cache-Invalidierung: wenn Rolle oder Permission sich ändert → alle Sessions des betroffenen Users invalidieren

## Row-Level Filtering (HARD RULE)

Wenn eine Permission `scope: "own"` hat, MUSS die Query automatisch gefiltert werden:

```typescript
// Pattern: Scope-aware Query Helper
function scopedWhere(user: AuthUser, permission: string) {
  const scope = user.getPermissionScope(permission);
  switch (scope) {
    case 'all':  return {};                           // kein Filter
    case 'team': return { teamId: user.teamId };      // Team-Filter
    case 'own':  return { ownerId: user.id };          // Owner-Filter
    default:     throw new ForbiddenError();            // kein Zugriff
  }
}

// Nutzung
const leads = await prisma.lead.findMany({
  where: {
    ...scopedWhere(user, 'leads:view'),
    // + weitere Filter
  },
});
```

**Regeln:**
- Nie vergessen den Scope-Filter anzuwenden — ein `findMany()` ohne Scope-Filter ist ein potenzieller Data Leak
- `scope: "all"` MUSS explizit vergeben werden — Default ist immer `own`
- Row-Level-Filter in einer zentralen Utility, nicht in jedem Handler einzeln

## Feature Flags × Permissions

Feature Flags und Permissions sind **getrennte Konzepte**, die zusammenarbeiten:

| Konzept | Fragt | Beispiel |
|---------|-------|---------|
| **Permission** | "Darf dieser User das?" | User hat `leads:export` → darf Leads exportieren |
| **Feature Flag** | "Ist dieses Feature aktiv?" | `FEATURE_LEAD_EXPORT` = true → Export-Button sichtbar |

**Reihenfolge der Prüfung:**
1. Feature Flag aktiv? → Nein → Feature nicht sichtbar (für niemanden)
2. User hat Permission? → Nein → 403 Forbidden
3. Beides ja → Zugriff erlaubt

```typescript
// Pattern
if (flags.leadExport && user.hasPermission('leads:export')) {
  // Feature sichtbar UND erlaubt
}
```

## Seed-Script (EMPFEHLUNG)

Permissions und Default-Rollen per Seed-Script anlegen — nicht manuell in der DB:

```typescript
// prisma/seed.ts oder db/seed.ts
const permissions = [
  { resource: 'leads',    action: 'view',   scope: 'own' },
  { resource: 'leads',    action: 'view',   scope: 'all' },
  { resource: 'leads',    action: 'create', scope: 'all' },
  { resource: 'leads',    action: 'assign', scope: 'all' },
  { resource: 'users',    action: 'view',   scope: 'all' },
  { resource: 'users',    action: 'create', scope: 'all' },
  { resource: 'settings', action: 'update', scope: 'all' },
];

const roles = {
  admin:  ['leads:view:all', 'leads:create:all', 'leads:assign:all', 'users:view:all', 'users:create:all', 'settings:update:all'],
  seller: ['leads:view:own', 'leads:create:all'],
  viewer: ['leads:view:own'],
};
```

**Regeln:**
- Seed-Script ist idempotent (kann mehrfach ausgeführt werden ohne Duplikate)
- Neue Permissions → Seed-Script erweitern + Migration
- Seed-Script wird in CI ausgeführt (nach Migrations, vor Tests)

## Testing (HARD RULE)

Authorization-Tests sind PFLICHT — nicht optional:

```typescript
describe('Authorization', () => {
  it('denies access without permission', async () => {
    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${viewerToken}`);  // viewer hat kein leads:view:all
    expect(res.status).toBe(403);
  });

  it('filters leads by owner for scope:own', async () => {
    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${sellerToken}`);
    // Seller sieht nur eigene Leads
    expect(res.body.data.every(l => l.ownerId === sellerId)).toBe(true);
  });

  it('returns all leads for scope:all', async () => {
    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.body.data.length).toBeGreaterThan(sellerLeadCount);
  });
});
```

- **Jeder neue Endpoint:** mindestens 3 Authorization-Tests (no-auth → 401, wrong-permission → 403, correct-permission → 200)
- **Row-Level Filtering:** Testen dass User nur sieht was der Scope erlaubt
- **Privilege Escalation:** Testen dass ein Seller nicht auf Admin-Endpoints zugreifen kann

## Anti-Patterns (vermeiden)

- **`if (user.role === 'admin')`** — Rollen-Checks im Code statt Permission-Checks. Bricht wenn neue Rolle dazukommt.
- **Hardcoded Rollen in Enums** — `enum Role { ADMIN, USER }` im Code. Skaliert nicht, erfordert Deployment für neue Rolle.
- **Permission-Checks im Frontend als Security** — Frontend filtert UI, Backend MUSS trotzdem prüfen. Frontend = UX, Backend = Security.
- **Fehlende Default-Deny** — "Alles erlaubt außer explizit verboten" → Sicherheitslücke bei jedem neuen Endpoint.
- **God-Role ohne Scope** — Eine "Admin"-Rolle die ALLES darf ohne granulare Permissions → unmöglich zu auditieren.
- **Permissions im JWT ohne Cache-Invalidierung** — User bekommt Rolle entzogen, JWT ist noch 15 Min gültig → Session-Invalidierung nötig.
- **Row-Level-Filter vergessen** — `findMany()` ohne Scope-Filter = alle Datensätze sichtbar → systematischer `scopedWhere()` Helper.
