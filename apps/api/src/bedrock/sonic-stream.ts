import { BedrockRuntimeClient, InvokeModelWithBidirectionalStreamCommand } from '@aws-sdk/client-bedrock-runtime';
import type { InvokeModelWithBidirectionalStreamInput } from '@aws-sdk/client-bedrock-runtime';
import { randomUUID } from 'node:crypto';
export interface SonicSettings { region: string; awsProfile?: string; modelId: string; maxDurationSeconds: number; reservePerSessionUsd: number }
export interface SonicPolicy { tools: unknown[]; instructions: string; logEvent: string; unsupportedMessage: string; allowGeneratedOutput?: boolean }
import { estimateVoiceUsd, parseUsage } from './sonic-usage.js';
import type { SonicUsage } from './sonic-usage.js';

type EventBody = Record<string, unknown>;
export type SonicToolResult = { ok: boolean; code?: string; summary: string; revision?: number; runId?: string | null };
export interface SonicCallbacks {
  ready(): void;
  user(text: string): void;
  assistant(text: string): void;
  audio(bytes: Buffer): void;
  interrupted(): void;
  usage(usage: SonicUsage): void;
  tool(name: string, input: string, toolUseId: string, transcript: string): SonicToolResult;
  closed(reason: string, inputBytes: number, outputBytes: number, tools: number): void;
}

/** Bounded input queue, consumed directly by the SDK's HTTP/2 request body. */
class InputQueue implements AsyncIterable<InvokeModelWithBidirectionalStreamInput> {
  private readonly values: InvokeModelWithBidirectionalStreamInput[] = [];
  private wake: (() => void) | null = null;
  private ended = false;
  push(event: EventBody): void {
    if (this.ended) return;
    if (this.values.length >= 180) throw new Error('INPUT_BACKPRESSURE');
    this.values.push({ chunk: { bytes: Buffer.from(JSON.stringify({ event })) } });
    this.wake?.(); this.wake = null;
  }
  end(): void { this.ended = true; this.wake?.(); this.wake = null; }
  async *[Symbol.asyncIterator](): AsyncIterator<InvokeModelWithBidirectionalStreamInput> {
    while (true) {
      const next = this.values.shift();
      if (next) { yield next; continue; }
      if (this.ended) return;
      await new Promise<void>(resolve => { this.wake = resolve; });
    }
  }
}

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
function string(value: unknown, limit = 2000): string { return typeof value === 'string' && value.length <= limit ? value : ''; }

interface Content { role: string; stage: string; text: string; completionId: string }
interface ToolCall { name: string; input: string; id: string; completionId: string }

