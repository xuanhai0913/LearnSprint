# First Shift — local implementation

Type: reference/how-to. Updated 2026-09-24. R4 C01–C08 have initial source; C05–C08 live/behavioral/content acceptance remains open. Compilation and entry-page display are observed. Domain, interaction and accessibility acceptance remain open.

## Open the application

From the LearnSprint directory, run `pnpm dev`, then open [First Shift](http://127.0.0.1:5173/career). The API listens on `127.0.0.1:3001`. `pnpm build` compiles both packages; `pnpm start` serves the built app and its `/career` deep link on port 3001.

The manual career workflow needs no AWS credentials. Optional [AI text/voice input](AI-CONVERSATION.md) uses Bedrock only on an explicit Ask/Start voice action with a configured allowance. The current machine has a separate bounded career configuration; its live access has not been observed. It preserves `/powerlab`, `/mission-preview`, the legacy root quiz and their databases/allowance ledgers. Keep using the same hostname and browser: the local capability cookie is not a hosted account or a portable login.

## Implemented workflow

1. Open a saved shift or create a new one. Creation pins scenario `first-shift@0.1.0`.
2. Read the three orders, current stock, replenishment ETA and departures. Enter integer kit allocations in the order board.
3. Save and review. The server evaluates stock available before each departure, cumulative allocations, vehicle capacity, exact order quantities, split restrictions, arrival deadlines and one flat fee per used departure.
4. Preview and record a specific reviewed plan. Recording an infeasible plan retains its unresolved observations; it does not turn the projection into a success.
5. Start the shift. This applies the authored 10:30 supplier notice once, changes replenishment ETA to 17:00 and makes the previous review historical. No departure has physically left in this scenario.
6. Ask the warehouse, customer B or shift lead a supported question through the structured contact desk. Replies retain their sources and the world revision at disclosure. Ask customer B about a split through this desk. This discloses an authored offer. A separate action records the supported agreement and increments the world revision. The original commitment applies until that action commits.
7. Before handoff, request optional review-bound guidance, then optionally ask AI to choose an activity/evidence focus. Assistance is saved before output; reviews and handoff snapshot its counts. Assisted attempts may opt into recorded generated spoken replies. [C07 implementation](COACHING.md).
8. Revise, review and record the recovery plan. Preview the final handoff, including unresolved observations, then save it. The shift becomes read-only and displays a factual learning record with local JSON download.
9. Open the short changed-condition replay from that report. The new version starts with a known delay and blank board, keeps separate help history and resumes rather than duplicates on another opening. A completed replay compares its final evidence with the exact source handoff. [C08 implementation](REPLAY-AND-REPORT.md).
10. Pause/resume preserves scenario time, plans, reviews, agreements and assistance. Saved shifts remain linked to the local browser capability.

The [actor desk](ACTOR-CONVERSATIONS.md) preserves unsaved allocation inputs while asking, shows earlier-world replies and links facts to the related board sections. Responses are authored. C06 adds optional natural-language routing to these same source replies, plus saved allocation proposals with explicit Apply/Undo. Listed questions can preserve a draft; live input requires a saved plan.

The UI includes draft retention, a dirty-state warning, outdated-review labels, original receipt retry, saved-shift navigation, recent actions and review summaries. Draft values are strings so an empty/invalid field can be corrected without silently becoming zero. The latest review provides detailed observations; older reviews currently have summary rows.

## Source ownership

| Location | Responsibility |
| --- | --- |
| `content/career/` | Original fixture, public/private split and authored reference calculations |
| `packages/contracts/src/career.ts` | Shared record, command, receipt and evaluation types |
| `apps/api/src/career/content.ts` | Strict content validation and version-pinned loading |
| `apps/api/src/career/actors.ts`, `content/career/actors/` | Versioned authored dialogue, role/phase filtering and source snapshots |
| `apps/api/src/career/engine.ts` | Pure arithmetic projection; no provider or database dependency |
| `apps/api/src/career/service.ts` | Owner/phase/revision checks, command transitions and evidence snapshots |
| `apps/api/src/career/repository.ts` | SQLite session/receipt transactions |
| `apps/api/src/career/controller.ts`, `identity.ts`, `module.ts` | HTTP parsing, local owner capability and Nest feature module |
| `apps/api/src/career/ai/`, `apps/api/src/bedrock/` | Career AI config/ledger, Lite adapter, owned voice bridge and shared bounded transport |
| `apps/web/src/career/` | Career entry, work desk, review, draft handling and responsive styles |
| `apps/web/src/main.tsx`, `apps/api/src/main.ts` | Lazy route and exact SPA deep links |

## Domain rules

- Integer minutes since midnight of scenario day one; real timezone and reading time do not change deadlines.
- Available stock at a departure is on-hand stock plus replenishment only when its ETA is at or before that departure. Cumulative allocations must fit that total. A later arrival cannot repair an earlier shortage.
- Each departure's capacity is shared across orders. Its flat fee applies once if any kits use it.
- Allocations must sum to each order's exact quantity. A cannot be split across departures.
- Customer milestones are cumulative: B's accepted alternative requires at least 10 (base scenario) or 20 (replay 0.2.0) by today 18:00 and all 30 by tomorrow 12:00. An arrival exactly on a deadline meets it.
- A plan relying on replenishment remains a projection. The evaluator does not assert physical stock receipt, dispatch or delivery.
- Only server-created agreements reach evaluation. The learner cannot submit arbitrary customer terms or a client-calculated result.
- The fixture loader never includes `privateScenario` in the public brief. The base delay appears after Start shift; replay opens with its delay known. B's version-specific terms appear after the supported contact action.

## API and persistence

| Method / path | Effect |
| --- | --- |
| `GET /api/career/home` | Public brief, owned saved-shift summaries; issues local owner cookie when needed |
| `GET /api/career/sessions/:id` | Owned workspace with disclosed facts and saved history |
| `POST /api/career/sessions` | Create with `requestId` and active `packVersion` |
| `POST /api/career/sessions/:id/replay` | Create/resume one linked replay from the exact completed base handoff, with request ID and expected source revisions |
| `POST /api/career/sessions/:id/commands` | Typed command with `requestId`, `expectedRevision`, `expectedWorldRevision` |

Commands: `save_plan`, `evaluate_plan`, `confirm_plan`, `start_shift`, `ask_actor`, legacy `ask_split`, `accept_split`, `pause`, `resume`, `handoff`, `apply_proposal`, `undo_proposal`. `request_help` requires a current evaluation ID. `propose_allocation`, `focus_help` and `start_guided_voice` are internal to the server AI adapter and are rejected by the public command parser. Confirmation/handoff also require a saved evaluation ID; agreement requires the disclosed offer ID.

Default storage: `.data/career.sqlite`, separate from all historical prototypes. WAL transactions commit the session and original receipt together. Session records include append-only evaluation/event/commitment arrays. Each evaluation freezes the plan, plan hash, pack and engine versions, artifact/world revisions, ETA, accepted agreement and outcome. These are application snapshots, not a tamper-proof audit log.

Duplicate requests return the original receipt plus current owned workspace. A reused request ID with a changed payload is rejected. Expected revisions prevent a stale tab overwriting newer state. The browser retains an uncertain request ID while the page is open; hard reload clears that in-memory retry key, so inspect saved state before issuing a replacement action. Unsaved draft data uses session storage and may be unavailable if storage is blocked or a tab is closed.

Local limits are 30 shifts per browser capability, 100 reviews, 100 actor response snapshots, 50 allocation proposals, 30 guidance requests, 30 guided voice starts and 500 revisions per shift. The existing API JSON body limit is 16 KB. These are local development bounds, not production quotas. The 30-day HttpOnly/SameSite cookie is a capability: losing it loses normal access to those records. No account recovery, sharing or personal hosted identity is implemented. C09 preview configuration uses an external review-password gate plus separate Secure browser capabilities; container/cloud behavior is not yet observed. [Hosting preparation](../../deploy/README.md).

## Observed evidence and remaining scope

The manual/C05 observations below are historical. C06 also passed API/web compilation; no career inference, microphone/API/browser journey or application test was run for C06. [Exact AI evidence and bounds](AI-CONVERSATION.md).

- `pnpm build` passed for API and web after correcting a JSX closing tag in the new board.
- The local Nest server started with career routes; the `/career` entry page was displayed in Chrome and retained as a deliverable.
- No application tests, engine/API journeys, microphone sessions or live AWS calls were run for this slice. Entry-page display does not establish working acceptance for save/review/incident/agreement/handoff.
- No deployment, external communication, promotional-credit redemption or submission change occurred.

Still required: practitioner review; behavioral acceptance for actor tools, AI routing/proposal/undo/recovery and assistance records; measured career model usage and generated spoken-reply fidelity; behavioral acceptance for replay/report/export; hosted access; requested behavioral verification; learner feedback and submission artifacts. An authored customer response is not live AI. A saved handoff does not establish learning transfer or job readiness.

C08 source and API/web compilation are complete; the local server restarted successfully with the replay route. Report and replay behavior remain unobserved. C09 runtime/container/source-archive preparation now exists. Next: requested runtime acceptance and actual AWS account/hostname/cost/IAM gates. Keep requested C05–C08 live and behavioral acceptance open; preserve all historical tickets, data and allowances.
