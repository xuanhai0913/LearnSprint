# R3 security and learner data

Type: reference. Proposed release controls. The existing single-local-learner quiz is not suitable for public deployment without the new isolation boundary.

## Data minimization

The first pilot uses adults, pseudonyms, fictional device data and a small authored lesson. Collect only what supports the session and agreed research. Do not request school grades, student IDs, health data, household recordings or personal device photographs in P0.

Microphone access is explicit. Stream audio only while active; do not retain raw audio by default. Keep minimal interpreted command events and required source/run references. Never log credentials, promotional codes, full signed URLs or model private reasoning.

## Identity and access

Use high-entropy opaque guest capabilities bound to a specific learner/session. Store hashes; transmit securely; prefer HttpOnly/Secure/SameSite cookies for the HTTP flow with a same-origin deployment path. Guest IDs are not authorization by themselves. Validate ownership on every read/write and disable caching of private responses.

A resume mechanism must retain the same owner scope; a shared default account is not acceptable. P0 supports same-browser continuity. Cross-device recovery and full institutional accounts are later features, not an excuse to expose a guessable resume code.

Voice receives a short-lived, one-use application ticket bound to session and allowed actions, in addition to the runtime connection authorization. Validate before audio/tool execution. Never trust a model-supplied owner ID, and never expose AWS credentials to the browser. Apply limits to ticket minting, connection attempts and active streams.

A tutor report is private by default. The learner previews it and explicitly creates an expiring, revocable capability. It grants report read access only, not learner edits or other records. Avoid public indexing/referrer leakage. P0 sharing creates no automatic email or public post.

## Application and cloud boundary

- Server-side schema/size validation, output escaping, source allowlists and controlled retrieval.
- Fixed engine and immutable lesson rules; no generated code execution.
- Phase guards prevent hidden answer retrieval and assistance leakage.
- Conditional writes, idempotency and revision checks protect against voice/manual races.
- Scoped deployment roles and resource policies; private S3 origin; TLS; no browser secrets.
- Budget/concurrency limits before opening a public guest path; fail gracefully to authored mode.
- Cross-region model processing is disclosed; do not promise residency absent a supported configuration.

## Retention and removal targets

Proposed defaults: voice buffers only for the active connection; redacted operational logs 7 days; ordinary guest artifacts 30 days unless the learner chooses a shorter deletion; report grants 7 days or earlier revocation. Keep a specifically designated synthetic judge/demo dataset available through evaluation. Research consent/notes have their own agreed retention and private location.

Deleting learner content must revoke report grants and associated content. Preserve only the minimal non-identifying usage/billing records needed for cost integrity; a demo reset cannot reset spend reservations. Implement these controls before claiming they exist.

The lab evaluates fictional schedules and does not provide instructions for real electrical installation. Distinguish application arithmetic from educational interpretation; reports are practice evidence, not certification or high-stakes automated student decisions.
