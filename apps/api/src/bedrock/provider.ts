import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { assessmentInstruction, assessmentPayload, parseAssessment } from './contract.js';
import type { AssessmentContext, ModelAssessment } from './contract.js';
import { InvocationLedger } from './ledger.js';
import { AssessmentProvider } from '../study/assessment.js';

const configSchema = z.object({
  enabled: z.literal(true),
  approvalBatch: z.string().min(8).max(100),
  budgetUsd: z.number().positive(),
  reservePerCallUsd: z.number().positive(),
  maxInvocations: z.number().int().min(1).max(100),
  region: z.literal('ap-southeast-2'),
  modelId: z.literal('global.amazon.nova-2-lite-v1:0'),
}).strict();
export type BedrockConfig = z.infer<typeof configSchema>;

/** Server-only adapter selected by validated startup configuration, never HTTP input. */
export class BedrockAssessmentProvider extends AssessmentProvider {
  readonly mode = 'bedrock' as const;
  private readonly config: BedrockConfig;
  private readonly client: BedrockRuntimeClient;
  private readonly ledger: InvocationLedger;
  constructor(config: BedrockConfig) {
    super();
    this.config = configSchema.parse(config);
    this.client = new BedrockRuntimeClient({region: this.config.region, maxAttempts: 1});
    this.ledger = new InvocationLedger();
  }
  async assess(input: AssessmentContext): Promise<ModelAssessment> {
    const payload = assessmentPayload(input);
    const fingerprint = createHash('sha256').update(JSON.stringify({payload, system:assessmentInstruction, model:this.config.modelId, maxTokens:512})).digest('hex');
    const previous = this.ledger.reserve(input.requestId,this.config.approvalBatch,fingerprint,this.config.maxInvocations,this.config.budgetUsd,this.config.reservePerCallUsd);
    if (previous) return previous;
    let stage='request';
    try {
      const response = await this.client.send(new ConverseCommand({
        modelId: this.config.modelId,
        system: [{text: assessmentInstruction}],
        messages: [{role: 'user', content: [{text: payload}]}],
        inferenceConfig: {maxTokens: 512},
      }), {abortSignal: AbortSignal.timeout(20000)});
      stage='usage';
      const usage = z.object({inputTokens:z.number().int().nonnegative(),outputTokens:z.number().int().nonnegative()}).parse(response.usage);
      this.ledger.usage(input.requestId,usage.inputTokens,usage.outputTokens);
      stage='stop-reason';
      if (response.stopReason !== 'end_turn') throw new Error('Incomplete assessment');
      stage='content-blocks';
      const blocks = response.output?.message?.content ?? [];
      if (!blocks.length || blocks.some(block => typeof block.text !== 'string')) throw new Error('Unexpected model content');
      stage='json-schema';
      const result: ModelAssessment = {
        ...parseAssessment(blocks.map(block => block.text).join(''),input.passages),
        usage, modelId:this.config.modelId,
      };
      this.ledger.complete(input.requestId,result);
      return result;
    } catch (error) {
      console.warn(JSON.stringify({event:'assessment_rejected',stage,errorName:error instanceof Error?error.name:'Unknown'}));
      // Do not expose SDK diagnostics, credentials, model text or learner content.
      // Reservation remains consumed even when response/billing outcome is uncertain.
      throw new Error('Model assessment was not accepted. No progress was saved by this adapter. Automatic retry is disabled; inspect the local invocation ledger before another attempt.');
    }
  }
  onModuleDestroy() { this.close(); }
  close() { this.client.destroy(); this.ledger.close(); }
}
