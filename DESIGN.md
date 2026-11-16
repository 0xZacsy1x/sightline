# Sightline — Design Specification

> Web3 security scanner dApp · DD.xyz Grant · Next.js 15
> "See what you're signing"

---

## 1. Overview

**Sightline** is a read-only Web3 security scanner that helps users inspect wallet approvals, transaction targets, and URLs before interacting with them. Powered by Webacy Risk Engine API via server-side proxy.

### 1.1 Pages

| Route          | Name                | Purpose                                      |
|----------------|---------------------|----------------------------------------------|
| `/`            | Omni-Scanner        | Paste address/tx/URL → unified risk verdict  |
| `/approvals`   | Approval Inspector  | Wallet approval audit (connect or paste)     |
| `/url-guard`   | URL Phishing Guard  | URL safety check                             |
| `/guide`       | Security Guide      | Educational content, tips, glossary          |

### 1.2 Core Principles

- **100% read-only** — no transactions, signing, or private key handling
- **Fail-closed** — API error, timeout, stale, or missing `overallRisk` → `UNKNOWN`, never `SAFE`
- **API key never on client** — all Webacy calls via `app/api/*` Route Handlers
- **No active links to scanned URLs** — render as monospace text, never `<a href>`
- **No `dangerouslySetInnerHTML`** — all API strings rendered as text

### 1.3 Tech Stack

- Next.js 15 App Router
- TypeScript strict
- Tailwind CSS + shadcn/ui
- Zod validation
- Geist Sans + Geist Mono (via `next/font/google`)

---

## 2. Brand

### 2.1 Name & Tagline

- **Brand**: Sightline (lowercase "sightline" in logotype)
- **Tagline**: "See what you're signing"

### 2.2 Logo — Split S

Angular S letterform split by a horizontal channel. The gap IS the sightline — the clear line of sight through which you inspect Web3 transactions.

**Construction:**
- Canvas: 256 × 256 px
- S width: 148 px (x 54–202), height: 200 px (y 28–228)
- Stroke weight: 40 px
- Sightline gap: 20 px at y 118–138 (centered at y 128)
- All angles: 0° / 90°
- Small-size cut: wider 28 px gap, 44 px stroke (for 16–32 px use)

**SVG path (symbol):**
```svg
<path d="M 54 28 H 202 V 68 H 94 V 118 H 54 Z
         M 162 138 H 202 V 228 H 54 V 188 H 162 Z"
      fill="#0B1220" fill-rule="evenodd"/>
```

**Colour usage:**
| Context              | Fill      | Background |
|----------------------|-----------|------------|
| Default (light bg)   | `#0B1220` | light      |
| Brand mono           | `#1F4FD8` | light      |
| Reversed (dark bg)   | `#FBFCFE` | dark       |
| App icon             | `#FBFCFE` | `#0B1220`  |

**Clear space:** minimum = gap height (20 px at full size, proportional at other sizes).

**Minimum sizes:** symbol 16 px (use small-size cut below 32 px), horizontal lockup 120 px wide.

**Don'ts:** no rotation, no gradient/shadow, no altered gap ratio, no busy backgrounds without contrast.

### 2.3 Files in `/public/logo/`

```
public/
├── favicon.ico          # 16/32/48 px
├── favicon.svg          # modern browsers
├── apple-touch-icon.png # 180×180
├── icon-192.png         # PWA
├── icon-512.png         # PWA splash
├── maskable-512.png     # Android adaptive
├── site.webmanifest
└── logo/
    ├── symbol.svg           # primary dark
    ├── symbol-white.svg     # for dark backgrounds
    ├── symbol-cobalt.svg    # brand accent
    ├── symbol-small.svg     # small-size cut (favicon source)
    ├── horizontal.svg       # symbol + wordmark
    └── horizontal-white.svg # for dark backgrounds
```

### 2.4 `<head>` snippet

```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0B1220">
```

---

## 3. Design Tokens

### 3.1 Aesthetic — Blueprint Ledger

