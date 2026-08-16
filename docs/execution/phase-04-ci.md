# Phase 04 — Product/browser CI expansion

**Status:** Pre-implementation feasibility in progress

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

## Feasibility questions

Answered before implementation:

- The selected GitHub-hosted runner supports Node 24 and Playwright 1.62 without a
  runtime workaround.
- Playwright can install and launch its managed full Chromium on the runner.
- GitHub-hosted Chromium can reach the initial English page, search results, and a
  selected lot with HTTP 200 responses.
- The observed hosted failures were not WAF rejection: there was no 401, 403, 429,
  main-document request failure, browser crash, or installation failure.
- The 60-second whole-test ceiling is a proportionate hosted-runner allowance; action,
  navigation, and assertion timeouts remain unchanged.
- The final zero-retry, one-worker run preserved its HTML report, trace, screenshot,
  error context, and bounded diagnostic summary with three-day artifact retention.
- That run failed because the handler's case-sensitive `Accept all` pattern did not
  match the live `Accept All` accessible name. This is a concrete framework defect,
  not live-product instability, infrastructure failure, or target-access rejection.

Open before Phase 04 implementation:

- Correct the known-action matching semantics and extend the network-free contract to
  cover the live title-cased accessible name in a separate implementation session.
- Obtain separately authorized hosted acceptance after that correction; do not repeat
  the production run from this session.
- Is seven-day artifact retention supported and sufficient for the final repository
  settings? The feasibility workflow uses shorter temporary retention only.
- Does GitHub matrix `max-parallel: 1` visibly serialize all four jobs in the eventual
  manual regression workflow?
- Do the final `testMatch` rules keep Firefox/WebKit to the required journey and mobile
  to its scoped case?
- Does the eventual Phase 04 PR make the static-to-browser gate dependency, artifact
  policy, and introduction only after local reliability obvious to reviewers?

## GitHub-hosted Chromium feasibility evidence

Experimented on 2026-08-16 through draft PR #4 and branch
`agent/phase-04-ci-feasibility`. The temporary workflow used one
`ubuntu-latest` job with read-only permissions, Node 24, `npm ci`,
`npx playwright install --with-deps chromium`, and the real committed
`npm run test:smoke`. The project's `chromium` project continued to select
`channel: 'chromium'`; no browser identity, request data, session state, proxy, or
access-control behavior was changed. The feasibility command disabled the existing CI
retry so each workflow run made only one test attempt.

Observed environment and installation evidence was consistent across the runs:

- GitHub-hosted Ubuntu 24.04.4 LTS on x86_64;
- Node 24.19.0 and npm 11.17.0;
- Playwright 1.62.1 installed the required browser and OS dependencies successfully;
- the installed and launched executable was
  `/home/runner/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`, not
  `chromium-headless-shell`.

The smallest initial run,
[31958723439](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31958723439),
received HTTP 200 for the initial `/en/` document, the `Train` results document, and
the selected lot document. It completed the journey and printed the selected lot name,
favourites, and starting bid, but exceeded the existing 30-second whole-test timeout.
Diagnostics classified the failure as `UNKNOWN`, not target rejection. The timeout was
raised to 60 seconds as a legitimate hosted-runner correction without changing action
or navigation timeouts.

The corrected run,
[31958841967](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31958841967),
again received HTTP 200 for `/en/` and `/en/s?q=Train`. A delayed named Usercentrics
panel then intercepted the second-lot click until its 10-second action timeout.
Diagnostics again reported `UNKNOWN`. The initial narrow capability recovery was later
replaced during independent-review follow-up by one fixture-owned, exact-name
Usercentrics locator handler with a two-invocation bound.

The third run,
[31958965786](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31958965786),
installed and launched the same managed full Chromium and received HTTP 200 for the
initial `/en/` document. The initial URL predicate nevertheless timed out after five
seconds while reporting the expected `https://www.catawiki.com/en/` URL, before search
submission. Diagnostics remained `UNKNOWN`; there was no 401, 403, 429, main-document
request failure, browser crash, or installation failure. No further run was made.

After the independent-review corrections and green Node 24 local validation, exactly
one final hosted acceptance run was dispatched:
[31960349299](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31960349299).
It installed and launched managed full Chromium, returned HTTP 200 for `/en/` and
`/en/s?q=Train`, and reached the second-lot action with one worker and zero retries. The
known Usercentrics aside then intercepted the click until the unchanged 10-second action
timeout. The trace proves that the handler registered with a case-sensitive `Accept
all` pattern while the live button's accessible name was `Accept All`, so the handler
did not invoke. The browser exited normally and diagnostics remained `UNKNOWN`.

The temporary workflow successfully uploaded the 22.9 MB
[`phase-04-feasibility-evidence` artifact](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31960349299/artifacts/9267074415)
with the HTML report, trace, screenshot, error context, and bounded diagnostic evidence;
it expires on 2026-08-19. No second production run was launched.

**Feasibility status: pre-implementation feasibility in progress.** GitHub-hosted
reachability is proven, managed full Chromium installation and execution are proven,
and no WAF rejection occurred. The final acceptance run classified the remaining
failure as another concrete framework defect: known-action matching was accidentally
case-sensitive. It did not indicate unsuitable live-product instability,
infrastructure failure, or target-access rejection.

GitHub-hosted CI has not been abandoned, and the state should not be summarized merely
as “Outcome C.” However, GitHub-hosted smoke is not yet proven feasible as a mandatory
gate because the acceptance signal remains unmet. Correct the matching semantics and
obtain one separately authorized acceptance result in a future session before starting
the final Phase 04 gate or artifact architecture. Do not build the broader browser
matrix during this feasibility work.
