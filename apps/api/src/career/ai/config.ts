import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';

export const careerAiDataDir = process.env.LEARNSPRINT_DATA_DIR
  ? pathToFileURL(process.env.LEARNSPRINT_DATA_DIR.replace(/\/$/, '') + '/')
  : new URL('../../../../../.data/', import.meta.url);
const allowance = {
  batchId: z.string().regex(/^[a-z0-9-]{8,100}$/), maxInvocations: z.number().int().min(1).max(50),
  budgetUsd: z.number().positive().max(5), reserveUsd: z.number().min(.02).max(1),
};
const schema = z.object({
  enabled: z.literal(true), awsProfile: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/).optional(), region: z.literal('us-east-1'),
  text: z.object({ ...allowance, modelId: z.literal('us.amazon.nova-2-lite-v1:0') }).strict(),
  voice: z.object({ ...allowance, modelId: z.literal('amazon.nova-2-sonic-v1:0'), maxDurationSeconds: z.number().int().min(15).max(60) }).strict(),
}).strict().refine(s => s.text.batchId !== s.voice.batchId && [s.text, s.voice].every(a => a.maxInvocations * a.reserveUsd <= a.budgetUsd + 1e-9) && s.voice.reserveUsd >= .25);
export type CareerAiSettings = z.infer<typeof schema>;
export type CareerAllowance = (CareerAiSettings['text'] | CareerAiSettings['voice']) & { mode: 'text' | 'voice'; region: string; awsProfile?: string };
export function careerAllowance(config: CareerAiSettings, mode: 'text' | 'voice'): CareerAllowance {
  return { ...config[mode], mode, region: config.region, awsProfile: config.awsProfile };
}
export function careerAiSettings(): CareerAiSettings | null {
  const path = new URL('career-ai-config.json', careerAiDataDir);
  if (!existsSync(path)) return null;
  const value: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (value && typeof value === 'object' && 'enabled' in value && value.enabled === false) return null;
  return schema.parse(value);
}
