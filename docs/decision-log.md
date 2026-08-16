# Decision log

Statuses reflect the implemented design. Later evidence may supersede a decision through
a new entry rather than silently rewriting its rationale.

## D001 — Use Playwright + TypeScript

**Status:** Accepted

**Context:** The assignment is a browser journey with responsive and accessibility interests. Current Playwright provides typed fixtures, web-first assertions, traces, device projects, and report attachments in one proportionate toolchain.

**Decision:** Use Playwright 1.62.x with strict TypeScript 6.0.x and lock compatible
patch versions in `package-lock.json`.

**Alternatives:** Selenium/WebDriver, Cypress, JavaScript without strict typing.

## D002 — Use Node 24 LTS and npm

**Status:** Accepted

**Context:** The project needs a current supported runtime and a universally understandable contributor workflow.

**Decision:** Use Node 24 LTS, npm, and commit `package-lock.json`.

**Alternatives:** pnpm/yarn add little value for this small standalone repository.

## D003 — Treat the framework as an internal product

**Status:** Accepted

**Context:** The role expects groundwork other QA engineers and developers can extend without friction.

**Decision:** Optimize for a small discoverable API, good defaults, documentation, automated guardrails, and failure diagnostics.

**Alternatives:** A collection of independent spec scripts would be quicker initially but would not demonstrate reusable groundwork.

## D004 — Fixtures are the public composition API

**Status:** Accepted

**Context:** Repeated capability construction leaks plumbing into every test and makes framework evolution expensive.

**Decision:** Tests import project `test`/`expect` and request explicit `search`, `results`, and `lot` fixtures. Do not expose a god fixture.

**Alternatives:** Direct constructors in specs; one nested `catawiki` fixture.

## D005 — Use product capabilities, not a BasePage hierarchy

**Status:** Accepted

**Context:** Search is a header/responsive capability and reusable behavior does not align cleanly with one class per page.

**Decision:** Use `HeaderSearch`, `SearchResults`, and `LotDetails` under `src/capabilities/` with composition rather than inheritance.

**Alternatives:** `pages/`, BasePage, PageFactory, generic locator wrappers.

## D006 — Prove selected-lot entity continuity

**Status:** Accepted

**Context:** Promotional cards are mixed with lots and production result ordering changes.

**Decision:** Filter actual `/en/l/` entries, record the second lot's ID/title/href before clicking, and verify the destination matches the recorded entity.

**Alternatives:** Click the second generic card and check only that a lot-like URL opened.

## D007 — Model displayed auction state, preserve raw value

**Status:** Accepted

**Context:** Valid pages showed current, starting, and final bid labels plus formatting variants.

**Decision:** Return typed state plus displayed label/value and optional currency symbol. Omit numeric money parsing until a real arithmetic assertion requires an explicit locale policy.

**Alternatives:** Hardcode `Current bid`; return only raw strings; build a generic localization/money framework.

## D008 — Add one browserless parser layer

**Status:** Accepted

**Context:** Auction display normalization can be proven faster and more completely without browser navigation.

**Decision:** Add a table-driven unit test for the observed label/value variants.

**Alternatives:** Duplicate each format through E2E; manufacture broad unit coverage.

## D009 — Add a dedicated API suite

**Status:** Rejected

**Context:** Exploration found implementation-specific REST-like calls, no suitable public GraphQL contract, and Akamai 403 behavior outside a normal browser session.

**Decision:** Do not automate internal anonymous endpoints or bypass controls. Revisit only if a documented public read-only contract becomes available.

**Alternatives:** APIRequestContext tests, persisted-query clients, contract-test tooling.

## D010 — Add bounded passive failure diagnostics

**Status:** Accepted

**Context:** A target-level 403 should not appear as an unexplained locator timeout.

**Decision:** Record main navigation, final URL, failed requests, first-party errors, and capped console errors; attach concise JSON only on failure.

**Alternatives:** Rely only on screenshots/traces; capture a full HAR/network log; external telemetry.

## D011 — Classify only conclusive failures

**Status:** Accepted

**Context:** Product changes and automation drift can produce identical locator symptoms.

**Decision:** Automatically classify confirmed access/network failures as `ENVIRONMENT`, main-document 5xx as `PRODUCT`, and everything else as `UNKNOWN`. Do not guess `AUTOMATION`.

**Alternatives:** A broad custom error taxonomy based on exception strings.

## D012 — Use predictable action/read/expect naming

**Status:** Accepted

**Context:** Contributors should be able to guess methods through autocomplete.

