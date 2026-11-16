# AGENTS.md — Web3 Pre-Flight Guard

Instruksi ini dibaca AI agent (Claude Code, Cursor, Antigravity, dll) di awal setiap sesi. Jaga file ini di bawah ~200 baris. Rule yang sifatnya mekanis (format, lint) sebaiknya dijalankan sebagai script/hook, bukan mengandalkan agent mengingatnya terus-menerus.

Kompatibel dengan `CLAUDE.md` — bisa disalin/symlink menjadi `CLAUDE.md` jika menggunakan Claude Code.

## Project ini apa

**Web3 Pre-Flight Guard** — dashboard *read-only* untuk melakukan *due diligence* keamanan Web3 sebelum user berinteraksi dengan wallet, *smart contract*, atau tautan dApp di ekosistem EVM (**Base**, **Arbitrum**, **Ethereum**), ditenagai oleh **Webacy (DD.xyz) Risk Engine API**.

**Baca `ARCHITECTURE.md` dulu sebelum kerja di sini.** File ini berisi instruksi operasional — keputusan desain, batasan MVP, dan alasannya ada di sana.

## Stack

- Next.js 15 (App Router) + TypeScript (strict mode)
- Next.js Route Handlers (`/api/*`) sebagai *backend security proxy* ke `https://api.webacy.com`
- Tailwind CSS + shadcn/ui
- Zod untuk semua validasi input (alamat EVM, chain, URL)
- Vitest + ESLint untuk testing & typecheck

## Commands

```bash
pnpm dev                 # dev server (localhost:3000)
pnpm build               # production build
pnpm lint                # eslint + typecheck
pnpm test                # vitest
```

## Konvensi

- **API Proxy Wajib di Server:** Semua panggilan ke `https://api.webacy.com` HARUS lewat Next.js Route Handler (`app/api/*`). Jangan pernah memanggil Webacy API langsung dari *client component* atau mengekspos `WEBACY_API_KEY` ke browser.
- **Prinsip *Fail-Closed* (Non-Negotiable):** Jika respons Webacy API error (`4xx`/`5xx`), timeout, `stale: true`, atau field `overallRisk` tidak tersedia, sistem WAJIB mengembalikan status `unknown` — **jangan pernah** menganggapnya `safe`.
- **Validasi Input Ketat:** Semua input (`address`, `chain`, `url`) WAJIB divalidasi dengan Zod schema di `lib/validations/` sebelum diproses atau diteruskan ke upstream API.
- **Mock Mode Fallback:** Jika `process.env.WEBACY_API_KEY` belum diset di `.env.local`, `/api/scan` otomatis berjalan di `mode: "mock"` agar UI tetap bisa dites dan didemokan tanpa biaya.
- **Struktur Komponen:** Primitive shadcn/ui di `components/ui/`, komponen domain-specific di `components/{domain}/` (misal `components/scanner/`).

## Do

- Sebelum mulai task yang menyentuh >1 file, tulis checklist rencana ke `tasks/todo.md` dulu.
- Jalankan `pnpm lint` dan `pnpm test` sebelum menganggap task selesai.
- Pastikan setiap endpoint baru ke Webacy mengikuti path v2/v3 resmi (tanpa prefix `/api/` di URL `api.webacy.com`) dan menyertakan header `x-api-key`.

## Don't

- Jangan *hardcode* `WEBACY_API_KEY` atau secret apa pun di kode. Pakai `.env.local` dan `process.env`.
- Jangan tambahkan fitur eksekusi transaksi, *private key handling*, atau *signing* di MVP — aplikasi ini **100% *read-only***.
- Jangan render URL hasil scan sebagai tautan aktif yang langsung mengarahkan user keluar tanpa peringatan (*phishing risk*).
- Jangan implementasi item di "Non-Goals MVP" (lihat `ARCHITECTURE.md`) tanpa konfirmasi eksplisit.

## Kalau stuck / ambigu

Cek `ARCHITECTURE.md#5-open-questions`. Jika pertanyaan terkait alur keamanan atau format respons API belum terjawab di sana, tambahkan ke section tersebut dan cek dokumentasi resmi `https://docs.webacy.com/` sebelum berasumsi.
