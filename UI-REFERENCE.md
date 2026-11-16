# UI-REFERENCE.md — Sightline Design-to-Code Specification

> **Purpose**: This file translates the Design Canvas visuals into exact Tailwind CSS classes, component structures, and layout patterns for Claude Code CLI to build. Every page must match this spec.

---

## 1. GLOBAL DESIGN SYSTEM

### 1.1 Colors (Tailwind `tailwind.config.ts` extend)

```ts
colors: {
  brand: {
    cobalt: '#1F4FD8',
    'cobalt-hover': '#163BA6',
    dark: '#0B1220',
    surface: '#FBFCFE',
    muted: '#5A6478',       // body secondary text: #3A4458 in design
    'muted-2': '#55607A',   // label text
    border: '#DCE3EE',
    'border-strong': '#C5CFDF',
    'input-border': '#8A96AB',
    pill: '#EBEEF3',
  },
  verdict: {
    safe: '#0F6B4F',
    'safe-bg': '#E4F4EC',
    caution: '#8A5A00',
    'caution-bg': '#FDF1D6',
    risk: '#B3261E',
    'risk-bg': '#FCE8E6',
    unknown: '#3D4757',
    'unknown-bg': '#EBEEF3',
  },
}
```

### 1.2 Typography (Next.js `next/font/google`)

```ts
// layout.tsx
import { Geist, Geist_Mono } from 'next/font/google'
const geistSans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })
```

Mapping from Design Canvas fonts → Next.js:
| Design Canvas         | Next.js equivalent  | Tailwind class       |
|----------------------|--------------------|--------------------|
| Space Grotesk 500-700 | Geist Sans 500-700 | `font-sans`         |
| Inter 400-600         | Geist Sans 400-600 | `font-sans`         |
| JetBrains Mono 400-500| Geist Mono 400-500 | `font-mono`         |

### 1.3 Spacing & Layout
- **Max width**: `max-w-[1200px] mx-auto`
- **Page padding**: `px-8` (32px)
- **Section padding**: `py-14` (56px) top/bottom for major sections, `py-10` (40px) for minor
- **Border radius**: `rounded-sm` (2px) — all buttons, inputs, badges use 2px radius, NOT rounded corners

### 1.4 Design Signature Elements

**Dot-grid background** (used in hero sections):
```tsx
<div
  aria-hidden="true"
  className="absolute right-0 bottom-0 w-[62%] h-[78%] opacity-55"
  style={{
    backgroundImage: 'radial-gradient(#1F4FD8 1.1px, transparent 1.6px)',
    backgroundSize: '10px 10px',
    maskImage: 'linear-gradient(135deg, transparent 38%, #000 100%)',
  }}
/>
```

**Section corner marks** (the `+` at section borders):
```tsx
<span aria-hidden="true" className="absolute -left-1.5 -top-[11px] text-base leading-none text-brand-dark bg-brand-surface px-0 py-0.5">+</span>
<span aria-hidden="true" className="absolute -right-1.5 -top-[11px] text-base leading-none text-brand-dark bg-brand-surface px-0 py-0.5">+</span>
```

**Section label** (mono uppercase with dot indicator):
```tsx
<div className="flex items-center gap-2.5 font-mono text-xs tracking-widest text-brand-muted-2">
  <span aria-hidden="true" className="w-1.5 h-1.5 bg-brand-cobalt inline-block" />
  <span>SECTION LABEL</span>
</div>
```

**Border style**: Main content area has `border-l border-r border-brand-border` on `<main>`. Sections separated by `border-t border-brand-border`. Dashed separators use `border-dashed`.

---

## 2. NAVBAR (shared across all pages)

```
┌─────────────────────────────────────────────────────────┐
│ [Logo+Name]  [READ-ONLY badge]    Nav links    [GitHub] │
└─────────────────────────────────────────────────────────┘
```