Light, flat, structural. Thin grid lines, dot-grid texture, cobalt accent. Think engineering drawing, not dashboard template.

### 3.2 Colours

#### Core palette

| Token         | HEX       | HSL              | Usage                              |
|---------------|-----------|------------------|------------------------------------|
| `cobalt`      | `#1F4FD8` | 224 75% 48%      | Primary brand, links, CTA, focus   |
| `cobalt-light`| `#E8EDFB` | 224 68% 95%      | Hover backgrounds, subtle fills    |
| `dark`        | `#0B1220` | 220 53% 8%       | Body text, headings, logo default  |
| `muted`       | `#5A6478` | 220 15% 41%      | Secondary text, captions           |
| `border`      | `#D1D5DC` | 218 12% 84%      | Borders, dividers                  |
| `surface`     | `#F4F5F7` | 220 12% 96%      | Card backgrounds, code blocks      |
| `background`  | `#FBFCFE` | 220 60% 99%      | Page background                    |

#### Verdict colours

| Verdict      | Badge BG   | Badge Text | Border     | Icon       |
|-------------|-----------|------------|------------|------------|
| `SAFE`       | `#ECFDF5` | `#065F46`  | `#A7F3D0`  | `#10B981`  |
| `CAUTION`    | `#FFFBEB` | `#92400E`  | `#FDE68A`  | `#F59E0B`  |
| `HIGH_RISK`  | `#FEF2F2` | `#991B1B`  | `#FECACA`  | `#EF4444`  |
| `UNKNOWN`    | `#F4F5F7` | `#5A6478`  | `#D1D5DC`  | `#9CA3AF`  |

#### Dark mode (future)

| Token         | Light       | Dark        |
|---------------|------------|-------------|
| `background`  | `#FBFCFE`  | `#0B1220`   |
| `surface`     | `#F4F5F7`  | `#151D2E`   |
| `dark`        | `#0B1220`  | `#FBFCFE`   |
| `muted`       | `#5A6478`  | `#8B95A8`   |
| `border`      | `#D1D5DC`  | `#2A3446`   |

### 3.3 Typography

| Role        | Family       | Weight   | Size     | Tracking   | Line-height |
|-------------|-------------|----------|----------|------------|-------------|
| Display     | Geist Sans  | 600      | 36 px    | -0.025em   | 1.1         |
| Heading 1   | Geist Sans  | 600      | 28 px    | -0.02em    | 1.2         |
| Heading 2   | Geist Sans  | 600      | 22 px    | -0.015em   | 1.3         |
| Heading 3   | Geist Sans  | 500      | 18 px    | -0.01em    | 1.4         |
| Body        | Geist Sans  | 400      | 15 px    | -0.005em   | 1.6         |
| Small       | Geist Sans  | 400      | 13 px    | 0          | 1.5         |
| Caption     | Geist Sans  | 500      | 11 px    | 0.02em     | 1.4         |
| Mono (addr) | Geist Mono  | 400      | 14 px    | 0          | 1.5         |
| Mono (code) | Geist Mono  | 400      | 13 px    | 0          | 1.6         |

**Loading Geist in Next.js 15:**
```tsx
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

// In layout.tsx body className:
<body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
```

**Tailwind config:**
```ts
fontFamily: {
  sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
},
```

### 3.4 Spacing

Base unit: 4 px. Use Tailwind spacing scale.

| Token | Value | Usage                        |
|-------|-------|------------------------------|
| `xs`  | 4 px  | Tight gaps, icon padding     |
| `sm`  | 8 px  | Badge padding, small gaps    |
| `md`  | 16 px | Card padding, section gaps   |
| `lg`  | 24 px | Section spacing              |
| `xl`  | 32 px | Page section breaks          |
| `2xl` | 48 px | Hero spacing                 |
| `3xl` | 64 px | Page top/bottom padding      |

### 3.5 Border Radius

