import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import type { CareerActivityId, CareerAssistanceSnapshot, CareerBrief, CareerCoachEvidence, CareerCoachingActivity, CareerEvaluation, CareerSession } from '@learnsprint/contracts';
import { careerError } from './errors.js';

export const careerActivityId = z.enum(['stock-timing', 'dispatch-fit', 'customer-promises', 'budget-check', 'handoff-clarity']);
const text = z.string().min(1).max(600);
const schema = z.object({ version: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/), activities: z.array(z.object({
  id: careerActivityId, title: text, objective: text, steps: z.array(text).min(1).max(4), prompt: text,
}).strict()).length(5) }).strict();
type Pack = z.infer<typeof schema>;
const time = (minute: number) => `${minute >= 1440 ? `day ${Math.floor(minute / 1440) + 1}` : 'today'} ${String(Math.floor(minute / 60) % 24).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

export function assistanceSnapshot(s: CareerSession): CareerAssistanceSnapshot {
  return { attemptId: s.attempt.id, history: s.attempt.history, mode: s.attempt.mode,
    helpCount: s.help.length, aiFocusCount: s.help.filter(h => h.focus).length, guidedVoiceCount: s.guidedVoice.length };
}

/** Authored guidance derived only from an immutable, already disclosed review. */
@Injectable()
export class CareerCoaching {
  readonly activeVersion = '0.1.0';
  private readonly packs = new Map<string, Pack>();
  constructor() { this.pack(this.activeVersion); }
  private pack(version: string): Pack {
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(version)) throw new Error('Invalid coaching version');
    const cached = this.packs.get(version); if (cached) return cached;
    const pack = schema.parse(JSON.parse(readFileSync(new URL(`../../../../content/career/coaching/${version}.json`, import.meta.url), 'utf8')));
    if (pack.version !== version || new Set(pack.activities.map(a => a.id)).size !== 5) throw new Error('Invalid coaching activity identifiers');
    this.packs.set(version, pack); return pack;
  }
  candidates(brief: CareerBrief, review: CareerEvaluation, version: string): CareerCoachingActivity[] {
    const r = review.outcome;
    const evidence = (id: string, label: string, observation: string, target: CareerCoachEvidence['target']): CareerCoachEvidence => ({ id, label, observation, target, evaluationId: review.id });
    const facts: Record<CareerActivityId, CareerCoachEvidence[]> = {
      'stock-timing': r.departures.map(d => evidence(`stock-${d.departureId}`, brief.departures.find(b => b.id === d.departureId)!.name,
        `${d.cumulativeAllocated} kits allocated cumulatively; ${d.availableByDeparture} projected available; ${d.shortage} short. Replenishment ETA in this review: ${time(review.eta)}.`, 'stock')),
      'dispatch-fit': [...r.orders.map(o => evidence(`quantity-${o.orderId}`, `Order ${o.orderId.toUpperCase()} total`, `${o.allocated} allocated; ${o.required} ordered.`, 'orders')),
        ...r.departures.map(d => evidence(`capacity-${d.departureId}`, brief.departures.find(b => b.id === d.departureId)!.name, `${d.load} kits on this trip; ${brief.departures.find(b => b.id === d.departureId)!.capacity} capacity.`, 'stock'))],
      'customer-promises': [...r.orders.flatMap(o => o.terms.map((t, i) => evidence(`promise-${o.orderId}-${i}`, `Order ${o.orderId.toUpperCase()} · ${time(t.by)}`, `${t.scheduledBy} scheduled by this time; ${t.quantity} required cumulatively. ${t.met ? 'Milestone met in the projection.' : 'Milestone not met.'}`, 'orders'))),
        ...brief.orders.filter(o => !o.allowSplit).map(o => evidence(`split-${o.id}`, `Order ${o.id.toUpperCase()} delivery condition`, 'One complete delivery is required by the original order.', 'orders'))],
      'budget-check': [evidence('budget-total', 'Shipping budget', `${r.cost} shipping units for used departures against ${r.budget} available.`, 'budget')],
      'handoff-clarity': [evidence('handoff-outcome', `Review ${review.number}`, `${r.issues.length} unresolved observations. ${r.dependsOnExpectedStock ? 'The plan relies on expected replenishment.' : 'The used departures do not rely on expected replenishment.'} ${review.agreement ? 'A recorded customer agreement is included.' : 'Original customer commitments apply.'}`, 'handoff')],
    };
    const preferred: CareerActivityId = !r.inventoryMet ? 'stock-timing' : !r.quantitiesMet || !r.capacityMet ? 'dispatch-fit' : !r.commitmentsMet ? 'customer-promises' : !r.budgetMet ? 'budget-check' : 'handoff-clarity';
    const activities = this.pack(version).activities.map(a => ({ ...structuredClone(a), version, evidence: facts[a.id] }));
    return [activities.find(a => a.id === preferred)!, ...activities.filter(a => a.id !== preferred)];
  }
  select(brief: CareerBrief, review: CareerEvaluation, version: string, activityId: CareerActivityId, evidenceIds: string[]): CareerCoachingActivity {
    const activity = this.candidates(brief, review, version).find(a => a.id === activityId);
    if (!activity || !evidenceIds.length || new Set(evidenceIds).size !== evidenceIds.length || evidenceIds.some(id => !activity.evidence.some(e => e.id === id))) careerError(422, 'COACH_EVIDENCE_INVALID', 'The suggested focus did not match the recorded review. Your saved guidance remains available.');
    return { ...activity, evidence: activity.evidence.filter(e => evidenceIds.includes(e.id)) };
  }
}
