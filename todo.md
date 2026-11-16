# tasks/todo.md — Plan-First Workspace

## Current Task: UI Polish, Bug Fixes, GSAP Animations, Demo Mode

### Phase 1 — Bug fixes & polish
- [x] `src/lib/mock-data.ts`: simulated results for every sample (typed against the `/api/*` response schemas).
- [x] Sample buttons fill the form and render the mock result client-side — no API call, works with or without `WEBACY_API_KEY`. MOCK DATA banner on top.
- [x] Server mock mode reuses the same mock data; live-mode sample fabrications removed (live results are strictly fail-closed again).
- [x] Loading = mono status line + pulsing skeleton; Error = red-bordered card + TRY AGAIN; Empty = unchanged. Shared `ResultSection`.
- [x] Result section scrolls into view when a scan starts/finishes.
- [x] Footer label "Security Guide" → "Guide" (same as navbar).
- [x] `/approvals` network selector → toggle buttons (shared `NetworkField`).
- [x] GitHub link live (navbar, footer, guide "VIEW ON GITHUB").
- [x] Metadata (`metadataBase`, Open Graph, Twitter) + `public/og-image.png` via `pnpm og`.

### Phase 2 — GSAP animations
- [ ] `src/hooks/use-gsap.ts` — scoped hooks, reduced-motion aware, cleaned up on unmount.
- [ ] Hero: word stagger, subtitle fade, form slide-up, dot-grid parallax.
- [ ] Scroll reveals: bento grids, how-it-works + architecture sequences, network pills, explainers.
- [ ] Result enters: verdict card, approvals rows, phishing shake / safe flash.

### Phase 3 — Demo mode
- [ ] WATCH DEMO next to the scanner form: type address → select network → loading → mock HIGH RISK verdict.

---

## Done

- [x] Perbaikan 3 tombol sample di live mode (digantikan oleh mock client-side di Phase 1 di atas).
