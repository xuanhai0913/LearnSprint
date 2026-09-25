# LearnSprint — developer friction log

Prepared 2026-09-25 for the optional Devpost friction-log URL. These are first-hand integration observations, not claims of an AWS outage. Account identifiers, promotional codes, credentials and session URLs are omitted. [Current product feedback](PRODUCT-FEEDBACK.md) · [internal evidence log](../research/FRICTION-LOG.md).

## F1 — Promotional-credit eligibility appeared at redemption

- **Tool/surface:** AWS Billing promotional-credit redemption during hackathon onboarding, 2026-09-23.
- **Task and steps:** We had received a hackathon promotional code by email. After signing into the AWS account, we opened Billing/Credits and selected the redemption action.
- **Expected:** Enter the code or learn eligibility requirements before reaching this step.
- **Actual:** The visible UI said the account's Free plan could not redeem credits and directed us toward a paid plan. We did not submit the code or upgrade the account. This is a plan-eligibility observation, not a billing-charge claim.
- **Severity / impact:** Medium for hackathon onboarding. The advertised credit could not be used through that account state, while development and the bounded hosted demo continued with other available account resources.
- **Workaround:** Leave the code unredeemed and defer any plan/billing decision. The workaround does not establish that the promotional credit was successfully applied.
- **Suggested improvement:** State Free-plan eligibility and any upgrade/billing implications in the credit-request or delivery instructions, before entrants receive a code. Show an explicit eligibility check in the redemption flow.
- **Evidence limit:** Observed in the authorized Chrome session; no shareable screenshot or account-specific reproduction package was saved. The UI was in French, so this is an English paraphrase rather than an exact quotation.

## F2 — Nova 2 Sonic tool-schema examples use different representations

- **Tool/surface:** Amazon Nova 2 Sonic tool configuration, AWS SDK for JavaScript 3.1138.0, 2026-09-23.
- **Task and steps:** Implement a streaming voice tool with a structured input schema. We compared the [Nova tool-configuration guide](https://docs.aws.amazon.com/nova/latest/nova2-userguide/sonic-tool-configuration.html) with the [AWS voicebot sample](https://github.com/aws-samples/sample-voicebot-nova-sonic), specifically its `src/tools/Tool.ts` implementation.
- **Expected:** The documentation and JavaScript sample would show the same wire representation, or label conceptual JSON versus the serialized event value.
- **Actual:** The guide illustrated `inputSchema.json` as an object; the sample serialized the schema with `JSON.stringify`. We had to inspect both before making a paid stream call. The string representation worked in one historical synthetic PowerLab tool-action spike. We did **not** send the object variant, so we do not claim it fails.
- **Severity / impact:** Low documentation friction. It added uncertainty and preparation time, but did not cause an observed failed provider invocation.
- **Workaround:** Follow the sample's serialized shape for the SDK event and keep the app's tool input validated independently.
- **Suggested improvement:** Put a complete, runnable AWS SDK for JavaScript event example next to the conceptual schema, with a note on when `JSON.stringify` is needed.
- **Evidence limit:** The working synthetic spike is documented in [voice evidence](../engineering/VOICE-SPIKE.md). The hosted career microphone path is still unverified and is not presented here as a proven provider defect.
