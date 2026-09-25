# First Shift — authored actor conversations

Type: reference. C05 source increment, 2026-09-23. Three structured contacts now connect to the saved career workspace. This documents the authored dialogue increment. Subsequent [C06 source](AI-CONVERSATION.md) adds natural-language input with these same saved replies; generated model speech defaults off, with a subsequent assisted-only opt-in in [C07](COACHING.md).

## Contact and fact boundaries

| Contact | Supported questions | Permitted sources |
| --- | --- | --- |
| Alex, warehouse colleague | Current stock, expected replenishment, dispatch cutoffs | Stock register, current supplier notice, departure schedule |
| Jordan, customer B | Current order commitment, acceptable split | Order B; its disclosed offer or recorded agreement |
| Sam, shift lead | Budget, handoff requirements, escalation boundaries | Shift budget, authored handoff/change policies |

Names represent fictional scenario characters. The directory exposes contact descriptions and question labels; it does not return response templates or private split terms. A question submitted for another role is rejected. Split contact is available only in recovery. Neither warehouse nor lead can accept customer terms.

The response is composed from an allowlisted question and role-specific fields of the current saved world. No plan solution, future supplier ETA or another customer's policy is included. The customer offer is created by the domain policy, and a separate `accept_split` action records acceptance. Reading the response does not grant approval or change an allocation.

## Command and response records

`ask_actor` uses the existing owned command endpoint:

```json
{
  "type": "ask_actor",
  "actorId": "warehouse",
  "questionId": "eta",
  "requestId": "<new UUID>",
  "expectedRevision": 4,
  "expectedWorldRevision": 1
}
```

The response includes the original action receipt, `actorReplyId` and current workspace. The workspace exposes the actor directory and `session.actorReplies`. A reply freezes:

- Actor identity, role, question and authored message.
- Scenario/dialogue versions and the world revision at disclosure.
- Source IDs, labels and versions; visible fact labels/values and related board sections.
- Offer ID when relevant, response ID and recorded timestamp.

The transaction commits the reply, event and original receipt together. Asking changes the session revision only; it does not change the plan/artifact or world revision. Repeating the same actor/question at the same world revision returns the existing reply without another event. Exact request retries return the original receipt. After the supplier incident or recorded agreement changes the world, a new question can create a new snapshot. The UI conservatively marks older-world responses as earlier facts even if some individual values stayed the same.

The existing owner, expected revision, pause/final phase and local action limits apply. The response limit is 100 per shift. Legacy `ask_split` requests use the same customer disclosure path; no duplicate acceptance authority is introduced.

## User interface

The **People at your desk** panel has three contact selectors, explicit questions, the saved reply, source facts and expandable earlier replies. Source links move to the related current board section; the receipt retains its historical values. The agreement action is shown with the exact cumulative terms and remains distinct from reading the offer.

Asking a question preserves an unsaved allocation draft, including an incomplete input. It does not autosave that draft. An uncertain request keeps its actor/question payload for retry. If another tab's plan is returned during a replay, the draft is retained and conflict resolution is shown. Recording a customer agreement still requires saving or discarding a draft first.

The first shift's final handoff retains the conversation records in its now read-only session. Fact-finding is not counted as coaching. The product has no independent/assisted attempt label yet; this increment does not claim an implemented assistance policy.

## Versioning and existing sessions

New response templates live in `content/career/actors/0.1.0.json`. The original scenario fixture and reference values are unchanged. New sessions pin `dialogueVersion: 0.1.0`.

Old session rows lacking dialogue fields are read with that initial dialogue version and an empty reply log. No prior questions, source receipts or messages are invented. These defaults persist on the next real write; there is no destructive rewrite of historical SQLite records. Existing offers/agreements and evaluations remain intact. Old request receipts may lack `actorReplyId` and remain valid.

## Source map and observation boundary

- `apps/api/src/career/actors.ts`: validated versioned dialogue, directory, role/phase allowlist and response composition.
- Career service/controller/contracts/repository: typed action, atomic records, receipt link and backward-compatible record defaults.
- `apps/web/src/career/ActorDesk.tsx`, `actors.css`: contact selectors, questions, source records and agreement action.
- `Career.tsx`: task integration and preservation of drafts while asking.

API/web compilation passed. No new application tests, command journeys, microphone sessions, model invocations, deployment or external communications were performed. Compilation does not establish runtime acceptance for role isolation, persistence, duplicates, draft preservation or keyboard/mobile behavior.

## Subsequent implementation

[C06 AI input and proposals](AI-CONVERSATION.md) now implement the initial routing/permission/allowance boundary; requested live/behavioral acceptance remains open. C07 assistance records now have source; C08 replay is next.

The original C05 handoff called for C06 with separate career-scoped conversation/tool authority. Use these role facts and committed receipts as the source of truth; preserve the explicit confirmation boundary for customer acceptance. Retain a structured interaction path. Reuse Sonic transport only with career tickets and a named bounded allowance; do not broaden old PowerLab tickets or reset any ledger. C07 adds coaching and assistance records separately.
