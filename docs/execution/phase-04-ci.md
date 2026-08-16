# Phase 04 — Product/browser CI expansion

**Status:** Accepted independent-review findings addressed

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

## Completed hosted feasibility

The pre-implementation investigation completed successfully on 2026-08-16 through
draft PR #4 and branch `agent/phase-04-ci-feasibility`. GitHub-hosted Ubuntu 24.04.4
supported Node 24.19.0 and Playwright 1.62.1 without a runtime workaround. Playwright
installed and launched its managed full Chromium executable through the supported
`channel: 'chromium'` path.

The successful acceptance run,
[31962223174](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31962223174),
ran the real committed `npm run test:smoke` with one worker and zero retries. The
initial English page, `Train` results, and selected-lot main documents all returned HTTP
200, and the mandatory journey passed in 23.4 seconds. No WAF bypass, browser-identity
spoofing, request alteration, proxy, stored session, or other access-control workaround
was required.

Earlier runs provided useful failure evidence rather than target-access failures:

- [31958723439](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31958723439)
  completed the journey but exposed that the 30-second whole-test timeout was too
  narrow for the hosted runner;
- [31958841967](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31958841967)
  exposed delayed Usercentrics interception around lot navigation;
- [31958965786](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31958965786)
  exposed an unnecessarily indirect initial URL predicate;
- [31960349299](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31960349299)
  proved the live `Accept All` capitalization did not match the case-sensitive handler.

Those observations produced durable corrections: a 60-second whole-test ceiling while
preserving narrower action, assertion, and navigation limits; an exact initial URL
assertion; explicit `domcontentloaded` ownership for URL waits; exact selected-lot
continuity; and one fixture-owned Usercentrics locator handler with exact approved
action names, case-insensitive capitalization, normal clicks, default disappearance
waiting, and a two-invocation bound. Network-free fixture contracts cover the handler's
positive, negative, isolation, and exhaustion behavior. Generic failure diagnostics
remain unchanged.

The temporary manual feasibility workflow, its special console evidence switch, and
its experiment-only artifact path were removed after the question was answered.
Historical evidence remains here instead of as a permanently executable experiment.

## Phase 04 implementation evidence

Draft PR #5 on `ci/production-test-strategy` extends the original workflow rather than
replacing it. The static job retains read-only permissions, npm caching, concurrency
cancellation, `npm ci`, and `npm run check`. `Chromium @smoke` declares
`needs: quality`, installs only managed Chromium, and runs the real `@smoke` with one
worker.

- [31963527059](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31963527059)
  ran Node 24.19.0, completed static quality first, then passed the real Train smoke in
  20.5 seconds with zero retries. Its clean run skipped artifact upload.
- [31963622791](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31963622791)
  used a temporary formatting failure. Static quality failed and GitHub recorded the
  dependent Chromium job as skipped with zero steps, so no browser traffic occurred.
- [31963411884](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31963411884)
  used one temporary network-free fixture contract. Attempt zero failed, retry one
  passed, Playwright reported `1 flaky`, and `failOnFlakyTests` kept the job red. Its
  seven-day artifact downloaded successfully and contained the HTML report, first and
  retry traces, failure screenshot, error context, and bounded diagnostics JSON.

Run
[31963766183](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31963766183)
was superseded by a newer PR commit while static checks were running. GitHub cancelled
the stale run and its Chromium job had zero steps, proving the per-PR concurrency group
without adding browser traffic.

Manual dispatch
[31963984150](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31963984150)
created four independently visible jobs. Their execution windows never overlapped:

| Project         | UTC window        | Installed engine | Selected tests         | Result                             |
| --------------- | ----------------- | ---------------- | ---------------------- | ---------------------------------- |
| Chromium        | 18:14:09–18:15:31 | Chromium         | 3 desktop E2E          | passed                             |
| Firefox         | 18:15:33–18:17:28 | Firefox          | mandatory journey only | flaky retry pass; failed by policy |
| WebKit          | 18:17:31–18:18:57 | WebKit           | mandatory journey only | failed both attempts               |
| mobile Chromium | 18:18:58–18:20:26 | Chromium         | 1 mobile spec          | failed both attempts               |

