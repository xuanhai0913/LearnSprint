# LearnSprint status

## Live demo video and public navigation — 2026-09-26

The owner requested an actual recorded walkthrough instead of the screenshot storyboard. Three macOS recordings of the deployed CloudFront app now show a fresh first shift, warehouse fact, manual allocation, review, supplier delay, customer B agreement, one bounded Nova 2 Lite allocation proposal and human Apply, recovery handoff, and a linked replay with changed facts. `video/scripts/render-live.py` edits those takes with the existing Polly narration and burned-in captions into `video/out/learnsprint-demo-live.mp4` (150.013 seconds, 1280×720 H.264/AAC). The raw recordings and exported MP4 are intentionally local and ignored by Git; the earlier still-based video is an internal storyboard, not the submission cut. The video is not uploaded to YouTube or linked in Devpost yet.

CloudFront cross-site top-level document navigation from Devpost previously returned `FORBIDDEN`. The runtime now permits only safe cross-site GET document navigation while retaining the cross-site API and mutation guard. This source was deployed in the Sydney preview image on 2026-09-25; a Chrome visit opened the app and the recorded walkthrough completed. No local application build or automated tests were run. Remaining submission work: owner reviews the live MP4, uploads it publicly, adds its URL to Devpost, checks the final project preview and accepts the official submission terms.

Updated: 2026-09-25, after hosted proposal Apply/Undo and UI repair for the **R4 operations-coordinator job simulation**. This status separates planned, implemented, observed and submitted behavior; PowerLab evidence is retained as historical context.

## Hosted proposal and contact desk repair — 2026-09-25

On the assisted first shift `f006d6e8-05b2-419d-b99f-f3e75e904684`, Nova 2 Lite had saved an explicit proposal to set order A's Express today allocation from 0 to 30 kits. The prior browser build appended duplicate contact desks after workspace updates. The `ActorDesk` single-child remount key was removed and its actor selection now resets when the session ID changes. AWS built `learnsprint:preview-c09-actorfix-20260924` (image SHA-256 `86698d1606faa18a893a58a6aca9f4011b32e96d4ebbd24a91643aa2e205255c`); Compose reported the app healthy. A Chrome reload showed one contact desk. Applying the saved proposal changed the board from 0 to 30 and left one contact desk; Undo restored 0 and left one contact desk. A further reload preserved the undone state and the proposal's “Applied, then undone” record. No local application build or tests were run.

A hosted Sonic microphone attempt obtained Chrome permission, but the page returned to “Mic off” with no observed transcript or successful browser voice receipt. A read-only EC2 ledger query on 2026-09-25 found **three Sonic reservations in `closed_or_uncertain`**. All three have usage records: one ended at the idle limit with a tool event, one at the input limit without a tool event, and one at the idle limit without a tool event. Their start/end times were 2026-09-24 13:36–13:38 UTC. A separate read-only check of the linked shift found no saved voice-origin action and zero guided voice starts; the single tool event was not a committed plan change. The model path received audio, but these records do not establish a completed browser conversation or an invoice cost. The same query found **eight Lite reservations**: four completed and four `closed_or_uncertain`, leaving two of ten. Do not retry Sonic until the browser audio path and uncertain reservations are understood. These ledger states supersede older counts below; they are not invoice amounts.

The AWS app container was restarted on 2026-09-25 while retaining its mounted data directory. Public `/healthz` returned 200 afterward. Chrome reloaded the same shift and showed plan A back at 0, eight recorded actions, the “Applied, then undone” proposal state and exactly one contact desk. A request without the career cookie received 401; a fresh browser cookie could open its own home (200) but could not open this shift (404). This observes one restart and one owner-isolation case, not disk-loss recovery or a broad security assessment.

## Hosted manual shift observed in Chrome — 2026-09-24

