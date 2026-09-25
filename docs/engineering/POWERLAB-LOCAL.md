# PowerLab local implementation

Type: reference/handoff. Updated 2026-09-23 after the initial voice increment. Scope: R3 practice A, local persistence and optional initial Sonic controls. Compilation and one live synthetic voice edit succeeded; full interaction acceptance and educator validation remain pending. See [voice implementation/evidence](VOICE-SPIKE.md) for the separate live boundary.

## Open it

From the LearnSprint repository, run `pnpm dev`, then open [PowerLab](http://127.0.0.1:5173/powerlab). Use **Start the practice** to create a saved practice. **Run this plan** saves any changes, then requests a server evaluation of that revision. Returning to `/powerlab` lists practices owned by the current browser.

`pnpm build` compiles the API and the three lazy-loaded web routes. `pnpm start` serves the built application on `127.0.0.1:3001`, including explicit PowerLab/API-preview deep links. Both modes remain local. This is not the hosted judge release.

Old routes remain available: `/` is the quiz notebook and `/mission-preview` is the browser-only API-permissions prototype. The notebook now links to PowerLab. Their old data and provider/credit ledger are unchanged.

## Source boundaries

| Area | Owner |
| --- | --- |
| Shared, type-only HTTP contracts | `packages/contracts/src/powerlab.ts` |
| Active content manifest | `content/powerlab/pack.json` |
| Immutable practice-A lesson | `content/powerlab/versions/0.1.0.json` |
| Separate expected-value data, not read by production | `content/powerlab/reference-values.json` |
| Pure arithmetic / complete schedule normalization | `apps/api/src/powerlab/engine.ts` |
| Content validation and pinned version loading | `apps/api/src/powerlab/content.ts` |
| Owned commands, phase/revision checks, atomic receipts | `apps/api/src/powerlab/service.ts` |
| Repository interface and local SQLite adapter | `apps/api/src/powerlab/repository.ts` |
| Local owner capability, request parsing, HTTP routes | `apps/api/src/powerlab/identity.ts`, `controller.ts` |
| Voice tickets, usage ledger, transport and domain tool adapter | `apps/api/src/powerlab/voice/` |
| Explicit microphone, playback, transcript and receipts | `apps/web/src/powerlab/VoiceDock.tsx`, `voice-audio.ts` |
| Nest feature registration | `apps/api/src/powerlab/module.ts` |
| Workbench, lifecycle and recovery | `apps/web/src/powerlab/PowerLab.tsx` |
| Outcome and two-run comparison | `apps/web/src/powerlab/Results.tsx` |
| Original study-hub SVG, device icons and plots | `apps/web/src/powerlab/Visuals.tsx` |
| Versioned browser drafts and bootstrap deduplication | `apps/web/src/powerlab/api.ts` |

The UI uses existing React/Vite, system typography, original SVG illustration, native checkboxes and SVG plots with a numeric table. The initial practice slice added no packages; the subsequent voice increment added pinned `ws` and `@types/ws`. Direct scheduling/evaluation makes no model request and does not use the quiz assessment provider. Optional Start voice now calls Bedrock through a separate adapter and allowance.

## Content and arithmetic

Only **practice A** is shipped in this pack: 240 Wh usable energy, 120 W ceiling, four one-hour slots; 12 W lamp, 8 W router, 24 W fan, 60 W laptop charger. Lamp/router need every hour, fan at least two hours, laptop at least one.

The evaluator validates exact supported device IDs, unique supported slot IDs and a complete schedule, then canonicalizes ordering. It sums integer watts × integer minutes. The output includes total watt-minutes/Wh, peak W, each slot's requested demand and budget balance, service minutes, individual constraint flags and combined feasibility. Exact limits pass. No expected answer schedule is consulted.

The charts depict requested demand and cumulative requested energy. A deficit is labeled “Wh short,” not a negative physical battery. The plotted schedule comes from the immutable run, not the currently edited grid. An edit or a different artifact revision marks the old result stale until another run.

The source/provenance panel states the fictional assumptions and links to EIA's explanation of electricity units. Subject review, actual learner relevance and learning-effect evidence are still open.

## Implemented HTTP surface

All routes below are under `/api/lab`. Requests use JSON, validated UUID `requestId` values and, for existing-session writes, integer `expectedRevision`.

| Method/path | Input / output |
| --- | --- |
| GET `/home` | Establishes the local browser capability if missing; returns active pack and owned practices |
| POST `/sessions` | `packVersion`, `scenarioId: practice-a`, `requestId`; creates an all-on artifact in practice phase |
| GET `/sessions/:id` | Owned session, pinned pack, chronological runs and 20 most recent actions |
| POST `/sessions/:id/commands` | `type: save_plan`, complete `schedule`, revision/request; or `type: pause` / `resume` |
| POST `/sessions/:id/runs` | Revision/request; evaluates the exact saved artifact and creates a run receipt |
| GET `/voice-status` | Owned availability/remaining allowance; no inference |
| POST `/sessions/:id/voice-ticket` | Saved revision/request; owner-bound single-use ticket |
| WebSocket `/voice` | Explicit ticket start, binary PCM, stop/mute/undo; see voice handoff |

Mutation responses contain `{ receipt, workspace, replayed }`. A retry with the same owner, request ID and parsed payload returns the **original commit receipt**, alongside **current** owned workspace state. A reused ID with a different payload is a 409. Revision conflicts do not apply a draft. Unknown/unowned sessions share a 404 response.

`session.revision` advances for each actual state change/run. `artifact.revision` advances only when its canonical schedule changes. Artifact hashes cover lesson ID/version, scenario ID and canonical schedule. Each run retains the full artifact, engine version, reference-data version, timestamp and numeric result. Engine version is `powerlab-engine-0.1.0`; reference-data version is `powerlab-reference-0.1`. A version label records provenance, not that an external oracle review has passed.

The workbench sends save and run as sequential requests, each with its own idempotency key. If another tab changes the session between them, the revision check rejects the run. A save replay that reveals a different current schedule keeps the learner draft for explicit recovery rather than running the changed plan.

## Durable local state

PowerLab uses `.data/powerlab.sqlite` (or the same filename under `LEARNSPRINT_DATA_DIR`) with WAL, foreign keys and transactions. Tables hold sessions, immutable runs, append-only action events and original request receipts. The commit atomically updates session state and related evidence. Manual/voice origins distinguish control sources. Voice reservations/usage live separately in `.data/voice-invocations.sqlite`. Neither path changes `.data/learnsprint.sqlite` or the historical quiz invocation ledger.

The local limits are 40 practices per browser owner, 100 runs per practice and session revision below 1000 for new mutations. Existing records remain readable. There is no deletion or export UI in this slice; account storage lifecycle belongs to later work.

The local capability is 32 random bytes in an HttpOnly, SameSite=Strict cookie scoped to `/api/lab`; only its SHA-256 hash is stored as owner. The cookie lasts 30 days and is not an account login. Clearing cookies, waiting for expiry, changing hostname or using another browser loses access to that owner's practices. Cross-device recovery, account association, hosted TLS/Secure-cookie policy, abuse limits and teacher grants are not delivered. Loopback and existing host/origin restrictions remain required.

Unsaved UI drafts use a versioned `sessionStorage` key and the hash of their base artifact. A restored draft based on an older server plan requires an explicit choice. A conflict/reload can preserve the draft; Save/Run then uses the freshly loaded revision. Storage failures are visible and in-memory editing remains available. This browser draft is not the canonical saved result and does not survive all browser/tab lifecycle events.

## Interface states delivered in source

- Entry brief, original hub illustration, ratings and service needs.
- Four-by-four native checkbox schedule; device highlighting and selected-hour scene preview.
- Separate unsaved/saved and feasible/infeasible states.
- Save, discard, run, pause and resume; pending/error/retry/conflict handling.
- Run metrics, stacked power plot, cumulative energy plot and an equivalent table.
- Two-run selection, energy/peak changes and the changed hour blocks.
- Recent factual action record and content/source assumptions.
- Optional English voice controls, live transcript, factual receipts, immediate microphone stop and connection-scoped undo.
- Responsive styles, labels/focus states and reduced-motion rules.

These are implementation statements, not completed keyboard/mobile/runtime acceptance evidence.

## Evidence and limits of this delivery

- `pnpm build` completed successfully for NestJS TypeScript and React/TypeScript/Vite, including the subsequent voice increment.
- Existing development listeners were present on 5173 and 3001 after compilation.
- Initially opened `/powerlab` in Chrome; the entry brief, Start button and four device sections were present. In the voice continuation, an existing saved practice was opened and Start voice was visible. No browser microphone or full acceptance journey was executed.
- No unit/integration/security/responsive/user-journey tests were added or run in this turn, following the active work instructions. Expected arithmetic data is content, not an executed test result.
- The first slice used no inference. The later [Sonic spike](VOICE-SPIKE.md) used one real stream with synthetic speech: one voice edit committed, its saved revision was read back, and confirmation audio arrived. No account/credit change, deployment, participant message or final submission occurred.

R01 discovery/educator review, full R02/R03 acceptance, R04 help/attempt/phase records, R05 coach, remaining R06 voice acceptance, R07 B/C, R08 sharing and AWS release work remain open. Next implementation priority: explicit assistance/attempt/phase records, then the bounded coach on this domain boundary. The existing exhausted quiz allowance remains unchanged; voice uses its own named capped batch.

## Authored assistance records (subsequent increment)

`request_help` on the existing commands endpoint takes a `runId` plus revision/request ID. Only active practice A is supported. The run must be the last run and match the current artifact hash/revision. At most 50 requests are retained per practice. The existing transaction stores a timestamp, run reference, intervention ID/provider and immutable activity snapshot, increments session revision, and appends a factual action. It never changes the schedule. Replaying a request does not record another help event.

The activity selector in `interventions.ts` uses factual constraint flags: missing service → I03, exceeded power → I02, exceeded energy → I01, feasible → I05. These are original authored activities, not AI output. The UI requires a fresh run and labels earlier-result guidance when the plan changes. Each later run snapshots the current assistance count when recorded history exists. Missing historical fields mean unrecorded, not independent or unaided. Full attempt boundaries and B/C phase policy remain pending. Compilation passed; no application test cases were executed for this increment.