`fail-fast: false` was effective: WebKit and mobile Chromium ran after the Firefox
failure. Chromium passed the broader three-test portfolio. Firefox attempt zero selected
the correct second lot and began the correct navigation request, but the response
stalled through the navigation timeout; its isolated retry completed successfully, so
fail-on-flaky correctly kept the job red. No concrete Firefox automation defect was
identified, and the external cause is not known from the available evidence.

WebKit missed the five-second search-input readiness assertion on both attempts. The
semantic combobox appeared shortly after that budget, establishing an automation-owned
capability-readiness defect rather than a product/browser compatibility defect. Mobile
Chromium exposed a separate automation-owned recovery race: the fixture handler
correctly matched and dismissed delayed `Accept All`, but that interaction collapsed
compact search before the pending Search click completed. All three failures had HTTP
200 main documents and `UNKNOWN` diagnostics. Their seven-day artifacts were
independently named
`regression-firefox-failure-31963984150`,
`regression-webkit-failure-31963984150`, and
`regression-mobile-chromium-failure-31963984150`; the downloaded reports contained
traces, screenshots, error contexts, and bounded diagnostics. The matrix was not
repeated before the evidence was independently reviewed.

Actual job logs show `Contents: read` and implicit `Metadata: read` only, with checkout
credential persistence disabled. No secrets, write permissions, schedule, browser
cache, parallel production traffic, or WAF workaround exists.

GitHub does not discover a new dispatch-only workflow before that workflow exists on
the default branch. To validate before merge, one temporary branch-only `push` trigger
registered the workflow while an event guard forced its regression job to skip. Run
[31963888898](https://github.com/matheusdantascavalcanti/catawiki-qa-automation-assignment/actions/runs/31963888898)
therefore made zero browser requests. The trigger and guard were immediately removed;
the committed workflow is `workflow_dispatch` only.

All controlled validation files and triggers are absent from the final PR diff.

## Independent-review resolution

The accepted findings are addressed without redesigning the approved CI or fixture
architecture:

- manual regression has the dedicated constant concurrency group
  `manual-production-regression` with `cancel-in-progress: false`; matrix
  `max-parallel: 1`, `fail-fast: false`, and dispatch-only execution remain unchanged;
- `HeaderSearch.ensureSearchReady()` gives only its final semantic-combobox visibility
  assertion a ten-second capability-owned budget; global five-second assertions,
  ten-second actions, 30-second navigation, and the 60-second test ceiling remain
  unchanged;
- fixture-owned Usercentrics matching, normal dismissal, and `times: 2` remain intact;
  the fixture privately reports a successful known interaction so `HeaderSearch` can
  recognize the exact collapsed compact state and perform at most one reopen/restore/
  resubmit recovery;
- locally fulfilled, network-free fixture contracts prove the simple path, the observed
  consent-collapse sequence, query restoration, the one-recovery bound, direct second
  failure, unrelated action failure, and arbitrary-dialog isolation;
- Firefox received no timeout, retry, selector, or browser-specific change.

The first required local mobile validation after this correction observed delayed known
consent during initial readiness rather than after query entry. The handler dismissed it
and compact search collapsed before the input became ready. That concrete evidence uses
the same private known-interaction plus collapsed-state predicate for one readiness
reopen; arbitrary visibility failures still surface normally.

Local correction validation used Node 24.19.0 and npm 11.17.0. `npm ci` completed with
zero reported vulnerabilities; `npm run check` passed; all 13 locally fulfilled
fixture-contract executions passed; and Playwright discovery retained the intentional
project scopes. The mandatory Chromium smoke passed once in 5.5 seconds. After the
readiness observation above was addressed, the targeted mobile Chromium test passed in
14.1 seconds. No local retry was enabled for either production test.

The configuration-level concurrency evidence follows the supported
[GitHub Actions concurrency contract](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency):
all manual runs share one workflow-level group, so a new run remains pending behind the
active run, and `cancel-in-progress: false` does not cancel that active run. No second
simultaneous production matrix is required merely to demonstrate that configuration.

Historical Playwright reports and traces may contain normal anonymous request headers,
cookies, or transient WAF/session identifiers. Without beginning Phase 05 or rewriting
history, the private-to-public review must confirm those artifacts have expired or
remove them before repository visibility changes.
