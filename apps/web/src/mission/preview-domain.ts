/** Design-preview logic only. The release oracle and persistence belong on the server. */
export type MissionId = 'noteshare' | 'teamboard';
export type ResourceRule = 'none' | 'owner' | 'workspace_editor';
export type Policy = { identityStatus: 401 | 403; requireWriteScope: boolean; resourceRule: ResourceRule };
export type Case = {
  id: string; title: string; detail: string; actor: string; owner: string;
  token: 'missing' | 'expired' | 'read' | 'write'; role: 'editor' | 'viewer' | 'outsider';
  resource: string; expected: 200 | 401 | 403;
};
export type TraceStep = { name: string; state: 'passed' | 'blocked' | 'skipped'; detail: string };
export type Result = { caseId: string; status: 200 | 401 | 403; mutated: boolean; passed: boolean; trace: TraceStep[] };
export type Run = { sequence: number; policy: Policy; results: Result[]; suite: boolean };
export type Work = { policy: Policy; selectedCaseId: string; runs: Run[]; hints: number; comparisons: number; sources: number };
export type Screen = 'brief' | 'workbench' | 'transfer-brief' | 'summary';
export type State = { screen: Screen; mission: MissionId; paused: boolean; noteshare: Work; teamboard: Work };
export type Action =
  | { type: 'start' }
  | { type: 'policy'; patch: Partial<Policy> }
  | { type: 'select'; caseId: string }
  | { type: 'run'; suite: boolean }
  | { type: 'help'; kind: 'hints' | 'comparisons' | 'sources' }
  | { type: 'transfer-brief' }
  | { type: 'start-transfer' }
  | { type: 'summary' }
  | { type: 'return'; mission: MissionId }
  | { type: 'pause'; paused: boolean }
  | { type: 'reset' };

export const MISSIONS = {
  noteshare: {
    name: 'NoteShare', type: 'GUIDED PRACTICE', ticket: 'NS–014', noun: 'note',
    title: 'A valid token. The wrong person.',
    description: 'Bob can edit Alice’s private note. Repair the access policy while keeping legitimate edits working.',
    requirements: ['Missing or expired credentials receive 401.', 'An update requires a token with write scope.', 'Only the note’s owner may update it.'],
    cases: [
      { id: 'N1', title: 'No credentials', detail: 'Alice’s note · no token', actor: 'Alice', owner: 'Alice', token: 'missing', role: 'editor', resource: '/notes/42', expected: 401 },
      { id: 'N2', title: 'Expired credentials', detail: 'Alice’s note · expired token', actor: 'Alice', owner: 'Alice', token: 'expired', role: 'editor', resource: '/notes/42', expected: 401 },
      { id: 'N3', title: 'A read-only token', detail: 'Alice → her own note', actor: 'Alice', owner: 'Alice', token: 'read', role: 'editor', resource: '/notes/42', expected: 403 },
      { id: 'N4', title: 'An owner edits', detail: 'Alice → her own note · write token', actor: 'Alice', owner: 'Alice', token: 'write', role: 'editor', resource: '/notes/42', expected: 200 },
      { id: 'N5', title: 'Someone else edits', detail: 'Bob → Alice’s note · write token', actor: 'Bob', owner: 'Alice', token: 'write', role: 'editor', resource: '/notes/42', expected: 403 },
      { id: 'N6', title: 'The other owner edits', detail: 'Bob → his own note · write token', actor: 'Bob', owner: 'Bob', token: 'write', role: 'editor', resource: '/notes/73', expected: 200 },
    ] as Case[],
  },
  teamboard: {
    name: 'TeamBoard', type: 'APPLY ELSEWHERE', ticket: 'TB–008', noun: 'board',
    title: 'Same principles. A different permission.',
    description: 'Workspace editors should be able to update a teammate’s board. Viewers and outsiders should not.',
    requirements: ['Missing or expired credentials receive 401.', 'An update requires a token with write scope.', 'Workspace editors may update any board in their workspace. Viewers and outsiders may not.'],
    cases: [
      { id: 'T1', title: 'Expired credentials', detail: 'Alice · expired token', actor: 'Alice', owner: 'Bob', token: 'expired', role: 'editor', resource: '/boards/11', expected: 401 },
      { id: 'T2', title: 'An editor, read-only token', detail: 'Alice → a teammate’s board', actor: 'Alice', owner: 'Bob', token: 'read', role: 'editor', resource: '/boards/11', expected: 403 },
      { id: 'T3', title: 'A collaborating editor', detail: 'Alice → Bob’s board · write token', actor: 'Alice', owner: 'Bob', token: 'write', role: 'editor', resource: '/boards/11', expected: 200 },
      { id: 'T4', title: 'A workspace viewer', detail: 'Bob → Alice’s board · write token', actor: 'Bob', owner: 'Alice', token: 'write', role: 'viewer', resource: '/boards/22', expected: 403 },
      { id: 'T5', title: 'A workspace outsider', detail: 'Eve → Bob’s board · write token', actor: 'Eve', owner: 'Bob', token: 'write', role: 'outsider', resource: '/boards/11', expected: 403 },
      { id: 'T6', title: 'An editor’s own board', detail: 'Alice → her own board · write token', actor: 'Alice', owner: 'Alice', token: 'write', role: 'editor', resource: '/boards/22', expected: 200 },
    ] as Case[],
  },
} as const;

