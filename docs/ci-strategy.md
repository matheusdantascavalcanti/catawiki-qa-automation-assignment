# CI/CD strategy

## Purpose

CI should give reviewers fast, trustworthy feedback without treating Catawiki production as an unlimited test environment. Static quality is cheap and deterministic; browser execution is deliberately small, serial, and read-only.

No workflow is created during planning. CI evolves in two deliberate stages so contributor guardrails exist before product automation begins landing, while live production-browser CI is introduced only after the browser suite demonstrates local reliability.

## Stage 1 — Collaboration gate

Phase 01.5 creates the first workflow in the private repository. It runs on pull requests and relevant `main` changes:

```text
npm ci
npm run check
```

This gate is fast, network-free, and useful for every later phase. It uses read-only permissions, npm caching through the lockfile, and concurrency cancellation for superseded PR runs. It installs no browser and sends no request to Catawiki.

The bootstrap workflow itself is introduced through the focused collaboration-foundation PR after the audited Phase 01 baseline is first pushed to private `main`.

## Stage 2 — Product/browser gates

Phase 04 expands rather than replaces Stage 1:

```text
Pull request:
  static quality
  → Chromium mandatory smoke

Manual dispatch:
  risk-based Chromium/Firefox/WebKit/mobile-Chromium regression
```

The Chromium job depends on successful static checks. This avoids production traffic when the change already fails network-free quality controls.

## Contributor commands

The planned final scripts are:

| Command                          | Purpose                                                      | Contacts Catawiki? |
| -------------------------------- | ------------------------------------------------------------ | ------------------ |
| `npm run check`                  | Format check, lint, strict typecheck, browserless unit tests | No                 |
| `npm run test:unit`              | Auction-display parser tests                                 | No                 |
| `npm run test:fixture-contracts` | In-memory fixture/handler browser contracts                  | No                 |
| `npm run test:smoke`             | Required Chromium journey                                    | Yes                |
| `npm run test:regression`        | Explicit configured browser/device portfolio                 | Yes                |
| `npm run test:mobile`            | Mobile Chromium scenario                                     | Yes                |
| `npm run test:a11y`              | Narrow Chromium keyboard/semantics case                      | Yes                |
| `npm run test:ui`                | Interactive Chromium debugging                               | Yes                |

`npm run check` is the normal while-coding command. Before Phase 04 it reproduces the complete PR gate. After Phase 04, `npm run check && npm run test:smoke` reproduces the static plus browser gate for browser-facing changes.

## Playwright failure policy

Use the current supported configuration:

```ts
retries: process.env.CI ? 1 : 0,
retryStrategy: 'isolated',
failOnFlakyTests: !!process.env.CI,
workers: 1,
fullyParallel: false,
```

