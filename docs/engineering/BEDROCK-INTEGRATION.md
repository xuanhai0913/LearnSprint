> R3 context: this document describes the existing quiz/API foundation. Current PowerLab education scope is planned in `docs/PROJECT-CONTEXT.md`; do not treat these instructions or old checks as completion of E-requirements.

> Historical implementation notes below may contain earlier pending work. Use [current status](../delivery/STATUS.md) and the [R3 roadmap](../delivery/ROADMAP.md) for present scope.

> Update 2026-09-23: temporary credentials and five live invocations have now been verified. The cap is exhausted. See [evaluation results](../delivery/LIVE-EVALUATION-2026-09-23.md); earlier preparation notes below describe the preceding state, not current blockers.

# Bedrock integration preparation

Updated: 2026-09-23. Source compiles; no live invocation or behavioral tests performed.

## Implemented

- Server-only AWS SDK v3 Converse adapter, pinned to `@aws-sdk/client-bedrock-runtime` 3.1138.0.
- Shared asynchronous assessment boundary; validated server startup configuration selects fixture (default) or Bedrock. No live configuration was enabled.
- Provider work occurs before the SQLite session transaction. The transaction rechecks revision/state and atomically saves the answer and next question. Concurrent state changes reject stale results.
- Prompt includes the question, rubric, misconceptions and allowed passage excerpts. Learner text is explicitly untrusted data. No tools, uploads or arbitrary external retrieval.
- Strict JSON schema, bounded rationale, valid outcome enum, and unique citations drawn only from supplied passage IDs. Invalid/truncated responses are rejected; no automatic JSON repair or fallback grade.
- Maximum 4,000 answer characters, 16,000 bytes of serialized context, 512 output tokens, a 20-second request timeout and SDK `maxAttempts: 1`.
- Durable invocation reservations in `.data/model-invocations.sqlite`, counted against an explicit approval batch and invocation cap. A reserved/uncertain request cannot automatically invoke again. Completed matching requests can reuse their saved result.
- Actual input/output token counts are recorded when AWS returns them, including when subsequent response validation fails. Unknown usage stays unknown. SDK errors and raw model responses are not exposed to the client.

## Configuration and mode isolation

Server environment selects `LEARNSPRINT_ASSESSMENT_MODE`, defaulting to `fixture`. `bedrock` additionally requires explicit approval, an approval batch ID, invocation limit, reservation budget and per-attempt reservation. See `.env.example`. Environment files are not automatically loaded; export variables into the API process. Missing/invalid live settings stop startup. No settings or secrets are accepted from the browser.

Sessions and answers carry `fixture` or `bedrock`. Recommendations use prior sessions of the same mode. Answer submission rejects a session whose mode differs from the active provider. Fixture outcome controls appear only in fixture mode; live mode discloses AWS transmission and AI limitations. Old session history remains readable after a server mode change.

Approval batch settings are persisted and immutable. Every reserved attempt consumes one call and one configured dollar reservation, including timeouts and failures. The adapter does not refund reservations automatically. A completed matching request can reuse the recorded result. Do not delete ledger files or invent a new approval ID to replenish capacity.

**This reservation policy is not an AWS billing guarantee.** Nova 2 Lite currently lists Count tokens as unsupported. A dollar reservation must be chosen conservatively using current rates, context/output bounds and measured usage. Actual input/output token counts are recorded, but invoice reconciliation remains external. No live batch or default dollar amount has been assumed.

## Still required before activation

1. Choose an owner-authorized local AWS credential method using the SDK credential chain; never frontend secrets.
2. Agree a new bounded invocation budget and conservative per-call reservation from current pricing. The earlier $0.01 playground approval is already consumed.
3. Perform requested behavioral verification: mode changes, pause/resume, citation validation, conflicts and uncertain retries. Build success does not establish these behaviors.
4. Enable the approved server configuration, then validate Nova request compatibility and teaching quality within that budget.

No AWS credentials were created or inspected, no live environment variables were set and no invocation occurred during implementation. The app remains in fixture mode. This is not yet demonstrated AWS Builder integration.

## Sources

- [AWS Converse API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html)
- [Inference configuration](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InferenceConfiguration.html)

- [Nova 2 Lite capabilities](https://docs.aws.amazon.com/en_en/bedrock/latest/userguide/model-card-amazon-nova-2-lite.html)
