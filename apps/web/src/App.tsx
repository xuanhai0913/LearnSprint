import { useEffect, useRef, useState } from 'react';
import type { Home, Outcome, Session, Answer, Passage } from '@learnsprint/contracts';
import { api, ApiError } from './api';
import './styles.css';
const labels:Record<Outcome,string>={correct:'Understood',partial:'Almost there',incorrect:'Needs another look',unable_to_assess:'Needs clarification'};
const concepts:Record<string,string>={'identity-and-permissions':'Identity & permission','http-auth-errors':'401, 403 & bearer tokens','server-access-checks':'Server-side access checks','http-methods':'HTTP methods & retries','session-lifecycle':'Cookies & session lifetime'};
function savedDraft(id:string,questionId:string){try{return sessionStorage.getItem(`learnsprint:draft:v2:${id}:${questionId}`)??'';}catch{return '';}}
function saveDraft(id:string,questionId:string,text:string){try{sessionStorage.setItem(`learnsprint:draft:v2:${id}:${questionId}`,text);}catch{/* In-memory draft remains usable when browser storage is unavailable. */}}
function currentId(){return new URLSearchParams(window.location.search).get('session');}
function navigate(id:string|null){history.pushState({},'',id?`/?session=${encodeURIComponent(id)}`:'/');}
export default function App(){
  const [home,setHome]=useState<Home|null>(null);
  const [session,setSession]=useState<Session|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [minutes,setMinutes]=useState(10);
  const [focus,setFocus]=useState('access');
  const [draft,setDraft]=useState('');
  const [outcome,setOutcome]=useState<Outcome>('incorrect');
  const [feedback,setFeedback]=useState<Answer|null>(null);
  const [source,setSource]=useState<Passage|null>(null);
  const [about,setAbout]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const pending=useRef<{key:string;requestId:string}|null>(null);
  const locked=useRef(false);
  const sessionIdDuringMutation=useRef<string|null>(null);
  const loadSequence=useRef(0);
  function accept(s:Session){setSession(s);setFeedback(s.answers.at(-1)??null);setDraft(savedDraft(s.sessionId,s.currentQuestion?.questionId??''));}
  async function load(){
    const generation=++loadSequence.current;
    const id=currentId();setBusy(true);setError('');
    try{const [h,s]=await Promise.all([api<Home>('/home'),id?api<Session>(`/sessions/${encodeURIComponent(id)}`):Promise.resolve(null)]);if(generation!==loadSequence.current)return;setHome(h);if(s)accept(s);else{setSession(null);setFeedback(null);}}
    catch(e){if(generation===loadSequence.current)setError(e instanceof Error?e.message:'Unable to load.');}
    finally{if(generation===loadSequence.current)setBusy(false);}
  }
  useEffect(()=>{void load();const handler=()=>{if(locked.current){navigate(sessionIdDuringMutation.current);return;}pending.current=null;void load();};window.addEventListener('popstate',handler);return()=>{loadSequence.current++;window.removeEventListener('popstate',handler);};},[]);
  useEffect(()=>{if(about)dialog.current?.showModal();else dialog.current?.close();},[about]);
  async function mutate(action:string){
    if(locked.current)return;
    const payload=action==='create'?{timeBudgetMinutes:minutes,focus}:{expectedRevision:session!.revision,...(action==='answers'?{questionId:session!.currentQuestion!.questionId,text:draft,...(session!.mode==='fixture'?{fixtureOutcome:outcome}:{})}:{})};
    const path=action==='create'?'/sessions':`/sessions/${session!.sessionId}/${action}`;
    const key=JSON.stringify({path,payload});
    if(pending.current?.key!==key)pending.current={key,requestId:crypto.randomUUID()};
    sessionIdDuringMutation.current=session?.sessionId??null;locked.current=true;setBusy(true);setError('');
    try{
      const result=await api<Session>(path,{...payload,requestId:pending.current.requestId});
      pending.current=null;
      if(action==='answers'){saveDraft(result.sessionId,session!.currentQuestion!.questionId,'');setDraft('');}
      accept(result);navigate(result.sessionId);
      if(action==='create')setFeedback(null);
    }catch(e){setError(e instanceof Error?e.message:'The action could not be saved.');if(e instanceof ApiError&&e.code==='REVISION_CONFLICT')pending.current=null;}
    finally{locked.current=false;setBusy(false);}
  }
  async function goHome(){if(busy)return;navigate(null);setSource(null);await load();}
  async function open(s:Session){if(busy)return;navigate(s.sessionId);await load();}
  const fixture=(session?.mode??home?.mode??'fixture')==='fixture';
  const modeMismatch=!!session&&!!home&&session.mode!==home.mode;
  const scored=session?.answers.filter(a=>a.outcome!=='unable_to_assess')??[];
  const available=home?.sessions.filter(s=>s.status!=='completed')??[];
  const previous=home?.sessions.filter(s=>s.status==='completed')??[];
  const last=session?.answers.at(-1);
  const reviewConcepts=new Map<string,Outcome>();
  for(const answer of scored)for(const id of answer.question.conceptIds)reviewConcepts.set(id,answer.outcome);
  return <>
    <a className="skip" href="#main">Skip to study workspace</a>
    <header className="header"><button className="wordmark" onClick={()=>void goHome()} disabled={busy}><span className="brand-mark" aria-hidden="true">l<span>/</span>s</span>LearnSprint<span className="wordmark-dot">.</span></button><div className="header-right"><span className="mode"><i/>{fixture?'Local simulation':'Bedrock AI'}</span><button className="text-button" onClick={()=>setAbout(true)}>About this demo ↗</button></div></header>
    <main id="main">
      <aside className="mission-preview-banner"><div><strong>Four hours. One battery.</strong><span>Open PowerLab: build a device schedule, run it and compare what changes.</span></div><a href="/powerlab">Open the STEM practice lab →</a></aside>
      {error?<div className="error" role="alert"><strong>Let's keep your place.</strong><p>{error}</p><button onClick={()=>void load()} disabled={busy}>Reload saved state</button>{!session&&currentId()?<button onClick={()=>void goHome()} disabled={busy}>Back to home</button>:null}</div>:null}
      <div className="status" role="status" aria-live="polite">{busy?'Working on your session…':session?`Saved locally · ${new Date(session.updatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`:'Your study notebook'}</div>
      {!session?<>
        <section className="home-grid"><div className="intro"><p className="eyebrow">SMALL SESSIONS. LASTING UNDERSTANDING.</p><h1>A little time.<br/>A <em>clearer</em> mind.</h1><p className="lede">Pick one idea. Think it through.<br/>Come back right where you left off.</p><div className="editorial-note"><span>01 / THE FIRST CHAPTER</span><p>Good questions make<br/>knowledge stick.</p><div className="line-art" aria-hidden="true"><span/><span/><span/><span/></div></div></div>
        <div className="start-card"><div className="card-top"><span className="eyebrow">MAKE ROOM FOR ONE IDEA</span><span aria-hidden="true">↗</span></div><h2>What can we learn today?</h2><p className="muted">A focused practice session, at your pace.</p><fieldset className="time-picker" disabled={busy}><legend>I have about…</legend>{[5,10,15].map(m=><button key={m} type="button" aria-pressed={m===minutes} onClick={()=>setMinutes(m)}><strong>{m}</strong><span>minutes</span></button>)}</fieldset><label className="answer-label" htmlFor="chapter">Practice chapter</label><select id="chapter" value={focus} disabled={busy} onChange={e=>setFocus(e.target.value)}><option value="access">Credentials & permissions · continue review</option><option value="methods">HTTP methods & retries</option><option value="sessions">Cookies & session lifetime</option></select><div className="topic"><span className="topic-icon" aria-hidden="true">{'{ }'}</span><div><small>YOUR LEARNING PACK</small><h3>API access, explained.</h3><p>Credentials, permissions & the difference between 401 and 403.</p></div></div><button className="primary wide" disabled={busy||!home} onClick={()=>void mutate('create')}>{busy?'Preparing…':'Plan my session'}<span aria-hidden="true">→</span></button><p className="fine">Draft learning material · Text only · {fixture?'No AWS calls':'Answers are sent to AWS Bedrock'}</p></div></section>
        {available.length?<section className="recent"><div className="section-heading"><h2>Pick up your thread.</h2><span>{available.length} saved {available.length===1?'session':'sessions'}</span></div>{available.map(s=><button className="session-row" key={s.sessionId} disabled={busy} onClick={()=>void open(s)}><span className="row-number">↳</span><span><strong>API access, explained.</strong><small>{s.status==='planned'?'Your plan is ready':`${s.answers.length} saved responses`} · {s.timeBudgetMinutes} min · {new Date(s.updatedAt).toLocaleDateString()}</small></span><span>Continue →</span></button>)}</section>:null}
        {previous.length?<section className="recent"><div className="section-heading"><h2>Previous pages.</h2><span>Saved sessions</span></div>{previous.slice(0,5).map(s=><button className="session-row" key={s.sessionId} disabled={busy} onClick={()=>void open(s)}><span className="row-number">✓</span><span><strong>API access, explained.</strong><small>{s.answers.length} recorded responses · {new Date(s.updatedAt).toLocaleDateString()}</small></span><span>Read recap →</span></button>)}</section>:null}
        {!home&&!error?<p className="loading">Opening your notebook…</p>:null}
      </>:<>
        <div className="session-top"><button className="text-button" disabled={busy} onClick={()=>void goHome()}>← My notebook</button><span>{session.timeBudgetMinutes}-minute intention · {session.packVersion}</span><div>{session.status==='active'?<button disabled={busy} onClick={()=>void mutate('pause')}>Pause</button>:null}{session.status!=='completed'?<button className="text-button" disabled={busy} onClick={()=>void mutate('complete')}>Finish session</button>:null}</div></div>
        <div className="workspace"><nav className="rail" aria-label="Session progress"><p className="eyebrow">YOUR SESSION</p>{['Make a plan','Think it through','Take it with you'].map((text,i)=>{const current=session.status==='planned'?0:session.status==='completed'?2:1;return <div key={text} className={`rail-step ${i===current?'current':''}`} aria-current={i===current?'step':undefined}><span>{i<current?'✓':`0${i+1}`}</span>{text}</div>;})}<div className="rail-note"><strong>{String(scored.length).padStart(2,'0')}<span> / {String(session.questionLimit).padStart(2,'0')}</span></strong><p>{fixture?'simulated outcomes saved':'AI assessments saved'}</p></div><p className="fine">Small progress is still progress.</p></nav>
        <section className="study-panel">{modeMismatch?<p className="error" role="status">This saved session uses a different assessment mode from the server. You can read its history; return home to start a session in the current mode.</p>:null}
          {session.status==='planned'?<><p className="eyebrow">A SIMPLE PLAN</p><h1>One idea.<br/><em>Think it through.</em></h1><p className="lede">{session.recommendation}</p><ol className="objectives"><li>{session.currentQuestion?.conceptIds.map(id=>concepts[id]??id).join(' · ')}</li><li>Reason about a real API scenario.</li><li>Leave with one clearer explanation.</li></ol><p className="muted">Up to {session.questionLimit} questions. Your time choice is a guide, not a countdown.</p><button className="primary" disabled={busy} onClick={()=>void mutate('start')}>Begin session <span>→</span></button></>:null}
          {session.status==='paused'?<><p className="eyebrow">A GOOD PLACE TO PAUSE</p><h1>Your place<br/>is <em>kept.</em></h1><p className="lede">Your saved answers and pending question are here when you're ready.</p><button className="primary" disabled={busy} onClick={()=>void mutate('resume')}>Continue session →</button></>:null}
          {session.status==='active'?<>
            {feedback?<Feedback answer={feedback} onSource={setSource}/>:null}
            {feedback?<button className="primary" disabled={busy} onClick={()=>{setFeedback(null);setSource(null);}}> {feedback.outcome==='unable_to_assess'?'Clarify my answer':'Try the next question'} →</button>:<><div className="question-heading"><p className="eyebrow">QUESTION {String(scored.length+1).padStart(2,'0')}</p><span className="pill">Think, then explain</span></div><h2 className="question">{session.currentQuestion?.prompt}</h2><p className="muted">Use your own words. An explanation is more useful than a guess.</p><form onSubmit={e=>{e.preventDefault();void mutate('answers');}}><label className="answer-label" htmlFor="answer">Your thinking</label><textarea id="answer" value={draft} maxLength={4000} required disabled={busy} placeholder="I think… because…" onChange={e=>{setDraft(e.target.value);saveDraft(session.sessionId,session.currentQuestion!.questionId,e.target.value);}}/><div className="composer-meta"><span>Draft stays in this browser tab until submitted</span><span>{draft.length}/4000</span></div>{fixture?<div className="fixture-control"><label htmlFor="outcome">Simulation control</label><p>This build does not grade your text. Choose a simulated result to explore the next question.</p><select id="outcome" value={outcome} disabled={busy} onChange={e=>setOutcome(e.target.value as Outcome)}>{Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>:<p className="fine">Your answer and source excerpts will be sent to AWS Bedrock. AI feedback can be mistaken.</p>}<button className="primary wide" disabled={busy||modeMismatch||!draft.trim()}>{busy?'Assessing & saving…':fixture?'Save & see simulated feedback':'Get AI feedback'}<span>→</span></button></form></>}
          </>:null}
          {session.status==='completed'?<><p className="eyebrow">SESSION RECAP</p><h1>A little more<br/><em>understood.</em></h1><p className="lede">{scored.length} {fixture?'simulated outcomes saved. These are development examples, not a measure of your knowledge.':'AI assessments saved. Review the cited material; AI feedback is not a certification of knowledge.'}</p>{last?<Feedback answer={last} onSource={setSource}/>:<p className="empty">No answers were submitted in this session.</p>}<div className="review-list">{[...reviewConcepts].map(([id,value])=><div key={id}><span>{concepts[id]??id}</span><span className={`outcome ${value}`}>{labels[value]}</span></div>)}</div><button className="primary" disabled={busy} onClick={()=>void goHome()}>Back to my notebook →</button></>:null}
          {session.answers.length?<details className="history"><summary>Earlier thinking · {session.answers.length} saved responses</summary>{session.answers.map(a=><article key={a.answerId}><p className="eyebrow">{labels[a.outcome]} · {a.mode==='fixture'?'SIMULATED':'BEDROCK AI'}</p><h3>{a.question.prompt}</h3><blockquote>{a.text}</blockquote><p>{a.rationale}</p><div className="source-links">{a.passages.map(p=><button key={p.passageId} onClick={()=>setSource(p)}>{p.title} ↗</button>)}</div></article>)}</details>:null}
        </section><aside className="source-panel"><p className="eyebrow">IN THE MARGIN</p>{source?<><div className="section-heading"><h3>Read the source.</h3><button className="text-button" onClick={()=>setSource(null)} aria-label="Close source">×</button></div><span className="source-id">{source.passageId}</span><h4>{source.title}</h4><p>{source.text}</p><a href={source.sourceUrl} target="_blank" rel="noreferrer">{source.sourceTitle} ↗</a><p className="fine">Draft paraphrase · {session.packVersion}</p></>:<><div className="margin-symbol" aria-hidden="true">“</div><h3>Understanding<br/>has a source.</h3><p>After each response, open a reference to connect the explanation to the original material.</p><div className="margin-rule"/><p className="fine">This starter pack uses RFC 9110, RFC 6750 and OWASP guidance. Owner review is pending.</p></>}</aside></div>
      </>}
    </main><footer><span>LearnSprint / A notebook for your next idea.</span><span>Alexa+ experience simulation</span></footer>
    <dialog ref={dialog} onCancel={()=>setAbout(false)} onClose={()=>setAbout(false)}><button className="dialog-close" onClick={()=>setAbout(false)} aria-label="Close demo information">×</button><p className="eyebrow">ABOUT THIS BUILD</p><h2>A working draft.</h2><p>This local prototype demonstrates a study plan, stored answers, source references and adaptive question selection.</p><p>{fixture?<><strong>No AI is grading this session.</strong> You choose fixture outcomes. This mode makes no AWS calls.</>:<><strong>AI assessment is enabled.</strong> Submitted answers are sent to AWS Bedrock within the server's configured limits. Feedback may contain errors.</>} SQLite stores one local demo learner on this computer.</p><p>Draft content needs review. This is an Alexa+ experience simulation, without a native Alexa+ integration. Do not enter sensitive information or expose this development server publicly.</p><button className="primary" onClick={()=>setAbout(false)}>Back to learning</button></dialog>
  </>;
}
function Feedback({answer,onSource}:{answer:Answer;onSource:(p:Passage)=>void}){return <article className="feedback"><p className={`outcome ${answer.outcome}`}>{labels[answer.outcome]} · {answer.mode==='fixture'?'Simulated':'Bedrock AI'}</p><h2>Make the connection.</h2><blockquote>{answer.text}</blockquote><p>{answer.rationale}</p><div className="source-links">{answer.passages.map(p=><button key={p.passageId} onClick={()=>onSource(p)}>{p.title} ↗</button>)}</div><p className="save-note">✓ Response and next step saved locally</p></article>;}
