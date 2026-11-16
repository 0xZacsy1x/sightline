## Design System

Baca `DESIGN.md` sebelum mengerjakan UI component atau styling.
Logo assets ada di `public/` — lihat `DESIGN.md` section Logo.

**`UI-REFERENCE.md` adalah sumber kebenaran untuk UI** (layout, Tailwind classes, warna, spacing, copy).
Kalau token/warna/radius di `DESIGN.md` bertabrakan dengan `UI-REFERENCE.md`, ikuti `UI-REFERENCE.md`.
`DESIGN.md` tetap berlaku untuk brand/logo, verdict mapping, dan security constraints.

- Tailwind v4: token ada di `@theme` di `src/app/globals.css` (tidak ada `tailwind.config.ts`).
- Primitives blueprint: `src/components/blueprint/` (Section + corner marks, SectionLabel, DotGrid, MockDataBanner).
- Hero halaman: `src/components/layout/page-hero.tsx`.

## Commands

- `npm run dev` — dev server
- `npm run lint` — eslint + `tsc --noEmit`
- `npm run build` — production build; setelahnya cek `grep -rE "x-api-key|api\.webacy\.com" .next/static/` harus kosong,
  dan nilai key dari `.env.local` tidak boleh muncul di `.next/static/`.
  (`grep WEBACY_API_KEY` saja akan selalu match teks banner MOCK DATA — itu nama variabel, bukan nilainya.)

# CLAUDE.md — Sightline

## Project

Sightline: Web3 security scanner dApp (Next.js 15, DD.xyz grant).
"See what you're signing" — 100% read-only, fail-closed.

## Key Docs (BACA SEBELUM CODING)

- `DESIGN.md` — brand identity, design tokens, logo SVG, verdict system, security constraints
- `UI-REFERENCE.md` — PIXEL-EXACT UI spec per halaman. Tailwind classes, layout, spacing, colors. SUMBER KEBENARAN untuk semua visual.
- `architecture.md` — system architecture
- `prd.md` — product requirements
- `todo.md` — task tracker

## Stack

Next.js 15 App Router, TypeScript strict, Tailwind + shadcn/ui, Zod, Geist font family.

## Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Type check: `npx tsc --noEmit`

## Security Rules (NON-NEGOTIABLE)

- ALL Webacy API calls via `app/api/*` Route Handlers only. Never expose API key to client.
- Fail-closed: API error/timeout/stale → verdict `UNKNOWN`, never `SAFE`.
- No `dangerouslySetInnerHTML`. All API strings rendered as text.
- Scanned URLs rendered as monospace text, never `<a href>`.
- No transaction execution, signing, or private key handling. 100% read-only app.
- `WEBACY_API_KEY` only in `.env.local`. Verify: `grep -r WEBACY_API_KEY .next/static/`

## UI Rules

- Border radius: rounded-sm (2px) ONLY. No rounded-lg or rounded-xl.
- No shadows. Use borders (border-brand-border).
- No gradients except dot-grid pattern mask.
- All labels/badges/code: font-mono. All headings: font-sans.
- Section boundaries: "+" corner marks.
- Hero sections: dot-grid background.
- List separators: border-dashed.
- Max width: max-w-[1200px]. Page padding: px-8.
- Aesthetic: blueprint/ledger — structural, flat, technical.

## Mock Mode

When WEBACY_API_KEY is not set, show mock data with dark banner:
"MOCK DATA — This is a simulation. Live mode activates after WEBACY_API_KEY is set."

## Every component must handle: loading, error, and empty states.
