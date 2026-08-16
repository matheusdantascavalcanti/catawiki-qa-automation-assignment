# Catawiki QA automation assignment

This repository contains a risk-based Playwright and TypeScript automation framework
for Catawiki's public, read-only buyer experience. The mandatory scenario searches for
`Train`, captures the second actual lot before navigation, proves the same lot opened,
and reports its live title, favourites count, and displayed auction state/value.

## Prerequisites

- Node.js 24 LTS
- npm 11 or the npm version bundled with your Node 24 installation

The project declares Node `>=24 <25`. Check your runtime before installing:

```bash
node --version
npm --version
```

## Install

Install the exact dependency graph recorded in `package-lock.json`:

```bash
npm ci
```

## Validate

Run the complete browserless quality gate:

```bash
npm run check
```

The aggregate check runs formatting verification, ESLint, strict TypeScript
typechecking, and the auction-display parser suite. To run a single check or suite:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
```

Run the required Chromium journey deliberately (this contacts Catawiki production):

```bash
npm run test:smoke
```

Networked execution uses one worker, remains anonymous and read-only, and must stop on
target blocking or rate-limit evidence. Never use the suite to bypass WAF controls.

## Framework API

Product tests request explicit capabilities from the project fixture:

```ts
import { test } from '../fixtures/test';

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

- `search` owns English entry, obstructing consent/locale handling, responsive search
  readiness, and button-default or explicitly requested Enter submission.
- `results` filters real `/en/l/` lots and returns an `ObservedLot` captured before
  navigation.
- `lot` proves ID/title continuity and returns typed auction details.
- Pure auction parsing translates current/starting/final labels while preserving the
  displayed value.
- Passive bounded diagnostics classify conclusive access failures and attach JSON only
  when a test fails.

Selectors, responsive duplication, URL parsing, and diagnostic listeners stay inside
the framework. Specs express the user journey through product language.

## Test author entry point

All spec and test files import `test` and `expect` from
`tests/fixtures/test.ts`, never directly from `@playwright/test`. ESLint enforces this
at the spec/test boundary. Request only the capabilities the scenario consumes; do not
instantiate capability classes or expose locators in a spec.

See `docs/adding-tests.md` for contribution conventions and `docs/architecture.md` for the approved framework design.

## Collaboration workflow

After Phase 01, each approved increment is proposed from a focused branch through a
pull request. Keep the description current under `Why`, `What changed`, `Framework
impact`, `Validation`, and `Risks / tradeoffs`, and leave review-driven changes for a
separate independent review session.

The current GitHub Actions gate runs only `npm ci` and `npm run check` with read-only
repository access. It does not install browsers or contact Catawiki.
