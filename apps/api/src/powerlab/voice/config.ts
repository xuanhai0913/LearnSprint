import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';

export const voiceDataDir = process.env.LEARNSPRINT_DATA_DIR
  ? pathToFileURL(process.env.LEARNSPRINT_DATA_DIR.replace(/\/$/, '') + '/')
  : new URL('../../../../../.data/', import.meta.url);

const settingsSchema = z.object({
  enabled: z.literal(true),
  batchId: z.string().regex(/^[a-z0-9-]{8,100}$/),
  awsProfile: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),
  region: z.literal('us-east-1'),
  modelId: z.literal('amazon.nova-2-sonic-v1:0'),
  maxSessions: z.number().int().min(1).max(20),
  budgetUsd: z.number().positive().max(10),
  reservePerSessionUsd: z.number().min(.1).max(1),
  maxDurationSeconds: z.number().int().min(15).max(60),
}).strict().refine(config => config.maxSessions * config.reservePerSessionUsd <= config.budgetUsd + 1e-9);

export type VoiceSettings = z.infer<typeof settingsSchema>;

/** An operator-owned local file, never a browser-controlled model/budget setting. */
export function voiceSettings(): VoiceSettings | null {
  const path = new URL('voice-config.json', voiceDataDir);
  if (!existsSync(path)) return null;
  const input: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (input && typeof input === 'object' && 'enabled' in input && input.enabled === false) return null;
  return settingsSchema.parse(input);
}
