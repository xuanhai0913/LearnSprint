# Product feedback draft — actual LearnSprint tools

Type: Devpost field draft, 2026-09-25. Review with the live form before submission. Describe experience, not unsupported service defects. [Evidence status](../delivery/STATUS.md) · [internal friction notes](../research/FRICTION-LOG.md).

## Amazon Bedrock / Nova 2 Lite

- **Used for:** bounded English natural-language routing to an existing scenario fact or one allocation preview; selecting a focus from approved authored guidance. The model output is parsed and checked before the application displays or commits anything.
- **Worked well:** one hosted factual request produced a saved warehouse reply; one hosted coaching-focus selection and a saved allocation proposal were observed. The proposal required explicit Apply and could be undone. This let AI support the workflow without granting it authority over stock, deadlines or grading.
- **Needs work / our challenge:** several earlier Lite reservations ended without a usable result. The application also required strict schemas, source validation, retry/idempotency and a bounded allowance to prevent ambiguous outputs or spending. We have not isolated a provider defect from application/prompt or account conditions.
- **Onboarding:** getting from account access to a real call required region/model access, a restricted instance role, correct request schemas and a live trace. A minimal end-to-end example showing structured tool output and error recovery would have reduced integration time.
- **Use again:** yes, for narrow interpretation and content selection with deterministic validation. We would keep important state changes behind explicit user review.

## Amazon Bedrock / Nova 2 Sonic

- **Used for:** an English streamed voice path with microphone capture, a role/revision-bound ticket, source-scoped tool handling and optional generated spoken replies only after assistance is recorded.
- **Worked well:** a historical PowerLab synthetic voice command reached Sonic and produced a saved tool action plus audio. In the hosted career demo, the Sonic ledger recorded incoming audio and usage on three short sessions.
- **Needs work / our challenge:** the hosted Chrome attempt did not yield a visible transcript or saved career voice action. One session ended at an audio input limit and two at idle limits. We are still isolating browser capture timing, WebSocket/UI lifecycle and tool interpretation; do not attribute the issue to Sonic alone. No successful hosted career voice result is claimed.
- **Onboarding:** the stream event format, tool schema serialization and usage accounting required careful comparison of documentation and examples. A full browser-to-WebSocket-to-Sonic sample with timing, stop and error states would help.
- **Use again:** conditionally yes, after a reproducible hosted browser path and cost/usage review. Direct controls remain available when voice is unavailable.

## AWS hosting and deployment

- **Used for:** EC2 runs the single Node app and SQLite on encrypted EBS; CloudFront provides public HTTPS to a private VPC origin; Caddy enforces the origin secret; S3 carries a private source archive; SSM executes cloud builds and maintenance. The instance role is restricted for Bedrock.
- **Worked well:** a public browser demo loaded without reviewer sign-in; one full first shift and replay persisted, and one app-container restart retained the saved assisted shift. The public entry remained accessible while the origin required its private header.
- **Needs work / our challenge:** the account's project region policy required compute in Sydney while Bedrock inference used a separately allowed region. The initial Compose startup needed a YAML tmpfs quoting correction. This was our configuration error, not an AWS outage. Free-plan promotional credit redemption was blocked in the observed UI, so credit availability needs separate verification.
- **Onboarding:** connecting the account's allowed compute region, CloudFront private origin, IAM and a budget estimate took more steps than a single-service tutorial. A clear project-region/credit eligibility view earlier in onboarding would help.
- **Use again:** yes for a bounded hackathon demo, while monitoring EC2/EBS/IPv4 and Bedrock costs and preserving judge access through the evaluation window.

## Form use and attribution

Use the live Devpost form's actual grouping. If it asks separately for every tool/API/SDK, split the AWS hosting paragraph into EC2, CloudFront, S3 and SSM entries and name the AWS SDK for JavaScript only where actually imported. Keep the source of each observation close to the claim. Do not list AgentCore, Strands, DynamoDB or Lambda as runtime tools: this release does not use them.
