# Changed-condition replay and learning record

Type: reference/how-to. C08 source increment, 2026-09-24. API and web compilation passed. The local server was restarted with the new replay route and started successfully on port 3001; no request journey was exercised. No application tests, browser/API journeys, microphone sessions or provider calls were run for this increment. These are implemented contracts awaiting behavioral acceptance, not observed learning gains.

## Learner path

1. Complete First Shift and save its handoff. The final workspace opens a learning record before the saved work desk.
2. Inspect unresolved observations, the first recorded plan versus the final handoff, changed allocation cells, expected-stock assumptions, customer milestones, source receipts and assistance at handoff.
3. Select **Try the new situation**. This creates one linked replay with a blank board, a new attempt ID and its own scenario version. An existing replay is resumed, including any help already recorded.
4. The replay starts at 10:30 with the supplier delay already known. There is no preliminary plan/start transition to repeat. Inspect the changed stock balance, ask the customer about current terms, make a plan and leave a new handoff.
5. Structured and AI-routed factual questions remain available. In `independent` mode, use direct quantity controls: server-side AI allocation proposals are disabled, and generated spoken replies remain suppressed.
6. Optional **Switch to assisted & show guidance** commits the mode change, help event and review-bound activity before returning guidance. The same attempt cannot be reset to independent. Earlier evaluation snapshots remain unchanged.
7. The completed replay report compares its final record with the exact source handoff. Downloading saves a JSON file locally; it does not publish or share anything.

## Authored variant

The manifest keeps `activeVersion: 0.1.0` for First Shift and selects `replayVersion: 0.2.0`. Original scenario/dialogue/coaching files are retained unchanged. The new scenario is authored, not model-generated.

| Fact | First Shift 0.1.0 | Replay 0.2.0 |
| --- | --- | --- |
| Confirmed on-hand stock | 40 kits | 50 kits |
| Expected replenishment | 40 kits | 30 kits |
| Replenishment ETA at recovery | Today 17:00 | Today 17:00, known at opening |
| Customer B alternative, only after asking | 10 today; all 30 by tomorrow noon | 20 today; all 30 by tomorrow noon |
| Orders, departure schedule/capacity/fees, budget | Original values | Same values |
| Starting artifact | Blank planning board before incident | Blank recovery board after the known delay |

Both versions require an explicit agreement before alternative customer terms affect evaluation. No earlier allocations, agreements, proposals, help or role replies carry into the new attempt. The old successful 10-today allocation does not meet the new 20-today milestone. Separate [reference calculations](../../content/career/REFERENCE-VALUES.md) remain unexecuted content-review examples and are never loaded into the app.

Private customer terms stay in the server fixture until the scoped contact question discloses them. The replay brief tells learners to investigate changed customer needs without revealing the alternative policy in advance. Each attempt pins its scenario, dialogue and coaching versions.

## API and persistence

`POST /api/career/sessions/:id/replay` accepts:

```json
{
  "requestId": "<uuid>",
  "expectedRevision": 12,
  "expectedWorldRevision": 3,
  "sourceEvaluationId": "<final handoff evaluation uuid>",
  "packVersion": "0.2.0"
}
```

The domain requires the same browser owner, the exact handed-off source evaluation, current source revisions, a base scenario and the manifest's replay version. A replay cannot recursively create another replay. Creation uses the existing SQLite `BEGIN IMMEDIATE` transaction and commits the new session, opening event and original receipt together. Requests with another key from a second tab resolve to the existing child, not a new unassisted attempt. The 30-session limit still applies to new replay creation.

`session.replay` stores source session/evaluation/pack IDs. Old rows default to null, not inferred replay history. The source session remains read-only. Local world revision 1 in scenario 0.2.0 represents the already-delayed world; it is not the same world as revision 1 in 0.1.0. Always interpret a revision together with session ID and pack version.

Existing command ownership, phase, revision, idempotency, review and handoff rules are reused. The existing once-only `start_shift` command rejects replay because it already starts in recovery with its incident recorded.

## Report authority

The workspace returns `report` only for a handed-off session. `career-report-0.1.0` is a factual projection of stored snapshots; reading/exporting it performs no evaluation, writes or inference.

- Final outcome comes from the handoff's saved evaluation, not a re-run with current content.
- Baseline is the first explicitly recorded evaluation, not a selected best/worst attempt. When it is the same as the final evaluation, the report states that no separate before/after exists.
- Allocation changes compare those two recorded plans within the same scenario. Changes in world revision are labeled; an earlier plan is not retrospectively judged against later facts.
- Assistance is the frozen handoff snapshot. Help requested after the final review therefore remains visible. Unknown historical assistance stays unknown.
- Source replies retain the revision and source versions at disclosure. Earlier replies are labeled historical.
- Replay comparison resolves only the same owner's source session and exact pinned handoff. It shows each scenario's stock, customer milestones, shipping cost, unresolved observations and assistance label separately.
- The JSON download includes plan/evaluation/version IDs, source facts, timeline, help activities and guided voice starts. It excludes owner-cookie values, credentials, private undisclosed policies and raw audio.

No summed proficiency score, learning-gain claim, personality assessment, completion certificate or employment prediction is produced. `independent` is an application mode; the learner-facing label is **No in-app guidance requested**. External help, reviewing an earlier report, or opening other browser tabs cannot be ruled out. Completing an exercise is not evidence of learning transfer by itself.

## Source map

- `content/career/versions/0.2.0.json`, `actors/0.2.0.json`, `pack.json`: separate scenario and matching dialogue.
- `packages/contracts/src/career.ts`: replay request/link, report, workspace and independent-mode types.
- `apps/api/src/career/content.ts`, `actors.ts`: version loading and dialogue compatibility.
- `service.ts`, `controller.ts`, `repository.ts`: owned linked creation, retry/resume, legacy defaults, independent allocation boundary.
- `report.ts`: read-only assembly from final saved evidence.
- `ai/tools.ts`: factual-only tool choices in independent mode; domain rejects allocation even if a provider returns one.
- `apps/web/src/career/LearningReport.tsx`, `report.css`: report, source/timeline details, local download and replay entry.
- `Career.tsx`, `Coach.tsx`, `Review.tsx`, `LiveControls.tsx`: retry-safe opening, changed-condition context and accurate mode labels.

## Remaining acceptance and release

Requested behavioral acceptance must cover creation from the correct handoff, owner isolation, concurrent/different-key opening, pause/reload, no copied agreement/help, one replay per source, private-policy disclosure, exact customer milestones, independent AI rejection, guidance-before-output, immutable prior snapshots, report/export fidelity and narrow-screen/keyboard operation. No such journeys or tests were run by writing this document.

The new content still needs practitioner review. Real career Lite/Sonic behavior and educational usefulness remain unobserved. C09 reproducible delivery/hosting, C10 validation/pilot and C11 repository/video/Devpost artifacts remain open. No AWS resource, deployment, allowance increase or account change was made in C08.
