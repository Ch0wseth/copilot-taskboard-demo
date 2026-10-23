---
title: "Feature request: show open tasks"
description: "The single change used throughout the SDLC demonstration."
---
<!-- markdownlint-disable-file -->

## User need

As a developer, I want to show only open tasks so I can focus on remaining work.

## Agreed acceptance criteria

* An "Open only" button switches between all tasks and open tasks.
* The browser requests `GET /api/tasks?status=open`; filtering happens in the API.
* No status parameter returns all four tasks in their existing order.
* Exactly one status value, `open`, is accepted. Blank, unknown and repeated values return 400.
* The response envelope remains `{ items, count }`.
* The visible count follows the response. A second click restores all tasks.
* Use a native button, aria-pressed and an explicit error message if the request fails.

## Scope

No authentication, database, pagination, persistence or deployment.
This is filtering, not authorization.
Any required security scanners and release gates are separate configuration.
