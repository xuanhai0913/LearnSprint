import type { ItDecision, ItShift, ItWorkspace } from '@learnsprint/contracts';
const names: Record<string,string> = {vpn:'Remote access',access:'CRM access',print:'Dispatch labels',queue:'Team workload'};
const actions:Record<ItDecision['action'],string> = {investigate:'Verify / investigate',workaround:'Use approved workaround',escalate:'Page incident owner'};
function handoffLines(title:string,h:NonNullable<ItShift['handoff']>):string[]{
  return [title,`Saved: ${h.at}`,'', 'HANDOFF NOTE',h.note,'','RECORDED DECISIONS',
    ...Object.entries(h.decisions).map(([id,d])=>`${names[id]??id}: ${d.priority.toUpperCase()} | ${d.assignee} | ${actions[d.action]}`),
    '',`UNRESOLVED OBSERVATIONS: ${h.review.issues.length}`,
    ...h.review.issues.map(x=>`- ${names[x.ticketId]??x.ticketId}: ${x.message}`),
    '', 'RECORDED WORKLOAD',...Object.entries(h.review.workload).map(([team,units])=>`${team}: ${units} effort units`),''];
}
export function downloadItReport(w:ItWorkspace){
  if(!w.shift.handoff)return;
  const lines=['LEARNSPRINT / IT SUPPORT PRACTICE',`Scenario ${w.shift.version} | ${w.shift.variant}`,
    'Fictional authored simulation. No real tickets were changed. This report is not a certificate or a measure of employability.','',
    ...handoffLines('CURRENT HANDOFF',w.shift.handoff)];
  if(w.sourceHandoff)lines.push(...handoffLines('EARLIER HANDOFF / DIFFERENT CONDITIONS',w.sourceHandoff),'Different scenario facts mean issue counts are not a learning score.','');
  lines.push('DECISION HISTORY',...w.shift.history.map(x=>`${x.at} — ${x.message}`));
  const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=`learnsprint-it-${w.shift.id.slice(0,8)}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
