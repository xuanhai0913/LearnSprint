# Local verification — 2026-09-23

Scope: single-learner local fixture MVP. This is not evidence of live AI quality, multi-user security, deployment or final hackathon readiness.

## Automated evidence

`pnpm test`: **25 passed, 0 failed**. Node's test runner executes domain/storage/model-boundary and HTTP tests against disposable temporary SQLite directories. No AWS requests occur.

Covered: session planning, adaptive q02→q04, sources, pause/resume, database reopen, idempotent retry, conflicting request IDs, stale revisions, unassessable responses, question limits, later-session review, empty completion, concurrent submissions, provider failure, state changes during assessment, transaction rollback, mode isolation, citation/JSON rejection, prompt bounds, durable invocation reservations, immutable approval batches, cached results, fail-closed configuration, HTTP validation/origin/body limits, expanded pack and archived-session compatibility.

`pnpm build`: API and React production bundles succeeded.

## Chrome observations

- Created a 5-minute fixture session; submitted a synthetic wrong answer for missing credentials.
- Feedback cited access-p02; source panel showed the excerpt and RFC 9110 link.
- Paused, reloaded, resumed: saved feedback remained and the next question concerned an expired token (access-q04).
- Entered a draft, reloaded, continued: draft text remained in the correct pending question.
- Selected a correct fixture result for the second answer; recap showed two saved outcomes.
- Read the prior version's recap after expanding the content pack.
- At measured `innerWidth=360`, the page scroll width was 348; no horizontal page overflow in the observed study view. This is a spot check, not a full accessibility audit.
- Opened demo information with keyboard Enter; native dialog focused its close control.
- Selected the HTTP methods chapter; plan used pack 0.2.0-draft and the chapter-specific starting question is covered by the domain test.

## Fixes during verification

Added an in-process assessment lock against simultaneous submissions, question-specific draft keys, preserved archived content versions and a fallback review question for unresolved terminal branches. Separated React bootstrap from App to avoid duplicate createRoot during hot updates. Safe errors now distinguish malformed/oversized requests. Added chapter selection to make the expanded pack reachable.

## Remaining gates

Live Bedrock invocation/teaching quality; content owner review; broader accessibility and browser coverage; production identity/throttling/hosting; repository publication/license; video and final submission. Do not label the hackathon deliverable complete based on this local evidence alone.
