---
title: "GitHub Copilot: roles, skills, and visible proof"
description: "Replay a tiny TaskBoard change with custom agents, an independent API skill, and human checkpoints in VS Code or Copilot CLI."
---
<!-- markdownlint-disable-file -->

# GitHub Copilot: roles, skills, and visible proof

Watch Copilot turn a requirement into a plan, failing tests, a focused diff,
and a reviewed implementation. Select a **Planner**, approve its plan, select
a **Builder**, then a **Reviewer**. Both use a real repository **skill**
with an unchanged HTTP verifier.

TaskBoard is deliberately tiny: four synthetic tasks, a Node.js API, and a
browser page. Adding an "Open only" filter exposes Copilot's decisions, tool
calls, failures, edits, and evidence, not just a finished app.

**Show the work:** selected role -> approved plan -> loaded skill -> red
assertions -> implementation diff -> green checks -> independent review.
These are replay instructions, not a record of successful Copilot execution.

**Observed CLI rehearsal, 26 October 2026:** all three custom profiles were
selected in real sessions and `taskboard-api-check` activated natively. In an
isolated baseline checkout, Builder ran the original 4 tests, added tests that
failed before production edits, implemented the feature, then passed 16 generated
HTTP tests and all 10 unchanged skill cases. A separate Reviewer session checked
the completed reference: 12 repository tests and 10 skill cases passed, without
edits. These observations do not certify a future replay or native VS Code
execution; browser runtime was not part of those CLI sessions.

## Contents

