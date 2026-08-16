# Assignment requirements

## Required journey

Automate this Catawiki buyer flow:

1. Open the website.
2. Find the top search field.
3. Search for `Train`.
4. Submit with the magnifier/search button.
5. Verify that the search-results page opened.
6. Open the second lot.
7. Verify that the lot page opened.
8. Retrieve the lot name, favourites counter, and displayed current bid.
9. Print those values to the console.

The submission should also demonstrate diverse, proportionate coverage, automation
practices, framework extensibility, and a credible CI/CD strategy.

## Interpretations

- **Second lot:** the second actual `/en/l/` result observed after excluding
  promotional/non-lot cards, not the second generic card node.
- **Displayed current bid:** a selected live lot may legitimately show `Current bid`,
  `Starting bid`, or `Final bid`; preserve the label and value the user sees.
- **Verify page opened:** establish search-page state and prove that the destination is
  the same lot captured before navigation, rather than checking only a generic URL.
- **Print:** output the live title, non-negative favourites count, and auction
  label/value without hardcoding them.
- **Extra cases:** add a different product risk, interaction mode, device risk, or test
  layer; do not multiply equivalent search permutations.

## Constraints

- Public-site tests are anonymous and read-only.
- Do not log in, create accounts, bid, favourite, pay, or mutate Catawiki data.
- Do not evade Akamai/WAF controls, spoof clients, or use stealth tooling.
- Keep request volume and concurrency conservative.
- Result order, lot availability, favourite counts, prices, and auction state are
  dynamic production data.
- Do not assume every result card is a lot, every lot has bids, desktop and mobile
  share markup, or consent/locale UI always appears.
- Do not treat internal endpoints as public, stable test contracts.
