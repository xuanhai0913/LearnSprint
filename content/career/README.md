# First Shift content

Original fictional scenario written for LearnSprint, 2026-09-23. No employer, customer or carrier relationship is claimed. The scenario still requires review by an operations practitioner.

- `pack.json` selects the active base version and separate replay version.
- `versions/0.2.0.json` and matching `actors/0.2.0.json` implement the authored changed-condition replay. Its stock balance and customer policy differ; no original content file was rewritten. [Replay contract](../../docs/career/REPLAY-AND-REPORT.md).
- `versions/0.1.0.json` separates the public brief from server-private incident and customer-disclosure policies.
- `actors/0.1.0.json` pins the three authored contacts and their response templates separately from the unchanged scenario fixture. Sessions pin its dialogue version; only asked, authorized replies enter the workspace.
- [Reference values](REFERENCE-VALUES.md) are separately authored calculations for content review. They are not executed application tests, an answer lookup used by the engine, or practitioner validation.

Quantities are indivisible study kits; times are integer simulated minutes since midnight on day one; fees are fictional units per used departure. Customer-agreement quantities are cumulative milestones, not separate shipment quantities.

The server sends only the public brief and facts legitimately disclosed in an owned session. Keep private scenario payloads and reference plans out of frontend imports and future actor contexts. An actor receives only the facts authorized for its role, phase and request.

Once sessions use a released fixture version, retain it. Change quantities, timing, policy or wording under a new version and update the manifest; do not reinterpret old evaluations using current facts. The `career-engine-0.1.0` identifier pins the initial evaluator behavior recorded in reviews.

See the [mission](../../docs/career/MISSION-SPEC.md) and [implementation](../../docs/career/LOCAL-IMPLEMENTATION.md).
