# Product Requirements Document (PRD): Web3 Pre-Flight Guard

## Problem Statement
Pengguna Web3—terutama pemula dan *everyday DeFi users*—sering menandatangani transaksi atau memberi *token approval* secara membabi buta karena *block explorer* standar hanya menampilkan data mentah (hexadecimal, hash, dan *event log*) tanpa konteks risiko yang jelas. Di sisi lain, alat keamanan yang ada sering kali terlalu teknis atau terfragmentasi antara pengecekan wallet, kontrak, dan tautan *phishing*. Akibatnya, pengguna rentan terhadap *unlimited approval drainers*, interaksi dengan *smart contract* berbahaya, serta tautan dApp palsu sebelum transaksi sempat dibatalkan. Dibutuhkan antarmuka *pre-flight due diligence* yang cepat, *read-only*, dan menerjemahkan sinyal keamanan *on-chain* menjadi keputusan jelas (**Safe / Caution / High Risk / Unknown**) sebelum user berinteraksi.

## Status Rilis & Ruang Lingkup Dokumen Ini

Dokumen ini mendeskripsikan **visi produk penuh** (termasuk integrasi penuh pasca-persetujuan grant DD.xyz), namun rilis saat ini adalah **v1.0: *read-only* Web3 Pre-Flight Scanner dengan *backend security proxy* Next.js dan *mock mode fallback*** — lihat bagian *Scope*. Metrik dan fitur bertanda 🔮 hanya relevan setelah kunci API live **Webacy (DD.xyz)** aktif dan integrasi *wallet adapter* (v1.1 / v2.0) dibangun. Jangan mengoptimasi arsitektur untuk fitur 🔮 selama masih menyelesaikan fondasi v1.0.

