# Catawiki exploration evidence

Exploration was performed against the public English Catawiki experience with official Playwright browser tooling. Observations are point-in-time evidence from August 2026, not promises about future production behavior.

## Tooling investigation

- Selected baseline: Playwright `1.62.1`, Node.js 24 LTS, npm with a committed lockfile, and TypeScript `6.0.3` under strict settings.
- TypeScript 7 was newer but was not selected because the current lint/type ecosystem supported TypeScript below 6.1 at the time of research.

The inspected Playwright CLI supported semantic snapshots, element-reference interaction, locator generation, browser/device selection, viewport resizing, console inspection, request/response inspection, in-browser code evaluation, and tracing. Those commands were used as exploratory tools; generated actions were not treated as production test architecture.

| Capability considered                      | Problem it solves here                                                                   | Decision                                                                  |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Typed custom fixtures                      | Makes capability discovery, initialization, and teardown consistent for contributors     | Use as the public composition API                                         |
| Web-first assertions and semantic locators | Avoids manual polling and DOM-coupled selectors                                          | Use by default                                                            |
| Locator-scoped ARIA snapshot               | Can document a small stable search/result semantic contract                              | Use only if implementation revalidation shows stable signal               |
| Trace and failure screenshots              | Reconstructs actions, DOM, and browser state after an intermittent remote failure        | Retain failures and retries in CI                                         |
| Test attachments                           | Surfaces concise target/network evidence beside the failed attempt                       | Attach bounded diagnostics on failure                                     |
| Tags/annotations                           | Selects the one PR smoke and the narrow accessibility case                               | Use only `@smoke` and `@a11y`                                             |
| `retryStrategy: 'isolated'`                | Separates a diagnostic retry from normal suite execution                                 | Use once in CI                                                            |
| `failOnFlakyTests`                         | Prevents a retry pass from creating false-green CI                                       | Use in CI                                                                 |
| Browser/device projects                    | Represents compatibility risk without branching inside tests                             | Use a small risk-based project set                                        |
| Response timing APIs                       | Could explain a timeout, but public internet timing is not a stable performance contract | Diagnostic context only if cheap; no timing assertion                     |
| APIRequestContext                          | Would support a documented stable API boundary                                           | Reject because no suitable public contract was observed                   |
| Blob report merging                        | Helps large sharded suites combine reports                                               | Reject; independent matrix reports are clearer here                       |
| Sharding/parallel workers                  | Reduces large-suite duration                                                             | Reject; the suite is tiny and production traffic must remain conservative |
| Broad device matrix                        | Finds more responsive permutations                                                       | Reject; one purposeful mobile Chromium project covers the observed risk   |

Primary references:

