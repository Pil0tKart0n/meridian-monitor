# Skill System Index (12 Core + 6 Optional Plugins)

## Command → Skill → Reference Mapping

| # | Command | Skill Name | Mode | GitHub Label | Reference Docs |
|---|---------|-----------|------|--------------|----------------|
| 1 | `/pm` | Project Lead | Inline | `skill:project-lead` | `docs/skills/project-lead/` |
| 2 | `/requirements` | Requirements Engineer | Inline | `skill:requirements` | `docs/skills/requirements-engineer/` |
| 3 | `/architecture` | Software Architect | Inline | `skill:architect` | `docs/skills/software-architect/` |
| 4 | `/design` | Frontend Designer | Sub-Agent | `skill:design` | `docs/skills/frontend-designer/` |
| 5 | `/security` | Security Engineer | Inline | `skill:security` | `docs/skills/security-engineer/` |
| 6 | `/frontend` | Frontend Engineer | Sub-Agent | `skill:frontend` | `docs/skills/frontend-engineer/` |
| 7 | `/backend` | Backend Engineer | Sub-Agent | `skill:backend` | `docs/skills/backend-engineer/` |
| 8 | `/database` | Database Engineer | Sub-Agent | `skill:database` | `docs/skills/database-engineer/` |
| 9 | `/devops` | DevOps Engineer | Sub-Agent | `skill:devops` | `docs/skills/devops-engineer/` |
| 10 | `/qa` | QA Test Engineer | Sub-Agent | `skill:qa` | `docs/skills/qa-test-engineer/` |
| 11 | `/game` | Game Engineer | Sub-Agent (Optional Plugin) | `skill:game` | `docs/skills/browser-multiplayer-game-engineer/` |
| 12 | `/challenge` | Devil's Advocate | Inline | `skill:challenge` | — (kein Reference Doc, nur Wrapper) |
| 13 | `/retro` | Retrospective Engineer | Inline | `skill:retro` | — (kein Reference Doc, nur Wrapper) |
| 14 | `/content` | Content Strategist | Inline (Optional Plugin) | `skill:content` | `docs/skills/content-strategist/` |
| 15 | `/docs` | Documentation Writer | Inline (Optional Plugin) | `skill:docs` | `docs/skills/documentation-writer/` |
| 16 | `/perf` | Performance Engineer | Inline (Optional Plugin) | `skill:perf` | `docs/skills/performance-engineer/` |
| 17 | `/audio` | Immersive Audio Engineer | Sub-Agent (Optional Plugin) | `skill:audio` | `docs/skills/audio-engineer/` |
| 18 | `/a11y` | Accessibility Engineer | Inline (Optional Plugin) | `skill:a11y` | `docs/skills/accessibility-engineer/` |

## Naming Convention

- **Command:** Short verb or noun, used in chat (`/pm`, `/frontend`)
- **Skill Name:** Full role title, used in documentation
- **Wrapper:** `.claude/skills/<command>/SKILL.md` — activated by Claude Code
- **Reference:** `docs/skills/<skill-name>/SKILL.md` — deep knowledge base
- **Label:** `skill:<identifier>` — used on GitHub Issues for ownership

## Mode

- **Inline:** Runs in the main conversation (decisions, strategy, reviews)
- **Sub-Agent:** Runs autonomously in a sandboxed context (coding, testing)
