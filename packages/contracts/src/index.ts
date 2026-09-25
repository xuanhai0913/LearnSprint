export type AssessmentMode = 'fixture' | 'bedrock';
export type Outcome = 'correct' | 'partial' | 'incorrect' | 'unable_to_assess';
export type SessionStatus = 'planned' | 'active' | 'paused' | 'completed';
export interface Passage { passageId: string; title: string; text: string; sourceTitle: string; sourceUrl: string }
export interface Question { questionId: string; prompt: string; conceptIds: string[] }
export interface Answer { answerId: string; question: Question; text: string; outcome: Outcome; rationale: string; passages: Passage[]; savedAt: string; mode: AssessmentMode }
export interface Session { sessionId: string; packVersion: string; status: SessionStatus; revision: number; timeBudgetMinutes: number; questionLimit: number; currentQuestion: Question | null; answers: Answer[]; createdAt: string; updatedAt: string; recommendation: string; mode: AssessmentMode }
export interface Home { sessions: Session[]; pack: {title: string; version: string; topicId: string}; mode: AssessmentMode }
export interface Mutation { requestId: string; expectedRevision: number }
export interface AnswerInput extends Mutation { questionId: string; text: string; fixtureOutcome?: Outcome }
export type * from './powerlab.js';
export type * from './career.js';
