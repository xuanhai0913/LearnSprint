import {randomUUID} from 'node:crypto';
import {writeFileSync,mkdirSync} from 'node:fs';
const kind=process.argv[2];
const cases={correct:'401, because valid credentials are missing. Include a WWW-Authenticate header with the authentication challenge.',wrong:'403. No authentication challenge is required.',unclear:'I am not sure what this means.',partial:'401 because the credentials are missing.'};
if(!cases[kind])throw Error('Choose correct, wrong, unclear or partial; each execution requests one authorized live invocation.');
const base='http://127.0.0.1:3003/api';
const home=await(await fetch(base+'/home')).json();if(home.mode!=='bedrock')throw Error('Expected live mode');
async function post(path,body){const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(JSON.stringify(d));return d;}
let s=await post('/sessions',{requestId:randomUUID(),timeBudgetMinutes:5});s=await post(`/sessions/${s.sessionId}/start`,{requestId:randomUUID(),expectedRevision:s.revision});
const body={requestId:randomUUID(),expectedRevision:s.revision,questionId:s.currentQuestion.questionId,text:cases[kind]};
const start=Date.now();s=await post(`/sessions/${s.sessionId}/answers`,body);
const report={case:kind,elapsedMs:Date.now()-start,session:s,requestId:body.requestId};mkdirSync('output/evaluation',{recursive:true});writeFileSync(`output/evaluation/live-${kind}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
