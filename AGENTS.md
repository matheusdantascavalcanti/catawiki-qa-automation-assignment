# Project map

This repository is a risk-based Playwright + TypeScript take-home. Before changing code, read the execution phase being worked on and the source documents it references.

- Requirements and boundaries: `docs/assignment.md`
- Verified product evidence: `docs/exploration.md`
- Coverage and test-layer choices: `docs/test-strategy.md`
- Framework API and structure: `docs/architecture.md`
- Contributor workflow: `docs/adding-tests.md`
- CI design: `docs/ci-strategy.md`
- Decisions and their status: `docs/decision-log.md`
- Phased implementation: `docs/execution/README.md`

## Durable principles

- Prefer product-risk coverage over test count.
- Import the project fixture; do not instantiate capabilities in specs.
- Keep tests read-only against Catawiki production. Never bid, favourite, register, log in, pay, or mutate data.
- Never circumvent WAF, bot detection, or rate limits.
- Prefer semantic locators. Use narrowly scoped CSS only when semantics cannot express the observed UI.
- Never use fixed sleeps for synchronization; wait for observable application state.
- Do not hardcode auction values or result identities that legitimately change.
- Identify the second actual lot before navigation and prove the same entity opened.
- Keep tests deterministic and retries diagnostic; a flaky pass is still a CI failure.
- Add abstractions only for reusable product capabilities, domain interpretation, diagnostics, or contributor safety.
- Run the validations listed in the active execution phase before finishing.
- Update architecture, strategy, and decision records when a design choice changes.
- Update phase status only when its acceptance criteria are actually met.

## Delivery workflow

- Read the active execution phase before making changes.
- Phase 01 is local-only. After Phase 01.5, do not implement substantial phase work directly on `main`.
- Use one focused branch and cohesive pull request for each approved increment; do not mix phases.
- Keep PR descriptions current under `Why`, `What changed`, `Framework impact`, `Validation`, and `Risks / tradeoffs`.
- Run relevant local validation before declaring a PR ready. CI does not replace product validation, and green CI does not authorize automatic merge.
- Separate implementation and review sessions. A fresh review session inspects before modifying and reports evidence-based findings as Staff QA engineer, maintainer, and future consumer.
- Evaluate review findings rather than applying them blindly. Require new evidence before contradicting accepted architecture.
- Never bypass production protections to make a PR green.
- Keep the GitHub repository private until the Phase 05 release step is complete.
