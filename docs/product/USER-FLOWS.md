# Learner and tutor flows

Type: how-to/design contract. Revision 3. Planned behavior, not documentation of the existing API preview.

## First session

Open supported lesson → inspect goal and requirements → begin practice A → schedule devices → run → inspect energy/power/service outcomes → optionally choose an experiment or ask the coach → revise → rerun → move to transfer B.

A learner can act immediately with controls. Spoken requests use the same commands; the coach cannot move the learner past an unfinished task by merely saying it is complete. The learner may pause at any point.

## Conversational lab use

1. Learner explicitly enables the microphone.
2. The interface indicates listening and shows the recognized utterance.
3. A specific command, such as “Turn off laptop charging in hour two,” is validated against the active session and phase.
4. A reversible edit is applied and acknowledged with its actual revision; show an undo action. Ambiguous device/time references require clarification.
5. A run or comparison displays an actual result. Playback can be interrupted; stopping speech does not erase an already completed edit.
6. Denied microphone access, disconnection or provider failure leaves manual controls usable.

“Do it for me” is not an instruction to solve an independent assessment. The interface explains the boundary and offers a switch to assisted practice if desired.

## Independent transfer

Read B's changed resource limits → enter independent mode → inspect candidate → edit → run → see outcome → optionally retry → finish or explicitly request assistance.

Record every attempt and the first outcome. Do not count repeated hints or later assisted success as first-attempt independent success. Voice used solely as an input method is tagged separately from conceptual assistance. In this phase, only a narrow explicit command grammar and deterministic acknowledgments are exposed; generated tutor speech/text is suppressed. This is an observed learning exercise, not a proctored exam.

## Return

Open saved session in the same browser → load authoritative revision → see last artifact and a short factual reason for the next step → resume unfinished work or open review C → record actual elapsed time. A model summary cannot override an artifact or result.

No outbound reminder is sent by default. A future reminder feature would require a chosen channel and user consent.

## Tutor review

Learner opens evidence preview → inspects exactly what would be shared → chooses a private expiring report link or a local export → tutor sees plan, results and assistance → expands a run to inspect the cause → optionally records a teaching note in a later instructor feature.

P0 is one report, not a full gradebook or class dashboard. Sharing does not send email, post publicly or expose transcripts automatically. Retention/deletion behavior is in [security](../engineering/SECURITY-AND-PRIVACY.md).

## Recovery paths

| Condition | Required response |
| --- | --- |
| Unsaved edit | Keep draft; show save state and retry; do not claim server persistence |
| Stale revision or competing voice/manual edit | Show newest state and request reapply where needed; never overwrite silently |
| Coach timeout or invalid response | Offer authored guidance with an accurate mode label |
| Voice failure | Close the stream, preserve artifact, show manual/text route |
| Budget/service limit | Explain live guidance is unavailable; keep the authored lab and results usable |
| Unsupported subject/upload | Explain the supported lesson scope; do not simulate successful generation |
| Missing shared report | Explain expired/revoked link without disclosing whether another learner exists |