* [What the repository teaches Copilot](#what-the-repository-teaches-copilot)
* [Prepare a replay checkout](#prepare-a-replay-checkout)
* [Choose VS Code or CLI](#choose-vs-code-or-cli)
* [Replay with human checkpoints](#replay-with-human-checkpoints)
* [Run the tiny app and compare](#run-the-tiny-app-and-compare)
* [Optional extensions](#optional-extensions)
* [Troubleshooting and sources](#troubleshooting-and-sources)

## What the repository teaches Copilot

| Artifact | Purpose | Proof to show |
| --- | --- | --- |
| [Repository instructions](.github/copilot-instructions.md) | Always-loaded project guidance: invariants, stack, work boundary | Loaded instruction path and constraints reflected in the plan |
| [Feature request](docs/feature-request.md) | Authoritative acceptance criteria | API cases and UI checks traced to the requirement |
| [Planner](.github/agents/taskboard-planner.agent.md) | Custom agent ROLE: inspect and plan without edits or test execution | Selected agent and `Awaiting plan approval` |
| [Builder](.github/agents/taskboard-builder.agent.md) | Custom agent ROLE: approved, test-first implementation | Red failures, scoped diff, green results |
| [Reviewer](.github/agents/taskboard-reviewer.agent.md) | Custom agent ROLE: review and verification without edits | Selected agent, scoped findings, actual command results |
| [API skill](.github/skills/taskboard-api-check/SKILL.md) | On-demand SKILL: reusable procedure and reporting boundaries | Host skill-loading event, or explicit manual-loading disclosure |
| [Bundled verifier](.github/skills/taskboard-api-check/scripts/verify.mjs) | Independent, fixed HTTP oracle | Named `taskboard-api-check` output, case names, totals, exit status |
| [HTTP tests](test/server.test.js) | Existing tests plus tests Copilot generates during replay | New assertions failing before production edits, then passing |

Instructions describe how to work across tasks; a selected agent defines the
current role; a skill supplies a specialized procedure and executable resource.
Discovery of a skill's metadata is not the same as loading its procedure.
Running its script alone does not prove native skill activation.

The three profiles intentionally omit `tools` and `model`: they describe
behavior, do not pin a model, and do not create a read-only tool sandbox.
Actual tools, permissions, approvals, and defaults are host-managed. Review
execution requests; these files grant no automatic permissions.

**The human controls the sequence.** Switching selected profiles is not
isolated subagent execution or automatic orchestration. There is no configured
automatic handoff UI. A fresh review context exists only if you actually start
a new chat/session and supply the scope again.

### Keep two kinds of test evidence separate

Copilot writes feature tests in `test/server.test.js`. The independent skill
checks the same agreed contract without being rewritten by the Builder.
Keep the verifier outside `npm test` discovery; run its explicit command:

```text
node .github/skills/taskboard-api-check/scripts/verify.mjs
```

It imports the current checkout's server, uses an ephemeral loopback port,
makes real HTTP requests, and closes its server afterward. No running app,
external endpoint, dependencies, credentials, or browser is needed.

Expected checkpoints, not results claimed by this README:

| Checkout | `npm test` | Independent skill: 10 cases |
| --- | --- | --- |
| `origin/main` baseline | 4 passing tests | Red: open-filter case and 7 invalid-query cases fail; 2 pass |
| Replay before implementation | Original tests plus new failing feature assertions | Still red |
| `origin/feature/open-filter` reference | 12 passing tests | 10/10 green |

Generated test counts can vary; inspect assertions, not just totals. Never
weaken the skill or requirement. HTTP success does not prove UI correctness.

## Prepare a replay checkout

Prerequisites: Git, **Node.js 22+** with npm, a browser, and either VS Code with
GitHub Copilot Chat or GitHub Copilot CLI. Sign in with Copilot access; account
policies, availability, and AI-credit usage apply. No MCP server is installed
or required. Running the app itself needs no Copilot account or package install.

**Windows Command Prompt (CMD)** - use `cd /d` when changing drive and directory:

```bat
cd /d "%USERPROFILE%"
git clone https://github.com/Ch0wseth/copilot-taskboard-demo.git
cd copilot-taskboard-demo
```

**PowerShell:**

```powershell
Set-Location $HOME
git clone https://github.com/Ch0wseth/copilot-taskboard-demo.git
Set-Location copilot-taskboard-demo
```

**Bash/Zsh (POSIX):**

```bash
cd ~
git clone https://github.com/Ch0wseth/copilot-taskboard-demo.git
cd copilot-taskboard-demo
```

Then, in that checkout in any shell:
```text
git fetch origin
git switch -c replay/open-filter origin/main
node --version
node -p "require('./package.json').name"
```

The last command must print `copilot-taskboard-demo` before you run `npm test`.
No `npm install` is needed. Keep local work intact; use a new folder/branch name
if one already exists. Confirm the linked profiles and skill are present on
your baseline checkout; stop if missing rather than inventing substitute roles.

For simultaneous VS Code and CLI demonstrations, use **two separate clones**
with distinct names and replay branches. Never share their working tree.

## Choose VS Code or CLI

### VS Code: select roles in the custom agent picker

Open the replay folder (`code .`), then Copilot Chat. In the **Agent** dropdown
(custom agent picker), select `taskboard-planner`, later `taskboard-builder`,
then `taskboard-reviewer`. Use a supported local workspace session; do not
substitute a cloud coding task for this local replay.

For skill execution in stages 2 and 4, invoke this in the selected role:

```text
/taskboard-api-check Verify the current checkout; report actual HTTP results and limits.
```

Invoke only when a stage authorizes verification, not during planning. Expand
skill-loading and terminal results. If unsupported, ask Copilot to read
`SKILL.md` and its script and follow them **manually**. Label that fallback
as manual loading, not native activation.

### CLI: select roles and inspect discovery explicitly

From the replay repository root, start the interactive CLI:
```text
copilot
```

Run these inside Copilot, not CMD/PowerShell:
```text
/instructions
/skills list
/skills info taskboard-api-check
/agent taskboard-planner
```

If files were added after startup, use `/skills reload` and inspect again.
At the appropriate checkpoints select:

```text
/agent taskboard-builder
/agent taskboard-reviewer
```

Request `Use /taskboard-api-check`; show loading and script execution, or
disclose manual loading. Use `/diff` to inspect edits.
Do not use `/delegate`: it sends work to GitHub to create a PR, not this local
replay. Do not use `--allow-all` to bypass approval decisions.

## Replay with human checkpoints

Paste one stage at a time. Keep tool calls and real output visible. All stages
stay in the current checkout: no branch changes, commits, pushes, deployments,
package installation, or automatic delegation. Approve only the intended tools.

### 0. Discover context, agents, and skill

Before feature work, use the host controls above and ask:

```text
Do not edit files or execute tests/scripts. Identify the loaded repository
instructions, current checkout, available taskboard custom agents, and
taskboard-api-check skill location. Distinguish discovered metadata from
native skill activation. Read docs/feature-request.md. Summarize the
acceptance criteria and anything unavailable. Stop before planning or edits.
```

**Show/stop:** actual discovery evidence. Resolve missing artifacts or sign-in.

### 1. Select taskboard-planner: read the plan, no edits

Choose `taskboard-planner` in VS Code or `/agent taskboard-planner` in CLI:
```text
Plan docs/feature-request.md using your Planner role. Read the instructions,
source, existing HTTP tests, and skill procedure. Do not edit or run tests
or scripts. Identify the baseline's missing native button, affected files,
API validation cases, and UI pending/error/retry checks. Explain expected
red/green evidence. Return a short plan and stop for my approval.
```

**Show/stop:** review paths, scope, and `Awaiting plan approval`. Do not approve
a plan that merely filters in the browser or assumes the button already exists.

### 2. Select taskboard-builder: skill baseline, tests red, STOP

Approve the plan explicitly and pass its text to `taskboard-builder`:
```text
I approve this plan: [paste the reviewed plan].
Use /taskboard-api-check natively if supported; otherwise disclose manual
loading of its SKILL.md. Inspect its script before execution. Run npm test
and the unchanged skill verifier first; show actual baseline results.
Then edit only test/server.test.js to add real HTTP feature tests.
Run npm test and show the new failing assertions. Do not edit production
code, skill files, profiles, instructions, or requirements. STOP after red
tests and wait for my approval; do not continue implementation yet.
```

The explicit human stop narrows the Builder's normally end-to-end role.
**Show/stop:** four baseline tests green; named skill output red; generated
tests red with failed assertions. If the feature already exists, report it;
do not fabricate failures. A permission/import/runtime error is blocked
verification, not the expected contract red.

The [requirement](docs/feature-request.md) is authoritative:

* No `status`: IDs 1, 2, 3, 4 in order; count 4.
* Exactly one `status=open`: IDs 1, 3, both open; count 2.
* `status=`, `status=done`, `status=OPEN`, `status=unknown`,
  `status=open&status=open`, `status=&status=open`, and `status=open&status=`
  return 400 with `{ "error": "Use exactly one status=open parameter" }`.
* Validate before filtering; preserve `{ items, count }`, original order,
  and subsequent unfiltered results. This is filtering, not authorization.

### 3. Continue Builder: implement, then green

After inspecting the red tests, send:

```text
I approve the red tests. Continue the approved implementation only.
Keep the requirement and independent skill unchanged. Add the native Open
only button and API-backed toggle. Use aria-pressed and textContent; show
the response count, disable while pending, commit toggle state only after
success, and expose an error with retry. Preserve the API contract.
Run npm test, rerun the unchanged skill verifier, git diff --check, and
git diff --stat. Report exact results, meaningful edits, and missing checks.
Stop for human review without committing, pushing, or deploying.
```

**Show/stop:** diff and real green outputs from both suites. Keep the verifier
outside test discovery. Agent-written tests alone are insufficient evidence.

### 4. Switch taskboard-reviewer: independent review, no fixes

Prefer a **new chat/session**, then select `taskboard-reviewer`. Pass the
scope and uncommitted diff, not just the Builder's success summary. In CLI,
`/diff` shows changes; the reviewer should inspect the working tree itself.
Switching profiles in the same conversation does not erase Builder context.

```text
Review the uncommitted Open only change against docs/feature-request.md.
Read git status --short, git diff HEAD, git diff --cached, and relevant
untracked implementation files. Inspect source as needed, not just the
Builder summary. Use /taskboard-api-check; disclose native or manual loading.
Execute its unchanged script, npm test, and git diff --check. Check invalid
queries, contract/order, UI states, tests, and any weakening of the oracle.
Do not edit files or fix findings. Return an evidence-backed verdict,
file/line findings, exact results, and missing checks. Stop for my decision.
```

**Show/stop:** `Ready for human review`, `Changes needed`, or `Verification
blocked`, with evidence. This is a separate review role, not proof of isolated
subagents. Return defects to Builder only after human approval.

### 5. Manually verify the UI: outside the HTTP skill

Restart the server after backend edits, then use the browser and DevTools:

* Start with four tasks, count 4, and `aria-pressed="false"`.
* Focus the native button with the keyboard; activate with Enter/Space.
* Observe `/api/tasks?status=open`, IDs 1 and 3 in order, count 2, pressed true.
* Activate again: `/api/tasks`, four tasks restored, pressed false.
* Throttle requests to inspect the disabled pending state.
* Block the tasks API request: verify a visible error, cleared list,
  "Tasks unavailable", unchanged committed toggle state, and re-enabled button.
* Unblock and retry: verify recovery, response count, and pressed state.

Record what you actually observed. The skill does **not** exercise UI, focus,
keyboard behavior, pending states, or retry. Source review cannot replace this.

## Run the tiny app and compare

From the folder containing `package.json`, run `npm start` and open
<http://127.0.0.1:3000>. Stop with Ctrl+C. There is **no backend hot reload**:
stop and restart `npm start` after backend changes, then refresh the browser.
For port 3001: CMD uses `set PORT=3001` then `npm start`; PowerShell uses
`$env:PORT = "3001"` then `npm start`; POSIX uses `PORT=3001 npm start`.

The completed branch is a reference, not live agent proof. Compare branch tips,
not a three-dot merge-base diff: documentation was shared by cherry-pick.

```text
git fetch origin
git diff origin/main origin/feature/open-filter
git worktree add --detach ../taskboard-reference origin/feature/open-filter
```

Enter that separate worktree using your shell's directory command before
running reference checks. Do not switch or reset your replay to copy a result.

## Optional extensions

**Separate from the staged replay:** on CLI versions/accounts supporting
`/fleet`, parallel independent reviews can expose different gaps. Extra
subagents can consume additional AI credits; check availability and permissions.
Start a separate general session, not a nesting of these no-delegation profiles:

```text
/fleet Review this uncommitted diff in two independent read-only threads:
API contract/test gaps and UI pending/error/retry gaps. Use built-in review
delegation only if supported. Do not edit, install, commit, push, or deploy.
Return evidence and limits; no browser success claims without execution.
```

If unsupported, skip it. Sequential profile switching above is not `/fleet`.

| Extension | Useful observable output | Prerequisites and current boundary |
| --- | --- | --- |
| MCP browser tools | Actual local browser interactions and failure/retry evidence | Separately configured trusted browser tools/runtime and approvals; none configured by this demo |
| GitHub issue + PR workflow | Requirement linked to a reviewable PR diff | Authenticated GitHub integration, repository permissions, explicit publish approval; not configured as part of this replay |
| CI feedback loop | Copilot explains an actual failed check and proposes a fix | Existing [CI workflow](.github/workflows/ci.yml) runs tests on push/PR; remote check/log access and agent feedback integration are not configured here |

## Troubleshooting and sources

* Missing `package.json`: enter the cloned folder, not its parent. On CMD,
  use `cd /d` for a drive change; PowerShell uses `Set-Location`.
* Missing Node/npm: install Node.js 22+ and open a new terminal.
* Missing profiles/skill: check checkout paths and host discovery; reload
  skills in CLI. Disclose manual loading if necessary; never fake activation.
* Existing branch/folder: choose a new name, not a destructive reset.
* Red skill on baseline is expected; runtime errors are not. Preserve the
  failed case names and exit status. Do not claim checks that could not run.
* Stale browser result: restart the backend; busy port: use another `PORT`.

Host behavior evolves. See [GitHub custom agent configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration),
[CLI skills and commands](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills),
[VS Code skills](https://code.visualstudio.com/docs/agent-customization/agent-skills),
and [VS Code custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents).
This local demo adds no authentication, persistence, deployment, or release gates.