On the public CloudFront preview, a fresh shift (`8b230629-7863-45b9-a842-4c0547a44803`) completed the manual and structured-contact path. Alex disclosed 40 on-hand and 40 expected kits with source facts. The initial A 30 Express today / B 30 Standard today / C 20 Standard tomorrow plan was saved, reviewed against facts v1 and recorded. Start shift introduced the 17:00 supplier delay and invalidated the earlier review. Jordan disclosed the authored split offer; the learner explicitly recorded B's agreement for 10 by 18:00 today and 30 cumulative by noon tomorrow. The recovery plan kept A 30 Express today, moved B to 10 Standard today plus 20 Standard tomorrow, and kept C 20 Standard tomorrow. Review 2 marked projected constraints met at 200 shipping units. Plan v3 was recorded and a final handoff was saved with zero unresolved observations. After a Chrome reload, the read-only handoff, plan v3, changed ETA, agreement and action history were still visible.

This is browser observation of one fictional scenario path, not evidence of delivered parcels, a restart durability check, voice behavior, replay/help acceptance, or learner outcomes. No local application tests/builds or hosted AI calls were made in this browser pass. The earlier hosted Lite factual call is a separate receipt.

## Hosted changed-condition replay observed in Chrome — 2026-09-24

From the completed first shift, **Try the new situation** opened one linked replay (`f943c990-b3fd-4408-ad2f-49613553c5f0`) with a blank plan, 50 on-hand and 30 expected kits, the 17:00 delay already known and no copied agreement or guidance. Jordan's replay-specific authored offer required 20 kits today and 10 tomorrow; this agreement was explicitly recorded. A 30 Express today, B 20 Standard today plus 10 Standard tomorrow, and C 20 Standard tomorrow passed review 1 at 200 shipping units. The plan and final handoff were saved with zero unresolved observations. The report displayed the exact source handoff beside the replay, including distinct stock and customer milestones, and labeled replay assistance as “No in-app guidance requested” with zero recorded requests. Reload retained the handoff and comparison. Returning to the first shift showed **Continue my replay**, which reopened the same replay ID and saved history.

This covers one happy-path replay and report display. The Chrome **Download my record** action saved a JSON report in the local Downloads folder. Inspection found `career-report-0.1.0`, the replay/source session linkage, distinct pack versions 0.2.0/0.1.0, 50+30 versus 40+40 stock, the exact replay allocation, 200-unit feasible final projection, seven action records and zero recorded help. This checks one export's content, not all export cases. Concurrent duplicate opening, owner isolation, guidance transitions, independent AI/voice restrictions, mobile/keyboard acceptance and host restart durability remain open. No additional Bedrock call or local application test/build occurred.

## Hosted assistance boundary observed in Chrome — 2026-09-24

A separate fresh first shift (`f006d6e8-05b2-419d-b99f-f3e75e904684`) was reviewed with its blank plan. Review 1 recorded six unresolved observations and froze assistance at 0/0/0. **Record help & show guidance** then saved one authored activity tied to that review and moved the attempt to assisted practice; no model call was made for that step. One bounded Nova 2 Lite **Choose a focus with AI** request selected the approved activity “Check the load as a whole”; the displayed wording and evidence remained authored. The browser allowance changed from five to four remaining text requests. A reload preserved one guidance request, one AI-selected focus and zero guided voice starts, while the earlier review snapshot remained at 0/0/0. This is one live focus call and assistance-order observation, not a broader guidance-quality or voice-policy acceptance.

## Current C09 AWS preview — deployed; initial HTTPS checks observed

Preview: https://d2g4a2ezl5lw7r.cloudfront.net/career. The owner requested public access; reviewer Basic Auth was removed on 2026-09-24. [Release receipt](AWS-PREVIEW-2026-09-24.json). Chrome rendered and completed the manual shift without a sign-in prompt. Hosted replay, report, guidance focus and proposal Apply/Undo paths have since been observed as described above. Sonic microphone acceptance remains open.

Owner requested skipping local tests/builds because of machine load and authorized AWS-credit deployment, then selected an AWS-issued HTTPS URL. The LearnSprint local Node server was stopped; its databases and invocation ledgers remain intact. No local application tests were run.

