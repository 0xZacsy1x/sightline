import type { Severity, Verdict } from "@/lib/scan/types";

const RANK: Record<Exclude<Verdict, "UNKNOWN">, number> = { SAFE: 0, CAUTION: 1, HIGH_RISK: 2 };

function isValidScore(score: unknown): score is number {
  return typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 100;
}

/**
 * DESIGN.md §5.1 — score → verdict, fail-closed. 0–30 SAFE · 31–60 CAUTION · 61–100 HIGH_RISK.
 * Issue counts can only escalate the verdict (ARCHITECTURE.md §3), never relax it.
 */
export function verdictFromScore(
  score: number | null | undefined,
  counts: { high?: number | null; medium?: number | null } = {},
): Verdict {
  if (!isValidScore(score)) return "UNKNOWN";

  let verdict: Exclude<Verdict, "UNKNOWN"> = score <= 30 ? "SAFE" : score <= 60 ? "CAUTION" : "HIGH_RISK";

  if ((counts.high ?? 0) > 0) verdict = "HIGH_RISK";
  else if ((counts.medium ?? 0) > 0 && RANK[verdict] < RANK.CAUTION) verdict = "CAUTION";

  return verdict;
}

/** Same thresholds as verdictFromScore, for a single finding's badge. null = no badge. */
export function severityFromScore(score: number | null | undefined): Severity | null {
  if (!isValidScore(score)) return null;
  return score <= 30 ? "LOW" : score <= 60 ? "MEDIUM" : "HIGH";
}

/** Webacy URL endpoint returns a categorical riskLevel only. Anything unrecognised → UNKNOWN. */
export function verdictFromUrlRiskLevel(level: unknown): Verdict {
  switch (level) {
    case "low":
      return "SAFE";
    case "medium":
      return "CAUTION";
    case "high":
      return "HIGH_RISK";
    default:
      return "UNKNOWN";
  }
}

/** Sort order for lists: most dangerous first; UNKNOWN ranks above CAUTION (fail-closed). */
export const VERDICT_SORT_RANK: Record<Verdict, number> = { HIGH_RISK: 0, UNKNOWN: 1, CAUTION: 2, SAFE: 3 };
