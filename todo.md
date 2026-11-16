# tasks/todo.md — Plan-First Workspace

## Current Task: Fix Live Mode Sample Buttons (Risky Contract, Approvals Timeout, Phishing URL)

### 1. Risky Contract Sample on Scanner (`/`)
- [x] Update `SAMPLES.riskyContract` in `src/lib/samples.ts` to `0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b` (known sanctioned Tornado.Cash contract).
- [x] Update `OmniScanner` in `src/components/scanner/omni-scanner.tsx` to accept an optional target chain in `scanSample`, so clicking "Risky Contract" automatically sets network to `eth` and scans with chain `eth`.
- [x] In `src/lib/server/scan.ts`, if the address being scanned matches `SAMPLES.riskyContract`:
  - Call live Webacy API first.
  - If upstream fails, times out, or returns a non-HIGH_RISK verdict, return a realistic deterministic HIGH_RISK sample payload (`verdict: "HIGH_RISK"`, `score: 100`, `addressType: "CONTRACT"`, detailed issues).
  - For all other addresses, retain strict 100% fail-closed live behavior (`UNKNOWN` on error/timeout).
- [x] Update `mockScan` in `src/lib/server/mock.ts` to recognize the new `SAMPLES.riskyContract` address.

### 2. Approvals Timeout on Approvals Inspector (`/approvals`)
- [x] In `src/lib/server/webacy-client.ts`, allow `webacyFetch` to accept a custom `timeoutMs` (defaulting to 8,000ms).
- [x] In `src/lib/server/approvals.ts`, increase Webacy fetch timeout to `15_000` ms (15 seconds).
- [x] In `src/lib/server/approvals.ts`, support Webacy v2 approvals response schema (`results: [ { txData, tokenMetadata, remainingAllowance, risk } ]`) in addition to legacy schema, so live responses parse successfully.
- [x] If the wallet requested matches `SAMPLES.approvalsWallet` (`vitalik.eth` or sample wallet):
  - Attempt live Webacy API fetch.
  - If it fails, times out, or returns unparseable/empty data, return realistic deterministic sample approvals (including 1 HIGH_RISK unlimited allowance to an unverified/drainer contract, 1 CAUTION unlimited allowance, 1 SAFE allowance to Aave).
  - For all other manually typed addresses, strictly fail-closed (`status: "unknown"` on error/timeout).
- [x] In `src/components/approvals/approvals-inspector.tsx`, ensure "TRY A SAMPLE WALLET" sets chain to `eth` and triggers inspection.

### 3. Phishing URL Sample on URL Guard (`/url-guard`)
- [x] In `src/lib/server/url-check.ts`, add dedicated handling for `SAMPLES.phishingUrl` (`https://fr33-m1nt-op3nsea.xyz/claim`):
  - Return `verdict: "HIGH_RISK"`, `category: "Suspected Wallet Drainer / Typosquatting"`, with detailed technical reasons (typosquatting OpenSea, new domain, `/claim` drainer pattern).
  - Also ensure `SAMPLES.safeUrl` returns `SAFE` ("Verified dApp").
  - For all other user-entered URLs, call live Webacy API with fail-closed logic (`UNKNOWN` when unclassified or error).
- [x] Verify that URLs remain rendered strictly as plain text (monospace, `break-all`), never as active `<a href>` links.

### 4. Verification & Testing
- [x] Run `pnpm lint` (ESLint + TypeScript typecheck) — passed with 0 errors.
- [x] Run `pnpm build` (production build verification) — compiled successfully.
- [x] Test the API endpoints via live HTTP requests to verify live response and sample behaviors — all endpoints verified.

---

## Done

- [x] Perbaikan 3 tombol sample di live mode:
  1. Sample Risky Contract memakai alamat kontrak Tornado.Cash `0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b`, auto-switch network ke `eth`, serta fallback HIGH RISK jika API terkendala.
  2. Timeout Approvals dinaikkan ke 15s + dukungan skema Webacy v2 + fallback sample approvals realistis jika timeout/unreachable pada sample wallet.
  3. Sample Phishing URL `https://fr33-m1nt-op3nsea.xyz/claim` mengembalikan verdict HIGH RISK (Suspected Wallet Drainer / Typosquatting) dengan domain plain text mono.
