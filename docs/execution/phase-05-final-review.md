# Phase 05 — Final reviewer audit

**Status:** Not started

## Objective

Review the finished private repository, its GitHub development history, and its public-release readiness from three perspectives: a Catawiki Staff QA engineer, a framework consumer, and a take-home reviewer assessing whether the engineering lifecycle is authentic rather than performative.

## Prerequisites

- Phase 04 PR reviewed and merged into private `main`.
- Local checks and authorized CI runs green without accepted flakes.
- README and all decisions updated to match implementation.
- Repository visibility confirmed as private.

## Files likely affected

- `README.md`
- `AGENTS.md`
- planning and contributor documentation
- tests/configuration only when the audit finds a concrete defect or unnecessary abstraction

Use one final focused branch and PR for reviewer-facing cleanup. `docs/final-review` is the default when the changes are primarily documentation; choose another accurate name if the actual diff has a different purpose.

## Review A — Catawiki Staff QA Engineer

Evaluate:

- Does each test address a distinct product or engineering risk?
- Is the second-lot oracle stronger than a superficial URL assertion?
- Are dynamic auction states modeled without hiding invalid states?
- Are test layers proportionate?
- Is the API-test rejection evidence-based?
- Is production interaction read-only, serial, and unscheduled?
- Do retries expose rather than hide flakes?
- Can a 403/429 be distinguished from a locator regression?
- Are artifacts concise enough to support triage?
- Is every abstraction justified by reuse, domain meaning, diagnostics, or contributor experience?

Delete or simplify anything that exists mainly to look senior.

## Review B — GitHub engineering history

Audit the repository's development record, not only its final tree:

- Do PRs represent coherent architectural increments rather than presentation-only micro-PRs?
- Does the Phase 02 PR establish reusable search/results/lot groundwork and explain its framework impact?
- Does the Phase 03 PR visibly reuse that groundwork with a smaller incremental cost?
- Did CI evolve logically from Phase 01.5 static checks to Phase 04 product/browser checks?
- Are PR descriptions useful under `Why`, `What changed`, `Framework impact`, `Validation`, and `Risks / tradeoffs` rather than ceremonial?
- Were independent agent-assisted review findings considered and addressed thoughtfully without fabricated human approval?
- Is commit history clean but authentic, with no manufactured timestamps, comments, reviewers, or last-minute whole-project squash?
- Are there excessive microcommits or PRs created only for presentation?

## Review C — New framework consumer

Assume a new QA Automation Engineer joins tomorrow and must add another search-related test without asking the framework author.

Verify they can discover:

1. where tests belong;
2. that tests import `test`/`expect` from the project fixture;
3. which fixtures and capability methods exist through autocomplete;
4. how and when to add a capability;
5. which locators are preferred;
6. how to wait for observable state;
7. which production actions are prohibited;
8. which local command is cheap and network-free;
9. which command reproduces the PR gate;
10. how projects/tags classify their test;
11. where traces, screenshots, and diagnostic JSON appear on failure.
12. how to move a focused change from current `main` through PR, CI, review, and merge.

Perform the exercise by drafting—but not necessarily retaining—a straightforward search test from `docs/adding-tests.md`. Flag any step requiring knowledge of responsive DOM, overlays, URL parsing, tracing, or listener internals. Adding the test should not feel disproportionately difficult.

## README audit

Keep the README concise and easy to scan. It should explain:

- architecture: fixture-based public API and capability-oriented internals;
- adding a test: link to `docs/adding-tests.md`;
- why each selected test exists;
- why there is no direct API suite;
- why production execution uses one worker;
- why there is no nightly production regression;
- why one retry is diagnostic and flaky still fails;
- why exact prices/counts are not asserted;
- how the selected second lot is proven after navigation;
- what would change inside Catawiki: controlled environments, accounts/data factories, service/API tests, auction clocks, contracts, concurrency tests, broad staging regression, and minimal production smoke.

The README should explain decisions, not duplicate all planning documents.

It may briefly show the professional contributor flow:

```text
npm run check → focused branch → PR → static CI → relevant browser validation
```

Do not mention employment, interview secrecy, or personal privacy concerns in the public README.

## Final private-to-public release

Treat repository visibility as a deliberate release step:

1. Confirm the repository is still private during the entire final review.
2. Run all final local validations and the authorized GitHub workflows.
3. Verify Actions checks, statuses, retry behavior, and report accessibility.
4. Audit the full repository and history for secrets, credentials, cookies/storage state, local paths, personal or company-specific configuration, package metadata, generated logs/screenshots, and Git identity concerns.
5. Audit historical GitHub Actions runs, logs, caches, and retained artifacts for information that should not become public; remove obsolete runs/artifacts where appropriate without falsifying development history.
6. Remove unnecessary internal artifacts while retaining useful engineering rationale.
7. Finalize the concise reviewer-facing README.
8. Open/update the final focused PR, complete independent review, address valid findings, and merge it.
9. Reconfirm clean private `main` and successful required checks.
10. Only then change visibility from private to public.
11. Verify the public repository renders correctly, links work, README is reviewer-ready, and CI/status information remains visible and understandable.
12. Produce the final public URL for submission.

Do not switch visibility early merely to test public behavior.

## Validation commands

```bash
npm ci
npm run check
npm run test:smoke
npm run test:regression
```

Also inspect:

```bash
npx playwright test --list
git status --short
```

Run networked commands deliberately and once; stop on evidence of target blocking.

## Acceptance criteria

- A new contributor can follow the guide without author assistance.
- Tests depend on the public fixture API, not framework internals.
- TypeScript autocomplete exposes predictable actions, reads, and contracts.
- Failure output identifies target-access evidence before misleading locator symptoms.
- README rationale is concise, accurate, and product-specific.
- No flaky test, unexplained skip, fixed sleep, state mutation, or anti-bot behavior remains.
- No unused abstraction, dependency, script, project, tag, reporter, or workflow remains.
- Documentation and actual commands/configuration agree.
- Repository history contains no secrets or generated artifacts.
- Phase PRs and commits form a coherent, authentic evolution without fabricated collaboration evidence.
- Static and browser CI evolution is understandable from history and documentation.
- Historical Actions runs/logs/artifacts were audited before public release.
- The final cleanup PR was independently reviewed and merged while the repository was private.
- Repository visibility changed to public only after all other acceptance criteria passed.
- The final public URL, rendering, links, README, and visible CI information were verified.

## Out of scope

- Adding new scenarios during final polish unless a critical documented gap is found.
- Expanding to authenticated or mutating flows.
- Publishing before the final audit and explicit release step authorize it.
- Adding enterprise tooling to address hypothetical scale.
- Rewriting authentic history solely to make the take-home appear cleaner.

## Questions to answer before submission

- Can a reviewer understand the product-specific oracle in under two minutes?
- Can a contributor add a search test using only README, `docs/adding-tests.md`, and autocomplete?
- Does any abstraction force them to understand unnecessary internals?
- Does every CI request to production provide enough confidence to justify its cost?
- Is every claim in README backed by implementation or documented exploration?
- Does the GitHub history show real leverage and reviewability rather than collaboration theatre?
- Is every historical workflow log/artifact safe to expose when visibility changes?
