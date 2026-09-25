> **Historical R3 scope, superseded 2026-09-23:** the owner selected an operations-coordinator job simulation. Use the [current R4 plan](../career/MISSION-SPEC.md). This file preserves earlier PowerLab scope/evidence and must not drive new feature work or be copied as the current submission story.

# PowerLab mission specification

Type: reference. Revision 3, 2026-09-23. Practice A is now implemented locally with compilation evidence; B/C remain proposed. Educator validation and application acceptance are pending. Replaces API permissions as the current hero lesson. The existing [API prototype](../design/API-PROTOTYPE-STORYBOARD.md) remains unchanged. [Actual implementation](../engineering/POWERLAB-LOCAL.md).

## 1. Learning objectives

L1: distinguish instantaneous power (W) from accumulated energy (Wh).
L2: compute energy from power and operating time, with consistent units.
L3: satisfy several service requirements while respecting energy and power limits.
L4: adapt a schedule when duration, equipment ratings or a resource limit changes.

Concept references: [EIA, measuring electricity](https://www.eia.gov/energyexplained/electricity/measuring-electricity.php). All scenario ratings, battery limits, schedules and stories below are original fictional fixtures. They are not specifications of real products. Author our own lesson wording and diagrams, with source links; do not copy stock photographs from reference pages.

## 2. Domain model

A plan contains one-hour time slots. Each device is on or off in each slot. Dragging is optional: checkboxes, keyboard controls and explicit voice commands can perform every edit.

For slot j: `power[j] = sum(watts[i] × on[i,j])`.
Total requested energy: `energyWh = sum(power[j] × durationHours[j])`.
Peak requested power: `peakW = max(power[j])`.
Scheduled service for device i: `serviceHours[i] = sum(on[i,j] × durationHours[j])`.

A feasible plan meets all required service hours, total requested energy <= usable capacity, and every slot's power <= the power ceiling. Values exactly on a limit pass. Battery figures are already usable energy; do not apply an efficiency discount again.

This engine evaluates a planned schedule. The plotted line is requested consumption and projected remaining capacity, not measured physical electricity. An infeasible plan is visibly labeled; a graph must not imply that a source actually delivered power beyond its limit. Do not add unmodeled voltage, wiring, temperature, startup surge, aging or inverter claims. Equipment selection and household wiring are outside the lesson.

Use integer watts and integer slot minutes internally. Compute watt-minutes to avoid floating boundary errors; format Wh only at the presentation boundary. Keep source data, evaluated artifact revision and oracle version on each receipt.

## 3. Practice A — campus study hub

Duration: 4 hours. Usable energy: 240 Wh. Power ceiling: 120 W.

| Device | Power | Required service |
| --- | --- | --- |
| Lamp | 12 W | All 4 hours |
| Router | 8 W | All 4 hours |
| Fan | 24 W | At least 2 hours |
| Laptop charging | 60 W | At least 1 hour |

Initial plan: every device on throughout. Requested energy = 416 Wh; peak = 104 W. The power limit is satisfied, the energy limit is not. This distinction must remain visible.

One feasible example, not the only accepted answer: lamp/router all four slots; fan slots 1–2; laptop slot 1. Requested energy = 188 Wh; peak = 104 W. Another valid plan moves laptop to slot 3, preserving 188 Wh and reducing the peak to 80 W. A side-by-side comparison makes the difference between energy and simultaneous demand tangible.

Learner success is all constraints satisfied, not matching the reference schedule. All-off saves energy but fails the service requirements. No required essay or model grading is involved.

## 4. Transfer B — bigger capacity, tighter power limit

Duration: 6 hours. Usable energy: 360 Wh. Power ceiling: 80 W. Device powers are unchanged. Lamp/router must run all six hours; fan at least three hours; laptop charging at least two hours.

Provided candidate: lamp/router all slots; fan slots 1–3; laptop slots 1–2. It requests 312 Wh but peaks at 104 W. The larger energy capacity does not solve the simultaneous-power problem.

One feasible example: lamp/router all slots; laptop slots 1–2; fan slots 3–5. Requested energy = 312 Wh; peak = 80 W, exactly at the allowed boundary.

Show the new brief and all physical/resource facts. During the first independent attempt, withhold coaching experiments, worked solutions and prior solution replays. Ordinary control labels, units, accessibility support and explicit voice control remain available. If the learner asks for conceptual help, offer an explicit switch to assisted practice and record it. Never silently provide hints while labeling the result independent.

## 5. Return review C — a new set of ratings

Duration: 4 hours. Usable energy: 200 Wh. Power ceiling: 70 W. Lamp 10 W and router 10 W run throughout; fan 20 W runs at least two hours; laptop 40 W runs at least two hours.

A feasible schedule separates fan and laptop into two slots each: total 200 Wh, peak 60 W. Overlapping them produces 80 W and fails the power limit. This variant checks both changed ratings and an exact energy boundary. A source/coach-assisted outcome is retained as assisted.

The delayed pilot targets 24–48 hours after practice. A judge may open this variant sooner to inspect functionality, with elapsed time disclosed. Opening C is not proof of long-term retention.

## 6. Intervention catalog

| ID | Observable trigger / uncertainty | Activity | Source/authority |
| --- | --- | --- | --- |
| I01 | Run exceeds energy but not power; learner may have missed duration | Compare one device for two vs four hours; predict the energy change with a control | Domain engine + L1/L2 source card |
| I02 | Energy fits but one or more slots exceed the ceiling | Shift an optional load to a different slot while preserving runtime; overlay power and energy | Engine + L3 authored explanation |
| I03 | Energy/power fit but a required service is missing | Highlight the original brief and its unmet duration | Brief, not model speculation |
| I04 | Repeated broad edits without interpretable evidence | Invite one-variable comparison; learner chooses the variable | Authored investigation guidance |
| I05 | All constraints met with help | Offer the transfer brief; do not announce mastery | Phase policy and run receipt |

The model can choose among these activities and explain the choice using a run ID. It cannot change device values, invent a new physical law, reveal sealed transfer examples, or claim a hypothesis is proven from one click. An authored fallback uses the same activity schema and is labeled appropriately.

## 7. Required reference cases before implementation acceptance

1. A all-on: 416 Wh / 104 W / energy failure.
2. A valid overlapping example: 188 Wh / 104 W / pass.
3. A valid separated example: 188 Wh / 80 W / pass.
4. A all-off: 0 Wh / 0 W / service failure.
5. A missing one router slot: fail service, even if budgets fit.
6. B candidate: 312 Wh / 104 W / power failure.
7. B separated example: 312 Wh / 80 W / pass.
8. B simultaneous fan/laptop in any slot: fail at 104 W.
9. C separated example: 200 Wh / 60 W / pass at exact energy limit.
10. C overlapping example: power failure at 80 W.
11. Reject a negative rating, unknown device, out-of-range slot or modified pack version before running.
12. Editing a plan makes earlier results stale; a later receipt must refer to the new revision.

This is a planned acceptance set, not tests executed in this revision. Independently review expected values rather than deriving the oracle from the same helper that computes production results.

## 8. Evidence packet

Include: pseudonymous learner/session, pack/version, learning objectives, last artifact, run IDs, requested Wh/peak W/service flags, meaningful action timeline, hints viewed, AI/manual action origin, transfer mode, review elapsed time, and unresolved observations.

Use statements such as “met the three constraints in transfer B without conceptual hints in this session.” Avoid “mastered electricity,” “certified,” or inferred personality/ability scores. Optional learner explanation may enrich a tutor conversation but is not the authority for the numeric result. A tutor can inspect, question or annotate the packet; the learner chooses sharing.
