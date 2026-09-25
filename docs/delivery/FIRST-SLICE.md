> **Historical R3 scope, superseded 2026-09-23:** the owner selected an operations-coordinator job simulation. Use the [current R4 plan](../career/DELIVERY-PLAN.md). This file preserves earlier PowerLab scope/evidence and must not drive new feature work or be copied as the current submission story.

# First implementation slice — one meaningful energy decision

Type: how-to. Revision 3. Practice-A source implementation delivered on 2026-09-23; API/web compilation passed. Interaction acceptance and educator validation are pending.

## Implementation handoff

Open [PowerLab](http://127.0.0.1:5173/powerlab). This slice now includes the content pack, server evaluator, workbench/results/comparison and an initial local SQLite repository with owner/revision/idempotency handling and pause/resume. See [implemented HTTP/source boundaries and checks](../engineering/POWERLAB-LOCAL.md).

The acceptance cases below remain a review plan: they were not executed in this implementation turn. No model calls or AWS resources were needed. The subsequent initial voice spike succeeded; see [voice evidence](../engineering/VOICE-SPIKE.md). Next are assistance/attempt/phase records and the grounded coach; do not rebuild this slice from scratch.

## Deliverable

A learner opens practice A, sees why the all-on plan fails, changes device time blocks, runs the schedule and finds a feasible solution. The view distinguishes energy, peak power and required services. No text answer, microphone or AWS request is necessary to perform this first slice.

The original estimate was an initial subset of R01–R03, approximately 6–8 focused hours, not the whole 130-hour release. The delivered source also includes an initial R04 local persistence boundary. This is not a measured time report or completion of every R01–R04 acceptance item.

## Sequence

1. Review [mission numbers and cases](../product/MISSION-SPEC.md) independently. Prepare a versioned `powerlab` content pack with original wording and source provenance.
2. Add a pure domain evaluator for schedules using integer watt-minutes. Keep reference values separate from its calculation helpers.
3. Build one route for the hub brief and four-device/four-slot editor. Preserve the existing API preview route and legacy data.
4. Show requested Wh, peak W and missing services, then an accessible time plot/table. Label values as modeled outcomes.
5. Keep the plan editable after a failed run and clearly mark old results stale after edits.
6. Add a comparison for two learner runs. A feasible plan must satisfy every constraint, including service requirements.
7. Record actual implementation state and any authorized checks; do not claim pilot validation.

## Minimum review cases

All-on → energy failure; all-off → service failure; valid overlap → pass at 188 Wh/104 W; moved laptop → same 188 Wh with 80 W peak; unknown device/slot → reject; edited plan → old result visibly stale.

These are acceptance cases to execute only under an active verification request, not a claim that tests already exist or passed.

## Design focus

One visual story: a study hub, its required services, a schedule and the consequences. The first action should be obvious. Use a keyboard-complete grid and numeric/time labels. Avoid a form-heavy onboarding wizard or a chat transcript as the main screen.

## Early adjacent spike

Allocate the first 2 hours of R06 before September 27 to the real Sonic connection and one typed tool call, under the applicable live-use authorization. This prevents voice/transport risk from arriving after the UI is complete. It does not block authoring the pure simulator or imply a full hosted integration.
