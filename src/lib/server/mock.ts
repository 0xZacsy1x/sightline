/**
 * Mock mode (no WEBACY_API_KEY). Only the sample inputs in lib/mock-data.ts get simulated
 * results; every other input returns UNKNOWN, so a real address can never get a fake SAFE.
 * Every result here carries `mode: "mock"`, which the UI always surfaces with the MOCK DATA banner.
 *
 * Self-contained on purpose (no imports from scan/url-check/approvals) to avoid import cycles.
 */
import {
  MOCK_APPROVALS,
  MOCK_RISKY_CONTRACT,
  MOCK_SAFE_EOA,
  MOCK_URL_PHISHING,
  MOCK_URL_SAFE,
} from "@/lib/mock-data";
import type { ApprovalsResult, ScanResult, UrlCheckResult } from "@/lib/scan/types";
import type { ApprovalsRequest, ScanRequest } from "@/lib/validations/scan";

const NOT_A_SAMPLE = "Mock mode: only the sample inputs have simulated results. Set WEBACY_API_KEY for live scans.";

type ScanEvaluation = Pick<ScanResult, "verdict" | "score" | "findings" | "addressType" | "note">;

export function mockScan(req: ScanRequest): ScanEvaluation {
  const sample = [MOCK_SAFE_EOA, MOCK_RISKY_CONTRACT].find(
    (mock) => mock.input.toLowerCase() === req.value.toLowerCase(),
  );
  if (!sample) return { verdict: "UNKNOWN", score: null, findings: [], addressType: null, note: NOT_A_SAMPLE };
  const { verdict, score, findings, addressType, note } = sample;
  return { verdict, score, findings, addressType, note };
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
  const sample = [MOCK_URL_PHISHING, MOCK_URL_SAFE].find((mock) => mock.domain === domain);
  if (sample) return { ...sample, url, domain };
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
  if (req.wallet !== MOCK_APPROVALS.wallet) {
    return { status: "unknown", approvals: [], mode: "mock", note: NOT_A_SAMPLE };
  }
  const { status, approvals, mode, note } = MOCK_APPROVALS;
  return { status, approvals, mode, note };
}
