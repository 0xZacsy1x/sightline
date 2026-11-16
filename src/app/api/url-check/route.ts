import { handleJsonPost } from "@/lib/server/route";
import { checkUrl, unknownUrlResult } from "@/lib/server/url-check";
import { isMockMode } from "@/lib/site";
import { UrlCheckRequestSchema } from "@/lib/validations/scan";

export const runtime = "nodejs";

/**
 * POST /api/url-check  { url: string }
 * 400 on invalid input; otherwise 200 with a UrlCheckResult. Failures → "UNKNOWN", never "SAFE".
 */
export function POST(request: Request) {
  return handleJsonPost(
    request,
    UrlCheckRequestSchema,
    ({ url }) => checkUrl(url),
    ({ url }) => unknownUrlResult(url, "URL check failed.", isMockMode() ? "mock" : "live"),
  );
}
