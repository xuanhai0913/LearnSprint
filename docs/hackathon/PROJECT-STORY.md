## Inspiration

Starting a first job means making decisions with incomplete information: a delivery promise, a stock estimate, a customer who needs an answer. Reading an explanation rarely gives someone a chance to practice that responsibility.

I am Nguyen Xuan Hai, a full-stack developer in Ho Chi Minh City. My work spans education software and business workflows. LearnSprint brings those interests together: a small, fictional workplace where a learner can ask, act, see constraints, and leave a clear handoff.

## What it does

**First Shift** puts an adult preparing for an entry-level operations role at a fictional stationery supplier. Three orders share limited stock and timed carrier departures. The learner talks to a warehouse colleague, allocates kits, reviews the plan and records a commitment.

Then a supplier runs late. The previous review becomes historical. The learner can ask customer B about a split delivery, explicitly record the offered agreement, revise allocations and save a handoff. Reading an offer alone does not change a promise.

The next short situation starts with different stock and customer terms. It has a clean board and separate help history. The report compares saved decisions across the two attempts and can be downloaded as JSON. It records what happened without assigning an employability or mastery score.

## Why a conversational work simulation

The conversation has a purpose beyond returning advice: it reveals authorized scenario facts and can produce a concrete allocation proposal on a persistent order board. The learner reviews the exact edit, chooses Apply, and can Undo. The system retains the action history and checks whether the resulting plan meets stock, capacity, quantity, deadline and budget constraints.

This entry includes a **self-hosted MCP server** and an Alexa+ style web simulation. It is a contextual conversational experience on the web; it is not a native Alexa+ integration, skill, certification or partnership. Listed actor questions return authored replies with source facts. Amazon Bedrock Nova 2 Lite provides bounded natural-language interpretation and coaching-focus selection.

## How I built it

The frontend uses React, TypeScript and Vite. A NestJS API owns scenario revisions, permissions, idempotent commands and deterministic evaluation. SQLite retains shifts and invocation ledgers on persistent encrypted EC2 storage. CloudFront supplies HTTPS through a private VPC origin and a Caddy gateway. Private S3 archives and Systems Manager support cloud builds and deployment. The source is public under MIT.

Bedrock Nova 2 Lite can route a typed request to a supported fact or suggest one allocation edit. It can also select a focus from approved guidance. The model cannot invent customer acceptance or override the evaluator. Assistance is requested and recorded explicitly.

Nova 2 Sonic has a streaming voice prototype, but a successful hosted career microphone action remains unverified. The demonstrated release therefore uses the observed typed path. The cover art was created with GPT Image and is labeled as illustration; application evidence comes from the real demo.

The MCP endpoint uses the official TypeScript SDK 1.30.1 and Streamable HTTP, with support for protocol 2025-11-25. Five tools expose the public brief, owned workspace, shift creation, authored actor questions and deterministic plan review. The endpoint preserves owner-cookie, Origin, revision and idempotency checks. Customer agreements and allocation Apply remain explicit learner actions on the web board. This first connection uses an owner cookie and matching Origin, not OAuth or native Alexa account linking.

The official MCP client connected through the public AWS HTTPS endpoint, listed all five tools, opened a fictional shift and saved a warehouse response with stock-register and supplier-notice source receipts. These calls used no paid inference. Connection instructions and the captured output are in the public repository under docs/career/MCP.md and docs/delivery/MCP-DEMO-2026-09-26.json.

## What I learned and what worked

The hardest design problem was deciding which changes a conversation is allowed to make. Separating a suggested edit, a reviewed plan and a recorded commitment made the experience clearer and kept the application state authoritative.

On the AWS demo, one full first shift and a linked changed-condition replay were saved and reloaded. Guidance, a live AI-selected focus and one saved Lite proposal's Apply/Undo path were observed. An app-container restart retained that assisted shift. These are specific demo observations, not a broad reliability or learning-outcome claim.

## Challenges

A workspace update exposed duplicate contact panels, which were repaired. Voice streaming reached the provider but did not produce a saved career action in the browser; its audio timing and lifecycle still need diagnosis. Bounded invocation ledgers helped retain uncertain attempts rather than silently resetting them.

## What's next

First, review the scenario with an operations practitioner and observe a small learner pilot. Then repair and verify browser voice, improve the handoff experience, and add another scenario only after the first role is credible. Longer term, educators could use configurable situations and evidence reports to support practice and discussion. There is no employer partnership, accredited internship or job guarantee.

LearnSprint and its earlier quiz/PowerLab prototypes were started during this hackathon's September 2026 build period. The operations simulation is the submitted product; earlier prototypes remain in the repository as development history.
