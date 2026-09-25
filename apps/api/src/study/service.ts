import { Injectable, HttpException } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import type { AnswerInput, Mutation, Session } from '@learnsprint/contracts';
import { SessionRepository } from './repository.js';
import { ContentService } from './content.js';
import { AssessmentProvider } from './assessment.js';
import type { AssessmentResult } from './assessment.js';
export function fail(code:string,message:string,status=400):never {throw new HttpException({code,message,retryable:false},status);}
@Injectable()
export class StudyService {
  private readonly assessing = new Set<string>();
  constructor(private readonly repository:SessionRepository,private readonly content:ContentService,private readonly assessor:AssessmentProvider){}
  home(){const {title,version,topicId}=this.content.pack;return {sessions:this.repository.list(),pack:{title,version,topicId},mode:this.assessor.mode};}
  get(id:string){const s=this.repository.get(id);if(!s)fail('SESSION_NOT_FOUND','This local session could not be found.',404);if(!this.content.supports(s.packVersion))fail('SOURCE_UNAVAILABLE','This session needs a different content version.',409);return s;}
  private once(requestId:string,payload:unknown,work:()=>Session) {
    const fingerprint=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    return this.repository.transaction(()=>{
      const old=this.repository.request(requestId);
      if(old){if(old.fingerprint!==fingerprint)fail('REQUEST_CONFLICT','Use a new request ID for a different action.',409);return this.get(old.sessionId);}
      const session=work();
      this.repository.save(session);
      this.repository.remember(requestId,fingerprint,session.sessionId);
      return session;
    });
  }
  create(input:{requestId:string;timeBudgetMinutes:number;focus?:'access'|'methods'|'sessions'}) {
    return this.once(input.requestId,{action:'create',...input},()=>{
      const prior=this.repository.list().find(s=>s.status==='completed' && s.mode===this.assessor.mode && s.packVersion===this.content.pack.version);
      const latest=new Map<string,Session['answers'][number]>();
      for(const answer of prior?.answers??[]) if(answer.outcome!=='unable_to_assess') for(const concept of answer.question.conceptIds) latest.set(concept,answer);
      const unresolved=[...latest.values()].reverse().find(a=>a.outcome==='partial'||a.outcome==='incorrect');
      const recommended=unresolved?(this.content.followup(unresolved.question.questionId,unresolved.outcome)??unresolved.question.questionId):null;
      const chosen=input.focus==='methods'?'access-q07':input.focus==='sessions'?'access-q10':null;
      const first=chosen??recommended??this.content.pack.starterSession.firstQuestionId;
      const now=new Date().toISOString();
      return {sessionId:randomUUID(),packVersion:this.content.pack.version,status:'planned',revision:0,timeBudgetMinutes:input.timeBudgetMinutes,questionLimit:input.timeBudgetMinutes===5?2:input.timeBudgetMinutes===10?3:4,currentQuestion:this.content.publicQuestion(first),answers:[],createdAt:now,updatedAt:now,recommendation:chosen?'Practice your selected chapter, one explanation at a time.':unresolved?'A concept marked for review in your last completed session comes first.':'Start with credentials, then explore permissions.',mode:this.assessor.mode};
    });
  }
  async mutate(id:string,action:string,input:Mutation,answer?:AnswerInput){
    const payload={id,action,...input,...answer};
    // Check idempotency before invoking an asynchronous provider; never hold SQLite open over network I/O.
    const old=this.repository.request(input.requestId);
    if(old){
      const fingerprint=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
      if(old.fingerprint!==fingerprint)fail('REQUEST_CONFLICT','Use a new request ID for a different action.',409);
      return this.get(old.sessionId);
    }
    let prepared:AssessmentResult|undefined;
    if(action==='answers' && answer){
      const current=this.get(id);
      if(current.mode!==this.assessor.mode)fail('MODE_MISMATCH','This session uses a different assessment mode. Switch server mode or start a new session.',409);
      if(current.mode==='fixture'&&!answer.fixtureOutcome || current.mode==='bedrock'&&answer.fixtureOutcome!==undefined)fail('INVALID_INPUT','Assessment fields do not match the session mode.');
      if(current.revision!==input.expectedRevision)fail('REVISION_CONFLICT','This session changed. Reload before continuing.',409);
      if(current.status!=='active'||current.currentQuestion?.questionId!==answer.questionId)fail('INVALID_STATE','The pending question has changed. Reload the session.',409);
      if(current.answers.length>=12)fail('SESSION_LIMIT','Finish this session before beginning another.',409);
      const question=this.content.question(answer.questionId,current.packVersion);
      if(this.assessing.has(id))fail('ASSESSMENT_PENDING','An answer is already being assessed for this session. Wait, then reload saved state.',409);
      this.assessing.add(id);
      try {
        prepared=await this.assessor.assess({requestId:input.requestId,question:question.prompt,answer:answer.text,
          fixtureOutcome:answer.fixtureOutcome,requiredIdeas:question.rubric.requiredIdeas,
          misconceptions:question.rubric.misconceptions,passages:this.content.passages(question.questionId,current.packVersion)});
      } catch (error) {
        if((error as {code?:string})?.code==='BUDGET_EXHAUSTED')fail('BUDGET_EXHAUSTED','The approved AI evaluation limit has been reached. Saved sessions remain available; no new model call was sent.',429);
        fail('MODEL_UNAVAILABLE','Assessment was not accepted. Your draft remains available. Automatic model retry is disabled.',503); }
      finally { this.assessing.delete(id); }
    }
    return this.once(input.requestId,{id,action,...input,...answer},()=>{
      const s=this.get(id);
      if(s.revision!==input.expectedRevision)fail('REVISION_CONFLICT','This session changed in another tab. Reload the saved session before continuing.',409);
      if(action==='start'){if(s.status!=='planned')fail('INVALID_STATE','This session has already started.',409);s.status='active';}
      else if(action==='pause'){if(s.status!=='active')fail('INVALID_STATE','Only an active session can be paused.',409);s.status='paused';}
      else if(action==='resume'){if(s.status!=='paused')fail('INVALID_STATE','Only a paused session can be resumed.',409);s.status='active';}
      else if(action==='complete'){if(s.status==='completed')fail('INVALID_STATE','This session is already complete.',409);s.status='completed';}
      else if(action==='answers' && answer){
        if(s.status!=='active'||!s.currentQuestion||s.currentQuestion.questionId!==answer.questionId)fail('INVALID_STATE','The pending question has changed. Reload the session.',409);
        if(s.answers.length>=12)fail('SESSION_LIMIT','This starter session reached its answer limit. Finish and begin a new session.',409);
        const q=this.content.question(answer.questionId,s.packVersion);
        const assessment=prepared;
        if(!assessment)fail('MODEL_UNAVAILABLE','Assessment is unavailable.',503);
        s.answers.push({answerId:randomUUID(),question:s.currentQuestion,text:answer.text,outcome:assessment.outcome,rationale:assessment.rationale,passages:this.content.passages(q.questionId,s.packVersion).filter(p=>assessment.passageIds.includes(p.passageId)),savedAt:new Date().toISOString(),mode:s.mode});
        const next=this.content.followup(q.questionId,assessment.outcome,s.packVersion);
        const scored=s.answers.filter(a=>a.outcome!=='unable_to_assess');
        const seen=scored.some(a=>a.question.questionId===next);
        if(assessment.outcome!=='unable_to_assess'){
          s.currentQuestion=next&&!seen&&scored.length<s.questionLimit?this.content.publicQuestion(next,s.packVersion):null;
          if(!s.currentQuestion)s.status='completed';
          s.recommendation=assessment.outcome==='correct'?'Build on this with the next concept.':'Try a different example of the concept you marked for review.';
        }
      }else fail('INVALID_INPUT','Unsupported action.');
      s.revision++;s.updatedAt=new Date().toISOString();return s;
    });
  }
}
