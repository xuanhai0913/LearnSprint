import { useEffect, useRef, useState } from 'react';
import type { CareerActorId, CareerBrief, CareerHome, CareerQuestionId, CareerResponse, CareerWorkspace } from '@learnsprint/contracts';
import { api, ApiError } from '../api';
import { clearCareerDraft, loadCareerHome, parseDraft, restoreCareerDraft, samePlan, shiftTime, storeCareerDraft, toDraft } from './api';
import type { PlanDraft } from './api';
import Review from './Review';
import ActorDesk from './ActorDesk';
import Proposals from './Proposals';
import Coach from './Coach';
import LearningReport from './LearningReport';
import './career.css';
import './live.css';

type Intent = 'create' | 'start_replay' | 'save_plan' | 'evaluate_plan' | 'confirm_plan' | 'start_shift' | 'ask_actor' | 'accept_split' | 'pause' | 'resume' | 'handoff' | 'apply_proposal' | 'undo_proposal' | 'request_help';
type Action = Exclude<Intent, 'ask_actor' | 'apply_proposal' | 'undo_proposal'> | { type: 'ask_actor'; actorId: CareerActorId; questionId: CareerQuestionId } | { type: 'apply_proposal' | 'undo_proposal'; proposalId: string };
const labels: Record<Intent, string> = { create: 'Opening your desk…', start_replay: 'Opening your next situation…', save_plan: 'Saving your allocations…', evaluate_plan: 'Reviewing stock, departures and promises…', confirm_plan: 'Recording this plan…', start_shift: 'Starting the shift…', ask_actor: 'Opening the contact response…', accept_split: 'Recording the customer agreement…', pause: 'Pausing your shift…', resume: 'Restoring your place…', handoff: 'Saving the handoff…', apply_proposal: 'Applying the previewed change…', undo_proposal: 'Restoring the previous allocation…', request_help: 'Recording your guidance request…' };
const shiftId = () => new URLSearchParams(window.location.search).get('shift');

