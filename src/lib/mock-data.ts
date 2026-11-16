/**
 * Simulated results behind the "Try a sample" buttons and the demo.
 *
 * Shared by client and server: the buttons render these objects directly (no API call, so they
 * work with or without WEBACY_API_KEY), and mock mode returns the same data for the same inputs
 * (lib/server/mock.ts). Every entry carries `mode: "mock"` and is always shown under the
 * MOCK DATA banner — a simulated verdict is never presented as a real scan.
 */
import type { ApprovalsResult, ScanResult, UrlCheckResult } from "@/lib/scan/types";

export const MOCK_SAFE_EOA: ScanResult = {
  verdict: "SAFE",
  inputType: "address",
  input: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  chain: "eth",
  score: 12,
  findings: [],
  addressType: "EOA",
  mode: "mock",
  note: null,
};

/** Fictional contract (UI-REFERENCE.md §3.2) — not a real deployment. */
export const MOCK_RISKY_CONTRACT: ScanResult = {
  verdict: "HIGH_RISK",
  inputType: "address",
  input: "0xDEAD00000000000000000000000000000000BEEF",
  chain: "base",
  score: 86,
  findings: [
    { text: "Unlimited token approval to unknown spender", severity: "HIGH" },
    { text: "Contract source code not verified on block explorer", severity: "HIGH" },
    { text: "Owner can modify critical parameters without timelock", severity: "MEDIUM" },
  ],
  addressType: "CONTRACT",
  mode: "mock",
  note: null,
};

/** UI-REFERENCE.md §4.3. Spender addresses for the two risky rows are fictional. */
export const MOCK_APPROVALS: ApprovalsResult = {
  status: "ok",
  wallet: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
  chain: "eth",
  mode: "mock",
  note: null,
  approvals: [
    {
      tokenSymbol: "USDC",
      tokenName: "USD Coin",
      tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      spenderName: "Unknown Contract",
      spenderAddress: "0x7a25000000000000000000000000000000c0ffee",
      allowance: { unlimited: true, display: "UNLIMITED" },
      verdict: "HIGH_RISK",
      reasons: ["Spender linked to a reported drainer", "Unlimited allowance"],
    },
    {
      tokenSymbol: "WETH",
      tokenName: "Wrapped Ether",
      tokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      spenderName: "Unverified Contract",
      spenderAddress: "0x3d9f00000000000000000000000000000000d00d",
      allowance: { unlimited: true, display: "UNLIMITED" },
      verdict: "HIGH_RISK",
      reasons: ["Unverified source code", "Unlimited allowance"],
    },
    {
      tokenSymbol: "DAI",
      tokenName: "Dai Stablecoin",
      tokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
      spenderName: "Uniswap V3 Router",
      spenderAddress: "0xe592427a0aece92de3edee1f18e0157c05861564",
      allowance: { unlimited: true, display: "UNLIMITED" },
      verdict: "CAUTION",
      reasons: ["Reputable spender, but the allowance never expires"],
    },
    {
      tokenSymbol: "USDT",
      tokenName: "Tether USD",
      tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      spenderName: "Aave V3 Pool",
      spenderAddress: "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2",
      allowance: { unlimited: false, display: "500 USDT" },
      verdict: "SAFE",
      reasons: [],
    },
  ],
};

/** Fictional phishing domain (UI-REFERENCE.md §5.3) — never rendered as a link. */
export const MOCK_URL_PHISHING: UrlCheckResult = {
  verdict: "HIGH_RISK",
  url: "https://fr33-m1nt-op3nsea.xyz/claim",
  domain: "fr33-m1nt-op3nsea.xyz",
  category: "Phishing / Drainer Site",
  domainAge: "2 days",
  reasons: [
    "Domain mimics OpenSea using leet-speak substitutions",
    "Created 2 days ago — newly registered domains are a red flag",
    "/claim path is commonly used by wallet drainer kits",
    "Not listed in any verified dApp database",
  ],
  mode: "mock",
  note: null,
};

export const MOCK_URL_SAFE: UrlCheckResult = {
  verdict: "SAFE",
  url: "https://app.uniswap.org/swap",
  domain: "app.uniswap.org",
  category: "Verified DeFi Protocol",
  domainAge: "4 years",
  reasons: ["Uniswap — Listed in verified dApp database"],
  mode: "mock",
  note: null,
};