**Decision:** Actions use verbs, domain queries start `read`, and reusable page contracts start `expect`. Use `openLotAtPosition(2)` with one-based product language.

**Alternatives:** DOM-oriented names or a large prescriptive style guide.

## D013 — Use existing lint guardrails

**Status:** Accepted

**Context:** Strong mechanical conventions should not rely only on reviewers remembering documentation.

**Decision:** Apply `eslint-plugin-playwright` recommended rules and explicit protection against focused/skipped tests, missing awaits, fixed waits, `networkidle`, force, conditional logic, and non-web-first assertions. Configure `expect-expect` for `expect…` capability methods.

**Alternatives:** Custom validators; enabling incompatible `no-nth-methods`, `no-raw-locators`, or `require-tags` rules.

## D014 — Keep tags minimal

**Status:** Accepted

**Context:** Six tags for roughly five logical tests create taxonomy without information.

**Decision:** Use only `@smoke` and `@a11y`. Express browser/device coverage through projects and regression through the configured suite.

**Alternatives:** `@p0`, `@regression`, `@desktop`, `@mobile`, and `@production` on most tests.

## D015 — Retries diagnose; flaky tests fail CI

**Status:** Accepted

**Context:** One retry can reveal intermittence but must not turn an unstable test green.

**Decision:** Local retries zero; CI retries one; `retryStrategy: 'isolated'`; `failOnFlakyTests: true` in CI; retain failure-and-retry traces.

**Alternatives:** No diagnostic retry; multiple immediate retries; accepting a retry pass.

## D016 — Use a serial manual browser matrix

**Status:** Accepted

**Context:** Independent browser results aid diagnosis, but parallel jobs would increase production traffic.

**Decision:** Manual matrix for Chromium, Firefox, WebKit, and mobile Chromium with `max-parallel: 1` and `fail-fast: false`. PR smoke remains Chromium-only.

**Alternatives:** One opaque sequential command; a parallel matrix; all browsers on every PR.

## D017 — Schedule public production regression

**Status:** Rejected

**Context:** The public repository has no controlled environment, test data, or operational ownership.

**Decision:** Provide manual dispatch only. Scheduled broad regression belongs against internal staging/pre-production.

**Alternatives:** Nightly or hourly public runs.

## D018 — Keep production interaction read-only and conservative

**Status:** Accepted

**Context:** Catawiki is an external production marketplace with WAF/rate protections and real transactions.

**Decision:** Anonymous reads only, one network worker, no bot bypass, no accounts, favourites, bids, payments, or state mutation.

**Alternatives:** Test accounts or mutation flows are appropriate only with Catawiki-owned environments and authorization.

## D019 — Keep architecture proportionate

**Status:** Accepted

**Context:** The repository should add tools and abstractions only when they address an
observed product, maintenance, diagnostic, or contributor risk.

**Decision:** Do not add BDD, DI, BasePage/PageFactory, service containers, generic wrappers, Allure, custom reporters, Docker/Kubernetes, Faker, Lighthouse, broad visual/Axe scans, route mocking, GraphQL/contract frameworks, test-management integrations, sharding, or parallel workers without a new evidenced requirement.

**Alternatives:** Add technologies or framework layers without a concrete requirement.

## D024 — Use Playwright-managed full Chromium for the live smoke

**Status:** Accepted

**Context:** Playwright 1.62.1's default headless Chromium path uses the separate
`chromium-headless-shell` executable, which received an Akamai 403 on Catawiki's initial
document in a bounded local investigation. The real assignment spec passed in headed
managed Chromium, installed Chrome headless, and managed full Chromium headless through
the documented `channel: 'chromium'` option. The selected managed channel passed the
planned three-attempt repeat check.

**Decision:** Configure the `chromium` project with `channel: 'chromium'`. This retains a
Playwright-installed, headless, portable browser path for local review and future CI
without depending on a branded browser installation or altering browser identity and
request data for access-control evasion.

**Alternatives:** Require headed execution, depend on locally installed Google Chrome,
continue using the rejected headless shell, or attempt anti-detection changes. Headed
execution is less convenient for CI, branded Chrome adds a host prerequisite, and any
access-control bypass remains prohibited.

## D025 — Use full managed Chromium for the mobile project

**Status:** Accepted

**Context:** The browser investigation established that the default Playwright
headless-shell path was rejected locally while the documented full managed Chromium
channel passed. The mobile test must use the actual device project and contact
the same target through an executable runner path.

**Decision:** Configure `mobile-chromium` with the Pixel 7 device profile plus
`channel: 'chromium'`. Keep the existing responsive opener private to `HeaderSearch`.

