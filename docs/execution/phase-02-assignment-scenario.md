# Phase 02 — Required assignment scenario

**Status:** In progress — implementation underway in draft PR #2

## Objective

Implement and prove the mandatory Train journey through one focused pull request while establishing the first useful version of the fixture-based public API, typed domain values, identity oracle, and passive diagnostics.

## Prerequisites

- Phase 01.5 merged into the private repository's `main` branch.
- Static PR CI is working and remains network-free.
- Desktop Catawiki accessible through a normal Playwright browser session.
- Search/result/lot semantics revalidated against `docs/exploration.md`.
- Production-safety boundaries understood.

## Files likely affected

- `tests/fixtures/test.ts`
- `src/capabilities/header-search.ts`
- `src/capabilities/search-results.ts`
- `src/capabilities/lot-details.ts`
- `src/domain/observed-lot.ts`
- `src/domain/auction.ts`
- `src/parsing/auction-display.ts`
- `src/diagnostics/network-diagnostics.ts`
- `tests/e2e/assignment.spec.ts`
- `tests/unit/auction-display.spec.ts`
- `README.md`

## Implementation tasks

1. Update local `main` from the private remote, verify it is clean, and create the focused branch `feat/assignment-scenario`.
2. Open a draft PR early using the concise template so static CI and architectural intent remain visible during development.
3. Revalidate accessible names, English URL behavior, real-lot path shape, result composition, and current auction labels using Playwright browser tooling.
4. Implement only the three approved capabilities and expose them as explicit lazy fixtures: `search`, `results`, and `lot`.
5. Keep conditional consent/locale handling inside the search capability and act only when it obstructs the flow.
6. Implement `searchFor` with button submission as the default required behavior.
7. Establish results readiness from URL/query and visible page semantics, not timing or `networkidle`.
8. Filter entries to real `/en/l/` lots and validate that at least two are present.
9. Implement one-based `openLotAtPosition(2)` so it captures ID/title/href before clicking.
10. Implement `expectSelectedLot` using canonical identity and visible title.
11. Read lot name, non-negative favourites count, auction state, label, and raw displayed value into typed domain values.
12. Print the user-visible values to the console in a concise labeled form.
13. Implement the auction parser and table-driven browserless cases in the same phase as the production code.
14. Register passive diagnostics automatically through the fixture module; do not expose them as a public fixture.
15. Detect conclusive main-document access failures before they decay into locator timeouts.
16. Attach bounded diagnostic JSON on failure and use standard Playwright trace/screenshot artifacts.
17. Tag only the required journey `@smoke`.
18. Update README architecture/rationale and contributor examples using the real implemented API.
19. Run static CI throughout development and perform browser validation locally because production-browser CI is not introduced until Phase 04.
20. Keep the PR description current and explicitly separate:

    - **Product change:** the mandatory Train journey now works.
    - **Framework impact:** future tests can consume `search`, `results`, `lot`, typed observations, parsing, and diagnostics.

21. Ask a fresh review session to inspect the completed PR before modification from Staff QA, maintainer, and future-consumer perspectives.
22. Evaluate and address evidence-backed findings, rerun local validations and static CI, update the PR, then merge only when the increment is coherent.

## Validation commands

```bash
npm run check
npm run test:unit
npm run test:smoke
npx playwright test tests/e2e/assignment.spec.ts --project=chromium --repeat-each=3
```

The repeat is a one-time local stability check, not a permanent high-volume command. Stop if target blocking or rate-limit behavior appears.

Also force one safe local assertion failure to verify that the report contains the trace, screenshot, and concise diagnostic attachment; restore the assertion immediately afterward.

## Acceptance criteria

- The spec imports only the project fixture and consumes `search`, `results`, and `lot`.
- The search is submitted via the magnifier/search button.
- The second actual lot is identified before navigation.
- The destination proves the same entity opened.
- Supported current/starting/final display states do not create false failures.
- The raw displayed value is retained and printed.
- Parser cases pass without launching a browser.
- A simulated test assertion failure yields useful bounded diagnostics.
- A confirmed target 403/429 produces a target-access message if such a response can be observed safely; do not induce WAF behavior to test it.
- No fixed sleep, force-click, hardcoded live value, API call, or production mutation exists.
- The PR presents one coherent framework-establishing increment and its description distinguishes product behavior from framework leverage.
- Static CI passes, local browser validation evidence is recorded, and CI is not misrepresented as product validation.
- A fresh independent agent-assisted review was completed without fabricated human approval; valid findings were addressed or rejected with evidence.
- The reviewed PR is merged before Phase 03 begins.

## Out of scope

- Keyboard, mobile, and no-exact-results scenarios.
- Firefox/WebKit validation beyond an optional local feasibility check.
- General overlay framework or currency parser.
- Production-browser CI or workflow expansion.
- Any direct endpoint automation.
- Unrelated Phase 03 coverage.

## Questions to answer before proceeding

- Are the three observed auction labels still sufficient? Unknown labels must fail with diagnostic raw text rather than be silently coerced.
- Is canonical lot ID available consistently in href and destination URL?
- Can visible title normalization tolerate only observed whitespace differences without masking a wrong entity?
- Which exact first-party hostnames should the bounded diagnostic collector include?
- Does attaching diagnostics from the shared fixture preserve evidence from the first failed attempt and the retry?
- Does the PR make the reusable framework impact understandable independently from the mandatory product scenario?
