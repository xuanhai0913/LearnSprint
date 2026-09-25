import { HttpException, Injectable } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { LabMutationResponse, LabSchedule, LabVoiceEvent, LabVoiceStatus, LabVoiceTicket, LabWorkspace } from '@learnsprint/contracts';
import { LabService } from '../service.js';
import { labError } from '../errors.js';
import { voiceSettings } from './config.js';
import { VoiceLedger } from './ledger.js';
import { commandsMatch, parseSpokenCommand, parseToolCommand } from './commands.js';
import type { SpokenCommand } from './commands.js';
import { SonicStream } from './sonic.js';

interface Ticket { owner: string; sessionId: string; revision: number; requestId: string; token: string; expires: number }
interface ActiveVoice {
  id: string; owner: string; sessionId: string; revision: number; stream: SonicStream; done: Promise<void>;
  undo: { schedule: LabSchedule; afterHash: string } | null; actions: number;
  publish: (event: LabVoiceEvent | Buffer) => void;
}
const tokenHash = (value: string) => createHash('sha256').update(value).digest('hex');

@Injectable()
export class LabVoiceService implements OnModuleDestroy {
  private readonly tickets = new Map<string, Ticket>();
  private readonly active = new Map<string, ActiveVoice>();
  constructor(private readonly lab: LabService, private readonly ledger: VoiceLedger) {}

  status(): LabVoiceStatus {
    const base = { provider: 'amazon-nova-2-sonic' as const, language: 'en' as const, maxDurationSeconds: 60, remainingSessions: 0 };
    try {
      const config = voiceSettings();
      if (!config) return { ...base, available: false, reason: 'Live voice is not enabled in this workspace. You can use every control directly.' };
      const remaining = this.ledger.remaining(config);
      return { ...base, maxDurationSeconds: config.maxDurationSeconds, remainingSessions: remaining, available: remaining > 0, reason: remaining > 0 ? 'English voice controls are available.' : 'The current voice allowance is used. Your direct controls and saved practice are still available.' };
    } catch { return { ...base, available: false, reason: 'Voice configuration needs attention. Your direct controls are available.' }; }
  }

  ticket(owner: string, sessionId: string, revision: number, requestId: string): LabVoiceTicket {
    const status = this.status();
    if (!status.available) labError(409, 'VOICE_UNAVAILABLE', status.reason);
    this.practice(owner, sessionId, revision);
    if (this.active.has(owner)) labError(409, 'VOICE_ACTIVE', 'A voice session is already active in this browser. Stop it before starting another.');
    for (const [hash, ticket] of this.tickets) {
      if (ticket.expires <= Date.now()) this.tickets.delete(hash);
      else if (ticket.owner === owner) {
        if (ticket.requestId === requestId && ticket.sessionId === sessionId && ticket.revision === revision) return { ticket: ticket.token, expiresAt: new Date(ticket.expires).toISOString(), maxDurationSeconds: status.maxDurationSeconds };
        this.tickets.delete(hash);
      }
    }
    if (this.tickets.size >= 20) labError(429, 'VOICE_BUSY', 'The local voice bridge is busy. Try again shortly.');
    const token = randomBytes(32).toString('hex'), expires = Date.now() + 30000;
    this.tickets.set(tokenHash(token), { owner, sessionId, revision, requestId, token, expires });
    return { ticket: token, expiresAt: new Date(expires).toISOString(), maxDurationSeconds: status.maxDurationSeconds };
  }

  start(owner: string, token: string, publish: ActiveVoice['publish']): { audio(bytes: Buffer): void; stop(reason?: string): void; mute(): void; undo(): void } {
    const hash = tokenHash(token), ticket = this.tickets.get(hash);
    if (!ticket || ticket.owner !== owner || ticket.expires <= Date.now()) labError(403, 'VOICE_TICKET_INVALID', 'The voice ticket expired or was already used. Start a new voice session.');
    this.tickets.delete(hash);
    const config = voiceSettings();
    if (!config) labError(409, 'VOICE_UNAVAILABLE', 'Live voice is disabled.');
    const workspace = this.practice(owner, ticket.sessionId, ticket.revision);
    if (this.active.has(owner) || this.active.size >= 2) labError(429, 'VOICE_BUSY', 'A voice connection is still closing or the local bridge is busy. Try again shortly.');
    const id = randomUUID();
    try { this.ledger.reserve(id, owner, ticket.sessionId, config); }
    catch { labError(429, 'VOICE_BUDGET_EXHAUSTED', 'The current voice allowance is unavailable. No connection was started.'); }
    const scenario = workspace.pack.scenarios.find(item => item.id === workspace.session.scenarioId)!;
    const state: ActiveVoice = {
      id, owner, sessionId: ticket.sessionId, revision: ticket.revision, undo: null, actions: 0, publish, done: Promise.resolve(),
      stream: new SonicStream(config, {
        ready: () => publish({ type: 'ready', voiceSessionId: id, maxDurationSeconds: config.maxDurationSeconds }),
        user: text => {
          publish({ type: 'transcript', role: 'user', text });
          if (!parseSpokenCommand(text)) publish({ type: 'notice', message: 'No supported control was heard. Try “Turn off the fan for hour four”, “Run the plan”, or “Undo the last edit”.' });
        },
        assistant: text => { if (text) publish({ type: 'transcript', role: 'assistant', text }); },
        audio: bytes => publish(bytes),
        interrupted: () => publish({ type: 'interrupted' }),
        usage: usage => this.ledger.usage(id, usage),
        tool: (name, input, _toolUseId, transcript) => {
          const requested = parseToolCommand(name, input);
          if (!commandsMatch(parseSpokenCommand(transcript), requested)) {
            const summary = 'The tool did not match one explicit spoken control. No change was saved.';
            publish({ type: 'notice', message: summary });
            return { ok: false, code: 'COMMAND_NOT_CONFIRMED', summary };
          }
          return this.apply(state, requested!, 'voice');
        },
        closed: (reason, inputBytes, outputBytes, tools) => {
          this.active.delete(owner);
          this.ledger.finish(id, reason, inputBytes, outputBytes, tools);
          if (!['user_stop', 'session_limit', 'idle_limit', 'client_closed', 'server_shutdown'].includes(reason)) publish({ type: 'error', code: 'VOICE_CLOSED', message: `Live voice ended (${reason.replaceAll('_', ' ')}). Your saved practice and direct controls remain available.` });
          publish({ type: 'closed', reason });
        },
      }, JSON.stringify({ lesson: workspace.pack.title, scenario: scenario.title, devices: scenario.devices.map(device => ({ id: device.id, name: device.name, watts: device.watts })), hours: scenario.slots.map(slot => ({ id: slot.id, label: slot.label })), schedule: workspace.session.artifact.schedule, capacityWh: scenario.capacityWh, maxPowerW: scenario.maxPowerW })),
    };
    this.active.set(owner, state);
    state.done = state.stream.run().catch(() => { this.active.delete(owner); publish({ type: 'error', code: 'VOICE_RECORD_FAILED', message: 'Voice could not finish its session record. Stop and use the direct controls.' }); publish({ type: 'closed', reason: 'record_failed' }); });
    return { audio: bytes => state.stream.pushAudio(bytes), stop: reason => state.stream.stop(reason), mute: () => state.stream.stopSpeaking(), undo: () => { state.stream.stopSpeaking(); this.apply(state, { type: 'undo_last_edit' }, 'manual'); } };
  }

