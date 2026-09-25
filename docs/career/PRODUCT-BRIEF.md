# LearnSprint — practice the work before the first job

Type: explanation. R4, 2026-09-23. The owner selected simulated work experience, then **operations coordination: orders, customers and delivery incidents**. This is the current product direction. The initial manual career slice is implemented alongside the earlier prototypes. The full AI/learning/release scope below remains a target; see [local implementation](LOCAL-IMPLEMENTATION.md).

## Promise and first audience

**Practice a realistic workday, see the consequences of your decisions, and leave with evidence you can discuss.**

First learners: adults preparing for an entry-level operations/order-support role, including final-year college or vocational students. Initial pilot needs people reachable by the owner and at least one person with actual order-support experience to review the content. English is the initial dialogue language; English fluency is not the learning objective or a scored requirement.

Learner job: “Let me experience an unfamiliar work task and practice asking the right questions, making a feasible commitment, and handling a change.” Educator/career adviser job: “Show me which decisions need discussion without making me read a long chat.”

This is a fictional job simulation. It is not employment, an accredited internship, a recruitment assessment, a certificate, or a claim that a company endorses the learner. Completion does not establish job readiness.

## The first shift

The learner operates an order desk at a fictional stationery supplier. Three customer orders need attention. They inspect orders, check stock and carrier information, ask a customer about acceptable delivery options, make a dispatch plan, respond to a supplier delay, and prepare a handoff for the next shift.

The central artifact is a **working order board with committed delivery plans**. The learner changes actual simulated state through controls or explicit voice tools. Chat alone cannot complete the shift. No required reflection essay blocks progress.

The exercise targets four observable skills:

1. Separate confirmed facts, expected availability and unverified assumptions.
2. Prioritize commitments using deadlines and available resources.
3. Clarify a customer's needs before changing a promise.
4. Adapt a plan and leave an accurate handoff when conditions change.

Exact facts and branching are in [the mission specification](MISSION-SPEC.md). The fictional constraints need subject review; occupational references are context, not validation of this scenario.

## What makes AI useful here

**Work colleague / customer:** a conversational actor answers from a restricted, versioned fact set. The warehouse actor knows stock and ETA; the customer actor knows only their order and the options they may accept. The learner must decide whom to ask. The model does not invent stock, grant a delivery exception, or determine numerical success.

**Assistant acting on the board:** understands an explicit request, opens the relevant order or proposes a typed change. A multi-order commitment is previewed and confirmed inside the simulation; a clear reversible draft edit can be immediate with undo. The server commits before acknowledging success.

**Coach on request:** switches visibly out of the work role, refers to an actual event or failed constraint and suggests a next investigation. Help is recorded. It does not silently solve the task while the UI calls the attempt independent.

Actor conversation and coaching have different purposes and permissions. A simulated customer who states their actual deadline is part of the task; an actor who suggests the optimal dispatch schedule has leaked coaching.

## Competitive hypothesis

Job simulations are established. [Forage](https://education.theforage.com/) advertises employer-designed project experiences and educator integration. Our hypothesis is that a compact, reactive shift with spoken stakeholders, a working board, a controlled disruption and an inspectable handoff is useful for this particular learning job. It is not a claim that competitors cannot do this, or that we invented role-play.

Compare against a capable general assistant given the same facts and the same working board. Evaluate whether the prepared workflow makes decisions, facts and unresolved work easier to handle. Do not compare with a deliberately weak “ask ChatGPT one question” baseline.

The [O*NET order-clerk profile](https://www.onetonline.org/link/summary/43-4151.00) includes processing orders and verifying their information. The [customer-service profile](https://www.onetonline.org/link/summary/43-4051.00) includes customer inquiries and records. These US occupation descriptions inform task selection; they do not establish local employer demand or a Vietnamese curriculum match.

## Hackathon scope

One role; one 12–15-minute target shift; three orders; three named fictional actors; one controlled supplier incident; one short changed-condition replay; one evidence/handoff view. Timing is a design target, not observed completion time. An actor is an application role, not a requirement for three autonomous agent processes.

No external email, real purchases, courier booking, real employer integration, arbitrary CV scoring, salary advice, marketplace or large course catalog in this release. Later expansion can add other reviewed role packs after the first task is useful.

The selected competition route remains a clearly labeled Alexa+ web experience simulation plus documented AWS Builder use. A voice API alone does not prove the track story: show contextual conversation, an actual tool action, a confirmed state change and continuity. [Official project requirements](https://amazonappdev2026.devpost.com/rules).

## Reuse and limits

Reuse React/NestJS/TypeScript, revision and receipt patterns, local persistence experience, provider reservation controls and the demonstrated Sonic transport. The historical PowerLab grammar remains isolated. C06 now has a separate career adapter; C07 adds assistance-gated spoken replies and bounded activity selection. Their source is compiled; real career provider behavior remains unobserved. Continue the separate `/career` domain/route; keep `/powerlab`, `/mission-preview`, old evidence and ledgers intact.

Existing W/Wh arithmetic does not become an order engine by renaming labels. The new work requires inventory-by-time accounting, dispatch commitments, fact discovery, incident phases and role-scoped dialogue. See [implementation contract](TECHNICAL-CONTRACT.md) and [delivery plan](DELIVERY-PLAN.md).
