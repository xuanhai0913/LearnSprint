import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import type { CareerBrief } from '@learnsprint/contracts';

const id = z.string().regex(/^[a-z][a-z0-9-]{0,39}$/);
const version = z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/);
const text = z.string().min(1).max(1000);
const quantity = z.number().int().positive().max(10000);
const minute = z.number().int().min(0).max(10080);
const schema = z.object({
  brief: z.object({
    id: z.literal('first-shift'), version, title: text, company: text, role: text, description: text,
    onHand: quantity, replenishmentQuantity: quantity, initialEta: minute, budget: quantity,
    orders: z.array(z.object({ id, customer: text, quantity, deadline: minute, purpose: text, allowSplit: z.boolean() }).strict()).min(1).max(10),
    departures: z.array(z.object({ id, name: text, departure: minute, arrival: minute, capacity: quantity, fee: quantity }).strict()).min(1).max(10),
    objectives: z.array(text).min(1).max(10), assumptions: z.array(text).min(1).max(20),
  }).strict(),
  privateScenario: z.object({
    incidentMinute: minute, delayedEta: minute,
    splitPolicy: z.object({ version: text, orderId: id, actor: text, terms: z.array(z.object({ quantity, by: minute }).strict()).min(1).max(5), message: text }).strict(),
  }).strict(),
}).strict();
type Pack = z.infer<typeof schema>;

@Injectable()
export class CareerContent {
  private readonly root = new URL('../../../../content/career/', import.meta.url);
  private readonly packs = new Map<string, Pack>();
  readonly activeVersion: string;
  readonly replayVersion: string;
  constructor() {
    const manifest = z.object({ id: z.literal('first-shift'), activeVersion: version, replayVersion: version }).strict().parse(JSON.parse(readFileSync(new URL('pack.json', this.root), 'utf8')));
    this.activeVersion = manifest.activeVersion;
    this.replayVersion = manifest.replayVersion;
    if (this.activeVersion === this.replayVersion) throw new Error('Replay requires a distinct scenario version');
    this.get(this.activeVersion);
    this.get(this.replayVersion);
  }
  get(requested = this.activeVersion): Pack {
    version.parse(requested);
    const cached = this.packs.get(requested);
    if (cached) return cached;
    const pack = schema.parse(JSON.parse(readFileSync(new URL(`versions/${requested}.json`, this.root), 'utf8')));
    const { brief: b, privateScenario: p } = pack;
    if (b.version !== requested || new Set(b.orders.map(x => x.id)).size !== b.orders.length || new Set(b.departures.map(x => x.id)).size !== b.departures.length) throw new Error('Invalid career identifiers');
    if (b.departures.some((d, i) => d.arrival < d.departure || i > 0 && d.departure <= b.departures[i - 1].departure) || p.incidentMinute < 600 || p.incidentMinute >= b.initialEta || p.incidentMinute >= b.departures[0].departure || p.delayedEta <= b.initialEta) throw new Error('Invalid career chronology');
    const order = b.orders.find(o => o.id === p.splitPolicy.orderId);
    const terms = p.splitPolicy.terms;
    if (!order || terms.at(-1)!.quantity !== order.quantity || terms.some((t, i) => t.quantity > order.quantity || i > 0 && (t.quantity <= terms[i - 1].quantity || t.by <= terms[i - 1].by))) throw new Error('Invalid career customer policy');
    this.packs.set(requested, pack);
    return pack;
  }
  brief(requested = this.activeVersion): CareerBrief { return structuredClone(this.get(requested).brief); }
}
