# Decision log

Type: explanation/reference. Historical entries describe the state when decided. Current product direction is R4 / D022 below; R3 remains historical where superseded. Current implementation/budget is in STATUS.md. Record reasons and consequences, not only selected tools.

## D001 — LearnSprint concept

- **Date:** 2026-09-23.
- **Status:** accepted by owner.
- **Decision:** build the short-session study companion described in the product brief and prepare context before implementation.
- **Reason:** provides a concrete end-to-end learning workflow that fits the proposed hackathon direction and the owner's web-development experience.
- **Consequence:** scope centers on grounded practice, adaptation, persistence and resume.

## D002 — dedicated local project

- **Date:** 2026-09-23.
- **Status:** accepted request, completed.
- **Decision:** create `/Users/nguyenhai/Documents/GitHub/LearnSprint` and keep it separate from the portfolio workspace.
- **Consequence:** this phase creates documentation only; Git remote, application code and cloud deployment remain pending.

## D003 — simulation-first Alexa+ path

- **Date:** 2026-09-23.
- **Status:** working direction within the accepted idea.
- **Decision:** design a clearly labeled web simulation and defer MCP/native device work.
- **Reason:** official participant tooling restrictions and limited delivery time.
- **Consequence:** the demo must prove real underlying learning behavior without claiming unavailable native integration.

## D004 — small original learning pack

- **Date:** 2026-09-23.
- **Status:** proposed default.
- **Decision:** start with REST/authentication passages and reviewed question rubrics, not arbitrary uploads.
- **Reason:** simplifies grounding, provenance, evaluation and demo reliability.
- **Consequence:** supported content is deliberately limited; explain that limit in the product.

## D005 — notebook design direction

- **Date:** 2026-09-23.
- **Status:** proposed design baseline.
- **Decision:** warm paper, dark ink, green action accent, serif headings and a compact session rail.
- **Reason:** support focused reading and visible continuity.
- **Consequence:** build tokens and core states before decorative polish; validate contrast and font rights during implementation.

## D006 — TypeScript and AWS candidates

- **Date:** 2026-09-23.
- **Status:** proposed; access gate unresolved.
- **Decision:** React/NestJS with bounded agent orchestration, Bedrock candidate and DynamoDB persistence.
- **Reason:** familiar stack and a useful AWS role in the actual product.
- **Consequence:** no model, region, paid plan or infrastructure is approved simply by this document. Resolve B01 first.

## D007 — English reusable documentation

- **Date:** 2026-09-23.
- **Status:** documentation default.
- **Decision:** keep detailed docs and submission drafts in English, with Vietnamese orientation and user communication.
- **Reason:** reduce later translation work and maintain one reusable technical context.

## D008 — initial Bedrock integration candidate

- **Date:** 2026-09-23.
- **Status:** working implementation candidate; one access check explicitly authorized and completed.
- **Decision:** start the future adapter with Nova 2 Lite using `global.amazon.nova-2-lite-v1:0` from the working Sydney Console context.
- **Evidence:** [one successful playground invocation](../engineering/BEDROCK-PREFLIGHT.md), with reasoning off and output capped at 128 tokens.
- **Consequence:** browser access is established. Application credentials, quotas, grounded-assessment quality and further spending still need their own implementation decisions. Global inference is not a Sydney-only data-processing promise.

## Pending decision queue

| Topic | Needed before |
| --- | --- |
| Weekly time and solo/team confirmation | Committing the baseline schedule |
| Exact model/provider/region and cost envelope | Live integration |
| Paid-plan upgrade or alternative | Restricted service use |
| Hosting and identity/session mechanism | Public demo |
| Speech provider and data handling | Microphone feature |
| Repository visibility and license | Publishing code |
| MCP/open-source extra scope | Spending time on P2 items |

## New decision template

```text
ID / date:
Status: proposed / accepted / superseded
Context and options:
Decision:
Evidence/reason:
Consequences and tradeoffs:
Owner:
Documents/backlog items to update:
```

