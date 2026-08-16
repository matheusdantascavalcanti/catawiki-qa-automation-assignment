# Phase 03 — Additional high-value coverage

**Status:** Not started

## Objective

Add only the approved diverse scenarios through one focused pull request and demonstrate that new tests primarily reuse the framework groundwork instead of requiring new plumbing.

## Prerequisites

- Phase 02 PR reviewed, merged, and stable on private `main`.
- Required journey passes without relying on retries.
- Existing fixture API and domain types reviewed before adding methods.
- Optional no-results behavior and a safe query revalidated.

## Files likely affected

- `tests/e2e/search.spec.ts`
- `tests/e2e/search.mobile.spec.ts`
- existing capability files only when a reusable behavior is missing
- `playwright.config.ts` project matching
- `README.md`, `docs/test-strategy.md`, and `docs/adding-tests.md`

## Implementation tasks

1. Update from current private `main`, create `test/extended-coverage`, and open a draft focused PR.
2. Add keyboard submission through the existing `search` fixture, using an explicit `submitWith: 'enter'` option rather than a second search implementation.
3. Add narrow accessibility assertions around the expanded search and result-page contract. Use a scoped ARIA snapshot only if its reviewed output is stable and meaningful.
4. Add the mobile Chromium test using the same `search` fixture; keep compact-opener DOM differences inside `HeaderSearch`.
5. Add the no-exact-results/fallback case only if the state remains observable with a query that is safe and reasonably stable. Reuse `search` and `results`.
6. Configure project test matching so Chromium runs the browser portfolio, mobile Chromium runs only the responsive test, and desktop projects do not accidentally duplicate it.
7. Add only `@a11y` to the keyboard/semantic test. Do not add redundant regression/device/production tags.
8. Review every new method: if it exists for one assertion and reveals DOM language, keep it local or remove it.
9. Update portfolio documentation and the PR description if an optional case is deferred or replaced based on evidence.
10. Record static CI and relevant local browser validation in the PR.
11. Ask a fresh review session to inspect the PR, leading with: **Did these scenarios mostly compose existing capabilities, or require significant new browser plumbing?**
12. Evaluate and address valid findings, revalidate, update the PR, and merge before Phase 04.

## Validation commands

```bash
npm run check
npm run test:a11y
npm run test:mobile
npx playwright test --project=chromium --workers=1
npx playwright test --list
```

Run the full local regression only once after targeted checks pass:

```bash
npm run test:regression
```

## Acceptance criteria

- Additional scenarios reuse existing fixtures and automatic diagnostics.
- No scenario initializes browser plumbing, handles overlays, or parses lot URLs independently.
- Keyboard coverage changes the submission mode, not the framework approach.
- Mobile behavior uses the same product capability with only internal responsive adaptation.
- Accessibility assertions are narrow and resilient to dynamic marketplace content.
- The fallback case adds a different outcome path or is explicitly deferred with evidence.
- Total logical portfolio remains approximately five tests.
- One worker and read-only behavior remain intact.
- The PR diff makes reuse visibly cheaper than the Phase 02 framework-establishing increment.
- Most changes are tests and small justified capability extensions, not duplicated setup, overlays, URL parsing, or diagnostics.
- The PR is cohesive, accurately described, independently reviewed, and merged before Phase 04.

## Out of scope

- More search permutations for their own sake.
- Localization matrices not supported by observed requirements.
- Full Axe, visual regression, performance/Lighthouse, route mocking, or API tests.
- New capability classes for single-use selectors.
- CI implementation.
- Unrelated framework expansion added to make the PR appear larger.

## Questions to answer before proceeding

- Does mobile Chromium still require a distinct compact opener, and can it be scoped without a brittle global selector?
- Which exact small accessibility contract remains stable after revalidation?
- Is the no-exact-results state deterministic enough for a public production suite? If not, omit it rather than weaken the assertion.
- Does each additional test add a failure mode not already covered by the required journey?
- Did the PR demonstrate leverage from Phase 02, or expose a genuine capability boundary that needs evidence-based adjustment?