- Refreshed AWS CLI authentication. Free account is active with **$120 remaining credits** observed on 2026-09-24; Free plan expiry is 2027-03-23. The separately reported $150 promotion remains unverified/unredeemed.
- AWS Settings identifies **Sydney (`ap-southeast-2`)** as the project's selected region. `us-east-1` EC2 access was explicitly denied by AWS's project region policy. Reading EC2 in the assigned Sydney region succeeds; no policy bypass, upgrade or advanced-feature activation was performed. Bedrock's separately allowed inference region remains independent of compute placement.
- Provisioned one `t3.small` Ubuntu 24.04 host, 30 GiB encrypted gp3 root volume retained on termination, IMDSv2, standard CPU credits and an instance role for SSM management. There is no SSH ingress. Deployment identifiers are in ignored `deploy/private/resources.json`.
- Uploaded an allowlisted source archive to an encrypted private S3 bucket; no developer data or AWS credentials were packaged. Docker/build dependencies are installed on the host. The Docker build completed successfully on EC2 with pinned Node/Caddy digests. The CloudFront VPC origin is deployed. App and Caddy are running. The initial gated release observed 403 without origin secret, 401 without reviewer password and 200 after authentication. After removing the viewer password, a fresh origin check still returned 403 without its private token; public HTTPS health, career HTML, JS asset and home API returned 200. The home API reports browser-preview and sets a Secure cookie.
- Current access: CloudFront-issued HTTPS → private VPC origin → Caddy origin-secret check → career API. No reviewer password is required. Cache is disabled and viewer headers/cookies are forwarded. Origin ingress allows only the AWS-managed CloudFront VPC security group. Each browser still owns its own saved shifts through a Secure capability cookie; the public can create their own demo shifts and use the remaining capped AI reservations.
- Current price snapshot: t3.small $0.0264/hour, gp3 $0.096/GB-month, public IPv4 $0.005/hour. At 730 hours, compute + 30 GiB + one IPv4 are approximately **$25.80/month**, before transfer, S3, backups and any inference. No paid plan or reserved commitment was purchased.
- Fixed a real cloud startup issue: unquoted commas in YAML flow-style tmpfs entries were parsed as an extra mount. Both entries are now quoted locally and on the host. No application image rebuild was needed.
- Hosted career AI is enabled through a fresh, separate EC2 batch: 10 Lite reservations/$0.20 and four Sonic reservations/$1, with the previously approved per-session bounds. The instance role grants only the required Nova invocation resources. The latest read-only ledger query is in the 2026-09-25 section above: eight Lite reservations and three Sonic reservations have been recorded. The separate local and historical ledgers remain untouched.
- After Basic Auth removal, unauthenticated HTTPS health, career page and home API returned 200. Native Chrome UI displayed the First Shift page without a sign-in prompt. Browser-control tab creation still reports `ERR_BLOCKED_BY_CLIENT`, so automated Chrome interaction, microphone and complete mission acceptance remain open. Cloud startup and a factual AI turn do not complete C05–C08 acceptance.

## Earlier C09 preview preparation — historical

- Added explicit local/preview runtime settings, HTTPS origin/private-proxy checks shared by HTTP and career WebSockets, Secure career cookies and a career-only hosted module. Local prototype routing remains unchanged.
- Prepared a multi-stage non-root Docker image, Caddy HTTPS/reviewer-password gateway, Compose with persistent app storage and bounded logs/memory, and a no-inference default config.
- Career AWS profiles are optional for instance-role credentials. Existing local profile values and ledger serialization are unchanged; no allowance was enabled, enlarged, migrated or reset.
- Added environment-aware browser storage messaging and an explicit source packaging script with SHA-256. Prepared archive: `release/learnsprint-preview-c09-20260924.tar.gz`; private data/config and AWS files are excluded by the packaging allowlist.
- API/web compilation passed; the updated local server started successfully on port 3001. Docker is absent on this machine, so image build, Compose/Caddy acceptance, real HTTPS/auth/voice and container persistence remain unobserved. No application tests, career paid calls, AWS resource/account changes, DNS, public publication or submission occurred.
- The concrete preview design is one EC2 machine + encrypted persistent EBS + Caddy on an owner-controlled public DNS name. Account/instance price/credit eligibility, DNS, IAM access and actual hosting allowance remain unresolved. The older multi-service stack is not the first preview prerequisite.

This section records the earlier preparation state. See the current C09 deployment at the top and the [deployment runbook](../../deploy/README.md).

## Earlier C08 replay and learning-record increment

