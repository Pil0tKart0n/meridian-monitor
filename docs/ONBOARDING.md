# Onboarding Guide

> Erste 30 Minuten für neue Entwickler oder neue Claude-Code-Sessions.

## 1. Projekt klonen & einrichten

```bash
git clone [repo-url]
cd [project-name]
npm install
cp .env.example .env.local   # Env-Variablen anpassen
npm run dev                   # Dev-Server starten
```

## 2. Projekt verstehen (5 Minuten lesen)

| Datei | Was du erfährst |
|-------|----------------|
| `CLAUDE.md` | Tech Stack, Status, Conventions, aktuelle Phase |
| `CLAUDE.md` § Phase Log | Was bisher passiert ist, Key Decisions |
| `WORKFLOW.md` | Wie die 12 Core Skills + 6 Optional Plugins zusammenarbeiten |
| `docs/tech-notes.md` | Library-Gotchas, bekannte Workarounds |

## 3. Architektur verstehen (bei Bedarf)

| Datei | Was du erfährst |
|-------|----------------|
| `docs/adr/` | Architektur-Entscheidungen (Tech-Stack, Auth, DB) |
| `docs/contracts/api-v1.yaml` | API-Spezifikation (OpenAPI) |
| `docs/contracts/PERF-BUDGETS.md` | Performance-Ziele |
| `docs/security/` | Threat Models, Privacy Checkpoints |
| `features/INDEX.md` | Feature-Übersicht mit Specs |

## 4. Regeln kennen

```bash
# Alle Regel-Dateien auf einen Blick (Phase- + Skill-Mapping)
cat docs/rules-index.md
```

Die wichtigsten Regeln:
- **Commit-Cadence:** 1 logische Änderung = 1 Commit + Push. Max ~10 Dateien.
- **Test-Execution:** Tests werden AUSGEFÜHRT, nicht nur geschrieben.
- **Issue-Referenz:** Jeder Commit enthält `Closes #N` oder `Refs #N`.
- **TypeScript strict:** Kein `any`, kein `as`.

## 5. Erste Aufgabe starten

### Mit Claude Code
```bash
# Nächste offene Story finden
gh issue list --label "status:ready" --milestone "Sprint 1" --limit 1

# Story starten
gh issue edit #N --remove-label "status:ready" --add-label "status:in-progress"

# Claude Code aktivieren und Story bearbeiten
# Claude liest automatisch CLAUDE.md und die relevanten Skills
```

### Manuell
```bash
# Branch erstellen
git checkout -b feat/short-description

# Entwickeln, testen, committen
npm run typecheck && npm run lint && npm run test
git commit -m "feat(scope): description

Closes #N"
git push -u origin feat/short-description
```

## 6. Nützliche Befehle

```bash
# Entwicklung
npm run dev          # Dev-Server (http://localhost:3000)
npm run build        # Production Build
npm run typecheck    # TypeScript prüfen
npm run lint         # ESLint prüfen
npm run test         # Tests ausführen

# Git & GitHub
gh issue list --state open                    # Offene Issues
gh issue list --milestone "Sprint 1"          # Sprint-Übersicht
gh pr create --title "feat: ..." --body "..." # Pull Request erstellen
```

## 7. Häufige Fragen

**Welcher Skill macht was?**
→ Siehe `CLAUDE.md` § Skills System oder `WORKFLOW.md`

**Warum schlägt der Build fehl?**
→ Prüfe `docs/tech-notes.md` für bekannte Library-Gotchas

**Wo finde ich die API-Spezifikation?**
→ `docs/contracts/api-v1.yaml`

**Wie starte ich ein neues Feature?**
→ `/requirements` erstellt Stories, `/architecture` definiert Contracts

**Was tun bei einem Bug in Production?**
→ Siehe `docs/runbooks/incident-template.md` für Incident-Ablauf

## 8. MCP Server Setup (Playwright + weitere)

