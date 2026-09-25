import type { LabOutcome, LabScenario, LabSchedule } from '@learnsprint/contracts';

export const ENGINE_VERSION = 'powerlab-engine-0.1.0';

export class InvalidSchedule extends Error {}

/** Validate the complete artifact, then put every device/slot in pack order. */
export function normalizeSchedule(scenario: LabScenario, value: unknown): LabSchedule {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new InvalidSchedule('A complete device schedule is required.');
  }
  const input = value as Record<string, unknown>;
  const deviceIds = scenario.devices.map(device => device.id);
  const slotIds = scenario.slots.map(slot => slot.id);
  if (Object.keys(input).length !== deviceIds.length || Object.keys(input).some(id => !deviceIds.includes(id))) {
    throw new InvalidSchedule('The schedule must contain exactly the devices in this lesson.');
  }
  const schedule: LabSchedule = {};
  for (const id of deviceIds) {
    const slots = input[id];
    if (!Array.isArray(slots) || slots.some(slot => typeof slot !== 'string' || !slotIds.includes(slot)) || new Set(slots).size !== slots.length) {
      throw new InvalidSchedule('Each device needs a list of unique, supported hours.');
    }
    schedule[id] = slotIds.filter(slot => slots.includes(slot));
  }
  return schedule;
}

/** Pure arithmetic over versioned, validated lesson facts. No answer fixtures or AI. */
export function evaluateSchedule(scenario: LabScenario, input: LabSchedule): LabOutcome {
  const schedule = normalizeSchedule(scenario, input);
  let cumulativeWattMinutes = 0;
  const slots = scenario.slots.map(slot => {
    const powerW = scenario.devices.reduce((sum, device) => sum + (schedule[device.id].includes(slot.id) ? device.watts : 0), 0);
    const energyWattMinutes = powerW * slot.minutes;
    cumulativeWattMinutes += energyWattMinutes;
    return {
      slotId: slot.id,
      minutes: slot.minutes,
      powerW,
      energyWattMinutes,
      cumulativeWattMinutes,
      remainingBudgetWattMinutes: scenario.capacityWh * 60 - cumulativeWattMinutes,
      powerWithinLimit: powerW <= scenario.maxPowerW,
    };
  });
  const services = scenario.devices.map(device => {
    const scheduledMinutes = scenario.slots.reduce((sum, slot) => sum + (schedule[device.id].includes(slot.id) ? slot.minutes : 0), 0);
    return {
      deviceId: device.id,
      scheduledMinutes,
      requiredMinutes: device.requiredMinutes,
      satisfied: device.service === 'every_slot'
        ? scenario.slots.every(slot => schedule[device.id].includes(slot.id))
        : scheduledMinutes >= device.requiredMinutes,
    };
  });
  const energyWithinLimit = cumulativeWattMinutes <= scenario.capacityWh * 60;
  const powerWithinLimit = slots.every(slot => slot.powerWithinLimit);
  const servicesSatisfied = services.every(service => service.satisfied);
  return {
    energyWattMinutes: cumulativeWattMinutes,
    energyWh: cumulativeWattMinutes / 60,
    peakPowerW: Math.max(0, ...slots.map(slot => slot.powerW)),
    capacityWh: scenario.capacityWh,
    maxPowerW: scenario.maxPowerW,
    energyWithinLimit,
    powerWithinLimit,
    servicesSatisfied,
    feasible: energyWithinLimit && powerWithinLimit && servicesSatisfied,
    slots,
    services,
  };
}
