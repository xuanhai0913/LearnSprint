import { useState } from 'react';
import type { LabRun, LabScenario } from '@learnsprint/contracts';
import { formatNumber as number, formatTime } from './api';
import { deviceColors, EnergyPlot, PowerPlot } from './Visuals';

function Mark({ pass }: { pass: boolean }) {
  return <span className={`pl-mark ${pass ? 'pl-pass' : 'pl-fail'}`} role="img" aria-label={pass ? 'Met' : 'Not met'}>{pass ? '✓' : '!'}</span>;
}

export function RunResults({ run, scenario, stale }: { run: LabRun; scenario: LabScenario; stale: boolean }) {
  const result = run.outcome;
  const servicesMet = result.services.filter(service => service.satisfied).length;
  const failures = [!result.energyWithinLimit && 'energy budget', !result.powerWithinLimit && 'power limit', !result.servicesSatisfied && 'service needs'].filter(Boolean);
  return <section className={`pl-results ${stale ? 'pl-results-stale' : ''}`} aria-labelledby="pl-result-title">
    <div className="pl-section-heading">
      <div><p className="pl-kicker">03 / OBSERVE THE CONSEQUENCES</p><h2 id="pl-result-title">{stale ? 'Your last run.' : result.feasible ? 'The hub can stay open.' : 'A plan worth revisiting.'}</h2></div>
      <span className="pl-run-stamp">Run {String(run.number).padStart(2, '0')}<small>Plan v{run.artifact.revision} · {formatTime(run.createdAt)}</small></span>
    </div>
    <div className={`pl-verdict ${stale ? 'pl-verdict-stale' : result.feasible ? 'pl-verdict-pass' : 'pl-verdict-fail'}`}>
      <span aria-hidden="true">{stale ? '↻' : result.feasible ? '✓' : '↗'}</span>
      <div><strong>{stale ? 'The schedule has changed since this run.' : result.feasible ? 'All three constraints met in this modeled run.' : `Still to resolve: ${failures.join(' + ')}.`}</strong>
        <p>{stale ? 'These numbers belong to the saved run below. Run your edited plan to get its results.' : result.feasible ? 'You have a feasible schedule. Try changing the overlap between devices and compare what happens.' : 'Your schedule stays editable. Check the separate constraints to decide what to change.'}</p></div>
    </div>
    <div className="pl-metrics">
      <article><div className="pl-metric-label"><span>Energy requested</span><Mark pass={result.energyWithinLimit}/></div><p className="pl-metric-value">{number(result.energyWh)}<span>Wh</span></p><p>of {result.capacityWh} Wh available</p><div className="pl-meter"><i className={result.energyWithinLimit ? '' : 'pl-over'} style={{ width: `${Math.min(100, result.energyWh / result.capacityWh * 100)}%` }}/></div><small>{result.energyWithinLimit ? `${number(result.capacityWh - result.energyWh)} Wh within the budget` : `${number(result.energyWh - result.capacityWh)} Wh over the budget`}</small></article>
      <article><div className="pl-metric-label"><span>Peak demand</span><Mark pass={result.powerWithinLimit}/></div><p className="pl-metric-value">{number(result.peakPowerW)}<span>W</span></p><p>against a {result.maxPowerW} W limit</p><div className="pl-meter"><i className={result.powerWithinLimit ? '' : 'pl-over'} style={{ width: `${Math.min(100, result.peakPowerW / result.maxPowerW * 100)}%` }}/></div><small>{result.powerWithinLimit ? 'Every hour stays within the power limit' : 'At least one hour exceeds the power limit'}</small></article>
      <article><div className="pl-metric-label"><span>People’s needs</span><Mark pass={result.servicesSatisfied}/></div><p className="pl-metric-value">{servicesMet}<span>/ {scenario.devices.length}</span></p><p>required services met</p><ul className="pl-service-checks">{result.services.map(service => <li key={service.deviceId}><Mark pass={service.satisfied}/><span>{scenario.devices.find(device => device.id === service.deviceId)!.name}</span><strong>{number(service.scheduledMinutes / 60)}/{number(service.requiredMinutes / 60)} h</strong></li>)}</ul></article>
    </div>
    <div className="pl-plots">
      <figure><figcaption><strong>Power at each hour</strong><span>How much is on at once?</span></figcaption><PowerPlot run={run} scenario={scenario}/><div className="pl-chart-key">{scenario.devices.map(device => <span key={device.id}><i style={{ backgroundColor: deviceColors[device.kind] }}/>{device.name}</span>)}</div></figure>
      <figure><figcaption><strong>Energy across the afternoon</strong><span>How much does the whole plan request?</span></figcaption><EnergyPlot run={run} scenario={scenario}/><div className="pl-chart-key"><span><i className="pl-budget-key"/>Dashed line: available budget</span><span>Projected demand, not a measurement</span></div></figure>
    </div>
    <details className="pl-detail pl-numeric-table"><summary>Read the hour-by-hour numbers <span>Run {run.number} · exact schedule</span></summary>
      <div className="pl-table-scroll" role="region" aria-label="Hour-by-hour outcomes" tabIndex={0}><table><caption>Modeled outcomes of run {run.number}, plan version {run.artifact.revision}</caption><thead><tr><th scope="col">Hour</th><th scope="col">Devices on</th><th scope="col">Power</th><th scope="col">Energy so far</th><th scope="col">Budget balance</th></tr></thead><tbody>{result.slots.map(slot => {
        const fact = scenario.slots.find(item => item.id === slot.slotId)!;
        const balance = slot.remainingBudgetWattMinutes / 60;
        return <tr key={slot.slotId}><th scope="row">{fact.start}–{fact.end}</th><td>{scenario.devices.filter(device => run.artifact.schedule[device.id].includes(slot.slotId)).map(device => device.name).join(', ') || 'All off'}</td><td>{number(slot.powerW)} W{!slot.powerWithinLimit ? ' · over limit' : ''}</td><td>{number(slot.cumulativeWattMinutes / 60)} Wh</td><td>{number(Math.abs(balance))} Wh {balance < 0 ? 'short' : 'left'}</td></tr>;
      })}</tbody></table></div><p className="pl-small">A deficit means the requested plan cannot be supplied within this budget. It is not negative physical battery energy.</p>
    </details>
  </section>;
}

