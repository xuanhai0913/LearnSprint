import { useId } from 'react';
import type { LabDeviceKind, LabRun, LabScenario, LabSchedule } from '@learnsprint/contracts';
import { formatNumber as number } from './api';

export const deviceColors: Record<LabDeviceKind, string> = {
  lamp: '#a87927', router: '#377a5a', fan: '#537d9e', laptop: '#b06651',
};

export function DeviceIcon({ kind }: { kind: LabDeviceKind }) {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'lamp' ? <><path d="M7 27h18M16 27V16l-7-5 8-7 7 6-8 7"/><path d="m20 14 4 4M25 10l3 1"/><circle cx="16" cy="17" r="2"/></> : null}
    {kind === 'router' ? <><rect x="5" y="19" width="22" height="8" rx="2"/><path d="M8 19v-6m16 6v-6M10 8a9 9 0 0 1 12 0M13 11a5 5 0 0 1 6 0"/><circle cx="10" cy="23" r=".7"/><path d="M20 23h3"/></> : null}
    {kind === 'fan' ? <><circle cx="16" cy="12" r="9"/><circle cx="16" cy="12" r="2"/><path d="M16 10c-5-6 2-8 3-4l-1 4M18 13c8-2 6 5 2 4l-3-3M14 13c-2 8-7 3-4 0l3-1M16 21v6m-6 1h12"/></> : null}
    {kind === 'laptop' ? <><rect x="7" y="5" width="18" height="16" rx="2"/><path d="M7 21 3 27h26l-4-6M12 24h8m-3-15-3 5h4l-3 4"/></> : null}
  </svg>;
}

