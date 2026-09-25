# Career AI input and allocation proposals

Type: reference/how-to. C06 source increment with C07 assistance integration, 2026-09-24. API and web compilation passed. Career model invocation, microphone behavior and end-to-end acceptance have **not** been observed. C06 remains unaccepted: natural input, tool receipts and assistance-gated generated replies have source; measured career usage and requested live/behavioral acceptance remain open. [C07 implementation](COACHING.md).

## What this adds to First Shift

Choose the warehouse, customer B or shift lead at `/career`. The contact desk now accepts a short natural-language question through Nova 2 Lite or English microphone input through Nova 2 Sonic. Both select the same supported actor questions and return the saved authored reply with its source snapshot.

An explicit request such as “Set order A, express today, to 30 kits” produces a **single-cell preview**. The board remains unchanged until the learner selects **Apply this exact change**. The preview shows its old/new quantity, proposed order total and plan/fact versions. **Undo last applied proposal** restores the previous plan if no later allocation or world change has made it stale. Applied and undone actions remain in history.

Customer acceptance, plan review/recording, Start shift and handoff use their existing explicit controls. AI routing has no tool for these actions. A proposal alone makes no claim about stock, capacity, deadlines, cost or feasibility; run the ordinary plan review after applying it.

The voice path accepts spoken input and displays the authored source reply on screen. **Generated assistant audio and text are suppressed by default.** C07 now permits an explicit spoken-reply opt-in only after conceptual help has been recorded and the attempt is assisted. A guided voice start commits before provider streaming can forward generated speech. This has source only; two-way spoken behavior and factual fidelity remain unobserved. Suppression does not imply that provider-generated tokens are free.

## Using the local controls

1. Open or resume a shift, then save or discard any allocation draft.
2. Select a contact. Listed questions remain available without AWS. Their wording shows the supported scope.
3. Type one question or one explicit order/departure/quantity request, then choose **Ask this contact**. Requests are limited to 500 characters. Use fictional scenario details.
4. For speech, choose **Start voice** and grant microphone access. Opening the page does not activate the microphone. Read the source reply or proposal as it appears; use **Stop voice** to stop capture and finish the session.
5. Inspect any proposed edit, apply it explicitly, and review the resulting full plan. An offer from customer B still requires **Record this customer agreement**.

The board, contact selector and other mutations are locked during active AI work, including the optional C07 coach focus. The browser warns before leaving an active request. A text error can retrieve the same request ID or load saved state; retrieving a completed request reuses its stored interpretation and domain receipt without another model invocation. A failed/uncertain provider invocation is retained against the allowance. Starting a new request is a separate deliberate action.

Stop aborts a pending text invocation. A result already committed before cancellation stays in history. Voice capture stops immediately; the UI waits briefly for the stream to close before loading the saved revision. There is no automatic voice reconnection. Structured questions and manual controls remain the fallback when access or the allowance is unavailable.

## Model and tool boundary

| Path | Provider request | Accepted result |
| --- | --- | --- |
| Typed request | One Bedrock Converse request to `us.amazon.nova-2-lite-v1:0`, forced `interpret_career_request` tool, 512 output tokens, 20-second abort, one SDK attempt | Exactly one schema-valid question, allocation preview or unsupported intent; generated prose is discarded |
| Microphone input | Bidirectional `amazon.nova-2-sonic-v1:0` stream, one selected actor, bounded English interaction | A finalized user transcript precedes a tool; duplicate provider tool IDs reuse their result; up to six tool requests |
| Source reply | Existing `ask_actor` domain command | Authored text and disclosed facts, saved with actor/dialogue/scenario/world versions |
| Allocation preview | Internal `propose_allocation` command | Server-created before/after plans with the current plan hash and revisions; no applied allocation |
| Apply / undo | Public owned command endpoint, explicit UI action | Transactional plan update and original receipt, with append-only proposal action history |

