import type { ItAssignee, ItDecision, ItShift, ItTicket, ItWorkspace } from '@learnsprint/contracts';

// Version 1.0.0 is immutable. Authored workplace assumptions, not an industry SLA standard.
const tickets: ItTicket[] = [
  { id: 'vpn', title: 'Remote access keeps dropping', requester: 'Customer support team', summary: 'Several colleagues report unstable VPN access.', effort: 2, skill: 'network', evidence: 'Three remote agents are affected. They can use the approved browser help desk while network investigates. No company-wide outage is reported.', source: 'Network monitoring + support lead, 09:00' },
  { id: 'access', title: 'New colleague cannot open the CRM', requester: 'Sales onboarding', summary: 'An account access request arrived this morning.', effort: 1, skill: 'identity', evidence: 'One new employee starts customer work tomorrow. Manager approval exists, but identity verification is still required. Never request a password or bypass MFA.', source: 'Onboarding request + identity runbook, 09:00' },
  { id: 'print', title: 'Dispatch labels will not print', requester: 'Dispatch desk', summary: 'The label station reports a printer error.', effort: 1, skill: 'service-desk', evidence: 'One workstation is affected. An approved backup printer is available; dispatch can continue after it is selected. The next collection is at 11:00.', source: 'Dispatch supervisor + device inventory, 09:00' },
];
export const capacities: Record<ItAssignee, number> = { 'service-desk': 2, network: 2, identity: 1 };
export function itTickets(s: ItShift): ItTicket[] {
  return tickets.map(t => {
    if (s.variant === 'replay' && t.id === 'print') return { ...t, evidence: 'The shared label service is unavailable at every dispatch station. No backup is available and collection is blocked. The network team owns the shared service.', skill: 'network', source: 'Dispatch incident + service ownership register, 09:00' };
    if (s.variant === 'replay' && t.id === 'vpn') return { ...t, evidence: 'One remote agent is affected and can use the approved browser help desk. Network monitoring is normal.', source: 'Network monitoring + support lead, 09:00', effort: 1 };
    if (s.world === 2 && t.id === 'vpn' && s.variant === 'first') return { ...t, evidence: 'VPN is now unavailable to the whole remote support team. The browser workaround has also failed. Customer support is blocked; the network incident owner must be paged.', source: 'Network incident update, 09:20' };
    if (s.world === 2 && t.id === 'access' && s.variant === 'replay') return { ...t, evidence: 'The employee now needs access for a customer session today. Identity has confirmed the employee, but the role grant is still pending. Do not bypass approved access controls.', source: 'Manager update + identity verification, 09:20' };
    return { ...t };
  });
}
export function workspace(s: ItShift): ItWorkspace {
  return { shift: s, tickets: itTickets(s).map(t => s.facts.includes(`${s.world}:${t.id}`) ? t : { ...t, evidence: '', source: '' }) };
}
export function expected(s: ItShift, id: string): ItDecision {
  if (id === 'vpn') return { priority: s.variant === 'first' ? (s.world === 2 ? 'p1' : 'p2') : 'p3', assignee: 'network', action: s.variant === 'first' && s.world === 2 ? 'escalate' : 'workaround' };
  if (id === 'access') return { priority: s.variant === 'replay' && s.world === 2 ? 'p2' : 'p3', assignee: 'identity', action: 'investigate' };
  return { priority: s.variant === 'replay' ? 'p1' : 'p2', assignee: s.variant === 'replay' ? 'network' : 'service-desk', action: s.variant === 'replay' ? 'escalate' : 'workaround' };
}
export function review(s: ItShift) {
  const issues: {ticketId: string; message: string}[] = [];
  const workload: Record<ItAssignee,number> = { 'service-desk': 0, network: 0, identity: 0 };
  for (const t of itTickets(s)) {
    if (!s.facts.includes(`${s.world}:${t.id}`)) issues.push({ ticketId: t.id, message: 'Read the current evidence before committing a response.' });
    const d = s.decisions[t.id];
    if (!d) { issues.push({ticketId:t.id,message:'Choose a priority, owner and next action.'}); continue; }
    const e = expected(s,t.id);
    if (d.priority !== e.priority) issues.push({ticketId:t.id,message:'Priority does not match the current impact and workaround policy.'});
    if (d.assignee !== e.assignee) issues.push({ticketId:t.id,message:'This owner does not have the required service responsibility.'});
    if (d.action !== e.action) issues.push({ticketId:t.id,message:'The next action does not fit the confirmed workaround or escalation facts.'});
    workload[d.assignee] += t.effort;
  }
  for (const owner of Object.keys(capacities) as ItAssignee[]) if (workload[owner] > capacities[owner]) issues.push({ticketId:'queue',message:`${owner} has ${workload[owner]} effort units against ${capacities[owner]} available. Record the queue risk in your handoff; escalation does not create capacity.`});
  return { revision: s.revision, world: s.world, issues, workload };
}
