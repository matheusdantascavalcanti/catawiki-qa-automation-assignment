# Catawiki exploration evidence

These are point-in-time observations from the public English Catawiki experience in
August 2026. They explain the product-specific oracles and safety choices; they are not
promises about future production behavior.

## Tooling evidence

- Playwright `1.62.1`, Node.js 24 LTS, npm, and TypeScript `6.0.3` were compatible with
  the selected strict lint/type toolchain.
- Typed fixtures, web-first assertions, browser/device projects, failure traces,
  bounded attachments, isolated retries, and flaky-test failure directly address this
  repository's risks.
- Sharding, parallel workers, broad device matrices, custom reporting, and blob report
  merging add cost or production traffic without useful confidence at this scale.

Primary references:

- [Playwright fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright retries](https://playwright.dev/docs/test-retries)
- [Playwright trace options](https://playwright.dev/docs/api/class-testoptions#test-options-trace)
- [Node.js releases](https://nodejs.org/en/about/previous-releases)

## Search and results

- The top search input exposed role `combobox` with accessible name
  `Search for brand, model, artist...`.
- The visible magnifier control exposed role `button` with accessible name `Search`.
- Both clicking the button and pressing Enter submitted search.
- Searching `Train` navigated to `/en/s?q=Train` and showed a level-one `Train`
  heading.
- Actual lots used `/en/l/<numeric-id>-<slug>` links. Promotional collection cards
  appeared in the broader card/article structure.
- The first result page exposed more than two actual lots without scrolling, but order
  and identities changed with production data.

The reliable second-lot oracle is therefore:

1. scope visible entries to real `/en/l/` links;
2. require at least two actual lots;
3. capture the second lot's ID, title, and href;
4. click that same scoped entry;
5. match the destination ID/canonical URL and visible H1 to the captured entity.

This proves business-entity continuity across search and detail contexts instead of
assuming a generic second card is correct.

## Lot details

- Lot title, favourites, and auction display were visible read-only data.
- Valid labels included `Current bid`, `Starting bid`, and `Final bid`.
- Observed values included spacing and grouping variants such as `€2`, `€ 2`, and
  `€1,025`.
- Favourite counts and auction values are live; zero and changing values are valid.
- The detail DOM rendered duplicate responsive auction blocks inside the primary lot
  region, so the implementation scopes to the H1-owned region, deduplicates matching
  values, and fails if copies disagree.

The suite preserves the displayed label/value instead of inventing a locale-dependent
numeric amount.

## Responsive and consent behavior

- At a Pixel 7 viewport, an unnamed compact-header button opened the same named search
  controls used on desktop. The narrowly scoped CSS opener remains private to the
  capability.
- A delayed Usercentrics panel could intercept search and navigation or collapse the
  compact search after dismissal.
- The fixture handler is limited to three exact approved action labels below the known
  Usercentrics container, uses a normal click, and is bounded to two invocations.
- Compact-search recovery occurs once only after a recorded known-consent interaction
  and the exact collapsed state; unrelated action failures remain visible.

Network-free fixture contracts cover positive, negative, bounded, and isolation cases
without contacting Catawiki.

## Network and browser evidence

- No suitable documented public GraphQL or REST contract was observed. Relevant calls
  appeared implementation-specific, and direct requests outside a normal browser
  session received Akamai 403 responses.
- Playwright's separate default Chromium headless-shell executable received an initial
  document 403 locally. Headed managed Chromium, branded Chrome headless, and the
  documented full managed `channel: 'chromium'` path completed the real journey.
- The portable full managed Chromium channel then passed local repeat validation and
  GitHub-hosted Ubuntu execution without browser identity changes or access-control
  workarounds.

These observations justify a browser journey rather than an internal-endpoint suite,
the supported full Chromium channel, and conclusive target-access diagnostics. They do
not identify or claim a private Akamai decision signal.

## Production-safety implications

- Use anonymous read-only browser navigation only.
- Never probe WAF limits, alter request identity for evasion, or add stealth tooling.
- Use one network worker.
- Keep the automatic gate to one Chromium smoke.
- Run the broader browser/device portfolio only by explicit manual dispatch.
- Do not schedule recurring regression against public production.
- Revalidate accessible names, selectors, fallback text, and auction labels when
  failures provide evidence that the product contract changed.
