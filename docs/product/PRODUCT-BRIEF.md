> **Historical R3 scope, superseded 2026-09-23:** the owner selected an operations-coordinator job simulation. Use the [current R4 plan](../career/PRODUCT-BRIEF.md). This file preserves earlier PowerLab scope/evidence and must not drive new feature work or be copied as the current submission story.

# LearnSprint — a practical STEM learning lab

Type: explanation. Revision 3, 2026-09-23. Status: recommended plan under the owner's education strategy request. The energy lab, voice workflow and teacher packet are not implemented. Existing quiz/API prototypes remain historical foundations.

## Product promise

**LearnSprint helps a learner design a useful solution, investigate why it fails, and apply the concept when the situation changes.**

Working tagline: **Build a solution. Understand the result. Apply it again.**

The learner works on an artifact in a small interactive lab. A conversational lab partner controls tools, retrieves relevant lesson material and selects helpful experiments. The application records what actually ran and what help was used. A tutor can review a concise account of those decisions.

## First audience and job

Primary: adults aged 18+ in introductory college STEM or vocational study who can use the English demo, initially recruited through reachable university clubs or tutors. First lesson: power, energy, service requirements and constrained planning. Secondary: a tutor or teaching assistant conducting a short practical tutorial.

Learner job: “I know the formula from class. Help me use it to make a plan that works, and notice what I still misunderstand.” Tutor job: “Show me the decision that needs attention, so I can help without reading a long chat.”

This is an initial segment chosen for a feasible pilot. It is not a claim that all students need this product, that we have institutional partners, or that the competition requires this audience. Vietnamese text and a broader school-age rollout need separate content/accessibility work. Nova 2 Sonic's currently documented languages do not include Vietnamese, so the release does not promise Vietnamese voice.

## The hero lesson: keep the study hub running

A fictional campus study hub has a battery, lights, a router, a fan and a laptop. The learner arranges device-use periods so the hub remains useful for the required time. The lab shows energy consumed, peak power and unmet service requirements. Turning every device off cannot pass.

1. **Start with a purpose.** The brief names the services people need and the available resources. A visual timeline opens immediately.
2. **Make a plan.** Toggle time blocks, move a charging period, or say “Move laptop charging to the third hour.” The same typed command contract serves voice and controls.
3. **See the consequence.** Run the schedule. The energy curve and power peaks come from the domain engine. Compare planned demand with the battery's two different limits.
4. **Investigate a difficulty.** The coach uses the actual run to offer a short experiment, such as shifting one load while keeping total energy constant. The learner can predict with a control and explore the result; a prose answer is optional.
5. **Face a changed situation.** A larger battery has a lower power ceiling. An earlier scheduling choice now overloads the source. The learner must adapt the plan, with conceptual hints disabled during the recorded independent attempt.
6. **Return with context.** A later session restores the plan and unresolved constraint. A new review variant can check application after 24–48 hours; a same-day demo of restoration is not evidence of retention.
7. **Make the work reviewable.** The learner opens a report containing the plan, run receipts, assistance and changed-task outcome, and chooses whether to share it with a tutor.

The [mission specification](MISSION-SPEC.md) defines exact parameters, accepted solutions and the simulator's limits.

## Four intended differentiators to earn

| Intended advantage | Product behavior | Evidence required |
| --- | --- | --- |
| A useful artifact with several valid solutions | A schedule balances services, energy and power; consequences are inspectable | Novice can explain the task and execute a meaningful change |
| Conversation acts on the lab | Voice can change a specified block, compare runs, pause and resume | Real tool receipts, reliable numbers, interruption/recovery, equivalent manual controls |
| Support responds to decisions | Coach refers to a specific failed constraint and opens a relevant experiment | Review whether interventions are correct, useful and appropriately restrained |
| Learning work is inspectable over time | Guided, independent and delayed attempts remain distinct; tutor sees action evidence | Learner/tutor pilot and fair comparison with a capable assistant using the same lab |

[Market research](../research/COMPETITIVE-LANDSCAPE.md) found substantial overlap with existing products and hackathon projects. The combination and execution for this learning job are our competitive hypothesis. We do not claim to have invented simulations, adaptive tutoring, transfer checks or voice learning.

## Scope and ambition

**P0 competitive release:** one excellent energy lesson family with practice A, transfer B and return-review C; visual scheduling lab; server evaluation; a grounded Bedrock coach; real English voice actions; durable session restore; learner-controlled tutor report; accessible direct controls; isolated judge access; reproducible source and authentic demo.

**P1 after core gates:** import a single teacher-owned image/text brief into the supported schema with human confirmation; a small teacher assignment form; Vietnamese text localization with content review; optional additional memory integration if it solves an observed problem. These are excluded from the headline demo until delivered.

**Later:** additional reviewed STEM packs, authoring tools, LMS integration, institutional accounts and native Alexa/MCP adapters. A full course generator, unrestricted code execution, 3D laboratory catalog and multi-agent spectacle are outside this submission.

Voice becomes a release target because meaningful conversational tool use strengthens this specific Alexa+ experience. The rules do not require voice. Text/control fallback remains complete; if voice cannot meet the early feasibility gate, revise the release claims and evidence map explicitly.

## AI and scientific authority

- The model organizes the interaction, selects a permitted activity and explains relevant evidence.
- Versioned lesson data and deterministic code calculate outcomes and enforce phase permissions.
- Factual session state, assistance and attempt receipts determine what the report can say.
- A possible misconception is a hypothesis, not a psychological diagnosis; show the actions that prompted it.
- The learner remains responsible for choices. During independent work, the agent may translate a specific control command, but cannot propose a solution or supply conceptual hints.
- The lab is an idealized educational planning model, not advice for connecting real electrical equipment.

## Impact and growth

Initial educational value: connect watts and watt-hours to a concrete plan, practice tradeoffs, and give tutors specific evidence. Commercial hypothesis: tutors or college clubs use short reviewed packs as pre-lab or follow-up work. No revenue, adoption, time saving or learning gain is established yet.

After the hackathon, spend the first month observing voluntary return usage and refining the first pack. Add a second lesson only when a tutor requests it and content-review effort is understood. A later paid offer could fund reviewed packs and instructor assignment/review tools while keeping a starter lesson accessible; price and willingness to pay require discovery.

## Definition of a successful submission

A judge can see a real sequence from plan to failure to useful support to independent adaptation; can reopen a saved session; can inspect truthful AWS integration; and can understand why a specific learner/tutor might use it. A small pilot must report actual observations and limitations. No local checklist can guarantee a judge's maximum score.

Implementation starts with the [first slice](../delivery/FIRST-SLICE.md), then follows the [roadmap](../delivery/ROADMAP.md). Detailed acceptance IDs are E01–E15 in [requirements](REQUIREMENTS.md).
