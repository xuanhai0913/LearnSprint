import type { CareerBrief, CareerLearningReport, CareerSession } from '@learnsprint/contracts';

/** Factual projections from saved records only. No new evaluation or model inference. */
export function careerReport(brief: CareerBrief, session: CareerSession, previous: CareerLearningReport['previous']): CareerLearningReport | null {
  if (!session.handoff || session.phase !== 'handed_off') return null;
  const final = session.evaluations.find(e => e.id === session.handoff!.evaluationId);
  if (!final) throw new Error('Career handoff is missing its saved evaluation');
  const baseline = session.evaluations.find(e => e.id === session.commitments[0]?.evaluationId) ?? null;
  return {
    version: 'career-report-0.1.0', sessionId: session.id, brief, attempt: session.attempt,
    replay: session.replay, finalizedAt: session.handoff.createdAt, assistance: session.handoff.assistance,
    baseline, final,
    changes: baseline ? brief.orders.flatMap(o => brief.departures.flatMap(d => {
      const before = baseline.plan[o.id][d.id], after = final.plan[o.id][d.id];
      return before === after ? [] : [{ orderId: o.id, departureId: d.id, before, after }];
    })) : [],
    facts: session.actorReplies, timeline: session.events, help: session.help, guidedVoice: session.guidedVoice,
    previous,
  };
}