/** Original SVG illustration; its device states follow the selected draft hour. */
export function StudyHub({ scenario, schedule, hour, spotlight }: { scenario: LabScenario; schedule: LabSchedule; hour: string; spotlight?: string | null }) {
  const titleId = useId();
  const slot = scenario.slots.find(item => item.id === hour)!;
  const on = (id: string) => schedule[id]?.includes(hour);
  const opacity = (id: string) => spotlight && spotlight !== id ? .35 : 1;
  return <svg className="pl-hub" viewBox="0 0 610 355" role="img" aria-labelledby={titleId}>
    <title id={titleId}>Study hub schedule preview, {slot.label}. {scenario.devices.filter(device => on(device.id)).map(device => device.name).join(', ') || 'No devices'} scheduled on.</title>
    <defs>
      <pattern id={`${titleId}-grid`} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#d5dccd" strokeWidth=".6"/></pattern>
      <linearGradient id={`${titleId}-beam`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ead18c" stopOpacity=".6"/><stop offset="1" stopColor="#ead18c" stopOpacity=".08"/></linearGradient>
    </defs>
    <rect x="10" y="8" width="590" height="330" rx="100" fill="#e7ecdf"/>
    <rect x="10" y="8" width="590" height="330" rx="100" fill={`url(#${titleId}-grid)`}/>
    <path d="M34 287h538" stroke="#bcc9b5"/>
    <rect x="355" y="37" width="164" height="143" rx="76" fill="#f6f3ec" stroke="#becbb7" strokeWidth="2"/>
    <path d="M437 37v143m-81-64h162" stroke="#becbb7" strokeWidth="2"/>
    <circle cx="471" cy="77" r="18" fill="#d8b775"/>
    <path d="M357 149c35-31 72-12 93-27s50-1 67-16v74H356Z" fill="#ccd9c0"/>
    <path d="M437 118v62" stroke="#becbb7" strokeWidth="2"/>
    <circle cx="288" cy="75" r="27" fill="#fffefa" stroke="#9dae98" strokeWidth="1.5"/>
    <path d="M288 59v17l11 6" fill="none" stroke="#52645e" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="288" cy="75" r="2.5" fill="#52645e"/>
    <path d="M92 231h435l-13 17H101Z" fill="#c7af87" stroke="#837b65" strokeWidth="1.5"/>
    <path d="m114 248-12 78m385-78 12 78" stroke="#8f977f" strokeWidth="7"/>
    <path d="M118 277h365" stroke="#b2bda8" strokeWidth="3"/>
    <g opacity={opacity('lamp')} className={spotlight === 'lamp' ? 'pl-scene-focus' : ''}>
      {on('lamp') ? <path d="m172 141-72 89h145l-42-87Z" fill={`url(#${titleId}-beam)`}/> : null}
      <path d="M137 229h48m-24-2 14-55-27-34 36-26" fill="none" stroke="#63775f" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="175" cy="172" r="5" fill="#fffefa" stroke="#63775f" strokeWidth="2"/>
      <path d="m179 101 20 10 14 33-48-9Z" fill={on('lamp') ? '#d7b768' : '#adb6a0'} stroke="#63775f" strokeWidth="1.5"/>
      <path d="m165 135 48 9" stroke={on('lamp') ? '#f2d787' : '#63775f'} strokeWidth="5" strokeLinecap="round"/>
      <text x="133" y="94" className="pl-scene-label">01 / LIGHT</text>
    </g>
    <g opacity={opacity('laptop')}>
      <path d="M227 160h101a5 5 0 0 1 5 5v62H222v-62a5 5 0 0 1 5-5Z" fill="#536d62"/>
      <rect x="228" y="166" width="99" height="54" rx="2" fill={on('laptop') ? '#dce7d5' : '#c0cbb9'}/>
      <path d="m222 227-14 9h139l-14-9" fill="#b1bfb0" stroke="#536d62" strokeWidth="1.5"/>
      <path d="M239 181h48m-48 8h28m-28 16h21" stroke="#8ca88c" strokeWidth="3" strokeLinecap="round"/>
      <path d="m307 179-12 16h9l-7 15 17-20h-10l6-11Z" fill={on('laptop') ? '#ac7551' : '#819480'}/>
      <text x="229" y="150" className="pl-scene-label">04 / CHARGE</text>
    </g>
    <g opacity={opacity('fan')}>
      <path d="M434 227h37m-18 0v-37" stroke="#728d99" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="453" cy="157" r="34" fill="#eff0e5" stroke="#728d99" strokeWidth="2"/>
      <circle cx="453" cy="157" r="28" fill="none" stroke="#becbc9"/>
      <g fill={on('fan') ? '#8faebe' : '#c3ceca'} transform={on('fan') ? 'rotate(20 453 157)' : undefined}>
        <path d="M449 153c-24-13-10-37 2-21 4 6 5 12 2 20Z"/>
        <path d="M458 154c24-13 37 12 17 14-8 1-15-3-18-7Z"/>
        <path d="M452 163c0 27-28 24-20 7 4-7 10-9 18-11Z"/>
      </g>
      <circle cx="453" cy="157" r="6" fill="#fffefa" stroke="#728d99" strokeWidth="2"/>
      <text x="434" y="107" className="pl-scene-label">03 / COOL</text>
    </g>
    <g opacity={opacity('router')}>
      <path d="M370 207v-22m35 22v-22" stroke="#567960" strokeWidth="3" strokeLinecap="round"/>
      <rect x="360" y="207" width="55" height="24" rx="5" fill="#a9bda2" stroke="#567960" strokeWidth="1.5"/>
      <circle cx="370" cy="221" r="2" fill={on('router') ? '#24593f' : '#cad4c2'}/>
      <path d="M390 221h14" stroke="#567960" strokeWidth="2" strokeLinecap="round"/>
      {on('router') ? <g fill="none" stroke="#6f9c74" strokeWidth="2" strokeLinecap="round"><path d="M374 176q13-12 26 0m-21 6q8-7 16 0"/><circle cx="387" cy="188" r="1"/></g> : null}
      <text x="363" y="251" className="pl-scene-label">02 / CONNECT</text>
    </g>
    <path d="M319 237v59q0 10-12 10h-99" fill="none" stroke="#a4b298" strokeWidth="2"/>
    <rect x="137" y="272" width="80" height="61" rx="8" fill="#325d47"/>
    <path d="M160 272v-5h34v5" fill="none" stroke="#325d47" strokeWidth="4"/>
    <rect x="148" y="284" width="27" height="17" rx="3" fill="#d0dcb8"/>
    <path d="M182 289h21m-21 6h16" stroke="#8bab86" strokeWidth="2"/>
    <text x="149" y="320" fill="#e8efdd" fontSize="10" fontFamily="monospace">{scenario.capacityWh} Wh</text>
    <circle cx="527" cy="229" r="18" fill="#b4c69e"/>
    <path d="m519 221 9 14m7-13-7 13v12" stroke="#749363" strokeWidth="1.5" fill="none"/>
    <path d="M514 244h28l-5 19h-18Z" fill="#c1916b"/>
  </svg>;
}

export function PowerPlot({ run, scenario }: { run: LabRun; scenario: LabScenario }) {
  const max = Math.max(scenario.maxPowerW, run.outcome.peakPowerW) * 1.25;
  const y = (value: number) => 160 - value / max * 136;
  const step = 304 / scenario.slots.length;
  return <svg className="pl-chart" viewBox="0 0 360 200" role="img" aria-label={`Requested power by hour, peak ${number(run.outcome.peakPowerW)} watts; limit ${scenario.maxPowerW} watts. Values are also in the table below.`}>
    {[0, .5, 1].map(tick => <path key={tick} d={`M36 ${y(max * tick)}H346`} stroke="#dce0d5" strokeWidth="1"/>)}
    {scenario.slots.map((slot, index) => {
      let stacked = 0;
      return <g key={slot.id}>
        {scenario.devices.map(device => {
          if (!run.artifact.schedule[device.id].includes(slot.id)) return null;
          const from = stacked; stacked += device.watts;
          return <rect key={device.id} x={44 + index * step} y={y(stacked)} width={step - 22} height={y(from) - y(stacked)} fill={deviceColors[device.kind]}/>;
        })}
        <text x={44 + index * step + (step - 22) / 2} y={y(run.outcome.slots[index].powerW) - 7} textAnchor="middle" className="pl-chart-number">{run.outcome.slots[index].powerW}</text>
        <text x={44 + index * step + (step - 22) / 2} y="182" textAnchor="middle" className="pl-chart-label">{slot.start}</text>
      </g>;
    })}
    <path d={`M36 ${y(scenario.maxPowerW)}H346`} stroke="#79501c" strokeDasharray="5 4"/>
    <text x="28" y={y(scenario.maxPowerW) + 4} textAnchor="end" className="pl-chart-label">{scenario.maxPowerW}</text>
    <text x="27" y="164" textAnchor="end" className="pl-chart-label">0</text>
    <text x="15" y="13" className="pl-chart-label">W</text>
  </svg>;
}

export function EnergyPlot({ run, scenario }: { run: LabRun; scenario: LabScenario }) {
  const heightMax = Math.max(scenario.capacityWh, run.outcome.energyWh) * 1.2;
  const y = (value: number) => 160 - value / heightMax * 136;
  const points = [[39, y(0)], ...run.outcome.slots.map((slot, index) => [39 + (index + 1) / scenario.slots.length * 296, y(slot.cumulativeWattMinutes / 60)])];
  const line = points.map(point => point.join(',')).join(' ');
  return <svg className="pl-chart" viewBox="0 0 360 200" role="img" aria-label={`Cumulative requested energy ends at ${number(run.outcome.energyWh)} watt-hours; budget ${scenario.capacityWh} watt-hours. Values are also in the table below.`}>
    {[0, .5, 1].map(tick => <path key={tick} d={`M39 ${y(heightMax * tick)}H341`} stroke="#dce0d5"/>)}
    <polygon points={`${line} 335,160 39,160`} fill={run.outcome.energyWithinLimit ? '#215c4310' : '#a3342a0d'}/>
    <polyline points={line} fill="none" stroke={run.outcome.energyWithinLimit ? '#215c43' : '#a3342a'} strokeWidth="2.5" strokeLinejoin="round"/>
    {points.map(([x, yValue], index) => <circle key={index} cx={x} cy={yValue} r="3.5" fill="#fffefa" stroke={run.outcome.energyWithinLimit ? '#215c43' : '#a3342a'} strokeWidth="2"/>)}
    <path d={`M39 ${y(scenario.capacityWh)}H341`} stroke="#79501c" strokeDasharray="5 4"/>
    <text x="32" y={y(scenario.capacityWh) + 4} textAnchor="end" className="pl-chart-label">{scenario.capacityWh}</text>
    <text x="32" y="164" textAnchor="end" className="pl-chart-label">0</text>
    <text x="12" y="13" className="pl-chart-label">Wh</text>
    <text x="39" y="182" textAnchor="middle" className="pl-chart-label">{scenario.slots[0].start}</text>
    {scenario.slots.map((slot, index) => <text key={slot.id} x={39 + (index + 1) / scenario.slots.length * 296} y="182" textAnchor="middle" className="pl-chart-label">{slot.end}</text>)}
  </svg>;
}