| Token     | Value | Usage                     |
|-----------|-------|---------------------------|
| `sm`      | 4 px  | Badges, small chips       |
| `md`      | 8 px  | Cards, inputs, buttons    |
| `lg`      | 12 px | Modal, larger cards       |
| `full`    | 9999  | Pills, avatar             |

### 3.6 Shadows

Minimal — blueprint aesthetic avoids heavy shadows.

| Token     | Value                                    | Usage          |
|-----------|------------------------------------------|----------------|
| `sm`      | `0 1px 2px rgba(11,18,32,0.05)`          | Hover lift     |
| `md`      | `0 2px 8px rgba(11,18,32,0.08)`          | Cards          |
| `focus`   | `0 0 0 2px #1F4FD8`                      | Focus ring     |

---

## 4. Components

### 4.1 Verdict Badge

```
┌──────────────────────┐
│  ● SAFE              │  ← icon dot + label
└──────────────────────┘
```

- Pill shape (`rounded-full`)
- Icon: 8 px circle, verdict colour
- Label: Caption style, uppercase, verdict colour text
- Background: verdict bg colour
- Border: 1 px verdict border colour

### 4.2 Scanner Input

```
┌─────────────────────────────────────────────────┐
│  🔍  Paste address, tx hash, or URL...   [Scan] │
└─────────────────────────────────────────────────┘
```

- Full width, `rounded-md`, border `#D1D5DC`
- Focus: cobalt ring (`shadow-focus`)
- Icon: search, `muted` colour
- Button: cobalt bg, white text, `rounded-md`
- Validates input type with Zod before API call

### 4.3 Risk Card

```
┌──────────────────────────────────────────┐
│  ● HIGH_RISK                             │
│                                          │
│  0x1234...abcd                           │  ← monospace, truncated
│                                          │
│  Risk Score: 85/100                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ░░░░░    │  ← progress bar
│                                          │
│  Flags:                                  │
│  • Known phishing address                │
│  • Created < 7 days ago                  │
│  • Interacted with flagged contracts     │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  View on Etherscan ↗              │  │  ← external link (safe)
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

- Card: `surface` bg, `border`, `rounded-lg`, `shadow-md`
- Address: Geist Mono, truncated with `...`
- Risk bar: verdict colour fill
- Flags: bullet list, `body` style
- External link: only to known safe destinations (Etherscan, etc.)

### 4.4 Approval Row

```
┌──────────────────────────────────────────────────────────┐
│  USDC     0x1234...abcd     Unlimited     ● HIGH_RISK   │
│  Token    Spender            Amount        Verdict       │
└──────────────────────────────────────────────────────────┘
```

- Table row with 4 columns
- Token: icon + name
- Spender: Geist Mono, truncated
- Amount: "Unlimited" in `HIGH_RISK` colour if max uint256
- Verdict: badge component

### 4.5 Navigation

```
┌──────────────────────────────────────────────────────────┐
│  [S] sightline    Scanner   Approvals   URL Guard   Guide│
└──────────────────────────────────────────────────────────┘
```

- Logo: symbol SVG (24 px) + "sightline" wordmark (Geist Sans Medium)
- Nav items: `body` weight, `muted` colour, `dark` on hover/active
- Active: `cobalt` colour + 2 px bottom border
- Mobile: hamburger menu, slide-out drawer

### 4.6 Footer

```
┌──────────────────────────────────────────────────────────┐
│  sightline · Powered by Webacy · Built for DD.xyz       │
│  Read-only scanner — we never ask for your private keys  │
└──────────────────────────────────────────────────────────┘
```

- `surface` background, `border` top
- `small` text, `muted` colour
- Security reassurance line always visible

---

## 5. Verdict Mapping

### 5.1 API → Verdict

```ts
function mapVerdict(response: WebacyResponse): Verdict {
  if (!response || response.error || response.stale) return 'UNKNOWN';
  
  const score = response.overallRisk;
  if (score === undefined || score === null) return 'UNKNOWN';
  
  if (score <= 30) return 'SAFE';
  if (score <= 60) return 'CAUTION';
  return 'HIGH_RISK';
}
```

### 5.2 Verdict States

| Verdict      | Score Range | Message (ID)                                    |
|-------------|------------|--------------------------------------------------|
| `SAFE`       | 0–30       | "Alamat ini terlihat aman"                       |
| `CAUTION`    | 31–60      | "Ada beberapa tanda yang perlu diperhatikan"     |
| `HIGH_RISK`  | 61–100     | "Risiko tinggi — hindari interaksi"              |
| `UNKNOWN`    | error/null | "Tidak bisa memverifikasi — anggap tidak aman"   |

### 5.3 Fail-Closed Rules

Every path that can't confirm safety MUST return `UNKNOWN`:

```ts
// ❌ WRONG — never assume safe
if (apiError) return 'SAFE';

