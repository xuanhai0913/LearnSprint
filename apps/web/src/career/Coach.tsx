import { useEffect, useRef, useState } from 'react';
import type { CareerAiStatus, CareerCoachFocusRequest, CareerCoachingActivity, CareerHelpRecord, CareerResponse, CareerWorkspace } from '@learnsprint/contracts';
import { api, ApiError } from '../api';
import './coaching.css';

interface Props {
  work: CareerWorkspace; blocked: boolean; dirty: boolean;
  onRequest(): void; onActive(active: boolean): void; onWorkspace(work: CareerWorkspace): void;
}
const targets = { stock: '#cr-review-stock', orders: '#cr-review-orders', budget: '#cr-review-budget', handoff: '#cr-handoff' };

export default function Coach({ work, blocked, dirty, onRequest, onActive, onWorkspace }: Props) {
  const s = work.session, review = s.evaluations.at(-1), help = s.help.at(-1);
  const current = !!review && !dirty && review.planHash === s.planHash && review.artifactRevision === s.artifactRevision && review.worldRevision === s.worldRevision;
  const forReview = s.help.find(h => h.evaluationId === review?.id);
  const selected = forReview ?? help;
  const historical = !!selected && (selected.planHash !== s.planHash || selected.artifactRevision !== s.artifactRevision || selected.worldRevision !== s.worldRevision || dirty);
  const earlier = s.help.filter(h => h.id !== selected?.id).toReversed();
  return <section className="cr-coach" aria-labelledby="cr-coach-title">
    <div className="cr-section-heading"><div><p className="cr-eyebrow">LEARNING COACH / OPTIONAL</p><h2 id="cr-coach-title">A next step, with a reason.</h2></div><span className="cr-coach-badge">{s.attempt.mode === 'assisted' ? 'Assisted practice' : s.attempt.mode === 'unknown' ? 'Earlier help unknown' : s.attempt.mode === 'independent' ? 'Replay · no in-app guidance requested' : 'Guided practice · no help requested'}</span></div>
    <p className="cr-coach-intro">Get a short activity tied to your review. Guidance is recorded before you see it; asking a contact for work facts stays separate.</p>
    {!forReview ? <div className="cr-coach-request"><button className="cr-primary" disabled={blocked || !current} onClick={onRequest}>{s.attempt.mode === 'independent' ? 'Switch to assisted & show guidance' : 'Record help & show guidance'} <span aria-hidden="true">↗</span></button><p>{!review ? 'Review your plan to give the coach something concrete to work with.' : !current ? 'Save and review the current plan before requesting guidance.' : 'This marks the attempt as assisted. Your allocations remain yours to change.'}</p></div> : null}
    {selected ? <article className="cr-coach-saved">
      <div className="cr-coach-meta"><span>{historical ? 'Earlier plan or facts' : 'Matches the saved plan and facts'}</span><span>{selected.focus ? 'AI-selected activity · authored wording' : 'Authored guidance · no model call'}</span></div>
      {historical ? <p className="cr-coach-note">This guidance refers to its saved review. Check the current facts before acting on it.</p> : null}
      <Activity activity={selected.focus?.activity ?? selected.activity}/>
      <p className="cr-small">Plan {selected.artifactRevision} · facts {selected.worldRevision} · guidance {selected.activity.version} · requested <time dateTime={selected.requestedAt}>{new Date(selected.requestedAt).toLocaleString('en')}</time></p>
      {selected.focus ? <details className="cr-details"><summary>Original authored activity before AI focus</summary><Activity activity={selected.activity}/></details> : <Focus key={selected.id} work={work} help={selected} blocked={blocked || historical} onActive={onActive} onWorkspace={onWorkspace}/>}
    </article> : null}
    {s.attempt.history === 'unknown-before-tracking' ? <p className="cr-coach-note">This shift began before assistance tracking. Earlier help is unknown; new recorded guidance does not rewrite that history.</p> : null}
    <div className="cr-assistance-totals" aria-label="Recorded assistance"><span><strong>{s.help.length}</strong> guidance requests</span><span><strong>{s.help.filter(h => h.focus).length}</strong> AI-selected focuses</span><span><strong>{s.guidedVoice.length}</strong> guided voice starts</span></div>
    {earlier.length ? <details className="cr-details"><summary>Earlier guidance ({earlier.length})</summary>{earlier.map(h => <article className="cr-past-guidance" key={h.id}><p className="cr-small">Plan {h.artifactRevision} · facts {h.worldRevision} · {h.focus ? 'AI-selected, authored wording' : 'Authored'}</p><Activity activity={h.focus?.activity ?? h.activity}/></article>)}</details> : null}
    <p className="cr-small">These records describe assistance used in this app. They do not establish independent performance, mastery or job readiness.</p>
  </section>;
}