## 2026-09-23 — Local implementation before live assessment

Use React/Vite and NestJS with pinned pnpm dependencies, Node 26.6.x, a type-only shared contract package and SQLite for the first local slice. Keep storage and assessment behind abstract provider boundaries. This makes durable session work possible without cloud credentials. DynamoDB remains a later candidate.

Fixture grading is explicitly selected by the user and visibly labeled. It is not AI evaluation or evidence of AWS Builder eligibility. The previously approved one-call budget has been consumed; no further AWS calls were made. Builds and server startup succeeded; behavioral acceptance remains pending.

## 2026-09-23 — Model calls outside session transactions

Use asynchronous providers outside SQLite write transactions. Recheck session revision/state before accepting the result. Persist each live invocation reservation before network I/O, disable SDK retries, and preserve uncertain reservations against the invocation cap. Dollar-budget enforcement and live-mode UI remain activation requirements. Keep the active provider as fixture until those are implemented and a new budget is authorized.

## 2026-09-23 — Explicit live mode and immutable approval batches

Select assessment mode only through validated server configuration, keeping fixture as default. Persist mode on sessions and answers, isolate recommendations by mode and reject mismatched answer inputs. Reserve a configured amount for every live attempt and preserve uncertain reservations. This is an application reservation cap, not an invoice guarantee; Nova 2 Lite does not currently offer CountTokens. No live settings or credential changes were made.

## D009 — make the practical mission the center

- **Date:** 2026-09-23.
- **Status:** detailed planning revision requested by owner; mission direction proposed for implementation and validation.
- **Context:** the owner challenged the advantage of mandatory written answers plus AI comments over asking ChatGPT.
- **Decision:** replace the quiz-centered release with an executable API-permissions mission, a changed business-rule transfer task and useful return-session evidence.
- **Reason:** a learner can act, observe consequences and demonstrate application in a ready environment.
- **Tradeoff:** fewer topics; additional simulator/content-authoring work. Interactive labs and capable assistants are existing alternatives, so differentiation must be evaluated.
- **Documents:** revised product brief, mission spec, M-series requirements and P-series backlog supersede the earlier release scope.

## D010 — separate functional outcome from AI coaching

- **Status:** target architecture, not implemented.
- **Decision:** independently reviewed deterministic oracle owns sandbox correctness. Bedrock selects/explains bounded interventions from real evidence and sources.
- **Reason:** the live prototype over-credited an incomplete answer; fluent model output cannot be the sole source of outcome truth.
- **Consequence:** record assistance and attempts, preserve a distinct transfer task, and avoid numerical mastery claims. Source validity and advice quality still need human review.

## D011 — reuse the foundation and preserve legacy evidence

- **Status:** implementation plan.
- **Decision:** retain React/NestJS/SQLite, provider infrastructure, source UI and integrity patterns. Add versioned mission records/routes; keep historical quiz data separate. Never reset billing reservations as part of a demo reset.
- **Reason:** a full rewrite would discard useful work without improving the learning interaction.
- **Consequence:** existing 26 tests/live-call evidence remain historical; new mission acceptance requires new evidence when requested.

## D012 — protect the core and prove the value

- **Status:** scheduling and research proposal.
- **Decision:** one mission family, NoteShare/TeamBoard variants, three activity templates. Voice/hosted convenience conditional; broader platform deferred. Allocate 67h core/release plus 8h contingency through the internal October 22 target.
- **Reason:** the competition story depends on an excellent action/transfer loop and credible learner value, not feature/service count.
- **Consequence:** compare with a strong ChatGPT-assisted baseline and report limitations; reserve final days for actual video, source access and forms. Future spending remains bounded by separate actual authorization.

## D013 — a bounded interactive preview before server migration