The endpoint is `us-east-1`; the Lite model ID is a US inference profile, not a promise of execution in that single region. The existing AWS profile resolves credentials on the server. No credentials, provider tokens or voice ticket enter a URL.

Context includes only the selected actor's scope, currently available question IDs, relevant order IDs/quantity bounds, departure labels, current permitted allocations and at most two previously disclosed current-world replies from that actor. It excludes sealed reference plans and undisclosed incident/customer policies. Customer B can propose only order B; role and phase permissions are enforced again in domain code. The model can still misunderstand a request, which is why allocation changes require a visible preview and manual application.

Both channels use the existing owner/phase/revision boundary after asynchronous inference. A changed or paused shift rejects the result. Scenario arithmetic, stock, budgets and customer terms remain owned by the deterministic domain. Conceptual coaching, optimization, multi-action requests and missing quantities are unsupported by the actor interpreter. C07 has a separate coach-focus endpoint with recorded assistance and approved evidence-bound activities.

The Converse and Sonic event adapters follow [AWS Nova tool-use documentation](https://docs.aws.amazon.com/nova/latest/nova2-userguide/using-tools.html) and the [Nova 2 Sonic model reference](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-2-sonic.html). Provider integration still requires a requested live observation; compilation alone does not establish model/schema compatibility.

## Hosted AWS observation — 2026-09-24

A separate EC2 preview configuration uses batch `career-lite-aws-preview-2026-09-24` (10 reservations/$0.20) and `career-sonic-aws-preview-2026-09-24` (four reservations/$1, at most 60 seconds each). The EC2 instance role invokes Nova 2 Lite via its US inference profile and Nova 2 Sonic in us-east-1. This does not modify the local C06 batches below.

Five hosted Lite reservations were made against a fictional warehouse stock question. The first four ended without a usable application result and remain counted; later diagnostics identified an irrelevant `quantity` value in a question tool call. The adapter now projects only fields irrelevant to the selected intent to null, while still requiring and validating the selected question ID or exact allocation fields. The fifth call succeeded: a warehouse `ask_actor` receipt was persisted, and the authored answer distinguished 40 kits on hand from 40 expected. Raw model wording was not used as a stock source. Sonic has not been invoked in the hosted batch. The owner and Chrome automation both observed `ERR_BLOCKED_BY_CLIENT` for the CloudFront URL, so rendered UI, voice and end-to-end learner behavior remain open.

## Allowance and configuration

The owner previously authorized continued development and bounded AWS use. A separate local configuration was created for this increment; no model call was made while implementing it.

| Channel | Immutable batch ID | Maximum reservations | Reserved amount each | Batch envelope |
| --- | --- | ---: | ---: | ---: |
| Text: actor input + coach focus | `career-lite-c06-2026-09-24` | 10 | $0.02 | $0.20 |
| Voice | `career-sonic-c06-2026-09-24` | 4 | $0.25 | $1.00 |

The combined **$1.20 is an application reservation envelope**, not measured spend or a guaranteed AWS invoice cap. Fresh text/voice reservations happen before provider I/O. Failed, stopped and uncertain attempts count. Reported usage is retained; missing usage remains unknown. The shared voice estimate uses the existing dated rate snapshot and stops on its reservation threshold; billing can lag that estimate.

Voice bounds: 60 seconds maximum, 25 seconds of idle time, 20-second server connection timeout, 16 kHz PCM input and 24 kHz output processing, input/output byte ceilings, bounded event queues and no SDK retries. Text and voice share a one-active-request-per-owner lock and a maximum of two active career requests globally. The local WebSocket gateway accepts at most eight sockets with a five-second start-ticket deadline.

Files:

- Private runtime settings: `.data/career-ai-config.json`; missing or `enabled: false` disables AI. The validated config is read for each new operation.
- Reproducible, disabled-by-default template: [career-ai.example.json](../../config/career-ai.example.json).
- Separate durable ledger: `.data/career-ai-invocations.sqlite`. The batch snapshot records model, mode, endpoint region, profile name and bounds; reservations record owner/session/fingerprint/state/timestamps, validated actor interpretation or coach selection, and usage when available.
- Historical quiz and PowerLab voice settings, reservations and databases are preserved. Their batches cannot authorize career inference.

On another local checkout, copy the example only if a career configuration does not already exist, select the approved profile and enable it under the applicable budget authorization. Do not overwrite an existing immutable batch, change its limits after use or delete a ledger to obtain more calls. Page availability means the local config has remaining reservations; it does not freshly verify AWS credentials, model access or credit redemption.

## Persistence, recovery and privacy

`CareerSession` gains `proposals` and `proposalActions`. Older rows default to empty arrays without invented model history. AI-origin events store mode, actor and invocation ID; manual Apply/Undo actions remain manual and link to the original proposal. Asking a fact already saved for the same world returns its existing authored receipt, while the separate invocation ledger still accounts for the interpretation call.

Proposal application checks the exact base plan hash, artifact revision and world revision. Undo checks the most recent applied proposal's saved result against the current plan/world. Each proposal can be applied once; undo does not erase its application or make it a new proposal. A shift is bounded to 50 stored proposals and retains its existing 500-revision limit.

Typed raw requests are sent to Bedrock but are not persisted by this adapter; it stores their fingerprint and validated interpretation. Audio is streamed and not saved as a file. Finalized input and any enabled generated-response transcript snippets stay in the current browser view and ephemeral stream memory. Authored replies, selected question IDs, model-requested quantities, receipts and usage are persisted. This describes application storage, not an independent claim about provider retention. Use fictional details only.

Text interpretation is saved before the domain command so a lost response can retry without new inference. A process failure between those commits can leave an interpretation without a domain action; retry applies it only if the original revision is still current. Stale results are rejected. Voice receipts are committed through the domain before they are sent to the browser; Stop/reconnect recovery reads owned saved state.

## Source map

| Location | Responsibility |
| --- | --- |
| `apps/api/src/career/ai/` | Config, immutable allowance ledger, role context, Lite adapter, owned voice tickets, gateway and controller |
| `apps/api/src/career/service.ts` | Preview creation, explicit application/undo, exact revision checks and original domain receipts |
| `packages/contracts/src/career.ts` | AI origin, proposal/action, status, request and voice-event types |
| `apps/api/src/bedrock/sonic-stream.ts`, `sonic-usage.ts` | Shared bounded provider transport and usage parsing; career and PowerLab keep separate policies |
| `apps/web/src/voice-audio.ts` | Shared capture/playback lifecycle; existing PowerLab worklet asset retained |
| `apps/web/src/career/LiveControls.tsx`, `VoiceDock.tsx`, `Proposals.tsx` | Natural input, cancellation/recovery, explicit microphone state and proposal decisions |

PowerLab keeps its own tool definitions, policy, ownership, tickets and allowance. Its old gateway now ignores unrelated upgrade paths so both feature gateways can share the HTTP server. Source compilation passed after extraction; historical live evidence is not regression acceptance for the extracted transport.

## Evidence and next work

- API TypeScript and web TypeScript/Vite production build passed on 2026-09-24.
- No application tests, actor journey, proposal apply/undo journey, browser microphone session or new provider inference was run in this increment.
- No account upgrade, credit redemption, deployment, external message or submission change occurred.
- Source implementation is ready for requested verification of role/phase rejection, lost-response retry, stale proposals, undo boundaries, stop/disconnect and real Lite/Sonic tool compatibility.

C07 source now adds conservative attempt history, saved authored guidance, optional AI focus and assisted-only opt-in spoken replies; see [coaching](COACHING.md). Next implementation is **C08 changed-condition replay and richer evidence reporting**. Full C06 spoken-response acceptance, measured cost and C05–C07 behavioral acceptance remain open. [Current delivery checklist](DELIVERY-PLAN.md).
