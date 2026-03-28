#!/bin/bash
# init-project.sh — Einmalig ausfuehren bei neuem Projekt
# Richtet GitHub Labels, Issue Templates, CI Workflows und Verzeichnisstruktur ein.
#
# Voraussetzungen:
#   - git installiert
#   - gh CLI installiert und authentifiziert (gh auth login)
#
# Usage:
#   bash init-project.sh "my-project"

set -e

PROJECT_NAME=${1:-"my-project"}

echo "Initialisiere Projekt: $PROJECT_NAME"

# --- 1. Git Init ---------------------------------------------------------------

if [ ! -d ".git" ]; then
  git init
  echo "Git initialisiert"
fi

# --- 2. GitHub Repo -------------------------------------------------------------

if ! gh repo view &>/dev/null; then
  gh repo create "$PROJECT_NAME" --private --source=. --push
  echo "GitHub Repo erstellt"
fi

# --- 3. Labels erstellen (8 type + 7 status + 18 skill + 4 priority + 4 size = 41)

echo "Erstelle Labels..."

# Alte Default-Labels entfernen (GitHub erstellt diese automatisch bei neuem Repo)
for label in "bug" "documentation" "duplicate" "enhancement" \
  "good first issue" "help wanted" "invalid" "question" "wontfix"; do
  gh label delete "$label" --yes 2>/dev/null || true
done

# Type (8)
gh label create "type:epic"        --color "8B5CF6" --description "Large feature (has spec file)" --force
gh label create "type:story"       --color "3B82F6" --description "Implementable unit of work" --force
gh label create "type:bug"         --color "EF4444" --description "Something broken" --force
gh label create "type:tech-debt"   --color "F59E0B" --description "Refactoring, cleanup" --force
gh label create "type:spike"       --color "6B7280" --description "Research/investigation" --force
gh label create "type:blocker"     --color "DC2626" --description "Blocks other work" --force
gh label create "type:incident"    --color "7F1D1D" --description "Production incident" --force
gh label create "type:asset"       --color "A78BFA" --description "Design asset needed" --force

# Status (7 — inkl. deferred fuer Sprint-Close bei verschobenen Stories)
gh label create "status:discovery"   --color "E5E7EB" --description "Being defined" --force
gh label create "status:ready"       --color "10B981" --description "DoR met, ready for work" --force
gh label create "status:in-progress" --color "F59E0B" --description "Currently being worked on" --force
gh label create "status:review"      --color "8B5CF6" --description "Code complete, needs review" --force
gh label create "status:done"        --color "059669" --description "Shipped and verified" --force
gh label create "status:blocked"     --color "DC2626" --description "Cannot proceed" --force
gh label create "status:deferred"    --color "9CA3AF" --description "Postponed to later sprint" --force

# Skill — Core (12)
# Reihenfolge: nach Phasen-Aktivierung sortiert (Phase 0 -> Phase 5)
gh label create "skill:project-lead" --color "0EA5E9" --description "Project Lead" --force
gh label create "skill:requirements" --color "A855F7" --description "Requirements Engineer" --force
gh label create "skill:architect"    --color "14B8A6" --description "Software Architect" --force
gh label create "skill:design"       --color "F472B6" --description "Frontend Designer" --force
gh label create "skill:security"     --color "BE123C" --description "Security Engineer" --force
gh label create "skill:frontend"     --color "06B6D4" --description "Frontend Engineer" --force
gh label create "skill:backend"      --color "8B5CF6" --description "Backend Engineer" --force
gh label create "skill:database"     --color "F97316" --description "Database Engineer" --force
gh label create "skill:devops"       --color "6366F1" --description "DevOps Engineer" --force
gh label create "skill:qa"           --color "EC4899" --description "QA Test Engineer" --force
gh label create "skill:challenge"    --color "EF4444" --description "Devil's Advocate / Challenge Engineer" --force
gh label create "skill:retro"        --color "7C3AED" --description "Retrospective Engineer" --force

# Skill — Optional Plugins (6)
gh label create "skill:game"         --color "EAB308" --description "Game Engineer (optional)" --force
gh label create "skill:content"      --color "D946EF" --description "Content Strategist (optional)" --force
gh label create "skill:docs"         --color "34D399" --description "Documentation Writer (optional)" --force
gh label create "skill:perf"         --color "F43F5E" --description "Performance Engineer (optional)" --force
gh label create "skill:audio"        --color "818CF8" --description "Immersive Audio Engineer (optional)" --force
gh label create "skill:a11y"         --color "2DD4BF" --description "Accessibility Engineer (optional)" --force

