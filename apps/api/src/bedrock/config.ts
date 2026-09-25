import { z } from 'zod';
import { FixtureAssessmentProvider } from '../study/assessment.js';
import { BedrockAssessmentProvider } from './provider.js';

/** Server environment only. Missing or invalid live settings fail closed at startup. */
export function createAssessmentProvider() {
  const mode = process.env.LEARNSPRINT_ASSESSMENT_MODE ?? 'fixture';
  if (mode === 'fixture') return new FixtureAssessmentProvider();
  if (mode !== 'bedrock') throw new Error('Unsupported LEARNSPRINT_ASSESSMENT_MODE');
  const settings = z.object({
    approved: z.literal('yes'),
    batch: z.string().min(8).max(100),
    calls: z.coerce.number().int().min(1).max(100),
    budget: z.coerce.number().positive().max(100),
    reserve: z.coerce.number().positive().max(100),
  }).safeParse({approved:process.env.LEARNSPRINT_LIVE_APPROVED,batch:process.env.LEARNSPRINT_APPROVAL_BATCH,
    calls:process.env.LEARNSPRINT_MAX_INVOCATIONS,budget:process.env.LEARNSPRINT_BUDGET_USD,
    reserve:process.env.LEARNSPRINT_RESERVE_PER_CALL_USD});
  if (!settings.success || settings.data.reserve > settings.data.budget) throw new Error('Live assessment requires an approved batch, invocation limit and valid budget reservation settings');
  return new BedrockAssessmentProvider({enabled:true,approvalBatch:settings.data.batch,maxInvocations:settings.data.calls,
    budgetUsd:settings.data.budget,reservePerCallUsd:settings.data.reserve,
    region:'ap-southeast-2',modelId:'global.amazon.nova-2-lite-v1:0'});
}
