# CashMine payback — Expo web slice

**Live:** https://cashmine-denys-d.vercel.app

Open it on a phone, tap **Add token** and paste your API token. It is kept in this browser only
(`localStorage`) and can be removed or replaced from the **Token** button.

## Run locally

```sh
npm install
npx expo start --web      # http://localhost:8081
npm test                  # unit tests for amount logic (node:test, no extra runner)
npx tsc --noEmit          # type-check
npx expo export -p web    # static build in dist/
```

Requires Node 22+. No `.env` is needed for the app; the token is entered in the UI.

## What works

- **Token:** add / remove / replace in a modal; 401 sends you back to it; cached data is dropped on token change.
- **Balances (Home):** per-asset available / pending / claiming, total and available-to-claim in USD,
  "Updated N s ago" from `asOf`, auto-refresh every 15 s, Refresh button, loading / error + Retry / empty /
  stale / refresh-failed states.
- **Claim:** pick asset → amount or Max → live validation against the API rules (format, decimals, min,
  available, fee) → fee and receive amount → destination → Review → Confirm. Idempotent submit with retries,
  status screen polling until completed / failed, per-asset blocking until the server snapshot reflects the claim.
- **Tests:** `src/money/money.test.ts` — parsing, validation, fee, USD totals (19 tests).
- **Not done:** Activity screen (API hook exists, no UI). See `NOTES.md`.

Maestro flows used for checking in mobile Safari: `.maestro/token.yaml`, `.maestro/claim.yaml`.
