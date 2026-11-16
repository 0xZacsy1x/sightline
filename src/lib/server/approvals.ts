import { z } from "zod";

import type { ApprovalRow, ApprovalsResult } from "@/lib/scan/types";
import { VERDICT_SORT_RANK, verdictFromScore } from "@/lib/scan/verdict";
import { mockApprovals } from "@/lib/server/mock";
import { MAX_ITEMS, TagSchema, cleanText, failureNote, webacyFetch } from "@/lib/server/webacy-client";
import { isMockMode } from "@/lib/site";
import { isEvmAddress, type ApprovalsRequest } from "@/lib/validations/scan";

const MAX_ROWS = 200;

// GET /addresses/{address}/approvals — the docs leave amount format and spender naming
// undocumented, so everything here is optional and anything unparseable fails closed.
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

export async function getApprovals(req: ApprovalsRequest): Promise<ApprovalsResult> {
  const base = { wallet: req.wallet, chain: req.chain };
  if (isMockMode()) return { ...base, ...mockApprovals(req) };

  const unknown = (note: string): ApprovalsResult => ({
    ...base,
    status: "unknown",
    approvals: [],
    mode: "live",
    note,
  });

  try {
    const json = await webacyFetch(`/addresses/${req.wallet}/approvals?chain=${req.chain}`);
    const parsed = ApprovalsResponseSchema.safeParse(json);
    if (!parsed.success) return unknown("Unrecognised Webacy response format.");

    const tokens = Array.isArray(parsed.data)
      ? parsed.data
      : "data" in parsed.data
        ? parsed.data.data
        : [parsed.data];
    return { ...base, status: "ok", approvals: sortApprovals(toRows(tokens)), mode: "live", note: null };
  } catch (error) {
    return unknown(failureNote("approvals", error));
  }
}
