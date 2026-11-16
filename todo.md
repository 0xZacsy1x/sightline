# tasks/todo.md — Plan-First Workspace

Cara pakai (untuk kamu dan untuk agent):

1. Sebelum mulai coding task yang menyentuh lebih dari 1 file, tulis checklist rencana di bawah `## Current Task`.
2. Review rencana SEBELUM mengubah kode — lebih murah memperbaiki arah di sini daripada membongkar kode yang sudah jadi.
3. Setelah task selesai dan lolos `npm run lint` + `npm run test`, pindahkan ke `## Done` dengan ringkasan singkat.
4. Jaga file ini tetap ringkas; ide fitur besar jangka panjang dicatat di `ARCHITECTURE.md`, bukan di sini.

---

## Current Task

### Sightline — Step 1–4: Project setup + layout
- [x] Scaffold `sightline/` dengan create-next-app@15 (TS strict, Tailwind, App Router, `src/`)
- [x] Install deps: shadcn/ui init, zod, lucide-react; Geist via `next/font/google`
- [x] Design tokens (DESIGN.md §3) di `globals.css` (Tailwind v4 `@theme`) + dot-grid
- [x] Layout: `SiteNav` (desktop + mobile drawer), `SiteFooter`, dot-grid background
- [x] Logo SVG di `public/logo/` (dibangkitkan dari path DESIGN.md §2.2) + favicon/icons/manifest
- [x] Placeholder page untuk `/`, `/approvals`, `/url-guard`, `/guide`
- [x] `npm run lint` + `npm run build` lolos

### Tahap 1 & 2 — Fondasi MVP & Pre-Flight Scanner (Read-Only)
- [ ] Inisialisasi proyek Next.js 15 (TypeScript, Tailwind CSS) dan pasang struktur folder (`app/api/scan`, `components/scanner`, `lib/validations`, `tasks`)
- [ ] Buat Zod validation schema di `lib/validations/scan.ts` untuk alamat EVM (`0x...`, 42 karakter) dan pilihan chain (`base`, `arbitrum`, `eth`)
- [ ] Pasang `app/api/scan/route.ts` sebagai backend proxy ke `https://api.webacy.com/addresses/{address}` dengan logika *fail-closed* dan *mock fallback*
- [ ] Pasang UI pemindai di `app/page.tsx` sesuai desain final (tampilan *verdict*, `overallRisk`, status EOA vs Smart Contract, dan daftar `issues`)
- [ ] Uji dua skenario di `localhost:3000`: Sample EOA Aman vs Sample Contract Berisiko, serta pastikan error handling mengembalikan status `Unknown (Fail-Closed)`
- [ ] Lanjutkan ke fitur Approval Risks & URL Phishing Guard setelah UI Tahap 1 stabil

## Done

- [x] Merancang scope MVP *read-only* (Rp 0 biaya) dan dokumentasi proyek (`AGENTS.md`, `ARCHITECTURE.md`, `README.md`, `tasks/todo.md`)
