> **Historical R3 scope, superseded 2026-09-23:** the owner selected an operations-coordinator job simulation. Use the [current R4 plan](../career/DELIVERY-PLAN.md). This file preserves earlier PowerLab scope/evidence and must not drive new feature work or be copied as the current submission story.

# Judging evidence and competitive release gates

Type: product strategy/reference. Revision 3. This is our interpretation of the published criteria, not an official scoring rubric or forecast of a prize.

The [official rules](https://amazonappdev2026.devpost.com/rules) have a viability/track-fit screen followed by four equally weighted criteria: Tech Implementation, Design, Potential Impact and Quality of the Idea. Their Alexa+ examples distinguish simple Q&A from contextual tool workflows. The AWS examples favor purposeful integration. An optional genuine friction log may receive up to a 10% bonus. More services do not automatically earn more points.

## Stage-one eligibility gate

Use the Alexa+ web-simulation route and document the actual simulated conversational experience. Select AWS Builder only with actual documented service use. Repository, video, feedback, language and access obligations are in [requirements](REQUIREMENTS.md). None is complete merely because this plan names it.

## Make each strength visible

| Criterion | Product decision | Moment a judge should see | Artifact / evidence to collect | Current state |
| --- | --- | --- | --- | --- |
| Tech Implementation | Voice and manual commands share a validated domain boundary; actual simulator and persistent records | A spoken edit changes the schedule; a returned run drives the curve; reload restores it | Sanitized action/provider trace, reproducible reference cases, source paths, deployment manifest | Planned |
| Tech Implementation | Bedrock coaching chooses a permitted experiment from actual evidence | Relevant activity appears after a specific failed constraint | Input/output schema, actual run ID/source IDs, failure fallback and usage evidence | Planned |
| Design | One focused visual lab, readable W/Wh, equivalent keyboard/manual controls | Learner sees why the plan fails and can make a change immediately | Actual desktop/mobile screens, accessibility observations, full journey and recovery | Planned |
| Design | Voice is useful without being compulsory | “Move laptop to hour three”; corrected/ambiguous command is recoverable | Command/task success, latency, transcript/undo/stop behavior | Planned |
| Potential Impact | Concrete introductory STEM lesson and tutor review job | Student applies the principle in B; tutor inspects the relevant run | Real pilot with denominator, qualitative findings, fair comparator, delayed C if available | Unvalidated |
| Potential Impact | Content can extend through reviewed packs | Explain where the lesson fits before/after class | Tutor feedback, authoring contract, sustainable cost assumptions | Hypothesis |
| Quality of the Idea | A practical design artifact, contextual assistance and continuity form one workflow | Capacity increases but the plan still fails under a lower power ceiling; learner adapts | Clear story, actual interactions and explanation of prior art/differentiation | Planned |
| Quality of the Idea | Agent remembers factual work and routes to the right next task | Resume an unresolved constraint, then independent review | Persistent artifact + evidence-based recommendation, accurate elapsed time | Planned |
| Friction bonus | Actionable feedback from genuine build experience | Brief feedback reference in submission | Repro steps, expected/actual behavior, workaround, redacted trace and suggestion | Existing internal notes need curation |

## Internal quality review, not pretend scores

Use **Missing / Implemented / Verified / Demonstrated** per row. A row is Demonstrated only when it has functioning behavior, evidence and a clear place in the submission. No self-assigned 100/100 or estimated winning probability.

Before feature freeze, review all four criteria together. A sophisticated backend with a confusing lab, or attractive animation without actual outcomes, leaves a material gap. Reserve time for the weak criterion rather than adding another model or screen.

## Specific risks to competitiveness

- Existing products already offer adaptive lessons and interactive visuals; [research](../research/COMPETITIVE-LANDSCAPE.md) must inform honest positioning.
- Prior hackathon projects already use misconceptions and transfer. Our story must explain this practical job and show why the execution helps.
- Voice that merely reads a paragraph contributes little to this lesson. Show real tool actions and state continuity.
- Small pilot results cannot justify sweeping educational claims. Specific, modest evidence is stronger than invented adoption or mastery.
- The energy example must be tied to a real course/tutor need. Validate the choice early; everyday appearance alone does not establish impact.
- Canned screenshots, narrated future features and hidden failures cannot substitute for a functioning product.

## Release gates

G0: source/rules audit and coherent scope. G1: reviewed lesson + meaningful local lab. G2: feasible live voice action and grounded coach. G3: independent transfer, durable state and report. G4: isolated hosted review path and requested verification. G5: actual pilot/iteration and complete claim audit. G6: authentic video, final access and confirmed submission.

The [roadmap](../delivery/ROADMAP.md) assigns dates and [backlog](../delivery/BACKLOG.md) assigns work. If a gate fails, document the gap and adjust claims/scope; do not mark it complete to preserve a schedule.
