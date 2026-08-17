# Catawiki QA automation assignment

This repository is a risk-based Playwright and TypeScript automation framework for
Catawiki's public, read-only buyer experience. The mandatory scenario searches for
`Train` with the magnifier button, captures the second actual lot, proves that exact
lot opened, and prints its live name, favourites count, and displayed auction
state/value.

## Quick start

The shortest reviewer path is:

```bash
nvm use 24
npm ci
npx playwright install chromium
npm run test:smoke
```

`test:smoke` contacts Catawiki production. It is anonymous, read-only, and configured
for one worker; run it deliberately rather than from a watch task or automatic hook.
The project requires Node `>=24 <25` and uses npm's committed lockfile.

## AI assistance

AI-assisted development tools, including Codex, were used during this assignment for
research, code review, implementation support, and iterative validation. The
architecture, testing strategy, tradeoffs, and final implementation decisions were
reviewed and validated by me.

For network-free validation first:

```bash
npm run check
npx playwright test --list
```

## What is covered

| Scenario                 | Risk addressed                                                                               | Execution                                     |
| ------------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Required `Train` journey | Search submission, real-lot selection, exact entity continuity, and readable auction details | Chromium PR/main smoke; manual Firefox/WebKit |
| Enter-key search         | Keyboard submission and narrow search/results semantics                                      | Chromium                                      |
| Mobile search            | Compact-header behavior through the same search capability                                   | Mobile Chromium                               |
| No exact results         | Graceful fallback to related real lots                                                       | Chromium                                      |
| Auction-display parsing  | Current, starting, and final display variants                                                | Browserless unit test                         |

The required journey filters `/en/l/` entries so promotional cards do not affect the
meaning of “second lot.” Before navigation it records the second lot's numeric ID,
title, and href; afterward it verifies the destination ID and visible H1 against that
observation. It then logs:

```text
Lot name: <live title>
Favourites: <live non-negative count>
Current bid | Starting bid | Final bid: <live displayed value>
```

Exact lots, prices, and favourite counts are intentionally not asserted because they
are legitimate production data that can change between runs.

## Stack and architecture

- Node.js 24 LTS and npm
- Playwright Test 1.62.1 with Chromium, Firefox, WebKit, and Pixel 7 projects
- TypeScript 6.0 in strict mode
- ESLint with Playwright guardrails and Prettier

Tests import the project fixture and request only the capabilities they need:

```ts
import { test } from '../fixtures/test.js';

test('opens an observed lot', async ({ search, results, lot }) => {
  await search.open();
  await search.searchFor('Train');
  await results.expectLoadedFor('Train');

  const selectedLot = await results.openLotAtPosition(2);
  await lot.expectSelectedLot(selectedLot);
  const details = await lot.readAuctionDetails();

  console.log(details);
});
```

`search`, `results`, and `lot` are the small public API. They keep responsive DOM
differences, scoped selectors, URL parsing, delayed known-consent handling, and passive
network diagnostics out of specs. Reads return typed domain observations instead of
raw locators. Pure auction-label interpretation stays in a browserless parser test.

## Commands

| Command                          | Purpose                                                          | Contacts Catawiki? |
| -------------------------------- | ---------------------------------------------------------------- | ------------------ |
| `npm run check`                  | Format check, lint, strict typecheck, and parser unit tests      | No                 |
| `npm run test:fixture-contracts` | Local Chromium contracts for consent and compact-search recovery | No                 |
| `npx playwright test --list`     | Show configured project/test discovery                           | No                 |
| `npm run test:smoke`             | Mandatory Chromium journey                                       | Yes                |
| `npm run test:a11y`              | Enter-key and narrow semantic contract                           | Yes                |
| `npm run test:mobile`            | Mobile Chromium search                                           | Yes                |
| `npm run test:regression`        | Configured desktop/browser/device portfolio                      | Yes                |

Install `chromium firefox webkit` before a local cross-browser regression. Networked
commands use one worker and should stop on target blocking or rate-limit evidence.

## CI/CD strategy

Pull requests and `main` use a two-stage quality gate:

```text
npm ci + npm run check
          ↓
managed Chromium @smoke
```

The browser job starts only after static quality succeeds. A separate manual workflow
runs Chromium, Firefox, WebKit, and mobile Chromium as independently visible jobs with
`max-parallel: 1`. It is dispatch-only: there is no cron, deployment, or automatic
broad regression against an external production system.

CI retries a browser failure once at the end in isolation. A retry pass is still flaky
and fails the workflow. Failed or flaky browser jobs retain the standard Playwright
HTML report, traces, screenshots, and bounded diagnostic JSON for seven days; clean
runs upload nothing. Diagnostics distinguish conclusive target access failures such as
403/429 from an otherwise unknown product/automation symptom without recording request
bodies or headers.

## Key tradeoffs and safety decisions

- Production interaction is anonymous and read-only: no login, account creation,
  bidding, favourites, payment, or other mutation.
- There is no direct API suite because exploration found no suitable documented public
  read-only contract; internal calls were access-sensitive and would add coupling.
- The managed full `chromium` channel is used because the separate headless-shell path
  received an initial-document 403 during local investigation. No client spoofing,
  stealth plugin, proxy, or WAF workaround is used.
- One worker limits production traffic. There is no nightly production regression
  because this repository has no controlled data, environment, or operational owner.
- One narrow retry improves diagnosis but cannot create a green flaky build.
- Inside Catawiki, coverage would shift toward controlled environments, authorized
  accounts and data factories, service/API contracts, controllable auction clocks,
  concurrency tests, broad staging regression, and only a minimal production smoke.

## Contributing and deeper documentation

The normal contributor path is:

```text
npm run check → focused branch → PR → static CI → relevant browser validation
```

- [Adding tests](docs/adding-tests.md): fixture imports, locator/waiting rules, layers,
  production safety, and the contribution workflow.
- [Architecture](docs/architecture.md): capability boundaries, domain types, entity
  continuity, diagnostics, and explicit non-abstractions.
- [Test strategy](docs/test-strategy.md): ranked risks, portfolio, tags, and layer
  choices.
- [CI strategy](docs/ci-strategy.md): job ordering, manual regression, artifacts,
  retries, permissions, and scheduling decision.
- [Exploration evidence](docs/exploration.md): observed product behavior and API/WAF
  findings behind the implementation.
- [Decision log](docs/decision-log.md): accepted and rejected engineering decisions.
- [Assignment requirements](docs/assignment.md): source journey and interpretations.
- [Delivery history](docs/delivery-history.md): concise phase and pull-request record.
