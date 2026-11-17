# Sightline

> **"See what you're signing."**

Sightline adalah web3 security scanner **read-only** untuk memeriksa alamat wallet, smart contract, token approval, dan URL dApp **sebelum** kamu connect wallet atau menandatangani transaksi. Dibangun dengan Next.js 15 dan Webacy (DD.xyz) Risk Engine API. Proyek ini diajukan untuk grant DD.xyz.

- **100% read-only** — tidak ada eksekusi transaksi, signing, atau penanganan private key.
- **Fail-closed** — error API, timeout, data stale, atau `overallRisk` yang hilang selalu menghasilkan `UNKNOWN`, tidak pernah `SAFE`.
- **API key tidak pernah ke client** — semua panggilan Webacy lewat Route Handler `app/api/*` di server.

## Masalah yang diselesaikan

- **Block explorer hanya menampilkan data mentah** (hex, hash, event log). Sightline menerjemahkannya menjadi verdict yang mudah dipahami.
- **Unlimited token approval** sering tidak disadari user, padahal bisa dipakai drainer untuk menguras ERC-20.
- **Tautan phishing / drainer** sulit dibedakan dari dApp asli. Sightline menyediakan pre-flight check untuk URL.

## Fitur

| Halaman | Route | Fungsi |
|---|---|---|
| Scanner | `/` | Tempel alamat EVM, tx hash, atau URL → verdict risiko terpadu |
| Approvals | `/approvals` | Audit token approval milik sebuah wallet (paste address) |
| URL Guard | `/url-guard` | Cek keamanan URL dApp sebelum dibuka |
| Guide | `/guide` | Panduan keamanan, tips, dan glosarium |

Jaringan yang didukung: **Base**, **Arbitrum**, dan **Ethereum**.

### Verdict

| Verdict | Arti |
|---|---|
| `SAFE` | Skor risiko 0–30 dan tidak ada temuan high/medium |
| `CAUTION` | Skor 31–60, atau ada temuan medium |
| `HIGH RISK` | Skor 61–100, atau ada temuan high |
| `UNKNOWN` | Data gagal dimuat, timeout, stale, atau tidak lengkap (fail-closed) |

Jumlah temuan hanya bisa menaikkan verdict, tidak pernah menurunkannya.

## Tech stack

- **Next.js 15** (App Router) + **React 19**, **TypeScript** strict
- **Tailwind CSS v4** (token di `@theme`, `src/app/globals.css`) + **shadcn/ui**
- **Zod** untuk validasi input di client dan server
- **GSAP** untuk animasi (menghormati `prefers-reduced-motion`)
- **Geist Sans** + **Geist Mono**
- **Webacy (DD.xyz) Risk Engine API** sebagai sumber data risiko

## Mulai cepat

Prasyarat: Node.js 20+ dan **pnpm** (versi di `packageManager`).

```bash
# instal dependensi
pnpm install

# jalankan dev server
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Environment variable

Buat `.env.local` di root project:

```env
# Opsional. Kosongkan atau hapus untuk Mock Mode.
WEBACY_API_KEY=
```

- **Tanpa `WEBACY_API_KEY`** → aplikasi berjalan di **Mock Mode**. Banner `MOCK DATA` tampil di UI dan hasil berupa simulasi. Cocok untuk demo dan pengembangan UI.
- **Dengan `WEBACY_API_KEY`** → aplikasi memakai **Live Mode** lewat Webacy API. Tidak perlu mengubah kode frontend.

Jangan pernah memberi prefix `NEXT_PUBLIC_` pada key ini, dan jangan commit `.env.local`.

## Scripts

| Perintah | Fungsi |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm start` | Jalankan hasil build |
| `pnpm lint` | ESLint + `tsc --noEmit` |
| `pnpm icons` | Generate ikon dari `scripts/generate-icons.mjs` |
| `pnpm og` | Generate `public/og-image.png` dari `scripts/generate-og.mjs` |

### Verifikasi keamanan setelah build

Pastikan API key tidak bocor ke bundle client:

```bash
pnpm build
grep -rE "x-api-key|api\.webacy\.com" .next/static/   # harus kosong
```

Nilai key dari `.env.local` juga tidak boleh muncul di `.next/static/`. Jangan cukup mengecek nama variabel `WEBACY_API_KEY`, karena teks banner Mock Mode memuat nama itu.

## API routes

Semua route menerima JSON, memvalidasi input dengan Zod (`400` jika tidak valid), dan hanya dipanggil dari server.

| Method | Route | Body | Keterangan |
|---|---|---|---|
| `POST` | `/api/scan` | `{ input, chain? }` | Input berupa EVM address, tx hash, atau URL |
| `POST` | `/api/approvals` | `{ wallet, chain? }` | Daftar token approval untuk sebuah wallet |
| `POST` | `/api/url-check` | `{ url }` | Cek risiko URL (hanya `http`/`https`) |

`chain` berisi `base`, `arb`, atau `eth` (default `eth`).

## Struktur proyek

```
src/
  app/
    api/
      scan/           # POST /api/scan
      approvals/      # POST /api/approvals
      url-check/      # POST /api/url-check
    page.tsx          # Scanner
    approvals/        # Approval Inspector
    url-guard/        # URL Phishing Guard
    guide/            # Security Guide
    globals.css       # Design tokens (@theme)
  components/
    scanner/          # Scanner, hasil scan
    approvals/        # Tabel dan inspector approval
    url-guard/        # Form dan hasil URL check
    blueprint/        # Primitive visual (Section, SectionLabel, DotGrid, MockDataBanner, VerdictBadge, dll.)
    layout/           # Navbar, footer, page hero
    home/, guide/     # Section khusus halaman
  lib/
    validations/      # Zod schema (address, tx hash, URL, chain)
    scan/             # Tipe dan evaluator verdict (fail-closed)
    server/           # Webacy client, scan/approvals/url-check logic, mock, route helper
    client/           # Hook fetch dari sisi client
    mock-data.ts      # Data simulasi untuk sample dan Mock Mode
  hooks/              # use-gsap
public/               # Logo, favicon, OG image, manifest
scripts/              # Generator ikon dan OG image
```

## Dokumentasi

| File | Isi |
|---|---|
| `DESIGN.md` | Identitas brand, design token, logo, sistem verdict, batasan keamanan |
| `UI-REFERENCE.md` | Spesifikasi UI per halaman (sumber kebenaran untuk layout, class, dan copy) |
| `architecture.md` | Arsitektur sistem dan alur fail-closed |
| `prd.md` | Product requirements |
| `todo.md` / `tasks/todo.md` | Tracker tugas |
| `CLAUDE.md`, `agents.md` | Instruksi untuk AI coding agent |

## Batasan (non-goals)

- Tidak ada eksekusi transaksi, auto-revoke approval, atau custody wallet.
- Tidak ada custom indexer atau node RPC sendiri. Agregasi data sepenuhnya di Webacy.
- Tidak ada autentikasi atau database. Scanner bersifat stateless.
- Belum ada dukungan chain non-EVM (Solana, TON, Sui).

## Status

**v1.0: read-only scanner dengan backend proxy dan Mock Mode.** Fitur wallet connect (read-only) dan integrasi endpoint Webacy yang lebih lengkap masuk ke rencana berikutnya. Lihat `prd.md`.

## Lisensi

Belum ditentukan.
