import { useEffect, useId, useReducer, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { currentSuitePassed, initialState, latestSuite, MISSIONS, reducer, SOURCE_CARDS } from './preview-domain';
import type { MissionId, SourceId, State, Work } from './preview-domain';
import { Workbench } from './Workbench';
import './mission.css';

type Overlay = { kind: 'about' | 'reset' | 'storyboard' } | { kind: 'source'; sourceId: SourceId } | null;

export default function MissionPreview() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [comparisonVisible, setComparisonVisible] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const lastLocation = useRef(`${state.screen}:${state.mission}`);
  const mission = MISSIONS[state.mission];
  const work = state[state.mission];
  useEffect(() => {
    const location = `${state.screen}:${state.mission}`;
    if (lastLocation.current !== location) {
      lastLocation.current = location;
      heading.current?.focus();
    }
  }, [state.screen, state.mission]);
  function openSource(sourceId: SourceId) {
    dispatch({ type: 'help', kind: 'sources' });
    setOverlay({ kind: 'source', sourceId });
  }
  function changeScreen(action: Parameters<typeof dispatch>[0]) {
    setHintVisible(false);
    setComparisonVisible(false);
    dispatch(action);
  }
  function showHelp(kind: 'hints' | 'comparisons') {
    dispatch({ type: 'help', kind });
    if (kind === 'hints') setHintVisible(true);
    else setComparisonVisible(true);
  }
  const currentStep = state.screen === 'summary' ? 3 : state.mission === 'teamboard' || state.screen === 'transfer-brief' ? 2 : state.screen === 'brief' ? 0 : 1;
  return <div className="mission-app">
    <a className="mp-skip" href="#mission-main">Skip to mission</a>
    <header className="mp-header">
      <a className="mp-brand" href="/mission-preview" aria-label="LearnSprint mission preview home"><span className="mp-brand-mark" aria-hidden="true">l/s</span><span>LearnSprint<span className="mp-brand-dot">.</span></span></a>
      <div className="mp-header-links"><span className="mp-preview-label"><span aria-hidden="true"/>Interactive preview</span><button className="mp-text-button" onClick={() => setOverlay({ kind: 'about' })}>About this build ↗</button></div>
    </header>
    <main id="mission-main" className="mp-main">
      <div className="mp-topline"><span className="mp-overline">THE PRACTICE SERIES <span>/</span> 001 — API PERMISSIONS</span><button className="mp-text-button" onClick={() => setOverlay({ kind: 'storyboard' })}>The six-frame story <span aria-hidden="true">↗</span></button></div>
      {state.screen === 'brief' ? <>
        <section className="mp-intro">
          <div className="mp-intro-copy"><span className="mp-kicker"><span aria-hidden="true">01</span> A SMALL TASK. A REAL DECISION.</span><h1 ref={heading} tabIndex={-1}>Make a change.<br/>See what you<br/><em>actually know.</em></h1><p className="mp-lede">Step into a developer’s day. Investigate a broken API, repair its policy, then put the idea to work somewhere new.</p><div className="mp-intro-meta"><span>↗ Junior developer practice</span><span>◷ About 10 minutes</span></div><button className="mp-primary" onClick={() => changeScreen({ type: 'start' })}>Open the workbench <span aria-hidden="true">→</span></button><button className="mp-text-button mp-skip-practice" onClick={() => changeScreen({ type: 'transfer-brief' })}>Already know the basics? Try the transfer mission</button></div>
          <div className="mp-ticket"><div className="mp-ticket-top"><span className="mp-overline">YOUR FIRST TICKET</span><span className="mp-ticket-id">NS–014</span></div><div className="mp-ticket-product"><span className="mp-product-icon" aria-hidden="true">N</span><span>NoteShare <small>A fictional notes app</small></span><span className="mp-ticket-priority">Access bug</span></div><h2>A private note.<br/>An unexpected editor.</h2><p>Bob has a valid token — and can change Alice’s note. That should never have been enough.</p><RequestIllustration/><div className="mp-ticket-rule"><span aria-hidden="true">↳</span><p><strong>Your job</strong>Keep owners’ edits working. Close the gap that lets someone else in.</p></div><div className="mp-ticket-bottom"><span>3 policy controls</span><span>6 request scenarios</span><span>No setup</span></div></div>
        </section>
        <section className="mp-how" aria-label="How the mission works">{[
          ['01', 'Try a real action.', 'Send a synthetic request and follow the result through the policy.'],
          ['02', 'Make the connection.', 'Use a focused comparison or source when something does not add up.'],
          ['03', 'Apply it elsewhere.', 'A new business rule asks you to adapt what you just practiced.'],
        ].map(([number, title, text]) => <article key={number}><span className="mp-how-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</section>
      </> : <>
        <nav className="mp-steps" aria-label="Mission progress">{['Read the ticket', 'Investigate & repair', 'Apply elsewhere', 'Take stock'].map((step, index) => <div key={step} aria-current={index === currentStep ? 'step' : undefined} className={index === currentStep ? 'is-current' : ''}><span>{String(index + 1).padStart(2, '0')}</span>{step}</div>)}</nav>
        {state.screen === 'transfer-brief' ? <section className="mp-transfer-intro">
          <div><p className="mp-overline">02 / TRANSFER MISSION</p><h1 ref={heading} tabIndex={-1}>The rule<br/>just <em>changed.</em></h1><p className="mp-lede">Now you’re working on TeamBoard. Editors need to update a teammate’s board, too.</p><p>Your task is to apply the underlying idea to a different relationship. Start from a fresh policy and use the new ticket as your guide.</p><button className="mp-primary" onClick={() => changeScreen({ type: 'start-transfer' })}>Open TeamBoard <span aria-hidden="true">→</span></button></div>
          <div className="mp-transfer-ticket"><div className="mp-ticket-top"><span className="mp-overline">NEW REQUIREMENTS</span><span className="mp-ticket-id">TB–008</span></div><h2>Let the right teammates in.</h2><ul className="mp-requirements">{MISSIONS.teamboard.requirements.map(text => <li key={text}>{text}</li>)}</ul><div className="mp-reference-note"><strong>Open-reference practice</strong><p>You can read source cards. Asking for a hint or comparison marks this mission as assisted. Request runs and verification attempts are recorded separately.</p></div><span className="mp-fine">All actors and resources are synthetic.</span></div>
        </section> : null}
        {state.screen === 'workbench' ? <>
          <div className="mp-work-heading"><div><p className="mp-overline">{mission.type} <span>/</span> {mission.ticket}</p><h1 ref={heading} tabIndex={-1}>{mission.name}<em> workbench.</em></h1></div><div className="mp-work-actions"><button className="mp-secondary" onClick={() => dispatch({ type: 'pause', paused: !state.paused })}>{state.paused ? 'Continue' : 'Pause'}</button><button className="mp-text-button" onClick={() => changeScreen({ type: 'summary' })}>Finish & take stock →</button></div></div>
          {state.paused ? <section className="mp-paused"><span className="mp-large-glyph" aria-hidden="true">Ⅱ</span><h2>A good place to pause.</h2><p>Your controls and runs are still here in this open tab. This design preview resets on reload.</p><button className="mp-primary" onClick={() => dispatch({ type: 'pause', paused: false })}>Continue the mission →</button></section> : <Workbench missionId={state.mission} work={work} dispatch={dispatch} hintVisible={hintVisible} comparisonVisible={comparisonVisible} showHelp={showHelp} closeComparison={() => setComparisonVisible(false)} openSource={openSource} onNext={() => changeScreen({ type: state.mission === 'noteshare' ? 'transfer-brief' : 'summary' })}/>}
        </> : null}
        {state.screen === 'summary' ? <section className="mp-summary"><p className="mp-overline">YOUR PRACTICE RECORD · THIS TAB ONLY</p><h1 ref={heading} tabIndex={-1}>Keep the evidence.<br/><em>Choose the next step.</em></h1><p className="mp-lede">A record of what you tried, what the requests did, and where help was used.</p><div className="mp-summary-grid"><Evidence missionId="noteshare" work={state.noteshare}/><Evidence missionId="teamboard" work={state.teamboard}/></div><NextStep state={state} onReturn={id => changeScreen({ type: 'return', mission: id })}/><div className="mp-summary-foot"><p>These are local sandbox outcomes, not a certification of skill. Durable learning history and live AI coaching come in the next implementation stages.</p><button className="mp-secondary" onClick={() => setOverlay({ kind: 'reset' })}>Start a fresh preview</button></div></section> : null}
      </>}
    </main>
    <footer className="mp-footer"><span>LearnSprint / A little practice. A clearer next step.</span><div><span>Alexa+ experience simulation</span><a href="/">Earlier quiz prototype ↗</a></div></footer>
    {overlay ? <Dialog title={overlay.kind === 'source' ? 'Read the source' : overlay.kind === 'about' ? 'About this preview' : overlay.kind === 'reset' ? 'Start a fresh preview?' : 'The six-frame story'} onClose={() => setOverlay(null)} wide={overlay.kind === 'storyboard'}>
      {overlay.kind === 'about' ? <><p>This is the first interactive design prototype for the mission experience. Requests execute a small, deterministic simulation in your browser.</p><ul className="mp-dialog-list"><li>Coaching hints are authored examples, not live AI responses.</li><li>No AWS calls or real credentials. Requests stay inside the synthetic sandbox.</li><li>Runs stay in memory in this tab. Reloading starts over.</li><li>The release will move outcome validation and saved evidence to the server. This preview is not tamper-resistant assessment.</li></ul><p>It is an Alexa+ experience simulation with no native Alexa integration. Source paraphrases and fictional mission content remain drafts for review.</p><button className="mp-primary" onClick={() => setOverlay(null)}>Back to the mission →</button></> : null}
      {overlay.kind === 'source' ? <SourceContent sourceId={overlay.sourceId}/> : null}
      {overlay.kind === 'storyboard' ? <Storyboard/> : null}
      {overlay.kind === 'reset' ? <><p>This clears only the mission preview’s controls and runs in this tab. Your earlier quiz sessions remain separate.</p><div className="mp-dialog-actions"><button className="mp-secondary" onClick={() => setOverlay(null)}>Keep my progress</button><button className="mp-primary" onClick={() => { changeScreen({ type: 'reset' }); setOverlay(null); }}>Start fresh →</button></div></> : null}
    </Dialog> : null}
  </div>;
}

function RequestIllustration() {
  return <div className="mp-request-illustration" aria-label="Reported bug: Bob can update Alice’s private note"><div className="mp-identity"><span className="mp-avatar">B</span><strong>Bob</strong><small>Valid write token</small></div><div className="mp-path"><span>PATCH /notes/42</span><i aria-hidden="true"/><strong>200 · edit allowed</strong></div><div className="mp-note"><span className="mp-note-corner"/><span>ALICE’S NOTE</span><i/><i/><i/><small>Private</small></div><span className="mp-report-label">TICKET SNAPSHOT · NOT YOUR PRACTICE HISTORY</span></div>;
}

function Evidence({ missionId, work }: { missionId: MissionId; work: Work }) {
  const suite = latestSuite(work);
  const passed = currentSuitePassed(work);
  const attempts = work.runs.filter(run => run.suite).length;
  const exploration = work.runs.length - attempts;
  const assistance = work.hints + work.comparisons;
  const label = !work.runs.length ? 'Not attempted' : passed ? assistance ? 'Completed with help' : 'Completed without hints' : 'Needs another pass';
  return <article className="mp-evidence"><div className="mp-ticket-top"><span className="mp-overline">{MISSIONS[missionId].type}</span><span aria-hidden="true">{passed ? '✓' : '↳'}</span></div><h2>{MISSIONS[missionId].name}</h2><span className={`mp-outcome ${passed ? 'is-pass' : 'is-pending'}`}>{label}</span><dl><div><dt>Last checked suite</dt><dd>{suite ? `${suite.results.filter(result => result.passed).length} / 6 cases` : 'Not checked'}</dd></div><div><dt>Verification attempts</dt><dd>{attempts}</dd></div><div><dt>Exploratory requests</dt><dd>{exploration}</dd></div><div><dt>Hints / comparisons</dt><dd>{work.hints} / {work.comparisons}</dd></div><div><dt>Source cards opened</dt><dd>{work.sources}</dd></div></dl><p>{missionId === 'noteshare' ? 'The private-note policy must protect each owner without blocking their own edits.' : 'The collaboration policy must admit workspace editors and keep viewers and outsiders out.'}</p>{suite && !passed && suite.results.every(result => result.passed) ? <p className="mp-warning-text">Your policy changed after the last successful check. Run it again to confirm the current version.</p> : null}</article>;
}

function NextStep({ state, onReturn }: { state: State; onReturn: (id: MissionId) => void }) {
  const target: MissionId = !currentSuitePassed(state.noteshare) && !state.teamboard.runs.length ? 'noteshare' : 'teamboard';
  const complete = currentSuitePassed(state.teamboard);
  return <div className="mp-next-step"><span className="mp-next-arrow" aria-hidden="true">↗</span><div><p className="mp-overline">A NEXT STEP FROM YOUR ACTUAL RUNS</p><h2>{complete ? 'You made the new rule work.' : `Return to ${MISSIONS[target].name}.`}</h2><p>{complete ? 'Look back at which permission changed between these two products. A later, fresh task would give stronger evidence than rerunning the same solution.' : !state[target].runs.length ? 'This mission has no recorded request runs yet. Open its ticket and investigate the first case.' : 'The current policy has not passed all six cases. Review the trace of an unmet requirement before changing another control.'}</p></div><button className="mp-primary" onClick={() => onReturn(target)}>{complete ? 'Review the workbench' : 'Continue practice'} →</button></div>;
}

function SourceContent({ sourceId }: { sourceId: SourceId }) {
  const source = SOURCE_CARDS.find(item => item.id === sourceId)!;
  return <><p className="mp-overline">DRAFT SOURCE CARD / API PERMISSIONS</p><h3 className="mp-source-title">{source.title}</h3><p>{source.text}</p><blockquote className="mp-source-note">{source.note}</blockquote><a className="mp-source-link" href={source.url} target="_blank" rel="noreferrer">Read {source.label} ↗</a><p className="mp-fine">Concise paraphrase · Preview content v0.1 · Source references reviewed September 23, 2026; owner content review pending.</p></>;
}

function Storyboard() {
  const frames = [
    ['01', 'A practical brief', 'Fix NoteShare’s permission boundary. The learner sees the intended business behavior before changing anything.', 'READ → DECIDE'],
    ['02', 'An observable failure', 'Bob’s valid token can update Alice’s private note. A real browser simulation returns a response and mutation outcome.', 'REQUEST → RESULT'],
    ['03', 'A useful comparison', 'A focused comparison holds token scope constant while changing ownership. The source is one click away.', 'EVIDENCE → HINT'],
    ['04', 'A verified repair', 'Changing the policy alters both permitted and rejected requests. All six scenarios include legitimate access.', 'CHANGE → CHECK'],
    ['05', 'A changed requirement', 'TeamBoard permits a collaborating editor to update another person’s board. The earlier owner-only rule is insufficient.', 'TRANSFER → APPLY'],
    ['06', 'An honest record', 'The recap shows actual outcomes, attempts and help. This prototype keeps them only in the open tab; server resume is later work.', 'RECORD → NEXT STEP'],
  ];
  return <div className="mp-storyboard">{frames.map(([number, title, text, caption]) => <article key={number}><span className="mp-frame-number">{number}</span><h3>{title}</h3><p>{text}</p><small>{caption}</small></article>)}</div>;
}

function Dialog({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog className={`mp-dialog ${wide ? 'mp-dialog-wide' : ''}`} ref={dialog} aria-labelledby={titleId} onCancel={onClose} onClose={onClose}><div className="mp-dialog-heading"><h2 id={titleId}>{title}</h2><button className="mp-icon-button" onClick={onClose} aria-label="Close dialog">×</button></div>{children}</dialog>;
}
