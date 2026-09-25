import type { CareerWorkspace } from '@learnsprint/contracts';

interface Props { work: CareerWorkspace; blocked: boolean; dirty: boolean; onApply(id: string): void; onUndo(id: string): void }
export default function Proposals({ work, blocked, dirty, onApply, onUndo }: Props) {
  const s = work.session, last = s.proposalActions.at(-1);
  if (!s.proposals.length) return null;
  const canUndo = last?.type === 'applied' && last.afterHash === s.planHash && last.artifactRevision === s.artifactRevision && last.worldRevision === s.worldRevision;
  return <section className="cr-proposals" aria-labelledby="cr-proposals-title">
    <div className="cr-section-heading"><div><p className="cr-eyebrow">AI INTERPRETATION / YOUR DECISION</p><h2 id="cr-proposals-title">Review the proposed change.</h2></div>{canUndo ? <button disabled={blocked || dirty} onClick={() => onUndo(last.proposalId)}>Undo last applied proposal</button> : null}</div>
    {s.proposals.toReversed().map((p, index) => {
      const applied = s.proposalActions.find(a => a.proposalId === p.id && a.type === 'applied');
      const undone = s.proposalActions.some(a => a.proposalId === p.id && a.type === 'undone');
      const stale = p.baseHash !== s.planHash || p.artifactRevision !== s.artifactRevision || p.worldRevision !== s.worldRevision;
      const departure = work.brief.departures.find(d => d.id === p.departureId)!;
      const total = Object.values(p.after[p.orderId]).reduce((sum, n) => sum + n, 0);
      const content = <div className="cr-proposal-body"><p><strong>Order {p.orderId.toUpperCase()} · {departure.name}</strong></p><div className="cr-proposal-diff"><span>{p.previousQuantity} kits</span><span aria-hidden="true">→</span><strong>{p.quantity} kits</strong></div><p>Proposed total for this order: {total} / {work.brief.orders.find(o => o.id === p.orderId)?.quantity} kits. Review the full plan after applying.</p><p className="cr-small">From {p.origin.mode === 'bedrock-voice' ? 'Nova 2 Sonic voice' : 'Nova 2 Lite text'} · plan {p.artifactRevision} · facts {p.worldRevision}</p>{applied ? <p className="cr-agreement">{undone ? 'Applied, then undone. Both actions remain recorded.' : 'Applied after your confirmation.'}</p> : stale ? <p className="cr-small">The plan or facts changed. This proposal is historical.</p> : <button className="cr-primary" disabled={blocked || dirty} onClick={() => onApply(p.id)}>Apply this exact change</button>}</div>;
      return index === 0 ? <article key={p.id}>{content}</article> : <details className="cr-details" key={p.id}><summary>Earlier proposal · order {p.orderId.toUpperCase()} · {departure.name} · {p.quantity} kits</summary>{content}</details>;
    })}
    {blocked || dirty ? <p className="cr-small">Finish the active request and save or discard any draft before applying a proposal.</p> : null}
  </section>;
}