- Added a separate `first-shift@0.2.0` variant and matching dialogue. It starts with the delay known, 50 kits on hand and 30 expected; customer B has a separately authored alternative requiring 20 today, disclosed only through contact.
- Added same-owner, final-handoff-bound replay creation. A transaction stores one linked child with a blank board/new attempt. Same/different request IDs resume that child and never clear help or rewrite the source handoff.
- New replay starts in `independent` mode, labeled “No in-app guidance requested.” Authored facts remain available; AI allocation previews are rejected by the domain and generated speech stays suppressed. Explicit help commits the assisted transition before advice is returned.
- Added a factual report from saved final evaluations: initial recorded plan versus handoff, changed cells, stock assumptions, commitments, source receipts, complete timeline and frozen assistance. Completed replay also shows the exact earlier handoff separately, without asserting learning gains.
- Added local JSON report download, replay entry/resume, saved-shift labels and mode-aware review/coach text. Old sessions default to no replay link; unknown help history remains unknown.
- API/web production compilation passed; the local server restarted successfully with the replay route on port 3001. No application tests, browser/API journeys, microphone sessions, paid calls, allowance increases, deployment, account changes, outreach or submission edits occurred. Runtime/content/accessibility acceptance remains open.

See [replay and report](../career/REPLAY-AND-REPORT.md). C08 has initial source, not full acceptance. Next: C09 reproducible delivery/access preparation and requested C05–C08 behavioral/live acceptance.

## Earlier C07 coaching and assistance increment

- Added an original versioned pack of five authored operations activities, with observations derived from a saved review: stock timing, dispatch fit, customer promises, budget and handoff clarity.
- Added explicit `request_help`. Attempt state, the review-bound activity, event and receipt commit before guidance is returned. Repeating the same review request does not duplicate help; guidance survives pause/resume and remains historical after facts change.
- Added a bounded optional Nova 2 Lite focus selector. It selects an approved activity and valid evidence IDs; displayed wording stays authored. It shares the existing text reservation batch and cancellation/idempotency lifecycle.
- Added conservative attempt defaults for older rows and immutable assistance snapshots at review/handoff. Unknown earlier help remains unknown. No current shift is called an independent assessment.
- Added opt-in generated role replies only for assisted attempts, with the selected output policy bound to a single-use ticket and a guided voice start committed before streaming. Other streams suppress generated output. Source fidelity is still a requested live acceptance item.
- Added the coach panel, original/AI-selected guidance labels, historical evidence, Stop/retry/reload controls, assistance totals and review/handoff history.
- API/web compilation passed. No application tests, paid calls, microphone/browser/API journeys, account changes, deployment, outreach or submission edits occurred. The existing 10 text / four voice reservation batches were not enlarged.

See [coaching and assistance](../career/COACHING.md). C07 has initial source; behavioral/live/content acceptance remains open. Next implementation: C08 changed-condition replay and fuller evidence reporting.

## Earlier C06 AI input and proposal increment

- Added Nova 2 Lite routing from short natural-language requests to existing actor facts or a single explicit allocation preview. Generated prose is discarded; source replies retain the C05 authorship and receipts.
- Added career-scoped Sonic voice input with single-use actor/revision tickets, input transcript, Stop/disconnect handling and saved-state recovery. Generated assistant output was suppressed in the initial C06 increment. The later C07 source above adds an assisted-only opt-in; actual spoken-role behavior remains unobserved.
- Added saved before/after proposals, explicit Apply and bounded Undo. AI cannot accept agreements, review/record a plan, start a shift or hand off work. Manual and live controls serialize on the page, and domain revisions are rechecked after inference.
- Extracted shared audio/Bedrock transport while keeping PowerLab policy, tools, tickets and allowance separate. Existing session rows default to empty proposal logs without fabricated history.
- Configured separate career batches: 10 text reservations / $0.20 and four voice reservations / $1.00, maximum 60 seconds per voice session. This $1.20 reservation envelope is not measured spend or an invoice guarantee. Historical ledgers remain intact.
- API/web production compilation passed. No application tests, provider invocation, microphone session, mutation journey, deployment or account/submission changes occurred in this increment.

