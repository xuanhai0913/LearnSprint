# Build friction log

Type: evidence log. Keep only genuine observations. Redact secrets and account details before sharing this file through a public URL.

## F001 — promotional credit redemption blocked on Free plan

- **Date:** 2026-09-23.
- **Surface:** AWS Billing credit-redemption UI, accessed after account onboarding.
- **Task:** redeem the hackathon promotional code already received by email.
- **Observed steps:** open Billing/Credits; choose the credit-redemption action.
- **Expectation:** reach a form to enter the received code, or see plan eligibility explained in advance.
- **Actual result:** the UI stated that free-plan accounts cannot redeem credits and directed the user toward a paid plan.
- **Impact:** onboarding blocker for the promotional credit, not a blocker to all local development.
- **Proposed severity:** medium.
- **Workaround:** leave the code unredeemed and continue planning against currently available services; no account upgrade performed.
- **Suggestion:** explain plan requirements and potential billing implications in the credit email/request instructions before the user reaches redemption.
- **Evidence:** observed in the authorized Chrome session; no screenshot saved into this folder. The UI text was in French and is summarized here, not quoted as an exact English message.
- **Privacy:** do not include the code, account ID, billing details or email screenshot in this log.
- **Status:** unresolved; requires an account/budget decision if redemption is still desired.

## F002 — judging-start dates differ between official pages

- **Date:** 2026-09-23.
- **Surface:** official Schedule vs Rules/FAQ.
- **Task:** plan how long to maintain a judge-accessible demo.
- **Steps:** compare the judging-start entries in the linked official pages.
- **Expected:** one consistent start date.
- **Actual:** Schedule and Rules/FAQ give different start dates; see the [source register](../hackathon/SOURCES.md).
- **Impact/severity:** low-to-medium planning uncertainty, potentially affecting hosting cost and availability.
- **Workaround:** preserve access across the broader evaluation window.
- **Suggestion:** align the pages or explain any difference between screening and judging phases.
- **Evidence:** public source links; no organizer clarification received.
- **Status:** unresolved. This is organizer-site feedback; assess whether it belongs in the final product-tool friction submission.

## F003 — Console session selector did not finish loading during kickoff

- **Date:** 2026-09-23.
- **Surface:** AWS sign-in and Console/Bedrock navigation in Chrome.
- **Task:** inspect model availability for B01.
- **Observed:** the existing Builder ID was recognized, and an account session was visible once. Continuing to Console/Bedrock then led to a loading session selector or an unfinished page. Choosing the current profile, retrying navigation and opening a fresh tab did not yet produce usable Bedrock content.
- **Impact:** account-specific model and region decisions remain pending; local content work continued.
- **Evidence:** visible Chrome accessibility state and on-screen loading indicator; no screenshot or authentication URL saved in the repository.
- **Attribution limit:** browser automation also timed out. This observation does not establish an AWS service outage or prove the cause lies with AWS rather than the browser/session environment.
- **Recovery observed later:** opening the previously used Sydney Console route and choosing the existing account reached Console Home and the Bedrock overview. No credentials were changed. This does not establish why the earlier navigation stalled.
- **Status:** immediate access recovered; root cause unresolved. Keep as an internal note until reproduction is clearer. Do not present an automation failure as a confirmed AWS defect in the submission.

## Entry template

```text
ID / date:
Tool/API/SDK and version:
Task attempted:
Environment (no secrets):
Minimal reproduction steps:
Expected result:
Actual result:
Frequency / user impact:
Severity and rationale:
Workaround:
Actionable suggestion:
Evidence link (redacted):
Status / resolution:
```

## Submission preparation

Select the most actionable entries, confirm each can be understood without private context, and remove unsupported assumptions about root causes. Preserve failed attempts honestly. Do not invent failures to seek bonus points or imply that a workaround was verified when it was only proposed.

## F004 — structured assessment output and a missed rubric requirement

- **Date:** 2026-09-23; captured in the earlier five-call application evaluation, not rerun during R3 planning.
- **Task:** return structured, source-grounded assessments through Bedrock Nova 2 Lite.
- **Observed:** two responses failed the then-current schema path; a partial answer was later credited as correct despite a missing explicit criterion. Exact cases and usage are in [live evaluation](../delivery/LIVE-EVALUATION-2026-09-23.md).
- **Expected:** a valid response matching the application schema and explicit rubric requirements.
- **Impact:** structured-output compatibility and assessment reliability required application work; generation success alone was insufficient.
- **Workaround:** parser/prompt changes were prepared; further live confirmation was not performed after the batch exhausted. R3 moves numeric feasibility to domain code and keeps the model in a bounded coaching role.
- **Attribution:** this does not establish an AWS outage or a service bug. Prompt design, schema expectations and model behavior are contributing possibilities.
- **Suggestion:** document robust structured-output patterns and evaluation examples that distinguish explicit learner evidence from inferred knowledge.
- **Submission state:** internal candidate; curate reproducible, redacted evidence and evaluate its usefulness before publishing as feedback. Do not claim a verified fix or guaranteed bonus.

## F005 — Sonic tool-schema representation differs between references

- **Date:** 2026-09-23.
- **Task/environment:** implement Nova 2 Sonic tool configuration with AWS SDK for JavaScript 3.1138.0.
- **Observed:** the [tool-configuration guide](https://docs.aws.amazon.com/nova/latest/nova2-userguide/sonic-tool-configuration.html) illustrates `inputSchema.json` as an object. The [AWS voicebot sample](https://github.com/aws-samples/sample-voicebot-nova-sonic), in `src/tools/Tool.ts`, serializes the schema with `JSON.stringify`.
- **Expected:** consistent wire-format examples, or an explicit distinction between conceptual schema and transmitted event.
- **Impact:** implementation uncertainty; extra reference inspection was needed before the first paid stream. No failed AWS invocation was caused or observed here.
- **Resolution observed:** the string representation succeeded in the [one-command live spike](../engineering/VOICE-SPIKE.md). The object variant was not sent; this is not evidence that it fails or that AWS has a service defect.
- **Suggestion:** show the exact JavaScript serialization and complete request envelope beside the conceptual schema example.
- **Submission state:** internal documentation-feedback candidate, low severity. Recheck examples and curate before publication; no feedback has been sent.
