# First Shift — the delayed replenishment

Type: reference. R4 proposed mission, 2026-09-23. Original fictional content; no real customer, merchant, carrier, stock or money is involved. The manual local slice is implemented, compiled and its entry page displayed. It is not yet behaviorally accepted or reviewed by an operations practitioner. See [implementation boundaries](LOCAL-IMPLEMENTATION.md).

## Setting and visible work

At 10:00 on day one, the learner takes an order-support shift at a fictional stationery supplier. One SKU, **study kits**, keeps product arithmetic simple. They handle three orders, inspect operational facts, make a plan and leave a truthful handoff. Each kit is indivisible. Shipping prices below are scenario currency units, not real rates.

### Orders at the start

| Order | Quantity | Existing customer commitment | Why it matters |
| --- | ---: | --- | --- |
| A — workshop organizer | 30 kits | Day 1, 14:00 | The workshop needs the full quantity; partial delivery is not acceptable |
| B — training office | 30 kits | Day 1, 18:00 | The recorded order requests all 30 today; any split requires explicit customer agreement |
| C — community club | 20 kits | Day 2, 12:00 | All 20 are needed by tomorrow; there is no benefit requirement for sending early |

Visible stock card: 40 kits on hand. A replenishment of 40 kits is **expected** at day 1, 11:00. The UI distinguishes expected from physically available stock; the learner can inspect the source and last update. The prediction is not a guarantee.

### Delivery services and budget

| Service | Departure / latest staging time | Arrival | Total kit capacity | Flat fee per booked departure |
| --- | --- | --- | ---: | ---: |
| Express today | Day 1, 12:00 | Day 1, 14:00 | 40 | 120 |
| Standard today | Day 1, 16:00 | Day 1, 18:00 | 80 | 40 |
| Standard tomorrow | Day 2, 09:00 | Day 2, 11:00 | 80 | 40 |

Fees are per departure, not per order. Several order allocations can share its capacity and one fee. Total shift shipping budget: **200**. No tax, route optimization, geography, returns or discounts are modeled. Arrival exactly on a deadline passes. Inventory cannot be reused across departures.

## Task sequence and controlled incident

1. **Orient:** read the handoff and open the board. Identify what is confirmed, what is expected and whose deadline is earliest.
2. **Investigate:** inspect stock/carrier records; ask actors through speech, text or equivalent structured actions. Essential facts cannot depend on pronunciation or an exact secret phrase.
3. **Draft and review:** assign quantities to departures. A review identifies projected breaches and reliance on replenishment. It does not reveal an optimal schedule. The initial plan is recorded against world revision 1.
4. **Start the shift:** the learner explicitly confirms the initial plan to advance simulated time to 10:30. This phase transition emits a supplier notice **once**: the replenishment ETA is now 17:00. Time is scenario-controlled, not a countdown while the learner reads. No dispatch has left yet.
5. **Recover:** inspect the affected commitments, contact the appropriate customer, revise the plan and confirm the recovery version against the current world revision (2 after the notice; 3 after the customer agreement). The initial version remains visible as evidence; it does not become an error retroactively under old facts.
6. **Handoff:** review current commitments, agreed changes, departures and unresolved work. A structured handoff is assembled from receipts. Optional text can add context; an essay is not required.
7. **Compare and retry:** show what changed and which facts caused it. A separate changed-condition variant is offered without replaying the earlier solution.

The incident always follows the explicit phase transition, independent of whether the first plan looked good. Reload, retries and speech cannot apply it twice or make it disappear. A learner may revise an infeasible draft without triggering the incident prematurely.

## Actors and factual authority

| Actor | May know / disclose | Must not do |
| --- | --- | --- |
| Warehouse colleague | On-hand quantity, current ETA, departure staging constraints; links to source facts | Invent stock or suggest the full optimal plan |
| Customer B | Their order and an authored policy: **10 today by 18:00 and 20 tomorrow by 12:00 is acceptable**, if the learner asks about a split | Accept a different quantity/date just because the model improvises it |
| Shift lead | Shipping budget, escalation procedure, expectations for a clear handoff | Secretly raise the budget, grade personality or complete the task |

Customer A's no-split condition and C's deadline are readable in their order records; they do not require two extra voice personas. Customer B's permissible alternative can be discovered by asking a natural question or using an accessible “Ask about a split delivery” action. Both routes reveal the same fact and create a discovery receipt.

An agreement requires a supported proposal and a server-recorded actor acceptance. A fluent “sounds good” generated outside that tool path is not approval. Hidden actor facts are scoped to the actor server route; do not send all actor policies to every model or embed the private fact pack in the frontend bundle. Learners see legitimate discovered facts, never a sealed answer schedule.

## Domain outcomes and a proposed reference plan

After the delay, a candidate using 30 express for A and 50 standard-today for B+C is infeasible: before 16:00 only the original 40 kits exist, so it allocates **40 kits more than available**. Do not treat the 17:00 replenishment as stock for a 16:00 departure.

One proposed recovery, after B accepts the split:

| Departure | Allocations | Stock reasoning |
| --- | --- | --- |
| Express today | A: 30 | 40 initial − 30 = 10 remaining |
| Standard today | B: 10 | Uses the remaining 10 before replenishment |
| Standard tomorrow | B: 20; C: 20 | Uses all 40 arriving at 17:00 on day one |

Cost = 120 + 40 + 40 = **200**. Express load 30 <= 40; standard-today load 10 <= 80; next-day load 40 <= 80. All deliveries meet their **recorded** commitments after B's explicit agreement. The same plan without that agreement breaches B's original deadline. These are authored example calculations, not executed engine tests or a validated professional solution.

An honest escalation can complete a handoff while leaving a commitment unresolved. Separate “handoff complete,” “plan feasible under recorded facts” and “all customer commitments met.” Do not award a blanket success badge for merely submitting a document.

## Learning records and replay

Record the fact source/revision used, learner actions, draft/commit revisions, accepted customer changes, provider mode and conceptual help. Objective observations include double-allocation, missed departure, unsupported customer promise, exceeded budget and unresolved handoff items.

AI coaching may comment on these events with citations. Avoid a single employability score, personality judgment, confidence/accent rating or mastery certificate. Labels describe this exercise only.

The short transfer variant changes a deadline or split policy in a **new mission version**. It is not created by arbitrary model improvisation. Legitimate stakeholder questions remain available without counting as coaching; conceptual help switches the attempt to assisted. Begin with structured, authored actor replies in independent mode. Free-form generated actor speech is disabled there until it can preserve this boundary; voice may remain an explicit command-input path with factual UI acknowledgments.

## Before acceptance

Obtain practitioner review of quantities, workflow, terminology and the relevance of the task. Under an active verification request, cover initial/recovery feasibility, insufficient timed stock, shared departure fees, capacities, unsupported agreements, stale world revisions, duplicate incident/commit requests, cancellation, owner isolation, reload and text/keyboard parity. Those cases are planned, not run by writing this document.
