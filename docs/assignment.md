# Internal assignment specification

## Hard requirements

Automate this user journey on Catawiki:

1. Open the website.
2. Find the top search field.
3. Search for `Train`.
4. Submit with the magnifier/search button.
5. Verify that the search-results page opened.
6. Open the second lot.
7. Verify that the lot page opened.
8. retrieve the lot name, favourites counter, and displayed current bid;
9. print those values to the console.

The submission must not be limited to that one scenario. It should show imagination, diverse rather than duplicated cases, automation best practices, and how the suite would integrate with CI/CD.

## Inferred reviewer expectations

These are interpretations, not additional Catawiki requirements:

- A senior submission should explain why each test exists, not maximize test count.
- The suite should be reliable on dynamic marketplace data and produce useful failure evidence.
- Different tests should address different risks or layers.
- CI should respect that the public repository is a guest hitting an external production system.
- Interview context adds an important architectural expectation: the groundwork should be easy for other QA engineers and developers to discover, use, and extend without understanding every framework internal.

## Proposed engineering goals

- Use a current Playwright + TypeScript toolchain with strict static checks.
- Treat the framework as a small internal product for test authors.
- Expose a small, typed, fixture-based public API.
- Prove entity continuity: the lot opened must be the second actual lot observed before navigation.
- Interpret changing auction text as a typed domain state while preserving the exact displayed value.
- Combine a small E2E portfolio with a browserless parser test.
- Provide passive, bounded diagnostics for target-access and browser failures.
- Make local validation and contribution rules obvious.
- Keep the solution deliberately small and explain rejected complexity.

## Constraints

- All public-site tests are anonymous and read-only.
- Do not log in, create accounts, bid, favourite, pay, or otherwise mutate Catawiki data.
- Do not evade Akamai/WAF controls, spoof clients, or use stealth tooling.
- Keep request volume and concurrency conservative.
- Dynamic result ordering, lot availability, favourite counts, prices, and auction state cannot be fixed test data.
- No remote repository or CI workflow is created during planning.

## Ambiguities and planned interpretations

- **“Second lot”:** means the second actual lot in the observed result list after excluding promotional/non-lot cards, not simply the second generic article/card node.
- **“Current bid”:** live lots may legitimately show `Current bid`, `Starting bid`, or `Final bid`. The suite records the displayed auction state and value instead of failing because the second lot changed state.
- **“Verify page opened”:** requires page-specific observable state and, for the lot, identity continuity—not merely a generic URL or non-empty page.
- **“Print”:** print human-readable values seen by the user; assertions validate shape/state, not fixed amounts.
- **Extra cases:** approximately four to six high-value logical tests are sufficient unless implementation evidence justifies changing the portfolio.

## Things not to assume

- The second lot is stable between runs.
- Every result card represents a lot.
- A lot always has bids, a non-zero favourite count, or an active auction.
- Currency spacing or grouping is uniform.
- Desktop and mobile expose identical search markup.
- Cookie or locale overlays always appear—or never appear.
- Internal endpoints are public, stable, or suitable test contracts.
- A retry passing makes the original failure acceptable.