Structure:
```tsx
<header className="sticky top-0 z-50 border-b border-brand-border bg-white/[0.92] backdrop-blur-sm">
  <div className="max-w-[1200px] mx-auto px-8 min-h-16 flex flex-wrap items-center justify-between gap-3 gap-x-6">
    {/* Left: Logo */}
    <div className="flex items-center gap-2.5">
      <SightlineLogo className="w-6 h-6" />  {/* Split S SVG, stroke cobalt */}
      <span className="font-sans font-bold text-lg tracking-tight">Sightline</span>
      <span className="font-mono text-[10px] tracking-widest text-brand-cobalt border border-brand-cobalt px-2 py-0.5">READ-ONLY</span>
    </div>

    {/* Center: Nav */}
    <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
      {/* Active link: text-brand-cobalt border-b-2 border-brand-cobalt py-3 */}
      {/* Inactive link: text-brand-dark py-3 */}
    </nav>

    {/* Right: Mock badge + GitHub */}
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-brand-muted-2 bg-brand-pill px-2.5 py-1">
        <span className="w-1.5 h-1.5 bg-verdict-caution rounded-full" />
        MOCK MODE
      </span>
      <GitHubIcon />
    </div>
  </div>
</header>
```

---

## 3. PAGE: / (Scanner — Homepage)

