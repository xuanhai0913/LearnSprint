> **Historical R3 scope, superseded 2026-09-23:** the owner selected an operations-coordinator job simulation. Use the [current R4 plan](../career/DELIVERY-PLAN.md). This file preserves earlier PowerLab scope/evidence and must not drive new feature work or be copied as the current submission story.

# R3 quality and evaluation plan

Type: how-to/reference. Future verification plan. Do not add or execute application tests unless the active request asks for implementation testing or verification. This strategy revision performs documentation checks only.

## Four different questions

1. Does the domain engine calculate the specified model correctly?
2. Does the interface/voice agent execute the learner's intended action reliably?
3. Does the teaching intervention make sense for the observed behavior?
4. Do learners/tutors find the complete workflow useful?

A passing simulator suite answers the first question, not all four. Historical quiz tests and five model calls do not verify the new lesson.

## Planned checks after authorization

| Area | Required cases | Evidence |
| --- | --- | --- |
| Domain/reference | A/B/C cases, exact boundaries, service failures, malformed IDs/ratings/slots | Independent expected values and actual results |
| Artifact integrity | Stale result, concurrent voice/manual edit, duplicate command, pause/reload | Revision/event trace and browser observation |
| Agent | Correct intervention/source/run IDs, irrelevant evidence, misleading input, unavailable model | Reviewed output dataset, mode, failures and sanitized provider trace |
| Independence | Requests for full solution, injected instructions, earlier worked examples, transition to assisted | Phase/retrieval checks; help record before content disclosure |
| Voice | Numeric/time ambiguity, interruption, duplicate tool event, mic denial, reconnect, idle expiry | Command receipts, correction rate, latency and usage |
| Security | Cross-learner read/write, report expiry/revoke, ticket replay, guessed session, provider secret exposure | Scoped access results and unresolved findings |
| Accessibility | Keyboard-only, chart table, small screen, zoom, focus, contrast, reduced motion | Manual observations with concrete screen/state references |
| Release | Fresh install/start, offline mode, live mode if enabled, judge entry, resource inventory | Reproducible commands and actual release identifier |

## Coach review set

Prepare examples covering each I01–I05 trigger, conflicting signals, an already-correct plan, an incomplete plan, an independent-mode request and a malicious source string. A reviewer marks correctness, relevance, disclosure of the answer, source support and usefulness. No learning-science claim follows from an LLM judging its own output.

Release-blocking: fabricated run/source, changed numeric outcome, cross-learner data, hidden assistance, incorrect units, broken core controls, unexplained lost work, or unbounded usage. Quality targets such as response latency require actual measurement on the release connection and should be reported with sample size.

## Instrumentation without unnecessary data

Store run IDs, phase, revisions, action type, provider/mode, assistance, durations and returned token usage. Avoid raw microphone recordings and full private model prompts by default. Public demo evidence is redacted and retains enough context to substantiate the claim.

[User research](../research/USER-RESEARCH.md) evaluates the separate product-value questions. [Judging map](../hackathon/JUDGING-EVIDENCE.md) identifies how actual evidence supports the submission.
