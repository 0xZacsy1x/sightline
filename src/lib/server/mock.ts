/**
 * Mock mode (no WEBACY_API_KEY). Only the sample inputs in lib/samples.ts get simulated
 * results; every other input returns UNKNOWN, so a real address can never get a fake SAFE.
 * Every result here carries `mode: "mock"`, which the UI always surfaces with the MOCK DATA banner.
 *
 * Self-contained on purpose (no imports from scan/url-check/approvals) to avoid import cycles.
 */
import type { ApprovalsResult, ScanResult, UrlCheckResult } from "@/lib/scan/types";
import { SAMPLES } from "@/lib/samples";
import type { ApprovalsRequest, ScanRequest } from "@/lib/validations/scan";

const NOT_A_SAMPLE = "Mock mode: only the sample inputs have simulated results. Set WEBACY_API_KEY for live scans.";

type ScanEvaluation = Pick<ScanResult, "verdict" | "score" | "findings" | "addressType" | "note">;

export function mockScan(req: ScanRequest): ScanEvaluation {
  if (req.value === SAMPLES.safeEoa) {
    return { verdict: "SAFE", score: 4, findings: [], addressType: "EOA", note: null };
  }
  if (req.value === SAMPLES.riskyContract) {
    return {
      verdict: "HIGH_RISK",
      score: 86,
      findings: [
        { text: "Unlimited approval requested on deposit (approve max uint256)", severity: "HIGH" },
        { text: "Unverified source code — bytecode only, no published ABI", severity: "HIGH" },
        { text: "Owner can modify balances and fees after deployment", severity: "MEDIUM" },
      ],
      addressType: "CONTRACT",
      note: null,
    };
  }
  return { verdict: "UNKNOWN", score: null, findings: [], addressType: null, note: NOT_A_SAMPLE };
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function mockUrlCheck(url: string): UrlCheckResult {
  const domain = hostname(url);
  if (domain === hostname(SAMPLES.phishingUrl)) {
    return {
      verdict: "HIGH_RISK",
      url,
      domain,
      category: "Phishing / Drainer Site",
      domainAge: "2 days",
      reasons: [
        "Domain mimics OpenSea using leet-speak (0 → o, 3 → e, 1 → i)",
        "Created 2 days ago — a common red flag for drainer sites",
        "/claim path is commonly used by wallet drainers",
        "Not listed in the verified dApp database",
      ],
      mode: "mock",
      note: null,
    };
  }
  if (domain === hostname(SAMPLES.safeUrl)) {
    return {
      verdict: "SAFE",
      url,
      domain,
      category: "Verified dApp",
      domainAge: "6+ years",
      reasons: ["This URL is listed as a verified dApp site."],
      mode: "mock",
      note: null,
    };
  }
  return {
    verdict: "UNKNOWN",
    url,
    domain,
    category: "Unclassified",
    domainAge: null,
    reasons: [],
    mode: "mock",
    note: NOT_A_SAMPLE,
  };
}

export function mockApprovals(req: ApprovalsRequest): Omit<ApprovalsResult, "wallet" | "chain"> {
  if (req.wallet !== SAMPLES.approvalsWallet) {
    return { status: "unknown", approvals: [], mode: "mock", note: NOT_A_SAMPLE };
  }
  return {
    status: "ok",
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
        spenderAddress: "0x9f3a00000000000000000000000000000000d00d",
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
}