- **Date:** 2026-09-23.
- **Status:** implemented under the owner's request to continue.
- **Decision:** deliver P01 as an isolated React route, with deterministic synthetic behavior, authored help and a six-frame storyboard. Keep the old quiz available and avoid cloud calls for design iteration.
- **Reason:** the owner can inspect meaningful actions and consequences before more backend/model work.
- **Consequence:** preview reference outcomes are client-visible and state is in memory. Neither is suitable as the release assessment/persistence boundary. P02/P03/P07 must promote reviewed contracts and records to the server. TypeScript/Vite build passed; application acceptance is still pending.

## D014 — education strategy reset after market research

- **Date:** 2026-09-23.
- **Status:** research-backed recommendation under the owner's explicit plan-revision request; R3 implementation remains planned.
- **Decision:** practical STEM design lab with a learner/tutor workflow; move API permissions out of the hero submission.
- **Reason:** owner wants broader educational impact and competitiveness; current tutors already offer adaptive lessons/visuals, and hackathon precedents overlap with misconception/transfer concepts.
- **Consequence:** honest workflow differentiation, fair comparator and specific pilot evidence are required. Do not claim an unprecedented idea from generic features.

## D015 — one reviewed energy lesson family

- **Status:** proposed content/initial audience, pending subject review and discovery.
- **Decision:** PowerLab A practice, B changed constraints and C return review; initial adult college/vocational segment comfortable with English.
- **Reason:** visible practical outcome, transparent arithmetic, multiple valid plans and an accessible short demonstration.
- **Tradeoff:** limited subject breadth; the scenario's educational relevance must be confirmed. Fictional values are not real-device specifications.

## D016 — purposeful voice and AWS workflow

- **Status:** target architecture; feasibility and account access unverified for R3.
- **Decision:** reuse TypeScript/NestJS; Lite/Strands for bounded coaching, direct SDK Sonic speech path, AgentCore Runtime bridge, DynamoDB factual state and serverless HTTP/static delivery.
- **Reason:** speech can manipulate the lab and preserve context. Current Strands TypeScript documentation does not support assuming its experimental bidirectional path is available.
- **Consequence:** early voice/transport spike; native Alexa and generated long-term memory are outside the critical path.

## D017 — explicit independent-assistance boundary

- **Status:** design/implementation contract.
- **Decision:** domain receipts determine results; help switches the attempt to assisted. Independent voice accepts explicit control grammar and suppresses free-form generated teaching output.
- **Reason:** a speech model could otherwise leak a solution before a tool guard runs.
- **Consequence:** independent input may be more constrained; direct accessible controls always work. Reports describe observed work, not certification.

## D018 — $150 planning envelope with preserved account facts

- **Status:** cost plan, not a billing-state claim or completed account action.
- **Decision:** allocate $25 text/evaluation, $35 voice, $20 pre-submission infrastructure, $25 judging and $45 reserve; verify code redemption/coverage/expiry at deployment.
- **Reason:** the owner reports credit and wants enough ambition. Actual provider usage is small at pilot scale; account conditions still apply.
- **Consequence:** preserve old exhausted invocation batches, configure new bounded allowances under active authorization, avoid repeated per-call approval when covered. No account upgrade or inference occurred in this revision.

## D019 — competitive baseline and evidence gates

- **Status:** proposed delivery estimate.
- **Decision:** 114 focused hours plus 16 contingency, internal October 22 target; meaningful voice/hosting in P0, image import/extra language/teacher authoring P1.
- **Reason:** a coherent working lesson, user observations and authentic submission need reserved time.
- **Consequence:** approximately 30–32 hours/week assumption; old 75-hour API estimate is superseded. Maximum judging points cannot be guaranteed by a feature checklist.

## D020 — practice A with server-owned outcomes and a local repository

