# Catawiki QA automation assignment

This repository contains a risk-based Playwright and TypeScript automation framework. Phase 01 provides only the local toolchain and contributor guardrails; it intentionally contains no browser scenarios or Catawiki capabilities yet.

## Prerequisites

- Node.js 24 LTS
- npm 11 or the npm version bundled with your Node 24 installation

The project declares Node `>=24 <25`. Check your runtime before installing:

```bash
node --version
npm --version
```

## Install

Install the exact dependency graph recorded in `package-lock.json`:

```bash
npm ci
```

## Validate

Run all currently available static checks:

```bash
npm run check
```

The aggregate check runs formatting verification, ESLint, and strict TypeScript typechecking. To run a single check:

```bash
npm run format:check
npm run lint
npm run typecheck
```

Verify that Playwright configuration and project discovery load without running a browser or contacting Catawiki:

```bash
npx playwright test --list --pass-with-no-tests
```

The test list is expected to be empty during Phase 01; `--pass-with-no-tests`
verifies that configuration loads successfully in that intentional state. Browser suite
commands will be introduced only alongside genuine scenarios in later approved phases.

## Test author entry point

All future spec and test files import `test` and `expect` from
`tests/fixtures/test.ts`, never directly from `@playwright/test`. ESLint enforces this
at the spec/test boundary while allowing the fixture module to remain the simple
Playwright re-export it needs to be until reusable product capabilities exist.

See `docs/adding-tests.md` for contribution conventions and `docs/architecture.md` for the approved framework design.

## Collaboration workflow

After Phase 01, each approved increment is proposed from a focused branch through a
pull request. Keep the description current under `Why`, `What changed`, `Framework
impact`, `Validation`, and `Risks / tradeoffs`, and leave review-driven changes for a
separate independent review session.

The current GitHub Actions gate runs only `npm ci` and `npm run check` with read-only
repository access. It does not install browsers or contact Catawiki.
