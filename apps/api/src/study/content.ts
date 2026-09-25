import { Injectable } from '@nestjs/common';
import { readFileSync, readdirSync } from 'node:fs';
import { z } from 'zod';
import type { Outcome, Passage, Question } from '@learnsprint/contracts';
const outcomeMap = z.object({correct:z.string().nullable(),partial:z.string().nullable(),incorrect:z.string().nullable(),unable_to_assess:z.string().nullable()});
const packSchema = z.object({
  packId:z.string(),version:z.string(),title:z.string(),topicId:z.string(),
  sourceReferences:z.array(z.object({sourceId:z.string(),title:z.string(),url:z.url()})),
  passages:z.array(z.object({passageId:z.string(),title:z.string(),text:z.string(),sourceId:z.string()})),
  questions:z.array(z.object({questionId:z.string(),prompt:z.string(),conceptIds:z.array(z.string()),passageIds:z.array(z.string()),rubric:z.object({requiredIdeas:z.array(z.string()),misconceptions:z.array(z.string())}),nextQuestionByOutcome:outcomeMap})),
  starterSession:z.object({firstQuestionId:z.string(),maxScoredQuestions:z.number()})
});
@Injectable()
export class ContentService {
  readonly pack = packSchema.parse(JSON.parse(readFileSync(new URL('../../../../content/rest-authentication/pack.json', import.meta.url),'utf8')));
  private readonly versions = new Map<string, typeof this.pack>();
  constructor() {
    this.versions.set(this.pack.version,this.pack);
    const directory=new URL('../../../../content/rest-authentication/versions/',import.meta.url);
    for(const file of readdirSync(directory)){
      if(!file.endsWith('.json'))continue;
      const archived=packSchema.parse(JSON.parse(readFileSync(new URL(file,directory),'utf8')));
      this.versions.set(archived.version,archived);
    }
    for(const pack of this.versions.values()){
    for (const q of pack.questions) {
      this.passages(q.questionId,pack.version);
      for (const id of Object.values(q.nextQuestionByOutcome)) if(id) this.question(id,pack.version);
    }
    this.question(pack.starterSession.firstQuestionId,pack.version);
    }
  }
  supports(version:string) { return this.versions.has(version); }
  question(id:string,version=this.pack.version) {
    const q=this.versions.get(version)?.questions.find(q=>q.questionId===id);
    if(!q) throw new Error('Unsupported content version or question');
    return q;
  }
  publicQuestion(id:string,version=this.pack.version):Question {
    const {questionId,prompt,conceptIds}=this.question(id,version);
    return {questionId,prompt,conceptIds};
  }
  passages(id:string,version=this.pack.version):Passage[] {
    const pack=this.versions.get(version);
    if(!pack)throw new Error('Unsupported pack version');
    return this.question(id,version).passageIds.map(passageId=>{
      const p=pack.passages.find(p=>p.passageId===passageId);
      const ref=pack.sourceReferences.find(s=>s.sourceId===p?.sourceId);
      if(!p || !ref) throw new Error('Missing content reference');
      return {passageId:p.passageId,title:p.title,text:p.text,sourceTitle:ref.title,sourceUrl:ref.url};
    });
  }
  followup(id:string,outcome:Outcome,version=this.pack.version) {return this.question(id,version).nextQuestionByOutcome[outcome];}
}