**Alternatives:** Leave mobile on the rejected default headless-shell path, manually
resize the desktop project, or depend on installed branded Chrome.

## D026 — Cover the observed no-exact-results fallback

**Status:** Accepted

**Context:** The fallback scenario was provisional because catalogue behavior could
make an unlikely query ambiguous. Two fresh serial Playwright Test runs with
`phase03exactnomatch7f92c4` produced the same query heading, explicit no-exact-results
message, related-object heading, and real lot links.

**Decision:** Add one Chromium fallback scenario through the existing `search` and
`results` fixtures. Assert the exact query URL and H1, the explicit fallback message,
and at least one accessible real-lot link. Do not assert an exact related-lot count,
identities, or ranking.

**Alternatives:** Defer the scenario despite repeatable evidence, or hardcode the
current related-object count/content.

## D027 — Keep known delayed consent recovery fixture-owned and bounded

**Status:** Accepted

**Context:** Hosted feasibility runs observed the same delayed Usercentrics UI around
search and lot-navigation actions. Capability-specific visibility prechecks and retry
catches duplicated framework plumbing and could obscure action ownership.

**Decision:** Register one Playwright locator handler in the shared page fixture. Scope
it below `aside#usercentrics-cmp-ui`, match only the complete `Accept all`, `Accept all
cookies`, and `Continue in English` action names case-insensitively, click normally,
retain Playwright's default post-handler disappearance wait, and remove the handler
after two invocations. Prove delayed handling, approved capitalization, exact-name
rejection, bounded exhaustion, unrelated action failure, and arbitrary-dialog isolation
against in-memory page content.

**Alternatives:** Retain capability-specific recovery, create a generic dialog handler,
force clicks, add sleeps, or retry arbitrary failed actions.

## D028 — Retain browser evidence only for failed or flaky runs

**Status:** Accepted

**Context:** A controlled network-free CI run proved that the standard HTML report,
first-attempt and retry traces, screenshot, error context, and bounded diagnostics can
be downloaded together. Clean hosted smoke runs need no retained artifact.

**Decision:** Upload `playwright-report` and `test-results` only when the browser-test
step fails, with project-specific names and seven-day retention. A retry pass remains a
failed flaky signal.

**Alternatives:** Upload every clean run, retain artifacts long-term, or add a custom
reporter or external dashboard.

## D029 — Serialize separate manual regression dispatches

**Status:** Accepted

**Context:** Matrix `max-parallel: 1` serializes projects inside one workflow run but
does not prevent two separately dispatched runs from contacting production together.

**Decision:** Give manual production regression one constant workflow-level
concurrency group with `cancel-in-progress: false`. A later dispatch waits for the
active run, while the Quality workflow retains its independent per-PR cancellation
group.

**Alternatives:** Rely only on matrix serialization, share Quality concurrency, cancel
the active regression, or launch overlapping runs to manufacture validation evidence.

## D030 — Own asynchronous search readiness in HeaderSearch

**Status:** Accepted

**Context:** The first hosted WebKit regression showed the correct semantic combobox
appearing shortly after the default five-second assertion budget on both attempts. No
selector, consent, or browser-compatibility defect was identified.

**Decision:** Apply a ten-second timeout only to the final search-input visibility
assertion in `ensureSearchReady()`. Keep global assertion, action, navigation, and test
timeouts unchanged.

**Alternatives:** Increase framework-wide timeouts, add a fixed wait, or introduce
browser-specific selectors or branches.

## D031 — Recover one consent-collapsed compact submission

**Status:** Accepted

**Context:** The first hosted mobile regression showed the existing fixture handler
successfully dismiss delayed known consent, after which the product collapsed compact
search and left the pending Search click targeting a hidden button.

**Decision:** Privately record successful known-consent handler interactions. If and
only if a button submission then fails before reaching the expected query URL, the
input is hidden, and exactly one compact opener is visible, `HeaderSearch` may reopen
once, restore the original query only when needed, and submit once more. The second
failure surfaces directly. Deterministic locally fulfilled fixture contracts cover the
normal path, recovery, one-attempt bound, unrelated failures, and dialog isolation.

Required local mobile validation subsequently observed the same known handler collapse
compact search after the opener action but before initial input readiness. The same
evidence predicate permits one readiness reopen in that state; this is separate from
and does not broaden failed-action recovery.

**Alternatives:** Change the working handler or its bound, retry arbitrary click
failures, expose responsive details to specs, force-click, sleep, or add browser-specific
logic.
