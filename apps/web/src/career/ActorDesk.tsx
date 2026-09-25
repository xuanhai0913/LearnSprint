import { useEffect, useState } from 'react';
import type { CareerActorId, CareerActorReply, CareerFactTarget, CareerQuestionId, CareerWorkspace } from '@learnsprint/contracts';
import { shiftTime } from './api';
import LiveControls from './LiveControls';
import './actors.css';

interface Props {
  work: CareerWorkspace;
  disabled: boolean;
  busy: boolean;
  dirty: boolean;
  onAsk: (actorId: CareerActorId, questionId: CareerQuestionId) => void;
  onAccept: () => void;
  onActive: (active: boolean) => void;
  onWorkspace: (work: CareerWorkspace) => void;
}
const targets: Record<CareerFactTarget, { href: string; label: string }> = {
  inventory: { href: '#cr-inventory', label: 'Current warehouse facts' },
  departures: { href: '#cr-departures', label: 'Dispatch desk' },
  'order-b': { href: '#cr-order-b', label: 'Order B on the board' },
  handoff: { href: '#cr-handoff', label: 'Plan recording and handoff' },
};

export default function ActorDesk({ work, disabled, busy, dirty, onAsk, onAccept, onActive, onWorkspace }: Props) {
  const [selection, setSelection] = useState<{ actorId: CareerActorId; questionId: CareerQuestionId | null }>({ actorId: 'warehouse', questionId: null });
  const { session: s, actors } = work;
  useEffect(() => {
    setSelection({ actorId: 'warehouse', questionId: null });
  }, [s.id]);
  const actor = actors.find(a => a.id === selection.actorId) ?? actors[0];
  const replies = s.actorReplies.filter(r => r.actorId === actor.id);
  const reply = (selection.questionId ? replies.filter(r => r.questionId === selection.questionId) : replies).at(-1);
  const oldReplies = replies.filter(r => r.id !== reply?.id).toReversed();
  const reasons = [...new Set(actor.questions.map(q => q.unavailableReason).filter(Boolean))];
  function receive(next: CareerWorkspace, actorReplyId?: string | null): void {
    const saved = next.session.actorReplies.find(r => r.id === actorReplyId);
    if (saved) setSelection({ actorId: saved.actorId, questionId: saved.questionId });
    onWorkspace(next);
  }

  return <section id="cr-contacts" className="cr-contacts" aria-labelledby="cr-contacts-title">
    <div className="cr-section-heading">
      <div><p className="cr-eyebrow">PEOPLE AT YOUR DESK</p><h2 id="cr-contacts-title">Get the facts from the right person.</h2></div>
      <span className="cr-authored">Source-backed role replies</span>
    </div>
    <p className="cr-muted">Choose a contact. Use a listed question or ask in your own words below. Replies come from the scenario’s recorded facts.</p>
    <div className="cr-contact-directory" role="group" aria-label="Choose a contact">
      {actors.map(a => <button key={a.id} type="button" aria-pressed={actor.id === a.id} disabled={busy} onClick={() => setSelection({ actorId: a.id, questionId: null })}>
        <span className={`cr-contact-initial cr-contact-${a.id}`} aria-hidden="true">{a.name[0]}</span>
        <span><strong>{a.name}</strong><small>{a.role}</small></span>
        <span className="cr-contact-indicator" aria-hidden="true">↗</span>
      </button>)}
    </div>
    <div className="cr-contact-workspace">
      <div className="cr-contact-questions">
        <p className="cr-eyebrow">ASK {actor.name.toUpperCase()}</p>
        <p>{actor.scope}</p>
        <div className="cr-question-list">
          {actor.questions.map(q => <button key={q.id} type="button" disabled={disabled || !q.available} aria-describedby={!q.available ? 'cr-contact-unavailable' : undefined} onClick={() => { setSelection({ actorId: actor.id, questionId: q.id }); onAsk(actor.id, q.id); }}>
            <span>{q.label}</span><span aria-hidden="true">→</span>
          </button>)}
        </div>
        {reasons.length ? <p id="cr-contact-unavailable" className="cr-small">{reasons.join(' ')}</p> : null}
        <p className="cr-small">Fictional contacts. These questions reveal work facts; they do not change allocations or count as a request for coaching.</p>
      </div>
      <div className="cr-contact-conversation" aria-busy={busy}>
        {reply ? <Reply reply={reply} currentWorld={s.worldRevision}/> : <div className="cr-contact-empty"><span aria-hidden="true">“</span><h3>{busy ? 'Opening the response…' : 'A question is a useful first step.'}</h3><p>{busy ? 'The response will appear after it is saved.' : `${actor.name} can answer the questions listed here. Every answer has a source you can inspect.`}</p></div>}
        {actor.id === 'customer-b' && s.offer ? <section className="cr-contact-agreement" aria-label="Customer B agreement">
          <p className="cr-eyebrow">{s.agreement ? 'RECORDED AGREEMENT' : 'CUSTOMER OFFER / NOT YET ACCEPTED'}</p>
          <ul>{s.offer.terms.map(term => <li key={term.by}>{term.quantity} kits in total by {shiftTime(term.by)}</li>)}</ul>
          {s.agreement ? <p className="cr-agreement">✓ These terms are part of the recorded commitment.</p> : <>
            <p>Reading an offer does not change the original promise. Record these exact terms to use them in your next review.</p>
            <button className="cr-primary" disabled={disabled || dirty} onClick={onAccept}>Record this customer agreement</button>
            {dirty ? <p className="cr-small">Save or discard the allocation draft before recording an agreement.</p> : null}
          </>}
        </section> : null}
        {oldReplies.length ? <details className="cr-details cr-past-conversations"><summary>Earlier replies from {actor.name} ({oldReplies.length})</summary>{oldReplies.map(r => <Reply key={r.id} reply={r} currentWorld={s.worldRevision}/>)}<p className="cr-small">Saved replies retain the wording and facts disclosed at that time.</p></details> : null}
      </div>
    </div>
    <LiveControls work={work} actorId={actor.id} blocked={disabled} dirty={dirty} onActive={onActive} onWorkspace={receive}/>
  </section>;
}

