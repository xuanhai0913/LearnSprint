import { z } from 'zod';

export type SpokenCommand = { type: 'set_device_slot'; deviceId: string; slotId: string; on: boolean } | { type: 'run_plan' } | { type: 'undo_last_edit' };
const deviceNames: Record<string, string> = {
  lamp: 'lamp', 'desk lamp': 'lamp', light: 'lamp', router: 'router', 'wifi router': 'router', 'wi fi router': 'router', 'wi-fi router': 'router',
  fan: 'fan', 'desk fan': 'fan', laptop: 'laptop', 'laptop charger': 'laptop', charger: 'laptop',
};
const hours: Record<string, string> = { one: 'h1', two: 'h2', three: 'h3', four: 'h4', '1': 'h1', '2': 'h2', '3': 'h3', '4': 'h4' };

/** Narrow controls grammar. Ambiguous or conceptual requests never become inferred edits. */
export function parseSpokenCommand(transcript: string): SpokenCommand | null {
  const text = transcript.toLowerCase().replace(/[.,!?]/g, '').replace(/\s+/g, ' ').trim().replace(/^please /, '').replace(/ please$/, '');
  if (/^run (?:(?:the|this|my) )?plan$/.test(text)) return { type: 'run_plan' };
  if (/^undo (?:(?:the|my) )?last (?:voice )?(?:edit|change)$/.test(text)) return { type: 'undo_last_edit' };
  const a = text.match(/^(?:turn|switch) (on|off) (?:the )?(.+?) (?:in|for|at) hour (one|two|three|four|[1-4])$/);
  const b = text.match(/^(?:turn|switch) (?:the )?(.+?) (on|off) (?:in|for|at) hour (one|two|three|four|[1-4])$/);
  const c = text.match(/^set (?:the )?(.+?) (?:to )?(on|off) (?:in|for|at) hour (one|two|three|four|[1-4])$/);
  const device = a ? a[2] : (b ?? c)?.[1];
  const state = a ? a[1] : (b ?? c)?.[2];
  const hour = a ? a[3] : (b ?? c)?.[3];
  if (!device || !deviceNames[device] || !hour || !hours[hour]) return null;
  return { type: 'set_device_slot', deviceId: deviceNames[device], slotId: hours[hour], on: state === 'on' };
}

const slotSchema = z.object({ deviceId: z.enum(['lamp', 'router', 'fan', 'laptop']), slotId: z.enum(['h1', 'h2', 'h3', 'h4']), on: z.boolean() }).strict();
const emptySchema = z.object({}).strict();

export function parseToolCommand(name: string, raw: string): SpokenCommand | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (name === 'set_device_slot') { const parsed = slotSchema.safeParse(value); return parsed.success ? { type: name, ...parsed.data } : null; }
    if ((name === 'run_plan' || name === 'undo_last_edit') && emptySchema.safeParse(value).success) return { type: name };
  } catch { /* Malformed provider output cannot mutate a practice. */ }
  return null;
}

export function commandsMatch(a: SpokenCommand | null, b: SpokenCommand | null): boolean {
  if (!a || !b || a.type !== b.type) return false;
  return a.type !== 'set_device_slot' || b.type === 'set_device_slot' && a.deviceId === b.deviceId && a.slotId === b.slotId && a.on === b.on;
}

export const sonicTools = [
  { toolSpec: { name: 'set_device_slot', description: 'Apply exactly one explicit user request to turn a named device on or off in hour 1, 2, 3 or 4. Never infer an optimal schedule.', inputSchema: { json: JSON.stringify({ type: 'object', additionalProperties: false, properties: { deviceId: { type: 'string', enum: ['lamp', 'router', 'fan', 'laptop'] }, slotId: { type: 'string', enum: ['h1', 'h2', 'h3', 'h4'] }, on: { type: 'boolean' } }, required: ['deviceId', 'slotId', 'on'] }) } } },
  { toolSpec: { name: 'run_plan', description: 'Evaluate the saved plan only when the user explicitly says to run the plan. Read numbers only from this tool result.', inputSchema: { json: JSON.stringify({ type: 'object', additionalProperties: false, properties: {}, required: [] }) } } },
  { toolSpec: { name: 'undo_last_edit', description: 'Undo the last voice edit only when the user explicitly asks. Do not erase past runs or history.', inputSchema: { json: JSON.stringify({ type: 'object', additionalProperties: false, properties: {}, required: [] }) } } },
];
