import type { LabHome, LabSchedule, LabWorkspace } from '@learnsprint/contracts';
import { api } from '../api';

let homeRequest: Promise<LabHome> | null = null;

// A single bootstrap request also avoids issuing two owner cookies in StrictMode.
export function loadLabHome(): Promise<LabHome> {
  if (!homeRequest) homeRequest = api<LabHome>('/lab/home').finally(() => { homeRequest = null; });
  return homeRequest;
}

export function sameSchedule(a: LabSchedule, b: LabSchedule): boolean {
  return Object.keys(a).length === Object.keys(b).length && Object.keys(a).every(id =>
    Array.isArray(b[id]) && a[id].length === b[id].length && a[id].every(slot => b[id].includes(slot)));
}

const draftKey = (id: string) => `learnsprint:powerlab:draft:v1:${id}`;

export function storeDraft(workspace: LabWorkspace, schedule: LabSchedule): boolean {
  try {
    if (sameSchedule(workspace.session.artifact.schedule, schedule)) sessionStorage.removeItem(draftKey(workspace.session.sessionId));
    else sessionStorage.setItem(draftKey(workspace.session.sessionId), JSON.stringify({ baseHash: workspace.session.artifact.hash, schedule }));
    return true;
  } catch { return false; }
}

export function clearDraft(id: string): void {
  try { sessionStorage.removeItem(draftKey(id)); } catch { /* The server copy remains available. */ }
}

export function restoreDraft(workspace: LabWorkspace): { schedule: LabSchedule; conflict: boolean } | null {
  try {
    const stored = JSON.parse(sessionStorage.getItem(draftKey(workspace.session.sessionId)) ?? 'null') as { baseHash?: unknown; schedule?: unknown } | null;
    if (!stored || typeof stored.baseHash !== 'string' || !stored.schedule || typeof stored.schedule !== 'object' || Array.isArray(stored.schedule)) return null;
    const scenario = workspace.pack.scenarios.find(item => item.id === workspace.session.scenarioId)!;
    const value = stored.schedule as Record<string, unknown>;
    if (Object.keys(value).length !== scenario.devices.length) return null;
    const schedule: LabSchedule = {};
    for (const device of scenario.devices) {
      const slots = value[device.id];
      if (!Array.isArray(slots) || slots.some(slot => typeof slot !== 'string' || !scenario.slots.some(item => item.id === slot)) || new Set(slots).size !== slots.length) return null;
      schedule[device.id] = scenario.slots.filter(slot => slots.includes(slot.id)).map(slot => slot.id);
    }
    if (sameSchedule(schedule, workspace.session.artifact.schedule)) { clearDraft(workspace.session.sessionId); return null; }
    return { schedule, conflict: stored.baseHash !== workspace.session.artifact.hash };
  } catch { return null; }
}

const numberFormatter = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });
const timeFormatter = new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' });

export function formatNumber(value: number): string { return numberFormatter.format(value); }

export function formatTime(value: string): string {
  return timeFormatter.format(new Date(value));
}
