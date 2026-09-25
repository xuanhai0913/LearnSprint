> **Historical R3 scope, superseded 2026-09-23:** the owner selected an operations-coordinator job simulation. Use the [current R4 plan](../career/TECHNICAL-CONTRACT.md). This file preserves earlier PowerLab scope/evidence and must not drive new feature work or be copied as the current submission story.

# Lab data and command contracts

Type: reference. Revision 3. Target contracts for R3. Practice-A sessions, artifacts, runs and manual action receipts now have a local subset; [PowerLab local implementation](POWERLAB-LOCAL.md) is authoritative for the implemented HTTP fields and retry semantics. Remaining coach/voice/phase/report contracts are proposed. Existing quiz endpoints are documented separately in [legacy local implementation](LOCAL-IMPLEMENTATION.md).

## Records

| Record | Required fields / invariant |
| --- | --- |
| LessonPack | ID, version, objectives, sources, variants, device ratings, constraints, allowed interventions, oracle version; immutable once used |
| LearnerSession | Opaque owner ID, lesson/version, phase, artifact revision, created/updated times; no default shared public learner |
| LabArtifact | Device-by-slot schedule, variant and revision; only validated supported IDs |
| RunReceipt | Run ID, owner/session, artifact revision/hash, engine/oracle version, Wh/W/service results, timestamp; immutable |
| ActionEvent | Command ID, source manual/text/voice, before/after revisions, minimal operation; no hidden reasoning or raw audio |
| AssistanceEvent | Activity/source IDs, run reference, mode live/authored, requested/viewed time; cannot be removed by reset |
| Attempt | Variant, attempt number, result, conceptual-assistance state, input method and elapsed time since practice |
| CoachInvocation | Reservation ID, model/region, context version, returned usage, status/error; preserve uncertain cost |
| VoiceSession | Connection reservation, session owner, start/end, billable usage if returned, tool receipts, close reason |
| ReportGrant | Hashed random capability, session scope, expiry, revocation, explicit learner sharing action |

Progress labels are derived from attempts and receipts. No stored LLM-generated `masteryScore` or inferred learner identity/ability category.

## Proposed HTTP surface

| Operation | Route | Key behavior |
| --- | --- | --- |
| Start supported lesson | `POST /api/lab/sessions` | Creates isolated identity/session and A artifact |
| Read/resume | `GET /api/lab/sessions/:id` | Requires owner capability; restores factual state |
| Apply edit | `POST /api/lab/sessions/:id/commands` | Typed operation, `expectedRevision`, idempotency key |
| Run artifact | `POST /api/lab/sessions/:id/runs` | Evaluates explicit revision; creates immutable receipt |
| Request intervention | `POST /api/lab/sessions/:id/coach` | Phase check, budget reservation, bounded model workflow |
| Change phase / request help | `POST /api/lab/sessions/:id/phase` | Server checks prerequisites; assistance transition is durable |
| Create voice ticket | `POST /api/lab/sessions/:id/voice-ticket` | Short-lived one-use session scope; no long-term credentials |
| View report | `GET /api/lab/sessions/:id/report` | Owner-only report preview |
| Create/revoke share | `POST /api/lab/sessions/:id/report-grants` | Explicit scoped grant; revoke operation separately identified |

Use 400 for invalid data, 401/403 for access failures as applicable, 409 for stale state, 429 for application limits, and a recoverable provider error without leaking configuration. The command receiver, not the caller/model, determines owner identity. Private reads are not publicly cached.

## Commands exposed to voice

`set_device_slot`, `move_device_period`, `run_plan`, `compare_runs`, `read_constraint`, `request_coaching`, `pause_session`, `resume_session`.

Tools return `{status, commandId, sessionId, revision, receiptId?, displaySummary}`. Commands require schema validation and session-scoped ID lookup. Large/ambiguous edits return a proposal for confirmation. A specific reversible edit may apply immediately with undo. A duplicate command returns its original receipt instead of applying twice.

During independent B/C, `request_coaching` cannot reveal a hint before the learner explicitly changes to assisted mode. `compare_runs` may reference the current attempt's own runs, not hidden reference schedules or practice solution history. Pack answers and independent oracle fixtures never enter the model's allowed retrieval scope.

## Phase machine

`brief → practice → ready_for_transfer → independent_transfer → transfer_complete → review_available → independent_review → summary`.

Branches: `assisted_transfer`, `assisted_review`, and `paused` with the prior phase retained. Help and failed attempts remain in history. A learner can leave early; the report says incomplete rather than fabricating a pass. Resume does not advance a phase.

## Atomicity

A mutation transaction checks owner, pack/version, expected revision and allowed phase, then writes artifact/event/revision together. A run records the exact artifact used; if later edits occur, retain the old result and mark it stale in the UI. Model/network calls happen outside write transactions; recheck state before committing any resulting action.

DynamoDB transactions/conditional writes are the hosted adapter target; SQLite remains the local adapter. Export/import of demo fixtures never touches the invocation ledger. Public guest sessions, teacher grants and billing state must not share a default ID.

Independent input contract: voice transcripts must match a narrow, reviewed device/slot command grammar. Free-form generated speech/text is not forwarded in that phase. Commands outside the grammar do not trigger an inferred optimal edit; use direct controls or explicitly switch to assisted practice.
