# R4 delivery plan and reviewable experience

Type: how-to/reference. Updated 2026-09-24. Current career direction replaces unfinished PowerLab feature work. The previous 130-hour R3 estimate is historical and is not a measured remaining estimate for R4. Re-estimate after the local scenario slice and review actual weekly capacity. Initial source exists for C01–C08, with C05–C08 live/behavioral/content acceptance open; full acceptance remains open.

## Screen sequence

1. **Career entry:** “Your first shift: operations coordinator.” Show learner objective, approximate 15-minute design target, fictional scenario label, available input modes and the starting task. One role is active; no fake catalog of working careers.
2. **Work desk:** primary order board; stock/departure drawer; source-stamped notices; contextual actor panel. The board is the workspace, not a decorative widget next to a large chat.
3. **Stakeholder conversation:** select warehouse/customer/lead, see who is speaking, ask through voice/text or an equivalent structured control. A disclosed fact appears on the appropriate order card with its source.
4. **Plan review:** quantities, carrier arrivals, projected constraint checks and reliance on expected stock. Confirm a specific version. No invisible batch edits from a broad request.
5. **Incident:** after Start shift, show the 17:00 replenishment notice and mark the previous review outdated. Highlight affected commitments; learner determines the recovery.
6. **Recovery and handoff:** preview accepted customer changes, final allocations, shipping cost and unresolved work. Submit inside the simulation, then inspect what changed.
7. **Learning review:** factual timeline, assistance used, one evidence-based coaching observation and a short new variant. No employability or personality score.

Use the existing warm paper/ink visual language where it supports a working desk. Replace the battery hero with an order board and a legible workday timeline. Avoid decorative office imitation that hides the task. Keyboard/text paths must reveal the same essential facts as voice; mobile can stack board, record and conversation.

## Delivery backlog

| ID | Deliverable | Acceptance evidence / dependency |
| --- | --- | --- |
| C01 | Practitioner-readable original scenario and versioned fixture | Quantities/time/policies reviewed; no real employer claims |
| C02 | Pure timed-stock/dispatch/commitment evaluator | Explicit reference cases, invalid-input behavior and source versioning; requested verification required |
| C03 | Career board with manual draft/evaluate/confirm loop | Meaningful task works without AI; accessible quantities and stale results |
| C04 | Owned persistence, incident, phases and retry | Once-only incident, immutable plan/evaluation/agreements, pause/resume/conflict behavior |
| C05 | Actor facts and simulated customer-agreement tools | Scoped facts, deterministic acceptance, text/structured controls; no model-created promises |
| C06 | Live English role conversation and explicit voice tools | Real career tool receipts, transcript/cancel/stop/recovery, measured usage; PowerLab call is not acceptance |
| C07 | Bounded coach and assistance/attempt records | Evidence references; clear actor/coach separation; authored fallback labeled |
| C08 | Handoff report and short transfer variant | Facts/remaining work visible; new world version; independent help boundary |
| C09 | Hosted review path / reproducible local fallback | Actual account/access decisions, isolated identity, deploy receipts and teardown plan |
| C10 | Requested verification, practitioner/learner pilot and fixes | Honest findings/denominators, comparable baseline, no invented educational effect |
| C11 | Submission package and access | Actual demo video, source/setup/license, AWS story, friction feedback, forms and final submitted-state receipt |

### Current implementation checklist

