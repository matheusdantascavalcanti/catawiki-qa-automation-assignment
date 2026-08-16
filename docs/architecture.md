# Architecture

## Primary goal: framework as an internal product

The framework should be pleasant and safe for engineers who did not build it. A test author should primarily understand the Catawiki behavior being verified, the small typed API, and contribution conventions.

They should not need to understand DOM relationships, responsive duplication, cookie handling, tracing, response listeners, attachment plumbing, Catawiki URL parsing, or auction-display parsing.

This is an architectural requirement, not presentation language.

## Public API versus implementation details

### Test-author-facing API

All browser tests import the project's fixture module:

```ts
import { test, expect } from '../fixtures/test';

test('opens the observed second lot', async ({ search, results, lot }) => {
  await search.open();
  await search.searchFor('Train');
  await results.expectLoadedFor('Train');

  const selectedLot = await results.openLotAtPosition(2);
  await lot.expectSelectedLot(selectedLot);

  const details = await lot.readAuctionDetails();
  console.log(details);
});
```

The stable public surface is:

- exported `test` and `expect`;
- explicit fixtures `search`, `results`, and `lot`;
- capability actions, reads, and reusable page-contract assertions;
- returned domain types such as `ObservedLot` and `DisplayedAuctionPrice`.

Custom fixtures are the composition layer because they give consistent initialization, type-safe autocomplete, explicit dependencies, lazy setup, and freedom to evolve constructors without rewriting specs. Playwright initializes only fixtures requested by the test. See [Playwright fixtures](https://playwright.dev/docs/test-fixtures).

Do not create a `catawiki.search.results.auction...` god fixture. Explicit fixtures scale and make each test's dependencies visible.

### Framework implementation details

Keep these private to `src/` and fixture composition:

- semantic and scoped fallback locators;
- responsive search-opening logic;
- conditional obstruction handling;
- result-card DOM filtering;
- lot ID/canonical href parsing;
- auction label/value normalization;
- passive event listeners and diagnostic limits;
- trace, screenshot, and attachment configuration.

Tests should not receive raw locators from capability reads. They should receive stable domain observations.

## Proposed structure

```text
src/
  capabilities/
    header-search.ts
    search-results.ts
    lot-details.ts
  domain/
    observed-lot.ts
    auction.ts
  parsing/
    auction-display.ts
  diagnostics/
    network-diagnostics.ts

tests/
  fixtures/
    test.ts
  e2e/
    assignment.spec.ts
    search.spec.ts
    search.mobile.spec.ts
  unit/
    auction-display.spec.ts
```

`capabilities/` is clearer than `pages/`: `HeaderSearch` is a reusable header interaction, responsive markup can span page states, and the design is not a hierarchy of giant page classes.

## Capability responsibilities

### HeaderSearch

- Open the configured English Catawiki base URL.
- Make the search interaction ready on desktop or mobile.
- Handle only a genuinely obstructing consent/locale overlay.
- Submit a query using the button by default or Enter when requested.
- Hide responsive DOM differences without hiding the product behavior.

### SearchResults

- Establish results for a requested query using URL plus visible page state.
- Scope entries to actual `/en/l/` lot links.
- Return typed observations from `readVisibleLots()`.
- Implement one-based `openLotAtPosition(position)` with bounds validation.
- Capture ID, title, and href before clicking and return that observation.

### LotDetails

- Establish that a lot page loaded.
- Prove it represents an `ObservedLot` selected earlier.
- Read lot name, favourites, and the primary lot's auction display as one typed value.
- Scope auction reads to the H1-owned primary detail/bidding region before deduplicating
  responsive copies; related-lot regions are outside that boundary.
- Keep DOM label/value relationships and parsing private.

Capability assertions are limited to reusable page contracts (`expectLoadedFor`, `expectSelectedLot`). Scenario-specific assertions remain visible in the spec so tests do not become opaque scripts.

## Naming conventions

- Actions use verbs: `open`, `searchFor`, `openLotAtPosition`.
- Reads start with `read`: `readVisibleLots`, `readAuctionDetails`.
- Reusable page-contract assertions start with `expect`: `expectLoadedFor`, `expectSelectedLot`.
- Methods operate in product language, not DOM language; avoid names such as `clickSecondCard` or `getPriceDivText`.
- Position is explicitly one-based because the requirement is expressed as “second lot”; the name avoids an ambiguous zero-based index.

The convention remains small enough to remember and lets autocomplete be useful.

## Domain model

```ts
interface ObservedLot {
  id: string;
  title: string;
  href: string;
}

type AuctionPriceState = 'current' | 'starting' | 'final';

interface DisplayedAuctionPrice {
  state: AuctionPriceState;
  displayedLabel: string;
  displayedValue: string;
  currencySymbol?: string;
}

interface AuctionDetails {
  lotName: string;
  favourites: number;
  price: DisplayedAuctionPrice;
}
```

This translates unstable DOM strings into a small domain representation while preserving what the assignment asks to print. Tests reason about auction state rather than a particular text node.

`numericValue` is deliberately omitted. `€1,025` can only be interpreted safely with locale assumptions, and no proposed assertion needs arithmetic. Add a separate `Money` type only when a real product test requires numeric comparison with an explicit locale/currency policy.

The auction parser gets a table-driven browserless test. Favourites parsing may add a zero case to that layer only if it becomes a reusable pure function; do not create a module solely to manufacture unit coverage.

## Entity continuity as the primary oracle

The required test does not select a generic second card. It:

1. filters to actual lots;
2. captures the second lot's ID/title/href;
3. clicks that same entry;
4. verifies the destination ID/canonical URL and visible title match the captured entity.

This proves continuity of a business entity across search and detail contexts. It remains valid even when catalogue ordering and auction values change.

## Diagnostics

A small passive collector is registered automatically by the shared fixture module; test authors do not request a diagnostics fixture.

Record only:

- main-frame document navigation URL/status;
- final URL;
- failed requests;
- first-party 4xx/5xx responses;
- a capped list of console errors.

Attach a bounded JSON summary when an attempt fails. Never record bodies, headers, cookies, authentication data, every successful request, or unbounded logs.

Classification is intentionally conservative:

- `ENVIRONMENT`: main-document 401/403/429 or navigation-level DNS/TLS/request failure;
- `PRODUCT`: main-document 5xx;
- `UNKNOWN`: everything without conclusive evidence.

Do not infer `AUTOMATION` from a locator timeout: the same symptom can be product markup change, incomplete load, or automation drift. A single `TargetAccessError` is justified for confirmed access failures so a 403 does not degrade into “search field timed out.” No broader custom-error hierarchy is planned.

Diagnostics are part of framework quality because failure triage time is a major maintenance cost, especially against an external production service.

## Framework-quality definition

The architecture succeeds when another engineer can:

1. discover capabilities through TypeScript and autocomplete;
2. write a test without learning DOM internals;
3. run the correct local validation without reading CI YAML;
4. receive concise, relevant failure evidence;
5. naturally follow locator, waiting, and production-safety conventions;
6. add a new capability through one documented pattern;
7. avoid duplicating browser/configuration plumbing;
8. recognize when not to add another E2E test.

## Configuration and projects

- Strict TypeScript; no application build output is required.
- npm with a committed lockfile for reproducible CI.
- Playwright projects: `unit`, `chromium`, `firefox`, `webkit`, `mobile-chromium`.
- Networked execution uses one worker and no fully parallel mode.
- Chromium runs the complete browser portfolio; Firefox/WebKit run the required journey; mobile Chromium runs the responsive scenario.
- Reporter: concise terminal output locally and standard HTML artifacts in CI. No custom reporter.

## Reference repository assessment

The reference repository [nickIsNotUnique/test-automation-playwright-ts](https://github.com/nickIsNotUnique/test-automation-playwright-ts) is inspiration, not a template.

Worth adapting:

- clear separation of static checks and browser suites;
- predictable npm scripts;
- smoke versus broader execution intent;
- browser projects;
- PR concurrency cancellation;
- failure artifact publication;
- concise README guidance.

Not worth adapting here:

- reusable workflow indirection for a tiny repository;
- broad PR browser matrices;
- sharding or multiple workers;
- elaborate page-object layering;
- reporting infrastructure beyond Playwright's reporters;
- any pattern that assumes a controlled application rather than an external production target.

## Explicit non-abstractions

Do not create yet:

- BasePage, PageFactory, or inheritance;
- dependency injection or service containers;
- generic click/fill/wait/locator wrappers;
- API clients;
- repository or test-data layers;
- a separate overlay framework;
- a generic money/localization framework;
- custom reporter or observability infrastructure;
- classes for single-use constants or selectors.

Complexity is allowed only when it creates safer extension, better diagnostics, clearer domain modeling, better developer experience, or a genuinely different layer of confidence.
