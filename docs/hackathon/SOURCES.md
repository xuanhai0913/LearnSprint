# Source register — education strategy R3

Type: reference. Public sources reviewed 2026-09-23. Prefer this dated register over an unqualified memory of product capabilities. Research interpretations are in [competitive landscape](../research/COMPETITIVE-LANDSCAPE.md).

## Competition

| ID | Primary source | Use / retrieval note |
| --- | --- | --- |
| H01 | [Rules](https://amazonappdev2026.devpost.com/rules) | Track exception, eligibility, judging and submission conditions; September 16 repository update visible |
| H02 | [Overview](https://amazonappdev2026.devpost.com/) | Track/challenge and submission summary |
| H03 | [FAQ](https://amazonappdev2026.devpost.com/details/faqs) | Gated Alexa tools, local review option, current private-repo reviewers and judging window |
| H04 | [Dates](https://amazonappdev2026.devpost.com/details/dates) | Submission cutoff and conflicting judging-start date |
| H05 | [Resources](https://amazonappdev2026.devpost.com/resources) | Official tool starting points and credit-form link |
| H06 | [Updates index](https://amazonappdev2026.devpost.com/updates) | Recent organizer emphasis on moving beyond basic experiences; full “Got an idea?” article fetch failed this revision |

Unresolved discrepancy: H04 starts judging October 26; H01/H03 use November 9. Maintain evaluation access across the broader interval. The Alexa simulation exception in H01 is explicit; do not accidentally apply a stricter general runtime hook to that alternate route.

## Established education products

| ID | Primary source | What was used |
| --- | --- | --- |
| C01 | [ChatGPT Study Mode](https://help.openai.com/en/articles/11780217-using-study-mode-in-chatgpt) | Guided learning and source/context capabilities |
| C02 | [ChatGPT interactive math/science](https://openai.com/index/new-ways-to-learn-math-and-science-in-chatgpt/) | March 10, 2026 interactive visual module announcement |
| C03 | [OpenAI teen access update](https://openai.com/index/why-teens-deserve-access-safe-ai/) | Later July 16 update confirming expanded interactive learning; do not treat launch topic count as a current cap |
| C04 | [Gemini study notebooks](https://blog.google/innovation-and-ai/products/gemini-app/gemini-study-notebooks/) | June 25 adaptive lessons, diagnostics, progress and connected sources |
| C05 | [Guided Learning](https://blog.google/products-and-platforms/products/education/guided-learning/) | Multimodal learning approach |
| C06 | [Khanmigo learners](https://www.khanmigo.ai/learners) | Learner/tutor positioning and teacher context |
| C07 | [Google/Khan Academy classroom update](https://blog.google/products-and-platforms/products/education/khan-academy-back-to-school/) | August 27 diagrams and teacher-controlled practice |
| C08 | [Brilliant interactive learning](https://brilliant.org/ai/) | Authored interactive problem solving and feedback |
| C09 | [PhET](https://phet.colorado.edu/) and [Studio FAQ](https://phet.colorado.edu/fa/studio/overview/faq) | Simulations, customization and licensing distinction; English content returned at locale URL |
| C10 | [Labster](https://www.labster.com/) | Lab catalog, assessment and institutional workflow; vendor impact claims not adopted as our evidence |
| C11 | [Duolingo Video Call](https://blog.duolingo.com/video-call/) | Spoken practice integrated into a learning path |

## Hackathon precedents

| ID | Source | Evidence limit |
| --- | --- | --- |
| P01 | [CounterWorlds](https://devpost.com/software/counterworlds) | Read author page; not independently run |
| P02 | [WrongWorlds](https://devpost.com/software/wrongworlds) | Read author page; not independently run |
| P03 | [OmniCanvas](https://devpost.com/software/omnicanvas) | Indexed author description read; direct fetch limited |
| P04 | [SOLTutor.ai](https://devpost.com/software/soltutor-ai) | Indexed author description read; direct fetch limited |

These entries establish relevant prior art, not verified rivals in this competition or evidence of winning status.

## Learning science and lesson facts

| ID | Primary source | Use |
| --- | --- | --- |
| L01 | [Bastani et al., PNAS](https://doi.org/10.1073/pnas.2422633122) | Distinguish supported practice from unaided outcomes; setting-specific findings |
| L02 | [Kestin et al., Scientific Reports](https://www.nature.com/articles/s41598-025-97652-6) | Structured AI tutoring study; direct open failed once, primary indexed article text was available |
| L03 | [PhET research](https://phet.colorado.edu/en/research) | Activity framing, design research and limits of simulation substitution |
| L04 | [EIA measuring electricity](https://www.eia.gov/energyexplained/electricity/measuring-electricity.php) | Power/energy units; scenario/device values are our fictional fixtures |

## AWS and agent implementation

| ID | Primary source | Use |
| --- | --- | --- |
| A01 | [AWS account plans](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html) | Free-plan promotional-credit restriction |
| A02 | [AWS credit terms](https://aws.amazon.com/awscredits/) | Eligibility, coverage and billing conditions |
| A03 | [Nova pricing](https://aws.amazon.com/nova/pricing/) | Price categories; dynamic tables supplemented with public price-list JSON |
| A04 | [N. Virginia Bedrock price list](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonBedrock/current/us-east-1/index.json) | Exact selected rates; [saved snapshot](../research/aws-price-snapshot-2026-09-23.json) |
| A05 | [Model region compatibility](https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html) | Sonic regional endpoint vs Lite cross-region options |
| A06 | [Nova 2 Sonic model card](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-2-sonic.html) | Model ID and capabilities |
| A07 | [Sonic service card](https://docs.aws.amazon.com/pdfs/ai/responsible-ai/nova-2-sonic/nova-2-sonic.pdf) | Documented language set; Vietnamese not listed |
| A08 | [Sonic tool configuration](https://docs.aws.amazon.com/nova/latest/nova2-userguide/sonic-tool-configuration.html) | Tool event/result handling and validation |
| A09 | [AgentCore WebSocket runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-websocket.html) | Transport, endpoint contract and supported authentication |
| A10 | [AgentCore pricing](https://aws.amazon.com/bedrock/agentcore/pricing/) | CPU/memory billing and service separation |
| A11 | [Strands TypeScript quickstart](https://strandsagents.com/docs/user-guide/sdk/quickstart/typescript/) | Node/TypeScript tool integration |
| A12 | [Strands SDK feature overview](https://strandsagents.com/docs/user-guide/sdk/quickstart/overview/) | Python/TypeScript feature difference; do not assume bidirectional TS support |

## Private state and uncertainty

The earlier owner-authorized Chrome session observed an incomplete Devpost draft, a Free-plan AWS account and a promotional-redemption block. No account/code/email details are reproduced. In the current request the owner reports a $150 promotional email; its redeemed balance/expiry were not independently checked this turn.

All schedules, feature priorities, workloads, staffing assumptions and pilot thresholds are our proposals. Recheck APIs/prices at implementation and public rules near submission. A cited vendor feature is not proof of account access, a measured comparison or LearnSprint effectiveness.
