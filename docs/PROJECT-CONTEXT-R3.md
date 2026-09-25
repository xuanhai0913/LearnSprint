# LearnSprint project context

Type: explanation/handoff. Current strategy: **R3 education**, 2026-09-23. Read with [status](delivery/STATUS.md), [Vietnamese overview](PLAN-VI.md) and [product brief](product/PRODUCT-BRIEF.md).

## Owner intent and current direction

The owner requested an ambitious education project, fresh competition/competitor research and a rewritten plan aimed at strong judging evidence. They report receiving $150 promotional credit and prefer useful technical ambition over excessive cost minimization. They have not selected a native device requirement or a mandated educational audience.

Recommended direction: a conversational practical STEM lab, starting with energy-design schedules for a fictional study hub. Learners manipulate a meaningful artifact, inspect consequences, receive bounded guidance, adapt to changed constraints and return to factual saved state. A tutor can inspect a learner-controlled evidence packet.

Initial pilot segment: adults in introductory college/vocational STEM comfortable using the English demo. Energy is the first reviewed lesson family, not a claim that the whole product will forever be about batteries. Broader subjects/languages require content validation.

## Competition route and dates

Build, Ship, Shape: Amazon Developer Hackathon. Target Alexa+ web experience simulation + AWS Builder. Simulation is explicitly permitted without mandatory MCP/native preview access. Four equal judging criteria need actual evidence. See [requirements](hackathon/REQUIREMENTS.md) and [judge map](hackathon/JUDGING-EVIDENCE.md).

Official cutoff: October 24, 2026, 02:00 Vietnam. Internal target: October 22 evening. Official pages disagree about judging start; preserve access from submission through November 20 Pacific. Last observed Devpost entry: Untitled draft, 1/5 steps complete; not rechecked/edited this revision.

## What exists

- React/Vite, NestJS, TypeScript contracts, local SQLite quiz, versioned REST/authentication content.
- Server-only Bedrock adapter and durable invocation ledger; dated evidence for 26 old tests and five real application calls, including a grading failure.
- `/mission-preview`: browser-only API permissions prototype with authored guidance and in-memory state. It is not the proposed PowerLab release.
- R3 research, source register, product/design/architecture, 130-hour delivery plan, $150 usage model and submission drafts.
- `/powerlab`: practice-A content v0.1.0, pure server evaluator, direct schedule UI, outcome plots/table, two-run comparison, local owned SQLite sessions/actions/receipts and pause/resume. API/web compilation passed; the entry page was opened in Chrome. Interaction acceptance and subject validation are pending. [Implemented boundaries](engineering/POWERLAB-LOCAL.md).
- Initial English Nova 2 Sonic controls in practice A: microphone/stream UI, exact command matching, committed actions, transcript and stop/undo. One live synthetic fan-hour edit and confirmation audio succeeded through the actual WebSocket bridge; browser microphone/playback and broader R06 acceptance remain pending. [Voice implementation/evidence](engineering/VOICE-SPIKE.md).

## What remains planned

PowerLab B/C and full assistance/attempt phase records, grounded new coach, complete voice acceptance, scoped teacher report, AWS deployment/hosted identity, R3 verification, participant research and final submission. Practice A and initial live voice are implemented; no completion of the remaining release is inferred from compilation or one command.

## Architecture decision

Reuse the existing TypeScript foundation. Domain code owns arithmetic/results and phase permissions. Bedrock Nova 2 Lite/Strands supports the coach; Nova 2 Sonic uses a separate SDK speech adapter. Hosted target: Lambda/API Gateway domain boundary, DynamoDB state, S3/CloudFront static app and AgentCore Runtime speech bridge. Region/model/account feasibility is an early gate. Optional generated memory is not canonical evidence.

Preserve old data, pack versions, code and billing reservations. New E-requirements/R-backlog supersede the earlier B/M/P release plans. [Mission specification](product/MISSION-SPEC.md), [architecture](engineering/ARCHITECTURE.md), [backlog](delivery/BACKLOG.md).

## Costs and external actions

$150 is an owner-reported promotional code, not a freshly verified redeemed balance. Last observed Free plan blocked promotional redemption. The planning revision used no inference; the subsequent voice increment used one Sonic stream in `us-east-1`, estimated $0.00225955. Its separate named batch permits four $0.25 reservations with 60-second caps. No account upgrade, credit redemption or publication occurred. Keep prior ledgers and use the active allowance without repeat per-call approval requests.

Plans do not independently authorize account upgrades, external messages, purchases or publication. Carry authorized local work through to a concrete result before requesting any genuinely necessary final external decision.

## Evidence discipline

Market research found strong overlap with current products and direct hackathon precedents. Do not claim that interactive AI learning, misconception experiments or transfer were invented here. Compare a complete workflow fairly with a capable assistant using the same lab.

Distinguish proposed, implemented, checked, live-observed, user-observed and submitted. No automatic mastery, causal learning-effect or revenue claim. Historical facts are in [R2 history](delivery/HISTORY-2026-09-23.md); read the [first-slice handoff](delivery/FIRST-SLICE.md) and the next actions in [current status](delivery/STATUS.md) before continuing.

Latest increment: authored practice-A guidance is now requested explicitly against a fresh run and stored with timestamp, provider, run ID and activity snapshot. Future runs retain recorded assistance counts; historical absence does not establish independence. API/web compilation passed. Full attempt/phase policy and live coach remain next.
