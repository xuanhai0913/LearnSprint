> **Historical R3 scope, superseded 2026-09-23:** the owner selected an operations-coordinator job simulation. Use the [current R4 plan](../career/TECHNICAL-CONTRACT.md). This file preserves earlier PowerLab scope/evidence and must not drive new feature work or be copied as the current submission story.

# Agent behavior and learning boundaries

Type: reference. Revision 3. Planned release policy; prompts alone do not enforce these rules.

## Roles

**Voice interface:** Nova 2 Sonic interprets a specific spoken request, calls a permitted lab tool and speaks from the returned result. **Learning coach:** a bounded Strands/Nova 2 Lite workflow selects one useful intervention using current run evidence and reviewed lesson material. Both operate inside the server-owned phase policy.

Do not run multiple autonomous agents merely to make the architecture appear sophisticated. The two model paths serve distinct speech and coaching needs.

## Coaching sequence

1. Read the current artifact revision, last run, phase and assistance state.
2. Obtain only relevant source cards and eligible activity templates.
3. Propose an activity ID, referenced run/constraint, short explanation and source IDs.
4. Validate schema, source provenance, activity eligibility, length and state freshness.
5. Display the activity and record whether help was viewed. In independent mode, require an explicit assisted transition first.
6. On invalid output/timeout, use an authored eligible activity with an honest mode label.

Recommended initial ceilings: two reasoning/tool rounds, four Lite invocations per mission, 800 generated tokens per response, and an 18-second overall text request timeout. Actual total input must include tool schemas/results and repeated context. Reserve usage before each request; disable unaccounted SDK retries.

## What to say

Use concrete observations: “The schedule fits 360 Wh, but hours one and two request 104 W against an 80 W limit.” These numbers must come from the tool. A helpful prompt might ask the learner to move one load and observe what changes while energy remains constant.

Distinguish an observation from an interpretation: “This might be a power-versus-energy confusion” is a tentative tutor note, not a diagnosis. Ask or offer a discriminating experiment rather than turning one click into a firm label.

## What tools may do

An explicit voice command can apply a reversible schedule edit. Ambiguous times/devices need clarification; a broad “fix it” cannot trigger an optimal solution, particularly during independent work. Tool results always return a success/failure receipt. Never say “saved” before commit or “passed” before an authoritative run.

[Official Sonic tool-use guidance](https://docs.aws.amazon.com/nova/latest/nova2-userguide/sonic-tool-configuration.html) describes tool events and expects a result for every request. Return structured failure/cancellation results, too, so the conversation does not hang. Async speech must not race ahead of authoritative state.

## Forbidden authority

The agent cannot modify physical laws/ratings, query sealed solutions, declare mastery, erase attempts, grant itself a larger budget, access another learner, publish reports, send notifications, install software or execute arbitrary code/URLs. Imported text and tool payloads are untrusted content, not instructions.

The independent-mode guard runs before every tool and every conceptual response. A user who requests the answer can choose assisted practice; the UI retains the original independent attempt. No adversarial prompt can preserve an independent label while obtaining a worked solution.

## Voice controls and recovery

Listening starts only after an explicit action. Show transcript, stop listening, stop speaking and undo. Audio streaming is transient by default; save only minimal action events and explicitly needed transcript excerpts. Disconnect after inactivity and a session duration cap. Reconnect with server state and the last acknowledged command ID, not blind replay of old mutation calls.

If the provider is unavailable or the cap is reached, close the live stream and leave direct controls intact. The demo/report identifies authored versus live behavior. Neither fallback nor canned audio is evidence of live AWS interaction.

## Independent-mode speech enforcement

Do not stream free-form model audio/text to the learner during B/C independent attempts. Accept only an explicit control-command grammar from the learner transcript and validated typed tool receipts; acknowledge results through deterministic UI/accessible status text. Suppress generative coaching output at the server transport boundary. Ambiguous/out-of-grammar input falls back to direct controls or an explicit assisted transition. Merely asking Sonic to avoid hints is not sufficient to preserve independent status.
