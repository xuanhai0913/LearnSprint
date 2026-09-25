import { Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import type { CareerAiOrigin, CareerCommand, CareerEvaluation, CareerHome, CareerLearningReport, CareerOperation, CareerPlan, CareerReceipt, CareerReplayRequest, CareerResponse, CareerSession, CareerWorkspace } from '@learnsprint/contracts';
import { CareerRepository } from './repository.js';
import { CareerContent } from './content.js';
import { CareerActors } from './actors.js';
import { assistanceSnapshot, CareerCoaching } from './coaching.js';
import { careerError } from './errors.js';
import { CAREER_ENGINE_VERSION, evaluateCareer, InvalidCareerPlan, normalizePlan } from './engine.js';
import { careerReport } from './report.js';
import { runtime } from '../runtime.js';

const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

@Injectable()
export class CareerService {
  constructor(private readonly repo: CareerRepository, private readonly content: CareerContent, private readonly actors: CareerActors, private readonly coaching: CareerCoaching) {}

  home(owner: string): CareerHome {
    return { brief: this.content.brief(), access: runtime.access, sessions: this.repo.list(owner).map(s => ({ id: s.id, phase: s.phase, paused: s.paused, artifactRevision: s.artifactRevision, updatedAt: s.updatedAt,
      title: this.content.brief(s.packVersion).title, isReplay: s.replay !== null, mode: s.attempt.mode })) };
  }
  workspace(owner: string, id: string): CareerWorkspace {
    const session = this.owned(owner, id), brief = this.content.brief(session.packVersion);
    let previous: CareerLearningReport['previous'] = null;
    if (session.handoff && session.replay) {
      const source = this.owned(owner, session.replay.sourceSessionId);
      const final = source.evaluations.find(e => e.id === session.replay!.sourceEvaluationId);
      if (!source.handoff || !final || source.handoff.evaluationId !== final.id) throw new Error('Replay source handoff is unavailable');
      const sourceBrief = this.content.brief(source.packVersion);
      previous = { sessionId: source.id, title: sourceBrief.title, packVersion: source.packVersion, onHand: sourceBrief.onHand, replenishmentQuantity: sourceBrief.replenishmentQuantity, final, assistance: source.handoff.assistance };
    }
    const nextReplay = session.handoff && !session.replay && session.packVersion === this.content.activeVersion
      ? { version: this.content.replayVersion, title: this.content.brief(this.content.replayVersion).title,
        sessionId: this.repo.list(owner).find(s => s.replay?.sourceSessionId === id)?.id ?? null } : null;
    return { brief, session, access: runtime.access, actors: this.actors.directory(session), report: careerReport(brief, session, previous), nextReplay };
  }
  create(owner: string, input: { requestId: string; packVersion: string }): CareerResponse {
    const fingerprint = hash({ operation: 'create', input });
    return this.repo.transaction(() => {
      const replay = this.replay(owner, input.requestId, fingerprint);
      if (replay) return replay;
      if (input.packVersion !== this.content.activeVersion) careerError(409, 'PACK_CHANGED', 'The scenario changed. Reload before starting a shift.');
      if (this.repo.list(owner).length >= 30) careerError(429, 'SESSION_LIMIT', 'This browser has 30 saved shifts. Continue one of them.');
      const s = this.newSession(input.packVersion);
      return this.commit(owner, s, input.requestId, fingerprint, 'create', 'Shift opened. No quantities have been allocated.', null);
    });
  }
  startReplay(owner: string, id: string, input: CareerReplayRequest): CareerResponse {
    const fingerprint = hash({ operation: 'start_replay', id, input });
    return this.repo.transaction(() => {
      const source = this.owned(owner, id);
      const replay = this.replay(owner, input.requestId, fingerprint);
      if (replay) return replay;
      if (source.revision !== input.expectedRevision || source.worldRevision !== input.expectedWorldRevision) careerError(409, 'REVISION_CONFLICT', 'Load the final handoff before opening the next situation.');
      if (source.phase !== 'handed_off' || source.handoff?.evaluationId !== input.sourceEvaluationId || source.replay || source.packVersion !== this.content.activeVersion) careerError(409, 'REPLAY_NOT_AVAILABLE', 'Finish the first shift and open its saved report to start the short replay.');
      if (input.packVersion !== this.content.replayVersion) careerError(409, 'PACK_CHANGED', 'Reload the handoff to see the available replay.');
      const saved = this.repo.list(owner);
      const existing = saved.find(s => s.replay?.sourceSessionId === id);
      // Different request IDs/tabs still resume the same attempt, including its help history.
      if (existing) return this.noop(owner, existing, input.requestId, fingerprint, 'start_replay');
      if (saved.length >= 30) careerError(429, 'SESSION_LIMIT', 'This browser has 30 saved shifts. Continue one of them.');
      const s = this.newSession(input.packVersion, { sourceSessionId: source.id, sourceEvaluationId: input.sourceEvaluationId, sourcePackVersion: source.packVersion });
      return this.commit(owner, s, input.requestId, fingerprint, 'start_replay', 'Changed-condition replay opened with a blank plan and the delay already known. No earlier agreement or help was copied. In-app guidance has not been requested.', null);
    });
  }
  private newSession(packVersion: string, replay: CareerSession['replay'] = null): CareerSession {
    const pack = this.content.get(packVersion), brief = pack.brief, now = new Date().toISOString();
    const plan: CareerPlan = Object.fromEntries(brief.orders.map(o => [o.id, Object.fromEntries(brief.departures.map(d => [d.id, 0]))]));
    return {
      id: randomUUID(), packVersion, replay, revision: 1, worldRevision: 1, artifactRevision: 1,
      phase: replay ? 'recovery' : 'planning', paused: false, plan, planHash: this.planHash(packVersion, plan),
      eta: replay ? pack.privateScenario.delayedEta : brief.initialEta, simulatedMinute: replay ? pack.privateScenario.incidentMinute : 600,
      offer: null, agreement: null, incidentAt: replay ? now : null, commitments: [], handoff: null, evaluations: [], events: [], createdAt: now, updatedAt: now,
      dialogueVersion: this.actors.forPack(packVersion), actorReplies: [], proposals: [], proposalActions: [],
      coachingVersion: this.coaching.activeVersion, help: [], guidedVoice: [],
      attempt: { id: randomUUID(), history: 'from-start', mode: replay ? 'independent' : 'guided', startedAt: now, firstHelpAt: null },
    };
  }
  command(owner: string, id: string, input: CareerCommand, origin?: CareerAiOrigin): CareerResponse {
    const fingerprint = hash({ id, input, ...(origin ? { origin } : {}) });
    return this.repo.transaction(() => {
      const s = this.owned(owner, id);
      const replay = this.replay(owner, input.requestId, fingerprint);
      if (replay) return replay;
      if (s.revision !== input.expectedRevision || s.worldRevision !== input.expectedWorldRevision) careerError(409, 'REVISION_CONFLICT', 'This shift changed in another tab. Load the latest saved state before applying a change.');
      if (s.revision >= 500) careerError(429, 'ACTION_LIMIT', 'This shift has reached its local action limit. Saved records remain available.');
      if (s.phase === 'handed_off') careerError(409, 'SHIFT_FINISHED', 'This handoff is final. Open a new shift to explore another plan.');
      if (s.paused && input.type !== 'resume') careerError(409, 'SHIFT_PAUSED', 'Resume the shift before changing it.');
      const pack = this.content.get(s.packVersion), brief = pack.brief;
      let summary = '', evaluationId: string | null = null, actorReplyId: string | null = null;
      const now = new Date().toISOString();
      switch (input.type) {
        case 'request_help': {
          const evaluation = this.currentEvaluation(s, input.evaluationId);
          if (s.help.some(h => h.evaluationId === evaluation.id)) return this.noop(owner, s, input.requestId, fingerprint, input.type, evaluation.id);
          if (s.help.length >= 30) careerError(429, 'HELP_LIMIT', 'This shift has reached its guidance limit. Saved guidance remains available.');
          const activity = this.coaching.candidates(brief, evaluation, s.coachingVersion)[0];
          s.attempt.mode = 'assisted'; s.attempt.firstHelpAt ??= now;
          s.help.push({ id: randomUUID(), attemptId: s.attempt.id, evaluationId: evaluation.id, artifactRevision: s.artifactRevision, worldRevision: s.worldRevision,
            planHash: s.planHash, requestedAt: now, activity, focus: null });
          evaluationId = evaluation.id;
          summary = `Guidance recorded for review ${evaluation.number}: ${activity.title} This attempt now includes conceptual help.`;
          break;
        }
        case 'focus_help': {
          if (origin?.mode !== 'bedrock-text' || origin.actorId !== 'coach') careerError(403, 'COACH_ORIGIN_REQUIRED', 'An AI coaching focus requires a server-recorded request.');
          const help = s.help.find(h => h.id === input.helpId);
          if (!help || s.attempt.mode !== 'assisted') careerError(409, 'HELP_REQUIRED', 'Record a guidance request before using the AI coach.');
          if (help.focus) careerError(409, 'FOCUS_ALREADY_SAVED', 'This guidance already has a saved AI focus.');
          const evaluation = this.currentEvaluation(s, help.evaluationId);
          const activity = this.coaching.select(brief, evaluation, help.activity.version, input.activityId, input.evidenceIds);
          help.focus = { invocationId: origin.invocationId, activity, createdAt: now }; evaluationId = evaluation.id;
          summary = `AI selected a coaching focus for review ${evaluation.number}: ${activity.title} Wording and evidence remain authored.`;
          break;
        }
        case 'start_guided_voice': {
          if (origin?.mode !== 'bedrock-voice' || origin.actorId === 'coach' || s.attempt.mode !== 'assisted') careerError(409, 'ASSISTED_VOICE_REQUIRED', 'Spoken replies require a recorded guidance request first.');
          if (s.guidedVoice.length >= 30) careerError(429, 'GUIDED_VOICE_LIMIT', 'This shift has reached its guided voice limit.');
          s.guidedVoice.push({ invocationId: origin.invocationId, actorId: origin.actorId, startedAt: now });
          summary = 'Guided spoken replies enabled for this voice session. The saved source receipts remain authoritative.';
          break;
        }
        case 'propose_allocation': {
          if (!origin || origin.actorId === 'coach') careerError(403, 'AI_ORIGIN_REQUIRED', 'An allocation proposal requires a server-recorded actor request.');
          if (s.attempt.mode === 'independent') careerError(409, 'INDEPENDENT_ALLOCATION', 'Set quantities directly on the board during this replay. Contacts can still supply factual answers. Recorded guidance enables assisted AI previews.');
          if (origin.actorId === 'customer-b' && input.orderId !== 'b') careerError(403, 'ACTOR_SCOPE', 'Customer B can only discuss their own order.');
          const order = brief.orders.find(o => o.id === input.orderId);
          if (!order || !brief.departures.some(d => d.id === input.departureId) || !Number.isInteger(input.quantity) || input.quantity < 0 || input.quantity > order.quantity) careerError(400, 'INVALID_PROPOSAL', 'The proposed order, departure or quantity is unsupported.');
          if (s.proposals.length >= 50) careerError(429, 'PROPOSAL_LIMIT', 'This shift has reached its proposal limit. Direct controls remain available.');
          const after = structuredClone(s.plan); after[input.orderId][input.departureId] = input.quantity;
          s.proposals.push({ id: randomUUID(), requestId: input.requestId, orderId: input.orderId, departureId: input.departureId, quantity: input.quantity,
            previousQuantity: s.plan[input.orderId][input.departureId], before: structuredClone(s.plan), after,
            baseHash: s.planHash, artifactRevision: s.artifactRevision, worldRevision: s.worldRevision, origin, createdAt: now });
          summary = 'Allocation proposal saved for your review. The plan is unchanged until you apply it.';
          break;
        }
        case 'apply_proposal': {
          const proposal = s.proposals.find(p => p.id === input.proposalId);
          if (!proposal) careerError(404, 'PROPOSAL_NOT_FOUND', 'That proposal is unavailable.');
          if (s.proposalActions.some(a => a.proposalId === proposal.id && a.type === 'applied')) return this.noop(owner, s, input.requestId, fingerprint, input.type);
          if (proposal.baseHash !== s.planHash || proposal.artifactRevision !== s.artifactRevision || proposal.worldRevision !== s.worldRevision) careerError(409, 'STALE_PROPOSAL', 'The saved plan or facts changed. Ask for a fresh proposal or edit directly.');
          s.plan = structuredClone(proposal.after); s.planHash = this.planHash(s.packVersion, s.plan); s.artifactRevision++;
          s.proposalActions.push({ proposalId: proposal.id, type: 'applied', afterHash: s.planHash, artifactRevision: s.artifactRevision, worldRevision: s.worldRevision, createdAt: now });
          summary = `Reviewed proposal applied to order ${proposal.orderId.toUpperCase()}. Plan ${s.artifactRevision} needs a current review.`;
          break;
        }
        case 'undo_proposal': {
          const last = s.proposalActions.at(-1), proposal = s.proposals.find(p => p.id === input.proposalId);
          if (!proposal || !last || last.type !== 'applied' || last.proposalId !== proposal.id || last.afterHash !== s.planHash || last.artifactRevision !== s.artifactRevision || last.worldRevision !== s.worldRevision) careerError(409, 'UNDO_UNAVAILABLE', 'The plan or facts changed since that proposal. Use the board to revise it.');
          s.plan = structuredClone(proposal.before); s.planHash = this.planHash(s.packVersion, s.plan); s.artifactRevision++;
          s.proposalActions.push({ proposalId: proposal.id, type: 'undone', afterHash: s.planHash, artifactRevision: s.artifactRevision, worldRevision: s.worldRevision, createdAt: now });
          summary = 'The last applied proposal was undone. Earlier reviews and actions remain recorded.';
          break;
        }
        case 'save_plan': {
          let plan: CareerPlan;
          try { plan = normalizePlan(brief, input.plan); }
          catch (error) { if (error instanceof InvalidCareerPlan) careerError(400, 'INVALID_PLAN', error.message); throw error; }
          const digest = this.planHash(s.packVersion, plan);
          if (digest === s.planHash) return this.noop(owner, s, input.requestId, fingerprint, input.type);
          s.plan = plan; s.planHash = digest; s.artifactRevision++;
          summary = `Plan version ${s.artifactRevision} saved. It needs a current review before confirmation.`;
          break;
        }
        case 'evaluate_plan': {
          if (s.evaluations.length >= 100) careerError(429, 'REVIEW_LIMIT', 'This shift has 100 saved reviews. Continue with an existing current review.');
          const evaluation: CareerEvaluation = {
            id: randomUUID(), number: s.evaluations.length + 1, engineVersion: CAREER_ENGINE_VERSION, packVersion: s.packVersion,
            artifactRevision: s.artifactRevision, planHash: s.planHash, worldRevision: s.worldRevision,
            plan: structuredClone(s.plan), eta: s.eta, agreement: structuredClone(s.agreement),
            outcome: evaluateCareer(brief, s.plan, s.eta, s.agreement), createdAt: now, assistance: assistanceSnapshot(s),
          };
          s.evaluations.push(evaluation); evaluationId = evaluation.id;
          summary = `Review ${evaluation.number} recorded: ${evaluation.outcome.feasible ? 'projected constraints met' : `${evaluation.outcome.issues.length} unresolved observations`}.`;
          break;
        }
        case 'confirm_plan': {
          const evaluation = this.currentEvaluation(s, input.evaluationId);
          if (s.commitments.at(-1)?.evaluationId === evaluation.id) return this.noop(owner, s, input.requestId, fingerprint, input.type, evaluation.id);
          s.commitments.push({ id: randomUUID(), evaluationId: evaluation.id, createdAt: now });
          evaluationId = evaluation.id;
          summary = `Reviewed plan recorded${evaluation.outcome.feasible ? '' : ' with unresolved observations'}. No carrier booking was made.`;
          break;
        }
        case 'start_shift': {
          if (s.phase !== 'planning' || s.incidentAt) careerError(409, 'INCIDENT_ALREADY_APPLIED', 'This shift has already started. The supplier notice remains in its history.');
          const committed = s.commitments.at(-1);
          if (!committed) careerError(409, 'CONFIRM_REQUIRED', 'Review and record an initial plan before starting the shift.');
          this.currentEvaluation(s, committed.evaluationId);
          s.phase = 'recovery'; s.eta = pack.privateScenario.delayedEta; s.simulatedMinute = pack.privateScenario.incidentMinute;
          s.incidentAt = now; s.worldRevision++;
          summary = 'Supplier notice: replenishment delayed. The previous review is now historical; no departure has left.';
          break;
        }
        case 'ask_actor':
        case 'ask_split': {
          const actorId = input.type === 'ask_actor' ? input.actorId : 'customer-b';
          const questionId = input.type === 'ask_actor' ? input.questionId : 'split';
          this.actors.requireQuestion(s, actorId, questionId);
          const existing = s.actorReplies.find(r => r.actorId === actorId && r.questionId === questionId && r.worldRevision === s.worldRevision);
          if (existing) return this.noop(owner, s, input.requestId, fingerprint, input.type, null, existing.id);
          if (s.actorReplies.length >= 100) careerError(429, 'CONTACT_LIMIT', 'This shift has 100 recorded responses. Existing conversations remain available.');
          if (actorId === 'customer-b' && questionId === 'split' && !s.offer) {
            const policy = pack.privateScenario.splitPolicy;
            s.offer = { id: randomUUID(), orderId: policy.orderId, actor: policy.actor, policyVersion: policy.version, terms: structuredClone(policy.terms), message: policy.message, discoveredAt: now };
          }
          const reply = this.actors.reply(s, brief, actorId, questionId, now);
          s.actorReplies.push(reply); actorReplyId = reply.id;
          summary = `${reply.actorName} · ${reply.role}: response recorded with ${reply.facts.length} source fact${reply.facts.length === 1 ? '' : 's'}. Customer commitments are unchanged.`;
          break;
        }
        case 'accept_split': {
          if (s.phase !== 'recovery' || !s.offer || s.offer.id !== input.offerId) careerError(409, 'OFFER_REQUIRED', 'Ask the customer about a split before recording the supported arrangement.');
          if (s.agreement) return this.noop(owner, s, input.requestId, fingerprint, input.type);
          s.agreement = { ...structuredClone(s.offer), agreementId: randomUUID(), acceptedAt: now }; s.worldRevision++;
          summary = 'Customer B agreement recorded in the simulation. Review your plan against the updated commitment.';
          break;
        }
        case 'pause': s.paused = true; summary = 'Shift paused. Simulated time and commitments are unchanged.'; break;
        case 'resume':
          if (!s.paused) return this.noop(owner, s, input.requestId, fingerprint, input.type);
          s.paused = false; summary = 'Shift resumed with its saved state.'; break;
        case 'handoff': {
          if (s.phase !== 'recovery') careerError(409, 'RECOVERY_REQUIRED', 'Start the shift and handle the supplier notice before leaving a handoff.');
          const evaluation = this.currentEvaluation(s, input.evaluationId);
          if (s.commitments.at(-1)?.evaluationId !== evaluation.id) careerError(409, 'CONFIRM_REQUIRED', 'Record this reviewed plan before leaving a handoff.');
          s.handoff = { evaluationId: evaluation.id, createdAt: now, unresolvedCount: evaluation.outcome.issues.length, assistance: assistanceSnapshot(s) };
          s.phase = 'handed_off'; evaluationId = evaluation.id;
          summary = `Handoff saved with ${s.handoff.unresolvedCount} unresolved observations. It is a simulation record, not proof of delivery or mastery.`;
          break;
        }
      }
      s.revision++; s.updatedAt = now;
      return this.commit(owner, s, input.requestId, fingerprint, input.type, summary, evaluationId, actorReplyId, origin);
    });
  }
  private currentEvaluation(s: CareerSession, id: string): CareerEvaluation {
    const value = s.evaluations.find(e => e.id === id);
    if (!value || value.planHash !== s.planHash || value.artifactRevision !== s.artifactRevision || value.worldRevision !== s.worldRevision) careerError(409, 'STALE_REVIEW', 'Review the current saved plan and facts before recording it.');
    return value;
  }
  private owned(owner: string, id: string): CareerSession {
    const s = this.repo.get(owner, id);
    if (!s) careerError(404, 'SESSION_NOT_FOUND', 'This shift is unavailable in this browser. Return to the career desk.');
    return s;
  }
  private planHash(version: string, plan: CareerPlan): string { return hash({ pack: 'first-shift', version, plan }); }
  private replay(owner: string, requestId: string, fingerprint: string): CareerResponse | null {
    const value = this.repo.request(owner, requestId);
    if (!value) return null;
    if (value.fingerprint !== fingerprint) careerError(409, 'REQUEST_REUSED', 'That request ID belongs to another action. Reload the current shift.');
    return { receipt: value.receipt, workspace: this.workspace(owner, value.receipt.sessionId), replayed: true };
  }
  private noop(owner: string, s: CareerSession, requestId: string, fingerprint: string, operation: CareerOperation, evaluationId: string | null = null, actorReplyId: string | null = null): CareerResponse {
    const receipt = this.receipt(s, requestId, operation, null, evaluationId, actorReplyId);
    this.repo.remember(owner, fingerprint, receipt);
    return { receipt, workspace: this.workspace(owner, s.id), replayed: false };
  }
  private receipt(s: CareerSession, requestId: string, operation: CareerOperation, eventId: string | null, evaluationId: string | null, actorReplyId: string | null): CareerReceipt {
    return { requestId, sessionId: s.id, operation, revision: s.revision, worldRevision: s.worldRevision, eventId, evaluationId, actorReplyId, committedAt: new Date().toISOString() };
  }
  private commit(owner: string, s: CareerSession, requestId: string, fingerprint: string, operation: CareerOperation, summary: string, evaluationId: string | null, actorReplyId: string | null = null, origin?: CareerAiOrigin): CareerResponse {
    const eventId = randomUUID();
    s.events.push({ id: eventId, operation, revision: s.revision, worldRevision: s.worldRevision, artifactRevision: s.artifactRevision, summary, evaluationId, actorReplyId, ...(origin ? { origin } : {}), createdAt: s.updatedAt });
    this.repo.save(owner, s);
    const receipt = this.receipt(s, requestId, operation, eventId, evaluationId, actorReplyId);
    this.repo.remember(owner, fingerprint, receipt);
    return { receipt, workspace: this.workspace(owner, s.id), replayed: false };
  }
}