- [Playwright release notes](https://playwright.dev/docs/release-notes)
- [Playwright fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright retries](https://playwright.dev/docs/test-retries)
- [Playwright trace options](https://playwright.dev/docs/api/class-testoptions#test-options-trace)
- [Node.js releases](https://nodejs.org/en/about/previous-releases)
- [TypeScript releases](https://www.typescriptlang.org/docs/handbook/release-notes/overview.html)

## Desktop search

- The top search input exposed role `combobox` with accessible name `Search for brand, model, artist...`.
- The visible search control exposed role `button` with accessible name `Search`.
- Both clicking the button and pressing Enter submitted the search.
- Searching `Train` navigated to an English URL shaped as `/en/s?q=Train` and showed a search-results heading for `Train`.
- The journey uses document navigation/SSR as part of the observable flow rather than a purely client-side view change.
- Fresh contexts may receive cookie/locale UI. Its presence is conditional, so future implementation must handle an actually obstructing overlay without assuming it always exists.

Robust readiness should combine the expected search URL/query with visible result-page semantics. `networkidle` is not appropriate because a marketplace page can continue background activity.

## Search results

- The explored first result page contained 24 actual lot articles and four promotional collection articles.
- Actual lot links used the English lot path shape `/en/l/<lot-id>-<slug>`.
- Promotional cards were mixed into the broader article/card structure, so selecting the second article or generic card is not a valid interpretation of “second lot.”
- Initial results were sufficient for the required selection; no scroll-triggered lazy loading was necessary to reach the second actual lot.
- Production ordering is dynamic and must not be treated as stable test data.

The reliable selection procedure is:

1. scope to visible result entries containing a real `/en/l/` link;
2. confirm at least two actual lots are present;
3. read the second lot's ID, title, and href before navigation;
4. click that same scoped entry;
5. verify the destination represents that exact observed entity.

This is the core test oracle: entity continuity across the journey.

## Lot page

- Lot title, favourites counter, and auction display are visible read-only data.
- Legitimate observed auction labels included `Current bid`, `Starting bid`, and `Final bid`.
- Observed formatting included `€2`, `€ 2`, and `€1,025`.
- Favourite counts and auction values are live data; zero favourites and changing values must be valid inputs.
- A strict expectation that every selected lot says `Current bid` would fail for a valid starting or completed lot.
- The assignment's console output should preserve the displayed label and value rather than print a fabricated normalized amount.

## Mobile/responsive behavior

- At a representative mobile viewport, the compact header uses a distinct search-opening interaction before the search input becomes available.
- The initial compact opener was not as semantically strong as the expanded search controls, so implementation may need one narrowly scoped fallback locator for that opener.
- Once expanded, the search interaction exposes accessible search semantics and can reuse the same product capability.
- Search/result/lot information moves within responsive markup, so tests should consume behavior-oriented capabilities rather than desktop DOM details.

## Accessibility observations

Stable, meaningful candidates are intentionally narrow:

- the expanded search is discoverable as a named combobox;
- search can be submitted by keyboard;
- results expose a meaningful page heading and real lot links;
- a lot page exposes its primary title and auction label/value as readable content.

Whole-page ARIA or screenshot snapshots would be noisy because navigation, recommendations, auction data, and promotional content change. A small locator-scoped ARIA snapshot may be useful only around the search/result contract if implementation confirms it is stable.

## Network observations

- Main journeys included HTML/document navigation and internal REST-like JSON calls.
- No useful public GraphQL contract was observed; no persisted GraphQL boundary justified a contract test.
- Relevant endpoints appeared implementation-specific rather than documented public APIs.
- Direct requests outside the normal browser session produced Akamai 403 behavior during exploration.
- Browser-session requests working while direct calls fail is evidence against building an API suite or attempting to bypass controls.

Recommendation: do not add a dedicated API test. The available boundary is internal, access-sensitive, and adds coupling without enough independent confidence. Revisit only if Catawiki provides a documented anonymous read-only contract.

## Production-safety implications

- No state-changing journey was explored.
- Do not probe WAF limits, repeat requests at volume, alter user agents for evasion, or use stealth plugins.
- Use one worker for networked suites.
- Keep the PR gate to one Chromium smoke journey.
- Run the broader browser/device portfolio only on explicit manual dispatch.
- Do not schedule nightly execution against the public production site.

## Facts requiring implementation-time revalidation

- Current accessible names and responsive selectors.
- The exact no-results/fallback behavior and a safe unlikely query.
- Whether consent/locale UI obstructs the chosen flow.
- Current auction-label variants beyond the three observed states.
- Whether Catawiki starts returning target-level 403/429 responses to CI traffic.

Revalidation may change locators or defer an optional scenario, but must not weaken production-safety boundaries or invent unobserved behavior.

## Phase 02 implementation revalidation

Revalidated on 2026-08-16 with the official browser-controlled Playwright surface:

- `https://www.catawiki.com/en/` normalized to `/en` and remained accessible in the
  normal in-app browser session. No consent/locale obstruction, CAPTCHA, 403, or 429
  appeared in that session.
- The desktop search remained a `combobox` named by the placeholder
  `Search for brand, model, artist...`; the magnifier remained a button named `Search`.
  Clicking it with `Train` produced `/en/s?q=Train`, a level-one `Train` heading, and
  24 visible actual-lot links.
- Actual results still used `/en/l/<numeric-id>-<slug>` and now included the source
  query parameters `po=search&poq=Train`. Related collection articles remained outside
  that identity contract, so href filtering is still required.
- The second observed actual lot's numeric path ID, visible card title, and href matched
  the destination URL and level-one lot title exactly after navigation.
- The primary favourite control exposed `title="favourite"`, a decimal `count`
  attribute, and the same visible decimal text. Related-lot favourite controls carried
  `data-testid="lot-card-favorite-button"`, allowing the primary read to stay scoped.
- The selected detail page displayed `Current bid` with a spaced value (`€ 6` at the
  observation time); result cards also displayed `Starting bid` and compact values.
  `Final bid` was not present in this live result set, so its approved parser support
  remains based on prior evidence rather than a manufactured navigation.
- The detail DOM contained duplicate, simultaneously visible responsive auction blocks
  with the same label/value. The direct `main` child containing the sole level-one lot
  heading was the primary detail region; its single bidding-column child contained both
  `Amount` copies, while the related-lot collection was a sibling region. The capability
  must scope to that product relationship, deduplicate identical responsive values, and
  fail if the copies disagree.
- At a 412 x 915 viewport, the compact header hid the search input behind one visible,
  unnamed `button.c-header__mobile-nav__search` opener. Clicking it exposed the same
  named search combobox and `Search` button used by the desktop capability.
- The standalone local Playwright Chromium runner received a conclusive Akamai 403 on
  the first main-document request. Validation stopped after that single attempt; no
  user-agent change, alternate request client, retry loop, or protection bypass was
  attempted.

## Phase 02 execution-blocker investigation

Investigated on 2026-08-16 under the repository's Node 24 runtime:

- Baseline `npm run test:smoke` used the `chromium` project, Playwright's default
  headless mode, and a fresh ephemeral context. Its first and only main-document
  navigation to `https://www.catawiki.com/en/` returned 403. The final URL remained the
  initial URL and the bounded diagnostics classified the failure as `ENVIRONMENT`.
- A fresh tab in the official in-app browser reached the same URL and rendered the
  Catawiki home page and named search controls. This reconfirmed the access discrepancy
  without reusing cookies in the Playwright Test run.
- The real `assignment.spec.ts` passed once with headed Playwright-managed Chromium and
  then passed all three attempts in the planned `--repeat-each=3` stability check.
- The real spec also passed once with installed Google Chrome 151 in ordinary headless
  mode. This ruled out headless execution by itself as the blocker; that local Chrome
  installation was not selected as a repository dependency.
- The smallest portable comparison, Playwright's documented `channel: 'chromium'`, ran
  the full Playwright-managed Chromium browser in headless mode. The real spec passed
  once and then passed all three planned repeat attempts.

Playwright 1.62.1 resolves default headless Chromium to its separate
`chromium-headless-shell` executable, while the explicit `chromium` channel selects the
full managed Chromium executable. The bounded matrix therefore isolates the rejection
to the default headless-shell execution path in this environment; it does not establish
which private Akamai signal produced that decision. No stealth, fingerprint, header,
cookie, proxy, CAPTCHA, or anti-detection mechanism was used.
