# IT support: incident coordinator (scenario 1.0.0)

Added September 27, 2026 at the owner's request to expand career coverage. The operations shift remains the hackathon's demonstrated AI workflow. IT support is an additional authored simulation, not a claim that a second Bedrock workflow or professional training qualification has been validated.

## Learner and work artifact

Adults exploring first-line support coordination practice triaging three fictional tickets: VPN interruption, CRM access and dispatch printing. The artifact is a ticket queue containing priority, accountable team and next action, followed by a practical handoff. Evidence must be opened before a clean review. The exercise does not ask for passwords, run commands, modify real access, or contact staff.

The scenario policy defines P1 (blocked critical shared service, no workaround), P2 (impact today, workaround exists), and P3 (isolated low impact/future work). These are authored team rules, not universal ITIL/SLA requirements. Workload uses explicit effort units and team capacity, not simulated clock time or invented performance scores.

## First shift and replay

First shift: investigate three cases, assign the responsible teams and actions, review, then advance to 09:20. VPN impact widens and its workaround fails. Earlier reviews are invalidated; current evidence must be opened and decisions reviewed again. A handoff preview shows the note and unresolved count before it becomes read-only.

A changed-condition replay is available after the first handoff. VPN impact is smaller but the shared label service is blocked without a backup. A subsequent manager update makes CRM access urgent today. Correct routing fills the network team’s two available effort units. Incorrect routing can overload a team; any resulting queue risk remains visible in the review and handoff. Escalation does not create extra capacity. The replay has its own evidence/history and one child per source handoff.

## Persistence and boundaries

- Existing operations schemas and SQLite files are unchanged.
- New `/api/career/it/*` routes reuse the career owner cookie and existing gateway protection.
- `it-support.sqlite` stores shifts and idempotent request receipts separately.
- Mutations validate input, owner, revision and phase, then save state and receipt in one SQLite transaction.
- Version 1.0.0 pins authored facts/policy; do not edit its semantics for existing sessions. Add a new version and dispatch by saved version for future changes.
- Evidence payloads stay hidden until requested; reading them records which world version was inspected.
- Review issues persist in final handoff; unresolved work does not silently become a success.
- This role does not consume the Lite/Sonic allowance. AI and MCP integration for IT is future work and must preserve these decision boundaries.

## Usability refinement

Ticket choices remain blank until explicitly selected; changing priority does not silently assign an owner or action. Every started draft must contain all three choices before saving, and users can discard unsaved choices. A progress panel counts current evidence and complete decisions and describes the next step. Opening previously unread evidence invalidates an older review so its missing-evidence warnings cannot be mistaken for current feedback.

The handoff editor offers an optional blank outline. It is a writing aid, not an evaluated answer or a quality guarantee. The saved report displays the frozen ticket decisions beside the note and unresolved count.

## Replay comparison

A completed replay includes its original, owner-checked frozen handoff. The report compares priorities, owners, actions and unresolved observation counts, and exposes the earlier note. JSON export includes both handoffs. The comparison appears only after the replay handoff to avoid revealing earlier decisions during independent practice. Different facts make raw counts unsuitable as a learning score.

## Review still needed

Cloud compilation/rollout results belong in STATUS.md. No new local application tests were requested for this increment. Practitioner plausibility review, browser end-to-end acceptance, mobile review and learner sessions remain distinct from compilation. Use `../pilot/TRYOUT-KIT.md`, adapting prompts to tickets and escalation. Neither scenario demonstrates learning gains yet.

Next expansion should follow actual pilot demand (e.g. customer support), with its own meaningful artifact and rules. Do not multiply careers by relabeling this queue.
