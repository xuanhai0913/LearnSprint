> **Historical R3 scope, superseded 2026-09-23:** the owner selected an operations-coordinator job simulation. Use the [current R4 plan](../career/DELIVERY-PLAN.md). This file preserves earlier PowerLab scope/evidence and must not drive new feature work or be copied as the current submission story.

# R3 delivery backlog

Type: reference. Updated 2026-09-23 after the initial Sonic increment. R-series is the current education release plan. Earlier B/P work is historical and does not complete these items. Hours retain the original planning baseline; they are not current remaining hours, measured throughput or a calendar promise. Re-estimate after the first acceptance pass.

| ID | Priority | Deliverable and acceptance | Hours | Dependency | State |
| --- | --- | --- | ---: | --- | --- |
| R00 | P0 | Research competitors/prior art; reconcile rules; rewrite coherent education strategy | — | Owner request | Done: documentation only |
| R01 | P0 | Review A/B/C objectives, numerical oracle and sources; initial learner/tutor discovery | 6 | R00; participants for interviews | A pack/provenance authored; subject review, B/C packs and discovery pending |
| R02 | P0 | Pure schedule evaluator, versioned fixtures and independent reference values | 8 | R01 content contract | Engine + A reference data implemented; compilation passed; acceptance pending |
| R03 | P0 | Visual brief, schedule workbench, results and revision comparison | 9 | R01–R02 | A UI implemented; compilation + entry-page observation; journeys/accessibility pending |
| R04 | P0 | Lab records, action/help events, revisions, pause/resume and local repository | 7 | R02 | Initial local sessions/artifacts/runs/manual events/receipts implemented; help/attempt/phase work and acceptance pending |
| R05 | P0 | Strands/Lite bounded coach, activity/source validation, authored fallback and usage ledger | 8 | R02–R04 | Planned |
| R06 | P0 | Sonic voice spike, then explicit tool commands, transcript, stop/undo and recovery | 10 | Early 2h spike after contract; full path R03–R05 | Partial: initial controls compile; one real edit/confirmation observed; full voice/assistance acceptance pending |
| R07 | P0 | Transfer B, review C, phase guards and truthful assistance/elapsed-time records | 6 | R02–R05 | Planned |
| R08 | P0 | Learner report preview and scoped tutor sharing/export | 5 | R04, R07 | Planned |
| R09 | P0 | AWS domain hosting, DynamoDB adapter, private static site, guest isolation and scoped roles | 10 | R04; account/deployment gate | Planned |
| R10 | P0 | AgentCore speech bridge, session-bound tickets, close/usage controls and deployment evidence | 8 | R06, R09 | Planned |
| R11 | P0 | Requested release verification: oracle, phase/security, live coach/voice, accessibility, fresh setup and fixes | 9 | R05–R10; active verification request | Planned |
| R12 | P0 | 6–8 learner / 2 tutor pilot target, comparator and delayed review; honest report | 9 | R03 early; R07–R08 for pilot; authorized recruitment | Planned |
| R13 | P0 | Fix top observed problems; refine lesson/voice/copy and evidence | 6 | R11–R12 | Planned |
| R14 | P0 | Repository/license/access, runnable release, resource inventory and claim audit | 4 | R09–R13 | Planned |
| R15 | P0 | Authentic screens, 2:45 video, English story, AWS explanation and tool feedback | 6 | R13–R14 | Planned |
| R16 | P0 | Final form/access refresh, owner review, submission and receipt | 3 | R15; final external authorization | Planned |
| R17 | P0 | Contingency for defects, account access or submission repair | 16 | As needed | Reserved |
| R18 | P1 | Single supported teacher image/text brief → confirmed parameters | 6 | G4 passed; spare time | Conditional |
| R19 | P1 | Reviewed Vietnamese text adaptation | 6 | Audience demand; G4 | Conditional |
| R20 | P1 | Small teacher assignment form | 6 | Tutor demand; G4 | Conditional |
| R21 | P2 | AgentCore Memory, more subjects, LMS/native Alexa/MCP integration | — | Observed need after release | Deferred |

**R01–R16: 114 hours. R17: 16 hours. Competitive baseline: 130 hours.** R18–R20 are additional, not hidden in the baseline. Substantial recruiting delays and new account restrictions can change the calendar. R06 includes an early two-hour feasibility allocation; do not count it twice.

Hai owns product choices, content acceptance and external/account decisions. The implementation owner delivers the focused engineering work under the active request. A subject reviewer and pilot volunteers are desired participants, not assumed team members. This document does not authorize spawning agents, recruiting people, deploying or spending by itself.

## First work item

Read [PowerLab local implementation](../engineering/POWERLAB-LOCAL.md), [voice handoff](../engineering/VOICE-SPIKE.md) and [first-slice handoff](FIRST-SLICE.md). A and initial voice controls are implemented; one live Sonic edit succeeded. Next extend assistance/attempt/phase records, then the grounded coach. Subject review/discovery and remaining voice/domain/UI acceptance stay open. No additional agent delegation is implied. Do not continue R2's API mission backend as the default next task.

## Historical work retained

The quiz foundation and `/mission-preview` API-permissions prototype remain useful code/evidence. Their exact state is in [the R2 snapshot](HISTORY-2026-09-23.md) and [API storyboard](../design/API-PROTOTYPE-STORYBOARD.md). The old 75-hour plan is superseded, not evidence of R3 completion.

For every item record changed files, observed checks, provider mode, unresolved defects and next action. Never mark user research or a live integration done from fixtures alone.
