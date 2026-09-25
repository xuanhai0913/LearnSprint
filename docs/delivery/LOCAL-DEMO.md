> R3 context: this document describes the existing quiz/API foundation. Current PowerLab education scope is planned in `docs/PROJECT-CONTEXT.md`; do not treat these instructions or old checks as completion of E-requirements.

> Historical implementation notes below may contain earlier pending work. Use [current status](../delivery/STATUS.md) and the [R3 roadmap](../delivery/ROADMAP.md) for present scope.

# Run the local demo

Use Node 26.6.x and pnpm 10.33.0. From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Open http://127.0.0.1:3001. The API serves the built web assets on loopback. For development, use `pnpm dev` and http://127.0.0.1:5173 instead; do not run both API processes on port 3001.

## Repeatable fixture walkthrough

1. Choose five minutes and Credentials & permissions.
2. Plan, begin and submit a synthetic wrong answer with “Needs another look”.
3. Open the cited source; explain that the outcome was manually selected in fixture mode.
4. Pause, reload and continue. Open the next question and show the changed scenario.
5. Answer again, choose a fixture result and show the stored recap.
6. Start another session to demonstrate review selection, or choose HTTP methods / Cookies to explore other chapters.

## Reset safely

Stop the dev/server process, then run `pnpm demo:reset`. Existing session files are moved into `.data/backups/<timestamp>/`; they are not deleted. Restart the app and return to its home URL. Browser drafts are separate, so use a fresh tab for a clean walkthrough. The model invocation ledger and approval limits are never reset by this command.

To restore an archived notebook, stop the server and move the current session files to another backup before restoring the chosen backup's session files. Do not merge SQLite WAL files from different backups.

## Verification commands

`pnpm test` runs disposable local tests without AWS. `pnpm build` compiles both applications. See VERIFICATION-2026-09-23.md for observed results and limitations.

The default provider is fixture. Live setup requires approved temporary credentials and the server-only fields in `.env.example`; do not copy secrets into this repository or frontend variables.
