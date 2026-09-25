/** PowerLab's public wire contracts. Numeric results are produced by the server. */
export type LabSchedule = Record<string, string[]>;
export type LabDeviceKind = 'lamp' | 'router' | 'fan' | 'laptop';

export interface LabDevice {
  id: string;
  name: string;
  kind: LabDeviceKind;
  watts: number;
  requiredMinutes: number;
  service: 'every_slot' | 'minimum_duration';
  purpose: string;
}

export interface LabSlot {
  id: string;
  label: string;
  start: string;
  end: string;
  minutes: number;
}

export interface LabScenario {
  id: string;
  title: string;
  brief: string;
  capacityWh: number;
  maxPowerW: number;
  slots: LabSlot[];
  devices: LabDevice[];
  initialSchedule: LabSchedule;
}

export interface LabPack {
  id: string;
  version: string;
  oracleVersion: string;
  title: string;
  objectives: { id: string; text: string }[];
  sources: { id: string; title: string; url: string; note: string }[];
  assumptions: string[];
  scenarios: LabScenario[];
}

export interface LabArtifact {
  revision: number;
  hash: string;
  schedule: LabSchedule;
}

export interface LabSession {
  sessionId: string;
  packId: string;
  packVersion: string;
  scenarioId: string;
  phase: 'practice' | 'paused';
  revision: number;
  artifact: LabArtifact;
  runCount: number;
  lastRunId: string | null;
  /** Absent on historical sessions; absence does not certify independent work. */
  assistance?: { requestedAt: string; runId: string; interventionId: string; provider: 'authored'; activity: LabIntervention }[];
  createdAt: string;
  updatedAt: string;
}

export interface LabOutcome {
  energyWattMinutes: number;
  energyWh: number;
  peakPowerW: number;
  capacityWh: number;
  maxPowerW: number;
  energyWithinLimit: boolean;
  powerWithinLimit: boolean;
  servicesSatisfied: boolean;
  feasible: boolean;
  slots: {
    slotId: string;
    minutes: number;
    powerW: number;
    energyWattMinutes: number;
    cumulativeWattMinutes: number;
    remainingBudgetWattMinutes: number;
    powerWithinLimit: boolean;
  }[];
  services: {
    deviceId: string;
    scheduledMinutes: number;
    requiredMinutes: number;
    satisfied: boolean;
  }[];
}

export interface LabRun {
  runId: string;
  sessionId: string;
  number: number;
  packId: string;
  packVersion: string;
  scenarioId: string;
  engineVersion: string;
  oracleVersion: string;
  artifact: LabArtifact;
  outcome: LabOutcome;
  createdAt: string;
  assistanceCount?: number;
}

export type LabOperation = 'create' | 'save_plan' | 'run_plan' | 'pause' | 'resume' | 'request_help';

export interface LabIntervention {
  id: 'I01' | 'I02' | 'I03' | 'I04' | 'I05';
  runId: string;
  title: string;
  activity: string;
  provider: 'authored';
}

export interface LabActionEvent {
  eventId: string;
  requestId: string;
  sessionId: string;
  operation: LabOperation;
  origin: 'manual' | 'voice';
  voiceSessionId?: string;
  fromRevision: number;
  toRevision: number;
  artifactRevision: number;
  changes: { deviceId: string; slotId: string; on: boolean }[];
  runId: string | null;
  createdAt: string;
}

export interface LabReceipt {
  requestId: string;
  sessionId: string;
  operation: LabOperation;
  revision: number;
  artifactRevision: number;
  eventId: string | null;
  runId: string | null;
  committedAt: string;
}

export interface LabWorkspace {
  pack: LabPack;
  session: LabSession;
  /** Chronological, immutable runs belonging to this practice. */
  runs: LabRun[];
  recentActions: LabActionEvent[];
  intervention?: LabIntervention;
}

export interface LabHome {
  pack: LabPack;
  sessions: LabSession[];
}

export interface LabMutationResponse {
  /** The original commit receipt, including on a retry. */
  receipt: LabReceipt;
  /** Current state; may be newer than the receipt after an idempotent retry. */
  workspace: LabWorkspace;
  replayed: boolean;
}

export interface LabMutation {
  requestId: string;
  expectedRevision: number;
}

export type LabCommand = LabMutation & (
  | { type: 'save_plan'; schedule: LabSchedule }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'request_help'; runId: string }
);

export interface LabActionContext {
  origin: 'manual' | 'voice';
  voiceSessionId?: string;
}

export interface LabVoiceStatus {
  available: boolean;
  reason: string;
  provider: 'amazon-nova-2-sonic';
  language: 'en';
  maxDurationSeconds: number;
  remainingSessions: number;
}

export interface LabVoiceTicket {
  ticket: string;
  expiresAt: string;
  maxDurationSeconds: number;
}

export type LabVoiceEvent =
  | { type: 'ready'; voiceSessionId: string; maxDurationSeconds: number }
  | { type: 'transcript'; text: string; role: 'user' | 'assistant' }
  | { type: 'receipt'; response: LabMutationResponse; summary: string; canUndo: boolean }
  | { type: 'notice'; message: string }
  | { type: 'interrupted' }
  | { type: 'error'; code: string; message: string }
  | { type: 'closed'; reason: string };
