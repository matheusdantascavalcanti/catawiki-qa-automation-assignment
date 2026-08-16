# Phase 04 — Product/browser CI expansion

**Status:** Not started

## Objective

Expand the existing Phase 01.5 collaboration CI into the final risk-based browser strategy after the local suite is reliable. Keep the established static feedback, make the PR production footprint minimal, and keep broader compatibility manual and serial.

## Prerequisites

- Phase 03 PR reviewed and merged into private `main`.
- Phase 01.5 static PR workflow is working and remains the first gate.
- `npm ci`, `npm run check`, and `npm run test:smoke` pass locally.
- Retry/flaky behavior and failure artifacts verified locally where possible.
- Private GitHub repository and branch/PR workflow are established.

## Files likely affected

- `.github/workflows/quality.yml`
- `.github/workflows/regression.yml`
- `playwright.config.ts`
- `package.json`
- `README.md`

## Implementation tasks

1. Update from private `main`, create `ci/production-test-strategy`, and open a draft focused PR.
2. Preserve the existing Phase 01.5 static job and its minimal `contents: read` permissions.
3. Make the Chromium browser job depend on successful static checks so invalid code does not contact production.
4. Install Chromium only for the PR smoke job and run mandatory `@smoke` with one worker.
5. Enforce one CI retry, `retryStrategy: 'isolated'`, and `failOnFlakyTests`.
6. Publish standard HTML report, traces, screenshots, and bounded diagnostics for failure/flaky results with short retention.
7. Preserve concurrency cancellation for superseded pull-request/branch runs.
8. Create a `workflow_dispatch` regression workflow with matrix projects Chromium, Firefox, WebKit, and mobile Chromium.
9. Set `max-parallel: 1` and `fail-fast: false`; install only the selected project's browser in each matrix job.
10. Give each project an independently named report artifact.
11. Use npm dependency caching through the setup action; do not add browser caching until measurement justifies it.
12. Do not add cron triggers, sharding, blob-report merge, deployment, write permissions, or any WAF bypass.
13. Document how to reproduce both CI stages, read flaky/failure artifacts, and understand why production execution is serial.
14. Keep the PR description current with production-traffic tradeoffs and actual workflow evidence.
15. Ask a fresh review session to inspect permissions, request volume, retry semantics, artifact usefulness, and whether static CI still prevents unnecessary browser execution.
16. Address valid findings, revalidate workflows, and merge only after the CI increment is coherent.

## Validation commands

Before pushing workflow changes:

```bash
npm ci
npm run check
CI=1 npm run test:smoke
```

After pushing to the authorized repository:

- confirm the static job runs before the production smoke;
- confirm one Chromium smoke result appears on the PR;
- dispatch the manual regression once and verify matrix jobs execute serially;
- verify project-specific artifacts can be opened;
- verify a controlled temporary failure makes CI fail even if its retry passes, then immediately restore the test.

## Acceptance criteria

- PR/main gate is static checks plus Chromium smoke only.
- No browser job runs when static checks fail.
- Networked Playwright execution uses one worker.
- Superseded PR runs are cancelled.
- A retry pass is reported as flaky and fails CI.
- Manual matrix jobs are independently visible but never overlap.
- Reports contain concise diagnostics and standard Playwright evidence.
- Workflow permissions are read-only and no secrets are required.
- No schedule or production mutation exists.
- The original static collaboration gate remains intact and runs before browser traffic.
- The Phase 04 PR documents and demonstrates the evolution from network-free checks to conservative product checks.
- A fresh independent agent-assisted review was completed and valid findings were addressed before merge.

## Out of scope

- Deployment/CD to Catawiki.
- Nightly/scheduled regression.
- Parallel matrix execution, multiple workers, or sharding.
- Docker, external dashboards, Allure, test-management publishing.
- Browser cache optimization without measured need.
- Replacing or weakening the Phase 01.5 static gate.

## Questions to answer before proceeding

- Does the selected GitHub runner image support Node 24 and Playwright 1.62 without workarounds?
- Is seven-day artifact retention supported and sufficient for the repository settings?
- Does GitHub matrix `max-parallel: 1` visibly serialize all four jobs in the actual workflow?
- Do the final `testMatch` rules keep Firefox/WebKit to the required journey and mobile to its scoped case?
- Does the PR make it obvious that browser CI was introduced only after local suite reliability was established?
