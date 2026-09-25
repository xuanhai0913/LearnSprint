# Live Bedrock evaluation — 2026-09-23

Authorization: maximum 5 invocations / $0.10, synthetic learner answers only. Temporary AWS CLI/SDK session access was subsequently authorized. Profile `learnsprint` resolves temporary credentials through the SDK chain; no long-term access key was created. The session inherits the existing account role and is not a production least-privilege setup.

## Observed results

| Call | Sample | Outcome | Input / output tokens |
| --- | --- | --- | --- |
| 1 | Complete answer to q02 | Response rejected by original format/schema boundary; no answer saved | 317 / 143 |
| 2 | Complete answer to q02 | Correct; cited p02; advanced to q03; 2.344 seconds end to end | 317 / 141 |
| 3 | Wrong 403/no-challenge answer | Incorrect; cited p02; advanced to q04; 2.257 seconds end to end | 306 / 97 |
| 4 | Unclear answer | JSON schema rejection; no answer saved | 306 / 77 |
| 5 | Missing header name | **Quality failure:** model marked correct and inferred an omitted required idea; observed in Chrome | 305 / 107 |

All five returned usage. Three responses were accepted by the application; only two accepted assessments matched the intended rubric. This small diagnostic sample does not establish an accuracy rate or teaching quality.

## Cost

1531 input tokens and 565 output tokens. AWS's Sydney Global standard price-list SKUs returned $0.32/M input and $2.63/M output on this date. Estimated token cost: **$0.00198227**. This is not a billing statement. The earlier generic $0.30/$2.50 rates were not the observed Sydney SKU rates.

Source: https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonBedrock/current/ap-southeast-2/index.json

Raw non-sensitive totals: [usage evidence](evidence/bedrock-2026-09-23.json).

## Changes after evaluation

- Accept an exact outer JSON code fence while preserving strict JSON/schema and citation validation. No heuristic repair.
- Allow empty citations only for unassessable clarification; scored responses still require valid sources.
- Strengthen assessment instruction: every required idea must be supported explicitly; never infer missing header/error names. Missing required ideas should be partial, not correct.
- Add a clear budget-exhausted error, with no additional model invocation.
- 26 local tests pass; production build succeeds.

The revised prompt and unclear-response handling have **not** been validated against another live call. All five authorized slots are consumed, including rejected responses. The ledger remains intact. Further live evaluation needs a new bounded authorization; do not reset or replace the batch to bypass it.

## Remaining release gate

Confirm that a missing header is partial and an unclear answer stays unscored under the revised prompt; then review a broader owner-approved evaluation set. Until then, treat Bedrock assessment as a working integration with a known quality issue, not a finished teaching product. Public hosting, owner content review, license/repository publication, video and final submission also remain separate work.