See [AI implementation and exact limits](../career/AI-CONVERSATION.md). **C06 remains partial** pending requested live/behavioral acceptance, measured usage and evidence for the generated-speech assistance boundary. The subsequent C07 source is described above; C06 live/behavioral acceptance remains open.

## Earlier C05 actor increment

- Added versioned authored profiles for warehouse, customer B and shift lead, with eight explicit questions and strict role/phase filtering.
- Added `ask_actor` to the existing owned command boundary. Each reply freezes its wording, source facts/versions and world revision; the event, response and original receipt commit together. Repeated questions at the same world return their saved response.
- Added a contact desk, source links, historical-reply states, saved receipt details and the explicit B agreement action. Asking preserves an unsaved allocation draft.
- Existing session rows receive empty actor logs on read, with no fabricated historical messages. The original scenario fixture, existing offers/evaluations and historical provider ledgers are preserved.
- API/web compilation passed. No application tests or actor/command journeys were run; no model calls, deployment or external communication occurred. The earlier Chrome entry-page observation does not verify these new contacts.

See [actor implementation](../career/ACTOR-CONVERSATIONS.md). C05 structured source is implemented; runtime acceptance remains open. Its initial natural-input adapter is described in the C06 increment above.

## R4 manual and C05 foundation

- Added original `first-shift@0.1.0` content, strict server loading and separately authored reference calculations. Practitioner review remains open.
- Implemented a pure timed-stock/dispatch/commitment evaluator with shared departure fees, capacities, integer quantities, original deadlines and server-recorded agreement overlays.
- Added `/career`: entry/brief, order allocation board, current facts, save/review/record flow, stock table, deadline details and stale-review states.
- Added owned `.data/career.sqlite` persistence with pinned versions, evaluation snapshots, revisions, transactional original receipts, local draft recovery, pause/resume and saved shifts.
- Implemented the once-only delayed-replenishment incident after Start shift. Previous reviews retain their original plan and world snapshot.
- Added customer B's structured split disclosure and a separate agreement commit. The response is authored; no live career AI is represented.
- Added final handoff preview/save, unresolved observations, read-only final state and recent action/review history. No transfer variant or full learning report yet.
- `pnpm build` passed for API and web. The local server started and the career entry page was displayed in Chrome. No application tests or create/edit/review/incident/handoff acceptance journeys were run in this increment.
- No model invocation, deployment, external message, credit/account change or submission edit. Historical prototype source/data/ledgers remain intact.

C01–C08 have initial source; C05–C08 behavioral/live/content acceptance remains open. This is not completion of all acceptance criteria. [Exact implementation and limits](../career/LOCAL-IMPLEMENTATION.md), [current checklist](../career/DELIVERY-PLAN.md).

## R4 direction and preceding planning delivery

- Owner selected simulated work experience, then explicitly chose operations coordination: orders, customers and delivery incidents.
- Wrote the [career brief](../career/PRODUCT-BRIEF.md), [mission specification](../career/MISSION-SPEC.md), [technical contract](../career/TECHNICAL-CONTRACT.md) and [delivery plan](../career/DELIVERY-PLAN.md).
- Mission proposal: a first shift at a fictional stationery supplier, three orders, timed stock, a delayed replenishment, a customer-approved split and an inspectable handoff. Practitioner review remains required.
- Updated README, Vietnamese overview, project context and agent instructions. Preserved R3 snapshots and marked old scope/story/backlog documents historical to prevent continuing the wrong feature set.
- In the preceding documentation-only revision, C01–C11 were planned and no career code, actor calls, new model spend, deployment, outreach or Devpost changes occurred. The implementation above followed that revision.
- Existing prototypes, content, databases and provider ledgers remain in place. R3's 130-hour estimate is historical, not an R4 remaining-effort claim.

## Historical R3 strategy revision

- Rechecked official rules, FAQ, resource/update pages and deadline conversions; retained the judging-start discrepancy.
- Researched current education products, four relevant public hackathon precedents, learning-science papers and AWS capability/pricing documentation.
- Replaced the API-focused hero plan with a practical energy-design lesson, initial learner/tutor segment, A/B/C scenarios, meaningful voice and inspectable learning evidence.
- Mapped all four equally weighted criteria to proposed functionality, demo moments and evidence; kept friction feedback genuine.
- Rewrote canonical product/design/engineering/delivery/submission plans; added a Vietnamese owner overview and competitive/source register.
- Allocated 114h work + 16h contingency and a conditional $150 project envelope; saved a public AWS price snapshot.

