import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ItDecision, ItShift } from '@learnsprint/contracts';
import { ItRepository } from './repository.js';
import { itTickets, review, workspace } from './content.js';
import { careerError } from '../errors.js';

export type ItAction = { requestId:string; expectedRevision:number; type:'read'|'save'|'review'|'incident'|'handoff'; ticketId?:string; decisions?:Record<string,ItDecision>; note?:string };
@Injectable()
export class ItService {
  constructor(private readonly repo:ItRepository){}
  home(owner:string){return {sessions:this.repo.list(owner).map(({id,phase,variant,createdAt})=>({id,phase,variant,createdAt}))};}
  get(owner:string,id:string){const s=this.repo.get(owner,id);if(!s)careerError(404,'NOT_FOUND','This IT shift is not available in this browser.');return s;}
  workspace(owner:string,id:string){return this.present(owner,this.get(owner,id));}
  private present(owner:string,s:ItShift){const result=workspace(s);if(s.sourceId&&s.phase==='handed_off'){const source=this.get(owner,s.sourceId);if(source.handoff)result.sourceHandoff=source.handoff;}return result;}
  private commit(owner:string,requestId:string,fingerprint:string,fn:()=>ItShift){
    return this.repo.transaction(()=>{
      const saved=this.repo.request(owner,requestId);
      if(saved){if(saved.fingerprint!==fingerprint)careerError(409,'REQUEST_REUSED','This request was already used for another action.');return this.present(owner,JSON.parse(saved.body) as ItShift);}
      const s=fn();this.repo.save(owner,s);this.repo.remember(owner,requestId,fingerprint,s);return this.present(owner,s);
    });
  }
  create(owner:string,input:{requestId:string;sourceId?:string}){
    return this.commit(owner,input.requestId,JSON.stringify(['create',input]),()=>{
      if(input.sourceId){const parent=this.get(owner,input.sourceId);if(parent.phase!=='handed_off'||parent.variant!=='first')careerError(409,'REPLAY_UNAVAILABLE','Complete the first shift before opening its replay.');
        const existing=this.repo.replay(owner,parent.id);if(existing)return existing;}
      const now=new Date().toISOString();
      return {id:randomUUID(),version:'1.0.0',variant:input.sourceId?'replay':'first',sourceId:input.sourceId??null,revision:1,world:1,phase:'triage',facts:[],decisions:{},review:null,history:[{at:now,message:'IT shift opened. No tickets have been assigned.'}],createdAt:now,handoff:null};
    });
  }
  command(owner:string,id:string,input:ItAction){
    return this.commit(owner,input.requestId,JSON.stringify([id,input]),()=>{
      const s=this.get(owner,id);
      if(s.revision!==input.expectedRevision)careerError(409,'REVISION_CONFLICT','This shift changed. Reopen the saved shift before making another change.');
      if(s.phase==='handed_off')careerError(409,'READ_ONLY','The saved handoff is read-only. Start a new practice shift.');
      let message='';
      if(input.type==='read'){
        if(!itTickets(s).some(t=>t.id===input.ticketId))careerError(400,'INVALID_TICKET','Choose a listed ticket.');
        const key=`${s.world}:${input.ticketId}`;if(!s.facts.includes(key)){s.facts.push(key);s.review=null;}
        message=`Current evidence opened for ${input.ticketId} (facts ${s.world}).`;
      } else if(input.type==='save'){
        const decisions=input.decisions!;if(Object.keys(decisions).some(k=>!itTickets(s).some(t=>t.id===k)))careerError(400,'INVALID_TICKET','Choose listed tickets only.');
        s.decisions=decisions;s.review=null;message='Triage decisions saved. Review them against the current evidence.';
      } else if(input.type==='review'){
        s.review=review(s);message=`Review recorded: ${s.review.issues.length} unresolved observations.`;
      } else if(input.type==='incident'){
        if(s.phase!=='triage'||!s.review||s.review.world!==s.world)careerError(409,'REVIEW_REQUIRED','Review an initial plan before advancing the shift.');
        s.phase='incident';s.world=2;s.review=null;message=s.variant==='first'?'09:20 — VPN outage widened and the workaround failed. Recheck current evidence.':'09:20 — Access is needed today. Identity verification completed. Recheck current evidence.';
      } else {
        if(s.phase!=='incident'||!s.review||s.review.world!==s.world)careerError(409,'REVIEW_REQUIRED','Review the response to the incident before handing off.');
        s.phase='handed_off';s.handoff={at:new Date().toISOString(),note:input.note!,review:structuredClone(s.review),decisions:structuredClone(s.decisions)};
        message='Handoff saved with decisions and unresolved observations. No real ticket was changed.';
      }
      s.revision++;s.history.push({at:new Date().toISOString(),message});return s;
    });
  }
}
