import type { ScanResult } from "@/lib/scan/types";
import { handleJsonPost } from "@/lib/server/route";
import { runScan } from "@/lib/server/scan";
import { isMockMode } from "@/lib/site";
import { ScanRequestSchema } from "@/lib/validations/scan";

export const runtime = "nodejs";

/**
 * POST /api/scan  { input: string, chain?: "base" | "arb" | "eth" }
 * Address or tx hash (URLs are delegated to the URL check). 400 on invalid input;
 * otherwise 200 with a ScanResult. Any upstream failure → "UNKNOWN", never "SAFE".
 */
export function POST(request: Request) {
  return handleJsonPost(request, ScanRequestSchema, runScan, (req): ScanResult => ({
    verdict: "UNKNOWN",
    inputType: req.type,
    input: req.value,
    chain: req.chain,
    score: null,
    findings: [],
    addressType: null,
    mode: isMockMode() ? "mock" : "live",
    note: "Scan failed.",
  }));
}
