# Test strategy

## Strategy summary

The suite demonstrates senior judgment through a small set of distinct risks, a stable fixture API, typed interpretation of dynamic data, and useful failure evidence. It is not intended to become a large regression pack against a public production system.

The required journey is the P0 product risk, but `@smoke` is the only selection label it needs. Additional cases must contribute a different failure mode or test layer and visibly reuse the groundwork established by that journey.

## Principal risks

| Risk                                      | Consequence                                        | Planned control                                                                   |
| ----------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------- |
| Promotional content is mistaken for a lot | Wrong “second lot” opens while the test passes     | Filter to real `/en/l/` entries and capture identity before navigation            |
| Dynamic order/data is hardcoded           | Routine marketplace changes cause false failures   | Assert structure, identity continuity, and display shape rather than fixed values |
| Auction state changes                     | A valid starting/final lot is reported as broken   | Parse `current`, `starting`, and `final` into a typed display state               |
| Responsive markup differs                 | Desktop helpers cannot support mobile contributors | One search capability hides only the responsive interaction differences           |
| Public target blocks CI                   | Locator timeout hides the real 403/429             | Passive main-document diagnostics and target-access error                         |
| Retry masks instability                   | Intermittent failure becomes false green           | One isolated retry plus `failOnFlakyTests` in CI                                  |
| Contributors bypass conventions           | Duplicate plumbing and brittle waiting accumulate  | Fixture API, onboarding guide, obvious scripts, lint guardrails                   |

## Ranked test portfolio

| Rank | Candidate                             | Objective and risk                                                                  | Layer            | Value                                         | Complexity | Flakiness                        | Execution                                  | Decision                                     |
| ---- | ------------------------------------- | ----------------------------------------------------------------------------------- | ---------------- | --------------------------------------------- | ---------- | -------------------------------- | ------------------------------------------ | -------------------------------------------- |
| 1    | Required Train journey                | Prove search, real-lot selection, exact entity continuity, and readable lot details | Desktop E2E      | Highest; mandatory and product-specific       | Medium     | Medium because live data/order   | PR `@smoke`; manual cross-browser          | Implemented                                  |
| 2    | Keyboard search plus narrow semantics | Prove Enter submission and accessible search/result contract                        | Desktop E2E/a11y | Different input and accessibility risk        | Low        | Low–medium                       | Chromium regression, selectable by `@a11y` | Implemented                                  |
| 3    | Mobile search                         | Prove the compact header reaches the same search behavior                           | Responsive E2E   | Demonstrates meaningful capability reuse      | Medium     | Medium due responsive markup     | Targeted mobile Chromium                   | Implemented                                  |
| 4    | No-exact-results/fallback             | Prove search fails gracefully for an unlikely query                                 | Desktop E2E      | Different outcome path and results capability | Low–medium | Medium because catalogue changes | Chromium regression                        | Implemented after repeated live revalidation |
| 5    | Auction-display normalization         | Prove label/value variants without browser cost                                     | Browserless unit | Keeps parsing complexity out of E2E           | Low        | Very low                         | `npm run check`                            | Implemented                                  |

The target remains five logical tests. Running the required test in Firefox and WebKit is cross-browser execution of one test, not additional logical scenarios.

## Required journey oracle

The required scenario is successful only when it proves all of the following:

- search submitted with the visible button for `Train`;
- the results page represents that query;
- at least two actual lot entries are visible;
- the second actual lot's ID/title/href was recorded before clicking;
- the destination represents that exact selected lot;
- title, favourites, auction state, and displayed value can be read;
- the displayed values are printed without hardcoding them.

`click second card` followed by `expect lot URL` is insufficient because it neither excludes promotional cards nor proves identity.

## Accessibility approach

Keep accessibility coverage narrow and behavior-linked:

- assert the expanded search control has a meaningful role/name;
- submit it with Enter;
- assert a meaningful results heading and real lot links;
- optionally use a small locator-scoped ARIA snapshot only if revalidation shows stability.

Do not add whole-page accessibility snapshots or a full-site Axe scan. Those produce volatile output and do not improve confidence in this assignment's critical flow.

## Test-layer policy

Choose the cheapest layer that proves the risk:

- Pure label/value interpretation belongs in a browserless unit test.
- User navigation and entity continuity require E2E.
- Responsive behavior belongs in a dedicated device project, not a mobile tag.
- Accessibility assertions should accompany a meaningful interaction rather than form a duplicated journey.
- Do not add API coverage without a documented, suitable public contract.

## Tag policy

Use only:

- `@smoke`: the mandatory Chromium PR-gate journey.
- `@a11y`: the keyboard/semantic search test.

The regression suite is the configured set of tests/projects; it does not need `@regression` on every test. Browser/device selection belongs to Playwright projects. All browser tests are production tests, making `@production` redundant. `@p0` duplicates `@smoke` at this scale.

## Reuse as an acceptance criterion

The portfolio must make framework growth visible:

```text
Required journey
  -> creates search, results, lot, domain types and diagnostics

Keyboard/a11y
  -> reuses search and results; varies only submission and assertions

Mobile
  -> reuses search; responsive mechanics stay internal

Fallback search
  -> reuses search and results

Parser unit
  -> exercises the same auction parser without a browser
```

An extra scenario that introduces separate browser initialization, overlay handling, URL parsing, or reporting plumbing fails review. A new capability is acceptable only for genuinely new reusable product behavior.

The PR sequence should make that leverage reviewable:

```text
Phase 02 PR
  larger framework-establishing increment
  → search, results, lot, domain types, parsing, diagnostics

Phase 03 PR
  smaller incremental change
  → complementary scenarios primarily compose existing capabilities
```

The size difference is not a quota: Phase 03 should be smaller because groundwork exists, not because valuable behavior is omitted. Its review should flag substantial new browser plumbing and reject tests added merely to make the PR appear larger.

## Exit criteria

- Each test maps to a distinct risk in the portfolio.
- No test performs a Catawiki mutation.
- No exact live auction value, count, result title, or ordering is hardcoded.
- No fixed sleep or `networkidle` synchronization is used.
- Retry-passed tests fail CI as flaky.
- Optional tests can be deferred if their observed state cannot be made responsible and stable.
