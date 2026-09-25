> Historical snapshot before the education strategy revision (R3), 2026-09-23. Current direction and delivery status are in `docs/PROJECT-CONTEXT.md` and `docs/delivery/STATUS.md`. This file records prior work, not the current release scope.

# Six-frame storyboard — mission preview

Type: explanation/reference. Produced 2026-09-23 for P01. Interactive route: `/mission-preview` in the existing web app. The prototype runs entirely in the browser, uses authored hints and keeps its record in memory in the open tab.

## 01 — a practical brief

**Learner sees:** a NoteShare ticket, the reported private-note edit, an approximately ten-minute intention and one main action: Open the workbench. A knowledgeable learner can choose the transfer mission directly.

**Learner decides:** investigate this permissions problem, instead of constructing a prompt or entering a long answer.

**Design:** warm paper, editorial serif headline, an illustrated request from Bob to Alice's private note and a compact three-step explanation. The illustration is labeled as the ticket snapshot, not prior learner activity.

## 02 — an observable failure

**Learner does:** select a prepared request and run it. The initial NoteShare policy has the wrong invalid-identity response and no resource restriction.

**System shows:** actual simulated status, expected ticket outcome, whether the resource changed, and the ordered identity/scope/resource trace. Every run starts from a fresh synthetic resource.

**Core moment:** a valid token with write scope still does not justify access to another person's private resource.

## 03 — a focused intervention

**Learner does:** ask for one authored hint, open a controlled comparison or read a source card.

**System shows:** a hint selected from the latest run's unmet requirement. Comparisons vary identity, token scope or the relevant resource relationship. Help and source openings are counted separately.

**Boundary:** this prototype uses deterministic authored guidance. No AI response is fabricated; live Bedrock intervention selection is P06. A request for help during transfer is visibly marked as assistance.

## 04 — a repair with consequences

**Learner does:** change the invalid-identity response, write-scope control and resource rule; check all six cases.

**System shows:** allowed as well as forbidden outcomes. The interface distinguishes current results from results produced by an earlier policy. Continue becomes available only after the current policy passes the full scenario set.

**Important detail:** changing controls does not silently recalculate historical evidence. An old passing result cannot certify a newly edited policy. Returning 403 on every request fails the legitimate-edit cases.

## 05 — a changed business requirement

**Learner sees:** TeamBoard's rule: editors can update a teammate's board; viewers and outsiders cannot.

**Learner does:** work from a fresh policy. Copying NoteShare's owner-only choice blocks a permitted collaborating editor. Removing the resource restriction admits outsiders.

**System records:** exploratory requests, verification attempts and assistance. Sources remain available for open-reference practice. This is not a closed-book exam or a protected assessment.

## 06 — an honest record and next action

**Learner sees:** real local run counts, latest case results, assistance/source counts and a next action grounded in those runs. Finishing early records the mission as unfinished or unattempted, not completed.

**Learner can:** return to either workbench, pause in the same tab or start a fresh preview after confirmation.

**Current limit:** reload discards this preview record. Server persistence, cross-session recommendations and tamper-resistant evaluation remain later work. Existing quiz storage and the invocation ledger are untouched.

## Preview entry and source ownership

- `apps/web/src/main.tsx`: isolated lazy-loaded preview entry; existing quiz route remains available.
- `apps/web/src/mission/MissionPreview.tsx`: brief, transfer brief, summary, dialogs and storyboard overlay.
- `apps/web/src/mission/Workbench.tsx`: request, controls, observed result, trace, comparison and scenario list.
- `apps/web/src/mission/preview-domain.ts`: draft typed world, independent expected status constants, deterministic simulation, authored interventions and in-tab reducer.
- `apps/web/src/mission/mission.css`: isolated notebook/workbench visual system and responsive rules.

The client contains reference outcomes for design iteration. It must not become the release grading authority. P02/P03 move reviewed world/oracle ownership to the server before the mission release is treated as valid learning evidence.

## Remaining product questions

1. Do novice learners understand the difference between a request result and the whole scenario check?
2. Is the policy vocabulary clear without teaching the complete answer in a control label?
3. Does the new collaboration rule feel like useful transfer rather than an unrelated trick?
4. Can a learner find the next action without following a forced tour?

These are future observation questions. No user-study result is claimed.

## Checks actually performed

`pnpm --filter @learnsprint/web build` completed: TypeScript compilation and Vite production build succeeded. Chrome opened the preview and displayed the mission workbench. No automated tests or scripted browser journey were added/run for P01. Visual/mobile/keyboard acceptance and full interaction verification remain pending.