// ✅ CORRECT — always fail closed
if (apiError) return 'UNKNOWN';
if (timeout) return 'UNKNOWN';
if (response.stale) return 'UNKNOWN';
if (!response.overallRisk && response.overallRisk !== 0) return 'UNKNOWN';
```

---

## 6. UI Copy (Indonesian)

### 6.1 Page titles

| Page         | Title                          | Description                              |
|-------------|--------------------------------|------------------------------------------|
| `/`          | Scanner                        | Cek keamanan alamat, transaksi, atau URL |
| `/approvals` | Approval Inspector             | Audit izin token di wallet kamu          |
| `/url-guard` | URL Guard                      | Cek apakah URL aman sebelum diklik       |
| `/guide`     | Panduan Keamanan               | Tips dan pengetahuan keamanan Web3       |

### 6.2 Common labels

| Key                  | Copy                                              |
|---------------------|---------------------------------------------------|
| `scan_placeholder`   | Tempel alamat, hash transaksi, atau URL...        |
| `scan_button`        | Scan                                              |
| `scanning`           | Memindai...                                       |
| `no_results`         | Belum ada hasil. Mulai dengan scan di atas.       |
| `error_generic`      | Terjadi kesalahan. Coba lagi nanti.               |
| `error_invalid`      | Format tidak valid. Cek input kamu.               |
| `connect_wallet`     | Hubungkan Wallet                                  |
| `disconnect`         | Putuskan                                          |
| `copy_address`       | Salin alamat                                      |
| `view_etherscan`     | Lihat di Etherscan ↗                              |
| `security_note`      | Sightline tidak pernah meminta private key kamu   |
| `powered_by`         | Didukung oleh Webacy                              |

---

## 7. Security Constraints (for Claude Code)

These constraints are **non-negotiable**. Claude Code must enforce them in every file it generates.

1. **All Webacy API calls MUST go through `app/api/*` Route Handlers.** Never call `https://api.webacy.com` from client components or expose `WEBACY_API_KEY` to the browser.

2. **If Webacy API returns error (`4xx`/`5xx`), timeout, `stale: true`, or missing `overallRisk`, return `UNKNOWN`** — never assume `SAFE`.

3. **Never hardcode `WEBACY_API_KEY`** or any secret. Use `.env.local` and `process.env`.

4. **No transaction execution, private key handling, or signing** — this app is 100% read-only.

5. **Never render scanned URLs as active `<a href>` links** — phishing risk. Use monospace text.

6. **All API strings rendered as text** — no `dangerouslySetInnerHTML`.

7. **`WEBACY_API_KEY` never appears in client bundle** — verify with `grep -r WEBACY_API_KEY .next/static/` after build.

---

## 8. Dot-Grid Texture (Background Pattern)

The blueprint-ledger aesthetic uses a subtle dot-grid on the page background:

```css
.dot-grid {
  background-image: radial-gradient(circle, #D1D5DC 0.75px, transparent 0.75px);
  background-size: 24px 24px;
  background-position: 12px 12px;
}
```

Use sparingly — on the page background behind the main content area, not on cards or interactive elements.

---

## Changelog

- 2026-11-16: Renamed Preflight → **Sightline**. Added logo (Split S), brand guidelines, favicon/web icon spec. Updated typography to Geist family.
