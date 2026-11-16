import { z } from "zod";

import type { UrlCheckResult, Verdict } from "@/lib/scan/types";
import { verdictFromUrlRiskLevel } from "@/lib/scan/verdict";
import { mockUrlCheck } from "@/lib/server/mock";
import { cleanText, failureNote, webacyFetch } from "@/lib/server/webacy-client";
import { isMockMode } from "@/lib/site";

const UrlResponseSchema = z.object({
  riskLevel: z.string().nullish(),
  description: z.string().nullish(),
  stale: z.boolean().nullish(),
});

const CATEGORY: Record<Verdict, string> = {
  HIGH_RISK: "Phishing / Blocklisted Site",
  CAUTION: "Possible Impersonation",
  SAFE: "Known Project Site",
  UNKNOWN: "Unclassified",
};

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function unknownUrlResult(url: string, note: string, mode: "live" | "mock" = "live"): UrlCheckResult {
  return {
    verdict: "UNKNOWN",
    url,
    domain: hostnameOf(url),
    category: CATEGORY.UNKNOWN,
    domainAge: null,
    reasons: [],
    mode,
    note,
  };
}

/** `url` must already be normalised by UrlCheckRequestSchema / detectInput. */
export async function checkUrl(url: string): Promise<UrlCheckResult> {
  if (isMockMode()) return mockUrlCheck(url);

  try {
    const json = await webacyFetch("/url", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const parsed = UrlResponseSchema.safeParse(json);
    if (!parsed.success) return unknownUrlResult(url, "Unrecognised Webacy response format.");
    if (parsed.data.stale) return unknownUrlResult(url, "Webacy data is stale.");

    const verdict = verdictFromUrlRiskLevel(parsed.data.riskLevel);
    const description = cleanText(parsed.data.description);
    return {
      verdict,
      url,
      domain: hostnameOf(url),
      category: CATEGORY[verdict],
      domainAge: null, // not provided by the Webacy URL endpoint
      reasons: description ? [description] : [],
      mode: "live",
      note: verdict === "UNKNOWN" ? "Webacy has no verdict for this domain yet." : null,
    };
  } catch (error) {
    return unknownUrlResult(url, failureNote("url-check", error));
  }
}
