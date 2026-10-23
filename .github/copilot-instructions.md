---
description: "Project conventions for the local TaskBoard demo."
---
<!-- markdownlint-disable-file -->

## Stack and commands

Node.js 22+, ESM, built-in HTTP server and test runner. No runtime dependencies.
Run `npm start` for the application and `npm test` for the HTTP integration suite.

## Invariants

Keep the API envelope `{ items, count }`, with count equal to items.length.
Validate query parameters before filtering. Return structured 400 errors.
Preserve task order and the unfiltered result. Use textContent for task text.
Keep feature changes scoped and add behavior-focused HTTP tests.

## Work boundary

Inspect the issue, source and tests before editing. Ask about unresolved semantics.
Report commands actually executed, their results and missing checks.
Do not publish, merge or deploy without authorization.
Instructions guide work; repository rules and credentials enforce permissions.
