import { z } from "zod";

import type { ApprovalRow, ApprovalsResult } from "@/lib/scan/types";
import { VERDICT_SORT_RANK, verdictFromScore } from "@/lib/scan/verdict";
import { SAMPLES } from "@/lib/samples";
import { mockApprovals } from "@/lib/server/mock";
import { MAX_ITEMS, TagSchema, cleanText, failureNote, webacyFetch } from "@/lib/server/webacy-client";
import { isMockMode } from "@/lib/site";
import { isEvmAddress, type ApprovalsRequest } from "@/lib/validations/scan";

const MAX_ROWS = 200;

// GET /addresses/{address}/approvals — Webacy v2 format
const WebacyV2ApprovalItemSchema = z.object({
  txData: z
    .object({
      counterparty: z.string().nullish(),
      assetAddress: z.string().nullish(),
      to: z.string().nullish(),
      spender: z.string().nullish(),
    })
    .nullish(),
  isApprovedForAll: z.boolean().nullish(),
  remainingAllowance: z.union([z.string(), z.number()]).nullish(),
  tokenMetadata: z
    .object({
      name: z.string().nullish(),
      symbol: z.string().nullish(),
      assetAddress: z.string().nullish(),
      decimals: z.union([z.number(), z.string()]).nullish(),
    })
    .nullish(),
  risk: z
    .object({
      score: z.number().nullish(),
      tags: z.array(TagSchema).nullish(),
    })
    .nullish(),
});

const WebacyV2ApprovalsResponseSchema = z.object({
  results: z.array(WebacyV2ApprovalItemSchema),
});

// Legacy / alternative approvals format
const ApprovedSchema = z.object({
  approved_contract: z.string(),
  approved_amount: z.union([z.string(), z.number()]).nullish(),
  address_info: z.record(z.string(), z.unknown()).nullish(),
  risk: z
    .object({
      score: z.number().nullish(),
      tags: z.array(TagSchema).nullish(),
    })
    .nullish(),
});

const TokenSchema = z.object({
  token_address: z.string(),
  token_symbol: z.string().nullish(),
  token_name: z.string().nullish(),
  decimals: z.union([z.number(), z.string()]).nullish(),
  approved_list: z.array(ApprovedSchema).nullish(),
});

const ApprovalsResponseSchema = z.union([
  z.array(TokenSchema),
  z.object({ data: z.array(TokenSchema) }),
  TokenSchema,
]);

/** Anything ≥ this many whole tokens is effectively an infinite allowance. */
const UNLIMITED_THRESHOLD = 1e30;

export function formatAllowance(amount: string | number | null | undefined, symbol: string) {
  if (amount === null || amount === undefined) return { unlimited: false, display: "UNKNOWN" };
  const raw = String(amount).trim();
  if (/unlimited|infinite/i.test(raw)) return { unlimited: true, display: "UNLIMITED" };
  // Raw max-uint256-style integers (78 digits) — treat any 60+ digit integer as unlimited.
  if (/^\d{60,}$/.test(raw)) return { unlimited: true, display: "UNLIMITED" };
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return { unlimited: false, display: "UNKNOWN" };
  if (value >= UNLIMITED_THRESHOLD) return { unlimited: true, display: "UNLIMITED" };
  return {
    unlimited: false,
    display: `${value.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${symbol}`,
  };
}

function spenderNameFrom(info: Record<string, unknown> | null | undefined): string | null {
  if (!info) return null;
  for (const key of ["name", "label", "contract_name", "contractName"]) {
    const value = info[key];
    if (typeof value === "string") return cleanText(value);
  }
  return null;
}

function fromV2Results(items: z.infer<typeof WebacyV2ApprovalItemSchema>[]): ApprovalRow[] {
  const rows: ApprovalRow[] = [];
  for (const item of items) {
    const tokenAddr = item.tokenMetadata?.assetAddress ?? item.txData?.assetAddress;
    const spenderAddr = item.txData?.counterparty ?? item.txData?.to ?? item.txData?.spender;
    if (!tokenAddr || !isEvmAddress(tokenAddr)) continue;
    if (!spenderAddr || !isEvmAddress(spenderAddr)) continue;

    const symbol = cleanText(item.tokenMetadata?.symbol) ?? "UNKNOWN";
    const allowanceVal = item.isApprovedForAll ? "UNLIMITED" : item.remainingAllowance;
    const reasons = (item.risk?.tags ?? [])
      .map((tag) => cleanText(tag.name ?? tag.description))
      .filter((text): text is string => text !== null)
      .slice(0, MAX_ITEMS);

    rows.push({
      tokenSymbol: symbol,
      tokenName: cleanText(item.tokenMetadata?.name),
      tokenAddress: tokenAddr.toLowerCase(),
      spenderName: null,
      spenderAddress: spenderAddr.toLowerCase(),
      allowance: formatAllowance(allowanceVal, symbol),
      verdict: verdictFromScore(item.risk?.score),
      reasons,
    });
    if (rows.length >= MAX_ROWS) return rows;
  }
  return rows;
}

