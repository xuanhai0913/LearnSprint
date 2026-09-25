> R3 context: this document describes the historical quiz/API foundation. Current practice-A implementation is in [PowerLab local](POWERLAB-LOCAL.md); the broader education scope is in `docs/PROJECT-CONTEXT.md`. Do not treat the old instructions/checks below as completion of R3 E-requirements.

> Historical implementation notes below may contain earlier pending work. Use [current status](../delivery/STATUS.md) and the [R3 roadmap](../delivery/ROADMAP.md) for present scope.

# Local implementation

Updated: 2026-09-23. This document describes implemented source, not verified user-journey outcomes.

## Boundaries

React/Vite calls NestJS through the development proxy. The server reads the versioned REST/authentication pack and persists a single local learner's sessions in SQLite. `SessionRepository` and `AssessmentProvider` are replacement boundaries for future cloud storage and model integration.

Assessment is explicitly simulated: the caller selects an outcome, and the server returns fixture feedback and source excerpts. It never sends learner text to AWS. The previous one-call Bedrock approval was consumed by the playground preflight, not this app.

SQLite stores session JSON and request fingerprints in a transaction. Answers, selected next question and revision are saved together. Retry with the same request ID and payload returns current saved session state; a different payload with that ID conflicts. Stale revisions conflict. Browser drafts use sessionStorage and can disappear when a tab closes or storage is unavailable.

## Implemented HTTP contract

All paths use `/api`. JSON mutations require UUID `requestId`; existing-session mutations require `expectedRevision`.

| Method/path | Input / result |
| --- | --- |
| GET `/home` | Latest 30 sessions and pack metadata |
| GET `/sessions/:id` | Saved session, accepted answers and current question |
| POST `/sessions` | `timeBudgetMinutes`: 5, 10 or 15; creates planned session |
| POST `/sessions/:id/start` | Planned to active |
| POST `/sessions/:id/pause` | Active to paused |
| POST `/sessions/:id/resume` | Paused to active |
| POST `/sessions/:id/complete` | Ends session without grading remaining question |
| POST `/sessions/:id/answers` | `questionId`, `text` (1–4000 characters), `fixtureOutcome`; saves feedback and advances atomically |

`unable_to_assess` keeps the current question and does not count toward the scored limit. Sessions allow at most 12 submitted responses. Time choices map to 2/3/4 scored questions; they are intentions, not timers. A missing next question or already visited scored question can end a session earlier.

The source contract lives in `packages/contracts/src/index.ts`. The broader `DATA-AND-API.md` remains a target design, including domain operations not yet exposed by this prototype.

## Remaining work

- Owner review of content and rubric wording; full content scope.
- Requested runtime verification of save/resume, retry, conflicts, responsive and accessible journeys.
- Actual bounded model assessment, output validation, usage accounting and agreed invocation budget.
- Cloud persistence, real learner identity, throttling, deployment and judge access.
- Voice and optional MCP remain later scope.

Both development servers bind to loopback. Host/origin checks limit local API access; this is not production authentication. Stored learner answers are plaintext local data. No credentials belong in the frontend or repository.

## Build evidence

`pnpm install` completed and generated the lockfile. `pnpm build` exited 0 for API and web. `pnpm dev` reported Vite ready and Nest application successfully started, loading the pack and initializing SQLite. No automated tests or browser journeys were performed.

## Assessment boundary update

The active fixture provider now returns a Promise. Assessment runs before the session transaction, which revalidates state/revision before saving. A prepared, inactive [Bedrock adapter](BEDROCK-INTEGRATION.md) implements the same boundary. Validated server configuration can select it through AppModule; the default and current mode remain fixture. Live sessions have separate mode labels and cannot accept fixture outcomes. See the integration document for approval batch and reservation requirements.
