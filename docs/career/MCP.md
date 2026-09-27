# LearnSprint MCP adapter

Status: deployed on AWS 2026-09-26. Cloud build and official SDK client initialization, tools/list, open-shift and authored warehouse-question calls succeeded through public CloudFront HTTPS. See `../delivery/MCP-DEMO-2026-09-26.json`. This is narrow live evidence, not broad interoperability or native Alexa certification.

## Purpose

A self-hosted MCP endpoint delegates to the same career domain service as the web board. It exposes source-backed investigation and plan review to an MCP client, preserving owner, phase, revision and idempotency checks. This is an additional integration, not native Alexa account linking or certification. The current official rules also permit a simulation-only entry.

Endpoint: `POST /api/career/mcp`. Official TypeScript SDK 1.30.1; Streamable HTTP with JSON responses and no transport session ID. GET/DELETE return 405. MCP initialization negotiates protocol versions including 2025-11-25 through the SDK. Deployment evidence must record the actual negotiated version.

## Tools

| Tool | Effect |
| --- | --- |
| career_home | Read this owner's saved shift list and public brief |
| career_workspace | Read one owned shift and current revisions |
| career_open_shift | Create one fictional shift, with an idempotency UUID |
| career_ask_actor | Persist an authored actor answer/source receipt |
| career_review_plan | Persist a deterministic review of the current plan |

No tool accepts an owner ID. A caller cannot accept a split, confirm a plan, apply an AI proposal or hand off a shift through this adapter. Those consequential actions remain in the learner UI. Tools do not invoke Bedrock or spend the existing inference allowance. Errors become MCP tool errors without exposing server internals.

## Connect to the demo

This first adapter uses the existing owner cookie rather than OAuth. Fetch `/api/career/home` to get a new owner capability; preserve that cookie only for this exact origin. Send `Origin` matching the application origin and that cookie on MCP requests. Cookies are credentials: never put them in source, screenshots or shared transcripts. A fresh client owns separate shifts from an existing browser. This is not a generic OAuth connector for third-party hosted agents.

The private CloudFront/Caddy boundary and exact Origin checks are unchanged. Do not remove them to connect a client. Local clients use loopback. The public deployment does not permit arbitrary cross-origin browser connections.

After the API is built on the cloud host:

```sh
node apps/api/dist/career/mcp-client.js
# Explicit demo mutation: one fictional shift and one source receipt; no model calls.
node apps/api/dist/career/mcp-client.js --open-demo-shift
```

The default demonstration lists tools and reads the public brief. It uses the official MCP Client and StreamableHTTPClientTransport, exercising initialization and tool calls. No cookie is logged or persisted. Use LEARNSPRINT_MCP_ORIGIN to select a different controlled deployment.

## Verification status

- Cloud build, public HTTPS client initialization, tools/list, shift creation and authored actor response: observed September 26.
- Reviewer instructions and MCP chapter in public video: published September 26.
- September 27 public HTTPS audit: negotiated 2025-11-25, five tools, repeat create returns same shift, foreign-owner read rejected, wrong Origin returned 403. See `../delivery/MCP-AUDIT-2026-09-27.json`. Audit uses raw JSON-RPC; the earlier SDK demonstration remains separate evidence.
- Native Alexa/OAuth compatibility: not claimed or required for the alternate simulation route.

Sources: https://modelcontextprotocol.io/specification/2025-11-25/basic/transports and https://github.com/modelcontextprotocol/typescript-sdk .
