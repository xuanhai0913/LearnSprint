# Screen specifications — PowerLab

Type: reference. Revision 3. Target behavior for R3. Practice-A entry/workbench/outcomes/comparison and local lifecycle now have source implementation; the rest remains planned. This is not a claim of runtime acceptance. [Delivered scope](../engineering/POWERLAB-LOCAL.md).

| Screen / surface | Main content and action | Essential states |
| --- | --- | --- |
| Lesson entry | Supported lesson, everyday purpose, estimated practice time, resume | New, existing artifact, unavailable live guidance |
| Mission brief | Device ratings, energy/power limits, required service durations | A/B/C version, readable units, explicit changed conditions |
| Workbench | Accessible device/time grid, clear Run button, dirty/saved status | Draft, saving, saved, conflict, invalid input, paused |
| Outcome | Requested Wh, peak W, service constraints, timeline/accessible table | No run, current run, stale run, limit pass/fail, run error |
| Comparison | Two run revisions, unchanged/changed variables, energy/power differences | Select runs, unavailable history, stacked small-screen view |
| Coach activity | Specific evidence, one action, optional source | Waiting, live, authored fallback, unavailable, assistance transition |
| Voice dock | Start/stop, listening state, transcript, receipt/undo | Permission request/denied, hearing, working, speaking, interrupted, disconnected |
| Transfer/review | Changed brief and assistance rules | Independent, first result, retry, assisted, incomplete; actual elapsed time |
| Evidence packet | Artifact, receipts, help and next unresolved objective | Owner preview, share preview, expiring/revoked grant, export |
| Demo information | Alexa+ simulation boundary and actual provider/infrastructure | Live vs offline, release version, current limits |

## Workbench layout

Desktop: compact brief at left, timeline and result at center, an optional intervention panel at right. Keep a primary action near the timeline, not behind a chat box. Mobile: brief summary → schedule rows → Run → results; the coach opens without covering controls. Below 640px, use device rows with labeled hour toggles, not tiny drag-only cells.

The visual study hub is a map of the artifact: highlighting a device identifies its row and power contribution. The budget plot represents requested consumption and projected budget balance. It must not depict negative physical battery energy or claim measurement of real hardware. Always show numbers and units in text.

## Copy contracts

Use “Energy requested: 416 Wh / available: 240 Wh,” “Peak demand: 104 W / limit: 120 W,” and “Router: 4 of 4 required hours.” A green overall result appears only when every requirement is met. Saved state and feasibility are different badges.

Use “Completed with guidance,” “Applied in a changed task without conceptual hints,” and “Review attempted after 26 hours” only when the records support them. Avoid arbitrary mastery percentages.

## Transfer boundaries

Task facts, numeric units and normal control instructions remain available. Opening instructional sources or receiving a conceptual hint requires switching to assisted mode. Hide worked practice/reference solutions from the independent view. Voice commands remain possible but cannot request an optimal schedule while retaining independent status. Show “Voice controls only” in this phase; suppress free-form generated teaching audio/text and use deterministic status acknowledgments.

## Accessibility and recovery

Every drag action has a native control alternative. Label row/column relations; visible focus; concise live-region updates; no automatic focus theft from arriving AI text. Charts have an equivalent table. Do not use color, waveform animation or audio alone to convey a state. Mic denial and live-service failure leave the lab usable.

Sharing and deletion are explicit actions. A reload restores server state or clearly reports recovery failure; it cannot quietly restart an attempt under an unchanged “saved” label.
