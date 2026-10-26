---
title: Copilot TaskBoard Demo
description: A step-by-step guide to replaying the open-task filter change with GitHub Copilot.
---

## What you will build

Replay one small, end-to-end change in a local TaskBoard app: add an "Open only"
button that requests open tasks from the API. You will inspect the requirement,
plan, add failing HTTP tests, implement the change, review the diff, and check
the UI in a browser.

The repository has two useful reference points:

* `main` is the baseline, with four passing HTTP integration tests and no filter.
* `feature/open-filter` is the completed reference, with twelve passing tests.

The completed branch is a reference, not proof that Copilot produced the change
during your replay. Keep your replay on a separate branch.

## Contents

* [Prerequisites](#prerequisites)
* [Get the repository](#get-the-repository)
* [Run the baseline](#run-the-baseline)
* [Choose VS Code Agent or Copilot CLI](#choose-vs-code-agent-or-copilot-cli)
* [Replay the change with Copilot](#replay-the-change-with-copilot)
  * [Inspect and plan without editing](#1-inspect-and-plan-without-editing)
  * [Add tests first and capture the red result](#2-add-tests-first-and-capture-the-red-result)
  * [Implement the smallest change](#3-implement-the-smallest-change)
  * [Review the diff](#4-review-the-diff)
  * [Check the UI in a browser](#5-check-the-ui-in-a-browser)
* [Compare with the completed reference](#compare-with-the-completed-reference)
* [Optional continuous live-demo prompt](#optional-continuous-live-demo-prompt)
* [Scope and troubleshooting](#scope-and-troubleshooting)

## Prerequisites

* Git
* Node.js 22 or later, with npm
* A browser
* To replay the agent workflow: VS Code with GitHub Copilot Chat, or GitHub
  Copilot CLI, signed in with an account that has access to Copilot.
* Copilot is not required to run and inspect the completed app.

The app has no runtime dependencies. No database, API key, account, or
environment setup is needed to run the app. Copilot itself requires sign-in
and may consume AI credits according to your account and model selection.

## Get the repository

In PowerShell:

```powershell
git clone https://github.com/Ch0wseth/copilot-taskboard-demo.git
Set-Location copilot-taskboard-demo
git fetch origin
git switch -c replay/open-filter origin/main
```

In Bash, Zsh, or another POSIX shell:

```bash
git clone https://github.com/Ch0wseth/copilot-taskboard-demo.git
cd copilot-taskboard-demo
git fetch origin
git switch -c replay/open-filter origin/main
```

This creates a new replay branch from the unfiltered baseline. If you already
have local work in another checkout, leave it untouched and use a separate
worktree for the completed reference. Run this from your existing checkout;
the destination directory must not already exist:

```bash
git fetch origin
git worktree add --detach ../taskboard-reference origin/feature/open-filter
```

The same `git` commands work in PowerShell. Open the replay checkout in your IDE
before starting the prompts below.

## Run the baseline

Run the baseline tests:

```bash
npm test
```

Expect four passing tests. The suite starts a real HTTP server on an ephemeral
loopback port and makes HTTP requests; it does not mock the server.

Start the app:

```bash
npm start
```

Open <http://127.0.0.1:3000> in your browser. The server binds to loopback, so
it is available on your machine only. Stop it with `Ctrl+C`.

If port 3000 is occupied, use another port. In PowerShell:

```powershell
$env:PORT = "3001"
npm start
```

In Bash or Zsh:

```bash
PORT=3001 npm start
```

Then open <http://127.0.0.1:3001>. The server has no hot reload. After editing
backend files, stop it with `Ctrl+C` and run `npm start` again before checking
the change in the browser.

## Choose VS Code Agent or Copilot CLI

The demonstration is about **Copilot doing the engineering work**, not just
clicking a finished application. Keep the conversation, tool calls, changes,
and test results visible. The browser journey is the final verification step.

### VS Code Agent

From your baseline replay checkout:

```bash
code .
```

Open Copilot Chat, select **Agent**, and attach
`docs/feature-request.md` and `.github/copilot-instructions.md` as context.
Paste the phase prompts below one at a time. Inspect the proposed plan before
asking for tests or implementation. Expand tool results to show the actual
file reads, edits, commands, and test output.

Accept workspace trust only for a checkout you recognize. Review permission
requests rather than enabling unrestricted access for the demonstration.
If Copilot needs sign-in or entitlement activation, complete it in the IDE;
opening Chat alone does not prove the agent has started working.

### Copilot CLI

From your baseline replay checkout:

```bash
copilot
```

Paste the same phase prompts into the interactive terminal session. Review
the plan, tool approvals, edits, and actual test output as you proceed.
Use `/diff` to inspect changes in the CLI, or `git diff` in another terminal.
Do not use `/delegate`: this replay stays local and does not create a PR.

To open the CLI with the first read-only prompt already submitted:

```bash
copilot -i "Read docs/feature-request.md, .github/copilot-instructions.md, src/tasks.js, src/server.js, public/index.html, public/app.js and test/server.test.js. Do not edit files. Explain the current behavior, relevant invariants and a short implementation and verification plan. Stop and wait for my approval."
```

This is interactive: trust, sign-in, and tool permissions may require input.
Do not add `--allow-all` just to avoid those decisions.

### Show both without sharing edits

Use separate baseline clones if you want to demonstrate both interfaces:

```bash
git clone --branch main --single-branch https://github.com/Ch0wseth/copilot-taskboard-demo.git taskboard-vscode
git clone --branch main --single-branch https://github.com/Ch0wseth/copilot-taskboard-demo.git taskboard-cli
git -C taskboard-vscode switch -c replay/vscode
git -C taskboard-cli switch -c replay/cli
```

Open `taskboard-vscode` in VS Code and start `copilot` from `taskboard-cli`.
Use a new destination name if either folder already exists. Do not run both
agents against the same checkout. Neither agent should commit, push, or deploy.
If you start both apps, give them different ports as described above.

## Replay the change with Copilot

Use the same acceptance criteria throughout the replay. The source requirement
is [`docs/feature-request.md`](docs/feature-request.md). In your Copilot chat,
ask for one phase at a time and review the result before moving on.

### 1. Inspect and plan without editing

Paste this prompt into Copilot:

```text
Read docs/feature-request.md, .github/copilot-instructions.md, src/tasks.js,
src/server.js, public/app.js, public/index.html, and test/server.test.js.
Inspect the current branch and explain how the app and HTTP tests work. Then
give me a short implementation plan for the requested "Open only" filter.
Do not edit any files, run code-generation tools, or change branches. Wait for
my review of the plan.
```

Check that the plan keeps filtering in the API and preserves the existing
`{ items, count }` response contract and task order.

### 2. Add tests first and capture the red result

Ask Copilot to add behavior-focused HTTP integration tests only:

```text
Implement the test-first step for docs/feature-request.md. Edit only
test/server.test.js. Add real HTTP tests for GET /api/tasks?status=open,
including IDs 1 and 3 in the existing order, count 2, and the unchanged
unfiltered response with all four tasks. Cover blank, done, uppercase, unknown,
and repeated status parameters as 400 responses with the structured error.
Do not edit production files. Run npm test and report the failing test names
and results. Stop for my review.
```

The original four tests should still pass, while tests for the new behavior
should fail because the API does not yet filter or reject invalid status values.
Review the tests and the red output before continuing.

### 3. Implement the smallest change

After approving the tests, paste:

```text
Implement the approved open-task filter in src/tasks.js, src/server.js,
public/app.js, and public/index.html, editing only the files needed. Accept no
status parameter as the original four-task list; accept exactly one status=open and return only
open tasks; return a structured 400 for blank, unknown, uppercase, or repeated
status values. Preserve the { items, count } envelope and task order. In the UI,
add an "Open only" native button with aria-pressed, show the response count,
expose request errors, and allow the user to retry.
Disable the button while a request is pending and commit its pressed state only
after a successful response. Do not commit, push, publish, or deploy. Do not add dependencies,
authentication, persistence, or unrelated features. Run npm test and stop for
my review.
```

Review the changes and test output. The completed reference has twelve passing
HTTP integration tests: the original four, one successful filter test, and
seven invalid-query cases.

### 4. Review the diff

Ask Copilot to summarize, not modify, the change:

```text
Review my current changes against docs/feature-request.md and
.github/copilot-instructions.md. Do not edit files. Check the API contract,
validation, task order, error handling, button accessibility, and test
coverage. Summarize any gaps and wait for my decision.
```

You can also inspect the diff yourself:

```bash
git diff --check
git diff
```

Do not treat the completed reference branch as your replay's test evidence.

### 5. Check the UI in a browser

With the server running, refresh <http://127.0.0.1:3000> and check:

* Initially, the page shows four tasks and the button reports `aria-pressed="false"`.
* Click **Open only**. The page requests `/api/tasks?status=open`, shows task IDs
  1 and 3 in order, updates the count to two, and sets `aria-pressed="true"`.
* Click again. The page requests `/api/tasks`, restores all four tasks, and sets
  `aria-pressed="false"`.
* While a request is pending, the button is disabled. If a request fails, the
  list is cleared, the count says "Tasks unavailable", and an error is exposed.
  Once the request settles, the button is enabled so you can retry.
* Use the browser keyboard to focus and activate the native button.

To check the failure state, use your browser's developer tools to block the
tasks API request, click the button, and then unblock the request and click
again. The automated tests exercise HTTP behavior; they do not test the browser
UI or its accessibility.

You can ask Copilot to help with this verification using the following prompt.
Browser automation requires an actually available browser tool, such as
Playwright; it is not automatically available in every Copilot environment.

```text
Verify the feature against docs/feature-request.md. Run npm test and report the
actual output. If browser automation is available, exercise four tasks -> two
open tasks -> four restored tasks, keyboard activation with the button focused,
the disabled pending state, and a blocked request followed by a successful
retry. Check the network request and count/order. Restart the local server after
backend edits: npm start does not hot reload. Use only this local synthetic app,
not existing browser sessions or other sites. Do not install tools, modify code,
commit, push or deploy. Report exactly what ran and what remains manual; never
claim browser success from reading the code or passing HTTP tests alone.
```

## Compare with the completed reference

From the replay checkout, compare the two published branches:

```bash
git fetch origin
git diff origin/main origin/feature/open-filter
```

To run the completed reference without switching branches or disturbing your
replay, create the worktree shown above. In that worktree, run `npm test` and
`npm start`. Expect twelve passing tests. The README and replay instructions
are shared; the baseline and completed branches differ in application and test
code.

## Optional continuous live-demo prompt

For a presenter-led run, this prompt combines the phases. Unlike the guided
prompts above, it authorizes implementation after the agent presents its plan;
it does **not** stop for human approval between phases. Prefer the phased
version when you want the audience to inspect each checkpoint.

Paste it into VS Code Agent or an interactive `copilot` session in a fresh
baseline checkout:

```text
Demonstrate GitHub Copilot implementing one small feature in this baseline
repository. Work only in this checkout. Do not commit, push, publish, deploy,
install dependencies, or use subagents.

1. Read .github/copilot-instructions.md, docs/feature-request.md, src/tasks.js,
   src/server.js, public/index.html, public/app.js and test/server.test.js.
   Explain the current architecture, invariants and concise plan before editing.
2. Run the baseline HTTP tests. Add focused tests for the agreed feature only.
   Run them before implementation and show the real failing assertions.
3. Implement the smallest API-backed Open only filter. Add the missing native
   button in public/index.html and wire public/app.js with aria-pressed, response
   count, disabled pending state, visible error and retry. Commit toggle state
   only after success. Validate before filtering in src/tasks.js. Missing status
   returns all four tasks; exactly one status=open returns IDs 1 and 3. Blank,
   unknown, uppercase and duplicate status values return structured 400 errors.
   Preserve order, the unfiltered data and the { items, count } envelope.
4. Run npm test, git diff --check and git diff --stat. Explain the meaningful
   diff, actual results and checks not run. Do not claim browser validation
   unless you actually performed it. Do not leave servers running. Remind me
   to restart npm start after backend edits because there is no hot reload.

Narrate context -> plan -> failing tests -> edits -> passing tests -> review.
Do not invent results or silently skip a failure. Stop when ready for review.
```

Copilot output is nondeterministic. The reference has four baseline tests and
twelve completed tests, but evaluate the generated assertions and behavior,
not just whether the agent produces the same number of tests.

## Scope and troubleshooting

This demo does not create a pull request, configure repository branch rules,
deploy the app, authenticate users, or connect an MCP server. GitHub Actions
does run the test suite on pushes and pull requests; it does not open a pull
request for you.

* If `node` or `npm` is not recognized, install Node.js 22 or later and open a
  new terminal.
* If Git reports that the replay branch already exists, choose another branch
  name, such as `replay/open-filter-2`. Do not reset or delete a branch to
  continue.
* If port 3000 is busy, set `PORT` as shown above and use the matching browser
  URL.
* If browser behavior does not reflect a backend edit, restart `npm start` and
  refresh the page.

For the full acceptance criteria, see [`docs/feature-request.md`](docs/feature-request.md).