R00 is documentation-complete. Practice A now has a local implementation; the full application release, external validation, deployment and submission remain open.

## Historical PowerLab implementation continuation

- Added the original practice-A lesson v0.1.0, validated content loader, source assumptions and separately authored reference-value data.
- Added a pure server evaluator: integer watt-minutes, exact energy/power boundaries and all required service durations. No answer fixture or AI is used to decide feasibility.
- Added `/powerlab`: illustrated brief, four-device/hour controls, selected-hour scene preview, Save/Run, separate energy/power/service results, plots and a numeric table, stale-result state and two-run comparison.
- Added a Nest feature module and `.data/powerlab.sqlite`: browser owner capability, pinned sessions/artifacts, immutable runs, manual action events, original commit receipts, revision checks and pause/resume. Old data and invocation ledger are preserved.
- Added local draft recovery, same-request retry, conflicting-tab recovery and a saved-practice list. Added exact SPA deep links when serving the built app.
- Compiled the initial API and web successfully; opened the entry page in Chrome. That earlier slice had no live inference.

## Historical PowerLab voice continuation

- Added optional English Nova 2 Sonic controls, browser audio capture/playback, transcript, committed receipts, Stop voice/playback and Undo. Backend uses owner/revision-bound tickets and the existing domain transaction; strict spoken-command/tool matching precedes mutation.
- Added a separate immutable voice allowance: four sessions, $1 reservation envelope, $0.25/session, 60 seconds maximum. The old exhausted quiz batch is unchanged.
- **One live synthetic command succeeded:** fan hour 4 was removed, revision 2 persisted with voice origin, and Sonic returned the matching transcript plus confirmation audio. Estimate from reported tokens: **$0.00225955**. Three reservations remained immediately afterward; a subsequent short stopped connection with no usage report leaves two at the latest ledger observation.
- API/web compilation passed. Chrome showed Start voice on an existing saved practice; browser microphone/playback and broad interaction acceptance remain pending.

[Voice implementation and exact live evidence](../engineering/VOICE-SPIKE.md). This completes the early one-command feasibility objective; R06 as a whole remains partial.

See [PowerLab local implementation](../engineering/POWERLAB-LOCAL.md) for exact routes, files, limitations and observation boundaries. This is the source implementation of the first slice, not completion of all R01–R04 acceptance or the hackathon release.

## Actual application state

| Area | Observed state |
| --- | --- |
| R4 First Shift | Local fixture, evaluator, order desk, persistence, incident, authored B agreement and handoff source implemented; compilation passed; entry page displayed; behavioral acceptance pending |
| R4 authored actors | Three contacts, scoped questions, source snapshots and agreement integration implemented; compilation passed; interaction/role-isolation acceptance pending |
| R4 career AI input | Hosted Lite factual question succeeded once with a persisted receipt; Sonic and browser Apply/Undo acceptance remain open |
| R4 coaching | Authored review-bound activities, AI focus selector, assistance/attempt records and review/handoff snapshots source compiled; behavioral/live/content acceptance open |
| R4 transfer/report | Separate versioned replay, assistance transition, final evidence report, exact source comparison and local JSON export source compiled; runtime/content acceptance remains open |
| Legacy quiz | React/Vite + NestJS + SQLite; source pack and bounded Bedrock adapter exist |
| Historical checks | 26 passing old tests/build and Chrome journeys recorded in dated evidence; not rerun for R3 |
| Historical model calls | One initial playground check and five quiz invocations; the latter included schema failures and one over-credited partial answer |
| API mission preview | `/mission-preview`, frontend-only simulator, authored hints and in-memory state; compilation passed previously; full acceptance pending |
| PowerLab A | Local content, evaluator, workbench, results/comparison and persistence implemented; compilation passed; entry page opened; interaction/content acceptance pending |
| PowerLab B/C | Planned/reference values only |
| R3 local evidence | SQLite sessions, artifacts, immutable runs and manual/voice actions; full attempt/help/report records pending |
| R3 voice | Initial English controls implemented; one real Sonic edit and audio response observed; full R06 acceptance pending |
| R3 coach/report | Planned, no live behavior or user evidence |
| AWS hosted stack | Sydney EC2 and private CloudFront VPC origin deployed; public HTTPS entry, asset, health and home checks passed without a password |
| Public release / final submission | Not completed |