# Priority (4)
gh label create "priority:P0" --color "DC2626" --description "Critical - do now" --force
gh label create "priority:P1" --color "F97316" --description "High - this sprint" --force
gh label create "priority:P2" --color "F59E0B" --description "Medium - next sprint" --force
gh label create "priority:P3" --color "6B7280" --description "Low - backlog" --force

# Size (4)
gh label create "size:S"  --color "D1FAE5" --description "4h or less" --force
gh label create "size:M"  --color "FEF3C7" --description "4h to 2 days" --force
gh label create "size:L"  --color "FEE2E2" --description "2 to 3 days" --force
gh label create "size:XL" --color "DC2626" --description "Over 3 days - split this!" --force

echo "Labels erstellt (8 type + 7 status + 18 skill + 4 priority + 4 size = 41 labels)"

# --- 4. Issue Templates ----------------------------------------------------------

mkdir -p .github/ISSUE_TEMPLATE

cat > .github/ISSUE_TEMPLATE/epic.md << 'EOF'
---
name: Epic
about: Large feature with multiple stories
labels: ["type:epic", "status:discovery"]
---

## Epic: [Name]

**Spec:** `features/PROJ-[N]-[name].md`
**Priority:** P0 / P1 / P2 / P3

### Problem
[Was wird geloest und fuer wen]

### Stories
- [ ] #XX [Story-Titel] (S/M/L)

### Acceptance Criteria (Epic-Level)
- [ ] [Uebergreifendes AC]

### Out of Scope
- [Was dieses Epic NICHT beinhaltet]

### Security
- [ ] PII involved? [yes/no]
- [ ] New auth flow? [yes/no]
- [ ] If yes: `/security` review needed before implementation
EOF

cat > .github/ISSUE_TEMPLATE/story.md << 'EOF'
---
name: Story
about: Implementable unit of work
labels: ["type:story", "status:discovery"]
---

## Story: [Titel]

**Epic:** #[Epic-Number]
**Size:** S / M / L
**Skill:** frontend / backend / database / design / security / fullstack

### Acceptance Criteria
- [ ] Given [precondition], When [action], Then [result]

### Edge Cases
- [ ] [Empty state]
- [ ] [Error state]

### NFRs
- Performance: [target]
- A11y: [requirement]
- Security: [requirement]

### Test Data
- [Fixtures needed]

### Design
- [ ] Design tokens used (no hardcoded values)
- [ ] Responsive tested (320px-1440px)
- [ ] Dark mode (if applicable)
EOF

cat > .github/ISSUE_TEMPLATE/bug.md << 'EOF'
---
name: Bug
about: Something isn't working
labels: ["type:bug"]
---

## Bug: [Kurzbeschreibung]

**Severity:** P0 / P1 / P2 / P3
**Affected Area:** [Component/Endpoint]

### Steps to Reproduce
1. [Step]

### Expected Behavior
[Was sollte passieren]

### Actual Behavior
[Was passiert]

### Error Details
```
[Fehlermeldung]
```

### Environment
- Browser/OS: [e.g. Chrome 121, macOS]
- Version/Commit: [e.g. main@abc123]
EOF

cat > .github/ISSUE_TEMPLATE/security.md << 'EOF'
---
name: Security Finding
about: Security vulnerability or concern
labels: ["type:bug", "skill:security"]
---

## Security Finding: [Kurzbeschreibung]

**Severity:** P0 (critical) / P1 (high) / P2 (medium) / P3 (low)
**Category:** [OWASP A01-A10 / Auth / Privacy / Dependency]

### Description
[Was wurde gefunden]

### Impact
[Moegliche Auswirkungen]

### Reproduction
[Wie man es nachstellen kann]

### Recommended Fix
[Vorgeschlagene Loesung]

### References
- [CVE / OWASP / CWE Link]
EOF

echo "Issue Templates erstellt (epic, story, bug, security)"

# --- 5. CI Pipeline + Auto-Label (aus Template) ---------------------------------

mkdir -p .github/workflows
echo "CI Pipeline vorhanden (.github/workflows/ci.yml)"
echo "Auto-Label Action vorhanden (.github/workflows/auto-label.yml)"