export default function Career() {
  const [home, setHome] = useState<CareerHome | null>(null);
  const [work, setWork] = useState<CareerWorkspace | null>(null);
  const [draft, setDraft] = useState<PlanDraft | null>(null);
  const [busy, setBusy] = useState('Opening the career desk…');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [conflict, setConflict] = useState(false);
  const [retry, setRetry] = useState<Action | null>(null);
  const [storageIssue, setStorageIssue] = useState(false);
  const [confirmation, setConfirmation] = useState<'plan' | 'handoff' | null>(null);
  const [aiActive, setAiActive] = useState(false);
  const aiLocked = useRef(false);
  const locked = useRef(false), generation = useRef(0);
  const pending = useRef<{ key: string; requestId: string } | null>(null);
  const brief = work?.brief ?? home?.brief;
  const s = work?.session;
  const hosted = (work?.access ?? home?.access) === 'browser-preview';
  const parsed = work && draft ? parseDraft(work, draft) : null;
  const dirty = !!s && !!draft && (!parsed || !samePlan(parsed, s.plan));
  const review = s?.evaluations.at(-1);
  const stale = !!review && (dirty || review.planHash !== s?.planHash || review.artifactRevision !== s?.artifactRevision || review.worldRevision !== s?.worldRevision);
  const recorded = !!review && !stale && s?.commitments.at(-1)?.evaluationId === review.id;
  const finished = s?.phase === 'handed_off';
  const blocked = !!busy || aiActive || !!retry || conflict || !!s?.paused || finished;

  async function load(keepDraft = false): Promise<void> {
    if (locked.current || aiLocked.current) return;
    const current = ++generation.current;
    setBusy('Opening your saved desk…'); setError(''); setRetry(null); pending.current = null; setConfirmation(null);
    try {
      const h = await loadCareerHome();
      const id = shiftId();
      const next = id ? await api<CareerWorkspace>(`/career/sessions/${encodeURIComponent(id)}`) : null;
      if (current !== generation.current) return;
      setHome(h); setWork(next); setConflict(false);
      if (next) {
        const recovered = keepDraft && draft ? { draft, conflict: true } : restoreCareerDraft(next);
        setDraft(recovered?.draft ?? toDraft(next.session.plan));
        setConflict(!!recovered?.conflict);
        setNotice(recovered ? 'Your local draft is here. Compare it with the saved plan before applying it.' : 'Your shift is restored with its saved facts and history.');
      } else { setDraft(null); setNotice(''); }
    } catch (caught) { if (current === generation.current) setError(caught instanceof Error ? caught.message : 'The desk could not be opened.'); }
    finally { if (current === generation.current) setBusy(''); }
  }
  useEffect(() => {
    const title = document.title; document.title = 'First Shift — LearnSprint'; void load();
    return () => { generation.current++; document.title = title; };
  }, []);
  useEffect(() => {
    if (!dirty && !busy && !aiActive) return;
    const warn = (e: BeforeUnloadEvent) => { if (dirty || locked.current || aiLocked.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, busy, aiActive]);
  useEffect(() => {
    if (!finished) return;
    const frame = requestAnimationFrame(() => {
      const heading = document.getElementById('cr-report-title');
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [s?.id, finished]);

  function accept(next: CareerWorkspace, keepDraft = false): void {
    setWork(next);
    if (!keepDraft) { setDraft(toDraft(next.session.plan)); clearCareerDraft(next.session.id); }
    history.replaceState({}, '', `/career?shift=${encodeURIComponent(next.session.id)}`);
  }
  function setAiBusy(active: boolean): void {
    aiLocked.current = active; setAiActive(active);
    if (active) { setConfirmation(null); setNotice(''); }
  }
  function receiveAi(next: CareerWorkspace): void {
    if (next.session.id !== s?.id || next.session.revision < s.revision) return;
    accept(next); setConfirmation(null);
  }
  function edit(order: string, departure: string, value: string): void {
    if (!work || !draft || blocked || aiLocked.current) return;
    const next = { ...draft, [order]: { ...draft[order], [departure]: value } };
    setDraft(next); setNotice(''); setConfirmation(null);
    if (!storeCareerDraft(work, next)) setStorageIssue(true);
  }
  async function send(path: string, body: Record<string, unknown>): Promise<CareerResponse> {
    const key = JSON.stringify({ path, body });
    if (pending.current?.key !== key) pending.current = { key, requestId: crypto.randomUUID() };
    const result = await api<CareerResponse>(path, { ...body, requestId: pending.current.requestId });
    pending.current = null; return result;
  }
  async function perform(action: Action): Promise<void> {
    const intent = typeof action === 'string' ? action : action.type;
    const isActorQuestion = intent === 'ask_actor';
    if (locked.current || aiLocked.current || busy || conflict || (finished && intent !== 'start_replay')) return;
    if (s?.paused && intent !== 'resume') return;
    if (intent !== 'create' && !s) return;
    if (dirty && !isActorQuestion && intent !== 'save_plan' && intent !== 'evaluate_plan' && intent !== 'pause') { setError('Save or discard your draft before this action.'); return; }
    if (dirty && !parsed && !isActorQuestion) { setError('Enter a whole quantity from zero to the order total in every cell.'); return; }
    const currentGeneration = generation.current;
    locked.current = true; setBusy(labels[intent]); setError(''); setNotice(''); setRetry(null);
    try {
      if (intent === 'create') {
        if (!home) return;
        const result = await send('/career/sessions', { packVersion: home.brief.version });
        if (currentGeneration !== generation.current) return;
        accept(result.workspace); setNotice('Your desk is open. Read the order deadlines and allocate the kits.'); return;
      }
      if (intent === 'start_replay') {
        if (!s?.handoff || !work?.nextReplay) return;
        const result = await send(`/career/sessions/${s.id}/replay`, {
          expectedRevision: s.revision, expectedWorldRevision: s.worldRevision,
          sourceEvaluationId: s.handoff.evaluationId, packVersion: work.nextReplay.version,
        });
        if (currentGeneration !== generation.current) return;
        accept(result.workspace); setConfirmation(null);
        setNotice('Your next situation is open. Check its current facts; earlier plans and agreements do not carry over.');
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }
      let current = work!;
      const path = `/career/sessions/${current.session.id}/commands`;
      const command = (type: string, extra: Record<string, unknown> = {}) => send(path, { type, expectedRevision: current.session.revision, expectedWorldRevision: current.session.worldRevision, ...extra });
      if (dirty && parsed && !isActorQuestion) {
        setBusy('Saving your draft…');
        const result = await command('save_plan', { plan: parsed }); current = result.workspace;
        if (currentGeneration !== generation.current) return;
        if (!samePlan(current.session.plan, parsed)) { setWork(current); throw new ApiError('Another tab changed the saved plan. Your draft is kept.', 'REVISION_CONFLICT'); }
        accept(current);
      }
      if (intent !== 'save_plan') {
        const currentReview = current.session.evaluations.at(-1);
        const extra = typeof action !== 'string' ? action.type === 'ask_actor' ? { actorId: action.actorId, questionId: action.questionId } : { proposalId: action.proposalId } : intent === 'confirm_plan' || intent === 'handoff' || intent === 'request_help' ? { evaluationId: currentReview?.id } : intent === 'accept_split' ? { offerId: current.session.offer?.id } : {};
        const result = await command(intent, extra);
        if (currentGeneration !== generation.current) return;
        if (isActorQuestion && dirty && !samePlan(result.workspace.session.plan, current.session.plan)) {
          setWork(result.workspace); throw new ApiError('Another tab changed the saved plan. Your local draft is kept alongside the recorded reply.', 'REVISION_CONFLICT');
        }
        accept(result.workspace, isActorQuestion && dirty);
        setNotice(result.workspace.session.events.find(e => e.id === result.receipt.eventId)?.summary ?? (result.receipt.actorReplyId ? 'Showing the saved reply for these facts.' : 'The saved state is up to date.'));
      } else setNotice('Draft saved. Review it against the current facts before recording your plan.');
      setConfirmation(null);
    } catch (caught) {
      if (currentGeneration !== generation.current) return;
      setError(caught instanceof Error ? caught.message : 'The action could not be completed.');
      const code = caught instanceof ApiError ? caught.code : 'NETWORK';
      if (['REVISION_CONFLICT', 'REQUEST_REUSED', 'STALE_REVIEW', 'STALE_PROPOSAL', 'UNDO_UNAVAILABLE', 'SHIFT_FINISHED', 'SHIFT_PAUSED'].includes(code)) { setConflict(true); pending.current = null; setConfirmation(null); }
      else if (['NETWORK', 'PERSISTENCE_FAILED', 'REQUEST_FAILED'].includes(code)) setRetry(action);
      else pending.current = null;
    } finally { locked.current = false; if (currentGeneration === generation.current) setBusy(''); }
  }
  function resolveDraft(useSaved: boolean): void {
    if (!work || locked.current || aiLocked.current) return;
    if (useSaved) { setDraft(toDraft(work.session.plan)); clearCareerDraft(work.session.id); }
    else if (draft) storeCareerDraft(work, draft);
    setConflict(false); setError(''); setNotice(useSaved ? 'Using the saved plan.' : 'Local draft retained. Review it before replacing the saved allocations.');
  }

  return <div className="career-app">
    <a className="cr-skip" href="#career-main">Skip to your work desk</a>
    <header className="cr-header"><a className="cr-brand" href="/career"><span className="cr-brand-mark" aria-hidden="true">ls.</span>LearnSprint</a><span className="cr-header-label">THE CAREER PRACTICE DESK</span><a href="#career-about">About this shift ↗</a></header>
    <main id="career-main" className="cr-main">
      <div className="cr-live" role="status" aria-live="polite">{busy || notice}</div>
      {error ? <section className="cr-alert" role="alert"><strong>Your saved work is still here.</strong><p>{error}</p><div className="cr-buttons">{retry ? <button disabled={!!busy || aiActive} onClick={() => void perform(retry)}>Retry the same action</button> : null}<button disabled={!!busy || aiActive} onClick={() => void load(true)}>Load latest state & keep draft</button>{!work ? <a href="/career">Return to career desk</a> : null}</div></section> : null}
      {conflict ? <section className="cr-alert"><strong>Choose which plan to continue with.</strong><p>Load the latest state first if another tab changed this shift. Your local draft stays available for comparison.</p><div className="cr-buttons"><button disabled={!!busy || aiActive} onClick={() => void load(true)}>Load latest</button><button disabled={!!busy || aiActive || !work} onClick={() => resolveDraft(true)}>Use loaded saved plan</button><button disabled={!!busy || aiActive || !draft || finished} onClick={() => resolveDraft(false)}>Keep draft for review</button></div></section> : null}
      {!brief ? <section className="cr-loading"><p className="cr-eyebrow">A LITTLE PRACTICE BEFORE THE REAL THING</p><h1>Your next chapter<br/>starts at this desk.</h1><p>{error ? 'Retry opening the desk above.' : 'Preparing the shift brief…'}</p></section> : <>
        <section className={`cr-hero ${s ? 'cr-hero-compact' : ''}`}>
          <div><p className="cr-eyebrow"><span className="cr-role-number">01</span> OPERATIONS / {s?.replay ? 'NEXT SHIFT' : 'FIRST SHIFT'}</p><h1>{s?.replay ? <>New facts.<br/><em>A fresh decision.</em></> : s ? <>Make a plan.<br/><em>Keep a promise.</em></> : <>Your first shift.<br/><em>A real decision.</em></>}</h1><p className="cr-lede">{brief.description}</p><div className="cr-hero-meta"><span>Three orders</span><span>{s?.replay ? 'Changed-condition replay' : 'One changing situation'}</span><span>Fictional work experience</span></div>{!s ? <div className="cr-start"><button className="cr-primary" disabled={!!busy || !!retry} onClick={() => void perform('create')}>Open my work desk <span aria-hidden="true">↗</span></button><p>Explore the facts. Try a plan.<br/>Learn from what changes.</p></div> : null}</div>
          {!s ? <ShiftIllustration/> : <div className="cr-shift-card"><span className="cr-eyebrow">{brief.company.toUpperCase()} / SHIFT CARD</span><div className="cr-clock">{shiftTime(s.simulatedMinute)}</div><p>{finished ? 'Handoff saved' : s.paused ? 'Shift paused' : s.phase === 'planning' ? 'Before the shift · draft a plan' : 'Shift in progress · review changed facts'}</p><ol className="cr-progress"><li className={s.replay && !s.commitments.length ? '' : 'is-done'}>Plan</li><li className={s.phase !== 'planning' ? 'is-done' : ''}>Respond</li><li className={finished ? 'is-done' : ''}>Handoff</li></ol><small>Scenario time. There is no live countdown.</small></div>}
        </section>
        {!s ? <><section className="cr-brief-strip"><div><span>YOUR ROLE</span><h2>Operations coordinator.</h2></div><p>Connect what the customer needs with what the warehouse can actually send. A good handoff makes the next person's job clearer.</p></section><div className="cr-preview-orders">{brief.orders.map(o => <article key={o.id}><span className="cr-order-letter">{o.id.toUpperCase()}</span><h3>{o.customer}</h3><strong>{o.quantity} kits <small>by {shiftTime(o.deadline)}</small></strong><p>{o.purpose}</p></article>)}</div>{home?.sessions.length ? <section className="cr-saved"><div className="cr-section-heading"><h2>Pick up your work.</h2><span>{home.sessions.length} saved shifts</span></div>{home.sessions.map((item, i) => <a key={item.id} href={`/career?shift=${encodeURIComponent(item.id)}`}><span>{String(i + 1).padStart(2, '0')}</span><strong>{item.title}<small>{item.isReplay ? 'Replay · ' : ''}{item.phase === 'handed_off' ? 'Handoff saved' : item.paused ? 'Paused' : item.phase === 'planning' ? 'Planning' : 'Responding to a change'} · Plan v{item.artifactRevision}</small></strong><time dateTime={item.updatedAt}>{new Date(item.updatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</time><span aria-hidden="true">↗</span></a>)}</section> : null}</> : work && draft ? <>
          {finished ? <LearningReport work={work} blocked={!!busy || aiActive || !!retry || conflict} onReplay={() => void perform('start_replay')}/> : null}
          {s.replay && !finished ? <section className="cr-replay-banner"><p className="cr-eyebrow">NEW SITUATION / SEPARATE ATTEMPT</p><h2>{s.attempt.mode === 'independent' ? 'Your decisions, with new facts.' : 'Continue with recorded guidance.'}</h2><p>The delay is already known. This shift has {brief.onHand} kits on hand and {brief.replenishmentQuantity} expected. Check what the customer needs this time; earlier agreements do not apply.</p><p>{s.attempt.mode === 'independent' ? 'Ask contacts for facts and set quantities on the board. Guidance is optional and marks this attempt as assisted before it appears. Generated spoken replies and AI allocation previews stay off until then.' : 'Your earlier independent reviews are preserved. This attempt now includes help; the report will show when it was requested.'}</p><a href={`/career?shift=${encodeURIComponent(s.replay.sourceSessionId)}`}>Open the earlier handoff ↗</a></section> : null}
          {s.incidentAt ? <section className="cr-incident" role="status"><span className="cr-incident-icon" aria-hidden="true">!</span><div><p className="cr-eyebrow">{shiftTime(s.simulatedMinute)} / {s.replay ? 'KNOWN SUPPLIER NOTICE' : 'SUPPLIER NOTICE'}</p><h2>The replenishment is running late.</h2><p>The {brief.replenishmentQuantity} kits are now expected at <strong>{shiftTime(s.eta)}</strong>. The on-hand count is still {brief.onHand}. {s.replay ? 'Build a plan against these current facts.' : 'Check what that means for your recorded plan.'}</p><small>Source: authored supplier notice · facts v{s.worldRevision} · no departure has left in this scenario.</small></div></section> : null}
          {s.paused ? <section className="cr-pause"><div><strong>A good place to pause.</strong><p>Your plan, agreements and reviews are saved.</p></div><button className="cr-primary" disabled={!!busy || conflict || !!retry} onClick={() => void perform('resume')}>Resume shift →</button></section> : null}
          <div className="cr-work-layout"><div className="cr-board">
            <div className="cr-section-heading"><div><p className="cr-eyebrow">01 / YOUR ORDER BOARD</p><h2>Where will each kit go?</h2></div><span className={`cr-save-label ${dirty ? 'cr-is-dirty' : ''}`}>{dirty ? 'Unsaved draft' : `Plan v${s.artifactRevision} saved`}</span></div>
            <p className="cr-muted" id="cr-allocation-help">Enter how many kits from each order travel on each departure. Zero means none. Only a review can confirm whether the whole plan fits.</p>
            <fieldset disabled={blocked} className="cr-allocation-fieldset" aria-describedby="cr-allocation-help"><legend className="cr-sr-only">Kit allocations by order and departure</legend><div className="cr-table-scroll" role="region" tabIndex={0} aria-label="Editable order allocation table"><table className="cr-plan-table"><thead><tr><th>Customer / commitment</th>{brief.departures.map(d => <th key={d.id}>{d.name}<small>Arrives {shiftTime(d.arrival)}</small></th>)}<th>Allocated</th></tr></thead><tbody>{brief.orders.map(o => {
              const sum = brief.departures.reduce((total, d) => total + (Number(draft[o.id][d.id]) || 0), 0);
              return <tr key={o.id} id={`cr-order-${o.id}`}><th scope="row"><div className="cr-order-name"><span className="cr-order-letter">{o.id.toUpperCase()}</span><span>{o.customer}<small>{o.quantity} kits · {s.agreement?.orderId === o.id ? 'Updated delivery agreement' : shiftTime(o.deadline)}</small></span></div><p>{s.agreement?.orderId === o.id ? 'Updated agreement recorded. See customer contact.' : o.purpose}</p></th>{brief.departures.map(d => { const value = draft[o.id][d.id]; const invalid = !/^\d{1,5}$/.test(value) || Number(value) > o.quantity; return <td key={d.id}><input type="number" inputMode="numeric" min={0} max={o.quantity} step={1} value={value} aria-invalid={invalid} aria-label={`Order ${o.id.toUpperCase()}, ${d.name}, kits`} onChange={e => edit(o.id, d.id, e.target.value)}/></td>; })}<td className={`cr-order-total ${sum !== o.quantity ? 'cr-danger-text' : ''}`}><strong>{sum}</strong><small>/ {o.quantity}</small></td></tr>;
            })}</tbody></table></div></fieldset>
            {!parsed ? <p className="cr-input-error" role="status">Use whole quantities from 0 to the order total in every cell.</p> : null}
            <div className="cr-board-actions"><div className="cr-buttons"><button disabled={blocked || !dirty || !parsed} onClick={() => void perform('save_plan')}>Save draft</button><button className="cr-text-button" disabled={blocked || !dirty} onClick={() => { setDraft(toDraft(s.plan)); clearCareerDraft(s.id); setConfirmation(null); }}>Discard edits</button></div><button className="cr-primary" disabled={blocked || !parsed} onClick={() => void perform('evaluate_plan')}>{dirty ? 'Save & review plan' : 'Review this plan'} <span aria-hidden="true">→</span></button></div>
            {storageIssue ? <p className="cr-small">This browser could not retain your local draft. Save it before leaving.</p> : null}
            <div className="cr-fact-caption">{s.agreement ? 'Customer B uses its recorded agreement. Other promises keep their original terms.' : 'Original customer commitments apply until a supported change is recorded.'}</div>
          </div><aside className="cr-side" aria-label="Operational facts and contacts">
            <section className="cr-inventory" id="cr-inventory"><p className="cr-eyebrow">WAREHOUSE / CURRENT FACTS</p><h2>Count on what you know.</h2><div className="cr-stock-figures"><div><strong>{brief.onHand}</strong><span>kits on hand</span></div><div><strong>+{brief.replenishmentQuantity}</strong><span>expected {shiftTime(s.eta)}</span></div></div><p>Expected stock can support a projection only after its arrival time.</p><small>Stock register + current supplier notice · facts v{s.worldRevision}</small></section>
            <section className="cr-carriers" id="cr-departures"><p className="cr-eyebrow">DISPATCH DESK</p><h3>Three ways out.</h3>{brief.departures.map(d => <div key={d.id}><strong>{d.name}<span>{d.fee} units</span></strong><p>Stage by {shiftTime(d.departure)}<br/>Arrives {shiftTime(d.arrival)} · {d.capacity} kits max</p></div>)}<footer><span>Shift budget</span><strong>{brief.budget} units</strong></footer><small>Flat fee per used departure. Fictional rates.</small></section>
            <section className="cr-customer"><p className="cr-eyebrow">CUSTOMER B / COMMITMENT</p><h3>{s.agreement ? 'A new promise, recorded.' : 'Check before you promise.'}</h3>{s.agreement ? <ul>{s.agreement.terms.map(t => <li key={t.by}>{t.quantity} kits in total by {shiftTime(t.by)}</li>)}</ul> : <p>The original promise on order B still applies. An offer only changes that promise after you record the agreement.</p>}<a href="#cr-contacts">Speak with the people involved ↗</a></section>
          </aside></div>
          <ActorDesk work={work} disabled={!!blocked} busy={!!busy || aiActive} dirty={dirty} onAsk={(actorId, questionId) => void perform({ type: 'ask_actor', actorId, questionId })} onAccept={() => void perform('accept_split')} onActive={setAiBusy} onWorkspace={receiveAi}/>
          <Proposals work={work} blocked={!!blocked} dirty={dirty} onApply={proposalId => void perform({ type: 'apply_proposal', proposalId })} onUndo={proposalId => void perform({ type: 'undo_proposal', proposalId })}/>
          {review ? <Review brief={brief} review={review} stale={stale}/> : <section className="cr-empty-review"><span aria-hidden="true">↳</span><div><h2>Every promise needs a plan.</h2><p>Review your allocations to see stock by departure, carrier capacity, customer deadlines and total shipping cost.</p></div></section>}
          {!finished ? <Coach key={s.id} work={work} blocked={!!blocked} dirty={dirty} onRequest={() => void perform('request_help')} onActive={setAiBusy} onWorkspace={receiveAi}/> : null}
          {!finished ? <section className="cr-next-step" id="cr-handoff"><div><p className="cr-eyebrow">{s.phase === 'planning' ? '02 / START THE SHIFT' : '03 / LEAVE A CLEAR HANDOFF'}</p><h2>{s.phase === 'planning' ? 'Ready to see how the day unfolds?' : 'Make the next shift’s job clearer.'}</h2><p>{s.phase === 'planning' ? 'Review and record an initial plan. Starting advances scenario time and introduces a supplier update.' : 'Record your current reviewed plan, then save a handoff. Any unresolved observations remain visible.'}</p></div><div className="cr-step-controls">{!recorded ? <button disabled={blocked || dirty || !review || stale} onClick={() => setConfirmation('plan')}>Record reviewed plan</button> : <span className="cr-agreement">✓ Current review recorded</span>}{s.phase === 'planning' ? <button className="cr-primary" disabled={blocked || !recorded} onClick={() => void perform('start_shift')}>Start shift <span aria-hidden="true">→</span></button> : <button className="cr-primary" disabled={blocked || !recorded} onClick={() => setConfirmation('handoff')}>Preview handoff <span aria-hidden="true">→</span></button>}</div>
            {confirmation && review && !stale ? <div className="cr-confirm"><h3>{confirmation === 'plan' ? 'Record this exact review?' : 'Save this final handoff?'}</h3><p>Plan {review.artifactRevision} · facts {review.worldRevision} · {review.outcome.cost} shipping units · {review.outcome.issues.length} unresolved observations.</p><p>{confirmation === 'handoff' ? 'The shift becomes read-only. Its plan, reviews, customer agreement and unresolved work stay available. This does not claim delivery or job readiness.' : 'This records your decision inside the simulation. It does not book a carrier, and it does not resolve any failed constraint.'}</p><div className="cr-buttons"><button className="cr-primary" disabled={blocked} onClick={() => void perform(confirmation === 'plan' ? 'confirm_plan' : 'handoff')}>{confirmation === 'plan' ? 'Record this version' : 'Save handoff'}</button><button disabled={!!busy || aiActive} onClick={() => setConfirmation(null)}>Keep working</button></div></div> : null}
          </section> : <section className="cr-handoff" id="cr-handoff"><p className="cr-eyebrow">SHIFT HANDOFF / SAVED</p><h2>A clear place to pick up.</h2><p>Plan v{s.artifactRevision}, its reviewed facts and {s.handoff?.unresolvedCount ?? 0} unresolved observations are saved. The record below shows how you got here.</p><p>{s.agreement ? 'Customer B’s split agreement is part of this handoff.' : 'Original customer deadlines still apply.'} Expected replenishment remains an assumption; this is not a delivery receipt.</p><p>{s.handoff?.assistance ? `Assistance at handoff: ${s.handoff.assistance.helpCount} guidance requests, ${s.handoff.assistance.aiFocusCount} AI-selected focuses and ${s.handoff.assistance.guidedVoiceCount} guided voice starts. ${s.handoff.assistance.history === 'unknown-before-tracking' ? 'Earlier assistance is unknown.' : `Recorded from the start; mode at handoff: ${s.handoff.assistance.mode}.`}` : 'This handoff predates assistance snapshots. Its earlier help history is unknown.'}</p><a href="/career">Return to my shifts ↗</a></section>}
          <section className="cr-history"><div className="cr-section-heading"><div><p className="cr-eyebrow">THE WORK BEHIND THE RESULT</p><h2>Your shift record.</h2></div><span>{s.events.length} recorded actions</span></div><ol>{s.events.slice(-12).map(e => <li key={e.id}><span className="cr-event-dot" aria-hidden="true"/><div><p>{e.summary}</p><small>Plan {e.artifactRevision} · facts {e.worldRevision} · revision {e.revision}{e.origin ? ` · ${e.origin.actorId === 'coach' ? 'AI coaching focus' : e.origin.mode === 'bedrock-voice' ? 'AI voice request' : 'AI text request'}` : ' · direct action'}</small></div><time dateTime={e.createdAt}>{new Date(e.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</time></li>)}</ol>{s.evaluations.length > 1 ? <details className="cr-details"><summary>Compare saved review summaries ({s.evaluations.length})</summary><div className="cr-table-scroll"><table className="cr-review-table"><thead><tr><th>Review</th><th>Plan / facts</th><th>Cost</th><th>Outcome at that time</th><th>Assistance at review</th></tr></thead><tbody>{s.evaluations.map(e => <tr key={e.id}><td>{e.number}</td><td>{e.artifactRevision} / {e.worldRevision}</td><td>{e.outcome.cost}</td><td>{e.outcome.feasible ? 'Projected constraints met' : `${e.outcome.issues.length} unresolved observations`}</td><td>{e.assistance ? `${e.assistance.helpCount} help · ${e.assistance.aiFocusCount} AI focus · ${e.assistance.guidedVoiceCount} guided voice${e.assistance.history === 'unknown-before-tracking' ? ' · earlier unknown' : ''}` : 'Earlier history unknown'}</td></tr>)}</tbody></table></div><p className="cr-small">An earlier review retains the facts it used. New information does not rewrite its history.</p></details> : null}<p className="cr-small">Manual decisions, source-backed role replies and any AI allocation proposals are recorded here. Guidance requests and any AI-selected focus are recorded separately. Replay attempts keep their own facts and assistance history. This history is not a mastery or employability score.</p></section>
          <div className="cr-session-footer"><span>{hosted ? 'Saved on the demo server · access belongs to this browser' : 'Saved on this computer · linked to this browser'}</span>{!finished && !s.paused ? <button className="cr-text-button" disabled={blocked || !parsed} onClick={() => void perform('pause')}>{dirty ? 'Save & pause' : 'Pause shift'} ↗</button> : null}</div>
        </> : null}
        <About brief={brief} hosted={hosted}/>
      </>}
    </main><footer className="cr-footer"><span>LearnSprint / Practice the work before the first job.</span>{!hosted ? <div><a href="/powerlab">Earlier PowerLab prototype</a><a href="/mission-preview">API preview</a></div> : <span>Hackathon demo</span>}</footer>
  </div>;
}

function About({ brief, hosted }: { brief: CareerBrief; hosted: boolean }) {
  return <details id="career-about" className="cr-about cr-details"><summary>Behind this shift <span>Scope, assumptions & learning goals</span></summary><div className="cr-about-columns"><section><h3>What you are practicing</h3><ul>{brief.objectives.map(o => <li key={o}>{o}</li>)}</ul><p>This is a fictional learning activity, not employment, an accredited internship, a recruitment assessment or a certificate.</p></section><section><h3>What the model assumes</h3><ul>{brief.assumptions.map(a => <li key={a}>{a}</li>)}</ul><p>Scenario {brief.version}. {hosted ? 'Shifts are stored on the demo server and accessed through this browser’s cookie.' : 'Local saved shifts rely on this browser’s cookie.'} Clearing cookies or changing browser loses access to saved shifts. Optional AI input uses Amazon Bedrock and a bounded local allowance. Source replies and coaching activities are authored. Optional generated spoken replies require recorded assistance. There is no personal account or cross-device recovery.</p></section></div></details>;
}
function ShiftIllustration() {
  return <figure className="cr-illustration"><svg viewBox="0 0 520 370" role="img" aria-label="Illustration of three order slips and a dispatch route on a work desk"><defs><pattern id="cr-paper-grid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="#d3d9cb" strokeWidth=".65"/></pattern></defs><rect x="14" y="14" width="492" height="342" rx="8" fill="#e5e9df"/><rect x="14" y="14" width="492" height="342" fill="url(#cr-paper-grid)"/><path d="M84 256H429V115H310" fill="none" stroke="#749484" strokeWidth="2" strokeDasharray="6 6"/><g transform="translate(62 47) rotate(-7 100 100)"><rect x="5" y="8" width="187" height="239" fill="#d3d8cf"/><rect width="187" height="239" fill="#fffdf7" stroke="#9ea99d"/><path d="M22 62H163M22 139H163M22 189H112" stroke="#d2d4c8"/><text x="22" y="34" fill="#455b52" fontFamily="monospace" fontSize="10" letterSpacing="2">ORDER / A</text><text x="22" y="109" fill="#243e35" fontFamily="Georgia" fontSize="46">30 kits</text><text x="22" y="165" fill="#455b52" fontFamily="monospace" fontSize="11">TODAY · 14:00</text><path d="M69 -5V24Q69 37 80 37T91 24V-5" fill="none" stroke="#6c7f73" strokeWidth="3"/></g><g transform="translate(278 167) rotate(6)"><rect x="5" y="7" width="167" height="112" fill="#ccd1c6"/><rect width="167" height="112" fill="#f5d7a8" stroke="#b89b70"/><text x="17" y="28" fill="#5a4630" fontFamily="monospace" fontSize="10" letterSpacing="1">WAREHOUSE NOTE</text><text x="17" y="66" fill="#5a4630" fontFamily="Georgia" fontSize="28">Check the ETA.</text><path d="M17 88H116" stroke="#ac8860"/></g><g transform="translate(334 61)"><rect width="115" height="61" rx="5" fill="#2e5345"/><text x="16" y="25" fill="#eef2e6" fontFamily="monospace" fontSize="9" letterSpacing="1">NEXT DEPARTURE</text><text x="16" y="48" fill="#eef2e6" fontFamily="Georgia" fontSize="23">12:00 →</text></g><circle cx="429" cy="137" r="5" fill="#b75b35"/><circle cx="84" cy="292" r="5" fill="#2e5345"/></svg><figcaption>AN ORDINARY DESK. A FEW IMPORTANT DECISIONS.</figcaption></figure>;
}
