# AWS roles, credits and delivery budget

Type: reference/planning model. Revision 3. Checked 2026-09-23. Pricing facts, account observations and proposed spending are distinct.

## Current cloud observation — 2026-09-24

Owner authorized AWS-credit hosting with cloud builds and no local tests. Free-plan remaining balance was **$120**; the separately reported $150 voucher is not redeemed/verified. Assigned region is Sydney (`ap-southeast-2`). One t3.small + 30 GiB encrypted gp3 + IPv4 has been provisioned with SSM management and CloudFront VPC-origin ingress. Approximate monthly base at 730 hours: $19.272 compute + $2.88 disk + $3.65 IPv4 = **$25.802**, excluding S3, transfer, backups and AI. This is a price estimate, not measured spend or a hard cap. CPU credits use standard mode. Initial hosted AI is disabled and historical/local ledgers are preserved. No Paid-plan upgrade or advanced features were activated. See [current deployment status](../delivery/STATUS.md).

## Credit position

The owner reports a newly received $150 promotional credit email and prefers a stronger project over excessive cost minimization. Plan against a $150 project envelope, contingent on redemption, eligibility and expiry. Do not add it automatically to the earlier $100 Free Tier display.

The last observed account was on the Free plan, and credit redemption requested a Paid plan. This turn has not reopened private email/billing, redeemed a code or changed the account. Current [AWS account-plan documentation](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html) says Free plans are not eligible for other promotional credits. At the implementation/deployment gate, inspect the actual credit, expiry and covered services; prepare any necessary account change for the owner's informed decision. A received email is not a verified billing balance.

No inference or cloud deployment was performed for this research revision. The earlier five-call batch is exhausted; keep its immutable ledger. Configure any new implementation allowance as a named capped budget under the active authorization, without repeatedly asking for individual calls already covered by that allowance.

**Subsequent implementation observation:** one real Nova 2 Sonic stream succeeded on September 23 in `us-east-1`, using the existing profile. It does not verify promotional redemption, remaining balance or hosting access. The local voice batch `powerlab-sonic-spike-2026-09-23` reserves up to **$1 across four sessions**, $0.25 each, maximum 60 seconds/session, within the planned $35 speech allocation. One reservation was consumed; its reported usage estimates **$0.00225955** at the snapshot rates. Three reservations remained immediately afterward. Preserve `.data/voice-invocations.sqlite` separately from the exhausted quiz ledger. [Exact evidence and limits](VOICE-SPIKE.md).

## Career C06 allowance — 2026-09-24

A separate local career configuration now permits 10 Lite reservations at $0.02 each ($0.20) and four Sonic sessions at $0.25 each ($1.00), maximum 60 seconds/session. It is within the existing text/speech development allocations under the owner's continued authorization. No career inference was made while implementing C06; availability, actual usage and credit redemption have not been freshly observed.

The career ledger preserves model/mode/region/profile and immutable bounds separately from quiz and PowerLab. Failed/uncertain reservations count. The $1.20 combined envelope is an application reservation limit, not a measured invoice or guaranteed billing cap. Generated career audio is suppressed by default. C07 permits an explicit spoken-reply opt-in after recorded assistance; coach focus shares the same 10-call text batch. No batch was enlarged. Provider generation can still incur usage even when output is suppressed. [Exact configuration, controls and evidence](../career/AI-CONVERSATION.md).

The historical PowerLab observation above describes its first successful call. A later short stopped connection with no usage report left two of four reservations available at the latest recorded observation. It remains a separate batch.

## C09 first preview architecture — prepared September 24

The initial demo is now concretely prepared as one EC2 machine with a Caddy HTTPS/reviewer-password gateway and persistent encrypted EBS for the existing SQLite store. Its Docker/Compose source and source archive exist; Docker is absent locally and no resources are provisioned. Account eligibility, instance price, DNS, role/model access and the hosting allocation are still release gates. [Runbook](../../deploy/README.md).

Hosted AI defaults disabled. Optional career `awsProfile` supports an instance role; no new allowance or migration has been executed. Preserve the ledger together with its configuration when deliberately migrating. The broader service table below remains an architecture option, not a claim that those services are in use or necessary for the first hosted demo.

## Which services do useful work?