# --- 6. Tech-Notes (Library-Gotchas, Breaking Changes) --------------------------

mkdir -p docs
if [ ! -f "docs/tech-notes.md" ]; then
  cat > docs/tech-notes.md << 'TECHEOF'
# Tech Notes — Library-Gotchas & Breaking Changes

> Dieses Dokument wird bei jedem Skill-Start gelesen (Pre-Flight Check).
> Hier werden versionsspezifische Eigenheiten, Breaking Changes und
> Workarounds dokumentiert, die sonst zu wiederholten Fehlern fuehren.

## Wie benutzen
- **Jeder Skill** liest diese Datei bei Aktivierung
- **Eintraege hinzufuegen** wenn ein Library-spezifischer Fehler > 1 Roundtrip kostet
- **Format:** Library + Version, Was ist anders, Wie loesen
- **Aufraeumen** wenn eine neue Major-Version die alte abloest

## Eintraege

_Noch keine Eintraege. Werden waehrend der Entwicklung ergaenzt._

<!-- Beispiel-Format:
### React 19
- setState in useEffect ist strenger

### Zod v4
- .errors heisst jetzt .issues auf ZodError-Objekten
-->
TECHEOF
  echo "docs/tech-notes.md erstellt"
fi

# --- 7. Verzeichnisstruktur sicherstellen ----------------------------------------

# Core docs directories
mkdir -p docs/adr
mkdir -p docs/contracts
mkdir -p docs/security
mkdir -p docs/architecture
mkdir -p docs/quality
mkdir -p docs/requirements
mkdir -p docs/runbooks/post-mortem

# Optional Plugin directories (erstellt leer — werden bei Plugin-Aktivierung befuellt)
mkdir -p docs/retro
mkdir -p docs/design
mkdir -p docs/audio
mkdir -p docs/content/patterns
mkdir -p docs/content/decisions
mkdir -p docs/content/briefs
mkdir -p docs/documentation/decisions
mkdir -p docs/performance/reports
mkdir -p docs/performance/baselines
mkdir -p docs/performance/decisions
mkdir -p docs/a11y
mkdir -p docs/skills

# Feature specs + Scripts + Tests
mkdir -p features
mkdir -p scripts
mkdir -p tests

# .gitkeep for empty directories
for dir in docs/architecture docs/audio docs/design docs/documentation/decisions \
  docs/quality docs/requirements docs/a11y docs/skills \
  docs/performance/reports docs/performance/baselines docs/performance/decisions \
  scripts tests; do
  if [ -z "$(ls -A "$dir" 2>/dev/null)" ]; then
    touch "$dir/.gitkeep"
  fi
done

# --- 8. Index- und Scaffold-Dateien (idempotent — nur wenn nicht vorhanden) ------

if [ ! -f "features/INDEX.md" ]; then
  cat > features/INDEX.md << 'EOF'
# Feature Index
> Grosse Epics haben Spec-Files hier. Tracking laeuft ueber GitHub Issues.

| ID | Feature | Issue | Spec File | Status |
|----|---------|-------|-----------|--------|
EOF
  echo "features/INDEX.md erstellt"
fi

if [ ! -f "docs/adr/README.md" ]; then
  cat > docs/adr/README.md << 'EOF'
# Architecture Decision Records (ADRs)

> All architecture decisions are documented here.
> Use `ADR-XXXX-[scope]-[topic].md` naming convention.
> Scoped prefixes: `db:`, `fe:`, `be:`, `devops:`, `game:`, `process:`

## Index

| ADR | Decision | Status | Date |
|-----|----------|--------|------|
EOF
  echo "docs/adr/README.md erstellt"
fi

if [ ! -f "docs/contracts/README.md" ]; then
  cat > docs/contracts/README.md << 'EOF'
# API Contracts

> OpenAPI, AsyncAPI specs and performance budgets.
> Single Source of Truth for API shapes — Frontend and QA reference these.

## Files

| Contract | Format | Description |
|----------|--------|-------------|
| `api-v1.yaml` | OpenAPI 3.1 | REST API specification |
| `PERF-BUDGETS.md` | Markdown | Performance budgets (API latency, DB queries, CWV) |
EOF
  echo "docs/contracts/README.md erstellt"
fi

if [ ! -f "docs/security/README.md" ]; then
  cat > docs/security/README.md << 'EOF'