export function RunComparison({ runs, scenario }: { runs: LabRun[]; scenario: LabScenario }) {
  const [leftId, setLeftId] = useState(runs.at(-2)!.runId);
  const [rightId, setRightId] = useState(runs.at(-1)!.runId);
  const left = runs.find(run => run.runId === leftId)!;
  const right = runs.find(run => run.runId === rightId)!;
  const energyDelta = right.outcome.energyWh - left.outcome.energyWh;
  const powerDelta = right.outcome.peakPowerW - left.outcome.peakPowerW;
  const changes = scenario.devices.flatMap(device => {
    const hours = scenario.slots.filter(slot => left.artifact.schedule[device.id].includes(slot.id) !== right.artifact.schedule[device.id].includes(slot.id));
    return hours.length ? [{ device, text: hours.map(slot => `${slot.label} ${right.artifact.schedule[device.id].includes(slot.id) ? 'on' : 'off'}`).join(' · ') }] : [];
  });
  const delta = (value: number, unit: string) => value === 0 ? 'Unchanged' : `${value > 0 ? '+' : '−'}${number(Math.abs(value))} ${unit}`;
  return <section className="pl-comparison" aria-labelledby="pl-compare-title">
    <div className="pl-section-heading"><div><p className="pl-kicker">04 / NOTICE WHAT CHANGED</p><h2 id="pl-compare-title">Two runs. A clearer picture.</h2></div><span className="pl-small">Saved evidence</span></div>
    <div className="pl-compare-selects"><label>From<select value={leftId} onChange={event => setLeftId(event.target.value)}>{runs.map(run => <option value={run.runId} disabled={run.runId === rightId} key={run.runId}>Run {run.number} · plan v{run.artifact.revision}</option>)}</select></label><span aria-hidden="true">→</span><label>To<select value={rightId} onChange={event => setRightId(event.target.value)}>{runs.map(run => <option value={run.runId} disabled={run.runId === leftId} key={run.runId}>Run {run.number} · plan v{run.artifact.revision}</option>)}</select></label></div>
    <div className="pl-compare-stats"><div><span>Requested energy</span><strong>{number(left.outcome.energyWh)} → {number(right.outcome.energyWh)} <small>Wh</small></strong><p>{delta(energyDelta, 'Wh')}</p></div><div><span>Peak power</span><strong>{number(left.outcome.peakPowerW)} → {number(right.outcome.peakPowerW)} <small>W</small></strong><p>{delta(powerDelta, 'W')}</p></div><div><span>All constraints</span><strong className="pl-compare-verdict">{left.outcome.feasible ? 'Met' : 'Not met'} → {right.outcome.feasible ? 'Met' : 'Not met'}</strong><p>Energy + power + service needs</p></div></div>
    {changes.length ? <ul className="pl-changes">{changes.map(({ device, text }) => <li key={device.id}><strong>{device.name}</strong><span>{text}</span></li>)}</ul> : <p className="pl-small">No hours changed between these runs. The same schedule was evaluated again.</p>}
    {energyDelta === 0 && powerDelta !== 0 ? <p className="pl-compare-note">The energy stayed at <strong>{number(right.outcome.energyWh)} Wh</strong>, while peak demand {powerDelta < 0 ? 'fell' : 'rose'} by <strong>{number(Math.abs(powerDelta))} W</strong>. Total energy and simultaneous demand describe different constraints.</p> : null}
  </section>;
}
