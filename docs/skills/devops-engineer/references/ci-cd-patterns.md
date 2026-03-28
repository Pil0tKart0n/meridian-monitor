# CI/CD Patterns Reference

Detailed patterns for CI/CD pipelines. Supplement to the main SKILL.md §1.

---

## Pipeline Caching Strategies

Effective caching is the biggest single improvement for CI speed.

### Node.js (npm/pnpm)

```yaml
# GitHub Actions example
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
    restore-keys: npm-${{ runner.os }}-
```

### Python (pip)

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: pip-${{ runner.os }}-${{ hashFiles('**/requirements*.txt') }}
```

### Docker Layer Caching

```yaml
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Terraform

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.terraform.d/plugin-cache
      .terraform/providers
    key: tf-${{ runner.os }}-${{ hashFiles('**/.terraform.lock.hcl') }}
```

**Rules:**
- Cache key includes lockfile hash (invalidate when dependencies change).
- Use `restore-keys` for partial matches (faster than cold start).
- Monitor cache hit rate. Below 70% → review key strategy.

---

## Monorepo vs Polyrepo CI

### Monorepo (recommended for small–medium teams)

```yaml
# Path-filtered pipelines — only run what changed
on:
  push:
    paths:
      - 'services/api/**'
      - 'packages/shared/**'  # shared code triggers all consumers
```

**Advantages:** Atomic cross-service changes, shared CI config, simpler dependency management.
**Challenges:** CI must be path-aware. Use tools like Nx, Turborepo, or Bazel for smart rebuilds.

### Polyrepo

**Advantages:** Independent release cycles, smaller repos, team autonomy.
**Challenges:** Cross-repo changes require coordination. Contract tests become critical.

**Recommendation:** Start monorepo. Split only when team size or release cadence diverges significantly.

---

## Artifact Management

### Container Image Tagging Strategy

```
registry.example.com/service-name:sha-abc1234       # Always — immutable reference
registry.example.com/service-name:v1.2.3             # On release — semver
registry.example.com/service-name:latest              # NEVER in production
```

**Rules:**
- Production deploys reference SHA tags (immutable).
- SemVer tags applied on release (for human readability, changelogs).
- Never use `:latest` for production. Always explicit version.
- Retention: Keep last 30 SHA tags + all SemVer tags. Auto-clean older SHA tags.

### Artifact Attestation

```bash
# Sign container image with cosign
cosign sign --key cosign.key registry.example.com/service:sha-abc1234

# Attach SBOM
cosign attach sbom --sbom sbom.spdx.json registry.example.com/service:sha-abc1234

# Verify on deploy
cosign verify --key cosign.pub registry.example.com/service:sha-abc1234
```

---

## Deployment Automation Patterns

### Canary with Automated Rollback

```yaml
# Argo Rollouts strategy (Kubernetes)
apiVersion: argoproj.io/v1alpha1
kind: Rollout
spec:
  strategy:
    canary:
      steps:
        - setWeight: 5      # 5% traffic
        - pause: { duration: 5m }
        - analysis:           # Check SLO metrics
            templates:
              - templateName: success-rate
            args:
              - name: service-name
                value: api
        - setWeight: 25
        - pause: { duration: 10m }
        - analysis:
            templates:
              - templateName: success-rate
        - setWeight: 100     # Full rollout
```

### Blue/Green with Traffic Switch

```yaml
# Two deployments, one active service selector
spec:
  strategy:
    blueGreen:
      activeService: api-active
      previewService: api-preview
      autoPromotionEnabled: false  # Manual approval
      prePromotionAnalysis:
        templates:
          - templateName: smoke-tests
```

### Feature Flag Deploy (deploy ≠ release)

```yaml
# Deploy code with flag OFF → verify in prod → enable flag gradually
# 1. Deploy: code goes to prod, feature flag is OFF
# 2. Verify: check for errors, no side effects
# 3. Enable: turn on for 1% → 10% → 100%
# 4. Cleanup: remove flag + old code path after full rollout
```

---

## Pipeline Optimization

### Speed Targets

| Pipeline type | Target | Strategy |
|--------------|--------|----------|
| **PR check** | < 5 min | Parallel stages, aggressive caching, skip unchanged modules |
| **Main build** | < 10 min | Full test suite, build artifacts, publish |
| **Deploy (staging)** | < 3 min | Pre-built artifact, rolling/canary |
| **Deploy (prod)** | < 10 min | Canary with analysis windows |

### Common Bottlenecks and Fixes

| Bottleneck | Fix |
|-----------|-----|
| Slow dependency install | Cache `node_modules`/pip cache, use lockfile |
| Docker build slow | Multi-stage, layer caching, BuildKit |
| Test suite slow | Parallel test runners, split by module |
| Large repo checkout | Shallow clone (`depth: 1`), sparse checkout |
| Sequential stages | Run lint+typecheck+test in parallel |
| Flaky tests | Quarantine → fix. Never skip. Track flake rate. |

### Parallelism Pattern (GitHub Actions)

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [...]

  typecheck:
    runs-on: ubuntu-latest
    steps: [...]

  test-unit:
    runs-on: ubuntu-latest
    steps: [...]

  test-integration:
    needs: [lint, typecheck]  # Wait for fast checks first
    runs-on: ubuntu-latest
    steps: [...]

  build:
    needs: [test-unit, test-integration]
    runs-on: ubuntu-latest
    steps: [...]
```

---

## Branch Protection & Merge Rules

### Recommended Branch Protection (main)

| Rule | Setting |
|------|---------|
| Required reviews | ≥ 1 (2 for infra changes) |
| Required status checks | lint, test, security, build |
| Up-to-date branch | Required (prevent merge conflicts) |
| Force push | Blocked |
| Deletion | Blocked |
| Linear history | Recommended (squash merge) |

### Trunk-Based Development

```
main ←──── short-lived feature branches (< 2 days)
  │
  ├── feature/add-user-api (PR → merge → delete)
  ├── fix/connection-leak (PR → merge → delete)
  └── infra/upgrade-k8s (PR → merge → delete)
```

**Rules:**
- Feature branches live < 2 days. Longer = split into smaller PRs.
- No long-lived branches (no `develop`, no `release/*` in trunk-based).
- Feature flags for incomplete work that must merge to main.
- Releases are tags on main, not branches.

---

## Environment Promotion Pattern

```
Code merge → Build artifact → Deploy to dev (auto)
                                    ↓
                            Deploy to staging (auto, smoke tests)
                                    ↓
                            Deploy to prod (approval + canary)
```

**Key rule:** Same artifact through all environments. Never rebuild for prod. Only configuration changes between environments.
