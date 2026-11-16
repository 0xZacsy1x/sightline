/**
 * Omni-scan: address, transaction hash, or URL → ScanResult.
 * Every path that can't positively confirm a score returns UNKNOWN (DESIGN.md §5.3).
 */
import { z } from "zod";

import type { Finding, ScanResult, Verdict } from "@/lib/scan/types";
import { severityFromScore, verdictFromScore } from "@/lib/scan/verdict";
import { mockScan } from "@/lib/server/mock";
import { checkUrl } from "@/lib/server/url-check";
import { MAX_ITEMS, TagSchema, cleanText, failureNote, webacyFetch } from "@/lib/server/webacy-client";
import { isMockMode } from "@/lib/site";
import type { ScanRequest } from "@/lib/validations/scan";

// ── Upstream response schemas (only the fields we rely on) ────────────────

const IssueSchema = z.object({
  score: z.number().nullish(),
  tags: z.array(TagSchema).nullish(),
});

const RiskProfileSchema = z.object({
  overallRisk: z.number().nullish(),
  analyzed: z.boolean().nullish(),
  stale: z.boolean().nullish(),
  scoringFailed: z.boolean().nullish(),
  high: z.number().nullish(),
  medium: z.number().nullish(),
  issues: z.array(IssueSchema).nullish(),
  addressType: z.string().nullish(),
});
type RiskProfile = z.infer<typeof RiskProfileSchema>;

const TransactionResponseSchema = z.array(
  z.object({
    partyRisk: RiskProfileSchema.nullish(),
    counterpartyRisk: RiskProfileSchema.nullish(),
    assetRisk: RiskProfileSchema.nullish(),
  }),
);

// ── Evaluation ────────────────────────────────────────────────────────────

type Evaluation = Pick<ScanResult, "verdict" | "score" | "findings" | "addressType" | "note">;

export function unknownEvaluation(note: string): Evaluation {
  return { verdict: "UNKNOWN", score: null, findings: [], addressType: null, note };
}

function collectFindings(profiles: RiskProfile[]): Finding[] {
  const seen = new Map<string, Finding>();
  for (const profile of profiles) {
    for (const issue of profile.issues ?? []) {
      const severity = severityFromScore(issue.score);
      for (const tag of issue.tags ?? []) {
        const text = cleanText(tag.name ?? tag.description);
        if (text && !seen.has(text)) seen.set(text, { text, severity });
        if (seen.size >= MAX_ITEMS) return [...seen.values()];
      }
    }
  }
  return [...seen.values()];
}

/** Returns a reason when the profile can't be trusted, otherwise null. */
function untrustedReason(profile: RiskProfile): string | null {
  if (profile.stale) return "Webacy data is stale.";
  if (profile.scoringFailed) return "Webacy failed to score one of the parties.";
  if (profile.analyzed === false) return "No data exists for this address yet.";
  if (typeof profile.overallRisk !== "number") return "Risk score unavailable.";
  // A bare 0 without `analyzed: true` can mean "no data" rather than "clean".
  if (profile.overallRisk === 0 && profile.analyzed !== true) return "No data exists for this address yet.";
  return null;
}

const RANK: Record<Verdict, number> = { SAFE: 0, CAUTION: 1, HIGH_RISK: 2, UNKNOWN: 3 };

function evaluateProfiles(profiles: RiskProfile[]): Evaluation {
  if (profiles.length === 0) return unknownEvaluation("No risk data to evaluate.");

  let worst: { verdict: Verdict; score: number } | null = null;
  for (const profile of profiles) {
    const reason = untrustedReason(profile);
    if (reason) return { ...unknownEvaluation(reason), findings: collectFindings(profiles) };

    const score = profile.overallRisk as number;
    const verdict = verdictFromScore(score, { high: profile.high, medium: profile.medium });
    if (verdict === "UNKNOWN") return unknownEvaluation("Risk score outside the valid range.");
    if (!worst || RANK[verdict] > RANK[worst.verdict] || (verdict === worst.verdict && score > worst.score)) {
      worst = { verdict, score };
    }
  }

  if (!worst) return unknownEvaluation("No risk data to evaluate.");
  return {
    verdict: worst.verdict,
    score: worst.score,
    findings: collectFindings(profiles),
    addressType: profiles.length === 1 ? (profiles[0].addressType ?? null) : null,
    note: null,
  };
}

async function scanAddress(req: ScanRequest): Promise<Evaluation> {
  const json = await webacyFetch(`/addresses/${req.value}?chain=${req.chain}`);
  const parsed = RiskProfileSchema.safeParse(json);
  if (!parsed.success) return unknownEvaluation("Unrecognised Webacy response format.");
  return evaluateProfiles([parsed.data]);
}

async function scanTransaction(req: ScanRequest): Promise<Evaluation> {
  const json = await webacyFetch(`/transactions/${req.value}?chain=${req.chain}`);
  const parsed = TransactionResponseSchema.safeParse(json);
  if (!parsed.success) return unknownEvaluation("Unrecognised Webacy response format.");

  const profiles: RiskProfile[] = [];
  for (const item of parsed.data) {
    for (const side of [item.partyRisk, item.counterpartyRisk, item.assetRisk]) {
      if (!side) continue;
      if (side.scoringFailed || side.stale) return unknownEvaluation(untrustedReason(side) ?? "Incomplete data.");
      // A side with only `address` (e.g. native-coin asset) has nothing to score — skip it.
      if (side.overallRisk === undefined || side.overallRisk === null) continue;
      profiles.push({ ...side, analyzed: side.analyzed ?? true });
    }
  }
  return evaluateProfiles(profiles);
}

// ── Entry point ───────────────────────────────────────────────────────────

export async function runScan(req: ScanRequest): Promise<ScanResult> {
  const base = { inputType: req.type, input: req.value, chain: req.chain };

  if (req.type === "url") {
    const url = await checkUrl(req.value);
    return {
      ...base,
      verdict: url.verdict,
      score: null,
      findings: url.reasons.map((text) => ({ text, severity: null })),
      addressType: null,
      mode: url.mode,
      note: url.note,
    };
  }

  if (isMockMode()) return { ...base, mode: "mock", ...mockScan(req) };

  try {
    const evaluation = req.type === "address" ? await scanAddress(req) : await scanTransaction(req);
    return { ...base, mode: "live", ...evaluation };
  } catch (error) {
    return { ...base, mode: "live", ...unknownEvaluation(failureNote("scan", error)) };
  }
}
