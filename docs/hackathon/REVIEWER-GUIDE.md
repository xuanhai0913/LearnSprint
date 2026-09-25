# LearnSprint reviewer guide

Updated 2026-09-25. This guide describes the public R4 operations shift demo and its verified limits.

## Try the hosted experience

Open [First Shift](https://d2g4a2ezl5lw7r.cloudfront.net/career) in a current browser. The entry is public and needs no sign-in. Create a shift, inspect the three orders, ask the listed warehouse question, make an allocation, and use **Review** before recording a plan. Start the shift to reveal a supplier delay, negotiate and explicitly record customer B's split, revise the board, and save a handoff. A linked replay changes the opening facts and keeps a separate attempt. The report compares recorded decisions and can download JSON.

The app uses a Secure browser cookie to associate saved shifts with one browser. A new browser has its own shifts. There is no account system or cross-device sync. The scenarios, businesses and people are fictional.

## Run the manual path from source

Requirements: Node.js 26.6.x and pnpm 10.33.0. From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://127.0.0.1:5173/career>. The API uses `127.0.0.1:3001`. The manual board, listed actor questions, deterministic evaluator, incident and handoff do not require AWS credentials. The default assessment setting is `fixture`; see [.env.example](../../.env.example). Server environment values must be exported into the API process; the app does not automatically load `.env`. Do not put AWS credentials in `VITE_` variables or commit them.

These are source setup instructions, not a claim that a fresh clone has been installed and run during release review. The current hosted build was built on AWS because the owner requested that local builds be skipped.

## What AWS and AI do

The deployed React/Vite and NestJS app uses EC2 with persistent SQLite storage and CloudFront HTTPS. Amazon Bedrock Nova 2 Lite interprets bounded typed questions and allocation proposals, and chooses a focus from approved guidance. A proposal changes the board only after **Apply**; the user can **Undo**. The application owns facts, permissions, arithmetic and the recorded outcome.

Nova 2 Sonic has a streamed voice prototype. A successful hosted browser voice action is **not verified**. The video and judging story therefore use the observed typed path. This is an Alexa+ style **web simulation**, not a native Alexa+ skill, device integration or certification. The project makes no claim that a short demo measures learning outcomes or job readiness.

Read the [submission story](SUBMISSION-WORKBOOK.md), [judging evidence](JUDGING-EVIDENCE.md), [demo script](DEMO-SCRIPT.md), [tool feedback](PRODUCT-FEEDBACK.md), and [current verification status](../delivery/STATUS.md) for precise claims.
