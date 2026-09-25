import type { CareerHome, CareerPlan, CareerWorkspace } from '@learnsprint/contracts';
import { api } from '../api';
export type PlanDraft = Record<string, Record<string, string>>;
let home: Promise<CareerHome> | null = null;
export function loadCareerHome(): Promise<CareerHome> {
  return home ??= api<CareerHome>('/career/home').finally(() => { home = null; });
}
export function toDraft(plan: CareerPlan): PlanDraft {
  return Object.fromEntries(Object.entries(plan).map(([id, row]) => [id, Object.fromEntries(Object.entries(row).map(([d, n]) => [d, String(n)]))]));
}
export function parseDraft(work: CareerWorkspace, draft: PlanDraft): CareerPlan | null {
  const plan: CareerPlan = {};
  for (const o of work.brief.orders) {
    plan[o.id] = {};
    for (const d of work.brief.departures) {
      const raw = draft[o.id]?.[d.id];
      if (typeof raw !== 'string' || !/^\d{1,5}$/.test(raw) || Number(raw) > o.quantity) return null;
      plan[o.id][d.id] = Number(raw);
    }
  }
  return plan;
}
const key = (id: string) => `learnsprint:career:draft:v1:${id}`;
export function samePlan(a: CareerPlan, b: CareerPlan): boolean { return JSON.stringify(a) === JSON.stringify(b); }
export function storeCareerDraft(work: CareerWorkspace, draft: PlanDraft): boolean {
  try {
    const plan = parseDraft(work, draft);
    if (plan && samePlan(plan, work.session.plan)) sessionStorage.removeItem(key(work.session.id));
    else sessionStorage.setItem(key(work.session.id), JSON.stringify({ baseHash: work.session.planHash, draft }));
    return true;
  } catch { return false; }
}
export function clearCareerDraft(id: string): void { try { sessionStorage.removeItem(key(id)); } catch { /* Saved server state remains authoritative. */ } }
export function restoreCareerDraft(work: CareerWorkspace): { draft: PlanDraft; conflict: boolean } | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(key(work.session.id)) ?? 'null') as { baseHash?: unknown; draft?: unknown } | null;
    if (!value || typeof value.baseHash !== 'string' || !value.draft || typeof value.draft !== 'object' || Array.isArray(value.draft)) return null;
    const raw = value.draft as PlanDraft, draft: PlanDraft = {};
    for (const o of work.brief.orders) {
      draft[o.id] = {};
      for (const d of work.brief.departures) {
        if (typeof raw[o.id]?.[d.id] !== 'string' || raw[o.id][d.id].length > 5) return null;
        draft[o.id][d.id] = raw[o.id][d.id];
      }
    }
    const plan = parseDraft(work, draft);
    if (plan && samePlan(plan, work.session.plan)) { clearCareerDraft(work.session.id); return null; }
    return { draft, conflict: value.baseHash !== work.session.planHash };
  } catch { return null; }
}
/** Simulated minutes since midnight on day one, independent of the real timezone. */
export function shiftTime(minute: number): string {
  const day = Math.floor(minute / 1440) + 1, time = minute % 1440;
  return `${day === 1 ? 'Today' : `Day ${day}`} ${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`;
}