# Security Documentation

> Threat models, privacy checkpoints, and security findings.
> Created by `/security` (Security Engineer Skill).

## Files

| Document | Description |
|----------|-------------|
| `threat-model-[feature].md` | STRIDE-based threat model per feature |
| `privacy-checkpoint-[feature].md` | PII/DSGVO privacy assessment |
EOF
  echo "docs/security/README.md erstellt"
fi

if [ ! -f "docs/retro/INDEX.md" ]; then
  cat > docs/retro/INDEX.md << 'EOF'
# Retro Index

> Alle Retrospektiven dieses Projekts — chronologisch, mit Action Item Status.
> **Nach jeder Retro:** Neuen Eintrag hinzufuegen + offene Action Items aktualisieren.

## Retros

| Datum | Scope | Typ | Commits | Issues geschlossen | Offene Action Items | Datei |
|-------|-------|-----|---------|-------------------|---------------------|-------|
| _noch keine_ | — | — | — | — | — | — |

## Offene Action Items (kumulativ)

| Issue | Prioritaet | Aus Retro | Beschreibung | Status |
|-------|-----------|-----------|--------------|--------|
| _noch keine_ | — | — | — | — |

**Template:** `docs/retro/TEMPLATE.md` oder `docs/retro/TEMPLATE-LIGHT.md`
**Naming:** `RETRO-[YYYY-MM-DD]-[scope].md`
EOF
  echo "docs/retro/INDEX.md erstellt"
fi

if [ ! -f "docs/rules-index.md" ]; then
  cat > docs/rules-index.md << 'EOF'
# Rule Files — Uebersicht

Projekt-spezifische Engineering-Standards in `.claude/rules/`.
Vollstaendige Referenz und Phase-Mapping: siehe WORKFLOW.md.
EOF
  echo "docs/rules-index.md erstellt"
fi

# --- 9. .claudeignore (Context-Window-Schutz) -----------------------------------

if [ ! -f ".claudeignore" ]; then
  cat > .claudeignore << 'EOF'
# Claude Code — Auto-Context Exclusions
# Diese Dateien werden von Claude Code nicht automatisch in den Kontext geladen.
# Explicit Read-Tool-Aufrufe durch Skills funktionieren weiterhin.

# Grosse Skill-Referenz-Dokumentation (~820 KB)
# Wird von Skills on-demand gelesen, nicht bei Session-Start benoetigt.
docs/skills/

# Performance-Reports und Baselines (werden nur beim /perf Skill benoetigt)
docs/performance/reports/
docs/performance/baselines/
EOF
  echo ".claudeignore erstellt"
fi

# --- 10. SECURITY.md -------------------------------------------------------------

if [ ! -f "SECURITY.md" ]; then
  cat > SECURITY.md << 'EOF'
# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub Issue
2. Email: **[UPDATE: security@your-domain.com]**
3. Include: description, reproduction steps, impact assessment
4. Expected response time: 48 hours

> **Template Note:** Update the email address above before publishing this project.

## Security Practices

This project follows security best practices defined by the Security Engineer skill:

- OWASP Top 10 controls
- DSGVO/GDPR compliance for personal data
- Dependency auditing via Dependabot
- Security headers on all responses
- Input validation on all external inputs
- Secrets managed via environment variables (never committed)

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | Yes       |
| < latest | No       |
EOF
  echo "SECURITY.md erstellt"
fi

# --- Done -----------------------------------------------------------------------

echo ""
echo "Projekt-Setup abgeschlossen!"
echo ""
echo "Erstellt:"
echo "  - 41 GitHub Labels (8 type + 7 status + 18 skill + 4 priority + 4 size)"
echo "  - 4 Issue Templates (epic, story, bug, security)"
echo "  - Verzeichnisstruktur (docs/, features/, scripts/, tests/)"
echo "  - Scaffold-Dateien (tech-notes, INDEX files, README files)"
echo "  - .claudeignore (Context-Window-Schutz)"
echo "  - SECURITY.md (Security Policy)"
echo ""
echo "Naechste Schritte:"
echo "  1. CLAUDE.md ausfuellen (Projektname, Tech Stack, Status)"
echo "  2. In Claude Code: /pm Ich moechte [Idee] bauen"
echo "  3. Der PM-Skill erstellt Epics + Stories als GitHub Issues"
