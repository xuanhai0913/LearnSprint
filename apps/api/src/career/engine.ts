import type { CareerBrief, CareerPlan, CareerOutcome, CareerAgreement, CareerIssue } from '@learnsprint/contracts';
export const CAREER_ENGINE_VERSION = 'career-engine-0.1.0';
export class InvalidCareerPlan extends Error {}

export function normalizePlan(brief: CareerBrief, input: CareerPlan): CareerPlan {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length !== brief.orders.length || Object.keys(input).some(id => !brief.orders.some(o => o.id === id))) throw new InvalidCareerPlan('The plan must include each supported order exactly once.');
  const plan: CareerPlan = {};
  for (const order of brief.orders) {
    const row = input[order.id];
    if (!row || typeof row !== 'object' || Array.isArray(row) || Object.keys(row).length !== brief.departures.length || Object.keys(row).some(id => !brief.departures.some(d => d.id === id))) throw new InvalidCareerPlan('Each order needs a quantity for every supported departure.');
    plan[order.id] = {};
    for (const d of brief.departures) {
      const q = row[d.id];
      if (!Number.isInteger(q) || q < 0 || q > order.quantity) throw new InvalidCareerPlan(`Use whole quantities from 0 to ${order.quantity} for order ${order.id.toUpperCase()}.`);
      plan[order.id][d.id] = q;
    }
  }
  return plan;
}

/** Pure projection. Expected replenishment is a stated assumption, never physical delivery. */
export function evaluateCareer(brief: CareerBrief, input: CareerPlan, eta: number, agreement: CareerAgreement | null): CareerOutcome {
  const plan = normalizePlan(brief, input);
  const issues: CareerIssue[] = [];
  let cumulative = 0, dependsOnExpectedStock = false;
  const departures = brief.departures.map(d => {
    const load = brief.orders.reduce((sum, o) => sum + plan[o.id][d.id], 0);
    cumulative += load;
    const available = brief.onHand + (eta <= d.departure ? brief.replenishmentQuantity : 0);
    const shortage = Math.max(0, cumulative - available);
    if (load > d.capacity) issues.push({ code: 'capacity', departureId: d.id, message: `${d.name} carries ${load} kits against a capacity of ${d.capacity}.` });
    if (shortage > 0) issues.push({ code: 'inventory', departureId: d.id, message: `By ${d.name.toLowerCase()}, ${cumulative} kits are allocated but only ${available} are projected available: ${shortage} short.` });
    if (load > 0 && cumulative > brief.onHand && eta <= d.departure) dependsOnExpectedStock = true;
    return { departureId: d.id, load, cumulativeAllocated: cumulative, availableByDeparture: available, projectedBalance: available - cumulative, shortage, fee: load ? d.fee : 0 };
  });
  const orders = brief.orders.map(o => {
    const allocated = brief.departures.reduce((sum, d) => sum + plan[o.id][d.id], 0);
    if (allocated !== o.quantity) issues.push({ code: 'quantity', orderId: o.id, message: `Order ${o.id.toUpperCase()} has ${allocated} of ${o.quantity} kits allocated.` });
    const splitMet = o.allowSplit || brief.departures.filter(d => plan[o.id][d.id] > 0).length <= 1;
    if (!splitMet) issues.push({ code: 'split', orderId: o.id, message: `Order ${o.id.toUpperCase()} requires one complete delivery.` });
    const milestones = agreement?.orderId === o.id ? agreement.terms : [{ quantity: o.quantity, by: o.deadline }];
    const terms = milestones.map(t => {
      const scheduledBy = brief.departures.reduce((sum, d) => sum + (d.arrival <= t.by ? plan[o.id][d.id] : 0), 0);
      return { ...t, scheduledBy, met: scheduledBy >= t.quantity };
    });
    if (terms.some(t => !t.met)) issues.push({ code: 'deadline', orderId: o.id, message: `Order ${o.id.toUpperCase()} does not meet its recorded delivery deadline${terms.length > 1 ? 's' : ''}.` });
    return { orderId: o.id, allocated, required: o.quantity, terms, met: allocated === o.quantity && splitMet && terms.every(t => t.met) };
  });
  const cost = departures.reduce((sum, d) => sum + d.fee, 0);
  if (cost > brief.budget) issues.push({ code: 'budget', message: `Shipping costs ${cost} units against a ${brief.budget}-unit budget.` });
  return {
    feasible: issues.length === 0, cost, budget: brief.budget, budgetMet: cost <= brief.budget,
    inventoryMet: !issues.some(i => i.code === 'inventory'), capacityMet: !issues.some(i => i.code === 'capacity'),
    commitmentsMet: !issues.some(i => i.code === 'deadline' || i.code === 'split'), quantitiesMet: !issues.some(i => i.code === 'quantity'),
    dependsOnExpectedStock, issues, departures, orders,
  };
}
