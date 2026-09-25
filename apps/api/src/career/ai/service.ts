import { Injectable } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import type { Tool } from '@aws-sdk/client-bedrock-runtime';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import type { CareerActorId, CareerAiOrigin, CareerAiStatus, CareerAiTurnRequest, CareerAiTurnResponse, CareerCoachFocusRequest, CareerResponse, CareerWorkspace } from '@learnsprint/contracts';
import { CareerService } from '../service.js';
import { careerError } from '../errors.js';
import { CareerAiLedger } from './ledger.js';
import { careerAiSettings, careerAllowance } from './config.js';
import { actorContext, careerAiInstruction, careerTool, interpretationSchema } from './tools.js';
import type { Interpretation } from './tools.js';
import { CareerCoaching } from '../coaching.js';
import { coachingFocusSchema, coachingInstruction, coachingTool } from './coaching-tools.js';

const usage = z.object({ inputTokens: z.number().int().nonnegative().max(1e6), outputTokens: z.number().int().nonnegative().max(1e6) });
interface ActiveText { requestId: string; abort: AbortController; done: Promise<unknown> }

@Injectable()
export class CareerAiService implements OnModuleDestroy {
  private readonly busy = new Set<string>();
  private readonly text = new Map<string, ActiveText>();
  constructor(private readonly career: CareerService, private readonly ledger: CareerAiLedger, private readonly coaching: CareerCoaching) {}

  status(): CareerAiStatus {
    const off = (reason: string): CareerAiStatus => ({ text: { available: false, remaining: 0, reason }, voice: { available: false, remaining: 0, reason, maxDurationSeconds: 60 } });
    try {
      const config = careerAiSettings();
      if (!config) return off('Live career AI is not enabled. Structured questions and the board remain available.');
      const text = this.ledger.remaining(careerAllowance(config, 'text')), voice = this.ledger.remaining(careerAllowance(config, 'voice'));
      return { text: { available: text > 0, remaining: text, reason: text ? 'Nova 2 Lite request interpretation is configured.' : 'The text allowance is used.' },
        voice: { available: voice > 0, remaining: voice, maxDurationSeconds: config.voice.maxDurationSeconds, reason: voice ? 'Nova 2 Sonic voice is configured.' : 'The voice allowance is used.' } };
    } catch { return off('Career AI configuration needs attention. Structured questions remain available.'); }
  }

  acquire(owner: string): void {
    if (this.busy.has(owner) || this.busy.size >= 2) careerError(409, 'AI_BUSY', 'A career AI request is still active. Stop it before starting another.');
    this.busy.add(owner);
  }
  release(owner: string): void { this.busy.delete(owner); }

  workspace(owner: string, id: string, revision: number, worldRevision: number, actorId: CareerActorId): CareerWorkspace {
    const work = this.career.workspace(owner, id), s = work.session;
    if (s.phase === 'handed_off' || s.paused) careerError(409, 'AI_PHASE_UNAVAILABLE', 'Use an active, unfinished shift for live AI.');
    if (s.revision !== revision || s.worldRevision !== worldRevision) careerError(409, 'REVISION_CONFLICT', 'The shift changed. Load the latest saved facts before continuing.');
    if (!work.actors.some(a => a.id === actorId)) careerError(400, 'ACTOR_SCOPE', 'Choose an available contact.');
    return work;
  }

  async turn(owner: string, id: string, input: CareerAiTurnRequest): Promise<CareerAiTurnResponse> {
    const fingerprint = createHash('sha256').update(JSON.stringify({ id, input })).digest('hex');
    const prior = this.ledger.get(owner, input.requestId);
    if (prior) {
      if (prior.fingerprint !== fingerprint) careerError(409, 'REQUEST_REUSED', 'That AI request ID belongs to a different message.');
      if (prior.state !== 'completed' || !prior.result) careerError(409, 'AI_OUTCOME_UNCERTAIN', 'This request is still running or ended without a usable result. It will not be charged again automatically. Use a structured question or inspect the saved state.');
      return this.apply(owner, id, input, interpretationSchema.parse(JSON.parse(prior.result)), { mode: 'bedrock-text', invocationId: input.requestId, actorId: input.actorId });
    }
    const work = this.workspace(owner, id, input.expectedRevision, input.expectedWorldRevision, input.actorId);
    const config = careerAiSettings();
    if (!config) careerError(409, 'AI_UNAVAILABLE', 'Live career AI is not enabled.');
    return this.runText(owner, input.requestId, async abort => {
      const value = await this.infer(owner, id, input.requestId, fingerprint, config, abort,
        careerAiInstruction + '\n' + actorContext(work, input.actorId), input.text, careerTool(work, input.actorId), interpretationSchema);
      return this.apply(owner, id, input, value, { mode: 'bedrock-text', invocationId: input.requestId, actorId: input.actorId });
    });
  }

