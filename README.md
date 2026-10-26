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

## Prerequisites

* Git
* Node.js 22 or later, with npm
* A browser
* A GitHub Copilot-enabled IDE is optional. You can run and inspect the completed
  app without Copilot.

The app has no runtime dependencies. No database, API key, account, or
environment setup is needed.

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
Implement the approved open-task filter in src/tasks.js, src/server.js, and
public/app.js, editing only the files needed. Accept no status parameter as
the original four-task list; accept exactly one status=open and return only
open tasks; return a structured 400 for blank, unknown, uppercase, or repeated
status values. Preserve the { items, count } envelope and task order. In the UI,
use the existing native button with aria-pressed, show the response count,
expose request errors, and allow the user to retry. Do not add dependencies,
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

## Compare with the completed reference

From the replay checkout, compare the two published branches:

```bash
git fetch origin
git diff origin/main...origin/feature/open-filter
```

To run the completed reference without switching branches or disturbing your
replay, create the worktree shown above. In that worktree, run `npm test` and
`npm start`. Expect twelve passing tests. The README and replay instructions
are shared; the baseline and completed branches differ in application and test
code.

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
