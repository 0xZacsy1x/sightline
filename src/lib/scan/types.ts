import { z } from "zod";

import { ChainSchema, INPUT_TYPES } from "@/lib/validations/scan";

/**
 * Response contracts for every /api/* route. The client re-parses each response with
 * these schemas — anything malformed is shown as an error, never as an implicit SAFE.
 */

export const VERDICTS = ["SAFE", "CAUTION", "HIGH_RISK", "UNKNOWN"] as const;
export const VerdictSchema = z.enum(VERDICTS);
export type Verdict = z.infer<typeof VerdictSchema>;

export const SEVERITIES = ["HIGH", "MEDIUM", "LOW"] as const;
export const SeveritySchema = z.enum(SEVERITIES);
export type Severity = z.infer<typeof SeveritySchema>;

const ModeSchema = z.enum(["live", "mock"]);

export const FindingSchema = z.object({
  text: z.string(),
  /** null when the upstream gave no usable severity — the UI then shows no badge. */
  severity: SeveritySchema.nullable(),
});
export type Finding = z.infer<typeof FindingSchema>;

/** POST /api/scan */
export const ScanResultSchema = z.object({
  verdict: VerdictSchema,
  inputType: z.enum(INPUT_TYPES),
  input: z.string(),
  chain: ChainSchema,
  /** 0–100, or null when no score is available (URL scans, failures). */
  score: z.number().min(0).max(100).nullable(),
  findings: z.array(FindingSchema),
  /** Webacy addressType (EOA, CONTRACT, TOKEN, …) or null. */
  addressType: z.string().nullable(),
  mode: ModeSchema,
  /** Optional context, e.g. why the verdict is UNKNOWN. Rendered as plain text. */
  note: z.string().nullable(),
});
export type ScanResult = z.infer<typeof ScanResultSchema>;

/** POST /api/url-check */
export const UrlCheckResultSchema = z.object({
  verdict: VerdictSchema,
  url: z.string(),
  domain: z.string(),
  category: z.string(),
  /** Not provided by the live Webacy URL endpoint — null hides the row. */
  domainAge: z.string().nullable(),
  reasons: z.array(z.string()),
  mode: ModeSchema,
  note: z.string().nullable(),
});
export type UrlCheckResult = z.infer<typeof UrlCheckResultSchema>;

export const ApprovalRowSchema = z.object({
  tokenSymbol: z.string(),
  tokenName: z.string().nullable(),
  tokenAddress: z.string(),
  spenderName: z.string().nullable(),
  spenderAddress: z.string(),
  allowance: z.object({ unlimited: z.boolean(), display: z.string() }),
  verdict: VerdictSchema,
  reasons: z.array(z.string()),
});
export type ApprovalRow = z.infer<typeof ApprovalRowSchema>;

/** POST /api/approvals */
export const ApprovalsResultSchema = z.object({
  /** `unknown` = the list could not be verified. Never render that as "no approvals". */
  status: z.enum(["ok", "unknown"]),
  wallet: z.string(),
  chain: ChainSchema,
  approvals: z.array(ApprovalRowSchema),
  mode: ModeSchema,
  note: z.string().nullable(),
});
export type ApprovalsResult = z.infer<typeof ApprovalsResultSchema>;
