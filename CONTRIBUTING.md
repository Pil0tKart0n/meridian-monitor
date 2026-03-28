# Contributing

## Development Process

This project uses a skill engineering system (12 Core + 6 Optional Plugins). See [WORKFLOW.md](./WORKFLOW.md).
For detailed rules see [`docs/rules-index.md`](./docs/rules-index.md).

## Branching

- **Main branch:** `main` (protected, requires PR + review)
- **Feature branches:** `feat/short-description` (short-lived, off `main`)
- **Fix branches:** `fix/bug-description`
- **Strategy:** Trunk-based development with squash merges

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add user authentication
fix(api): resolve 500 on empty payload
docs: update API contract for /users
test: add integration tests for auth flow
refactor(db): extract query builder
perf(frontend): lazy-load dashboard charts
chore: update dependencies
```

Use `Closes #N` in the commit body to auto-close GitHub Issues.

## Pull Requests

- Fill in the PR template completely
- Ensure all CI checks pass (lint, typecheck, tests)
- Request review from the appropriate CODEOWNERS
- Resolve all review comments before merging

## Code Standards

- TypeScript strict mode, no `any`
- ESLint + Prettier formatting
- Co-located tests (`*.test.ts` next to source)
- Design tokens for all visual values (no hardcoded colors/spacing)

## Quality Gates

Before merge:
- [ ] All tests pass
- [ ] Lint clean
- [ ] Typecheck clean
- [ ] No new security warnings
- [ ] Accessibility checks pass (if UI change)