[Historical R2 status](HISTORY-2026-09-23.md), [API storyboard](../design/API-PROTOTYPE-STORYBOARD.md), [old verification](VERIFICATION-2026-09-23.md), [five-call evaluation](LIVE-EVALUATION-2026-09-23.md).

## Credit/account observations

Owner reports a $150 promotional email. Last private billing observation: Free plan, earlier $100 displayed balance, separate promotional redemption blocked by Paid-plan requirement. These are not fresh balance/expiry checks. The voice continuation confirmed existing AWS authentication and one successful us-east-1 Sonic invocation. It did not redeem credit, upgrade an account or deploy infrastructure.

The five-call quiz batch has zero remaining slots in its historical ledger. Preserve it. Voice now has its own named capped batch under active authorization, detailed above. Do not infer infinite usage or repeatedly ask about calls already covered by that batch. [Current AWS plan](../engineering/AWS-AND-COSTS.md).

## Next three actions — R4

1. **C09:** observe the complete rendered learner journey and microphone if possible. The AWS container release, account, hostname, role and base cost are recorded; the complete repository/video/submission package remains required.
2. **C05–C08 acceptance:** when requested, observe the whole shift, replay/help/report persistence and career Lite/Sonic behavior under the existing allowance. Include private-policy boundaries, source fidelity and assistance-before-speech ordering; preserve PowerLab budgets.
3. **C10–C11:** obtain practitioner/learner feedback and prepare actual GitHub setup/license, functioning video and Devpost artifacts. No educational result or submitted state is established yet.

Do not resume the R2 API backend or unfinished PowerLab R04/R05/B/C work by default. Current implementation direction is the career plan; the prototypes remain historical technical assets.

## Pending gates

Operations-practitioner/content validation; weekly capacity; learner access; interaction/domain/voice acceptance; credit redemption/coverage and any required account change; hosted identity; repository visibility/license; verified release; final submission. One-command historical local voice feasibility is observed; it does not satisfy these career gates.

## Compilation and observation history

- **C09 preparation:** API/web `pnpm build` passed. Source tarball and SHA-256 generated by an explicit allowlist. The updated local server started successfully on port 3001. No application journey, Docker build/runtime acceptance or cloud action occurred.

- **C08 replay/report:** `pnpm build` passed for API TypeScript and web TypeScript/Vite. The local server restarted successfully with the replay route on port 3001. No application tests, API/browser journey, export observation, microphone or provider invocation occurred.

- **C07 coaching:** API/web production build passed; `pnpm start` loaded the new content/module and started successfully on port 3001. No application tests, model calls, microphone sessions or mutation journeys. Authored/AI-selected source labels and conservative historical defaults are implemented but not behaviorally accepted.

- **C06 AI input/proposals:** API/web `pnpm build` passed. Text/voice adapters and Apply/Undo were compiled, with no application tests, live calls or browser/API journeys. The local configuration is bounded and separate; credential/model availability remains unobserved.

- **C05 actor increment:** API/web build passed after narrowing the new command union correctly. No application tests, actor/command journey, live inference or browser acceptance; source and compilation only.
- **Current R4 manual slice:** API/web `pnpm build` passed after a JSX closing-tag correction. Local Nest startup and Chrome career entry display observed. No application tests, mutation journeys, live inference or external changes. Existing saved work was left untouched.

