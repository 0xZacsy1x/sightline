import type { ApprovalsResult } from "@/lib/scan/types";
import { getApprovals } from "@/lib/server/approvals";
import { handleJsonPost } from "@/lib/server/route";
import { isMockMode } from "@/lib/site";
import { ApprovalsRequestSchema } from "@/lib/validations/scan";

export const runtime = "nodejs";

/**
 * POST /api/approvals  { wallet: string, chain?: "base" | "arb" | "eth" }
 * Read-only: lists existing approvals, never builds or sends a revoke transaction.
 * 400 on invalid input; otherwise 200 with an ApprovalsResult. Failures → status "unknown".
 */
export function POST(request: Request) {
  return handleJsonPost(request, ApprovalsRequestSchema, getApprovals, (req): ApprovalsResult => ({
    status: "unknown",
    wallet: req.wallet,
    chain: req.chain,
    approvals: [],
    mode: isMockMode() ? "mock" : "live",
    note: "Approval check failed.",
  }));
}