export const SOURCE_CARDS = [
  { id: 'identity', title: 'Start with valid identity.', label: 'RFC 9110 · §15.5.2 & §15.5.4', url: 'https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.2', text: 'A 401 response challenges a request that lacks valid authentication credentials. A 403 response indicates that the server refuses the request. In this exercise, valid identity is checked before action and resource permissions.', note: 'The sandbox supplies a Bearer challenge with its 401 responses.' },
  { id: 'scope', title: 'A token still has limits.', label: 'RFC 6750 · §3.1', url: 'https://www.rfc-editor.org/rfc/rfc6750.html#section-3.1', text: 'An expired bearer token is an invalid credential. A valid token may still lack the scope required for an operation. This sandbox distinguishes those failures and checks write scope before permitting a change.', note: 'No real token is entered or transmitted in this preview.' },
  { id: 'resource', title: 'Permission belongs to the resource, too.', label: 'OWASP · Authorization Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html', text: 'Establishing identity does not by itself grant access. Authorization should be checked for each request and resource. The required relationship depends on the application’s business rules.', note: 'NoteShare’s owner rule and TeamBoard’s editor rule are fictional product requirements, not universal API rules.' },
] as const;
export type SourceId = typeof SOURCE_CARDS[number]['id'];

export function samePolicy(a: Policy, b: Policy) {
  return a.identityStatus === b.identityStatus && a.requireWriteScope === b.requireWriteScope && a.resourceRule === b.resourceRule;
}

export function simulate(policy: Policy, item: Case): Result {
  const trace: TraceStep[] = [];
  const finish = (status: Result['status']): Result => ({ caseId: item.id, status, mutated: status === 200, passed: status === item.expected && (status === 200) === (item.expected === 200), trace });
  if (item.token === 'missing' || item.token === 'expired') {
    trace.push({ name: 'Identity', state: 'blocked', detail: item.token === 'missing' ? 'No authentication token supplied.' : 'The supplied token has expired.' });
    trace.push({ name: 'Write scope', state: 'skipped', detail: 'Identity must be established first.' }, { name: 'Resource permission', state: 'skipped', detail: 'The request stopped before this check.' });
    return finish(policy.identityStatus);
  }
  trace.push({ name: 'Identity', state: 'passed', detail: `${item.actor} has a valid synthetic token.` });
  if (policy.requireWriteScope && item.token !== 'write') {
    trace.push({ name: 'Write scope', state: 'blocked', detail: 'This token permits reading, not updating.' }, { name: 'Resource permission', state: 'skipped', detail: 'The request stopped before this check.' });
    return finish(403);
  }
  trace.push({ name: 'Write scope', state: policy.requireWriteScope ? 'passed' : 'skipped', detail: policy.requireWriteScope ? 'The token includes write scope.' : 'Your policy has disabled the scope check.' });
  const permitted = policy.resourceRule === 'none' || (policy.resourceRule === 'owner' ? item.actor === item.owner : item.role === 'editor');
  trace.push({ name: 'Resource permission', state: policy.resourceRule === 'none' ? 'skipped' : permitted ? 'passed' : 'blocked', detail: policy.resourceRule === 'none' ? 'No resource permission check is configured.' : policy.resourceRule === 'owner' ? `${item.actor} ${permitted ? 'owns' : 'does not own'} this resource.` : `${item.actor} ${permitted ? 'is an editor in' : 'does not have editor access to'} this workspace.` });
  return finish(permitted ? 200 : 403);
}