  async focus(owner: string, id: string, input: CareerCoachFocusRequest): Promise<CareerResponse> {
    const fingerprint = createHash('sha256').update(JSON.stringify({ operation: 'coach-focus', id, input })).digest('hex');
    const apply = (value: z.infer<typeof coachingFocusSchema>) => this.career.command(owner, id,
      { requestId: input.requestId, expectedRevision: input.expectedRevision, expectedWorldRevision: input.expectedWorldRevision, type: 'focus_help', helpId: input.helpId, ...value },
      { mode: 'bedrock-text', invocationId: input.requestId, actorId: 'coach' });
    const prior = this.ledger.get(owner, input.requestId);
    if (prior) {
      if (prior.fingerprint !== fingerprint) careerError(409, 'REQUEST_REUSED', 'That request ID belongs to another AI operation.');
      if (prior.state !== 'completed' || !prior.result) careerError(409, 'AI_OUTCOME_UNCERTAIN', 'This AI focus did not finish with a usable result. Its reservation is kept. Your saved authored guidance remains available.');
      return apply(coachingFocusSchema.parse(JSON.parse(prior.result)));
    }
    const work = this.workspace(owner, id, input.expectedRevision, input.expectedWorldRevision, 'shift-lead');
    const help = work.session.help.find(h => h.id === input.helpId);
    if (!help || work.session.attempt.mode !== 'assisted') careerError(409, 'HELP_REQUIRED', 'Record a guidance request before asking for an AI focus.');
    if (help.focus) careerError(409, 'FOCUS_ALREADY_SAVED', 'This guidance already has a saved AI focus.');
    const review = work.session.evaluations.find(e => e.id === help.evaluationId);
    if (!review) careerError(409, 'HELP_EVIDENCE_UNAVAILABLE', 'This guidance has no available review. Use a new review and guidance request.');
    if (help.planHash !== work.session.planHash || help.artifactRevision !== work.session.artifactRevision || help.worldRevision !== work.session.worldRevision) careerError(409, 'STALE_REVIEW', 'Review the latest plan and request guidance for it first.');
    const candidates = this.coaching.candidates(work.brief, review, help.activity.version);
    const config = careerAiSettings();
    if (!config) careerError(409, 'AI_UNAVAILABLE', 'AI focus is disabled. Your saved authored guidance is available.');
    return this.runText(owner, input.requestId, async abort => {
      const value = await this.infer(owner, id, input.requestId, fingerprint, config, abort,
        coachingInstruction + '\n' + JSON.stringify(candidates), input.question, coachingTool(candidates), coachingFocusSchema);
      return apply(value);
    });
  }

  private async runText<T>(owner: string, requestId: string, run: (abort: AbortController) => Promise<T>): Promise<T> {
    this.acquire(owner);
    const abort = new AbortController();
    const active: ActiveText = { requestId, abort, done: Promise.resolve() };
    this.text.set(owner, active);
    const promise = run(abort); active.done = promise;
    try { return await promise; }
    finally { this.text.delete(owner); this.release(owner); }
  }