`retryStrategy: 'isolated'` runs retries at the end, one by one in a single worker. `failOnFlakyTests` makes the process fail if a retry passes, preventing a false-green pipeline. See [Playwright TestConfig](https://playwright.dev/docs/api/class-testconfig#test-config-retry-strategy).

Artifact settings in CI:

```ts
use: {
  trace: 'retain-on-failure-and-retries',
  screenshot: 'only-on-failure',
  video: 'off',
}
```

The trace mode preserves both the original failure and retry evidence for this small suite. Successful non-retry traces are discarded. See [Playwright trace modes](https://playwright.dev/docs/api/class-testoptions#test-options-trace).

The passive diagnostics JSON is also attached to each failed attempt. Retries exist to distinguish a repeatable failure from a flaky one and collect evidence; a retry pass remains a failed quality signal.

## Stage 2 PR and main quality gate

Run on pull requests and main-branch changes:

1. Checkout with minimal credentials/permissions.
2. Set up the selected Node LTS and npm cache.
3. Install with `npm ci`.
4. Run `npm run check`.
5. Install Playwright's managed Chromium browser and required system dependencies.
6. Run `npm run test:smoke` with one worker.
7. Publish HTML report, traces, screenshots, and diagnostic attachments on failure/flakiness.

The smoke gate is Chromium-only and contains the mandatory journey. It extends the existing static workflow; the browser job depends on static success to avoid unnecessary production traffic when code quality already fails.

The Chromium project explicitly uses Playwright's `chromium` channel. This selects the
full managed browser in headless mode; the separate default headless shell received an
initial-document Akamai 403 locally, while the selected channel completed the real spec
across the planned repeat check. `npx playwright install --with-deps chromium` supplies
the required browser in GitHub Actions. Phase 04 feasibility has since proven HTTP 200
reachability without WAF rejection and proven managed full Chromium
installation/execution on GitHub-hosted Ubuntu. Independently reviewed framework
synchronization corrections are being applied, and one final one-worker, zero-retry
acceptance run remains before deciding whether the smoke can become a mandatory gate.

Use a concurrency group keyed by workflow plus pull-request/branch reference and cancel superseded PR runs. This limits stale traffic and keeps feedback relevant.

Recommended workflow permissions:

```yaml
permissions:
  contents: read
```

No secrets, write permissions, deployment environments, or pull-request mutation are needed.

## Pull-request communication and review

Substantial phase PRs use a concise description:

```markdown
## Why

## What changed

## Framework impact

## Validation

## Risks / tradeoffs
```

The template communicates intent rather than creating a compliance checklist. A fresh agent/session reviews the PR before review-driven modification; CI results inform that review but do not replace local product validation or authorize automatic merge. Agent-assisted review is never represented as another human's approval.

## Manual broader regression

Expose a `workflow_dispatch` workflow with independent project results:

```yaml
strategy:
  fail-fast: false
  max-parallel: 1
  matrix:
    project:
      - chromium
      - firefox
      - webkit
      - mobile-chromium
```

This is cleaner than one opaque sequential command because each browser/device has its own status and artifacts, and the matrix is easy to extend. Repeated setup is acceptable for an infrequent manual take-home workflow. `max-parallel: 1` is non-negotiable while targeting public production.

Project scope is risk-based:

- `chromium`: all browser scenarios.
- `firefox`: required assignment journey only.
- `webkit`: required assignment journey only.
- `mobile-chromium`: mobile-specific search scenario only.

The browserless `unit` project runs in `npm run check`, not once per browser matrix entry.

Keep `fail-fast: false`: serial jobs should continue after one browser fails so the manual run yields a complete compatibility picture without increasing concurrency.

## Reports and retention

- Use Playwright's standard HTML reporter; do not add Allure or a custom reporter.
- Give artifacts project-specific names in the manual matrix.
- Retain failure artifacts briefly, proposed seven days, because the repository contains no long-term production observability need.
- Do not upload successful traces.
- Do not merge blob reports: independent project reports provide clearer ownership for four serial jobs.

## Caching

- Use the supported npm cache keyed through the lockfile.
- Begin by installing the required Playwright browser per job.
- Do not cache browser binaries initially: large cache restore/save cost and Playwright-version invalidation can outweigh benefit in this small workflow.
- Revisit only with measured CI timing evidence.

## Scheduling decision

Do not add scheduled/nightly execution against Catawiki production.

Reasons:

- The public take-home has no controlled test data or target availability agreement.
- Scheduled runs create repeated external traffic without an operational owner.
- Auction data and catalogue state are legitimately dynamic.
- A nightly suite is more appropriate against internal staging/pre-production with test accounts, factories, controlled clocks, and service-level contracts.

If working inside Catawiki, the likely model would be broad staging regression, service/API coverage around controlled auctions, concurrency testing in owned environments, and a minimal production smoke—not a public nightly browser matrix.

## Explicit exclusions

- No GitHub deployment job: the repository tests an external service and deploys nothing.
- No scheduled workflow.
- No sharding or multiple network workers.
- No matrix parallelism.
- No browser matrix on every pull request.
- No Docker solely for appearance.
- No external test-management or telemetry integration.
- No fake reviewers, mandatory CODEOWNERS, issue/project-board theatre, semantic-release, changelog/version automation, or complex merge governance.
