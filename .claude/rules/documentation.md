# Documentation Rules

## Documentation Lifecycle (HARD RULE)
- Every user-visible feature MUST have corresponding documentation (README, guide, or API docs)
- Documentation is written DURING build phase, not after release
- A feature without documentation is NOT Done (part of DoD when Documentation Writer is activated)
- Stale documentation is worse than no documentation — keep it current or remove it

## Diataxis Classification (HARD RULE)
- Every document MUST be classified before writing: Tutorial, How-to Guide, Reference, or Explanation
- **Never mix types in one document** — a Tutorial that becomes Reference mid-page confuses readers
- If a document needs both Tutorial and Reference content → create two documents and link them
- Classification determines template, tone, and structure

## Accuracy (HARD RULE)
- No unverified claims — every statement must be checkable against current code
- **Code examples MUST compile and run** — untested examples rot and erode trust
- Code examples use realistic variable names — no `foo`, `bar`, `myVar`, `test123`
- Code examples are progressive: simplest first, then add complexity
- When code changes, related documentation MUST be updated in the **same commit**

## API Documentation Coverage (HARD RULE)
- Every public API endpoint MUST be documented
- Per endpoint: summary, parameters, auth requirements, request/response examples, error codes
- Error Code Reference: all error codes with human-readable description + resolution
- OpenAPI spec changes → API documentation update in the same PR

## Freshness (HARD RULE)
- Every document MUST have a freshness trigger (what causes an update)
- Staleness signals are checked per sprint (quick) and per release (full audit)
- **Critical staleness:** Doc contradicts current code → fix same day
- **High staleness:** Feature exists without docs → fix within current sprint
- Documentation inventory (`docs/documentation/INDEX.md`) tracks status per document

## README Standards
- User/Player perspective first, developer perspective second
- Quick Start section: shortest path to a working result (3-5 steps max)
- Features described as benefits ("Du kannst...") not capabilities ("Unterstützt...")
- Tech Stack as table or compact list, not prose
- README MUST reflect current project state — update after features, tech stack changes, phase transitions

## Documentation Structure
- Single canonical location for all documentation (`docs/`)
- No duplicate information — link to single source of truth
- Every document reachable from an index (no orphan documents)
- Internal links verified (lychee or equivalent)
- Navigation aids: table of contents for docs > 3 sections

## Prose Style (when Content Strategist is not activated)
- 2nd person ("You can..." not "The user can...")
- Active voice ("The API returns..." not "A response is returned...")
- Present tense ("This creates..." not "This will create...")
- Short sentences (max ~25 words), short paragraphs (max 3-4 sentences)
- Define jargon on first use or link to glossary
- When Content Strategist IS activated: follow `docs/content/voice-and-tone.md`

## Code Examples
- **Complete:** Copy-paste runnable without modification (include imports, setup)
- **Tested:** Validated against actual API/codebase (ideally in CI via `tests/docs/`)
- **Progressive:** Simplest example first, then complexity
- **Realistic:** Domain-appropriate names, not placeholder values

## Documentation Decision Records (DDRs)
- New documentation type → DDR required
- Documentation tooling change → DDR required
- DDR location: `docs/documentation/decisions/DDR-NNN-[topic].md`
- Format: Context → Decision → Scope → Freshness Policy → Alternatives → Consequences

## Anti-Patterns (avoid)
- **Write-and-forget:** Docs written once, never maintained
- **Docs as afterthought:** "We'll document after launch"
- **Screenshot-heavy docs:** Screenshots rot fastest — prefer text, use sparingly
- **Internal jargon in user docs:** Write for the audience, not for yourself
- **Copy-paste duplication:** Same info in 3 places — link to single source
