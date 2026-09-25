import { useEffect, useRef, useState } from 'react';
import type { LabVoiceEvent, LabVoiceStatus, LabVoiceTicket, LabWorkspace } from '@learnsprint/contracts';
import { api } from '../api';
import { VoiceAudio } from './voice-audio';

interface Props {
  workspace: LabWorkspace;
  blocked: boolean;
  dirty: boolean;
  onActive(active: boolean): void;
  onWorkspace(workspace: LabWorkspace): void;
}
type Phase = 'idle' | 'permission' | 'connecting' | 'listening' | 'closing';

function MicIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M6 11v1a6 6 0 0 0 12 0v-1M12 18v3m-3 0h6"/></svg>;
}

export default function VoiceDock({ workspace, blocked, dirty, onActive, onWorkspace }: Props) {
  const [status, setStatus] = useState<LabVoiceStatus | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState('');
  const [failure, setFailure] = useState('');
  const [transcript, setTranscript] = useState<{ role: 'user' | 'assistant'; text: string; id: number }[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const audio = useRef<VoiceAudio | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const ready = useRef(false);
  const finishing = useRef(false);
  const attempt = useRef(0);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ onActive, onWorkspace });
  latest.current = { onActive, onWorkspace };
  const active = phase !== 'idle';

  function clearResources(graceful = false): Promise<void> {
    ready.current = false; audio.current?.close(); audio.current = null;
    if (timer.current) clearInterval(timer.current);
    if (startTimer.current) clearTimeout(startTimer.current);
    timer.current = null; startTimer.current = null;
    const ws = socket.current; socket.current = null;
    if (!ws) return Promise.resolve();
    ws.onmessage = null; ws.onerror = null; ws.onclose = null; ws.onopen = null;
    if (graceful && ws.readyState === WebSocket.OPEN) {
      // Capture stops immediately. Wait for the server's close before reading the
      // final revision, so a tool already in flight cannot overtake that read.
      return new Promise(resolve => {
        const timeout = setTimeout(() => { ws.onclose = null; ws.onerror = null; ws.close(); resolve(); }, 2500);
        const closed = () => { clearTimeout(timeout); ws.onclose = null; ws.onerror = null; resolve(); };
        ws.onclose = closed; ws.onerror = closed;
        ws.send(JSON.stringify({ type: 'stop' }));
      });
    }
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'stop' }));
    ws.close();
    return Promise.resolve();
  }

  async function refreshStatus(): Promise<void> {
    try { setStatus(await api<LabVoiceStatus>('/lab/voice-status')); }
    catch { setStatus(null); setMessage('Voice status is unavailable. Your direct controls still work.'); }
  }

  function finish(note: string, reload = true): void {
    if (finishing.current) return;
    finishing.current = true;
    const generation = ++attempt.current;
    const closed = clearResources(reload);
    setPhase('closing'); setCanUndo(false); setMessage(note);
    void closed.then(async () => {
      if (generation !== attempt.current || !reload) return;
      const next = await api<LabWorkspace>(`/lab/sessions/${workspace.session.sessionId}`);
      if (generation === attempt.current) latest.current.onWorkspace(next);
    }).catch(() => { if (generation === attempt.current) setFailure('Voice stopped. Reload the saved practice if the last action was not visible.'); })
      .finally(() => {
        if (generation !== attempt.current) return;
        finishing.current = false; setPhase('idle'); latest.current.onActive(false);
        void refreshStatus();
      });
  }

  useEffect(() => {
    let mounted = true;
    void api<LabVoiceStatus>('/lab/voice-status').then(value => { if (mounted) setStatus(value); }).catch(() => { if (mounted) setMessage('Voice status is unavailable. Your direct controls still work.'); });
    return () => { mounted = false; attempt.current++; void clearResources(); latest.current.onActive(false); };
  }, []);

  async function start(): Promise<void> {
    if (active || blocked || dirty || !status?.available || workspace.session.phase !== 'practice') return;
    const generation = ++attempt.current;
    finishing.current = false;
    setFailure(''); setMessage('Allow microphone access to start live voice.'); setPhase('permission'); setTranscript([]); setElapsed(0);
    latest.current.onActive(true);
    const capture = new VoiceAudio(); audio.current = capture;
    try {
      await capture.open(frame => {
        const ws = socket.current;
        if (!ready.current || ws?.readyState !== WebSocket.OPEN) return;
        if (ws.bufferedAmount > 128 * 1024) { setFailure('The connection fell behind. Voice stopped; your saved plan is kept.'); finish('Connection stopped.'); return; }
        ws.send(frame);
      });
      if (generation !== attempt.current) return;
      setPhase('connecting'); setMessage('Connecting to Amazon Nova 2 Sonic…');
      const ticket = await api<LabVoiceTicket>(`/lab/sessions/${workspace.session.sessionId}/voice-ticket`, { requestId: crypto.randomUUID(), expectedRevision: workspace.session.revision });
      if (generation !== attempt.current) return;
      const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/lab/voice`);
      socket.current = ws; ws.binaryType = 'arraybuffer';
      startTimer.current = setTimeout(() => { if (generation === attempt.current && !ready.current) { setFailure('Voice did not connect in time. Your practice is unchanged.'); finish('Connection timed out.'); } }, 25000);
      ws.onopen = () => ws.send(JSON.stringify({ type: 'start', ticket: ticket.ticket }));
      ws.onmessage = event => {
        if (generation !== attempt.current) return;
        if (event.data instanceof ArrayBuffer) {
          try { capture.play(event.data); } catch (caught) { setFailure(caught instanceof Error ? caught.message : 'Audio could not play.'); finish('Playback stopped.'); }
          return;
        }
        let data: LabVoiceEvent;
        try { data = JSON.parse(event.data) as LabVoiceEvent; } catch { setFailure('The voice response could not be read.'); finish('Connection stopped.'); return; }
        if (data.type === 'ready') {
          if (startTimer.current) clearTimeout(startTimer.current);
          ready.current = true; startedAt.current = Date.now(); setPhase('listening'); setMessage('Listening. Say one device, hour and on/off action.');
          timer.current = setInterval(() => { const seconds = Math.floor((Date.now() - startedAt.current) / 1000); setElapsed(seconds); if (seconds >= data.maxDurationSeconds) finish('This short voice session has ended.'); }, 1000);
        } else if (data.type === 'transcript') {
          setTranscript(old => [...old, { role: data.role, text: data.text, id: (old.at(-1)?.id ?? 0) + 1 }].slice(-8));
        } else if (data.type === 'receipt') {
          latest.current.onWorkspace(data.response.workspace); setCanUndo(data.canUndo); setMessage(data.summary);
        } else if (data.type === 'interrupted') capture.stopPlayback();
        else if (data.type === 'notice') setMessage(data.message);
        else if (data.type === 'error') { setFailure(data.message); finish('Live voice stopped.'); }
        else if (data.type === 'closed') finish(data.reason === 'idle_limit' ? 'Voice stopped after a quiet interval.' : 'Voice session ended. Your plan is saved.');
      };
      ws.onerror = () => { if (generation === attempt.current) { setFailure('The live voice connection is unavailable. Your direct controls still work.'); finish('Connection stopped.'); } };
      ws.onclose = () => { if (generation === attempt.current) finish('Voice disconnected. Your saved plan is still here.'); };
    } catch (caught) {
      if (generation !== attempt.current) return;
      const name = caught instanceof Error ? caught.name : '';
      setFailure(name === 'NotAllowedError' ? 'Microphone access was not allowed. You can keep using the schedule directly.' : name === 'NotFoundError' ? 'No microphone was found. You can keep using the schedule directly.' : caught instanceof Error ? caught.message : 'Voice could not start.');
      finish('Voice is off.', false);
    }
  }

  function mute(): void {
    audio.current?.stopPlayback();
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify({ type: 'mute' }));
    setMessage('Playback stopped. The microphone is still listening.');
  }

  function undo(): void {
    if (socket.current?.readyState === WebSocket.OPEN && canUndo) {
      audio.current?.stopPlayback(); setCanUndo(false);
      socket.current.send(JSON.stringify({ type: 'undo' }));
    }
  }

  return <section className={`pl-voice ${active ? 'pl-voice-active' : ''}`} aria-labelledby="pl-voice-title">
    <div className="pl-voice-heading"><span className="pl-voice-icon"><MicIcon/></span><div><p className="pl-kicker">VOICE CONTROLS / ENGLISH</p><h3 id="pl-voice-title">Say the change. See it happen.</h3></div><span className="pl-voice-state">{phase === 'listening' ? `${elapsed}s / ${status?.maxDurationSeconds ?? 60}s · Mic on` : phase === 'connecting' ? 'Connecting' : phase === 'permission' ? 'Microphone permission' : phase === 'closing' ? 'Mic off · Finishing' : 'Mic off'}</span></div>
    <p className="pl-voice-intro">Try <q>Turn off the fan for hour four</q>, <q>Run the plan</q>, or <q>Undo the last edit</q>.</p>
    <div className="pl-voice-controls">{active ? <><button className="pl-voice-stop" disabled={phase === 'closing'} onClick={() => finish('Microphone off. Your saved plan is kept.')}><span aria-hidden="true">■</span> Stop voice</button><button disabled={phase !== 'listening'} onClick={mute}>Stop playback</button><button disabled={phase !== 'listening' || !canUndo} onClick={undo}>Undo last edit</button></> : <button disabled={blocked || dirty || !status?.available || workspace.session.phase !== 'practice'} onClick={() => void start()}><MicIcon/> Start voice</button>}<span>{dirty ? 'Save your draft before starting voice.' : workspace.session.phase === 'paused' ? 'Resume practice to use voice.' : !status?.available ? status?.reason ?? 'Loading voice availability…' : 'Audio goes to Amazon Bedrock while voice is on. Raw audio is not saved by this app.'}</span></div>
    {message ? <p className="pl-voice-message" role="status" aria-live="polite">{message}</p> : null}
    {failure ? <p className="pl-voice-error" role="alert">{failure}</p> : null}
    {transcript.length ? <div className="pl-voice-transcript" aria-label="Recent voice transcript">{transcript.map(line => <p key={line.id}><strong>{line.role === 'user' ? 'You' : 'Voice'}</strong><span>{line.text}</span></p>)}<small>Transcript stays in this view. Saved actions are in your practice record.</small></div> : null}
  </section>;
}
