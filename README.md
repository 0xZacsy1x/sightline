# Web3 Pre-Flight Guard

Dashboard *read-only* untuk melakukan *due diligence* keamanan Web3 sebelum bertransaksi—memeriksa profil risiko wallet (EOA), *smart contract*, izin *token approval*, dan tautan *phishing/drainer* di jaringan **Base**, **Arbitrum**, dan **Ethereum**.

Dibangun menggunakan **Next.js 15** dan dirancang untuk integrasi dengan **Webacy (DD.xyz) Risk Engine API** ([Webacy Docs](https://docs.webacy.com/api-reference/introduction)).

## Masalah yang diselesaikan

- **Sulit membedakan alamat aman vs berbahaya** — *block explorer* hanya menampilkan data mentah, bukan ringkasan risiko yang mudah dipahami.
- **Risiko *unlimited token approval*** — user sering tidak sadar telah memberi izin ke kontrak yang berpotensi menguras token ERC-20.
- **Maraknya tautan *drainer/phishing*** — butuh lapisan pengecekan cepat (*pre-flight check*) sebelum *connect wallet* atau *signing*.

## Fitur utama (MVP)

1. **Address & Contract Scanner** — membedakan EOA vs *Smart Contract* (`isContract`), menampilkan skor `overallRisk`, dan daftar temuan (`issues`).
2. **Approval Risks Checker** *(tahap lanjut)* — mendeteksi izin token berisiko tinggi.
3. **URL Phishing Guard** *(tahap lanjut)* — memindai keamanan tautan dApp sebelum dibuka.
4. **Fail-Closed & Mock Mode** — aman secara *default* (*unknown* saat API gagal/*stale*) dan tetap bisa diuji lokal tanpa API key.

## Tech Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Zod · Webacy (DD.xyz) API

Alasan di balik setiap pilihan teknis ada di [ARCHITECTURE.md](https://www.google.com/search?q=./ARCHITECTURE.md).

## Getting Started

```bash
# install dependencies
npm install

# copy env template (opsional — tanpa API key akan otomatis jalan di Mock Mode)
cp .env.example .env.local

# jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Environment variables

```env
# Opsional saat development awal (kosongkan untuk menggunakan Mock Mode)
WEBACY_API_KEY=
```

## Struktur proyek

```
app/
  api/scan/route.ts       # Backend security proxy ke Webacy API + Fail-Closed logic
  page.tsx                # UI Pre-Flight Risk Scanner
components/
  ui/                     # shadcn/ui primitives
  scanner/                # Komponen domain pemindai risiko
lib/
  validations/            # Zod schemas (EVM address, chain, URL)
tasks/
  todo.md                 # Plan-first checklist (lihat AGENTS.md)
```

## Dokumen lain

- [ARCHITECTURE.md](https://www.google.com/search?q=./ARCHITECTURE.md) — keputusan desain, alur *fail-closed*, dan batasan MVP.
- [AGENTS.md](https://www.google.com/search?q=./AGENTS.md) — instruksi operasional untuk AI coding agent.

## Status

MVP Tahap 1 — *Read-Only Address & Contract Scanner* siap dijalankan di *Mock Mode* sambil menyiapkan pengajuan grant DD.xyz.