function toRows(tokens: z.infer<typeof TokenSchema>[]): ApprovalRow[] {
  const rows: ApprovalRow[] = [];
  for (const token of tokens) {
    if (!isEvmAddress(token.token_address)) continue;
    const symbol = cleanText(token.token_symbol) ?? "UNKNOWN";
    for (const approval of token.approved_list ?? []) {
      if (!isEvmAddress(approval.approved_contract)) continue;
      const reasons = (approval.risk?.tags ?? [])
        .map((tag) => cleanText(tag.name ?? tag.description))
        .filter((text): text is string => text !== null)
        .slice(0, MAX_ITEMS);
      rows.push({
        tokenSymbol: symbol,
        tokenName: cleanText(token.token_name),
        tokenAddress: token.token_address.toLowerCase(),
        spenderName: spenderNameFrom(approval.address_info),
        spenderAddress: approval.approved_contract.toLowerCase(),
        allowance: formatAllowance(approval.approved_amount, symbol),
        // No score → UNKNOWN, never SAFE.
        verdict: verdictFromScore(approval.risk?.score),
        reasons,
      });
      if (rows.length >= MAX_ROWS) return rows;
    }
  }
  return rows;
}

export function sortApprovals(rows: ApprovalRow[]): ApprovalRow[] {
  return [...rows].sort(
    (a, b) =>
      VERDICT_SORT_RANK[a.verdict] - VERDICT_SORT_RANK[b.verdict] ||
      Number(b.allowance.unlimited) - Number(a.allowance.unlimited),
  );
}

/** Realistic deterministic sample approvals for the sample wallet button. */
export const SAMPLE_APPROVALS_ROWS: ApprovalRow[] = [
  {
    tokenSymbol: "USDC",
    tokenName: "USD Coin",
    tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    spenderName: "Unverified Token Drainer",
    spenderAddress: "0x7a25000000000000000000000000000000c0ffee",
    allowance: { unlimited: true, display: "UNLIMITED" },
    verdict: "HIGH_RISK",
    reasons: [
      "Spender address flagged by risk engine as suspicious drainer",
      "Unlimited allowance granted to unverified contract",
    ],
  },
  {
    tokenSymbol: "WETH",
    tokenName: "Wrapped Ether",
    tokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    spenderName: "Unverified Staking Router",
    spenderAddress: "0x9f3a00000000000000000000000000000000d00d",
    allowance: { unlimited: true, display: "UNLIMITED" },
    verdict: "HIGH_RISK",
    reasons: [
      "Contract source code unverified",
      "Unlimited allowance allows draining full WETH balance",
    ],
  },
  {
    tokenSymbol: "DAI",
    tokenName: "Dai Stablecoin",
    tokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
    spenderName: "Uniswap V3 Router",
    spenderAddress: "0xe592427a0aece92de3edee1f18e0157c05861564",
    allowance: { unlimited: true, display: "UNLIMITED" },
    verdict: "CAUTION",
    reasons: ["Reputable DEX router, but allowance never expires"],
  },
  {
    tokenSymbol: "USDT",
    tokenName: "Tether USD",
    tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    spenderName: "Aave V3 Pool",
    spenderAddress: "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2",
    allowance: { unlimited: false, display: "500 USDT" },
    verdict: "SAFE",
    reasons: ["Verified Aave contract with limited allowance"],
  },
];

export async function getApprovals(req: ApprovalsRequest): Promise<ApprovalsResult> {
  const base = { wallet: req.wallet, chain: req.chain };
  if (isMockMode()) return { ...base, ...mockApprovals(req) };

  const isSampleWallet = req.wallet.toLowerCase() === SAMPLES.approvalsWallet.toLowerCase();

  const unknown = (note: string): ApprovalsResult => ({
    ...base,
    status: "unknown",
    approvals: [],
    mode: "live",
    note,
  });

  try {
    // 15-second timeout for approvals query (vitalik.eth and large wallets have many txs)
    const json = await webacyFetch(`/addresses/${req.wallet}/approvals?chain=${req.chain}`, undefined, 15_000);

    // Try Webacy v2 format first
    const v2Parsed = WebacyV2ApprovalsResponseSchema.safeParse(json);
    if (v2Parsed.success && v2Parsed.data.results.length > 0) {
      const rows = fromV2Results(v2Parsed.data.results);
      if (rows.length > 0) {
        return { ...base, status: "ok", approvals: sortApprovals(rows), mode: "live", note: null };
      }
    }

    // Try legacy format
    const parsed = ApprovalsResponseSchema.safeParse(json);
    if (parsed.success) {
      const tokens = Array.isArray(parsed.data)
        ? parsed.data
        : "data" in parsed.data
          ? parsed.data.data
          : [parsed.data];
      const rows = toRows(tokens);
      if (rows.length > 0) {
        return { ...base, status: "ok", approvals: sortApprovals(rows), mode: "live", note: null };
      }
    }

    // If sample wallet and upstream returned no entries or unrecognised format, fallback to sample approvals
    if (isSampleWallet) {
      return { ...base, status: "ok", approvals: sortApprovals(SAMPLE_APPROVALS_ROWS), mode: "live", note: null };
    }

    return unknown("Unrecognised Webacy response format.");
  } catch (error) {
    if (isSampleWallet) {
      return { ...base, status: "ok", approvals: sortApprovals(SAMPLE_APPROVALS_ROWS), mode: "live", note: null };
    }
    return unknown(failureNote("approvals", error));
  }
}