- **Date:** 2026-09-23.
- **Status:** source implemented under the owner's continuation; API/web compilation passed; entry page opened in Chrome. Application acceptance and educator review remain pending.
- **Decision:** ship `/powerlab` with original content v0.1.0, a pure integer watt-minute evaluator, native hour controls, exact-run charts/table/comparison and a separate SQLite feature module. Include initial browser ownership, revisions, idempotent receipts, action events and pause/resume so the first useful artifact can be continued later.
- **Reason:** the next reviewable increment must let a learner make and inspect a meaningful energy decision, with future AI grounded in an exact factual artifact.
- **Consequence:** local capability cookies are not production identity. Only A is active; B/C, assistance records, coach/voice, reports and AWS hosting remain open. No inference allowance was consumed or reset. [Implementation and actual observations](../engineering/POWERLAB-LOCAL.md).

## D021 — initial Sonic controls through the owned practice boundary

- **Date:** 2026-09-23.
- **Status:** early R06 implemented and one-command feasibility observed under the owner's continuation; full voice acceptance remains pending.
- **Decision:** use the direct AWS SDK bidirectional transport for Nova 2 Sonic in us-east-1, a local same-origin WebSocket bridge and explicit microphone activation. Validate tool arguments against the latest finalized spoken control, then apply through the existing owner/phase/revision transaction before unlocking confirmation.
- **Reason:** speech should change the actual learning artifact, with factual receipts and inspectable action origin. Keeping independent B/C out of this initial adapter preserves their stronger assistance contract.
- **Budget:** separate immutable voice batch, four $0.25 reservations, total $1, maximum 60 seconds/session. One successful synthetic call estimated $0.00225955; prior ledgers unchanged. No account upgrade, redemption or hosted deployment.
- **Tradeoffs:** narrow English grammar, no general conversational coaching, connection-scoped undo, local identity only. Browser microphone/playback, other commands and recovery cases remain unverified; returned generated wording is not deterministic TTS. R04/R05 records and coach are next.
- **Evidence:** [voice handoff](../engineering/VOICE-SPIKE.md). Do not present this as full R06, native Alexa, a production release or a learner outcome.

## D022 — first-job simulation with operations coordination

- **Date:** 2026-09-23.
- **Status:** owner selected the product direction and operations role. Detailed fictional scenario is a proposed implementation baseline, not practitioner-validated content.
- **Context:** the owner challenged the physics-heavy product identity, requested options and selected simulated work experience, then orders/customer/delivery operations.
- **Decision:** LearnSprint's hero becomes First Shift: inspect three orders, discover scoped facts, draft dispatch commitments, respond to delayed replenishment, obtain a supported customer agreement and produce a factual handoff. Start with one role and one short changed-task variant.
- **Reason:** give speech a natural stakeholder purpose and connect learning to a concrete entry-level work artifact. Existing job simulations are acknowledged; demand and comparative value require actual evidence.
- **Consequences:** R4 C-items replace unfinished R3 feature work. Preserve PowerLab/API/quiz prototypes and ledgers. Reuse framework/state/transport patterns; build a separate career engine/route and role-scoped tools. No simple renaming of the physics engine. No recruitment scores, employer endorsement, accredited internship or maximum-score promise.
- **Current delivery:** planning documents and context updated only. No career implementation, inference, account changes, outreach, deployment or submission in this revision.
- **References:** [brief](../career/PRODUCT-BRIEF.md), [mission](../career/MISSION-SPEC.md), [technical contract](../career/TECHNICAL-CONTRACT.md), [delivery plan](../career/DELIVERY-PLAN.md).

## D023 — manual First Shift domain before career conversation

- **Date:** 2026-09-23.
- **Status:** initial local source implemented and compiled; entry page displayed. Practitioner and behavioral acceptance remain open.
- **Decision:** implement a separate career fixture, pure evaluator, owned SQLite domain and manual work desk. Preserve exact review snapshots and original command receipts. A supplier incident changes the world revision once; an explicit authored customer agreement changes the applicable commitment. Final handoff may retain unresolved observations.
- **Reason:** role conversation needs real actions and inspectable consequences. Numerical feasibility and customer acceptance must not depend on generated prose.
- **Tradeoffs:** local browser capability instead of hosted accounts; bounded JSON session records instead of a production event store; structured B contact instead of natural conversation; no assistance/transfer claim. A recorded plan is not a booking or proof of delivery.
- **Evidence:** [local implementation](../career/LOCAL-IMPLEMENTATION.md). No application tests, paid calls or account/publication changes in this increment. Complete broader actor facts before the career voice adapter; preserve old ledgers and PowerLab ticket scope.