  private practice(owner: string, sessionId: string, revision: number): LabWorkspace {
    const workspace = this.lab.workspace(owner, sessionId);
    if (workspace.session.phase !== 'practice' || workspace.session.scenarioId !== 'practice-a') labError(409, 'VOICE_PHASE_UNAVAILABLE', 'Voice controls currently support active practice A. Resume it before starting voice.');
    if (workspace.session.revision !== revision) labError(409, 'REVISION_CONFLICT', 'The practice changed. Load the latest saved state before starting or continuing voice.');
    return workspace;
  }

  private apply(state: ActiveVoice, command: SpokenCommand, origin: 'manual' | 'voice') {
    try {
      if (state.actions >= 6) labError(429, 'VOICE_TOOL_LIMIT', 'This short voice session has reached its action limit.');
      const current = this.practice(state.owner, state.sessionId, state.revision);
      const context = { origin, voiceSessionId: state.id };
      const request = { requestId: randomUUID(), expectedRevision: state.revision };
      let response: LabMutationResponse;
      let summary: string;
      if (command.type === 'set_device_slot') {
        const scenario = current.pack.scenarios.find(item => item.id === current.session.scenarioId)!;
        const device = scenario.devices.find(item => item.id === command.deviceId)!;
        const slot = scenario.slots.find(item => item.id === command.slotId)!;
        const before = current.session.artifact;
        const schedule = { ...before.schedule, [device.id]: scenario.slots.filter(item => item.id === slot.id ? command.on : before.schedule[device.id].includes(item.id)).map(item => item.id) };
        response = this.lab.command(state.owner, state.sessionId, { ...request, type: 'save_plan', schedule }, context);
        if (response.workspace.session.artifact.hash !== before.hash) state.undo = { schedule: before.schedule, afterHash: response.workspace.session.artifact.hash };
        summary = `${device.name} is ${command.on ? 'on' : 'off'} for ${slot.label.toLowerCase()}. Plan version ${response.workspace.session.artifact.revision} is saved.`;
      } else if (command.type === 'undo_last_edit') {
        if (!state.undo || current.session.artifact.hash !== state.undo.afterHash) labError(409, 'NOTHING_TO_UNDO', 'There is no unchanged voice edit to undo in this connection.');
        response = this.lab.command(state.owner, state.sessionId, { ...request, type: 'save_plan', schedule: state.undo.schedule }, context);
        state.undo = null; summary = 'The last voice edit was undone. The restored plan is saved; past runs remain available.';
      } else {
        response = this.lab.run(state.owner, state.sessionId, request, context);
        const run = response.workspace.runs.find(item => item.runId === response.receipt.runId)!;
        summary = `Run ${run.number} requests ${run.outcome.energyWh} watt-hours and peaks at ${run.outcome.peakPowerW} watts. ${run.outcome.feasible ? 'All constraints are met.' : 'Some constraints are not met.'}`;
      }
      state.actions++; state.revision = response.workspace.session.revision;
      state.publish({ type: 'receipt', response, summary, canUndo: !!state.undo });
      return { ok: true, summary, revision: response.receipt.revision, runId: response.receipt.runId };
    } catch (error) {
      const body = error instanceof HttpException ? error.getResponse() : null;
      const detail = body && typeof body === 'object' ? body as { code?: string; message?: string } : null;
      const summary = detail?.message ?? 'That control could not be saved. Use the direct controls after refreshing the practice.';
      const code = detail?.code ?? 'CONTROL_FAILED';
      state.publish({ type: 'notice', message: summary });
      if (code === 'REVISION_CONFLICT' || code === 'VOICE_PHASE_UNAVAILABLE') setTimeout(() => state.stream.stop('practice_changed'), 0);
      return { ok: false, code, summary };
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.tickets.clear();
    const states = [...this.active.values()];
    for (const state of states) state.stream.stop('server_shutdown');
    await Promise.allSettled(states.map(state => state.done));
  }
}
