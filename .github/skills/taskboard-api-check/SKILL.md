---
name: taskboard-api-check
description: Verify the TaskBoard Open only HTTP contract with a bundled Node.js script. Use for baseline red evidence, post-implementation API verification, or reviewing the open-task filter.
---
<!-- markdownlint-disable-file -->

# TaskBoard API check

## Goal

Produce reproducible HTTP evidence for the Open only acceptance criteria in the
current checkout. This skill supplies a reusable procedure and executable oracle;
it is not an agent role, a browser test, or a new permission grant.

## Procedure

1. Read the repository's `docs/feature-request.md` and inspect
   [the verification script](scripts/verify.mjs) before running it.
2. From the repository root, execute:

   ```text
   node .github/skills/taskboard-api-check/scripts/verify.mjs
   ```

   The same command works in CMD, PowerShell and POSIX shells. Node.js 22+
   is required. No packages, running app, browser, credentials, or port
   configuration are needed.
3. Inspect the real exit code and failed assertions. The script imports this
   checkout's server, binds an available loopback port, makes real HTTP requests,
   and closes its server afterward. It never calls a remote endpoint.
4. Report the command, result, failed cases, and limits. On the baseline,
   feature-contract failures are expected red evidence. On an implementation,
   every case must pass before reporting that the API contract passed.

The ten cases check all four IDs, filtered IDs 1 and 3 with open status, original
order after filtering, the `items`/`count` envelope, and seven invalid queries
with structured 400 responses. Requests have timeouts. These cases are separate
from `npm test` and intentionally independent of agent-generated tests.

Do not edit the script, requirement, or expected values to turn a failure green.
Return the failed behavior to the Builder. If Node, permissions, server import,
or execution is unavailable, report verification blocked with the actual error.
Do not substitute a source-only assessment for execution.

## Evidence boundary

The host loads these instructions on invocation; a successful script run alone
does not prove native skill activation. State whether the host invoked the skill
or you read it manually. Do not claim browser, keyboard, error/retry UI,
accessibility, authentication, CI, or deployment checks from this HTTP result.
