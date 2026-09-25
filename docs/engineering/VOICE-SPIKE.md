# PowerLab voice implementation and live feasibility

Type: reference / observed evidence. Date: 2026-09-23. Backlog: early R06, partially implemented. One synthetic command completed against real Amazon Nova 2 Sonic; full voice, microphone and learning-flow acceptance remain open.

## Delivered behavior

PowerLab practice A has optional English voice controls. The learner starts the microphone explicitly, says one supported control and sees the committed schedule or run in the same workspace. The domain service still owns every result. Direct controls require no model request.

- `Turn off the fan for hour four` → `set_device_slot` with exact device, hour and state.
- `Run the plan` → `run_plan` for the current saved artifact.
- `Undo the last edit` → `undo_last_edit` restoring the previous voice edit in this connection. History and runs remain immutable.
- Transcript, factual receipt, Stop playback, Stop voice and manual Undo last edit controls are implemented. All three tool paths compile; only the first command above has live evidence in this increment.

Voice cannot start with an unsaved draft or paused practice. Direct editing is locked while voice is active and while the final saved revision is being refreshed. Stop closes microphone tracks immediately; the client waits briefly for server closure before loading the final state. A user can still view hour previews and prior results.

The current grammar accepts a small set of explicit English device/hour commands. It does not interpret conversational requests such as “make it more efficient.” This is an initial control adapter, not the planned conversational coach. B/C and independent assessment are unavailable through this adapter; adding them requires the planned assistance boundary.

## Source and transport

| Responsibility | Source |
| --- | --- |
| Public voice events, ticket/status, action origin | `packages/contracts/src/powerlab.ts` |
| Shared local owner capability | `apps/api/src/powerlab/identity.ts` |
| Operator configuration | `apps/api/src/powerlab/voice/config.ts` |
| Separate reservations and usage | `apps/api/src/powerlab/voice/ledger.ts` |
| Explicit grammar and tool schemas | `apps/api/src/powerlab/voice/commands.ts` |
| Bedrock bidirectional event transport | `apps/api/src/powerlab/voice/sonic.ts` |
| Owned session/revision/tool application | `apps/api/src/powerlab/voice/service.ts` |
| HTTP status/ticket and WebSocket upgrade | `apps/api/src/powerlab/voice/controller.ts`, `gateway.ts` |
| Mic, transcript, receipts and recovery UI | `apps/web/src/powerlab/VoiceDock.tsx` |
| Browser capture and playback | `apps/web/src/powerlab/voice-audio.ts`, `apps/web/public/powerlab/pcm-worklet.js` |

Browser → same-origin `/api/lab/voice` WebSocket → local Nest bridge → `InvokeModelWithBidirectionalStream` in the AWS SDK. Vite proxies WebSocket upgrades in development. Credentials stay in the server's existing AWS profile; they are never sent to the browser. This local bridge is not an AgentCore deployment or a native Alexa integration.

Model: `amazon.nova-2-sonic-v1:0`, region `us-east-1`, SDK `@aws-sdk/client-bedrock-runtime` 3.1138.0. New dependencies are `ws` 8.21.3 and `@types/ws` 8.18.1, pinned in the lockfile. Audio input is mono 16 kHz PCM16 little-endian in 32 ms frames; output is mono 24 kHz PCM16 with voice `matthew`. The browser uses AudioWorklet capture and Web Audio playback. An unavailable 16 kHz context produces a visible fallback message; no custom resampler is shipped.

### Endpoints and command boundary

- GET `/api/lab/voice-status`: owner-bound availability and remaining local allowance; it does not call AWS or guarantee credentials are still valid.
- POST `/api/lab/sessions/:id/voice-ticket`: UUID request ID and saved revision; returns a 30-second, single-use ticket bound to owner, session and revision.
- WebSocket `/api/lab/voice`: exact loopback Host/Origin allowlist and owner cookie; first message is `{ type: "start", ticket }`. Audio is binary; `stop`, `mute` and `undo` are small JSON controls. The ticket is never in the URL.
- Before mutation, a strict tool schema must match the latest final user transcript's supported grammar. Unknown/mismatched, expired or previously consumed utterances cannot authorize another action.
- Domain ownership, practice-A phase, revision and limits are rechecked for every action. The same domain transaction commits the artifact/run, action and receipt. Repeated provider tool IDs return their stored result without a second mutation.
- Voice actions carry `origin: voice` and the local voice-session ID. The manual Undo button carries `origin: manual` plus that voice-session ID. Existing manual request fingerprints remain compatible.
- Early assistant speech is suppressed; successful tool commit unlocks confirmation audio/text. Generated wording is still model output, not validated deterministic TTS. Visible domain receipts remain authoritative.

## Local configuration and limits

Voice is disabled unless the operator creates `.data/voice-config.json` (or the same filename under `LEARNSPRINT_DATA_DIR`). This file is ignored by Git. The active local batch is:

```json
{
  "enabled": true,
  "batchId": "powerlab-sonic-spike-2026-09-23",
  "awsProfile": "learnsprint",
  "region": "us-east-1",
  "modelId": "amazon.nova-2-sonic-v1:0",
  "maxSessions": 4,
  "budgetUsd": 1,
  "reservePerSessionUsd": 0.25,
  "maxDurationSeconds": 60
}
```

