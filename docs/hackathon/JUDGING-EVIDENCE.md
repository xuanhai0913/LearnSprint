# R4 judging evidence map

Type: release map, 2026-09-25. Based on the [official rules](https://amazonappdev2026.devpost.com/rules). It is our interpretation of four equally weighted criteria, not an official score or guarantee. The earlier PowerLab map is preserved in [R3 history](JUDGING-EVIDENCE-R3.md).

| Criterion | Judge-visible R4 evidence | Observed so far | Remaining gap |
| --- | --- | --- | --- |
| Tech Implementation | Source-scoped actor answers; typed AI proposal → explicit Apply/Undo; deterministic stock/capacity/deadline/cost review; persisted replay/report; documented Bedrock/AWS integration | One full shift, one replay, one Lite focus, proposal Apply/Undo, reload and container restart in Chrome | Hosted Sonic browser turn, broader error/concurrent paths, reproducible public repo setup |
| Design | Board is primary workspace; distinguish expected stock from confirmed stock; show pending offer versus recorded agreement; disclose assistance; recover from change | One guided shift, one replay and report path visible | Target-user usability, mobile/keyboard pass, voice recovery |
| Potential Impact | A realistic entry-level work-preparation task with a clear learner and practitioner job; report what users actually do | Product hypothesis and one fictional scenario authored | Practitioner review and small learner pilot; no measured learning claim yet |
| Quality of Idea | Stakeholder conversation changes a shared plan under a supplier disruption; replay tests adaptation; handoff makes decisions inspectable | Core workflow observed end to end on the AWS demo | Demonstrate the distinct value clearly in the video; compare fairly with an AI assistant using the same facts |

## Release interpretation

The chosen Alexa+ route is a clearly labeled **web simulation**. The [rules](https://amazonappdev2026.devpost.com/rules) allow that route using an AI or agentic tool without a required MCP surface. The AWS Builder mini challenge requires documented AWS service integration. The current demo uses CloudFront, EC2, S3/SSM deployment operations and Bedrock Nova 2 Lite at runtime; Sonic is wired but lacks a successful hosted browser voice receipt. Claims in the video and Devpost story must match that distinction.

The [submission workbook](SUBMISSION-WORKBOOK.md) and [R4 script](DEMO-SCRIPT.md) convert this map into the entry package. Genuine, reproducible friction can be submitted for the optional feedback bonus; the [internal friction log](../research/FRICTION-LOG.md) must be redacted and curated first.
