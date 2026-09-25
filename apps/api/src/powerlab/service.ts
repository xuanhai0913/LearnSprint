import { Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import type { LabActionContext, LabActionEvent, LabCommand, LabHome, LabMutation, LabMutationResponse, LabOperation, LabReceipt, LabRun, LabScenario, LabSchedule, LabSession, LabWorkspace } from '@learnsprint/contracts';
import { LabContentService } from './content.js';
import { ENGINE_VERSION, evaluateSchedule, InvalidSchedule, normalizeSchedule } from './engine.js';
import { labError } from './errors.js';
import { LabRepository } from './repository.js';
import { interventionFor } from './interventions.js';

function digest(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

@Injectable()
export class LabService {
  constructor(private readonly repository: LabRepository, private readonly content: LabContentService) {}

  home(owner: string): LabHome {
    return { pack: this.content.get(), sessions: this.repository.list(owner) };
  }

  workspace(owner: string, sessionId: string): LabWorkspace {
    const session = this.owned(owner, sessionId);
    const runs = this.repository.runs(sessionId);
    const latestHelp = session.assistance?.at(-1);
    return {
      pack: this.content.get(session.packVersion),
      session,
      runs,
      recentActions: this.repository.actions(sessionId),
      ...(latestHelp ? { intervention: latestHelp.activity } : {}),
    };
  }

  create(owner: string, input: { requestId: string; packVersion: string; scenarioId: string }): LabMutationResponse {
    const fingerprint = digest({ operation: 'create', input });
    return this.repository.transaction(() => {
      const replay = this.replay(owner, input.requestId, fingerprint);
      if (replay) return replay;
      if (input.packVersion !== this.content.activeVersion) labError(409, 'PACK_CHANGED', 'This lesson has been updated. Reload the lab before starting a practice.');
      const scenario = this.content.scenario(input.packVersion, input.scenarioId);
      if (!scenario) labError(400, 'INVALID_INPUT', 'Choose a supported practice.');
      if (this.repository.list(owner).length >= 40) labError(429, 'SESSION_LIMIT', 'This local workspace has 40 saved practices. Continue an existing practice.');
      const now = new Date().toISOString();
      const schedule = normalizeSchedule(scenario, scenario.initialSchedule);
      const session: LabSession = {
        sessionId: randomUUID(), packId: 'powerlab', packVersion: input.packVersion, scenarioId: scenario.id,
        phase: 'practice', revision: 1,
        artifact: { revision: 1, hash: this.artifactHash(input.packVersion, scenario.id, schedule), schedule },
        runCount: 0, lastRunId: null, assistance: [], createdAt: now, updatedAt: now,
      };
      const event = this.event(session, input.requestId, 'create', 0, [], null);
      this.repository.save(owner, session);
      this.repository.appendAction(event);
      return this.commit(owner, fingerprint, this.receipt(session, input.requestId, 'create', event.eventId, null));
    });
  }

  command(owner: string, sessionId: string, input: LabCommand, context: LabActionContext = { origin: 'manual' }): LabMutationResponse {
    return this.mutate(owner, sessionId, input, input.type, (session, scenario) => {
      if (input.type === 'pause' || input.type === 'resume') {
        const nextPhase = input.type === 'pause' ? 'paused' : 'practice';
        const changed = session.phase !== nextPhase;
        session.phase = nextPhase;
        return { changed, changes: [], run: null };
      }
      this.requirePractice(session);
      if (input.type === 'request_help') {
        if (session.scenarioId !== 'practice-a') labError(409, 'HELP_PHASE_UNAVAILABLE', 'This guidance is available only in practice A.');
        const run = this.repository.runs(sessionId).find(item => item.runId === input.runId);
        if (!run || run.runId !== session.lastRunId || run.artifact.hash !== session.artifact.hash || run.artifact.revision !== session.artifact.revision) labError(409, 'STALE_HELP_RUN', 'Run the current saved plan before requesting guidance.');
        if ((session.assistance?.length ?? 0) >= 50) labError(429, 'HELP_LIMIT', 'This practice has reached its guidance limit. Previous guidance remains available.');
        const intervention = interventionFor(run);
        session.assistance = [...(session.assistance ?? []), { requestedAt: new Date().toISOString(), runId: run.runId, interventionId: intervention.id, provider: 'authored', activity: intervention }];
        return { changed: true, changes: [], run: null };
      }
      let schedule: LabSchedule;
      try { schedule = normalizeSchedule(scenario, input.schedule); }
      catch (error) {
        if (error instanceof InvalidSchedule) labError(400, 'INVALID_INPUT', error.message);
        throw error;
      }
      const hash = this.artifactHash(session.packVersion, session.scenarioId, schedule);
      if (hash === session.artifact.hash) return { changed: false, changes: [], run: null };
      const changes = scenario.devices.flatMap(device => scenario.slots.flatMap(slot => {
        const on = schedule[device.id].includes(slot.id);
        return on !== session.artifact.schedule[device.id].includes(slot.id) ? [{ deviceId: device.id, slotId: slot.id, on }] : [];
      }));
      session.artifact = { revision: session.artifact.revision + 1, hash, schedule };
      return { changed: true, changes, run: null };
    }, context);
  }

  run(owner: string, sessionId: string, input: LabMutation, context: LabActionContext = { origin: 'manual' }): LabMutationResponse {
    return this.mutate(owner, sessionId, input, 'run_plan', (session, scenario) => {
      this.requirePractice(session);
      if (session.runCount >= 100) labError(429, 'RUN_LIMIT', 'This practice has 100 saved runs. Start a new practice to continue exploring.');
      const run: LabRun = {
        runId: randomUUID(), sessionId, number: session.runCount + 1,
        packId: session.packId, packVersion: session.packVersion, scenarioId: session.scenarioId,
        engineVersion: ENGINE_VERSION, oracleVersion: this.content.get(session.packVersion).oracleVersion,
        artifact: structuredClone(session.artifact), outcome: evaluateSchedule(scenario, session.artifact.schedule),
        createdAt: new Date().toISOString(),
        ...(session.assistance ? { assistanceCount: session.assistance.length } : {}),
      };
      session.runCount = run.number;
      session.lastRunId = run.runId;
      return { changed: true, changes: [], run };
    }, context);
  }

  private mutate(
    owner: string, sessionId: string, input: LabMutation, operation: LabOperation,
    work: (session: LabSession, scenario: LabScenario) => { changed: boolean; changes: LabActionEvent['changes']; run: LabRun | null },
    context: LabActionContext,
  ): LabMutationResponse {
    const fingerprint = digest({ sessionId, operation, input, ...(context.origin === 'manual' && !context.voiceSessionId ? {} : { context }) });
    return this.repository.transaction(() => {
      const session = this.owned(owner, sessionId);
      const replay = this.replay(owner, input.requestId, fingerprint);
      if (replay) return replay;
      if (session.revision !== input.expectedRevision) labError(409, 'REVISION_CONFLICT', 'This practice changed in another tab. Load the latest saved state before applying your draft.');
      if (session.revision >= 1000) labError(429, 'ACTION_LIMIT', 'This practice has reached its local action limit. Start a new practice to continue.');
      const scenario = this.content.scenario(session.packVersion, session.scenarioId);
      if (!scenario) labError(409, 'PACK_UNAVAILABLE', 'The saved lesson version is unavailable. Your practice has not been changed.');
      const previousRevision = session.revision;
      const result = work(session, scenario);
      let eventId: string | null = null;
      if (result.changed) {
        session.revision++;
        session.updatedAt = new Date().toISOString();
        const event = this.event(session, input.requestId, operation, previousRevision, result.changes, result.run?.runId ?? null, context);
        eventId = event.eventId;
        this.repository.save(owner, session);
        if (result.run) this.repository.appendRun(result.run);
        this.repository.appendAction(event);
      }
      return this.commit(owner, fingerprint, this.receipt(session, input.requestId, operation, eventId, result.run?.runId ?? null));
    });
  }

  private owned(owner: string, sessionId: string): LabSession {
    const session = this.repository.get(owner, sessionId);
    if (!session) labError(404, 'SESSION_NOT_FOUND', 'This practice is unavailable in this browser. Return to PowerLab to open one of your saved practices.');
    return session;
  }

  private requirePractice(session: LabSession): void {
    if (session.phase !== 'practice') labError(409, 'PHASE_CONFLICT', 'Resume this practice before editing or running the plan.');
  }

  private artifactHash(packVersion: string, scenarioId: string, schedule: LabSchedule): string {
    return digest({ packId: 'powerlab', packVersion, scenarioId, schedule });
  }

  private event(session: LabSession, requestId: string, operation: LabOperation, fromRevision: number, changes: LabActionEvent['changes'], runId: string | null, context: LabActionContext = { origin: 'manual' }): LabActionEvent {
    return { eventId: randomUUID(), requestId, sessionId: session.sessionId, operation, ...context, fromRevision,
      toRevision: session.revision, artifactRevision: session.artifact.revision, changes, runId, createdAt: session.updatedAt };
  }

  private receipt(session: LabSession, requestId: string, operation: LabOperation, eventId: string | null, runId: string | null): LabReceipt {
    return { requestId, sessionId: session.sessionId, operation, revision: session.revision,
      artifactRevision: session.artifact.revision, eventId, runId, committedAt: new Date().toISOString() };
  }

  private replay(owner: string, requestId: string, fingerprint: string): LabMutationResponse | null {
    const prior = this.repository.request(owner, requestId);
    if (!prior) return null;
    if (prior.fingerprint !== fingerprint) labError(409, 'REQUEST_REUSED', 'This request identifier belongs to a different action. Reload the saved practice before continuing.');
    return { receipt: prior.receipt, workspace: this.workspace(owner, prior.receipt.sessionId), replayed: true };
  }

  private commit(owner: string, fingerprint: string, receipt: LabReceipt): LabMutationResponse {
    this.repository.remember(owner, fingerprint, receipt);
    return { receipt, workspace: this.workspace(owner, receipt.sessionId), replayed: false };
  }
}