### Playwright MCP (Pflicht für UI-Projekte)

Playwright MCP ermöglicht visuelle UI-Checks, Accessibility-Audits und Responsive-Tests direkt aus Claude Code.

**Installation (alle Plattformen):**
```bash
npm install -g @playwright/mcp
npx playwright install chromium
```

**macOS/Linux (Default — bereits in `.claude/settings.json` vorkonfiguriert):**
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp", "--headless"]
    }
  }
}
```

**Windows-spezifische Konfiguration:**

> Windows kann `npx` nicht direkt als MCP-Command spawnen. Die Projekt-Datei `.claude/settings.json` enthält den macOS/Linux-Default. Auf Windows muss der MCP-Server in `.claude/settings.local.json` (gitignored, pro Entwickler) überschrieben werden.

```json
// .claude/settings.local.json (NICHT einchecken — ist gitignored)
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": [
        "C:/Users/USERNAME/AppData/Roaming/npm/node_modules/@playwright/mcp/cli.js",
        "--headless"
      ]
    }
  }
}
```

**Wichtig:**
- Forward Slashes (`/`) in JSON-Pfaden, nicht Backslashes
- `--headless` Flag ist mandatory für MCP Server
- USERNAME durch deinen Windows-Benutzernamen ersetzen
- **Nur** `.claude/settings.local.json` ändern — nicht die eingecheckte `.claude/settings.json`

**Verifizierung:**
Starte Claude Code neu und prüfe ob `browser_navigate`, `browser_snapshot`, `browser_take_screenshot` als Tools verfügbar sind.

**Belegt:** ElektroVorteil brauchte 5 Sessions für die Windows-Konfiguration — diese Anleitung verhindert das.

### Context7 MCP (Empfohlen — verhindert veraltete API-Nutzung)

Context7 fetcht aktuelle Library-Dokumentation in den Kontext. Statt aus dem Training zu raten, arbeitet Claude gegen die echte Doku der exakten Version (Next.js 15, Prisma v6, shadcn/ui etc.).

```json
// In .claude/settings.json oder ~/.claude/settings.json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

**Keine Konfiguration nötig** — funktioniert out-of-the-box.

### GitHub MCP (Optional — für erweiterte GitHub-Integration)

Der [offizielle GitHub MCP Server](https://github.com/github/github-mcp-server) bietet 87 strukturierte Tools für Repos, Issues, PRs, Actions, Dependabot und Code Search.

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<dein-github-pat>"
      }
    }
  }
}
```

**Voraussetzung:** GitHub Personal Access Token mit `repo`, `issues`, `actions` Scopes.

> **Hinweis:** Für die meisten Workflows reicht `gh` CLI (bereits in den Permissions). Der MCP Server lohnt sich bei Multi-Repo-Projekten oder wenn strukturierte GitHub-Daten (Dependabot Alerts, Code Search) benötigt werden.

### Empfohlene weitere MCP Server

| MCP Server | Zweck | Wann nutzen |
|------------|-------|-------------|
| **Playwright** | Visual Testing, Accessibility, Responsive Checks | Jedes UI-Projekt (Pflicht) |
| **Context7** | Aktuelle Library-Docs in Kontext laden | Immer empfohlen |
| **PixelLab** | Pixel-Art-Generierung (Characters, Tilesets) | Spiele mit Pixel-Art-Grafik |
| **GitHub** | 87 strukturierte GitHub-Tools (Issues, PRs, Actions, Search) | Multi-Repo, erweiterte GH-Integration |
| **Sequential Thinking** | Strukturiertes Reasoning für komplexe Entscheidungen | Architektur-Entscheidungen, Threat Models |

## 9. Hilfe holen

- `docs/adr/` — Architektur-Entscheidungen nachlesen
- `docs/contracts/` — API-Spezifikationen
- `docs/tech-notes.md` — Bekannte Probleme und Workarounds
- GitHub Issues — Offene Aufgaben und Diskussionen
