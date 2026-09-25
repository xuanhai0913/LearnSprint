# Authored reference calculations — First Shift 0.1.0

These are human-readable content examples, written separately from the evaluator. No program generated or executed these outcomes. They remain proposals until independently reviewed and checked under a verification request. The application never loads this file.

## Original ETA: today 11:00

A sends 30 express; B sends 30 standard today; C sends 20 standard today. Departure loads are 30, 50 and 0. Cumulative allocations are 30, 80 and 80. Projected stock by each departure is 80, 80 and 80. Balances are 50, 0 and 0.

Shipping cost is 120 + 40 = 160. All original deadlines are met on this projection; A arrives exactly at 14:00 and B exactly at 18:00. The plan depends on the expected replenishment arriving before dispatch.

## Same plan after ETA changes to 17:00

Departure loads remain 30, 50 and 0; cumulative allocations remain 30, 80 and 80. Projected stock by departure becomes 40, 40 and 80. Balances are 10, −40 and 0.

The 16:00 departure has a 40-kit shortage. The later positive stock position does not repair that failure. Shipping is still 160 and scheduled arrival dates are unchanged, but the whole plan is infeasible under the changed stock facts.

## Recovery with B's recorded agreement

A sends 30 express. B sends 10 standard today and 20 standard tomorrow. C sends 20 standard tomorrow. Loads are 30, 10 and 40; cumulative allocations are 30, 40 and 80. Projected stock is 40, 40 and 80. Balances are 10, 0 and 0.

Shipping costs 120 + 40 + 40 = 200, equal to the budget. All capacities fit. A gets 30 by today 14:00; B gets 10 by today 18:00 and all 30 by tomorrow noon; C gets 20 by tomorrow noon. The replenishment assumption still matters for tomorrow's departure.

Without the recorded B agreement, this same allocation fails B's original all-30-today promise: only 10 of the required 30 arrive by 18:00. Merely reading the alternative offer does not change that promise.

## Interpretation boundaries

- A zero-allocation draft has zero shipping cost but misses quantities and commitments.
- A shared departure incurs one fee, not a fee per order.
- Allocation on multiple departures violates A's no-split condition even if the total quantity matches.
- A handoff may honestly record unresolved work. “Handoff saved” and “projected constraints met” are separate observations.

## Changed-condition replay 0.2.0 — separately authored examples

This short replay starts with the delay known: 50 kits on hand, 30 expected at 17:00. Customer B can agree to 20 by today 18:00 and all 30 by tomorrow noon. Other original deadlines, departures and the 200-unit budget are unchanged. The examples below have not been executed or independently reviewed.

Reusing the old recovery allocations (A: 30 express; B: 10 standard today + 20 tomorrow; C: 20 tomorrow) yields loads 30, 10, 40 and cumulative allocations 30, 40, 80. Availability is 50, 50, 80; balances 20, 10, 0. Stock and the 200-unit shipping budget fit, but B receives only 10 of the newly required 20 today, even after recording its new agreement.

One proposed new recovery after explicitly recording the new agreement is A: 30 express; B: 20 standard today + 10 tomorrow; C: 20 tomorrow. Loads are 30, 20, 30; cumulative allocations 30, 50, 80. Availability is 50, 50, 80, leaving 20, 0, 0. Shipping is 120 + 40 + 40 = 200. B receives 20 by today 18:00 and all 30 before tomorrow noon; A and C meet their original commitments. Without the new recorded agreement, B's original all-30-today promise is still unmet.

These are illustrative candidates, not the only possible allocations. They remain outside the frontend, actor contexts and report generator. A new replay begins with zero allocations rather than this reference plan.
