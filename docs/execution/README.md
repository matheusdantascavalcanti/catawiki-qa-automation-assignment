# Execution roadmap

Implementation is underway. Work one phase at a time and update the status only after its acceptance criteria pass.

| Phase                                                                     | Status      | Dependencies                            | Purpose                                                                         |
| ------------------------------------------------------------------------- | ----------- | --------------------------------------- | ------------------------------------------------------------------------------- |
| [01 — Foundation](phase-01-foundation.md)                                 | Complete    | Approved planning documents             | Establish and audit the local Playwright/TypeScript foundation                  |
| [01.5 — Collaboration foundation](phase-01-5-collaboration-foundation.md) | Complete    | Phase 01 audited and committed locally  | Establish private GitHub, PR conventions, and static CI                         |
| [02 — Assignment scenario](phase-02-assignment-scenario.md)               | Not started | Phase 01.5 merged and static CI working | Deliver the required journey and first real framework API through a PR          |
| [03 — Extra coverage](phase-03-extra-coverage.md)                         | Not started | Phase 02 merged and stable              | Demonstrate framework reuse through complementary coverage and a focused PR     |
| [04 — CI/CD](phase-04-ci.md)                                              | Not started | Phase 03 merged and locally reliable    | Expand CI to production smoke and manual risk-based regression through a PR     |
| [05 — Final review](phase-05-final-review.md)                             | Not started | Phase 04 merged                         | Audit, clean up through a final PR, and release the private repository publicly |

## Status meanings

- **Not started:** no phase implementation is authorized or complete.
- **In progress:** implementation has begun but at least one acceptance criterion remains.
- **Complete:** every acceptance criterion and validation command passed, and related documentation is current.
- **Blocked:** a documented external constraint prevents meaningful progress.

Do not start a later phase to avoid resolving an earlier phase's reliability problem.

## Effective sequence

```text
Phase 01 local foundation → local audit → intentional commit
  → Phase 01.5 private repository → bootstrap PR → static CI → review → merge
  → Phase 02 assignment PR → independent review → merge
  → Phase 03 reuse PR → independent review → merge
  → Phase 04 browser-CI PR → independent review → merge
  → Phase 05 final PR → audit → merge
  → private-to-public release → submission
```

After Phase 01.5, substantial work does not land directly on `main`. Each phase is a coherent increment, not a reason to create presentation-only micro-PRs.