### 3.1 Hero Section
```
┌──────────────────────────────────────────────────────┐
│  ·  PRE-FLIGHT CHECK · BASE · ARBITRUM · ETHEREUM    │
│                                                       │
│  Check first,                          [dot-grid bg]  │
│  then sign.                                           │
│                                                       │
│  Subtitle text (max-w-[520px])                        │
│                                                       │
│  ┌─── Scanner Form Card ──────────────────────────┐   │
│  │  NETWORK:  [Base] [Arbitrum] [Ethereum]        │   │
│  │  ADDRESS / URL:  [input___________] [SCAN →]   │   │
│  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │   │
│  │  Try a sample: [Safe EOA] [Risky Contract]     │   │
│  └────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

- **H1**: `font-sans font-medium text-[clamp(40px,7vw,84px)] leading-[1.02] tracking-[-0.035em] max-w-[900px]`
  - "then sign." in `text-[#4F7FE8]` (lighter cobalt)
- **Form card**: `bg-white border border-brand-border-strong p-6 max-w-[760px]`
- **Network buttons**: toggle group, active = `bg-brand-dark text-white border-brand-dark`, inactive = `bg-white text-brand-dark border-brand-border-strong`
- **Input**: `min-h-12 font-mono text-sm bg-brand-surface border border-brand-input-border rounded-sm`
- **Scan button**: `min-h-12 px-6 bg-brand-cobalt text-white border border-brand-cobalt rounded-sm font-mono text-[13px] tracking-widest` with arrow icon
- **Sample buttons**: below dashed separator, `min-h-[44px] bg-white text-brand-dark border border-brand-border-strong rounded-sm`

### 3.2 Scan Results Section
```
┌───────────────────────────────────────────────────────┐
│ + ─────────────────────────────────────────────── +    │
│  · SCAN RESULTS                                       │
│                                                       │
│  [MOCK DATA banner — dark bg, white text]             │
│                                                       │
│  ┌─────────────────┬────────────────────────────────┐ │
│  │  [Verdict icon]  │  ACCOUNT TYPE:  Smart Contract │ │
│  │  HIGH RISK       │  NETWORK:       Base           │ │
│  │                  │  ADDRESS:       0x...          │ │
│  │  Summary text    │                                │ │
│  │                  │  FINDINGS (3)                  │ │
│  │  86 / 100        │  01  Unlimited approval...     │ │
│  │  OVERALL RISK    │  02  Unverified source...      │ │
│  │                  │  03  Owner can modify...       │ │
│  └─────────────────┴────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

- **Verdict left panel**: flex:1, background changes per verdict state:
  - HIGH_RISK: `bg-verdict-risk-bg`, icon & label `text-verdict-risk`
  - SAFE: `bg-verdict-safe-bg`, icon & label `text-verdict-safe`
  - CAUTION: `bg-verdict-caution-bg`, icon & label `text-verdict-caution`
  - UNKNOWN: `bg-verdict-unknown-bg`, icon & label `text-verdict-unknown`
- **Score**: `font-sans font-medium text-[64px] leading-none tracking-tight text-brand-dark`
- **Score suffix**: `font-mono text-xs tracking-widest text-[#3A4458]` → "/ 100 · OVERALL RISK"
- **Right panel findings**: numbered list with dashed borders between items
- **Severity badges**: mono, uppercase, 11px, with background matching severity

### 3.3 Bento Grid (4 Capabilities)
```
┌──────────────────┬──────────────────┐
│ 01 Wallet        │ 02 Smart         │
│    Exposure      │    Contract Risk │
├──────────────────┼──────────────────┤
│ 03 Token         │ 04 URL Phishing  │
│    Approval Guard│    Shield        │
└──────────────────┴──────────────────┘
```

- `grid grid-cols-2 gap-px bg-brand-border border border-brand-border`
- Each cell: `bg-white p-8 flex flex-col gap-4`
- Icon container: `w-10 h-10 flex items-center justify-center border border-brand-border`
- Number: `font-mono text-[11px] tracking-widest text-brand-muted-2`
- Title: `font-sans font-semibold text-lg tracking-tight`
- Description: `text-sm text-[#3A4458] leading-relaxed`

### 3.4 How It Works (3-step)
```
[1]────── [2]────── [3]
Paste     Server    Verdict
Address   Proxy     Before
          + Risk    Signing
          Engine
```

- `grid grid-cols-3 gap-8`
- Step number box: `w-12 h-12 flex items-center justify-center bg-brand-dark text-white font-sans font-semibold text-xl`
  - Step 3 uses `bg-brand-cobalt` instead
- Horizontal line: `flex-1 h-px bg-brand-border` extending from number

### 3.5 Supported Networks
- Horizontal flex with network pills
- Active: `bg-brand-dark text-white px-4 py-2 rounded-sm`
- Roadmap: `text-brand-muted-2 border border-dashed border-brand-border-strong px-4 py-2 rounded-sm`

### 3.6 Verdict Explainer
- Two-column layout (flex-wrap)
- Left: heading + description
- Right: numbered list (01–04) of verdict definitions with dashed borders
- Each verdict name uses its verdict color

---

## 4. PAGE: /approvals

### 4.1 Hero
- Same pattern as Scanner but smaller: `clamp(32px,5vw,56px)` heading
- Title: "Review token permissions you've granted."
- Dot-grid positioned differently (right, top)

### 4.2 Wallet Input Form
- Same form card pattern as Scanner: NETWORK toggle buttons, wallet input + INSPECT button
- Network selector uses the same toggle buttons as the Scanner form (active = `bg-brand-dark text-white`)
- Sample button below the dashed separator: [Sample Wallet]

### 4.3 Approvals Table
```
┌──────────┬────────────────────┬──────────┬────────┐
│ TOKEN    │ SPENDER            │ ALLOWANCE│ RISK   │
├──────────┼────────────────────┼──────────┼────────┤
│ USDC     │ Unknown Contract   │UNLIMITED │ [HIGH] │
│ 0xA0b8…  │ 0x7a25…            │          │        │
├──────────┼────────────────────┼──────────┼────────┤
│ WETH     │ Unverified Contract│UNLIMITED │ [HIGH] │
├──────────┼────────────────────┼──────────┼────────┤
│ DAI      │ Uniswap V3 Router  │UNLIMITED │[CAUTION│
├──────────┼────────────────────┼──────────┼────────┤
│ USDT     │ Aave V3 Pool       │ 500 USDT │ [SAFE] │
└──────────┴────────────────────┴──────────┴────────┘
```

- Filter buttons above table: `[All] [Unlimited] [High Risk]`
  - Active: `bg-brand-dark text-white`
  - Inactive: `bg-white text-brand-dark border border-brand-border-strong`
  - High Risk button: `text-verdict-risk`
- Table: `w-full border-collapse bg-white border border-brand-border`
- Header: `bg-brand-surface font-mono text-[11px] tracking-widest text-brand-muted-2 font-medium`
- Rows: `border-b border-dashed border-brand-border`
- Token column: name bold + address mono below
- Allowance: UNLIMITED in verdict-risk color, finite amounts in default
- Risk badges: same pattern as severity badges (mono, uppercase, colored bg)

### 4.4 Mini Guide: "Why unlimited allowances are dangerous"
- Two-column layout like Scanner's verdict explainer
- Left: heading with `approve()` in mono + risk color
- Right: 3-step explanation (01, 02, 03) with dashed separators
- Code snippets: `font-mono text-[13px] bg-brand-pill px-1.5 py-0.5`

---

## 5. PAGE: /url-guard

### 5.1 Hero
- Title: "Check links before you click."
- Dot-grid at bottom-left (unlike Scanner's bottom-right)

### 5.2 URL Input Form
- Label: "URL TO CHECK"
- Placeholder: `https://...`
- Button: "CHECK URL →"
- Sample buttons: [Safe URL] [Phishing URL]

### 5.3 Phishing Result Card
```
┌──────────────────────────────────────────────────┐
│ ⚠ PHISHING DETECTED                              │
│   bg-verdict-risk-bg                              │
│   Do not open this URL...                         │
├──────────────────────────────────────────────────┤
│ URL CHECKED:  https://fr33-m1nt-op3nsea.xyz/claim│
│ DOMAIN:       fr33-m1nt-op3nsea.xyz               │
│ CATEGORY:     Phishing / Drainer Site             │
│ DOMAIN AGE:   2 days                              │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│ REASONS:                                          │
│ • Domain mimics OpenSea using leet-speak          │
│ • Created 2 days ago — red flag                   │
│ • /claim path commonly used by drainers           │
│ • Not listed in verified dApp database            │
└──────────────────────────────────────────────────┘
```

- Verdict banner top: `p-7 bg-verdict-risk-bg border-b border-brand-border`
- URL displayed as **plain text** (mono), phishing URLs in `text-verdict-risk`
- Info banner below: `bg-brand-pill` with info icon, explaining URLs are never active links

### 5.4 Safe Result Example
- Same card structure but with `bg-verdict-safe-bg` banner
- "SAFE" + "This URL is listed as a verified dApp site."

---

## 6. PAGE: /guide

### 6.1 Hero
- Title: "Understand what you're checking."
- Subtitle mentions "mini-dictionary" and "fail-closed principle"

### 6.2 Mini Dictionary (2×2 bento grid)
Same bento pattern as Scanner capabilities:
```
┌────────────────────┬────────────────────┐
│ 01 EOA vs          │ 02 approve() &     │
│    Smart Contract   │    Allowance       │
├────────────────────┼────────────────────┤
│ 03 Risk Score      │ 04 Phishing &      │
│    0–100           │    Drainer         │
└────────────────────┴────────────────────┘
```

### 6.3 Architecture Diagram
Vertical flow diagram:
```
[Browser] → [Next.js Server Proxy] → [Webacy Risk Engine] → [Verdict Card]
```

- Each step: icon box (56×56) + title + description
- Arrows between: vertical line + chevron SVG
- Icon boxes have different styles:
  - Browser: bordered cobalt
  - Server: filled dark
  - Webacy: filled cobalt
  - Verdict: bordered safe-green

### 6.4 Security Principles (Fail-Closed)
- Two-column layout
- Left: heading + description
- Right: 4 principles (API Error, Stale Data, Read-Only, API Key Hidden) with dashed separators

### 6.5 Open Source Banner
- Card with flex layout: text left, "VIEW ON GITHUB" button right
- Button: `bg-brand-dark text-white font-mono` with GitHub icon

---

## 7. FOOTER (shared across all pages)

```
┌──────────────────────────────────────────────────────┐
│ [Logo] Sightline                   NAVIGATION        │
│ 100% Read-Only — Never asks        Scanner           │
│ for your seed phrase...            Approvals          │
│                                    URL Guard   RESOURCES │
│                                    Guide      GitHub    │
│                                               DD.xyz    │
│                                               Webacy    │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│ Powered by Webacy (DD.xyz) Risk Engine                │
└──────────────────────────────────────────────────────┘
```

- `border-t border-brand-border bg-white`
- Logo: smaller version (w-5 h-5)
- Column headers: `font-mono text-[11px] tracking-widest text-brand-muted-2`
- Links: `text-[#3A4458] text-[13px]`
- Bottom bar: `border-t border-dashed border-brand-border text-xs text-[#8A96AB]`

---

## 8. MOCK DATA BANNER (shared pattern)

Used on all pages when `WEBACY_API_KEY` is not set, and above every "Try a sample" / demo result
(those are simulated client-side from `src/lib/mock-data.ts` and never hit the API — for them the
second sentence is dropped, since live mode may already be on):

```tsx
<div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 bg-brand-dark text-white px-4 py-3 text-[13px]">
  <span className="font-mono text-[11px] tracking-widest border border-white px-2 py-0.5">MOCK DATA</span>
  <span>This is a simulation, not a real scan result. Live mode activates after WEBACY_API_KEY is set.</span>
</div>
```

---

## 9. COMPONENT PATTERNS

### Verdict Badge
```tsx
// Usage: <VerdictBadge verdict="safe" />
const styles = {
  safe:    'bg-verdict-safe-bg text-verdict-safe',
  caution: 'bg-verdict-caution-bg text-verdict-caution',
  high_risk: 'bg-verdict-risk-bg text-verdict-risk',
  unknown: 'bg-verdict-unknown-bg text-verdict-unknown',
}
// → <span className={`inline-block font-mono text-[11px] tracking-widest px-2.5 py-1 ${styles[verdict]}`}>
```

### Primary Button
```tsx
<button className="min-h-12 px-6 flex items-center gap-2.5 bg-brand-cobalt text-white border border-brand-cobalt rounded-sm font-mono text-[13px] tracking-widest hover:bg-brand-cobalt-hover">
```

### Form Input
```tsx
<input className="flex-1 min-w-0 min-h-12 px-3.5 font-mono text-sm text-brand-dark bg-brand-surface border border-brand-input-border rounded-sm focus:outline-2 focus:outline-brand-cobalt focus:outline-offset-2" />
```

### Mono Label
```tsx
<span className="font-mono text-[11px] tracking-widest text-brand-muted-2 uppercase">LABEL</span>
```

---

## 10. RESPONSIVE NOTES

- All grids use `repeat(auto-fit, minmax(...))` or explicit 2-col with single-col fallback
- Hero headings use `clamp()` for fluid sizing
- Form inputs use `flex-1` with min-width so they stack on narrow screens
- Nav links wrap with `flex-wrap`
- Table uses `overflow-x-auto` wrapper
- Bento grid: 2-col on desktop, stack to 1-col on mobile

---

## 11. KEY RULES FOR CLAUDE CODE

1. **No rounded corners** — everything is `rounded-sm` (2px) or square. No `rounded-lg`, no `rounded-xl`.
2. **No shadows** — the design uses borders, not shadows. No `shadow-md`.
3. **No gradient backgrounds** — only the dot-grid pattern uses gradients (as mask).
4. **Mono for all labels, badges, code** — every uppercase label and badge uses `font-mono`.
5. **Sans for headings** — all headings use `font-sans` (Geist Sans), weights 500-700.
6. **URLs as plain text** — never render scan results as `<a href>`. Always plain mono text.
7. **Section markers** — every major section boundary has the `+` corner marks.
8. **Dot-grid** — every hero section has a dot-grid pattern, positioned differently per page.
9. **Dashed separators** — use `border-dashed` for list item separators within sections.
10. **Blueprint/ledger feel** — the overall aesthetic is structural, technical, flat. Think "engineering drawing" not "SaaS landing page".
