import type { LabIntervention, LabRun } from '@learnsprint/contracts';

/** Original authored fallback. No generated advice or hidden reference schedules. */
export function interventionFor(run: LabRun): LabIntervention {
  const common = { runId: run.runId, provider: 'authored' as const };
  if (!run.outcome.servicesSatisfied) return { ...common, id: 'I03', title: 'Keep the people in the plan', activity: 'Look at the unmet service in this run. Compare its scheduled hours with the requirement in the brief. Choose one hour to restore, run again, and inspect both resource limits.' };
  if (!run.outcome.powerWithinLimit) return { ...common, id: 'I02', title: 'Same time on. Different overlap.', activity: 'Find an hour above the power limit. Move one optional device hour to another slot without changing its total runtime. Before running again, predict whether total energy, peak power, or both will change.' };
  if (!run.outcome.energyWithinLimit) return { ...common, id: 'I01', title: 'Follow one device through time', activity: 'Choose a device with more scheduled hours than its service requires. Compare its watt rating with the energy for one hour. Remove one optional hour, run again, and compare the change in energy with the change in peak power.' };
  return { ...common, id: 'I05', title: 'A working plan. Another question.', activity: 'This run meets the modeled constraints. Keep every device’s total runtime the same and try a different arrangement. Compare energy and peak power across the two runs. A working plan alone does not establish mastery.' };
}
