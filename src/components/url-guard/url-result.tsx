import { Info } from "lucide-react";

import { MockDataBanner } from "@/components/blueprint/mock-data-banner";
import { MONO_LABEL } from "@/components/blueprint/primitives";
import { VERDICT_ICON, VERDICT_STYLES } from "@/components/blueprint/verdict-badge";
import type { UrlCheckResult, Verdict } from "@/lib/scan/types";
import { cn } from "@/lib/utils";

const HEADLINE: Record<Verdict, { title: string; body: string }> = {
  HIGH_RISK: { title: "PHISHING DETECTED", body: "Do not open this URL or connect your wallet to it." },
  CAUTION: {
    title: "POSSIBLE IMPERSONATION",
    body: "This domain resembles a known project. Verify the address through the project's official channels.",
  },
  SAFE: { title: "SAFE", body: "This URL is listed as a verified dApp site." },
  UNKNOWN: { title: "COULD NOT VERIFY", body: "No verdict is available — treat this URL as unsafe." },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[150px_1fr] sm:gap-4">
      <dt className={MONO_LABEL}>{label}</dt>
      <dd className="min-w-0 text-sm text-brand-dark">{children}</dd>
    </div>
  );
}

/**
 * UI-REFERENCE.md §5.3 / §5.4. The scanned URL is plain mono text — never an <a href> —
 * with `break-all` so a long phishing URL can't push the layout or hide its real host.
 */
export function UrlResultCard({ result, sample = false }: { result: UrlCheckResult; sample?: boolean }) {
  const styles = VERDICT_STYLES[result.verdict];
  const Icon = VERDICT_ICON[result.verdict];
  const headline = HEADLINE[result.verdict];
  const risky = result.verdict === "HIGH_RISK";

  return (
    <div className="flex flex-col gap-4">
      {sample || result.mode === "mock" ? <MockDataBanner sample={sample} /> : null}

      <article aria-labelledby="url-verdict" className="border border-brand-border bg-white">
        <header className={cn("flex items-start gap-4 border-b border-brand-border p-7", styles.panel)}>
          <Icon aria-hidden="true" className={cn("mt-0.5 size-7 shrink-0", styles.text)} strokeWidth={1.75} />
          <div className="flex flex-col gap-1.5">
            <h3 id="url-verdict" className={cn("font-sans text-2xl font-semibold tracking-tight", styles.text)}>
              {headline.title}
            </h3>
            <p className="text-sm text-[#3A4458]">{headline.body}</p>
            {result.note ? <p className="text-sm text-[#3A4458]">{result.note}</p> : null}
          </div>
        </header>

        <div className="flex flex-col p-7 pt-4">
          <dl>
            <Row label="URL CHECKED:">
              <span className={cn("font-mono break-all", risky ? "text-verdict-risk" : "text-brand-dark")}>
                {result.url}
              </span>
            </Row>
            <Row label="DOMAIN:">
              <span className={cn("font-mono break-all", risky ? "text-verdict-risk" : "text-brand-dark")}>
                {result.domain}
              </span>
            </Row>
            <Row label="CATEGORY:">{result.category}</Row>
            {result.domainAge ? <Row label="DOMAIN AGE:">{result.domainAge}</Row> : null}
          </dl>

          <div className="mt-3 flex flex-col gap-3 border-t border-dashed border-brand-border pt-5">
            <h4 className={MONO_LABEL}>REASONS:</h4>
            {result.reasons.length > 0 ? (
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-brand-dark marker:text-brand-muted-2">
                {result.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#3A4458]">No reasons provided.</p>
            )}
          </div>
        </div>
      </article>

      <p className="flex items-start gap-3 bg-brand-pill px-4 py-3 text-[13px] text-[#3A4458]">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-muted-2" />
        Sightline never turns a scanned URL into a clickable link. If you decide to visit a site, type the address
        yourself or use a bookmark you trust.
      </p>
    </div>
  );
}
