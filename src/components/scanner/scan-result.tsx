import { ExternalLink } from "lucide-react";

import { MockDataBanner } from "@/components/blueprint/mock-data-banner";
import { MONO_LABEL } from "@/components/blueprint/primitives";
import { SeverityBadge, VERDICT_ICON, VERDICT_STYLES, verdictLabel } from "@/components/blueprint/verdict-badge";
import { useResultEnter } from "@/hooks/use-gsap";
import { accountTypeLabel, truncateHex } from "@/lib/format";
import type { ScanResult, Verdict } from "@/lib/scan/types";
import { cn } from "@/lib/utils";
import { CHAIN_LABEL, detectInput, type Chain } from "@/lib/validations/scan";

const VERDICT_SUMMARY: Record<Verdict, string> = {
  SAFE: "No significant risk signals found. Still double-check what you sign.",
  CAUTION: "Some signals need your attention before you interact.",
  HIGH_RISK: "High risk — do not sign or approve anything for this target.",
  UNKNOWN: "Could not verify — treat as unsafe until proven otherwise.",
};

const INPUT_LABEL: Record<ScanResult["inputType"], string> = {
  address: "ADDRESS",
  transaction: "TX HASH",
  url: "URL",
};

const EXPLORERS: Record<Chain, { name: string; base: string }> = {
  eth: { name: "Etherscan", base: "https://etherscan.io" },
  base: { name: "Basescan", base: "https://basescan.org" },
  arb: { name: "Arbiscan", base: "https://arbiscan.io" },
};

/**
 * Link to a known-safe explorer only. The path segment is re-validated as pure hex,
 * so nothing user-controlled other than [0-9a-f] reaches the href. URL scans get no link.
 */
function explorerLink(result: ScanResult): { href: string; name: string } | null {
  if (result.inputType === "url") return null;
  const detected = detectInput(result.input);
  if (!detected || detected.type !== result.inputType) return null;
  const explorer = EXPLORERS[result.chain];
  const segment = detected.type === "address" ? "address" : "tx";
  return { href: `${explorer.base}/${segment}/${detected.value}`, name: explorer.name };
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-dashed border-brand-border py-3 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className={MONO_LABEL}>{label}</dt>
      <dd className="min-w-0 text-sm text-brand-dark">{children}</dd>
    </div>
  );
}

/** UI-REFERENCE.md §3.2 — verdict panel (left) + details & findings (right). All API strings as text. */
export function ScanResultCard({ result, sample = false }: { result: ScanResult; sample?: boolean }) {
  const { verdict, score, findings } = result;
  const styles = VERDICT_STYLES[verdict];
  const Icon = VERDICT_ICON[verdict];
  const explorer = explorerLink(result);
  const ref = useResultEnter<HTMLElement>("pop");

  return (
    <div className="flex flex-col gap-4">
      {sample || result.mode === "mock" ? <MockDataBanner sample={sample} /> : null}

      <article
        ref={ref}
        aria-labelledby="scan-verdict"
        className="grid grid-cols-1 border border-brand-border bg-white md:grid-cols-[minmax(260px,1fr)_1.6fr]"
      >
        {/* Left: verdict */}
        <div className={cn("relative flex flex-col gap-5 p-7", styles.panel)}>
          {/* Verdict-coloured tint that fades out as the card enters. */}
          <span aria-hidden="true" data-flash className={cn("pointer-events-none absolute inset-0 opacity-0", styles.fill)} />
          <Icon aria-hidden="true" className={cn("size-9", styles.text)} strokeWidth={1.75} />
          <div className="flex flex-col gap-2">
            <h3 id="scan-verdict" className={cn("font-sans text-[28px] leading-none font-semibold tracking-tight", styles.text)}>
              {verdictLabel(verdict)}
            </h3>
            <p className="text-sm leading-relaxed text-[#3A4458]">{VERDICT_SUMMARY[verdict]}</p>
            {result.note ? <p className="text-sm leading-relaxed text-[#3A4458]">{result.note}</p> : null}
          </div>
          <div className="mt-auto flex flex-col gap-2 pt-4">
            <span className="font-sans text-[64px] leading-none font-medium tracking-tight text-brand-dark">
              {score === null ? "—" : Math.round(score)}
            </span>
            <span className="font-mono text-xs tracking-widest text-[#3A4458]">/ 100 · OVERALL RISK</span>
          </div>
        </div>

        {/* Right: details + findings */}
        <div className="flex min-w-0 flex-col gap-6 border-t border-brand-border p-7 md:border-t-0 md:border-l">
          <dl className="border-t border-brand-border">
            {result.inputType === "address" ? (
              <Row label="ACCOUNT TYPE">{accountTypeLabel(result.addressType)}</Row>
            ) : null}
            {result.inputType !== "url" ? <Row label="NETWORK">{CHAIN_LABEL[result.chain]}</Row> : null}
            <Row label={INPUT_LABEL[result.inputType]}>
              <span title={result.input} className="block truncate font-mono text-sm">
                {result.inputType === "url" ? result.input : truncateHex(result.input, 10, 8)}
              </span>
            </Row>
          </dl>

          <section aria-labelledby="scan-findings" className="flex flex-col gap-2">
            <h4 id="scan-findings" className={MONO_LABEL}>
              FINDINGS ({findings.length})
            </h4>
            {findings.length > 0 ? (
              <ol className="flex flex-col border-t border-brand-border">
                {findings.map((finding, i) => (
                  <li
                    key={finding.text}
                    data-enter-row
                    className="flex items-start gap-4 border-b border-dashed border-brand-border py-3 text-sm text-brand-dark"
                  >
                    <span className="pt-0.5 font-mono text-[11px] tracking-widest text-brand-muted-2">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">{finding.text}</span>
                    {finding.severity ? <SeverityBadge severity={finding.severity} /> : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="border-t border-brand-border pt-3 text-sm text-[#3A4458]">
                {verdict === "UNKNOWN" ? "No findings available — the target could not be verified." : "No findings detected."}
              </p>
            )}
          </section>

          {explorer ? (
            <a
              href={explorer.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex min-h-[44px] items-center justify-center gap-2 self-start rounded-sm border border-brand-border-strong bg-white px-4 font-mono text-[12px] tracking-widest text-brand-cobalt transition-colors hover:border-brand-cobalt"
            >
              VIEW ON {explorer.name.toUpperCase()}
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
          ) : null}
        </div>
      </article>
    </div>
  );
}
