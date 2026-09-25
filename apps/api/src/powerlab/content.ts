import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import type { LabPack, LabScenario } from '@learnsprint/contracts';
import { normalizeSchedule } from './engine.js';

const id = z.string().regex(/^[a-z][a-z0-9-]{0,39}$/);
const version = z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/);
const text = z.string().min(1).max(1200);
const packSchema = z.object({
  id: z.literal('powerlab'),
  version,
  oracleVersion: z.string().regex(/^[a-z0-9.-]{1,80}$/),
  title: text,
  objectives: z.array(z.object({ id: z.string().max(20), text }).strict()).min(1).max(12),
  sources: z.array(z.object({ id, title: text, url: z.url().refine(url => url.startsWith('https://')), note: text }).strict()).min(1).max(12),
  assumptions: z.array(text).min(1).max(20),
  scenarios: z.array(z.object({
    id,
    title: text,
    brief: text,
    capacityWh: z.number().int().positive().max(100000),
    maxPowerW: z.number().int().positive().max(100000),
    slots: z.array(z.object({ id, label: text, start: z.string().regex(/^\d{2}:\d{2}$/), end: z.string().regex(/^\d{2}:\d{2}$/), minutes: z.number().int().positive().max(120) }).strict()).min(1).max(24),
    devices: z.array(z.object({
      id, name: text, kind: z.enum(['lamp', 'router', 'fan', 'laptop']),
      watts: z.number().int().positive().max(10000),
      requiredMinutes: z.number().int().positive().max(2880),
      service: z.enum(['every_slot', 'minimum_duration']), purpose: text,
    }).strict()).min(1).max(8),
    initialSchedule: z.record(id, z.array(id).max(24)),
  }).strict()).min(1).max(12),
}).strict();

@Injectable()
export class LabContentService {
  private readonly root = new URL('../../../../content/powerlab/', import.meta.url);
  private readonly packs = new Map<string, LabPack>();
  readonly activeVersion: string;

  constructor() {
    const manifest = z.object({ id: z.literal('powerlab'), activeVersion: version }).strict()
      .parse(JSON.parse(readFileSync(new URL('pack.json', this.root), 'utf8')));
    this.activeVersion = manifest.activeVersion;
    this.get(this.activeVersion);
  }

  get(requestedVersion = this.activeVersion): LabPack {
    version.parse(requestedVersion);
    const cached = this.packs.get(requestedVersion);
    if (cached) return cached;
    const pack = packSchema.parse(JSON.parse(readFileSync(new URL(`versions/${requestedVersion}.json`, this.root), 'utf8')));
    if (pack.version !== requestedVersion) throw new Error('PowerLab content version mismatch');
    this.unique(pack.scenarios.map(scenario => scenario.id));
    this.unique(pack.sources.map(source => source.id));
    this.unique(pack.objectives.map(objective => objective.id));
    for (const scenario of pack.scenarios) {
      this.unique(scenario.devices.map(device => device.id));
      this.unique(scenario.slots.map(slot => slot.id));
      const duration = scenario.slots.reduce((sum, slot) => sum + slot.minutes, 0);
      for (const device of scenario.devices) {
        if (device.requiredMinutes > duration || device.service === 'every_slot' && device.requiredMinutes !== duration) {
          throw new Error('PowerLab has an inconsistent service requirement');
        }
      }
      scenario.initialSchedule = normalizeSchedule(scenario, scenario.initialSchedule);
    }
    this.packs.set(requestedVersion, pack);
    return pack;
  }

  scenario(packVersion: string, scenarioId: string): LabScenario | undefined {
    return this.get(packVersion).scenarios.find(scenario => scenario.id === scenarioId);
  }

  private unique(ids: string[]) {
    if (new Set(ids).size !== ids.length) throw new Error('PowerLab content has duplicate identifiers');
  }
}
