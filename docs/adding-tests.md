# Adding tests

This is the practical contributor entry point. Read `test-strategy.md` before expanding coverage and `architecture.md` before changing the public fixture API.

## Add a test

Import the project fixture, not `@playwright/test` directly. ESLint rejects direct
`@playwright/test` imports in `*.spec.ts` and `*.test.ts` files; the fixture module is
the intentional exception that re-exports Playwright for test authors:

```ts
import { test, expect } from '../fixtures/test';

test('search behavior', async ({ search, results }) => {
  await search.open();
  await search.searchFor('Train', { submitWith: 'enter' });
  await results.expectLoadedFor('Train');
});
```

`searchFor(query)` submits with the magnifier button by default. Pass
`{ submitWith: 'enter' }` only when the scenario specifically needs keyboard submission;
responsive search-opening details remain internal to `HeaderSearch`.

Request only the capabilities the test needs. Do not instantiate `HeaderSearch`, `SearchResults`, or `LotDetails` in a spec.

## Prefer existing capabilities

Before adding code, use TypeScript autocomplete on the fixtures and their methods. Add a new capability only when the test introduces reusable product behavior that does not belong in `search`, `results`, or `lot`.

For a justified capability:

1. keep product behavior and locators together under `src/capabilities/`;
2. return typed domain observations rather than raw locators;
3. expose actions as verbs, reads as `read…`, and reusable contracts as `expect…`;
4. register it as an explicit fixture in `tests/fixtures/test.ts`;
5. document the new public method and add the cheapest meaningful validation.

Do not create a BasePage or generic wrapper to share one locator or one line of Playwright code.

## Locator rules

Prefer, in order of intent:

- `getByRole`
- `getByLabel`
- `getByText`
- another user-facing Playwright locator

Use scoped CSS only when observed semantics cannot represent the element, such as a responsive opener without an accessible name. Keep the selector inside the capability and document why the fallback is necessary. Do not expose selectors to tests.

## Waiting rules

- Never use arbitrary sleeps.
- Wait for observable application state: URL/query, heading, visible lot entries, or page-specific content.
- Prefer web-first assertions.
- Do not use `networkidle` as a readiness signal for a live marketplace.
- Do not use force-click to hide an obstruction; handle the observed obstruction or fail with diagnostics.

## Dynamic production data

- Never assert an exact current price, favourite count, lot title, or result order across runs.
- Capture the selected lot before navigation and verify that same identity afterward.
- Accept supported auction states while preserving the displayed label/value.
- Revalidate any deliberately unlikely search query before relying on a no-results state.

## Production safety

Every browser test must remain anonymous and read-only. Do not add login, account creation, bidding, favourites, payment, mutations, rate-limit probes, bot-control workarounds, stealth tooling, or parallel production traffic.

## Choose the right layer

- Parsing or normalization with no browser behavior: unit test.
- Critical user journey or navigation continuity: E2E.
- Responsive interaction risk: targeted device project.
- Accessibility: a narrow assertion attached to meaningful behavior.
- Internal or undocumented endpoint: do not add an API test by default.

If an E2E test does not add a distinct risk or technique, do not add it.

## Local workflow

```bash
# Cheap, network-free feedback while coding
npm run check

# Verify configuration and project discovery without running a browser
npx playwright test --list --pass-with-no-tests
```

Run the browserless parser suite directly with `npm run test:unit`; it is also part of
`npm run check`. Run `npm run test:fixture-contracts` for the small local Chromium
contracts around fixture-owned obstruction handling and bounded compact-search
recovery; they use locally fulfilled content and do not contact Catawiki. Run the
mandatory production journey deliberately with `npm run
test:smoke`. Use `npm run test:a11y` for the Enter-key/semantic contract, `npm run
test:mobile` for the dedicated responsive project, and `npm run test:regression` only
for an explicit broader local pass. Networked tests use one worker, must never run from
an editor watch task or automatic local hook, and must stop when target blocking or
rate-limit evidence appears.

## Contributor workflow

After the private collaboration foundation exists:

1. Update from current `main` and confirm the worktree is clean.
2. Create one focused branch for the coherent increment.
3. Prefer existing fixtures and capabilities before adding framework surface.
4. Implement the behavior at the cheapest appropriate test layer.
5. Run `npm run check`.
6. Run only the relevant browser validation with one worker when applicable.
7. Open or update the PR using `Why`, `What changed`, `Framework impact`, `Validation`, and `Risks / tradeoffs`.
8. Review CI results and keep the description aligned with actual evidence.
9. Have a fresh review session inspect first; evaluate and address evidence-based findings.
10. Merge only when the increment is cohesive, documented, and validated.

The implementation session owns the change, validation, documentation, and accurate PR description. A fresh review session evaluates it as Staff QA engineer, framework maintainer, and future consumer before any review-driven edits. Agent-assisted review is not represented as a human approval.

CI runs `npm run check` first and starts the conservative Chromium `@smoke` only after
static success. The four-project compatibility workflow remains a deliberate manual
dispatch and runs one project at a time. CI success supplements rather than replaces
local product validation.

## Contributor checklist

- The scenario maps to a documented risk.
- Existing fixtures are reused.
- Assertions do not hardcode legitimate marketplace changes.
- Locators and waiting follow the conventions above.
- The test performs no production mutation.
- `npm run check` passes.
- Relevant networked validation passes with one worker.
- Architecture/strategy/decision documentation is updated if the public API or an accepted decision changed.
- The PR description explains both product behavior and framework impact.
- Independent review findings were evaluated rather than blindly applied.
