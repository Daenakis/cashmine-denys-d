# Notes

## Decisions

**Amounts.** API decimal strings are parsed digit by digit into `bigint` counts of the asset's smallest unit
(`10^-decimals`); no floats anywhere (ETH has 18 decimals — `12.345678901234591676` would not survive a
`number`). Validation, fee and receive (`amount − fee`) are integer math; the request sends the canonical
string. USD = amount × price in integer cents, **rounded down** so we never overstate value. Display uses
`Intl.NumberFormat` with the decimal *string*, which formats exactly. Alternatives: a decimal library
(extra dependency for a few operations) or floats (wrong). Code: `src/money/`.

**Balance right after a claim — server is the single source of truth (option D).** I asked the AI for
options (`ai-logs/claude-code-session.md`, around line 4623): A) wait for the snapshot, B) subtract locally,
C) overlay local claims on the snapshot reconciled by `asOf`, D) don't touch numbers, show the operation
status and block repeats. The AI recommended C+D; I chose **D** (line 4695): the client never recalculates
a balance, even from confirmed operations — that drifts sooner or later (other devices, snapshot timing).
What D does:
- After `201` the claim gets its own status (Home banner + status screen); numbers change only when a new
  snapshot arrives, and the card says "Balance is syncing" meanwhile.
- New claims for that asset are blocked until the claim settled **and** `snapshot.asOf ≥ claim time`
  (both server timestamps) — otherwise Max would offer stale `available`.
- Own claims (`id, asset, createdAt, status`) are persisted, so a reload doesn't lift the block.
- A failed claim returns money to `available` on the server; this "jump back" is real, so it is explained
  by a notice with the reason that stays until dismissed.
- Total = available + pending + claiming, so it doesn't move when a claim starts; "Available to claim" does.

**Unknown claim result (timeout, network, 5xx/504).** Never shown as failed. The Idempotency-Key and body are
written to `localStorage` *before* the POST; retries reuse the same key and body (server returns the original
claim, never a second one). 429 waits `retryAfterMs`. If retries run out: "We couldn't confirm your claim.
Don't submit it again" + **Check again** (same key); the asset stays blocked; after a reload the attempt is
resumed automatically. A new key is created only for a new user intent after a definitive answer.
400/401/409 are definitive: the attempt is dropped and the message shown.

**Other.** Token entered in the UI, kept in a zustand store persisted to `localStorage`, never bundled (an `EXPO_PUBLIC_` env var would be inlined into the build).
Base URL only in `src/constants/api.ts`. Pull-to-refresh is a no-op on react-native-web, so there is an
explicit Refresh button. Assumption: a snapshot with `asOf ≥ t` includes all changes before `t` (docs imply it,
don't state it; worst case the "syncing" state lasts one more 15 s cycle).

## Working with AI

All in `ai-logs/claude-code-session.md` (Claude Code in VS Code, project rules in `CLAUDE.md` / `AGENTS.md`).

1. **Prompt that didn't work.** "токен вставил" (line 2248) — I meant the token field in the app, the AI
   looked for it in `.env`, found it empty and kept asking. I rephrased (line 2592): "the token is in the
   app's input, take it from there, add a context for it" → it moved the token into a React context and
   verified the API through the running app in the simulator instead of the shell. (The context was later
   replaced by a small zustand store — less provider plumbing, components subscribe to just the token.)
2. **AI output that was wrong / risky.** The project rules I wrote said the client reads the token from
   `process.env.EXPO_PUBLIC_API_TOKEN`; the AI flagged that Expo inlines such vars into the public bundle
   (line 322), and we switched to UI input + a `dist/` grep before deploy. Later its scripted refactor of
   components left a dangling `};` in `ErrorState.tsx` — caught by `tsc` (line 4227), not by the AI's own
   reasoning; every step is gated on `tsc` + export + tests for this reason.
3. **Disagreement.** The AI recommended client-side overlay of confirmed claims (C+D, line 4679). I rejected
   it in favour of server-only numbers (D, line 4695) for the reasons above; the AI then listed what D needs
   to stay safe (block until the snapshot catches up, persist claims, explain failures), which is what I kept.
   I also pushed back repeatedly on code style (no inline styles, component folders, constants/regex/types in
   their own files, arrow components, memoization) — visible throughout the log.

## Not done / known issues

- **Activity** screen not built (the paginated `useActivity` hook and schemas exist).
- Unknown-result and failed-claim paths are implemented but were **not reproduced live** (the test API
  never timed out for me); covered by reasoning, not by a test. Next: mock the client and test `submit`.
- No toast / push-style notification when a claim settles off-screen — only the Home banner.
- Deep-linked claim screens have no back arrow; a header **Home** button is the workaround.
- Unit tests cover the money module only; no component or hook tests.
- Client clock is used only for "Updated N s ago"; skew can make that label slightly off.
