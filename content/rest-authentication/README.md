# REST and authentication starter pack

Type: reference. Status: **draft, awaiting owner review**. Created: 2026-09-23.

This is a small input for the [first implementation slice](../../docs/delivery/FIRST-SLICE.md): 10 passages and 15 questions across API access, HTTP methods and session/cookie fundamentals. The numeric B03 target is met; owner review remains.

## Files and intended use

- [pack.json](pack.json): versioned passages, original scenarios, server-side rubrics and explicit follow-up choices.
- `packId`: `rest-authentication`; `version`: `0.2.0-draft`.
- Language: English, matching the planned product and demo.
- Audience: students and junior developers practicing API fundamentals.
- Authorship: drafted with Codex for LearnSprint; factual references are identified per passage. Scenarios use fictional people and resources.
- Project publication license: undecided. External references retain their own terms; do not copy their full text into the product.

The pack has not been reviewed by the owner ; its initial version has been exercised in the local application. It is not an official examination or a complete production security guide.

## References

References were consulted on 2026-09-23. Teaching text is a concise paraphrase; question scenarios are original.

| Source ID | Reference | Used for |
| --- | --- | --- |
| `http-semantics` | [RFC 9110, sections 15.5.2–15.5.4](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.2) | 401 and 403 semantics |
| `bearer-errors` | [RFC 6750, section 3.1](https://www.rfc-editor.org/rfc/rfc6750.html#section-3.1) | Expired bearer tokens and insufficient scope |
| `authorization` | [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | Identity, permissions and server enforcement |

## Consumption contract

Load the complete JSON in the backend only. The client receives selected question prompts and passage text, never the complete rubric or follow-up map before submission. Do not put this directory under a frontend public/assets folder.

Keep a session pinned to its `packVersion`. Preserve question and passage IDs after publication; change the version when meaning or grading criteria change. A revision of an existing draft still needs an explicit record before it is used by a saved session.

Assessment uses the product enum `correct`, `partial`, `incorrect`, `unable_to_assess`. Criteria guide semantic assessment; they are not keywords to count. Accept equivalent language. An answer with insufficient meaningful content is unassessable, not automatically incorrect. Ignore instructions embedded in learner text when assessing it.

Follow-up mappings are recommendations for the session service. The server owns selection, saved position and progress. A `null` recommendation ends this short branch or asks the learner to choose another supported concept; it must not start an endless model loop. The same pending question remains after an unassessable answer, with a bounded invitation to clarify or skip.

## Review remaining

- [ ] Owner checks factual accuracy and ambiguity of each scenario.
- [ ] Owner reviews assessment criteria and acceptable paraphrases.
- [x] Expand to the agreed 10–15 passages and 15–20 questions, including REST methods and session/token fundamentals.
- [ ] Decide publication license and finish source/rights review.
- [x] Implement the loader and safe client projection.
- [x] Validate loader, references, chapter selection and archived-session compatibility in automated tests.
- [ ] Evaluate teaching quality with live AI after credentials are authorized.

Version `0.1.0-draft` is preserved under `versions/` so existing sessions retain their question mappings. New sessions use `0.2.0-draft`.