export function initialState(): State {
  const work = (mission: MissionId): Work => ({
    policy: { identityStatus: mission === 'noteshare' ? 403 : 401, requireWriteScope: true, resourceRule: 'none' },
    selectedCaseId: mission === 'noteshare' ? 'N5' : 'T3', runs: [], hints: 0, comparisons: 0, sources: 0,
  });
  return { screen: 'brief', mission: 'noteshare', paused: false, noteshare: work('noteshare'), teamboard: work('teamboard') };
}

export function latestSuite(work: Work) { return work.runs.findLast(run => run.suite); }
export function currentSuitePassed(work: Work) {
  const run = latestSuite(work);
  return !!run && samePolicy(run.policy, work.policy) && run.results.every(result => result.passed);
}
export function currentResult(work: Work, caseId: string) {
  return work.runs.findLast(run => run.results.some(result => result.caseId === caseId));
}
export function reducer(state: State, action: Action): State {
  const work = state[state.mission];
  const update = (next: Work): State => ({ ...state, [state.mission]: next });
  switch (action.type) {
    case 'reset': return initialState();
    case 'start': return { ...state, screen: 'workbench', paused: false };
    case 'policy': return update({ ...work, policy: { ...work.policy, ...action.patch } });
    case 'select': return MISSIONS[state.mission].cases.some(item => item.id === action.caseId) ? update({ ...work, selectedCaseId: action.caseId }) : state;
    case 'help': return update({ ...work, [action.kind]: work[action.kind] + 1 });
    case 'run': {
      const cases = MISSIONS[state.mission].cases.filter(item => action.suite || item.id === work.selectedCaseId);
      const run: Run = { sequence: work.runs.length + 1, policy: { ...work.policy }, suite: action.suite, results: cases.map(item => simulate(work.policy, item)) };
      return update({ ...work, runs: [...work.runs, run] });
    }
    case 'transfer-brief': return currentSuitePassed(state.noteshare) || state.screen === 'brief' ? { ...state, screen: 'transfer-brief', paused: false } : state;
    case 'start-transfer': return { ...state, mission: 'teamboard', screen: 'workbench', paused: false };
    case 'summary': return { ...state, screen: 'summary', paused: false };
    case 'return': return { ...state, mission: action.mission, screen: 'workbench', paused: false };
    case 'pause': return { ...state, paused: action.paused };
  }
}

export function intervention(mission: MissionId, work: Work): { title: string; text: string; source: SourceId; pair: [string, string] } {
  const run = work.runs.at(-1);
  const failure = run?.results.find(result => !result.passed);
  if (failure && (failure.caseId.endsWith('1') || failure.caseId === 'N2')) return {
    title: 'Separate identity from permission.', text: 'One request cannot establish a valid identity; another has a valid identity but only read scope. Compare which guard stops each one and the status it returns.', source: 'identity', pair: mission === 'noteshare' ? ['N1', 'N3'] : ['T1', 'T2'],
  };
  if (failure && (failure.caseId === 'N3' || failure.caseId === 'T2')) return {
    title: 'Hold the person constant.', text: 'Compare a read-only token with a write token. The person and resource stay the same, but the token’s allowed action changes.', source: 'scope', pair: mission === 'noteshare' ? ['N3', 'N4'] : ['T2', 'T3'],
  };
  return mission === 'noteshare' ? {
    title: 'A valid token is only the beginning.', text: 'Alice and Bob both have valid write tokens. Compare who owns the note. Which policy check would keep Alice’s edit working while rejecting Bob’s?', source: 'resource', pair: ['N4', 'N5'],
  } : {
    title: 'Read the new relationship.', text: 'The ticket now permits collaboration. Compare an editor with an outsider on the same board. The owner relationship alone does not describe this product’s rule.', source: 'resource', pair: ['T3', 'T5'],
  };
}
