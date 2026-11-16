# ARCHITECTURE.md — Web3 Pre-Flight Guard

Dokumen ini berisi keputusan desain, batasan teknis, dan alasannya. Jika ada perubahan besar pada arsitektur, stack, atau alur keamanan, perbarui dokumen ini terlebih dahulu agar kode dan dokumentasi tetap sinkron.

## 1. Scope & Non-Goals (MVP)

**Yang dibangun di MVP:**
- **Address & Contract Risk Scanner:** Memeriksa alamat EVM (`0x...`) di jaringan **Base**, **Arbitrum**, dan **Ethereum** untuk membedakan **EOA** vs. **Smart Contract** (`isContract`), skor risiko (`overallRisk`), serta daftar temuan (`issues`).
- **Approval Risks Checker:** Menganalisis izin token ERC-20 (`approve()` / *unlimited allowance*) yang berpotensi menguras aset wallet.
- **URL Phishing / Drainer Guard:** Memindai tautan dApp sebelum user menghubungkan wallet atau menandatangani transaksi.
- **Mock Mode Fallback:** Simulasi respons terstruktur agar MVP dapat didemokan dan diuji di lokal/Vercel sebelum API key grant aktif.

**Non-goals MVP (sadar, bukan lupa):**
- ❌ **Eksekusi transaksi / *wallet custody* / *auto-revoke*:** MVP bersifat **100% *read-only***. Alasan: meminimalkan risiko bug *smart contract* atau kehilangan dana user, serta mempercepat rilis untuk pengajuan grant.
- ❌ **Custom blockchain indexer / archive node sendiri:** Seluruh agregasi sinyal *on-chain* diserahkan ke **Webacy (DD.xyz) Risk Engine** agar biaya infrastruktur tetap Rp 0.
- ❌ **Auth & database persistensi di v1:** Scanner dibuat *stateless* terlebih dahulu supaya user (dan panelis grant) bisa langsung mencoba tanpa registrasi.

## 2. Tech Stack & Rationale

| Layer | Pilihan | Alasan | Trade-off yang diterima |
|---|---|---|---|
| Framework | Next.js 15 (App Router) | Fullstack dalam satu repo (UI + backend API proxy), mudah di-deploy ke Vercel untuk live demo | Perlu disiplin memisahkan Server/Route Handler dan Client Component |
| Bahasa | TypeScript (strict mode) | Mencegah salah tipe data pada skor risiko, status *verdict*, dan payload API | Sedikit lebih verbose saat mendefinisikan schema respons API |
| Validasi | Zod | Validasi format alamat EVM (`^0x[a-fA-F0-9]{40}$`), enum chain, dan URL secara ketat di server | Perlu update schema jika menambah chain non-EVM (seperti Solana) |
| Risk Intelligence | Webacy (DD.xyz) REST API | Menggabungkan >15 sumber data ancaman, analisis kontrak, *approval*, dan URL dalam satu API | Bergantung pada ketersediaan & kuota API eksternal (dimitigasi dengan *fail-closed*) |
| UI | Tailwind CSS + shadcn/ui | Cepat dibangun, bersih, mudah dikustomisasi agar tidak terlihat generik | Perlu konsistensi *design token* |
| Deploy | Vercel (Hobby / Free Tier) | Zero-config, Rp 0, langsung menghasilkan URL demo untuk aplikasi grant | *Execution timeout* serverless standar (cukup untuk REST proxy) |

## 3. Data & Security Model

```
Client (Browser)
 └── Input: address / url + chain (base | arbitrum | eth)
       │
       ▼
Next.js Route Handler (/api/scan)
 ├── 1. Zod Validation (tolak input invalid dengan 400)
 ├── 2. Cek process.env.WEBACY_API_KEY
 │     ├── Tidak ada -> Mock Mode (simulasi EOA aman vs Contract berisiko)
 │     └── Ada -> Fetch https://api.webacy.com/... (header: x-api-key)
 └── 3. Fail-Closed Evaluator
       ├── Error 4xx/5xx / timeout / stale: true / missing overallRisk -> "unknown"
       ├── overallRisk >= 70 atau high > 0 -> "high_risk"
       ├── overallRisk >= 30 atau medium > 0 -> "caution"
       └── Selain itu -> "safe"
```

**Catatan Keamanan Penting:**
1. **Fail-Closed:** Sesuai panduan resmi [Webacy API Docs](https://docs.webacy.com/api-reference/introduction), data yang *stale*, *error*, atau tidak lengkap tidak boleh pernah ditampilkan sebagai `safe`.
2. **Base URL Versioning:** Endpoint v2 Webacy tidak memakai prefix `/api/` (contoh: `https://api.webacy.com/addresses/{address}`). Menambahkan `/api/` menyebabkan error `403 Missing Authentication Token`.

## 4. Key Flows

**Flow: Pre-Flight Risk Scan**
1. User memilih jaringan (**Base**, **Arbitrum**, atau **Ethereum**) dan menempel alamat EVM (`0x...`) atau URL dApp.
2. Frontend mengirim request ke `/api/scan` (internal Next.js Route Handler).
3. Server memvalidasi input via Zod, lalu memanggil `https://api.webacy.com` dengan header `x-api-key` (atau memakai *mock data* jika key belum diset).
4. Server mengevaluasi *verdict* secara *fail-closed* (`safe` | `caution` | `high_risk` | `unknown`) dan mengembalikan ringkasan skor, `isContract` (EOA vs Smart Contract), serta daftar `issues` ke UI.

## 5. Open Questions (belum diputuskan, jangan asumsi)

- Nama final dan *branding* produk sebelum submit form grant DD.xyz?
- Apakah akan menambahkan fitur opsional *Connect Wallet (Read-Only)* via `wagmi`/`viem` di v1.1 setelah *scanner* berbasis input teks selesai?
- Apakah perlu mendukung alamat non-EVM (**Solana**) di MVP v1 atau ditunda ke v1.2 setelah grant disetujui?
