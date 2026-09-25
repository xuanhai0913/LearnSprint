import { useEffect, useRef, useState } from 'react';
import type { CareerActorId, CareerAiStatus, CareerAiTurnRequest, CareerAiTurnResponse, CareerWorkspace } from '@learnsprint/contracts';
import { api, ApiError } from '../api';
import VoiceDock from './VoiceDock';
import './live.css';

interface Props {
  work: CareerWorkspace; actorId: CareerActorId; blocked: boolean; dirty: boolean;
  onActive(active: boolean): void;
  onWorkspace(work: CareerWorkspace, actorReplyId?: string | null): void;
}
const examples: Record<CareerActorId, string> = {
  warehouse: 'When is the stock arriving? Or: set order A, express today, to 30 kits.',
  'customer-b': 'Could we arrange a split delivery?',
  'shift-lead': 'What should I leave for the next shift?',
};
export default function LiveControls({ work, actorId, blocked, dirty, onActive, onWorkspace }: Props) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<CareerAiStatus['text'] | null>(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(false);
  const pending = useRef<CareerAiTurnRequest | null>(null);
  const inFlight = useRef(false), mounted = useRef(true);
  const latest = useRef({ onActive, onWorkspace }); latest.current = { onActive, onWorkspace };
  useEffect(() => {
    mounted.current = true;
    void api<CareerAiStatus>('/career/ai-status').then(s => { if (mounted.current) setStatus(s.text); }).catch(() => { if (mounted.current) setStatus({ available: false, remaining: 0, reason: 'AI availability could not be loaded. Use a listed question or reload this shift.' }); });
    return () => {
      mounted.current = false;
      if (inFlight.current && pending.current) void api(`/career/ai-turns/${pending.current.requestId}/cancel`, {}).catch(() => {});
      latest.current.onActive(false);
    };
  }, []);

  async function send(reuse = false): Promise<void> {
    if (inFlight.current || blocked || dirty || (!reuse && (!text.trim() || !status?.available))) return;
    const request = reuse ? pending.current : { requestId: crypto.randomUUID(), expectedRevision: work.session.revision, expectedWorldRevision: work.session.worldRevision, actorId, text: text.trim() };
    if (!request) return;
    pending.current = request; inFlight.current = true; setSending(true); setRetry(false); setError(''); setMessage('Interpreting your request…'); latest.current.onActive(true);
    try {
      const result = await api<CareerAiTurnResponse>(`/career/sessions/${work.session.id}/ai-turns`, request);
      if (!mounted.current) return;
      latest.current.onWorkspace(result.response.workspace, result.response.receipt.actorReplyId);
      setMessage(result.summary); pending.current = null; setText('');
    } catch (caught) {
      if (!mounted.current) return;
      setMessage(''); setError(caught instanceof Error ? caught.message : 'The request could not be completed.');
      setRetry(caught instanceof ApiError && ['NETWORK', 'PERSISTENCE_FAILED', 'REQUEST_FAILED'].includes(caught.code));
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        setSending(false); latest.current.onActive(false);
        void api<CareerAiStatus>('/career/ai-status').then(s => { if (mounted.current) setStatus(s.text); }).catch(() => {});
      }
    }
  }
  async function cancel(): Promise<void> {
    if (!pending.current) return;
    setMessage('Stopping the request. Waiting for its final state…');
    try { await api(`/career/ai-turns/${pending.current.requestId}/cancel`, {}); }
    catch { if (mounted.current) setError('The stop request could not reach the server. The original request has a bounded timeout.'); }
  }
  async function reload(): Promise<void> {
    if (inFlight.current || blocked || dirty) return;
    inFlight.current = true; setSending(true); latest.current.onActive(true);
    try {
      const next = await api<CareerWorkspace>(`/career/sessions/${work.session.id}`);
      if (mounted.current) { latest.current.onWorkspace(next); setError(''); }
    } catch { if (mounted.current) setError('The saved state could not be loaded. Check the local server.'); }
    finally { inFlight.current = false; if (mounted.current) { setSending(false); latest.current.onActive(false); } }
  }

  return <div className="cr-live-controls">
    <form className="cr-ai-text" onSubmit={e => { e.preventDefault(); void send(); }}>
      <label htmlFor="cr-natural-question">Ask in your own words</label>
      <textarea id="cr-natural-question" rows={3} maxLength={500} value={text} disabled={blocked || sending || retry} placeholder={work.session.attempt.mode === 'independent' ? actorId === 'warehouse' ? 'What stock is available, or when is replenishment expected?' : examples[actorId] : examples[actorId]} onChange={e => setText(e.target.value)}/>
      <p className="cr-small">Nova 2 Lite interprets the request; recorded scenario facts supply the reply. Typed text goes to Amazon Bedrock. Use fictional task details.{work.session.attempt.mode === 'independent' ? ' During this replay, ask factual questions here and set quantities directly on the board.' : ''}</p>
      <div className="cr-buttons">
        {sending ? <button type="button" disabled={!pending.current} onClick={() => void cancel()}>Stop request</button> : retry ? <><button type="button" disabled={blocked || dirty} onClick={() => void send(true)}>Retrieve the same request</button><button type="button" disabled={blocked} onClick={() => { setRetry(false); pending.current = null; }}>Write a new request</button></> : <button type="submit" disabled={blocked || dirty || !text.trim() || !status?.available}>Ask this contact ↗</button>}
        <span className="cr-small">{dirty ? 'Save the allocation draft first.' : status?.available ? `${status.remaining} text requests remain in the local allowance.` : status?.reason ?? 'Loading AI availability…'}</span>
      </div>
      {message ? <p className="cr-ai-message" role="status">{message}</p> : null}
      {error ? <div className="cr-ai-error" role="alert"><p>{error}</p><button type="button" disabled={blocked || sending || dirty} onClick={() => void reload()}>Load saved state</button></div> : null}
    </form>
    <VoiceDock workspace={work} actorId={actorId} blocked={blocked || sending} dirty={dirty} onActive={onActive} onWorkspace={onWorkspace}/>
  </div>;
}
