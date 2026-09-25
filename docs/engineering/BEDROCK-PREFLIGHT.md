# Bedrock access evidence

Type: evidence record. Observed: 2026-09-23, approximately 04:07 UTC / 11:07 Asia/Ho_Chi_Minh.

## Authorization and scope

The owner explicitly approved **one Nova 2 Lite invocation using at most $0.01 of existing credit**, after disclosure of the model-use terms. Exactly one Run action was performed for this check. This does not authorize repeated model evaluation, credentials/permission grants, an account upgrade or the broader proposed $40 budget.

## Configuration and result

| Item | Observed value |
| --- | --- |
| Surface | AWS Bedrock playground in the existing account |
| Console region | `ap-southeast-2` (Sydney) |
| Model | Amazon Nova 2 Lite v1 |
| Inference profile | `global.amazon.nova-2-lite-v1:0` |
| Prompt | `Reply exactly: READY.` |
| System prompt | Empty |
| Reasoning | Off |
| Maximum output tokens | 128 |
| Temperature / Top P | 0 / 0.9 |
| Built-in grounding / code interpreter | Off / off |
| Returned text | `READY.` |
| Input tokens shown | 51 |
| Output tokens shown | 3 |
| Latency shown | 515 ms |

Evidence source: the visible response and usage counters in the authorized Chrome session. No account ID, authentication URL, credential or private prompt has been copied into this record. The latency is the playground's displayed metric, not a separately measured end-to-end application latency.

## Estimated consumption

Using the reference rates already recorded in [AWS and costs](AWS-AND-COSTS.md), $0.30 per million input tokens and $2.50 per million output tokens:

`51 / 1,000,000 × 0.30 + 3 / 1,000,000 × 2.50 = $0.0000228`

This is a token-based estimate, not an invoiced charge or a freshly reconciled credit balance. The pre-call Console Home displayed $100.00 credit and $0.00 current-month cost. Actual billing can update later.

## What this establishes

The account's existing browser session could invoke this Nova 2 Lite Global profile at the recorded time and receive a response. A paid-plan upgrade was not needed for this observed call. No API key, new IAM permission, AWS CLI setup, database resource or application deployment was created for it.

The Global profile does not guarantee processing only in Sydney. A local application still needs an appropriate credential path and permissions; do not extract or reuse browser session cookies.

## Remaining B01 work

- Choose and authorize the application's AWS authentication mechanism.
- Inspect applicable quota limits and define application request/token caps before broader live usage.
- Set a separate budget for integration/development requests.
- Confirm the proposed DynamoDB access/persistence path.
- Evaluate grounded assessment and tool behavior when requested; a one-word response does not establish teaching quality, reliability or production latency.

## Immediate implementation direction

Proceed with the [first local slice](../delivery/FIRST-SLICE.md), keeping the Bedrock adapter behind the agreed domain contract. Use this profile as the initial integration candidate, with its account authentication and broader usage gates explicitly pending. Keep voice and MCP outside the first milestone.