The owner's continuation accepted the proposed live feasibility step; earlier broad authorization covers this named bounded implementation allowance. The synthetic spike consumed one reservation. A later short connection at 16:15:23–16:15:25 Vietnam also reserved a slot and stopped with zero recorded audio bytes/tools and no usage report. Its initiator is not established by the ledger. **Two of four reservations remain at the latest observation.** Missing usage for the short connection is unknown, not zero billing. User-started sessions also consume this allowance. This is within the proposed $35 voice development allocation, not an additional $150 allocation.

`.data/voice-invocations.sqlite` reserves before network I/O, includes uncertain/failed attempts and stores usage plus terminal state. Settings for an existing batch cannot change. Missing usage is unknown, not zero cost. Do not reset this database or recycle the old quiz ledger to regain attempts. A later allowance must follow the active project authorization and retain prior history.

Limits: 60 seconds from stream start, 20-second connection deadline, 25 seconds without a finalized utterance, at most six tool requests, one connection per owner and two total, bounded input/output bytes and queues, 512 output tokens per inference turn, SDK automatic retries disabled. Stop sends end events and aborts after 1.5 seconds if needed. A usage estimate reaching the reservation stops the stream. Reservations and delayed usage are application controls, not a guaranteed AWS invoice ceiling.

No application audio or transcript persistence is added: the browser retains recent transcript lines only in its current view, and the bridge processes raw audio in memory. The ledger retains identifiers, counts and estimated usage; the practice database retains factual actions. This does not make a claim about AWS service retention. Synthetic input for this feasibility run was generated into temporary local files, separately from the app.

## Actual live observation

Observed **2026-09-23 16:11:44–16:11:59 Vietnam** (09:11 UTC), in one paid stream. Existing AWS authentication and the model catalog were checked before invocation. Credentials, account IDs, cookies and tickets were excluded from the evidence output.

1. Generated synthetic English speech locally with macOS `say` and converted it with `afconvert` to 16 kHz mono PCM16. The phrase was “Turn off the fan for hour four.” No person’s microphone was captured.
2. Created a separate synthetic owner's practice through the local API, then obtained a ticket and connected through the actual Vite WebSocket proxy.
3. Streamed the phrase and silence at natural frame cadence.
4. Received the final user transcript, exactly one tool receipt, assistant transcript and 182,400 bytes of confirmation audio.
5. Stopped the stream and read the saved practice back through the API: revision 2, fan hours `h1`, `h2`, `h3`, with a voice-origin edit. The terminal ledger reason was `user_stop`.

| Observed event | Time from probe socket creation |
| --- | ---: |
| Ready | 4,382 ms |
| Final user transcript | 7,789 ms |
| Committed edit receipt | 8,330 ms |
| Assistant transcript | 13,457 ms |
| Closed | 15,587 ms |

The assistant transcript repeated the receipt: “Desk fan is off for hour 4. Plan version 2 is saved.” Receipt latency from the final user transcript was 541 ms in this single sample. These are observations, not performance guarantees. Audio bytes were received; human listening quality and actual browser microphone/playback are not established by the probe.

| Provider usage | Tokens |
| --- | ---: |
| Speech input | 219 |
| Text input | 710 |
| Speech output | 95 |
| Text output | 83 |

Estimated model cost: `(219×3 + 710×0.33 + 95×12 + 83×2.75) / 1,000,000 = $0.00225955`, using the saved regional price snapshot. This is not an AWS billing balance or confirmation of credit redemption. The $0.25 reservation stays consumed even though the estimate is lower.

Raw synthetic event evidence and the one-off probe script remain under ignored `.data/sonic-spike-*` and `.data/sonic-spike.mjs`; the durable redacted observations are recorded above. Preserve the voice ledger. Existing quiz invocation reservations were not changed.

## Checks, limits and next work

- API TypeScript and web TypeScript/Vite compilation passed.
- Opened an existing saved practice in Chrome: Start voice, example commands, Mic off and the audio notice were present. Opening the page did not start a microphone or another model request.
- The live probe covered the connection, one command, persisted revision and received confirmation audio. It did not cover spoken Run/Undo, browser permissions/playback, disconnect races, cross-tab conflicts, malicious inputs, keyboard/mobile flows or user comprehension. No broad application test suite was added or run.
- Client closing/cancellation handling was refined after the live probe and compiled. That refinement has no separate live acceptance evidence.
- R06 remains partial. Next implement R04 assistance/attempt records and R05 evidence-grounded coaching. Complete voice acceptance when actively requested; B/C must pass their stronger independent-assistance contract before voice is enabled there.

## Primary implementation references

- [AWS Nova 2 Sonic getting started](https://docs.aws.amazon.com/nova/latest/nova2-userguide/sonic-getting-started.html)
- [AWS input events](https://docs.aws.amazon.com/nova/latest/nova2-userguide/sonic-input-events.html) and [output events](https://docs.aws.amazon.com/nova/latest/nova2-userguide/sonic-output-events.html)
- [AWS tool configuration](https://docs.aws.amazon.com/nova/latest/nova2-userguide/sonic-tool-configuration.html)
- [AWS voicebot sample](https://github.com/aws-samples/sample-voicebot-nova-sonic): confirmed the string-encoded `inputSchema.json` and tool-result event envelope. Documentation examples differ in this representation; the string form succeeded in this implementation's live call.
- [Bedrock model card](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-2-sonic.html), [MDN AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet), [local pricing snapshot](../research/aws-price-snapshot-2026-09-23.json)