| Service/tool | Planned role | What consumes credit |
| --- | --- | --- |
| Bedrock Nova 2 Lite | Evidence-aware coaching and optional supported-brief extraction | Billed input/output including tool context and any billable reasoning |
| Bedrock Nova 2 Sonic | Speech understanding, responses and typed tool requests | Speech and text token usage; open sessions need duration/idle limits |
| Strands TypeScript | Bounded text coaching orchestration | SDK has no separate hosted charge; its model/tool calls can incur costs |
| AgentCore Runtime | Hosted persistent voice bridge | Compute/memory/session usage and associated storage/transfer |
| Lambda + API Gateway | Domain commands, coach, reports, guest/ticket endpoints | Requests, execution and transfer |
| DynamoDB on-demand | Plans, evidence, capability hashes and budget reservations | Reads/writes/storage |
| S3 + CloudFront | Static app and approved assets | Storage, requests and transfer |
| ECR / CloudWatch | Container image and operational evidence | Storage/log ingestion/retention |

Local editing, a local authored simulation and reading source cards do not invoke AWS. Coding-assistant subscriptions, domains or non-AWS tools are not automatically paid by AWS credits. Coverage follows the actual credit and [AWS credit terms](https://aws.amazon.com/awscredits/).

## Current price snapshot and reproducible arithmetic

Public AWS price-list data fetched on September 23, publication timestamp September 22, 2026. Target region N. Virginia. Selected rows are saved in [the JSON snapshot](../research/aws-price-snapshot-2026-09-23.json). [Official regional price list](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonBedrock/current/us-east-1/index.json), [Nova pricing](https://aws.amazon.com/nova/pricing/).

| Model / rate category | USD per 1,000,000 tokens |
| --- | ---: |
| Nova 2 Lite, Global standard input | 0.30 |
| Nova 2 Lite, Global standard output | 2.50 |
| Nova 2 Sonic, speech input | 3.00 |
| Nova 2 Sonic, speech output | 12.00 |
| Nova 2 Sonic, text input | 0.33 |
| Nova 2 Sonic, text output | 2.75 |

These are different SKUs from the historical Sydney route ($0.32/$2.63 per million Lite input/output). Preserve the old calculation with its region; do not rewrite past usage with the new rate.

Illustrative mission workload, **not measured**: 30,000 Lite input + 3,000 Lite output tokens across all requests = $0.01650. Add 10,000 Sonic speech input + 5,000 speech output + 4,000 text input + 1,000 text output = $0.09407. Combined model arithmetic = **$0.11057** per hypothetical voice-enabled mission.

At that exact workload: 100 missions ≈ $11.06 and 500 ≈ $55.29 for models alone. Token counts are assumptions, not a conversion from minutes. Real speech volume, context replay, retries, image inputs, silence handling and provider billing determine actual usage. Infrastructure is additional. Do not promise a number of months or unlimited users from a credit amount.

[AgentCore pricing](https://aws.amazon.com/bedrock/agentcore/pricing/) meters runtime CPU and memory; memory can accrue while a session remains open even when CPU is waiting. Close idle sockets. The hosting allocations below are allowances, not a verified AWS package price.

## Proposed $150 allocation

| Purpose | Allowance |
| --- | ---: |
| Text coach/content experiments and evaluation | $25 |
| Speech development, voice evaluation and rehearsals | $35 |
| Hosting, data, logs and deployment work before submission | $20 |
| Judge-period service availability and live usage | $25 |
| Unallocated contingency | $45 |
| Total | $150 |

This comfortably targets a small pilot and demonstrations under the illustrative usage model, not a large public launch. Developer time and reliable content are more restrictive than model tokens. Spend reserves on verified weaknesses rather than unneeded services.

## Runtime controls

- Named project-level allowance plus per-session limits; reserve before inference and retain uncertain/failed attempts.
- Bound model rounds, context and output; explicit model ID; no automatic unaccounted retries.
- Separate speech reservations, short initial evaluation sessions, idle timeout, maximum session length and actual usage reporting. Adjust ceilings after measurement.
- Hosted guest quotas, one active voice stream per learner, global concurrency/spend controls, rate limits and revocable access.
- Budget alerts at $25/$50/$80/$105 actual or forecast use; investigate before drawing from the $45 reserve. Alerts are delayed notifications, not hard stops.
- Record all resources with region, owner, purpose and teardown action. Short log retention; no NAT gateways, provisioned model throughput or unused always-on resources in the default stack.
- Keep an authored offline path available if live guidance is exhausted. Do not mislabel it as live AI.

## Judge availability and historical usage

Plan the review path from submission through November 20 Pacific time, including the earlier schedule-page start. Keep a free reproducible repository path and a stable hosted entry target. No judge needs the owner's credentials or a paid AWS account for the baseline exercise. Maintenance/teardown happens after the evaluation obligation, under active authorization.

Historical evidence: one approved playground call, then five application calls totaling 1,531 input and 565 output tokens, estimated $0.00198227 on the historical route. One incorrect grading decision remains documented. [Live evaluation](../delivery/LIVE-EVALUATION-2026-09-23.md). These calls do not validate the R3 coach or voice pipeline.