  private async infer<T>(owner: string, id: string, requestId: string, fingerprint: string, config: NonNullable<ReturnType<typeof careerAiSettings>>, abort: AbortController,
    system: string, user: string, tool: Tool, schema: z.ZodType<T>): Promise<T> {
    const client = new BedrockRuntimeClient({ region: config.region, profile: config.awsProfile, maxAttempts: 1 });
    const deadline = setTimeout(() => abort.abort(), 20000);
    let reserved = false;
    try {
      try { this.ledger.reserve(owner, requestId, id, fingerprint, careerAllowance(config, 'text')); reserved = true; }
      catch { careerError(429, 'AI_ALLOWANCE_UNAVAILABLE', 'The text allowance is unavailable. No model request was started.'); }
      let interpreted: T;
      try {
        const response = await client.send(new ConverseCommand({ modelId: config.text.modelId,
          system: [{ text: system }], messages: [{ role: 'user', content: [{ text: user }] }],
          toolConfig: { tools: [tool], toolChoice: { tool: { name: tool.toolSpec!.name! } } },
          inferenceConfig: { maxTokens: 512, temperature: 0 },
        }), { abortSignal: abort.signal });
        if (response.usage) this.ledger.usage(owner, requestId, usage.parse(response.usage));
        if (abort.signal.aborted) throw new Error('cancelled');
        const calls = response.output?.message?.content?.filter(b => b.toolUse).map(b => b.toolUse!) ?? [];
        if (response.stopReason !== 'tool_use' || calls.length !== 1 || calls[0].name !== tool.toolSpec!.name) throw new Error('unsupported_output');
        interpreted = schema.parse(calls[0].input);
      } catch (error) {
        // Persist a bounded diagnostic category, never provider messages or user/model text.
        const name = error instanceof Error ? error.name : 'unknown';
        const known = ['AccessDeniedException', 'ValidationException', 'ThrottlingException', 'CredentialsProviderError', 'ZodError', 'ServiceUnavailableException'];
        const category = known.includes(name) ? name : 'provider_or_schema_failure';
        const message = error instanceof Error ? error.message : '';
        const field = name === 'ValidationException'
          ? ['temperature', 'toolChoice', 'inputSchema', 'maxTokens', 'reasoningConfig'].find(key => message.includes(key))
          : undefined;
        const schemaFields = error instanceof z.ZodError
          ? error.issues.slice(0, 5).map(issue => `${issue.code}:${['intent', 'questionId', 'orderId', 'departureId', 'quantity', 'activityId', 'evidenceIds'].includes(String(issue.path[0])) ? String(issue.path[0]) : 'shape'}`).join(',')
          : undefined;
        this.ledger.finish(owner, requestId, abort.signal.aborted ? 'cancelled_or_timed_out' : [category, field, schemaFields].filter(Boolean).join(':'));
        careerError(503, 'AI_REQUEST_FAILED', 'The AI request ended without a usable result. Its reservation is retained; no allocation was changed. Saved guidance and structured questions remain available.');
      }
      this.ledger.complete(owner, requestId, interpreted);
      return interpreted;
    } finally {
      clearTimeout(deadline); client.destroy();
      if (reserved) this.ledger.finish(owner, requestId, 'request_ended_without_completion');
    }
  }

  cancel(owner: string, requestId: string): { cancelled: boolean } {
    const active = this.text.get(owner);
    if (!active || active.requestId !== requestId) return { cancelled: false };
    active.abort.abort(); return { cancelled: true };
  }

  apply(owner: string, id: string, input: Pick<CareerAiTurnRequest, 'requestId' | 'expectedRevision' | 'expectedWorldRevision' | 'actorId'>, value: Interpretation, origin: CareerAiOrigin): CareerAiTurnResponse {
    if (value.intent === 'unsupported') careerError(422, 'AI_NEEDS_CLARIFICATION', 'Please ask one factual question for this contact, or name one order, departure and whole quantity. Coaching and multi-action requests are not supported here.');
    const base = { requestId: input.requestId, expectedRevision: input.expectedRevision, expectedWorldRevision: input.expectedWorldRevision };
    // The domain checks the current owner, revision and phase again after inference.
    // It also replays committed requests before phase checks, so a lost response never repeats a write.
    const response = value.intent === 'question'
      ? this.career.command(owner, id, { ...base, type: 'ask_actor', actorId: input.actorId, questionId: value.questionId! }, origin)
      : this.career.command(owner, id, { ...base, type: 'propose_allocation', orderId: value.orderId!, departureId: value.departureId!, quantity: value.quantity! }, origin);
    if (value.intent === 'question') {
      const reply = response.workspace.session.actorReplies.find(r => r.id === response.receipt.actorReplyId);
      if (!reply) careerError(500, 'AI_RECEIPT_UNAVAILABLE', 'The source response is unavailable. Reload the saved shift.');
      return { response, summary: reply.message, proposalId: null };
    }
    const proposal = response.workspace.session.proposals.find(p => p.requestId === input.requestId);
    if (!proposal) careerError(500, 'AI_RECEIPT_UNAVAILABLE', 'The proposal record is unavailable. Reload the saved shift.');
    const departure = response.workspace.brief.departures.find(d => d.id === proposal.departureId)!;
    return { response, summary: `A preview would set order ${proposal.orderId.toUpperCase()} on ${departure.name} to ${proposal.quantity} kits. The plan is unchanged. Review and apply it on the board.`, proposalId: proposal.id };
  }

  async onModuleDestroy(): Promise<void> {
    const active = [...this.text.values()];
    active.forEach(a => a.abort.abort());
    await Promise.allSettled(active.map(a => a.done));
  }
}
