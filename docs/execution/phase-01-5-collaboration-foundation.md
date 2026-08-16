# Phase 01.5 — Private collaboration foundation

**Status:** In progress — bootstrap PR awaiting independent review

## Objective

Create the private GitHub collaboration foundation after Phase 01 passes its independent local audit. Establish how later framework increments enter the repository before product automation begins landing through pull requests.

## Prerequisites

- Phase 01 complete and approved by its focused audit.
- Local Git repository on `main` with an intentional Phase 01 commit history.
- Clean local Git status.
- Git author identity/email checked before the Phase 01 commit and reverified before push.
- GitHub CLI authentication verified for the intended personal account.
- No secrets, credentials, browser storage state, generated artifacts, machine-specific files, or inappropriate metadata tracked.

## Files likely affected

- `.github/pull_request_template.md`
- `.github/workflows/quality.yml`
- collaboration guidance in `README.md` and planning documents

## Planned workflow

1. Run `gh auth status` and verify the authenticated account is the intended owner.
2. Reverify Git author name/email and inspect the local commits that will become public later.
3. Audit tracked files, ignored files, status, and recent history for secrets and machine-specific artifacts.
4. Create `catawiki-qa-automation-assignment` on GitHub as **private** and verify its visibility explicitly.
5. Push the approved Phase 01 foundation and planning documents to remote `main`.
6. Create the focused bootstrap branch `chore/collaboration-foundation`.
7. Add a concise pull-request template with exactly these sections:

   ```markdown
   ## Why

   ## What changed

   ## Framework impact

   ## Validation

   ## Risks / tradeoffs
   ```

8. Add the smallest useful static workflow: checkout, selected Node LTS with npm cache, `npm ci`, and `npm run check`.
9. Use `contents: read` permissions and a concurrency group that cancels superseded runs for the same PR/branch.
10. Open a draft bootstrap PR, let the static workflow run, and update the description with actual validation evidence.
11. Have a fresh review session inspect the PR before modifying it, explicitly identifying itself as agent-assisted rather than fabricating a human approval.
12. Evaluate and address valid findings, rerun local checks and CI, merge the PR, and verify clean `main`.
13. Confirm the repository remains private after merge.

No Catawiki browser request may run in this phase.

## Validation commands and checks

```bash
git status --short
git log --oneline --decorate
git ls-files
git config user.name
git config user.email
gh auth status
npm ci
npm run check
```

After remote creation and the bootstrap PR:

- verify repository visibility through GitHub CLI/API rather than assuming it;
- verify the PR workflow runs only `npm ci` and `npm run check`;
- verify workflow permissions are read-only;
- verify superseded PR runs cancel as designed;
- verify `main` contains the approved foundation plus the merged collaboration guardrails.

## Acceptance criteria

- The GitHub repository exists and is explicitly verified as private.
- The initial remote `main` originated from the audited Phase 01 local commit.
- The collaboration foundation was added through one focused bootstrap PR.
- The PR template is concise and useful.
- Static GitHub Actions successfully run `npm ci` and `npm run check`.
- Future work can be proposed through focused branches and PRs.
- No Catawiki network traffic occurred in CI.
- Permissions are minimal, obsolete runs are not accumulating, and local/remote `main` are clean and synchronized.
- No fake reviewer, approval, project ceremony, or manufactured history exists.

## Out of scope

- Catawiki browser smoke or browser installation.
- Browser/device matrices or production regression.
- Scheduled workflows, sharding, or parallel test workers.
- Browser reports, traces, screenshots, or other artifact-heavy reporting.
- Deployment, releases, semantic release, version bumps, or changelog automation.
- CODEOWNERS or branch-protection theatre for a single contributor.
- Issue templates, fake Jira tickets, project boards, sprints, or fake reviewers.

## Questions to answer before proceeding

- Is the authenticated GitHub account and Git identity appropriate for the eventual public submission?
- Does the static workflow run successfully on the bootstrap PR without browser installation or Catawiki traffic?
- Is the repository visibility returned as `PRIVATE` after creation and after merge?
- Does the PR template improve review comprehension without adding ceremonial fields?

## Implementation evidence

Evidence gathered on 2026-08-16 before opening the bootstrap pull request:

- GitHub CLI 2.91.0 is authenticated to the intended personal account
  `matheusdantascavalcanti`; the Git author and committer identity is
  `matheusdantascavalcanti <matheusdantascavalcanti@gmail.com>`.
- The Phase 01 baseline was clean and contained one intentional commit. Tracked-file,
  ignore-rule, credential-signature, generated-artifact, and machine-path audits found
  no material that should be excluded before publication.
- `matheusdantascavalcanti/catawiki-qa-automation-assignment` was created without an
  initialization commit. GitHub's API explicitly confirmed private visibility through
  both its `visibility` and `isPrivate` fields.
- Remote `main` resolves to the audited Phase 01 commit
  `e1eee875225deba79ed44a79b9c2b14cb2aead88`.
- Phase 01.5 implementation is isolated on `chore/collaboration-foundation` and adds
  the approved five-section pull-request template plus one static workflow.
- The workflow grants only `contents: read`, cancels superseded runs for the same pull
  request or branch, restores npm's cache from `package-lock.json`, and runs only
  `npm ci` followed by `npm run check` after checkout and Node setup.
- No browser installation, browser execution, Catawiki request, secret, generated
  artifact, or product-facing automation is part of this increment.

The actual pull-request workflow result and URL will be recorded in the pull-request
description after GitHub Actions executes. The phase remains in progress until the
required independent review, any evidence-based follow-up, merge, and post-merge
privacy/synchronization checks are complete.
