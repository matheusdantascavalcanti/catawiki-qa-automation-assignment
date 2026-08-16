# Phase 01 — Foundation

**Status:** Complete

## Objective

Create and independently audit the smallest professional Playwright + TypeScript foundation that makes the intended contributor workflow and future fixture API possible. This is a local-only phase; do not automate Catawiki behavior or create remote collaboration infrastructure.

## Prerequisites

- Planning documents approved.
- Current compatible patch versions rechecked against official release/package metadata.
- Node 24 LTS available locally.
- No unrelated user changes overlap the new project files.

## Files likely affected

- `package.json` and `package-lock.json`
- `playwright.config.ts`
- `tsconfig.json`
- ESLint and Prettier configuration
- `tests/fixtures/test.ts`
- `.gitignore`
- contributor portions of `README.md`

## Implementation tasks

1. Initialize the local npm project without publishing it.
2. Install only the required development dependencies: Playwright Test, TypeScript, ESLint/typescript-eslint, `eslint-plugin-playwright`, and Prettier.
3. Pin compatible tool versions through the lockfile and record any change from researched versions in the decision log.
4. Enable strict TypeScript and no emitted build output.
5. Configure Playwright projects and global production-safety defaults without writing browser scenarios.
6. Create the stable `tests/fixtures/test.ts` import location. It may initially re-export base `test`/`expect`; do not create unused capabilities.
7. Add formatting, lint, and typecheck scripts and expose them through `npm run check`.
8. Configure `eslint-plugin-playwright` for test files, including focused-test, fixed-wait, missing-await, force, `networkidle`, conditional-test, and web-first assertion guardrails.
9. Configure `expect-expect` for the planned `expect…` capability convention.
10. Keep `no-nth-methods`, `no-raw-locators`, and `require-tags` disabled for the documented reasons.
11. Document the initial commands and supported Node version.
12. If the local Git repository does not exist, initialize it with `main` as the default branch; do not add a remote.
13. Run a focused Phase 01 audit in a fresh session before committing. The audit should inspect toolchain restraint, scripts, configuration, guardrails, tracked-file hygiene, and agreement with the approved plan.
14. Evaluate and address valid audit findings, then rerun all local validation.
15. Verify the Git author identity and inspect the exact files to be committed.
16. Create one intentional local foundation commit and confirm the worktree is clean.

`npm run check` may cover only format/lint/typecheck until a genuine browserless unit test exists in Phase 02. Do not add a placeholder test.

## Validation commands

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run check
npx playwright test --list --pass-with-no-tests
git diff --check
git status --short
```

The test listing may be empty but configuration loading must succeed without contacting
Catawiki. `--pass-with-no-tests` makes this deliberate zero-test verification pass.

## Acceptance criteria

- A fresh checkout can reproduce dependencies with `npm ci`.
- Strict typecheck, lint, and formatting checks pass.
- The project fixture module is the documented import path.
- No Playwright browser test or Catawiki capability has been implemented.
- No remote repository, GitHub Actions workflow, GitHub branch, or pull request exists.
- Static configuration reflects one-worker/read-only production defaults.
- README and `docs/adding-tests.md` commands agree with `package.json`.
- A fresh-session audit was completed before any private publication.
- Valid audit findings were resolved or explicitly rejected with evidence.
- Git author identity and tracked-file hygiene were verified before the local commit.
- The approved foundation is represented by an intentional local commit and the worktree is clean.
- The phase is explicitly approved to proceed to Phase 01.5.

## Out of scope

- Catawiki navigation or locators.
- Search/results/lot capability implementation.
- Domain parsers and unit tests.
- Diagnostics listeners.
- Browser installation beyond what is needed to verify configuration.
- GitHub Actions or remote repository creation.
- Pull requests, remote branches, or repository-visibility changes.

## Questions to answer before proceeding

- Do the exact current Playwright, TypeScript, ESLint, and plugin patch versions install without peer-dependency warnings?
- Does TypeScript 6.0 remain supported by the selected typescript-eslint patch?
- Does `retryStrategy: 'isolated'` typecheck in the selected Playwright version?
- Can `expect-expect` recognize member calls whose property begins with `expect` using the planned rule configuration?
- Is the configured Git author identity appropriate for an assignment that will eventually become public?
- Does the focused audit find any generated, local, or sensitive file that must be excluded before the Phase 01 commit?

Record answers as evidence; update the decision log if the approved defaults are incompatible.

## Implementation evidence

Evidence gathered on 2026-08-16 before locking the Phase 01 dependency graph:

- Official npm package metadata identified compatible patches: Playwright Test 1.62.1, TypeScript 6.0.3, ESLint 10.8.1, typescript-eslint 8.67.0, eslint-plugin-playwright 2.11.0, and Prettier 3.9.6.
- A clean install of those exact versions on Node 24.19.0 and npm 11.17.0 completed without peer-dependency or engine warnings.
- npm 11.17.0 identified Playwright's optional macOS dependency `fsevents@2.3.2` as the only package with an install script. Its native build script is narrowly approved through a version-pinned `allowScripts` entry; no global script bypass is enabled.
- typescript-eslint 8.67.0 declares TypeScript `>=4.8.4 <6.1.0` and ESLint `^8.57.0 || ^9.0.0 || ^10.0.0`, so TypeScript 6.0.3 and ESLint 10.8.1 are supported.
- Playwright 1.62.1 declares and implements `retryStrategy: 'isolated'`; the selected setting passes strict project typechecking.
- eslint-plugin-playwright 2.11.0 supports `assertFunctionPatterns`. An ESLint API probe confirmed that the configured `^expect` pattern accepts `results.expectLoadedFor(...)` as an assertion and still reports an otherwise assertion-free test.
- Git is initialized locally on `main` with no remote. The pre-commit author identity was verified as `matheusdantascavalcanti <matheusdantascavalcanti@gmail.com>`.
- NVM is available locally and `.nvmrc` selects Node 24. The final validation used Node 24.19.0 and npm 11.17.0, with no engine warnings.
- The independent audit's zero-test finding is resolved by using `npx playwright test --list --pass-with-no-tests` for Phase 01 configuration discovery; no placeholder test was added.
- ESLint now restricts direct `@playwright/test` imports only in `tests/**/*.{spec,test}.ts`, directing test authors to the fixture seam while leaving `tests/fixtures/test.ts` able to re-export Playwright.
- Final Node 24 validation passed: `npm ci`, format check, lint, strict typecheck, aggregate check, zero-test Playwright discovery, and `npm ls`.
- Before the initial commit, the complete staged file list and diff were reviewed; `git diff --cached --check` passed and confirmed no generated, local, sensitive, environment, or browser-state files were staged.

## Completion sequence

```text
implement foundation
  → validate locally
  → fresh-session Phase 01 audit
  → address valid findings
  → revalidate
  → verify Git identity and tracked files
  → intentional local commit
  → approved for Phase 01.5
```
