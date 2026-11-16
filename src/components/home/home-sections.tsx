import { FileCode2, KeyRound, Link2, Wallet } from "lucide-react";

import { BentoCell, BentoGrid, NumberedItem, SectionHeading, SplitExplainer } from "@/components/blueprint/layouts";
import { MONO_LABEL } from "@/components/blueprint/primitives";
import { Section, SectionLabel } from "@/components/blueprint/section";
import { VERDICT_STYLES, verdictLabel } from "@/components/blueprint/verdict-badge";
import type { Verdict } from "@/lib/scan/types";
import { cn } from "@/lib/utils";

/** §3.3 */
export function CapabilitiesSection() {
  return (
    <Section>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <SectionLabel>CAPABILITIES</SectionLabel>
          <SectionHeading>Four checks, one verdict.</SectionHeading>
        </div>
        <BentoGrid>
          <BentoCell index={1} icon={Wallet} title="Wallet Exposure">
            See whether an address is tied to known scams, sanctioned entities, or flagged counterparties before you
            send it anything.
          </BentoCell>
          <BentoCell index={2} icon={FileCode2} title="Smart Contract Risk">
            Spot unverified source, owner-controlled balances, honeypot logic, and other contract-level red flags.
          </BentoCell>
          <BentoCell index={3} icon={KeyRound} title="Token Approval Guard">
            List the allowances your wallet has granted and surface the unlimited ones pointing at risky spenders.
          </BentoCell>
          <BentoCell index={4} icon={Link2} title="URL Phishing Shield">
            Check a dApp link against known phishing and drainer domains — shown as plain text, never as a clickable
            link.
          </BentoCell>
        </BentoGrid>
      </div>
    </Section>
  );
}

const STEPS = [
  {
    title: "Paste Address",
    body: "Drop in a wallet, contract, transaction hash, or URL — or try one of the samples.",
  },
  {
    title: "Server Proxy + Risk Engine",
    body: "Our server validates the input and queries the Webacy Risk Engine. Your browser never sees the API key.",
  },
  {
    title: "Verdict Before Signing",
    body: "You get SAFE, CAUTION, HIGH RISK, or UNKNOWN — and anything we can't verify is never shown as safe.",
  },
] as const;

/** §3.4 */
export function HowItWorksSection() {
  return (
    <Section>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <SectionLabel>HOW IT WORKS</SectionLabel>
          <SectionHeading>Three steps, zero signatures.</SectionHeading>
        </div>
        <ol className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center font-sans text-xl font-semibold text-white",
                    i === STEPS.length - 1 ? "bg-brand-cobalt" : "bg-brand-dark",
                  )}
                >
                  {i + 1}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-brand-border" />
              </div>
              <h3 className="font-sans text-lg font-semibold tracking-tight text-brand-dark">{step.title}</h3>
              <p className="text-sm leading-relaxed text-[#3A4458]">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

/** §3.5 */
export function NetworksSection() {
  return (
    <Section size="minor">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <SectionLabel>SUPPORTED NETWORKS</SectionLabel>
        <div className="flex flex-wrap items-center gap-3">
          <span className={MONO_LABEL}>LIVE</span>
          {["Base", "Arbitrum", "Ethereum"].map((name) => (
            <span key={name} className="rounded-sm bg-brand-dark px-4 py-2 text-sm font-medium text-white">
              {name}
            </span>
          ))}
          <span className={cn(MONO_LABEL, "ml-3")}>ROADMAP</span>
          <span className="rounded-sm border border-dashed border-brand-border-strong px-4 py-2 text-sm text-brand-muted-2">
            Solana
          </span>
        </div>
      </div>
    </Section>
  );
}

const VERDICT_ROWS: { verdict: Verdict; range: string; body: string }[] = [
  { verdict: "SAFE", range: "0–30", body: "No significant risk signals. Still read what you sign." },
  { verdict: "CAUTION", range: "31–60", body: "Some signals need attention — verify the contract and the amount first." },
  { verdict: "HIGH_RISK", range: "61–100", body: "Strong risk signals. Don't sign, approve, or send funds." },
  {
    verdict: "UNKNOWN",
    range: "ERROR · TIMEOUT · STALE",
    body: "We couldn't verify it. Fail-closed: treat it as unsafe, never as safe.",
  },
];

/** §3.6 */
export function VerdictExplainerSection() {
  return (
    <Section>
      <div className="flex flex-col gap-8">
        <SectionLabel>VERDICTS</SectionLabel>
        <SplitExplainer
          heading="Four verdicts. No grey area."
          description="Every scan maps the Webacy overall risk score (0–100) to one of four verdicts. If the data is missing, stale, or the API fails, the answer is UNKNOWN — Sightline never guesses SAFE."
        >
          {VERDICT_ROWS.map((row, i) => (
            <NumberedItem
              key={row.verdict}
              index={i + 1}
              titleClassName={VERDICT_STYLES[row.verdict].text}
              title={
                <span className="flex flex-wrap items-baseline gap-x-3">
                  {verdictLabel(row.verdict)}
                  <span className="font-mono text-[11px] font-normal tracking-widest text-brand-muted-2">
                    {row.range}
                  </span>
                </span>
              }
            >
              {row.body}
            </NumberedItem>
          ))}
        </SplitExplainer>
      </div>
    </Section>
  );
}