function Reply({ reply, currentWorld }: { reply: CareerActorReply; currentWorld: number }) {
  const historical = reply.worldRevision !== currentWorld;
  return <article className="cr-contact-reply">
    <p className="cr-contact-question"><span>YOU ASKED</span>{reply.question}</p>
    <header><strong>{reply.actorName}</strong><span>{reply.role}</span><span className={historical ? 'cr-reply-historical' : 'cr-reply-current'}>{historical ? 'Earlier facts' : 'Current facts'}</span></header>
    <blockquote>{reply.message}</blockquote>
    {historical ? <p className="cr-reply-note">Facts have changed since this reply. Ask again to receive the current information.</p> : null}
    <ul className="cr-source-facts">
      {reply.facts.map(f => <li key={f.id}><strong>{f.label}</strong><p>{f.value}</p><small>Source: {f.sourceLabel}</small><a href={targets[f.target].href}>{targets[f.target].label} ↗</a></li>)}
    </ul>
    <details className="cr-reply-receipt"><summary>Saved source record · facts {reply.worldRevision}</summary><dl><div><dt>Response</dt><dd>{reply.id}</dd></div><div><dt>Recorded</dt><dd><time dateTime={reply.recordedAt}>{new Date(reply.recordedAt).toLocaleString('en')}</time></dd></div><div><dt>Mode</dt><dd>Authored · dialogue {reply.dialogueVersion} · scenario {reply.packVersion}</dd></div>{reply.facts.map(f => <div key={f.id}><dt>{f.sourceId}</dt><dd>{f.sourceVersion}</dd></div>)}</dl></details>
  </article>;
}
