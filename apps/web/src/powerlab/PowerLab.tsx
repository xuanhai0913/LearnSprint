import { useEffect, useRef, useState } from 'react';
import type { LabHome, LabMutationResponse, LabPack, LabScenario, LabSchedule, LabWorkspace } from '@learnsprint/contracts';
import { api, ApiError } from '../api';
import { clearDraft, formatNumber as number, formatTime, loadLabHome, restoreDraft, sameSchedule, storeDraft } from './api';
import { DeviceIcon, StudyHub } from './Visuals';
import { RunComparison, RunResults } from './Results';
import VoiceDock from './VoiceDock';
import './powerlab.css';

type Intent = 'create' | 'save' | 'run' | 'pause' | 'resume' | 'help';
type Conflict = 'server' | 'draft' | null;
const actionLabels: Record<Intent, string> = { create: 'Opening your practice…', save: 'Saving your schedule…', run: 'Running your plan…', pause: 'Saving your place…', resume: 'Resuming your practice…', help: 'Opening guidance for this run…' };

function practiceId(): string | null { return new URLSearchParams(window.location.search).get('practice'); }
function setPracticeUrl(id: string): void { history.replaceState({}, '', `/powerlab?practice=${encodeURIComponent(id)}`); }

export default function PowerLab() {
  const [home, setHome] = useState<LabHome | null>(null);
  const [workspace, setWorkspace] = useState<LabWorkspace | null>(null);
  const [draft, setDraft] = useState<LabSchedule | null>(null);
  const [hour, setHour] = useState('h1');
  const [spotlight, setSpotlight] = useState<string | null>(null);
  const [busy, setBusy] = useState('Opening PowerLab…');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [conflict, setConflict] = useState<Conflict>(null);
  const [retryIntent, setRetryIntent] = useState<Intent | null>(null);
  const [draftStorageUnavailable, setDraftStorageUnavailable] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const generation = useRef(0);
  const locked = useRef(false);
  const pending = useRef<{ key: string; requestId: string } | null>(null);

  const pack = workspace?.pack ?? home?.pack;
  const scenario = pack?.scenarios.find(item => item.id === (workspace?.session.scenarioId ?? 'practice-a'));
  const dirty = !!workspace && !!draft && !sameSchedule(draft, workspace.session.artifact.schedule);
  const paused = workspace?.session.phase === 'paused';
  const lastRun = workspace?.runs.at(-1);
  const stale = !!lastRun && (dirty || lastRun.artifact.revision !== workspace?.session.artifact.revision || lastRun.artifact.hash !== workspace?.session.artifact.hash);
  const editingBlocked = !!busy || paused || !!conflict || !!retryIntent || voiceActive;

  async function load(keepDraft = false): Promise<void> {
    if (locked.current || voiceActive) return;
    const currentGeneration = ++generation.current;
    setBusy('Opening your saved workspace…'); setError(''); setRetryIntent(null); pending.current = null;
    try {
      const nextHome = await loadLabHome();
      const id = practiceId();
      const next = id ? await api<LabWorkspace>(`/lab/sessions/${encodeURIComponent(id)}`) : null;
      if (currentGeneration !== generation.current) return;
      setHome(nextHome); setWorkspace(next); setConflict(null);
      if (next) {
        const recovered = keepDraft && draft ? { schedule: draft, conflict: false } : restoreDraft(next);
        setDraft(recovered?.schedule ?? next.session.artifact.schedule);
        setHour(next.pack.scenarios.find(item => item.id === next.session.scenarioId)!.slots[0].id);
        setConflict(recovered?.conflict ? 'draft' : null);
        if (keepDraft && draft) storeDraft(next, draft);
        setNotice(recovered ? 'Your unsaved draft is here. Review it before saving or running.' : `Practice restored. ${next.runs.length} saved ${next.runs.length === 1 ? 'run' : 'runs'}.`);
      } else { setDraft(null); setNotice(''); }
    } catch (caught) {
      if (currentGeneration === generation.current) setError(caught instanceof Error ? caught.message : 'The lab could not be opened.');
    } finally { if (currentGeneration === generation.current) setBusy(''); }
  }

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'PowerLab — LearnSprint';
    void load();
    return () => { generation.current++; document.title = previousTitle; };
  }, []);

  useEffect(() => {
    if (!dirty && !busy && !voiceActive) return;
    const warn = (event: BeforeUnloadEvent) => { if (dirty || locked.current || voiceActive) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, busy, voiceActive]);

  function rememberDraft(next: LabSchedule): void {
    setDraft(next); setNotice('');
    if (workspace && !storeDraft(workspace, next)) setDraftStorageUnavailable(true);
  }

  function toggle(deviceId: string, slotId: string): void {
    if (editingBlocked || !draft || !scenario) return;
    const on = !draft[deviceId].includes(slotId);
    const next = { ...draft, [deviceId]: scenario.slots.filter(slot => slot.id === slotId ? on : draft[deviceId].includes(slot.id)).map(slot => slot.id) };
    rememberDraft(next);
  }

  function accept(next: LabWorkspace, keepDraft = false): void {
    setWorkspace(next); setPracticeUrl(next.session.sessionId);
    if (keepDraft && draft) { setDraft(draft); storeDraft(next, draft); }
    else { setDraft(next.session.artifact.schedule); clearDraft(next.session.sessionId); }
  }

  async function send(path: string, body: Record<string, unknown>): Promise<LabMutationResponse> {
    const key = JSON.stringify({ path, body });
    if (pending.current?.key !== key) pending.current = { key, requestId: crypto.randomUUID() };
    const response = await api<LabMutationResponse>(path, { ...body, requestId: pending.current.requestId });
    pending.current = null;
    return response;
  }

  async function perform(intent: Intent): Promise<void> {
    if (locked.current || busy || conflict || voiceActive) return;
    locked.current = true; setBusy(actionLabels[intent]); setError(''); setNotice(''); setRetryIntent(null);
    try {
      if (intent === 'create') {
        if (!home) return;
        const response = await send('/lab/sessions', { scenarioId: 'practice-a', packVersion: home.pack.version });
        accept(response.workspace); setHour(response.workspace.pack.scenarios[0].slots[0].id);
        setNotice('Your first plan is saved. Run it once, then explore what you can change.');
        return;
      }
      if (!workspace || !draft) return;
      let current = workspace;
      const path = `/lab/sessions/${current.session.sessionId}`;
      if (intent !== 'resume' && dirty) {
        setBusy('Saving this schedule…');
        const response = await send(`${path}/commands`, { type: 'save_plan', expectedRevision: current.session.revision, schedule: draft });
        current = response.workspace;
        // A replay can return a more recent edit from another tab. Do not run it as this draft.
        if (!sameSchedule(current.session.artifact.schedule, draft)) {
          setWorkspace(current);
          throw new ApiError('The saved schedule changed in another tab. Your draft has been kept for review.', 'REVISION_CONFLICT');
        }
        accept(current);
      }
      if (intent === 'help') {
        if (!current.session.lastRunId) return;
        const response = await send(`${path}/commands`, { type: 'request_help', runId: current.session.lastRunId, expectedRevision: current.session.revision });
        accept(response.workspace); setNotice('Authored guidance opened and recorded for this run.');
      } else if (intent === 'run') {
        setBusy('Calculating energy, power and service needs…');
        const response = await send(`${path}/runs`, { expectedRevision: current.session.revision });
        accept(response.workspace);
        const run = response.workspace.runs.find(item => item.runId === response.receipt.runId)!;
        setNotice(`Run ${run.number} saved. ${number(run.outcome.energyWh)} Wh requested, ${number(run.outcome.peakPowerW)} W peak. ${run.outcome.feasible ? 'All constraints met.' : 'Some constraints need attention.'}`);
      } else if (intent === 'pause' || intent === 'resume') {
        const response = await send(`${path}/commands`, { type: intent, expectedRevision: current.session.revision });
        accept(response.workspace, intent === 'resume' && dirty);
        setNotice(intent === 'pause' ? 'Practice paused. Your schedule and runs are saved.' : 'Practice resumed. Your previous runs are still here.');
      } else setNotice('Schedule saved. Run it when you are ready to see the modeled outcome.');
    } catch (caught) {
      const code = caught instanceof ApiError ? caught.code : 'NETWORK';
      setError(caught instanceof Error ? caught.message : 'The action could not be completed. Your draft is kept.');
      if (['REVISION_CONFLICT', 'PHASE_CONFLICT', 'REQUEST_REUSED'].includes(code)) { setConflict('server'); pending.current = null; }
      else if (['NETWORK', 'PERSISTENCE_FAILED', 'REQUEST_FAILED'].includes(code)) setRetryIntent(intent);
      else pending.current = null;
    } finally { locked.current = false; setBusy(''); }
  }

  function resolveDraft(useSaved: boolean): void {
    if (!workspace) return;
    if (useSaved) { setDraft(workspace.session.artifact.schedule); clearDraft(workspace.session.sessionId); }
    else if (draft) storeDraft(workspace, draft);
    setConflict(null); setError(''); setNotice(useSaved ? 'Using the latest saved schedule.' : 'Your draft is ready to review. Saving it will replace the current schedule; past runs remain.');
  }

  return <div className="powerlab">
    <a className="pl-skip" href="#pl-main">Skip to the practice</a>
    <header className="pl-header"><a className="pl-brand" href="/powerlab"><span className="pl-brand-mark" aria-hidden="true">l/s</span>LearnSprint<span className="pl-brand-dot">.</span></a><nav aria-label="Lab navigation"><span className="pl-header-divider"/><span>THE PRACTICE LAB</span><a href="#pl-about">About this lesson ↗</a></nav></header>
    <main id="pl-main" className="pl-main">
      {error ? <div className="pl-alert" role="alert"><strong>Your place is still here.</strong><p>{error}</p><div className="pl-alert-actions">{retryIntent ? <button type="button" disabled={!!busy} onClick={() => void perform(retryIntent)}>Retry the same action</button> : null}{conflict !== 'draft' ? <button type="button" disabled={!!busy} onClick={() => void load(true)}>{workspace ? 'Load latest state & keep my draft' : 'Try loading again'}</button> : null}{!workspace && practiceId() ? <a href="/powerlab">Open my practices</a> : null}</div></div> : null}
      {conflict === 'draft' ? <div className="pl-alert" role="alert"><strong>A draft and a newer saved schedule are both available.</strong><p>Your draft came from an older plan. Choose which schedule to work on; your saved run history stays intact.</p><div className="pl-alert-actions"><button onClick={() => resolveDraft(true)}>Use the saved schedule</button><button onClick={() => resolveDraft(false)}>Keep my draft for review</button></div></div> : null}
      <div className="pl-live-status" role="status" aria-live="polite">{busy || notice}</div>
      {!pack || !scenario ? <section className="pl-opening"><p className="pl-kicker">LEARN BY MAKING A DECISION</p><h1>A little room<br/>for a big idea.</h1><p>{error ? 'Return to your practices or retry above.' : 'Opening your PowerLab notebook…'}</p></section> : <>
        <section className={`pl-hero ${workspace ? 'pl-hero-active' : ''}`} aria-labelledby="pl-title">
          <div className="pl-hero-copy"><div className="pl-lesson-tag"><span>01</span>POWERLAB <i/>ENERGY SYSTEMS</div><h1 id="pl-title">Four hours.<br/><em>One battery.</em></h1><p className="pl-lede">{scenario.brief}</p>
            <dl className="pl-constraints"><div><dt>Usable energy</dt><dd>{scenario.capacityWh}<span>Wh</span></dd></div><div><dt>Power limit</dt><dd>{scenario.maxPowerW}<span>W</span></dd></div><div><dt>Keep it open</dt><dd>{number(scenario.slots.reduce((sum, slot) => sum + slot.minutes, 0) / 60)}<span>hours</span></dd></div></dl>
            {!workspace ? <div className="pl-start"><button className="pl-primary" disabled={!!busy || !!retryIntent} onClick={() => void perform('create')}>Start the practice <span aria-hidden="true">↗</span></button><span>Make a plan. Run it. See what changes.</span></div> : <p className="pl-hero-note"><span aria-hidden="true">↳</span> A working plan meets both limits <em>and</em> every service need.</p>}
          </div>
          <figure className="pl-scene"><StudyHub scenario={scenario} schedule={draft ?? scenario.initialSchedule} hour={hour} spotlight={spotlight}/><figcaption><span>{workspace ? 'YOUR SCHEDULE, AT A GLANCE' : 'A SMALL CAMPUS STUDY HUB'}</span><span>Fictional devices · modeled demand</span></figcaption>{workspace ? <div className="pl-hour-preview" role="group" aria-label="Preview a scheduled hour">{scenario.slots.map(slot => <button type="button" key={slot.id} aria-pressed={hour === slot.id} onClick={() => setHour(slot.id)} aria-label={`Preview ${slot.label}, ${slot.start} to ${slot.end}`}>{slot.start}<span>{slot.label}</span></button>)}</div> : null}</figure>
        </section>

        {!workspace ? <>
          <section className="pl-brief-devices" aria-labelledby="pl-needs-title"><div><p className="pl-kicker">THE PEOPLE COME FIRST</p><h2 id="pl-needs-title">What the hub needs.</h2><p>Turning everything off saves energy.<br/>It also leaves people without a study space.</p></div><div className="pl-device-brief-grid">{scenario.devices.map(device => <article key={device.id}><span className={`pl-device-icon pl-kind-${device.kind}`}><DeviceIcon kind={device.kind}/></span><div><h3>{device.name}<span>{device.watts} W</span></h3><p>{device.purpose}</p></div></article>)}</div></section>
          {home?.sessions.length ? <section className="pl-saved-practices"><div className="pl-section-heading"><h2>Pick up where you paused.</h2><span>{home.sessions.length} saved {home.sessions.length === 1 ? 'practice' : 'practices'}</span></div><div className="pl-practice-list">{home.sessions.map((session, index) => <a href={`/powerlab?practice=${encodeURIComponent(session.sessionId)}`} key={session.sessionId}><span className="pl-practice-index">{String(index + 1).padStart(2, '0')}</span><div><strong>The study hub</strong><span>{session.phase === 'paused' ? 'Paused' : 'In practice'} · {session.runCount} saved runs · Plan v{session.artifact.revision}</span></div><time dateTime={session.updatedAt}>{new Date(session.updatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</time><span aria-hidden="true">↗</span></a>)}</div><p className="pl-small">Saved on this computer and linked to this browser. Clearing its cookies or changing browser loses access to these practices.</p></section> : null}
        </> : draft ? <>
          <section className="pl-workbench" aria-labelledby="pl-workbench-title">
            <div className="pl-section-heading"><div><p className="pl-kicker">02 / BUILD YOUR AFTERNOON</p><h2 id="pl-workbench-title">Give every hour a job.</h2></div><div className="pl-save-status"><span className={dirty ? 'pl-unsaved-dot' : 'pl-saved-dot'} aria-hidden="true"/>{dirty ? 'Unsaved edits' : `Plan v${workspace.session.artifact.revision} saved`}</div></div>
            <div className="pl-workbench-intro"><p id="pl-grid-help">Select a block to turn a device on or off for that hour. Each selected block is one full hour of use.</p><span className="pl-on-key"><i/>Scheduled on</span></div>
            {paused ? <div className="pl-pause-note"><div><strong>A good place to pause.</strong><p>Your schedule and runs are saved. Resume whenever you are ready.</p></div><button className="pl-primary" disabled={!!busy || !!conflict || !!retryIntent} onClick={() => void perform('resume')}>Resume practice <span aria-hidden="true">→</span></button></div> : null}
            <fieldset className="pl-schedule" disabled={editingBlocked} aria-describedby="pl-grid-help"><legend className="pl-sr-only">Device schedule</legend><div className="pl-schedule-header" aria-hidden="true"><span>Device / service need</span>{scenario.slots.map(slot => <span key={slot.id}>{slot.label}<small>{slot.start}–{slot.end}</small></span>)}<span>Planned</span></div>
              {scenario.devices.map(device => {
                const minutes = scenario.slots.reduce((sum, slot) => sum + (draft[device.id].includes(slot.id) ? slot.minutes : 0), 0);
                return <div className={`pl-device-row pl-kind-${device.kind}`} key={device.id} onMouseEnter={() => setSpotlight(device.id)} onMouseLeave={() => setSpotlight(null)} onFocus={() => setSpotlight(device.id)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSpotlight(null); }}>
                  <div className="pl-device-label"><span className="pl-device-icon"><DeviceIcon kind={device.kind}/></span><span><strong>{device.name}<small>{device.watts} W</small></strong><span>{device.service === 'every_slot' ? 'Every hour' : `At least ${number(device.requiredMinutes / 60)} ${device.requiredMinutes === 60 ? 'hour' : 'hours'}`}</span></span></div>
                  <div className="pl-hour-toggles">{scenario.slots.map(slot => <label className={`pl-slot ${draft[device.id].includes(slot.id) ? 'pl-slot-on' : ''}`} key={slot.id}><input type="checkbox" checked={draft[device.id].includes(slot.id)} onChange={() => toggle(device.id, slot.id)} aria-label={`${device.name}, ${slot.label}, ${slot.start} to ${slot.end}`}/><span className="pl-slot-content" aria-hidden="true"><span className="pl-mobile-hour">{slot.label}</span><span className="pl-slot-symbol">{draft[device.id].includes(slot.id) ? '✓' : '−'}</span><span className="pl-slot-word">{draft[device.id].includes(slot.id) ? 'On' : 'Off'}</span></span></label>)}</div>
                  <div className="pl-scheduled-time"><strong>{number(minutes / 60)}<span> h</span></strong><small>of {number(device.requiredMinutes / 60)} h needed</small></div>
                </div>;
              })}
            </fieldset>
            <div className="pl-workbench-actions"><div className="pl-edit-actions"><button type="button" disabled={editingBlocked || !dirty} onClick={() => void perform('save')}>Save draft</button><button className="pl-text-button" type="button" disabled={editingBlocked || !dirty} onClick={() => { rememberDraft(workspace.session.artifact.schedule); setNotice('Edits discarded. The saved plan is restored.'); }}>Discard edits</button></div><div className="pl-run-action"><span>{lastRun ? 'An edit is a new possibility.' : 'Start by running the all-on plan.'}</span><button className="pl-primary" disabled={editingBlocked} onClick={() => void perform('run')}>{busy ? 'Working…' : 'Run this plan'}<span aria-hidden="true">→</span></button></div></div>
            {draftStorageUnavailable ? <p className="pl-storage-note">This browser cannot retain unsaved edits. Use Save draft before leaving.</p> : null}
          </section>
          <VoiceDock key={workspace.session.sessionId} workspace={workspace} dirty={dirty} blocked={!!busy || !!conflict || !!retryIntent || voiceActive} onActive={setVoiceActive} onWorkspace={next => accept(next)}/>
          {lastRun ? <RunResults run={lastRun} scenario={scenario} stale={stale}/> : <section className="pl-awaiting-result"><span aria-hidden="true">↳</span><div><h2>What will your plan ask of the battery?</h2><p>Run the schedule to see energy, peak power and the needs you have met. Results will stay linked to the exact plan you ran.</p></div><div className="pl-result-placeholder" aria-hidden="true"><i/><i/><i/><i/></div></section>}
          <section className="pl-guidance" aria-labelledby="pl-guidance-title">
            <p className="pl-kicker">AN INVESTIGATION TO TRY</p><h2 id="pl-guidance-title">Make the next change meaningful.</h2>
            <p>Open an authored activity based on your latest saved run. Requesting guidance is recorded; it does not change your schedule.</p>
            <button disabled={editingBlocked || dirty || stale || !lastRun || workspace.intervention?.runId === lastRun?.runId} onClick={() => void perform('help')}>Explore this result</button>
            {!lastRun || dirty || stale ? <p className="pl-small">Run your current plan to open guidance for that result.</p> : null}
            {workspace.intervention ? <article><span className="pl-kicker">AUTHORED GUIDANCE · NOT LIVE AI</span><h3>{workspace.intervention.title}</h3><p>{workspace.intervention.activity}</p><small>Based on run {workspace.runs.find(run => run.runId === workspace.intervention!.runId)?.number}. {workspace.intervention.runId !== lastRun?.runId || stale ? 'This refers to an earlier result; run and request fresh guidance for the current plan.' : 'Your current saved result.'}</small></article> : null}
            <p className="pl-small">{workspace.session.assistance?.length ?? 0} guidance requests recorded. This is an activity history, not an independent assessment or mastery score.</p>
          </section>
          {workspace.runs.length >= 2 ? <RunComparison key={lastRun!.runId} runs={workspace.runs} scenario={scenario}/> : lastRun ? <div className="pl-compare-invitation"><span aria-hidden="true">⇄</span><p><strong>Make one change, then run again.</strong><br/>Two saved runs will let you compare energy and peak power.</p></div> : null}
          <div className="pl-session-footer"><span>{workspace.session.runCount} saved {workspace.session.runCount === 1 ? 'run' : 'runs'} · {paused ? 'Paused' : 'Practice A'} · Saved on this computer</span>{!paused ? <button className="pl-text-button" disabled={!!busy || !!conflict || !!retryIntent || voiceActive} onClick={() => void perform('pause')}>{dirty ? 'Save & pause practice' : 'Pause practice'} ↗</button> : null}</div>
          <details className="pl-detail pl-session-record"><summary>Your practice record <span>Recent {workspace.recentActions.length} actions</span></summary><ol>{workspace.recentActions.map(action => <li key={action.eventId}><time dateTime={action.createdAt}>{formatTime(action.createdAt)}</time><span>{action.operation === 'create' ? 'Practice opened' : action.operation === 'save_plan' ? `Schedule saved · ${action.changes.length} hour ${action.changes.length === 1 ? 'block' : 'blocks'} changed` : action.operation === 'run_plan' ? `Plan v${action.artifactRevision} evaluated` : action.operation === 'pause' ? 'Practice paused' : action.operation === 'request_help' ? 'Authored guidance requested' : 'Practice resumed'}</span><small>{action.origin === 'voice' ? 'Voice' : 'Manual'} · revision {action.toRevision}</small></li>)}</ol><p className="pl-small">This is a record of your actions and modeled outcomes, not a mastery score. Earlier actions remain saved.</p></details>
        </> : null}

        <AboutLesson pack={pack} scenario={scenario}/>
      </>}
    </main>
    <footer className="pl-footer"><span>LearnSprint <i>/</i> A little practice. A clearer understanding.</span><div><a href="/mission-preview">Earlier API preview</a><a href="/">Study notebook</a></div></footer>
  </div>;
}

function AboutLesson({ pack, scenario }: { pack: LabPack; scenario: LabScenario }) {
  return <details id="pl-about" className="pl-detail pl-about"><summary>Behind the lesson <span>Assumptions, sources & learning goals</span></summary><div className="pl-about-grid"><section><h3>A model you can inspect.</h3><p>For each hour, add the power of the devices scheduled on. Multiply that power by the time to get energy. A feasible plan stays within both limits and provides every required service.</p><div className="pl-formula"><span>Energy (Wh)</span><b>=</b><span>Power (W) × time (h)</span></div><ul>{pack.assumptions.map(assumption => <li key={assumption}>{assumption}</li>)}</ul></section><section><h3>What you are practicing.</h3><ol>{pack.objectives.map(objective => <li key={objective.id}>{objective.text}</li>)}</ol>{pack.sources.map(source => <div className="pl-source" key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><p>{source.note}</p></div>)}<p className="pl-small">Lesson {pack.version} · {scenario.title}. Direct controls use the local schedule model. Optional English voice controls use Amazon Nova 2 Sonic when enabled; each saved action is recorded. Conversational coaching, changed-task assessment and teacher sharing are still in development. This is a web experience, with no native Alexa connection.</p></section></div></details>;
}