## D024 — scoped authored contacts and frozen source replies

- **Date:** 2026-09-23.
- **Status:** C05 source implemented and compiled; behavioral acceptance pending.
- **Decision:** give warehouse/customer/lead distinct question permissions and source fields. Save an authored reply with its exact source/world snapshot in the same transaction as the original command receipt. Reading facts preserves the allocation draft and cannot accept a customer agreement.
- **Reason:** a later voice/text layer needs a factual, inspectable boundary. A contact's fluent wording must not grant authority over stock, budgets or customer commitments.
- **Consequences:** role names are fictional; eight structured questions are currently supported. Older sessions receive empty logs without backfilled conversations. The original scenario stays unchanged, and dialogue is versioned separately. C06 adds natural dialogue; C07 records conceptual coaching separately.
- **Evidence:** [actor implementation](../career/ACTOR-CONVERSATIONS.md). No new application tests, model calls, external communications or deployment in this increment.

## D025 — natural career input with explicit allocation previews

- **Date:** 2026-09-24.
- **Status:** initial C06 source implemented and compiled; live/behavioral acceptance remains open.
- **Decision:** route short text through Nova 2 Lite and English audio through a career-scoped Nova 2 Sonic adapter. Reuse authored actor replies; convert one explicit allocation request into a saved preview requiring manual Apply, with bounded Undo. Keep agreement/plan/incident/handoff authority in existing explicit domain commands.
- **Reason:** a model can misunderstand quantities or mix permissions. A visible before/after artifact lets the learner inspect that interpretation while the deterministic domain owns the work outcome.
- **Assistance boundary:** suppress generated career assistant text/audio until C07 can record/enforce assistance. The current voice increment is input plus on-screen source receipts, not completed two-way role speech.
- **Budget:** new immutable career batches: 10 × $0.02 text and 4 × $0.25 voice reservations, 60 seconds per voice session; $1.20 combined application envelope. Created under continued bounded development authorization; no new model invocation occurred. Historical ledgers remain unchanged.
- **Tradeoffs:** single-question/single-cell scope, local ownership and English voice first. Natural interpretation, cancellation, stale previews, undo and shared transport regression still need requested behavioral/live evidence. C07 assistance/attempt records are next.
- **Evidence:** [AI implementation](../career/AI-CONVERSATION.md), [current status](../delivery/STATUS.md).

## D026 — record assistance before guidance and optional speech

- **Date:** 2026-09-24.
- **Status:** initial C07 source implemented and compiled under the owner's continuation; behavioral/live/content acceptance remains open.
- **Decision:** attach five versioned authored activities to exact saved reviews. Commit help before returning guidance; let Lite choose only an approved activity and valid evidence IDs. New sessions are guided practice, while older sessions preserve unknown earlier help. Reviews and handoff freeze assistance counts at their own timestamps.
- **Speech boundary:** generated role replies default off and require an assisted attempt, explicit ticket opt-in and a committed guided voice start before streaming. Count enabled starts conservatively, even when the connection fails. Keep saved source facts authoritative.
- **Reason:** factual discovery, AI interpretation and conceptual coaching have different educational meanings. A zero help count is not evidence of independent performance, and a prompt alone cannot enforce assistance recording.
- **Tradeoffs:** coach wording remains authored and bounded; model selection and generated speech still require requested live/content review. Independent changed-task replay is C08 work. Guided speech can paraphrase incorrectly, so source fidelity remains an acceptance gate.
- **Cost/evidence:** existing career text/voice allowances are shared and unchanged; no application tests, live provider calls, microphone sessions, deployment or account/submission changes. [Implementation](../career/COACHING.md).
