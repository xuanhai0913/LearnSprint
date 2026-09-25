import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import type { CareerActor, CareerActorId, CareerActorReply, CareerBrief, CareerFact, CareerQuestionId, CareerSession } from '@learnsprint/contracts';
import { careerError } from './errors.js';

const allowed: Record<CareerActorId, readonly CareerQuestionId[]> = {
  warehouse: ['stock', 'eta', 'departures'],
  'customer-b': ['commitment', 'split'],
  'shift-lead': ['budget', 'handoff', 'escalation'],
};
const version = z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/);
const text = z.string().min(1).max(1200);
const schema = z.object({
  version, packVersion: version,
  actors: z.array(z.object({
    id: z.enum(['warehouse', 'customer-b', 'shift-lead']), name: text, role: text, scope: text,
    questions: z.array(z.object({
      id: z.enum(['stock', 'eta', 'departures', 'commitment', 'split', 'budget', 'handoff', 'escalation']), label: text, response: text,
    }).strict()).min(1).max(8),
  }).strict()).length(3),
}).strict();
type Dialogue = z.infer<typeof schema>;

function time(minute: number): string {
  const day = Math.floor(minute / 1440) + 1;
  return `${day === 1 ? 'today' : `day ${day}`} ${String(Math.floor(minute % 1440 / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
}
function render(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{([a-zA-Z]+)\}/g, (_match, key: string) => {
    if (!Object.hasOwn(values, key)) throw new Error('Unresolved career actor template');
    return String(values[key]);
  });
}

/** Authored, role-scoped facts. This class has no model or persistence authority. */
@Injectable()
export class CareerActors {
  readonly activeVersion = '0.1.0';
  private readonly cache = new Map<string, Dialogue>();

  constructor() { this.get(this.activeVersion, '0.1.0'); }

  forPack(packVersion: string): string {
    const requested = packVersion === '0.2.0' ? '0.2.0' : this.activeVersion;
    this.get(requested, packVersion);
    return requested;
  }

  private get(requested: string, packVersion: string): Dialogue {
    version.parse(requested);
    let value = this.cache.get(requested);
    if (!value) {
      value = schema.parse(JSON.parse(readFileSync(new URL(`../../../../content/career/actors/${requested}.json`, import.meta.url), 'utf8')));
      if (value.version !== requested || new Set(value.actors.map(a => a.id)).size !== 3 || value.actors.some(a => {
        const ids = a.questions.map(q => q.id);
        return new Set(ids).size !== allowed[a.id].length || ids.length !== allowed[a.id].length || ids.some(id => !allowed[a.id].includes(id));
      })) throw new Error('Invalid career actor policy');
      this.cache.set(requested, value);
    }
    if (value.packVersion !== packVersion) throw new Error('Career dialogue does not match the pinned scenario');
    return value;
  }

  directory(s: CareerSession): CareerActor[] {
    return this.get(s.dialogueVersion, s.packVersion).actors.map(a => ({
      id: a.id, name: a.name, role: a.role, scope: a.scope,
      questions: a.questions.map(q => {
        const reason = this.unavailable(s, q.id);
        return { id: q.id, label: q.label, available: reason === null, unavailableReason: reason };
      }),
    }));
  }

  requireQuestion(s: CareerSession, actorId: CareerActorId, questionId: CareerQuestionId) {
    const actor = this.get(s.dialogueVersion, s.packVersion).actors.find(a => a.id === actorId);
    const question = actor?.questions.find(q => q.id === questionId);
    if (!actor || !question) careerError(400, 'ACTOR_SCOPE', 'Choose a question this contact is authorized to answer.');
    const reason = this.unavailable(s, questionId);
    if (reason) careerError(409, 'ACTOR_NOT_AVAILABLE', reason);
    return { actor, question };
  }

  private unavailable(s: CareerSession, questionId: CareerQuestionId): string | null {
    if (s.phase === 'handed_off') return 'This handoff is final. Recorded conversations remain available.';
    if (s.paused) return 'Resume the shift to ask a new question.';
    if (questionId === 'split' && s.phase !== 'recovery') return 'Split-delivery contact opens after you start the shift.';
    return null;
  }

  reply(s: CareerSession, brief: CareerBrief, actorId: CareerActorId, questionId: CareerQuestionId, now: string): CareerActorReply {
    const { actor, question } = this.requireQuestion(s, actorId, questionId);
    const facts: CareerFact[] = [];
    const values: Record<string, string | number> = {};
    const sourceVersion = `first-shift@${s.packVersion}`;
    const fact = (id: string, label: string, value: string, sourceId: string, sourceLabel: string, target: CareerFact['target'], source = sourceVersion) => {
      facts.push({ id, label, value, sourceId, sourceLabel, sourceVersion: source, target });
    };
    switch (questionId) {
      case 'stock':
        values.onHand = brief.onHand; values.replenishment = brief.replenishmentQuantity;
        fact('on-hand', 'Confirmed on hand', `${brief.onHand} study kits`, 'stock-register', 'Warehouse stock register', 'inventory');
        fact('expected-quantity', 'Expected, not received', `${brief.replenishmentQuantity} additional kits`, 'supplier-notice', s.incidentAt ? 'Supplier delay notice' : 'Initial supplier notice', 'inventory', `${sourceVersion}/${s.incidentAt ? 'delay' : 'initial'}`);
        break;
      case 'eta':
        values.eta = time(s.eta); values.replenishment = brief.replenishmentQuantity;
        fact('replenishment', 'Expected replenishment', `${brief.replenishmentQuantity} kits at ${time(s.eta)}; receipt not confirmed`, 'supplier-notice', s.incidentAt ? 'Supplier delay notice' : 'Initial supplier notice', 'inventory', `${sourceVersion}/${s.incidentAt ? 'delay' : 'initial'}`);
        break;
      case 'departures':
        for (const d of brief.departures) fact(d.id, d.name, `Stage by ${time(d.departure)}; arrive ${time(d.arrival)}; capacity ${d.capacity} kits`, 'dispatch-schedule', 'Dispatch schedule', 'departures');
        break;
      case 'commitment': {
        const order = brief.orders.find(o => o.id === 'b');
        if (!order) throw new Error('Missing career customer order');
        const terms = s.agreement?.terms ?? [{ quantity: order.quantity, by: order.deadline }];
        values.quantity = order.quantity;
        values.commitment = terms.map(t => `${t.quantity} kits in total by ${time(t.by)}`).join('; ');
        fact('commitment-b', 'Recorded customer commitment', String(values.commitment), s.agreement ? 'customer-b-agreement' : 'order-b', s.agreement ? 'Accepted customer B agreement' : 'Original order B', 'order-b', s.agreement?.agreementId ?? sourceVersion);
        break;
      }
      case 'split': {
        if (!s.offer) throw new Error('Customer offer must exist before disclosure');
        values.offer = s.agreement ? 'Our split arrangement is already recorded. The terms below are the current commitment for this order.' : s.offer.message;
        fact('split-b', s.agreement ? 'Accepted split' : 'Available split offer', s.offer.terms.map(t => `${t.quantity} kits in total by ${time(t.by)}`).join('; '), s.agreement ? 'customer-b-agreement' : 'customer-b-offer', s.agreement ? 'Accepted customer B agreement' : 'Customer B authored acceptance policy', 'order-b', s.agreement?.agreementId ?? `${s.offer.policyVersion}/${s.offer.id}`);
        break;
      }
      case 'budget':
        values.budget = brief.budget;
        fact('budget', 'Shipping allowance', `${brief.budget} scenario units; one flat fee per used departure`, 'shipping-budget', 'Shift shipping budget', 'departures');
        break;
      case 'handoff':
        fact('handoff-policy', 'Required handoff record', 'Recorded plan, stock assumptions, accepted customer changes and unresolved commitments', 'handoff-policy', 'Shift lead handoff policy', 'handoff', `career-dialogue@${s.dialogueVersion}`);
        break;
      case 'escalation':
        fact('change-policy', 'Customer-change authority', 'Only an accepted customer agreement changes the promise. Unresolved work remains visible at handoff.', 'change-policy', 'Shift lead escalation policy', 'handoff', `career-dialogue@${s.dialogueVersion}`);
        break;
    }
    return {
      id: randomUUID(), actorId, actorName: actor.name, role: actor.role, questionId, question: question.label,
      message: render(question.response, values), mode: 'authored', dialogueVersion: s.dialogueVersion,
      packVersion: s.packVersion, worldRevision: s.worldRevision, facts,
      offerId: questionId === 'split' ? s.offer!.id : null, recordedAt: now,
    };
  }
}
