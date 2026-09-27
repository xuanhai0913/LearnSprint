export type ItPriority = 'p1' | 'p2' | 'p3';
export type ItAssignee = 'service-desk' | 'network' | 'identity';
export interface ItTicket { id: string; title: string; requester: string; summary: string; effort: number; skill: ItAssignee; evidence: string; source: string; }
export interface ItDecision { priority: ItPriority; assignee: ItAssignee; action: 'investigate' | 'workaround' | 'escalate'; }
export interface ItReview { revision: number; world: number; issues: { ticketId: string; message: string }[]; workload: Record<ItAssignee, number>; }
export interface ItShift {
  id: string; version: '1.0.0'; variant: 'first' | 'replay'; sourceId: string | null;
  revision: number; world: number; phase: 'triage' | 'incident' | 'handed_off';
  facts: string[]; decisions: Record<string, ItDecision>; review: ItReview | null;
  history: { at: string; message: string }[]; createdAt: string;
  handoffDraft?: { note: string; savedAt: string };
  handoff: { at: string; note: string; review: ItReview; decisions: Record<string, ItDecision> } | null;
}
export interface ItWorkspace { shift: ItShift; tickets: ItTicket[]; sourceHandoff?: NonNullable<ItShift['handoff']>; }
export interface ItHome { sessions: { id: string; phase: ItShift['phase']; variant: ItShift['variant']; createdAt: string }[]; }
