/** Career simulation wire data. All quantities/results are owned by the server. */
export type CareerPlan = Record<string, Record<string, number>>;
export interface CareerOrder {
  id: string; customer: string; quantity: number; deadline: number; purpose: string; allowSplit: boolean;
}
export interface CareerDeparture {
  id: string; name: string; departure: number; arrival: number; capacity: number; fee: number;
}
export interface CareerBrief {
  id: string; version: string; title: string; company: string; role: string; description: string;
  onHand: number; replenishmentQuantity: number; initialEta: number; budget: number;
  orders: CareerOrder[]; departures: CareerDeparture[]; objectives: string[]; assumptions: string[];
}
export interface CareerTerms { quantity: number; by: number }
export interface CareerOffer {
  id: string; orderId: string; actor: string; policyVersion: string; terms: CareerTerms[];
  message: string; discoveredAt: string;
}
export interface CareerAgreement extends CareerOffer { acceptedAt: string; agreementId: string }
export type CareerActorId = 'warehouse' | 'customer-b' | 'shift-lead';
export type CareerQuestionId = 'stock' | 'eta' | 'departures' | 'commitment' | 'split' | 'budget' | 'handoff' | 'escalation';
export type CareerFactTarget = 'inventory' | 'departures' | 'order-b' | 'handoff';
export interface CareerActor {
  id: CareerActorId; name: string; role: string; scope: string;
  questions: { id: CareerQuestionId; label: string; available: boolean; unavailableReason: string | null }[];
}
export interface CareerFact {
  id: string; label: string; value: string;
  sourceId: string; sourceLabel: string; sourceVersion: string; target: CareerFactTarget;
}
export interface CareerActorReply {
  id: string; actorId: CareerActorId; actorName: string; role: string;
  questionId: CareerQuestionId; question: string; message: string; mode: 'authored';
  dialogueVersion: string; packVersion: string; worldRevision: number;
  facts: CareerFact[]; offerId: string | null; recordedAt: string;
}
export interface CareerAiOrigin { mode: 'bedrock-text' | 'bedrock-voice'; invocationId: string; actorId: CareerActorId | 'coach' }
export interface CareerAllocationProposal {
  id: string; requestId: string; orderId: string; departureId: string; quantity: number; previousQuantity: number;
  before: CareerPlan; after: CareerPlan; baseHash: string; artifactRevision: number; worldRevision: number;
  origin: CareerAiOrigin; createdAt: string;
}
export interface CareerProposalAction {
  proposalId: string; type: 'applied' | 'undone'; afterHash: string; artifactRevision: number; worldRevision: number; createdAt: string;
}
export type CareerActivityId = 'stock-timing' | 'dispatch-fit' | 'customer-promises' | 'budget-check' | 'handoff-clarity';
export interface CareerAttempt {
  id: string; history: 'from-start' | 'unknown-before-tracking';
  mode: 'guided' | 'independent' | 'assisted' | 'unknown'; startedAt: string | null; firstHelpAt: string | null;
}
export interface CareerReplayLink {
  sourceSessionId: string; sourceEvaluationId: string; sourcePackVersion: string;
}
export interface CareerAssistanceSnapshot {
  attemptId: string; history: CareerAttempt['history']; mode: CareerAttempt['mode'];
  helpCount: number; aiFocusCount: number; guidedVoiceCount: number;
}
export interface CareerCoachEvidence {
  id: string; label: string; observation: string; evaluationId: string;
  target: 'stock' | 'orders' | 'budget' | 'handoff';
}
export interface CareerCoachingActivity {
  id: CareerActivityId; version: string; title: string; objective: string;
  steps: string[]; prompt: string; evidence: CareerCoachEvidence[];
}
export interface CareerHelpRecord {
  id: string; attemptId: string; evaluationId: string; artifactRevision: number; worldRevision: number;
  planHash: string; requestedAt: string; activity: CareerCoachingActivity;
  focus: { invocationId: string; activity: CareerCoachingActivity; createdAt: string } | null;
}
export interface CareerGuidedVoice { invocationId: string; actorId: CareerActorId; startedAt: string }
export interface CareerIssue {
  code: 'inventory' | 'capacity' | 'quantity' | 'deadline' | 'split' | 'budget';
  message: string; orderId?: string; departureId?: string;
}
export interface CareerOutcome {
  feasible: boolean; cost: number; budget: number; budgetMet: boolean;
  inventoryMet: boolean; capacityMet: boolean; commitmentsMet: boolean; quantitiesMet: boolean;
  dependsOnExpectedStock: boolean; issues: CareerIssue[];
  departures: { departureId: string; load: number; cumulativeAllocated: number; availableByDeparture: number; projectedBalance: number; shortage: number; fee: number }[];
  orders: { orderId: string; allocated: number; required: number; terms: { quantity: number; by: number; scheduledBy: number; met: boolean }[]; met: boolean }[];
}
export interface CareerEvaluation {
  id: string; number: number; engineVersion: string; packVersion: string;
  artifactRevision: number; planHash: string; worldRevision: number;
  plan: CareerPlan; eta: number; agreement: CareerAgreement | null;
  outcome: CareerOutcome; createdAt: string;
  assistance: CareerAssistanceSnapshot | null;
}
export type CareerOperation = 'create' | 'start_replay' | 'save_plan' | 'evaluate_plan' | 'confirm_plan' | 'start_shift' | 'ask_split' | 'ask_actor' | 'accept_split' | 'pause' | 'resume' | 'handoff' | 'propose_allocation' | 'apply_proposal' | 'undo_proposal' | 'request_help' | 'focus_help' | 'start_guided_voice';
export interface CareerEvent {
  id: string; operation: CareerOperation; revision: number; worldRevision: number;
  artifactRevision: number; summary: string; evaluationId: string | null; createdAt: string;
  actorReplyId?: string | null;
  origin?: CareerAiOrigin;
}
export interface CareerCommitment { id: string; evaluationId: string; createdAt: string }
export interface CareerSession {
  id: string; packVersion: string; revision: number; worldRevision: number; artifactRevision: number;
  replay: CareerReplayLink | null;
  phase: 'planning' | 'recovery' | 'handed_off'; paused: boolean;
  plan: CareerPlan; planHash: string; eta: number; simulatedMinute: number;
  offer: CareerOffer | null; agreement: CareerAgreement | null;
  dialogueVersion: string; actorReplies: CareerActorReply[];
  proposals: CareerAllocationProposal[]; proposalActions: CareerProposalAction[];
  coachingVersion: string; attempt: CareerAttempt; help: CareerHelpRecord[]; guidedVoice: CareerGuidedVoice[];
  incidentAt: string | null; commitments: CareerCommitment[];
  handoff: { evaluationId: string; createdAt: string; unresolvedCount: number; assistance: CareerAssistanceSnapshot | null } | null;
  evaluations: CareerEvaluation[]; events: CareerEvent[]; createdAt: string; updatedAt: string;
}
export interface CareerLearningReport {
  version: 'career-report-0.1.0'; sessionId: string; brief: CareerBrief;
  attempt: CareerAttempt; replay: CareerReplayLink | null;
  finalizedAt: string; assistance: CareerAssistanceSnapshot | null;
  baseline: CareerEvaluation | null; final: CareerEvaluation;
  changes: { orderId: string; departureId: string; before: number; after: number }[];
  facts: CareerActorReply[]; timeline: CareerEvent[];
  help: CareerHelpRecord[]; guidedVoice: CareerGuidedVoice[];
  previous: { sessionId: string; title: string; packVersion: string; onHand: number; replenishmentQuantity: number; final: CareerEvaluation; assistance: CareerAssistanceSnapshot | null } | null;
}
export interface CareerWorkspace {
  brief: CareerBrief; session: CareerSession; actors: CareerActor[];
  access: 'browser-local' | 'browser-preview';
  report: CareerLearningReport | null;
  nextReplay: { version: string; title: string; sessionId: string | null } | null;
}
export interface CareerHome {
  brief: CareerBrief;
  access: CareerWorkspace['access'];
  sessions: (Pick<CareerSession, 'id' | 'phase' | 'paused' | 'artifactRevision' | 'updatedAt'> & { title: string; isReplay: boolean; mode: CareerAttempt['mode'] })[];
}
export interface CareerReplayRequest {
  requestId: string; expectedRevision: number; expectedWorldRevision: number;
  sourceEvaluationId: string; packVersion: string;
}
export interface CareerReceipt {
  requestId: string; sessionId: string; operation: CareerOperation; revision: number;
  worldRevision: number; eventId: string | null; evaluationId: string | null; committedAt: string;
  actorReplyId?: string | null;
}
export interface CareerResponse { receipt: CareerReceipt; workspace: CareerWorkspace; replayed: boolean }
export type CareerCommand = { requestId: string; expectedRevision: number; expectedWorldRevision: number } & (
  | { type: 'save_plan'; plan: CareerPlan }
  | { type: 'confirm_plan' | 'handoff'; evaluationId: string }
  | { type: 'accept_split'; offerId: string }
  | { type: 'ask_actor'; actorId: CareerActorId; questionId: CareerQuestionId }
  | { type: 'propose_allocation'; orderId: string; departureId: string; quantity: number }
  | { type: 'apply_proposal' | 'undo_proposal'; proposalId: string }
  | { type: 'request_help'; evaluationId: string }
  | { type: 'focus_help'; helpId: string; activityId: CareerActivityId; evidenceIds: string[] }
  | { type: 'start_guided_voice' }
  | { type: 'evaluate_plan' | 'start_shift' | 'ask_split' | 'pause' | 'resume' }
);
export interface CareerAiStatus {
  text: { available: boolean; remaining: number; reason: string };
  voice: { available: boolean; remaining: number; reason: string; maxDurationSeconds: number };
}
export interface CareerAiTurnRequest {
  requestId: string; expectedRevision: number; expectedWorldRevision: number; actorId: CareerActorId; text: string;
}
export interface CareerCoachFocusRequest {
  requestId: string; expectedRevision: number; expectedWorldRevision: number; helpId: string; question: string;
}
export interface CareerAiTurnResponse { response: CareerResponse; summary: string; proposalId: string | null }
export interface CareerVoiceTicket { ticket: string; expiresAt: string; maxDurationSeconds: number; spokenReplies: boolean }
export type CareerVoiceEvent =
  | { type: 'ready'; voiceSessionId: string; maxDurationSeconds: number }
  | { type: 'transcript'; role: 'user' | 'assistant'; text: string }
  | { type: 'receipt'; result: CareerAiTurnResponse }
  | { type: 'interrupted' }
  | { type: 'notice'; message: string }
  | { type: 'error'; code: string; message: string }
  | { type: 'closed'; reason: string };
