# LearnSprint UI direction v1

Generated with built-in GPT Image at the owner's request. [Concept board](career-ui-direction-v1.png), [full prompt](PROMPT-V1.md).

This is a visual proposal, not a screenshot of deployed functionality. No UI implementation or deployment occurred in this design pass.

## Adopt in implementation

1. Career entry: two clear career cards, distinct authored/Bedrock labels, resume saved shifts and a short investigate → decide → handoff explanation.
2. Workspace: compact header, stage indicator, ticket navigation, selected ticket evidence and source, explicit priority/team/action controls, capacity panel and visible save/review actions.
3. Report: frozen decisions, unresolved issues, chronology, download and replay actions. A comparison view is proposed, not currently implemented for IT.
4. Mobile: one selected ticket at a time, stacked context, primary actions reachable without horizontal scrolling. Keyboard navigation, visible focus, readable contrast and announced save/error states remain requirements.

## Correct the generated image before implementation

- Keep exactly the existing three IT tickets: VPN, CRM access, dispatch labels. Ignore the invented fourth password-reset ticket.
- Do not imply real password resets, account grants or ticket resolution. Current actions are investigate, use an approved workaround, or escalate.
- Do not use the invented requester names, attachments, IDs, timestamps or outcome history as actual app data.
- Use P1/P2/P3 from the authored policy, not the image's generic High label.
- Stage indicator must match the actual incident phase; the image mixes a first-stage highlight with an incident banner.
- Distinguish handoff saved from incident resolved. Unresolved observations stay visible.
- EN/VI switching is proposed UI, not currently implemented localization.
- Render text, controls, logos and status with real accessible components. Do not ship this bitmap as an interactive page.
- Preserve owner isolation, revision/idempotency checks and existing saved records while changing layout.

## Suggested delivery order

Career selector and resume area → selected-ticket workspace → report and replay comparison → mobile and accessibility verification when requested. Maintain the current operational demo during the transition. No new profession or AI capability is implied by this board.
