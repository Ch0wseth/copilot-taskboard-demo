---
title: "Run the small SDLC demo"
description: "A local application, a feature branch and evidence for the session."
---
<!-- markdownlint-disable-file -->

## Run

Use Node.js 22 or later. Run `npm ci --ignore-scripts`, `npm test`, then `npm start`.
Open <http://127.0.0.1:3000>. Stop the server with Ctrl+C.
An occupied port produces an explicit error; set `$env:PORT=3001` to use another.

## Branches

`main` is the runnable baseline, without the open-only filter.
`feature/open-filter` is the completed and tested reference.
Start a rehearsal on a new branch from main with `git switch -c rehearsal main`.
The completed reference remains available without resetting or deleting work.

## Context for the agent

Attach docs/feature-request.md, src/tasks.js, src/server.js, public/app.js and the tests.
Ask for a plan before implementation. Keep the same requirement throughout.
The prepared feature commit is reference code, not proof of an agent-generated live result.

## Evidence

Use `git diff main...feature/open-filter` and `npm test`.
The test suite uses real HTTP requests to a server on an ephemeral loopback port.
The UI still needs a real browser check for toggle, count, keyboard and failures.
The API tests alone do not prove accessible rendering or browser correctness.

## Boundaries

No remote repository is created or pushed by the kit.
The Actions workflow is runnable configuration, not evidence of a remote CI execution.
There is no production deployment, configured security scanner or real incident.
MCP and a custom reviewer in the slides are host-specific examples, not preinstalled tools here.