- [x] Original versioned scenario and public/private content boundary.
- [x] Pure stock/dispatch/commitment evaluator, versioned review snapshots and separately authored reference calculations.
- [x] Manual `/career` board, draft retention, review and explicit plan recording.
- [x] Owned local persistence, revisions, original receipts, pause/resume and once-only supplier incident.
- [x] Structured customer B disclosure and supported agreement action; authored response labeled.
- [x] Final handoff preview/save with unresolved observations and read-only final state.
- [x] API/web compilation and Chrome entry-page display.
- [ ] Practitioner content review and requested behavioral/accessibility acceptance for C01–C04.
- [x] C05 structured warehouse/customer/lead contacts, role-scoped facts, explicit source receipts and earlier-reply history. [Implementation](ACTOR-CONVERSATIONS.md).
- [ ] C05 requested acceptance for role/phase restrictions, snapshot persistence, duplicate requests and draft retention.
- [x] C06 source: Lite question/preview routing, career voice input/tickets, separate allowance ledger, cancellation/recovery controls and explicit proposal Apply/Undo. [Implementation](AI-CONVERSATION.md).
- [x] C07 source gates opt-in generated role replies on recorded assistance and a committed guided voice start. Other career streams suppress generated output.
- [ ] C06 requested live/behavioral acceptance, source-fidelity review and measured usage for actor input/proposals/generated speech.
- [x] C07 source: authored review-bound activities, optional bounded AI focus, attempt/help records, conservative historical defaults and review/handoff assistance snapshots. [Implementation](COACHING.md).
- [ ] C07 requested behavioral/live acceptance, content review and evidence that guidance helps the target learner.
- [x] C07 hosted narrow path: authored guidance recorded after a review, one live Lite-approved focus, assistance counters and pre-help review snapshot persisted across reload (2026-09-24). Learning benefit and remaining boundary cases are unverified.
- [x] C06 hosted proposal narrow path: one saved Lite allocation proposal was applied and undone; the exact board value and action record persisted across Chrome reload (2026-09-25). Full voice and proposal edge-case acceptance remains open.
- [x] C09 narrow restart/owner path: one app-container restart retained the saved assisted shift; a fresh cookie could not access that shift (2026-09-25). Disk-loss recovery and broader concurrent-access behavior remain open.
- [x] C08 source: separate changed-condition variant, linked replay with preserved help, independent assistance boundary, final evidence report and local JSON export. [Implementation](REPLAY-AND-REPORT.md).
- [ ] C08 requested behavioral/content/accessibility acceptance, including duplicate opening, source isolation and report/export fidelity.
- [x] C08 hosted happy path: one linked changed-condition replay, distinct authored customer agreement, final handoff, source comparison, reload, same-child resume and one inspected JSON export observed on 2026-09-24. Other C08 acceptance items remain open.
- [x] C09 preparation: preview origin/proxy/cookie boundary, Docker/Caddy/Compose source, persistent storage configuration and source archive/checksum. [Runbook](../../deploy/README.md).
- [x] C09 cloud Docker build, Sydney EC2/CloudFront HTTPS deployment, account/hostname/base cost/IAM decisions and public entry observed in Chrome. Reviewer Basic Auth removed at the owner’s request.
- [x] C09 one hosted manual browser journey through sourced facts, initial review, delay, customer agreement, recovery, handoff and reload persistence (2026-09-24). This does not establish restart durability or voice/replay acceptance.
- [ ] C09 persistence across host restart and hosted voice acceptance.
- [ ] C10–C11 requested verification/pilot and actual submission artifacts.

Checked items mean source delivery or the specifically named observation, not full C-item acceptance. [Local implementation](LOCAL-IMPLEMENTATION.md) records exact routes, state, limitations and evidence. No application tests or career paid calls were run for the manual, C05, C06, C07 or C08 source increments.

## Working calendar and scope gates

| Window, Vietnam | Target |
| --- | --- |
| Sep 24–28 | C01–C04 initial slice: reviewable facts, manual board, evaluation, saved state and incident |
| Sep 29–Oct 3 | C05–C07: actor tools, one real voice conversation/action, bounded coach |
| Oct 4–9 | C08–C09: handoff, short replay, deployment/access decision and implementation |
| Oct 10–16 | C10: authorized verification and real participant feedback; fix observed weaknesses |
| Oct 17–18 | Freeze functionality; finish reproducibility and claim/access review |
| Oct 19–21 | C11: record functioning demo, prepare English story/feedback/repo/form |
| Oct 22 evening | Internal submission target |

This is a conditional working calendar, not a capacity commitment. Official cutoff remains October 24, 02:00 Vietnam, subject to the [competition reference](../hackathon/REQUIREMENTS.md) and a fresh check at submission. Earlier judging-start ambiguity is preserved there. Credit does not remove content, integration or recruitment risk.

If scope pressure appears, defer role catalogs, teacher authoring, arbitrary document upload, extra languages, external integrations and decorative 3D first. Preserve the complete one-shift decision/consequence story. If a core requirement cannot ship, state the changed scope explicitly; do not mark it complete.

## A three-minute demonstration story

Target 2:45, based on actual functioning behavior when available:

- 0:00–0:20: first-job learning problem and the three-order brief.
- 0:20–0:50: ask a warehouse question; show sourced answer and board action.
- 0:50–1:15: review initial plan, start shift, receive the delayed-stock incident.
- 1:15–1:55: negotiate B's permitted split and commit the recovery plan; show the real tool receipt and timed-stock result.
- 1:55–2:20: leave/resume and inspect the handoff/assistance trail.
- 2:20–2:45: show changed-task support and explain actual AWS integrations, limits and observed user feedback.

