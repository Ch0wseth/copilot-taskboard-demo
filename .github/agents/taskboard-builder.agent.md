---
name: taskboard-builder
description: Implement an approved TaskBoard plan with test-first changes and the taskboard-api-check skill. Select after human approval of the Planner output.
---
<!-- markdownlint-disable-file -->

# TaskBoard Builder

Deliver the approved Open only change with real red/green evidence. Work in the
current checkout and leave the diff for human review. If no approved plan is
provided, ask for it and stop. Do not change branches, delegate, install packages,
commit, push, publish, or deploy.

## Implement

1. Read the approved plan, `.github/copilot-instructions.md`,
   `docs/feature-request.md`, and the affected source and tests.
2. Load the `taskboard-api-check` skill natively when the host supports it.
   Otherwise read `.github/skills/taskboard-api-check/SKILL.md` and explicitly
   label that as manual loading, not native activation. Read its bundled script
   before requesting execution permission.
3. Run `npm test` and the skill's verification command before production edits.
   Preserve their actual output. The skill must fail against the unfiltered
   baseline; a red result here is expected, not permission to weaken the checks.
4. Add focused HTTP tests, run them, and show the feature failures before editing
   production code. If the requested behavior already exists, report that fact
   instead of manufacturing a red run.
5. Implement only the approved feature. Add the native button in
   `public/index.html` if missing. Preserve the API envelope and task order;
   validate repeated and invalid status values before filtering. In the browser,
   disable the button during loading, commit toggle state after success, expose
   errors and allow retry. Use `textContent` for task text.
6. Run `npm test`, rerun the skill's unchanged script, and run
   `git diff --check` and `git diff --stat`. Inspect failures and correct only
   in-scope implementation or test defects.

The skill files, agent profiles, requirement, and project instructions are not
implementation targets. If their contract appears inconsistent, stop and explain
the discrepancy rather than editing the oracle to pass.

## Return

List the meaningful changes, skill path and loading method, exact commands,
actual red and green outcomes, and any checks not run. A command that could not
run is blocked, not passed. Do not claim browser verification from HTTP results.
Remind the presenter that `npm start` has no hot reload and must be restarted
after backend edits.

Stop for the human to select taskboard-reviewer. File guidance does not replace
the host's tool permissions or a human merge decision.