function Activity({ activity }: { activity: CareerCoachingActivity }) {
  return <div className="cr-coach-activity"><h3>{activity.title}</h3><p>{activity.objective}</p><ol>{activity.steps.map(step => <li key={step}>{step}</li>)}</ol><div className="cr-coach-evidence"><p className="cr-eyebrow">FROM YOUR SAVED REVIEW</p>{activity.evidence.map(e => <div key={e.id}><strong>{e.label}</strong><p>{e.observation}</p><a href={targets[e.target]}>Go to the current review ↗</a></div>)}</div><p className="cr-coach-prompt"><strong>Think about:</strong> {activity.prompt}<small>No written answer is required. Make your next decision on the board.</small></p></div>;
}

function Focus({ work, help, blocked, onActive, onWorkspace }: Pick<Props, 'work' | 'blocked' | 'onActive' | 'onWorkspace'> & { help: CareerHelpRecord }) {
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState<CareerAiStatus['text'] | null>(null);
  const [sending, setSending] = useState(false), [error, setError] = useState(''), [retry, setRetry] = useState(false);
  const mounted = useRef(true), inFlight = useRef(false), pending = useRef<CareerCoachFocusRequest | null>(null);
  const latest = useRef({ onActive, onWorkspace }); latest.current = { onActive, onWorkspace };
  useEffect(() => {
    mounted.current = true;
    void api<CareerAiStatus>('/career/ai-status').then(value => { if (mounted.current) setStatus(value.text); }).catch(() => { if (mounted.current) setStatus({ available: false, remaining: 0, reason: 'AI focus is unavailable. Your authored guidance is saved above.' }); });
    return () => {
      mounted.current = false;
      if (inFlight.current && pending.current) { void api(`/career/ai-turns/${pending.current.requestId}/cancel`, {}).catch(() => {}); latest.current.onActive(false); }
    };
  }, []);
  async function send(reuse = false): Promise<void> {
    if (inFlight.current || blocked || (!reuse && !status?.available)) return;
    const request = reuse ? pending.current : { requestId: crypto.randomUUID(), expectedRevision: work.session.revision, expectedWorldRevision: work.session.worldRevision, helpId: help.id,
      question: question.trim() || 'Choose a useful next investigation from my recorded review.' };
    if (!request) return;
    pending.current = request; inFlight.current = true; setSending(true); setError(''); setRetry(false); latest.current.onActive(true);
    try {
      const response = await api<CareerResponse>(`/career/sessions/${work.session.id}/coaching-focus`, request);
      if (mounted.current) { pending.current = null; latest.current.onWorkspace(response.workspace); }
    } catch (caught) {
      if (mounted.current) {
        setError(caught instanceof Error ? caught.message : 'The AI focus could not be saved.');
        setRetry(caught instanceof ApiError && ['NETWORK', 'PERSISTENCE_FAILED', 'REQUEST_FAILED'].includes(caught.code));
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        setSending(false); latest.current.onActive(false);
        void api<CareerAiStatus>('/career/ai-status').then(value => { if (mounted.current) setStatus(value.text); }).catch(() => {});
      }
    }
  }
  async function stop(): Promise<void> {
    if (!pending.current) return;
    try { await api(`/career/ai-turns/${pending.current.requestId}/cancel`, {}); }
    catch { if (mounted.current) setError('The stop request could not reach the server. The original request has a bounded timeout.'); }
  }
  async function reload(): Promise<void> {
    if (blocked || inFlight.current) return;
    inFlight.current = true; setSending(true); latest.current.onActive(true);
    try { const next = await api<CareerWorkspace>(`/career/sessions/${work.session.id}`); if (mounted.current) { latest.current.onWorkspace(next); setError(''); } }
    catch { if (mounted.current) setError('Saved guidance could not be loaded. Check the local server.'); }
    finally { inFlight.current = false; if (mounted.current) { setSending(false); latest.current.onActive(false); } }
  }
  return <details className="cr-details cr-coach-focus"><summary>Let AI choose an evidence-based focus</summary><form onSubmit={e => { e.preventDefault(); void send(); }}><p>Nova 2 Lite can choose one approved activity and the review facts most relevant to your question. The wording stays authored.</p><label htmlFor="cr-coach-question">What would you like to understand? <span>(optional)</span></label><textarea id="cr-coach-question" rows={2} maxLength={500} disabled={blocked || sending || retry} value={question} onChange={e => setQuestion(e.target.value)} placeholder="For example: why does the stock shortfall appear before the last departure?"/><p className="cr-small">Uses the same text allowance as actor questions. Your question and review facts go to Amazon Bedrock. Use fictional details.</p><div className="cr-buttons">{sending ? <button type="button" disabled={!pending.current} onClick={() => void stop()}>Stop AI request</button> : retry ? <><button type="button" disabled={blocked} onClick={() => void send(true)}>Retrieve the same request</button><button type="button" disabled={blocked} onClick={() => { pending.current = null; setRetry(false); }}>Start a new request</button></> : <button disabled={blocked || !status?.available} type="submit">Choose a focus with AI ↗</button>}<span className="cr-small">{sending ? 'Choosing from your recorded review…' : status?.available ? `${status.remaining} text requests remain.` : status?.reason ?? 'Loading AI availability…'}</span></div>{error ? <div className="cr-ai-error" role="alert"><p>{error}</p><button type="button" disabled={blocked || sending} onClick={() => void reload()}>Load saved guidance</button></div> : null}</form></details>;
}