Do not fill this script with narration of unimplemented screens or describe an authored response as live. Clearly label the Alexa+ web simulation; no native Alexa certification/partnership is claimed.

## Judging evidence mapping

| Published criterion | Evidence this direction should produce |
| --- | --- |
| Tech Implementation | Career voice → validated tool → committed order state; deterministic outcomes; once-only incident; resume; actual AWS traces |
| Design | Work can be understood and completed with direct/text/voice controls; sourced facts, clear pending/confirmed state and recovery |
| Potential Impact | Target learners and an operations practitioner find a useful work-preparation task; report observed decisions and weaknesses |
| Quality of the Idea | Stakeholder conversation changes a concrete plan under evolving facts, with a useful handoff and explicit assistance |

These are proposed evidence targets, not self-awarded marks or a promise to win. Official obligations remain in [hackathon requirements](../hackathon/REQUIREMENTS.md). Existing [friction notes](../research/FRICTION-LOG.md) remain genuine historical observations; curate before publication.

## Small validation plan

Proposed: 5–8 target learners and 1–2 operations practitioners, subject to actual recruitment and consent. No outreach is authorized by this document. Ask practitioners whether the task, alternative agreement and handoff reflect plausible entry-level responsibilities. Observe whether learners distinguish expected stock from available stock, discover permitted customer flexibility and explain their final commitments.

Record time to a meaningful action, task completion, needed assistance, unsupported promises and the usefulness of the handoff. Compare with a capable assistant using the same facts/board where feasible. A small usability pilot cannot establish better employability or a causal learning benefit.

## Next concrete work

The AWS demo is deployed and opens publicly in Chrome. A complete manual first shift and one linked changed-condition replay, each through final handoff and reload, were observed on 2026-09-24; the report comparison, same-child replay resume and one JSON export were inspected. A separate assisted shift retained authored guidance, one Lite-selected focus and a frozen pre-help review snapshot across reload. A saved Lite allocation proposal was applied and undone in Chrome on 2026-09-25; the board and record persisted after reload. The duplicate contact desk seen during workspace updates was repaired in the AWS image. One app-container restart preserved that shift, and a fresh cookie could not open it. The 2026-09-25 ledger shows two Lite reservations left and three Sonic reservations closed or uncertain. Next diagnose the hosted Sonic browser audio path without another paid call; then check broader concurrent access, guidance quality, a real learner/practitioner pilot and C11 repository/video/submission materials. Continue using the AWS host for builds and runtime checks; the owner requested skipping local heavy builds/tests. Preserve old prototypes, data and budgets.

### C07 source delivered — acceptance still open

1. **Records and migration:** introduce a versioned attempt/help record, pinned to the scenario and relevant evaluation. Older sessions keep an explicit unknown history; never backfill an independent label or erase earlier help.
2. **Visible help boundary:** place “Get guidance” beside the review. Show what assistance will be recorded. Actor fact-finding stays in the contact desk; requesting a conceptual explanation is a separate action.
3. **Authored first response:** commit an approved operations-specific activity and its evidence references before displaying it. Initial activities cover stock by departure time, cumulative customer promises and handoff clarity. Preserve the learner's allocation choices.
4. **Bounded model guidance:** use the saved activity/evaluation and only disclosed facts. Store a validated response or clearly labeled authored fallback. Give the coach its own authority; it cannot edit orders or invent customer acceptance. Configure any additional provider allowance under active authorization without changing a used batch.
5. **Speech policy:** enable generated guidance only for an explicitly recorded assisted/guided attempt. Independent replay continues to suppress generated teaching and permits only supported factual/control input; inspect tool interpretations as part of this boundary.
6. **Evidence view:** show the exact assistance used alongside recorded plans, proposals and final outcomes. Keep fact discovery, model interpretation, manual decisions and conceptual help distinct. Report observations without a mastery or employability score.

The initial C07 source now implements the sequence above; generated coach wording remains authored while AI selects the focus. Compilation establishes source compatibility only. Requested acceptance must cover help-before-output ordering, retry/reload, stale evaluation rejection, preserved old history and voice assistance leakage. Do not add/run application tests solely because this future checklist exists.
