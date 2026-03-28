# Content Strategy Artifacts

> Home for all content strategy deliverables. Created and maintained by `/content` (Content Strategist Skill).
> This is the **Single Source of Truth** for voice, tone, terminology, and content patterns.

## Directory Structure

```
docs/content/
  INDEX.md                      ← This file
  voice-and-tone.md             — Voice Profile (NN/G 4-Dimension Scores) + Tone Variation Map
  messaging-hierarchy.md        — Primary/Secondary/Tertiary Messaging Architecture
  terminology.md                — Glossary (preferred terms, rejected synonyms, i18n key prefixes)
  patterns/                     — Reusable Content Patterns (per component type)
    error-messages.md            — Error message templates (Description + Reason + Resolution)
    empty-states.md              — First-use / No-results / Cleared templates
    buttons-and-ctas.md          — Button label conventions (verb-first, specific outcome)
    notifications.md             — Notification copy patterns (4 types)
    forms.md                     — Labels, placeholders, help text, validation messages
    onboarding.md                — Welcome flows, first-use guidance, tooltips
  decisions/                    — Content Decision Records (CDRs)
    CDR-NNN-title.md             — Individual content decisions (voice, terminology, patterns)
  briefs/                       — Per-feature Content Briefs (optional, can live in GitHub Issues)
    PROJ-N-feature-name.md       — Content spec for a specific story/feature
```

## How to Use

### For Content Strategist (`/content`)
- Create and maintain all files in this directory
- Update `voice-and-tone.md` when brand/product voice evolves
- Create CDRs for terminology changes, voice changes, new content patterns
- Write content briefs for user-facing stories before BUILD phase

### For Other Skills
- **Frontend/Backend:** Check `patterns/` before writing user-facing text
- **Requirements:** Use `terminology.md` to align story language with product vocabulary
- **QA:** Validate copy against voice profile and content patterns during VERIFY phase
- **Design:** Reference `voice-and-tone.md` to align visual hierarchy with content hierarchy

## Quick Commands

```bash
ls docs/content/decisions/CDR-*.md    # List all Content Decision Records
ls docs/content/patterns/             # List available content patterns
ls docs/content/briefs/               # List content briefs per feature
```

## Status

_Noch keine Content-Artifacts erstellt — wird bei erster `/content` Aktivierung gestartet._