## Goals
- **G-1** ✅ **v1**: Menyediakan alur *pre-flight check* 1-klik (input alamat EVM atau tombol *sample*) yang mengembalikan *verdict* risiko dalam waktu < 2 detik di UI.
- **G-2** ✅ **v1**: Menerapkan arsitektur *security-first* (*backend API proxy* + pola ***fail-closed*** di mana data error/*stale* selalu dikembalikan sebagai `unknown`, tidak pernah `safe`).
- **G-3** ✅ **v1**: Mencapai skor Lighthouse ≥ 95 (Performance, Accessibility, Best Practices, SEO) dan siap di-deploy ke Vercel sebagai *live demo* pengajuan grant DD.xyz.
- **G-4** 🔮 **v2.0**: Mengintegrasikan seluruh endpoint inti Webacy DD.xyz (**Threat**, **Exposure**, **Approval**, **Contract**, **URL**, dan **Transaction Risks**) dalam jendela integrasi 3 bulan pasca-grant dengan dukungan multi-chain (**Base**, **Arbitrum**, **Ethereum**, dan ekspansi ke **Solana**).

## Success Metrics — v1.0 (Yang Benar-Benar Bisa Diukur Sekarang)

- `npm run build` menghasilkan **nol** error TypeScript (`strict mode`), dan `npm run lint` menghasilkan nol error ESLint blocking.
- `npm run test` (Vitest) lulus 100% untuk unit test validasi input Zod (`0x...`, 42 karakter hex) dan evaluator *fail-closed* (`safe`, `caution`, `high_risk`, `unknown`).
- API Route `/api/scan` tetap berfungsi normal di **Mock Mode** tanpa `WEBACY_API_KEY` dan langsung beralih ke **Live Mode** saat key diisi di `.env.local` (tanpa mengubah kode frontend).
- Lighthouse Performance / Accessibility / Best Practices / SEO ≥ 95 pada halaman utama scanner di simulasi 4G.
- Baseline aksesibilitas WCAG AA: kontras warna badge *verdict* jelas dan seluruh elemen form dapat dinavigasi via keyboard.

## Target User
- **Pemula Web3 & DeFi Retail Users:** Sering ragu saat diminta menandatangani transaksi atau mengakses tautan dApp baru. *Pain point*: Tidak mengerti cara membaca kode *smart contract* atau mengecek apakah suatu *approval* berbahaya di *block explorer*.
- **Active On-Chain Traders / Airdrop Hunters:** Rutin berinteraksi dengan banyak kontrak baru di jaringan **Base** dan **Arbitrum**. *Pain point*: Membutuhkan pengecekan cepat (*pre-flight check*) sebelum menghubungkan wallet agar terhindar dari *drainer*.
- **Panelis Grant & Ekosistem Webacy (DD.xyz):** Meninjau kelayakan dan kecepatan eksekusi dApp yang mengajukan kredit API. *Pain point*: Banyak pelamar hanya mengirim ide teks tanpa *working prototype* atau pemahaman pola *fail-closed*.

## User Stories
- Sebagai **Pengguna Web3**, saya ingin **menempel alamat wallet atau *smart contract* dan memilih jaringan (Base/Arbitrum/Ethereum)** supaya **saya langsung tahu apakah alamat tersebut EOA atau Smart Contract beserta tingkat risikonya sebelum bertransaksi**. *(v1: `/api/scan` mendukung Live Webacy API + Mock Mode fallback.)*
- Sebagai **Pengguna Web3 yang Waspada**, saya ingin **sistem menampilkan status `UNKNOWN (FAIL-CLOSED)` jika data gagal dimuat atau *stale*** supaya **saya tidak tertipu menganggap kontrak berbahaya sebagai aman hanya karena API sedang gangguan**. *(v1 penuh sesuai [Webacy API Docs](https://docs.webacy.com/api-reference/introduction).)*
- Sebagai **DeFi User**, saya ingin **memeriksa daftar *token approval* yang berisiko dan memindai tautan dApp sebelum *connect wallet*** supaya **aset ERC-20 saya tidak terkuras oleh *unlimited allowance* atau situs *phishing***. *(v1.1 / v2.0 setelah perluasan endpoint Approval & URL Risk.)*
- Sebagai **Pengguna Harian**, saya ingin **menghubungkan wallet secara *read-only* dalam satu klik** supaya **saya bisa memindai alamat saya sendiri tanpa perlu menyalin-tempel alamat secara manual**. *(v1.1 via `wagmi` + `viem`, tanpa tanda tangan transaksi.)*

## Functional Requirements

- **FR-1 [P0] Omni-Scanner & Backend Security Proxy (`/api/scan`).**
  - ✅ **v1:** Validasi alamat EVM (`^0x[a-fA-F0-9]{40}$`) dan pilihan chain (`base`, `arbitrum`, `eth`) dengan Zod; meneruskan request ke `https://api.webacy.com/addresses/{address}` memakai header `x-api-key` di sisi server, atau otomatis memakai *Mock Mode* jika `WEBACY_API_KEY` kosong.
- **FR-2 [P0] Risk Verdict & Account Identity Card.**
  - ✅ **v1:** Menampilkan status tegas (`SAFE`, `CAUTION`, `HIGH RISK`, `UNKNOWN`), skor `overallRisk`, identitas **EOA Wallet** vs **Smart Contract** (`isContract`), serta daftar temuan (`issues`) lengkap dengan penjelasan ramah pemula.
- **FR-3 [P0] Fail-Closed Evaluator.**
  - ✅ **v1:** Menjamin setiap respons error (`4xx`/`5xx`), timeout, `stale: true`, atau ketiadaan `overallRisk` dipetakan menjadi `unknown` — tidak pernah `safe` ([Webacy API Docs](https://docs.webacy.com/api-reference/introduction)).
- **FR-4 [P1] Approval Risks & URL Phishing Guard.**
  - 🔮 **v1.1 / v2.0:** Penambahan tab pemindai izin ERC-20 (`approve()` / *unlimited allowance*) dan pemindai URL dApp (*drainer/phishing*) menggunakan endpoint **Approval Risks** dan **URL Risk** Webacy.
- **FR-5 [P2] Connect Wallet (Read-Only) & Local Scan History.**
  - 🔮 **v1.1:** Koneksi wallet via `wagmi` + `viem` hanya untuk membaca alamat aktif (*zero gas fee*) + penyimpanan 5 riwayat scan terakhir di `localStorage` browser.

## Non-Functional Requirements

- **NFR-1** ✅ (Security — API Key & Phishing Hygiene): `WEBACY_API_KEY` tidak boleh terekspos ke client bundle (`NEXT_PUBLIC_*` dilarang untuk secret); URL hasil scan yang terdeteksi berisiko tidak boleh dirender sebagai tautan aktif yang bisa diklik langsung tanpa peringatan.
- **NFR-2** ✅ (Performance): Waktu respons UI dari klik *Scan* hingga hasil tampil maks. 2,5 detik pada jaringan 4G standar (dengan *loading skeleton* yang jelas).
- **NFR-3** ✅ (Quality — **berlaku sekarang**): Kode mengikuti TypeScript `strict mode` tanpa `any`, lolos ESLint, dan mengikuti konvensi di `AGENTS.md`.
- **NFR-4** 🔮 (Reliability & Rate-Limit Handling): Implementasi *caching* ringan dan *rate-limit protection* pada proxy server agar kuota Credit Unit (CU) Webacy tidak boros saat trafik publik meningkat setelah rilis penuh.

## Scope
- **IN (Release v1.0):**
  - Halaman utama **Web3 Pre-Flight Risk Scanner** (*read-only*, Rp 0 biaya infrastruktur).
  - *Backend proxy* `/api/scan` dengan validasi Zod, pola *fail-closed*, dan *Mock Mode* bawaan.
  - Tombol uji cepat (*Sample EOA Aman* & *Sample Contract Berisiko*) untuk mempermudah demo ke panelis grant.
  - Dokumentasi proyek lengkap (`README.md`, `ARCHITECTURE.md`, `AGENTS.md`, `tasks/todo.md`, `PRD.md`).
- **OUT (Release v1.0 — Ditunda ke v1.1 / v2.0+):**
  - Eksekusi transaksi *on-chain*, *auto-revoke approval*, atau penyimpanan *private key* (aplikasi tetap 100% *read-only*).
  - Custom blockchain indexer atau node RPC arsip sendiri.
  - Sistem autentikasi user dan database SQL (stateless di v1.0 untuk meminimalkan *friction*).
  - Dukungan penuh chain non-EVM (**Solana**, **TON**, **Sui**) — ditargetkan pada fase pasca-grant.

## Assumptions & Risks

- **Risiko:** Jika desain UI terlalu mirip *block explorer* teknis, pengguna pemula tetap bingung mengambil keputusan. **Mitigasi:** Fokuskan hierarki visual pada *Verdict Badge* (`SAFE` / `CAUTION` / `HIGH RISK` / `UNKNOWN`) dan ringkasan berbahasa sederhana sebelum menampilkan detail teknis.
- **Risiko:** Belum tersedianya `WEBACY_API_KEY` live sebelum grant disetujui dapat menghambat pengujian integrasi nyata. **Mitigasi:** *Mock Mode* dirancang mengikuti struktur JSON resmi [Webacy API Docs](https://docs.webacy.com/api-reference/introduction) (`overallRisk`, `isContract`, `issues`, `stale`, `analyzed_at`) sehingga transisi ke API live cukup dengan mengisi `.env.local`.
- **Risiko:** Perubahan skema respons pada endpoint v2/v3 Webacy (misalnya perbedaan prefix `/v3/` vs tanpa `/api/`). **Mitigasi:** Isolasi seluruh panggilan upstream di `app/api/` dan wajibkan pengecekan `docs.webacy.com` sebelum menambah endpoint baru (lihat `AGENTS.md`).
- **Asumsi:** Deployment awal menggunakan Vercel (Free/Hobby tier) dan tidak memerlukan database eksternal selama fase MVP v1.0.