/** One paid, time-bounded stream. No SDK retries or automatic reconnection. */
export class BedrockSonicStream {
  private readonly client: BedrockRuntimeClient;
  private readonly queue = new InputQueue();
  private readonly abort = new AbortController();
  private readonly promptName = randomUUID();
  private readonly audioName = randomUUID();
  private readonly content = new Map<string, Content>();
  private readonly pendingTools = new Map<string, ToolCall>();
  private readonly completedTools = new Map<string, { fingerprint: string; result: SonicToolResult }>();
  private confirmedTurn = false;
  private latestUser: { text: string; consumed: boolean; at: number } | null = null;
  private startedAt = Date.now();
  private lastUtteranceAt = Date.now();
  private inputBytes = 0;
  private outputBytes = 0;
  private toolCount = 0;
  private closing = false;
  private ended = false;
  private reason = 'provider_end';
  private muted = false;
  private forceClose: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly settings: SonicSettings, private readonly callbacks: SonicCallbacks, private readonly context: string, private readonly policy: SonicPolicy) {
    this.client = new BedrockRuntimeClient({ region: settings.region, profile: settings.awsProfile, maxAttempts: 1 });
  }

  async run(): Promise<void> {
    this.startedAt = Date.now(); this.lastUtteranceAt = this.startedAt;
    const durationTimer = setTimeout(() => this.stop('session_limit'), this.settings.maxDurationSeconds * 1000);
    const connectionTimer = setTimeout(() => this.stop('connection_timeout'), 20000);
    const idleTimer = setInterval(() => { if (Date.now() - this.lastUtteranceAt > 25000) this.stop('idle_limit'); }, 1000);
    try {
      this.initialize();
      const response = await this.client.send(new InvokeModelWithBidirectionalStreamCommand({ modelId: this.settings.modelId, body: this.queue }), { abortSignal: this.abort.signal });
      clearTimeout(connectionTimer);
      if (!this.closing) this.callbacks.ready();
      if (!response.body) throw new Error('MISSING_STREAM');
      for await (const part of response.body) {
        if (part.chunk?.bytes) {
          if (part.chunk.bytes.length > 256 * 1024) throw new Error('OUTPUT_FRAME_LIMIT');
          this.receive(JSON.parse(Buffer.from(part.chunk.bytes).toString('utf8')));
        } else if ('validationException' in part) throw new Error('PROVIDER_VALIDATION');
        else if ('throttlingException' in part) throw new Error('PROVIDER_THROTTLED');
        else if ('modelTimeoutException' in part) throw new Error('PROVIDER_TIMEOUT');
        else throw new Error('PROVIDER_STREAM_ERROR');
      }
    } catch (error) {
      if (!this.closing) {
        const name = error instanceof Error ? error.name : 'Unknown';
        const message = error instanceof Error ? error.message : '';
        const allowed = ['INPUT_BACKPRESSURE', 'OUTPUT_FRAME_LIMIT', 'MISSING_STREAM', 'PROVIDER_VALIDATION', 'PROVIDER_THROTTLED', 'PROVIDER_TIMEOUT', 'PROVIDER_STREAM_ERROR'];
        this.reason = allowed.includes(message) ? message.toLowerCase()
          : /credential|expired|token|login/i.test(name + message) ? 'credentials_unavailable'
          : /accessdenied|access denied|not authorized|free tier/i.test(name + message) ? 'model_access_denied' : 'connection_failed';
        // Provider messages can contain private context; log only a classified failure.
        console.warn(JSON.stringify({ event: this.policy.logEvent, reason: this.reason, errorName: name }));
      }
    } finally {
      this.ended = true; this.closing = true;
      clearTimeout(durationTimer); clearTimeout(connectionTimer); clearInterval(idleTimer);
      if (this.forceClose) clearTimeout(this.forceClose);
      this.queue.end(); this.abort.abort(); this.client.destroy();
      this.content.clear(); this.pendingTools.clear(); this.completedTools.clear(); this.latestUser = null;
      this.callbacks.closed(this.reason, this.inputBytes, this.outputBytes, this.toolCount);
    }
  }

  pushAudio(bytes: Buffer): void {
    if (this.closing || this.ended) return;
    if (bytes.length < 2 || bytes.length > 8192 || bytes.length % 2 !== 0) { this.stop('invalid_audio'); return; }
    this.inputBytes += bytes.length;
    const elapsed = Date.now() - this.startedAt;
    if (this.inputBytes > this.settings.maxDurationSeconds * 32000 || this.inputBytes > elapsed * 32 + 32000) { this.stop('input_limit'); return; }
    try { this.queue.push({ audioInput: { promptName: this.promptName, contentName: this.audioName, content: bytes.toString('base64') } }); }
    catch { this.stop('input_backpressure'); }
  }

  stopSpeaking(): void { this.muted = true; this.callbacks.interrupted(); }

  stop(reason = 'user_stop'): void {
    if (this.closing || this.ended) return;
    this.closing = true; this.reason = reason;
    try {
      for (const tool of this.pendingTools.values()) this.toolResult(tool.id, { ok: false, code: 'SESSION_CLOSED', summary: 'The voice session is closing. No action was applied.' });
      this.pendingTools.clear();
      this.queue.push({ contentEnd: { promptName: this.promptName, contentName: this.audioName } });
      this.queue.push({ promptEnd: { promptName: this.promptName } });
      this.queue.push({ sessionEnd: {} });
    } catch { /* Abort below still closes a backpressured connection. */ }
    this.queue.end();
    this.forceClose = setTimeout(() => this.abort.abort(), 1500);
  }

  private initialize(): void {
    this.queue.push({ sessionStart: { inferenceConfiguration: { maxTokens: 512, topP: .9, temperature: .2 }, turnDetectionConfiguration: { endpointingSensitivity: 'MEDIUM' } } });
    this.queue.push({ promptStart: {
      promptName: this.promptName, textOutputConfiguration: { mediaType: 'text/plain' },
      audioOutputConfiguration: { mediaType: 'audio/lpcm', sampleRateHertz: 24000, sampleSizeBits: 16, channelCount: 1, voiceId: 'matthew', encoding: 'base64', audioType: 'SPEECH' },
      toolUseOutputConfiguration: { mediaType: 'application/json' }, toolConfiguration: { tools: this.policy.tools, toolChoice: { auto: {} } },
    } });
    const systemName = randomUUID();
    this.queue.push({ contentStart: { promptName: this.promptName, contentName: systemName, type: 'TEXT', interactive: false, role: 'SYSTEM', textInputConfiguration: { mediaType: 'text/plain' } } });
    this.queue.push({ textInput: { promptName: this.promptName, contentName: systemName, content:
      this.policy.instructions + '\n' + this.context.slice(0,10000),
    } });
    this.queue.push({ contentEnd: { promptName: this.promptName, contentName: systemName } });
    this.queue.push({ contentStart: { promptName: this.promptName, contentName: this.audioName, type: 'AUDIO', interactive: true, role: 'USER', audioInputConfiguration: { mediaType: 'audio/lpcm', sampleRateHertz: 16000, sampleSizeBits: 16, channelCount: 1, audioType: 'SPEECH', encoding: 'base64' } } });
  }

  private receive(payload: unknown): void {
    const event = object(object(payload)?.event);
    if (!event) return;
    const usageEvent = object(event.usageEvent);
    if (usageEvent) {
      const usage = parseUsage(object(usageEvent.details)?.total);
      if (usage) { this.callbacks.usage(usage); if (estimateVoiceUsd(usage) >= this.settings.reservePerSessionUsd) this.stop('usage_limit'); }
    }
    if (this.closing) return;
    const start = object(event.contentStart);
    if (start) {
      if (this.content.size >= 40) { this.stop('content_limit'); return; }
      let stage = '';
      try { stage = string(object(JSON.parse(string(start.additionalModelFields) || '{}'))?.generationStage); } catch { /* Unknown stages are not displayed. */ }
      const id = string(start.contentId, 160);
      if (id) this.content.set(id, { role: string(start.role, 30), stage, text: '', completionId: string(start.completionId, 160) });
    }
    const text = object(event.textOutput);
    if (text) {
      const content = this.content.get(string(text.contentId, 160));
      if (content) content.text = (content.text + string(text.content, 4000)).slice(0, 4000);
    }
    const tool = object(event.toolUse);
    if (tool) {
      const id = string(tool.toolUseId, 160), contentId = string(tool.contentId, 160);
      if (id && contentId) this.pendingTools.set(contentId, { id, name: string(tool.toolName, 80), input: string(tool.content, 4000), completionId: string(tool.completionId, 160) });
    }
    const audio = object(event.audioOutput);
    if (audio) {
      const encoded = string(audio.content, 350000);
      if (encoded) {
        const bytes = Buffer.from(encoded, 'base64'); this.outputBytes += bytes.length;
        if (bytes.length % 2 !== 0 || this.outputBytes > 48000 * this.settings.maxDurationSeconds) this.stop('output_limit');
        else if (!this.muted && this.confirmedTurn) this.callbacks.audio(bytes);
      }
    }
    const end = object(event.contentEnd);
    if (end) {
      const contentId = string(end.contentId, 160);
      if (end.stopReason === 'INTERRUPTED') { this.confirmedTurn = false; this.callbacks.interrupted(); }
      const content = this.content.get(contentId);
      if (content?.role === 'USER' && content.stage === 'FINAL' && content.text.trim()) {
        this.lastUtteranceAt = Date.now(); this.muted = false; this.confirmedTurn = false;
        this.latestUser = { text: content.text.trim().slice(0, 1000), consumed: false, at: Date.now() };
        this.callbacks.interrupted(); this.callbacks.user(this.latestUser.text);
      } else if (content?.role === 'ASSISTANT' && content.stage === 'FINAL' && this.confirmedTurn && !this.muted) {
        this.callbacks.assistant(content.text.trim().slice(0, 1200));
      }
      this.content.delete(contentId);
      const call = this.pendingTools.get(contentId);
      if (call) { this.pendingTools.delete(contentId); this.handleTool(call); }
    }
  }

  private handleTool(call: ToolCall): void {
    const fingerprint = JSON.stringify({ name: call.name, input: call.input });
    const prior = this.completedTools.get(call.id);
    if (prior) { this.toolResult(call.id, prior.fingerprint === fingerprint ? prior.result : { ok: false, code: 'TOOL_REUSED', summary: 'That tool identifier was already used. No new action was applied.' }); return; }
    this.toolCount++;
    let result: SonicToolResult;
    if (this.toolCount > 6) result = { ok: false, code: 'TOOL_LIMIT', summary: 'This short voice session has reached its action limit.' };
    else if (!this.latestUser || this.latestUser.consumed || Date.now() - this.latestUser.at > 15000) result = { ok: false, code: 'EXPLICIT_COMMAND_REQUIRED', summary: this.policy.unsupportedMessage };
    else {
      const transcript = this.latestUser.text; this.latestUser.consumed = true;
      result = this.callbacks.tool(call.name, call.input, call.id, transcript);
    }
    this.completedTools.set(call.id, { fingerprint, result });
    // Early speculative speech is dropped. Only a committed tool can unlock confirmation.
    if (result.ok && this.policy.allowGeneratedOutput !== false) this.confirmedTurn = true;
    this.toolResult(call.id, result);
    if (this.toolCount > 6) this.stop('tool_limit');
  }

  private toolResult(toolUseId: string, result: SonicToolResult): void {
    const contentName = randomUUID();
    this.queue.push({ contentStart: { promptName: this.promptName, contentName, interactive: false, type: 'TOOL', role: 'TOOL', toolResultInputConfiguration: { toolUseId, type: 'TEXT', textInputConfiguration: { mediaType: 'text/plain' } } } });
    this.queue.push({ toolResult: { promptName: this.promptName, contentName, content: JSON.stringify(result) } });
    this.queue.push({ contentEnd: { promptName: this.promptName, contentName } });
  }
}