- **Historical voice continuation:** `pnpm build` passed. One authorized synthetic live voice probe created its own practice, committed one edit through the real WebSocket/Bedrock path and read the saved revision back. Usage and timestamps are in VOICE-SPIKE.md. An existing saved browser practice was opened to show the new controls; no microphone was activated there. No broad unit/integration/browser suite, external message, deployment or Devpost edit occurred.
- **Earlier PowerLab slice:** build passed and Chrome entry page was displayed. No create/edit/run/pause/compare journey or AWS call occurred in that earlier implementation turn.
- **Earlier strategy revision:** public-source/document review checked 40 Markdown files and 124 local links with zero missing targets. Backlog arithmetic was 114h core + 16h reserve = 130h; six proposed example values were independently summed. Those earlier counts/arithmetic are historical document checks, not acceptance evidence for the new engine.

## Handoff format

Date; R-item; changed files; actual observations/checks; remaining defects; decisions; next exact action; external action receipts if any. Preserve immutable evidence and do not turn targets into achieved results.

## Historical authored-guidance increment (before R4 decision)

Implemented an explicit `request_help` command for practice A. It requires the latest run to match the current saved artifact, records the chosen original activity and run ID atomically, and returns the stored activity snapshot on reload. The UI labels the activity **authored, not live AI**. Future runs snapshot the recorded assistance count; historical runs are not relabeled as independent. Revision/idempotency/owner checks are reused. No inference was needed. API/web compilation passed; behavioral acceptance was not run.

This was partial R04 assistance recording plus an authored fallback, not full attempt/phase tracking or R05 live coaching. Its planned continuation was superseded by the R4 career direction above.

Latest voice ledger observation: two reservations consumed, two remain. The second connection stopped after about 2.6 seconds, with no audio bytes/tools or usage report. Its initiator is not established by this ledger; missing usage is not a zero-cost claim.
## 2026-09-25 — public repository and Devpost draft

- The owner selected public GitHub with MIT. The standalone [LearnSprint repository](https://github.com/xuanhai0913/LearnSprint) is public on `main` with source, content, setup guidance and an MIT license. Tracked-file scanning found no obvious credentials or private keys; `.data/`, `deploy/private/` and release artifacts are ignored. GitHub's license API reported MIT. A clean-clone setup run has not been performed under the owner's request to avoid local builds.
- The signed-in Devpost draft was renamed LearnSprint and its elevator pitch saved. The UI showed **DRAFT, 2/5 steps done**. The live form was inspected and mapped in [DEVPOST-FIELDS](../hackathon/DEVPOST-FIELDS.md); no final submission was made.
- Added an English [reviewer guide](../hackathon/REVIEWER-GUIDE.md) and a field-ready [product feedback draft](../hackathon/PRODUCT-FEEDBACK.md). Those fields were pending at this checkpoint and were filled in the continuation below. The final deadline remains October 24 at 02:00 VN per the live competition UI; target October 22 evening VN.

## 2026-09-25 — Devpost fields and video kit

- The owner confirmed an individual new-project entry, Vietnam residence, age of majority, eligible jurisdiction and non-affiliation with the promotion entities. These facts, the Alexa+ track, AWS Builder description, repository/demo links, optional redacted friction-log URL and all five product-feedback answers were saved in the signed-in Devpost draft. The draft shows **3/5 steps done**. Its project details retain the English [story](../hackathon/PROJECT-STORY.md), a GPT Image 3:2 thumbnail and a concept gallery banner. No video URL or final submission is present; the separate Official Rules/Terms checkbox remains untouched.
- Created [two GPT Image assets](../hackathon/media/), keeping promotional illustration distinct from real application evidence. Generated Amazon Polly Joanna neural English narration (126 seconds, two requests: audio and speech marks, 1706 billed characters each), 26 synced SRT captions and a 150-second Remotion composition. The private Polly ledger records the bounded batch; estimated list price is approximately $0.055, not an invoice amount. The first speech-mark CLI attempt failed local parameter validation before reaching AWS, then completed after correction.
- Chrome returned `ERR_BLOCKED_BY_CLIENT` when navigating the CloudFront demo for recording; `curl` still returned HTTP 200. A user-opened Chrome tab displayed the landing page, and its clean browser screenshot was saved. Opening a saved shift through the browser-control connection returned to the block. A macOS screen-recording probe captured Chrome settings or a Codex overlay, not a usable application journey. The remaining real-app video scenes are unrecorded. The Remotion template explicitly labels missing scenes and must not be submitted as a working demo. The owner was asked to reopen a saved shift directly and report whether the blocker persists.
