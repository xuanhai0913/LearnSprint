# LearnSprint submission workbook — R4 operations simulation

Type: draft and release checklist. Updated 2026-09-26. The Devpost project remains a draft. Recheck live Devpost fields and official rules before final entry. [Requirements](REQUIREMENTS.md) · [Observed status](../delivery/STATUS.md).

The existing Devpost draft was renamed **LearnSprint** and its pitch saved on 2026-09-25. The English story, banner, thumbnail, track, AWS Builder answer and five tool-feedback fields were also saved; the form shows **3/5 steps done**. See the [live-field record](DEVPOST-FIELDS.md) for exact status and the remaining video/final submission gates.

## Entry and exact claim

| Field | Current draft / gate |
| --- | --- |
| Project name | LearnSprint |
| Short pitch | Practice an operations shift: ask the right people, plan three deliveries, respond to a supplier delay, and leave a clear handoff. |
| Primary route | Alexa+ experience **simulation**. The web app demonstrates contextual conversation and explicit actions; it is not a native Alexa+ integration or certification. |
| Mini challenge | AWS Builder. The demo runs on AWS and uses Amazon Bedrock Nova 2 Lite for bounded request interpretation and coaching focus. Nova 2 Sonic has a live transport but a successful hosted browser voice turn is not yet verified. |
| Audience | Adults preparing for entry-level order support or operations coordination; English is the first interface language. |
| Status | Hosted preview and several browser journeys observed. Public MIT repository is live. Practitioner/learner validation, final video and form submission remain open. |

## Public project story draft

**Problem.** An applicant can read about an operations role or ask an AI for advice without experiencing the work of reconciling promises, inventory and shipping deadlines. LearnSprint provides a small fictional workday where a decision changes the shared order board and can be checked against explicit facts.

**What it does.** The learner works at a fictional stationery supplier with three orders. They ask a warehouse colleague for stock and ETA, allocate kits among three departures, review the whole plan and record a commitment. A supplier delay changes the facts. The learner can ask customer B about an allowed split, record that agreement, revise allocations and save a handoff. A linked replay presents a changed stock situation with a new board and its own assistance history. The report compares the saved decisions and can be downloaded as JSON.

**Why the interface matters.** The board holds the plan; actor replies have source facts; a deterministic evaluator checks stock by time, capacity, order totals, deadlines and shipping budget. A model can interpret a typed request and suggest one allocation edit, but the learner sees and confirms the exact change. Undo is recorded. Optional guidance is explicitly requested and counted. The report describes actions and unresolved work, not employability or mastery.

**How it is built.** React/Vite frontend; NestJS/TypeScript API; SQLite for demo shifts and invocation ledgers on persistent encrypted EC2 storage. CloudFront HTTPS reaches a private VPC origin and Caddy gateway. Amazon Bedrock Nova 2 Lite interprets bounded typed requests and selects from approved authored coaching activities. Nova 2 Sonic is wired for streamed English voice; the hosted microphone path remains under diagnosis. IAM is limited to the required Nova resources. Separate allowance ledgers cap demo invocations. This is a web simulation of an Alexa+ style contextual interaction, not an Amazon product integration.

**Observed accomplishments.** One complete manual first shift and one linked changed-condition replay were saved and reloaded in Chrome. An authored guidance request and one live AI-selected focus persisted. A saved Lite proposal was applied and undone, with the board and record retained after reload and an app-container restart. A fresh browser cookie could not open the existing shift. These are narrow demo observations, not evidence of learning outcomes or broad reliability.

**Challenges and next steps.** Source-backed conversation and AI proposals need strict separation from commitments. A cloud UI update exposed duplicate contact panels and was repaired. Sonic reached the provider and consumed three bounded reservations, but no browser voice action was saved; the voice experience needs diagnosis and a verified demonstration. Next: practitioner review of scenario realism, a small learner pilot, voice repair, and a concise demo video.

## Reviewer links and access

- Hosted demo: <https://d2g4a2ezl5lw7r.cloudfront.net/career>. Public First Shift entry requires no sign-in. Each browser owns its saved shifts through a Secure cookie; reviewers can start a fresh attempt.
- Source repository: <https://github.com/xuanhai0913/LearnSprint>. Public `main` includes the MIT [LICENSE](../../LICENSE), source, content and [reviewer guide](REVIEWER-GUIDE.md). The 2026-09-25 remote check confirmed the license and R4 demo script are readable; `deploy/private/` is absent from the remote. A clean clone/setup remains unverified.
- Public YouTube/Vimeo video under three minutes: **pending publication**. The [live screen recording cut](../../video/README.md) is exported locally at `video/out/learnsprint-demo-live.mp4` (150 seconds) with narration and burned-in captions. The earlier screenshot montage is only a storyboard reference.
- Thumbnail and concept banner: [thumbnail](media/learnsprint-thumbnail.png) and [banner](media/learnsprint-banner.png), both GPT Image illustrations uploaded to the Devpost draft. The real app walkthrough is locally recorded and ready for owner review.
- Optional friction log: [public-ready draft](FRICTION-SUBMISSION.md), with account details removed and attribution limits stated.
- Open Source additional challenge: **do not select by default**. Publishing the main repo alone does not satisfy a distinct open-source contribution.

## Devpost form checklist

1. Verify actual submitter/team identity, eligibility, location, IP rights and new/existing-work declaration with the owner. Keep historical PowerLab reuse truthful.
2. Select Alexa+ simulation primary route and AWS Builder mini challenge if the live form offers those exact fields. Describe simulated behavior and actual AWS use explicitly.
3. Paste the final English story after checking every claim against the release and video.
4. Add public source, free demo access, short public video and any required media/thumbnail. Confirm links in a clean browser.
5. Adapt the [product feedback draft](PRODUCT-FEEDBACK.md) to the live form for services actually used: Bedrock Nova 2 Lite, attempted Nova 2 Sonic, EC2, CloudFront, S3, SSM and relevant SDKs. Separate successful behavior from friction. Do not list AgentCore, Strands, DynamoDB or Lambda as used.
6. If the form requests tool feedback, cover purpose, what worked, what needs improvement, onboarding and whether the tool would be used again. Use observed examples and a redacted friction note.
7. Review the real submission preview and terms with the owner, submit before the internal October 22 evening VN target, then record the confirmation URL/time. Official close is October 24, 2026 at 02:00 VN per the last rules check.

## Claims gate before recording and submitting

- Say **fictional job simulation**, not internship, job-readiness assessment, hiring tool or accredited course.
- Say **source-backed authored actor reply** when demonstrating listed warehouse/customer questions; distinguish it from a live Lite interpretation.
- Show a voice action only if a new hosted browser observation proves transcript, tool receipt and saved state. Until then, use the typed proposal in the video and describe Sonic as an unresolved prototype.
- Do not claim pilot benefit, maximum judging score, invoices, redeemed $150 promotion, or any native Alexa+ approval without evidence.
- Preserve reviewer access through the competition judging window; do not expose AWS credentials or private deployment files.
