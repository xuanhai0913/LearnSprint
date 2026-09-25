# Coaching, assistance and guided speech

Type: reference/how-to. Initial C07 source, 2026-09-24. API/web compilation passed. Application behavior, model selection, microphone/playback and educational usefulness remain unverified. No application tests or career provider calls were run during this increment.

## Learner workflow

1. Save and review the plan. The optional **Learning coach** appears immediately after the review.
2. Select **Record help & show guidance**. The server records conceptual assistance and an authored activity tied to that exact review before returning the activity. This local operation does not invoke AWS.
3. Read the observation, investigation steps and source evidence. Change the board when ready. A reflection prompt is optional; no written answer blocks progress.
4. Optionally open **Let AI choose an evidence-based focus**. Ask what you want to understand, or leave the question empty. Nova 2 Lite chooses one approved activity and one to three of its evidence references. Displayed wording remains authored.
5. The original activity remains available after an AI focus is saved or fails. Historical guidance retains the reviewed facts; a changed plan/world needs a fresh review and request.
6. In an assisted attempt, optionally check **Enable generated spoken replies** at the contact desk and choose **Start guided voice**. An additional voice-start record commits before provider streaming. **Stop playback** leaves the microphone on; **Stop voice** closes capture and the stream.

Factual actor questions, explicit allocation proposals and conceptual help have distinct records. Guidance cannot apply an allocation, accept an agreement, record a plan, trigger an incident or create a handoff. A model-selected activity is not a numerical score or a determination of job readiness.

## Authored activities

The original, versioned pack is [coaching/0.1.0.json](../../content/career/coaching/0.1.0.json). It needs practitioner/learner review.

| Activity | Evidence used | Initial selection order |
| --- | --- | --- |
| Stock timing | Cumulative allocations, projected availability/shortage by departure and the review's ETA | Any inventory failure |
| Dispatch fit | Allocated vs ordered quantities and each departure's shared load/capacity | Quantity/capacity failure |
| Customer promises | Cumulative scheduled arrivals vs recorded milestones; original no-split conditions | Commitment failure |
| Budget check | Total departure fees and shift budget | Budget failure |
| Handoff clarity | Unresolved observations, expected-stock reliance and recorded agreement presence | Remaining reviewed plans |

The activity gives an investigation method. It does not contain a sealed reference allocation or undisclosed alternative customer terms. Evidence is composed from the immutable evaluation and its pinned public brief. AI may choose a different focus according to the learner's question; the server checks that every chosen evidence ID belongs to that activity.

## Attempt and snapshot contract

- New First Shift sessions begin as `guided`, with history `from-start`, a new attempt ID and zero recorded help. The current practice is not advertised as an independent assessment.
- `request_help` moves the attempt to `assisted` and records the first-help time. The current API has no command to remove help or return the same attempt to an unassisted state.
- Sessions predating C07 receive `history: unknown-before-tracking`, `mode: unknown`, an ID derived from their existing session and no invented start time. Later help changes their mode to assisted while preserving the unknown earlier history.
- Every newly created evaluation snapshots mode/history and counts of guidance requests, AI-selected focuses and guided voice starts **at that review**. Later help does not rewrite the snapshot.
- Handoff snapshots the same counts **at handoff**, so help received after the final evaluation is still visible. Old evaluations and handoffs use a null snapshot and remain labeled unknown.
- One authored request and at most one saved AI focus are allowed per evaluation. Repeating the authored request returns a receipt without duplicating assistance. A fresh evaluation can support another request, up to 30 per shift.
- Up to 30 guided voice starts are recorded per shift, additionally subject to the much smaller shared voice allowance. This counts enabled starts, including a connection that later fails; it is not proof that speech was heard.

Pause/resume preserves these records. A handed-off shift stays read-only. C08 now adds a separate changed-condition replay starting in `independent` mode. The UI labels it “No in-app guidance requested”; neither mode nor a zero help count establishes independent performance outside the app. [Replay contract](REPLAY-AND-REPORT.md).

## Requests and authority

