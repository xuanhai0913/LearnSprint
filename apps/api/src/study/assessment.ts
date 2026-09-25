import { Injectable } from '@nestjs/common';
import type { AssessmentMode, Outcome } from '@learnsprint/contracts';
import type { AssessmentContext } from '../bedrock/contract.js';
export interface AssessmentResult { outcome: Outcome; rationale: string; passageIds: string[] }
export abstract class AssessmentProvider {
  abstract readonly mode: AssessmentMode;
  abstract assess(input: AssessmentContext & { fixtureOutcome?: Outcome }): Promise<AssessmentResult>;
}
/** Explicit development fixture. Never claims to interpret or grade learner text. */
@Injectable()
export class FixtureAssessmentProvider extends AssessmentProvider {
  readonly mode = 'fixture' as const;
  async assess(input: AssessmentContext & { fixtureOutcome?: Outcome }): Promise<AssessmentResult> {
    if (!input.fixtureOutcome) throw new Error('Fixture outcome is required');
    return {outcome:input.fixtureOutcome,passageIds:input.passages.map(p=>p.passageId),rationale:input.fixtureOutcome==='unable_to_assess'
      ? 'Simulated unclear response. No mastery result is recorded. Clarify your answer or end the session.'
      : `Simulated feedback for your selected outcome. Reference answer: ${input.requiredIdeas.join(' ')}`};
  }
}
