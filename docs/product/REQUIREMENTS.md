> **Historical R3 scope, superseded 2026-09-23:** the owner selected an operations-coordinator job simulation. Use the [current R4 plan](../career/DELIVERY-PLAN.md). This file preserves earlier PowerLab scope/evidence and must not drive new feature work or be copied as the current submission story.

# Education release requirements

Type: reference. Revision 3, 2026-09-23. E-series supersedes M-series/API and B-series/quiz release requirements. All E-items are planned; historical implementation does not satisfy them automatically.

## Acceptance contract

| ID | Priority | Requirement | Evidence needed before acceptance |
| --- | --- | --- | --- |
| E01 | P0 | Explain the study-hub goal, supported subject and required services before editing | Learner understands the task; facts agree with the versioned brief |
| E02 | P0 | Schedule device use with direct controls; no mandatory essay or voice | Keyboard and pointer can complete A/B/C; all-off cannot pass |
| E03 | P0 | Calculate energy, peak power and service constraints independently of the model | Reviewed reference cases, exact boundaries, invalid input rejection |
| E04 | P0 | Show meaningful consequences and compare revisions | Curves/numbers match receipts; an edit visibly makes an old result stale |
| E05 | P0 | Use Bedrock to select a bounded, evidence-specific intervention | Allowed activity, valid source/run IDs, useful content, transparent fallback |
| E06 | P0 | Real English speech can control the lab | Specific edit/run/compare/pause/resume commands work through tool calls; transcript/undo/error recovery |
| E07 | P0 | Restore authoritative session state across reload and a later visit | Same plan, phase, last receipt and assistance; conflict recovery and identity isolation |
| E08 | P0 | Distinguish practice, independent transfer and assisted transfer | B has changed constraints; help request changes the record; no solution leakage |
| E09 | P0 | Support C as a distinct review and record elapsed time | Different ratings; actual interval shown; no false delayed-learning claim |
| E10 | P0 | Produce an inspectable learner/tutor packet | Plan, receipts, assistance and unresolved observations; sharing controlled by learner |
| E11 | P0 | Keep scientific and progress authority in domain code | Model cannot fabricate runs, write mastery, change pack laws or use another learner's state |
| E12 | P0 | Deliver a coherent accessible experience | Readable units; controls without dragging/voice; focus, contrast, mobile/error states reviewed when requested |
| E13 | P0 | Provide a free, isolated judge path and documented AWS use | Working hosted guest path target, local fallback, real integration evidence, no owner credentials |
| E14 | P0 | Investigate value against a strong alternative | Actual learner/tutor observations, sample sizes, comparator access/method and limitations |
| E15 | P0 | Complete the submission package | Traceable claims, GitHub/setup/license or reviewer access, public demo, feedback and submitted-state receipt |
| E16 | P1 | Convert one supported teacher brief into proposed parameters | Image/text extraction with provenance and explicit human confirmation; unsupported topics rejected |
| E17 | P1 | Offer reviewed Vietnamese text / teacher assignment tools | Content review and user need; no unsupported Vietnamese voice claim |

Acceptance must cite actual evidence. “Implemented,” “checked,” “observed with users” and “submitted” are separate states. The active request governs whether to add/run tests; this table is a future contract.

## Product quality targets, not observed results

- First meaningful action within 60 seconds for at least 6 of 8 pilot learners.
- At least 6 of 8 finish A without facilitator rescue; at least 5 of 8 complete B without conceptual help. Report actual denominators if recruitment is smaller.
- At least four participants attempt C after 24–48 hours; report outcomes and interval individually, without causal or population-wide claims.
- Two tutors can identify a relevant intervention from a packet in about 60 seconds; record disagreement and ambiguity.
- Simulator result target p95 <300 ms locally; live coach target p95 <5 s; voice acknowledgment target p95 <2 s, complete action target p95 <4 s on the evaluation connection. These require measurements and may need revision after the spike.
- No false “saved,” “passed” or “independent” state in the release acceptance scenarios.

Learning targets guide iteration, not hidden eligibility thresholds or a fabricated score. [Research protocol](../research/USER-RESEARCH.md), [quality plan](../engineering/QUALITY-PLAN.md), [judge map](../hackathon/JUDGING-EVIDENCE.md).
