# Career simulation — state, agents and reuse

Type: reference. R4 target, 2026-09-23. The initial career API, engine and manual UI now exist. This document describes the full target contract; [local implementation](LOCAL-IMPLEMENTATION.md) identifies the delivered subset and remaining records/tools.

## Architecture and authority

React career workbench → NestJS career domain → versioned scenario and owned SQLite repository initially. Manual and model-requested tools use the same domain boundary. Nova 2 Sonic is the candidate speech transport; Nova 2 Lite is the candidate bounded text/coach path. Existing PowerLab transport evidence is relevant to connectivity only, not proof of career dialogue or permissions.

The order engine owns inventory by timestamp, allocations, departure capacity/fee, deadlines and confirmed customer exceptions. Scenario code owns simulated time, actor facts and once-only incident transitions. The model chooses a permitted question/action or explains returned evidence. It cannot change scenario rules, invent acceptance, advance time implicitly or score employability.

The first concrete C09 preview design is one EC2 machine with Caddy HTTPS, a review-password gate, the existing single Node process and persistent encrypted EBS for SQLite. [Prepared configuration and open gates](../../deploy/README.md). S3/CloudFront, Lambda/API Gateway, DynamoDB and AgentCore remain later architecture options. Provision only once the local job simulation works and current account/region/budget/hostname prerequisites are checked. No need to introduce another service just to increase the list of technologies.

## Records

| Record | Required boundary |
| --- | --- |
| CareerPack | Immutable version, public brief, role facts, disclosure/acceptance policies, incident/variant rules; sealed reference examples stored separately |
| CareerSession | Owner, pack version, phase, world revision, artifact revision and current attempt |
| FactReceipt | Source ID, actor ID, visible fact, world revision, disclosed time; no hidden actor policy payload |
| DispatchPlan | Order/quantity/departure allocations; typed IDs only |
| Evaluation | Exact plan hash/revision and world revision; timed inventory, capacity, cost and commitment observations |
| Agreement | Order, authorized terms, actor-policy version, proposal and committed acceptance; LLM text is insufficient |
| Incident | Session/phase key, occurred time, old/new world revisions and notice; applied once |
| Attempt/Help | Guided/independent/assisted state, conceptual-help events, input source, frozen final outcome; history cannot be erased by retry |
| Handoff | Artifact/evaluation IDs, known facts, commitments and unresolved items; snapshot preview before any external sharing |
| Invocation | Separate provider reservation, usage/status and model/region; preserve failed/uncertain attempts |

Keep this domain isolated from `LabSchedule`, W/Wh and PowerLab IDs. Reuse proven patterns before extracting generic infrastructure; avoid rewriting working legacy repositories to accommodate an unbuilt abstraction.

## Proposed tool surface

| Tool | Effect and constraint |
| --- | --- |
| `read_order` / `read_stock` / `read_carriers` | Owner/session/phase-scoped facts with source revisions |
| `ask_actor` | Valid actor and approved intent; disclose only authorized facts; record discoveries |
| `set_allocation` | Draft quantity/departure edit with expected revision and undo |
| `evaluate_plan` | Immutable evaluation of current plan against current world facts |
| `propose_customer_change` | Supported order/quantity/date terms; server policy determines the simulated response |
| `confirm_plan` | Preview-bound confirmation, current evaluation/world revision, idempotent commit |
| `start_shift` | Explicit phase transition; applies authored supplier incident once |
| `request_coaching` | Records conceptual help before showing advice; independent attempts require a visible assisted transition |
| `preview_handoff` | Factual summary of existing receipts; does not contact any person |
| `pause` / `resume` | Preserve state and attempt; do not replay incidents or implicitly advance time |

Mutations require the server-derived owner, pinned pack, permitted phase, expected world/artifact revision and an idempotency key. Re-check after asynchronous provider calls. No success language before commit. Ambiguous/multi-order instructions return a typed proposal for user review; tool errors remain visible.

Natural questions have a constrained intent route with a deterministic structured fallback. An intent classifier's interpretation is not proof of a user's consent to change several orders. The initial scope does not require unrestricted agent planning or arbitrary tool chaining.

## Voice and assistance boundaries

The shared Sonic transport now has separate PowerLab and career policy adapters. Career tickets bind owner/session/revision/actor, with role/phase filters and a separate named provider allowance. Old PowerLab tickets retain only PowerLab authority. See [C06 implementation](AI-CONVERSATION.md). Model credentials remain server-side. Opening the page never starts microphone capture.

In guided practice, an actor may speak naturally from authorized facts. Cross-role fact leakage, unsupported promises and accidentally giving the answer are material failure cases, not problems a prompt alone solves. In independent replay, start with authored actor replies and suppress free-form generated model teaching/audio; allow explicit control input and factual receipts. Record assistance before enabling conceptual advice.

Stop closes microphone capture; stop playback preserves clear listening status; disconnect closes paid inference; requests use bounded output/context, idle/session limits, no unaccounted SDK retries, global and per-owner ceilings. Initial career limits are 10 text reservations / $0.20 and four voice reservations / $1.00, with 60-second voice sessions, one active career AI operation per owner and two globally. The old PowerLab four-session batch remains separate.

No raw audio persistence by default, no hidden reasoning stored, no real customer data, no external messages. Scenario “Send update” is visibly a simulated operation. Real teacher/career-adviser sharing is a later explicit grant with preview, scope and revocation.

## Reuse map

| Existing asset | Use in R4 |
| --- | --- |
| React/Vite + NestJS + shared TS setup | Reuse foundation |
| Owner/revision/idempotency patterns | Adapt into career domain without migrating PowerLab records |
| Immutable action/run evidence | Adapt to plan/world/evaluation/incident records |
| Sonic stream, audio worklet, usage controls | Reuse transport design after role/tools/budget isolation; retain old live evidence scope |
| PowerLab charts and W/Wh evaluator | Keep as historical prototype; not the new engine |
| Authored guidance and help recording | Reuse pattern with operations-specific approved activities |
| Old ledgers and content versions | Preserve verbatim; never reset to obtain more calls |

## Initial domain contract

The initial manual slice now implements the versioned fixture and pure evaluator using integer kit quantities, simulated timestamps, confirmed vs expected stock, flat fee per departure, customer commitments with explicit agreement overlays, and a documented trigger for the incident. Structured errors and original commit receipts are implemented. [Authored reference calculations](../../content/career/REFERENCE-VALUES.md) are separate from executable code and remain unverified. C05 now implements three structured actors with saved source snapshots, role/phase restrictions and backward-compatible session defaults. [Actor implementation](ACTOR-CONVERSATIONS.md). C06 now follows this boundary with Lite interpretation, voice input, saved allocation previews and manual Apply/Undo. C07 now records assistance before guidance, adds bounded AI activity selection and gates generated spoken replies on an assisted attempt plus an explicitly enabled, recorded voice start. C08 now adds linked independent replay under a separate scenario, blocks AI allocation previews until assisted and assembles reports from frozen handoff evidence. [Replay/report contract](REPLAY-AND-REPORT.md). Requested live/behavioral acceptance remains open. [Coaching implementation](COACHING.md). [AI implementation](AI-CONVERSATION.md).