| Endpoint / command | Boundary |
| --- | --- |
| Existing `POST /api/career/sessions/:id/commands`, `request_help` | Explicit current evaluation ID, owner, active phase and expected revisions; activity, help state, event and original receipt commit together |
| `POST /api/career/sessions/:id/coaching-focus` | Request ID, current revisions, help ID and 1–500-character question; rejects missing help, existing focus or stale evidence before inference |
| Internal `focus_help` | Server-recorded coach origin, schema-valid activity/evidence IDs, current review after inference; public command parser rejects direct calls |
| Existing voice-ticket endpoint, `spokenReplies` | Defaults false; binds selected actor/session/revisions and output policy to the single-use ticket; true requires recorded assisted mode |
| Internal `start_guided_voice` | Records voice invocation and actor before constructing/running a stream that can forward generated speech; public command parser rejects direct calls |

The text adapter uses the existing 20-second abort, 512-token ceiling, single Converse call/SDK attempt, per-owner/global concurrency limits, reservation-before-I/O and durable interpretation reuse. A failed AI focus leaves the authored activity available. Generated text from the coach is discarded; only an approved activity ID and its evidence references can change the displayed focus.

Provider and domain persistence are separate transactions. A valid interpretation can be stored even if the later domain write is rejected. Same-request retrieval does not invoke the model again and still enforces the original revision. Network uncertainty never resets a paid reservation. The UI can stop a pending request, retrieve its original ID or load saved guidance. A hard reload clears its in-memory retry key; inspect saved state before starting a replacement.

## Generated speech boundary

Career voice input still works with generated replies disabled. Speech output requires all of these: an already recorded conceptual-help request, `mode: assisted`, explicit `spokenReplies: true` in the ticket, and a successfully committed `start_guided_voice` event. The transport then forwards generated confirmation only after a supported tool returns successfully. All other career streams suppress generated assistant audio/text.

Generated speech may paraphrase or add unsupported wording; prompt instructions alone cannot prove factual fidelity. The UI therefore labels it guided, keeps saved source replies/proposals authoritative and records the enabled voice start conservatively. The model's tool authority remains factual questions and allocation previews. It cannot create inventory, customer acceptance or final decisions. Full spoken-role behavior still needs requested live observation and source-fidelity review.

C08 source now keeps generated teaching suppressed in replay, rejects independent AI allocation previews and reuses the explicit assistance commit before guidance. Behavioral/live observation remains required; source delivery does not establish that acceptance gate.

## Cost and privacy

Local authored guidance and stored-record views use no inference. Optional AI focus shares the existing **10 text requests / $0.20** career reservation batch with actor questions. Guided voice uses the existing **four sessions / $1.00**, up to 60 seconds each. No batch was enlarged and no historical ledger was reset. Reservations are application controls, not an invoice guarantee; [current allowance](AI-CONVERSATION.md).

The coach sends the fictional review evidence, approved activity text and optional learner question to Bedrock. This adapter persists the request fingerprint, selected IDs, validated activity/evidence snapshot, invocation ID and reported usage; it does not store the raw typed question. Raw audio is not saved by the application. Generated transcript snippets remain in the browser view. Application storage statements do not establish provider retention policy.

## Source map and evidence

- `apps/api/src/career/coaching.ts`: validated/versioned pack, deterministic first activity and review-derived evidence.
- `apps/api/src/career/service.ts`: assistance transition, focus commit, guided voice record and immutable review/handoff snapshots.
- `apps/api/src/career/repository.ts`: conservative defaults for historical rows; no rewritten history or old-data deletion.
- `apps/api/src/career/ai/coaching-tools.ts`, `service.ts`: bounded selection schema/context and shared text invocation lifecycle.
- `apps/api/src/career/ai/voice.ts`: ticket output policy and assistance commit before streaming.
- `apps/web/src/career/Coach.tsx`, `coaching.css`: explicit request, authored/AI-selected labels, source evidence, retry/stop and historical guidance.
- `Career.tsx`, `Review.tsx`, `VoiceDock.tsx`: coach placement, review/handoff assistance and optional guided voice controls.

Observed: API TypeScript and web TypeScript/Vite compilation passed. `pnpm start` then loaded the C07 content/module and started the local server successfully on port 3001. No request journey was exercised. No application tests, mutation journeys, paid calls, microphone sessions, outreach, deployment, account change or submission edit occurred. Source delivery does not prove teaching effectiveness or provider behavior.

C08 replay/report source is now implemented; see [exact boundaries](REPLAY-AND-REPORT.md). Next: C09 delivery/access preparation. C05–C08 requested behavioral/live acceptance, practitioner review and actual cost observation remain open. [Delivery plan](DELIVERY-PLAN.md).
