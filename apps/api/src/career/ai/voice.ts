import { HttpException, Injectable } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { CareerActorId, CareerVoiceEvent, CareerVoiceTicket } from '@learnsprint/contracts';
import { BedrockSonicStream } from '../../bedrock/sonic-stream.js';
import { CareerAiService } from './service.js';
import { CareerAiLedger } from './ledger.js';
import { careerAiSettings, careerAllowance } from './config.js';
import { actorContext, careerAiInstruction, careerSonicTools, interpretationSchema } from './tools.js';
import { careerError } from '../errors.js';
import { CareerService } from '../service.js';

interface Ticket { owner: string; sessionId: string; revision: number; worldRevision: number; actorId: CareerActorId; requestId: string; token: string; expires: number; spokenReplies: boolean }
type Publish = (event: CareerVoiceEvent | Buffer) => void;
interface Active { stream: BedrockSonicStream; done: Promise<void> }
const hash = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class CareerVoiceService implements OnModuleDestroy {
  private readonly tickets = new Map<string, Ticket>();
  private readonly active = new Map<string, Active>();
  constructor(private readonly ai: CareerAiService, private readonly ledger: CareerAiLedger, private readonly career: CareerService) {}

  ticket(owner: string, sessionId: string, revision: number, worldRevision: number, actorId: CareerActorId, requestId: string, spokenReplies = false): CareerVoiceTicket {
    const status = this.ai.status().voice;
    if (!status.available) careerError(409, 'VOICE_UNAVAILABLE', status.reason);
    const work = this.ai.workspace(owner, sessionId, revision, worldRevision, actorId);
    if (spokenReplies && work.session.attempt.mode !== 'assisted') careerError(409, 'ASSISTED_VOICE_REQUIRED', 'Request recorded guidance before enabling spoken replies.');
    for (const [key, t] of this.tickets) {
      if (t.expires <= Date.now()) this.tickets.delete(key);
      else if (t.owner === owner) {
        if (t.requestId === requestId && t.sessionId === sessionId && t.revision === revision && t.worldRevision === worldRevision && t.actorId === actorId && t.spokenReplies === spokenReplies) return { ticket: t.token, expiresAt: new Date(t.expires).toISOString(), maxDurationSeconds: status.maxDurationSeconds, spokenReplies };
        this.tickets.delete(key);
      }
    }
    if (this.tickets.size >= 20) careerError(429, 'VOICE_BUSY', 'The local voice bridge is busy.');
    const token = randomBytes(32).toString('hex'), expires = Date.now() + 30000;
    this.tickets.set(hash(token), { owner, sessionId, revision, worldRevision, actorId, requestId, token, expires, spokenReplies });
    return { ticket: token, expiresAt: new Date(expires).toISOString(), maxDurationSeconds: status.maxDurationSeconds, spokenReplies };
  }

  start(owner: string, token: string, publish: Publish): { audio(bytes: Buffer): void; stop(reason?: string): void; mute(): void } {
    const key = hash(token), ticket = this.tickets.get(key);
    if (!ticket || ticket.owner !== owner || ticket.expires <= Date.now()) careerError(403, 'VOICE_TICKET_INVALID', 'This career voice ticket expired or was already used.');
    this.tickets.delete(key);
    const config = careerAiSettings();
    if (!config) careerError(409, 'VOICE_UNAVAILABLE', 'Career voice is disabled.');
    const work = this.ai.workspace(owner, ticket.sessionId, ticket.revision, ticket.worldRevision, ticket.actorId);
    if (ticket.spokenReplies && work.session.attempt.mode !== 'assisted') careerError(409, 'ASSISTED_VOICE_REQUIRED', 'Recorded assistance is required for spoken replies.');
    this.ai.acquire(owner);
    const id = randomUUID();
    try { this.ledger.reserve(owner, id, ticket.sessionId, hash(JSON.stringify({ ...ticket, token: undefined })), careerAllowance(config, 'voice')); }
    catch { this.ai.release(owner); careerError(429, 'VOICE_ALLOWANCE_UNAVAILABLE', 'The career voice allowance is unavailable. No stream was started.'); }
    let revision = ticket.revision;
    let state: Active;
    try {
      if (ticket.spokenReplies) {
        // The assistance record commits before any provider stream can emit speech.
        const response = this.career.command(owner, ticket.sessionId, { requestId: id, expectedRevision: revision, expectedWorldRevision: ticket.worldRevision, type: 'start_guided_voice' },
          { mode: 'bedrock-voice', invocationId: id, actorId: ticket.actorId });
        revision = response.workspace.session.revision;
        publish({ type: 'receipt', result: { response, summary: 'Guided voice start recorded. Spoken replies may paraphrase sources; check the saved facts.', proposalId: null } });
      }
      state = { done: Promise.resolve(), stream: new BedrockSonicStream({
      region: config.region, awsProfile: config.awsProfile, modelId: config.voice.modelId,
      maxDurationSeconds: config.voice.maxDurationSeconds, reservePerSessionUsd: config.voice.reserveUsd,
    }, {
      ready: () => publish({ type: 'ready', voiceSessionId: id, maxDurationSeconds: config.voice.maxDurationSeconds }),
      user: text => publish({ type: 'transcript', role: 'user', text }),
      assistant: text => { if (text) publish({ type: 'transcript', role: 'assistant', text }); },
      audio: bytes => publish(bytes), interrupted: () => publish({ type: 'interrupted' }),
      usage: usage => this.ledger.usage(owner, id, usage),
      tool: (name, raw) => {
        try {
          if (name !== 'interpret_career_request') careerError(400, 'TOOL_UNAVAILABLE', 'That career tool is unavailable.');
          const value = interpretationSchema.safeParse(JSON.parse(raw));
          if (!value.success) careerError(400, 'TOOL_INVALID', 'The spoken request was not understood. Please ask one question or name one allocation.');
          const result = this.ai.apply(owner, ticket.sessionId, { requestId: randomUUID(), expectedRevision: revision, expectedWorldRevision: ticket.worldRevision, actorId: ticket.actorId }, value.data,
            { mode: 'bedrock-voice', invocationId: id, actorId: ticket.actorId });
          revision = result.response.workspace.session.revision;
          publish({ type: 'receipt', result });
          return { ok: true, summary: result.summary, revision };
        } catch (error) {
          const body = error instanceof HttpException ? error.getResponse() : null;
          const detail = body && typeof body === 'object' ? body as { code?: string; message?: string } : null;
          const code = detail?.code ?? 'VOICE_TOOL_FAILED', summary = detail?.message ?? 'That request could not be saved. Use the direct controls.';
          publish({ type: 'notice', message: summary });
          if (['REVISION_CONFLICT', 'SHIFT_PAUSED', 'SHIFT_FINISHED'].includes(code)) setTimeout(() => state.stream.stop('shift_changed'), 0);
          return { ok: false, code, summary };
        }
      },
      closed: (reason, inputBytes, outputBytes, tools) => {
        this.active.delete(owner); this.ai.release(owner);
        this.ledger.finish(owner, id, `${reason};input=${inputBytes};output=${outputBytes};tools=${tools}`);
        if (!['user_stop', 'session_limit', 'idle_limit', 'client_closed', 'server_shutdown'].includes(reason)) publish({ type: 'error', code: 'VOICE_CLOSED', message: `Live voice ended (${reason.replaceAll('_', ' ')}). Structured questions remain available.` });
        publish({ type: 'closed', reason });
      },
    }, actorContext(work, ticket.actorId), { instructions: careerAiInstruction, tools: careerSonicTools(work, ticket.actorId), allowGeneratedOutput: ticket.spokenReplies, logEvent: 'career_voice_closed', unsupportedMessage: 'Ask one factual question or request one allocation preview. No allocation is changed automatically.' }) }; }
    catch {
      this.ai.release(owner); this.ledger.finish(owner, id, 'stream_initialization_failed');
      careerError(503, 'VOICE_UNAVAILABLE', 'The voice stream could not be prepared. Structured questions remain available.');
    }
    this.active.set(owner, state);
    state.done = state.stream.run().catch(() => {
      this.active.delete(owner); this.ai.release(owner);
      publish({ type: 'error', code: 'VOICE_RECORD_FAILED', message: 'Voice ended before its record could be finalized. Reload the saved shift.' });
      publish({ type: 'closed', reason: 'record_failed' });
    });
    return { audio: bytes => state.stream.pushAudio(bytes), stop: reason => state.stream.stop(reason), mute: () => state.stream.stopSpeaking() };
  }

  async onModuleDestroy(): Promise<void> {
    this.tickets.clear(); const active = [...this.active.values()];
    active.forEach(a => a.stream.stop('server_shutdown'));
    await Promise.allSettled(active.map(a => a.done));
  }
}
