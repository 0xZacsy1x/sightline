import type { Metadata } from "next";
import { Gauge, KeyRound, Skull, Wallet } from "lucide-react";

import { BentoCell, BentoGrid, NumberedItem, SectionHeading, SplitExplainer } from "@/components/blueprint/layouts";
import { InlineCode } from "@/components/blueprint/primitives";
import { Section, SectionLabel } from "@/components/blueprint/section";
import { GitHubIcon } from "@/components/brand/github-icon";
import { ArchitectureDiagram } from "@/components/guide/architecture-diagram";
import { PageHero } from "@/components/layout/page-hero";
import { GITHUB_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Security Guide",
  description: "Web3 security basics and how Sightline reaches a verdict.",
};

/** UI-REFERENCE.md §6 — static content, no data states. */
export default function GuidePage() {
  return (
    <>
      <PageHero
        label="SECURITY GUIDE"
        title="Understand what you're checking."
        subtitle="A mini-dictionary of the terms Sightline shows you, how a scan travels from your browser to a verdict, and the fail-closed principle behind every result."
        dotGrid="top-right"
      />

      {/* §6.2 */}
      <Section>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <SectionLabel>MINI DICTIONARY</SectionLabel>
            <SectionHeading>Four terms worth knowing before you sign.</SectionHeading>
          </div>
          <BentoGrid>
            <BentoCell index={1} icon={Wallet} title="EOA vs Smart Contract">
              An <strong className="font-semibold text-brand-dark">EOA</strong> (externally owned account) is a wallet
              controlled by a private key. A <strong className="font-semibold text-brand-dark">smart contract</strong> is
              code at an address — it does whatever its logic allows, including things its UI doesn&apos;t tell you.
            </BentoCell>
            <BentoCell index={2} icon={KeyRound} title={<><span className="font-mono">approve()</span> &amp; Allowance</>}>
              <InlineCode>approve()</InlineCode> lets a contract spend your tokens later. The amount you allow is the
              allowance — an unlimited one stays open until you revoke it.
            </BentoCell>
            <BentoCell index={3} icon={Gauge} title="Risk Score 0–100">
              Webacy&apos;s overall risk score. Sightline maps 0–30 to SAFE, 31–60 to CAUTION, and 61–100 to HIGH RISK.
              No score at all means UNKNOWN.
            </BentoCell>
            <BentoCell index={4} icon={Skull} title="Phishing & Drainer">
              Phishing sites imitate real dApps to get you to connect. Drainers are the contracts behind them that
              sweep your tokens once you sign an approval or permit.
            </BentoCell>
          </BentoGrid>
        </div>
      </Section>

      {/* §6.3 */}
      <Section>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <SectionLabel>ARCHITECTURE</SectionLabel>
            <SectionHeading>From paste to verdict.</SectionHeading>
          </div>
          <ArchitectureDiagram />
        </div>
      </Section>

      {/* §6.4 */}
      <Section>
        <div className="flex flex-col gap-8">
          <SectionLabel>SECURITY PRINCIPLES</SectionLabel>
          <SplitExplainer
            heading="Fail-closed, always."
            description="A security tool that says SAFE when it simply couldn't check is worse than no tool. Whenever Sightline can't positively confirm a result, the answer is UNKNOWN."
          >
            <NumberedItem index={1} title="API Error">
              A 4xx/5xx response or a timeout from the risk engine returns UNKNOWN — never SAFE.
            </NumberedItem>
            <NumberedItem index={2} title="Stale Data">
              Data marked stale, missing a score, or never analyzed is treated as unverified and returns UNKNOWN.
            </NumberedItem>
            <NumberedItem index={3} title="Read-Only">
              No wallet signatures, no transactions, no private keys. Sightline only reads public data — it can&apos;t
              move your funds.
            </NumberedItem>
            <NumberedItem index={4} title="API Key Hidden">
              Every Webacy call goes through a server-side route handler. The API key never reaches your browser.
            </NumberedItem>
          </SplitExplainer>
        </div>
      </Section>

      {/* §6.5 */}
      <Section>
        <div className="flex flex-wrap items-center justify-between gap-6 border border-brand-border bg-white p-8">
          <div className="flex max-w-[560px] flex-col gap-2">
            <SectionLabel>OPEN SOURCE</SectionLabel>
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-brand-dark">
              Don&apos;t trust a security tool you can&apos;t read.
            </h2>
            <p className="text-sm leading-relaxed text-[#3A4458]">
              Sightline&apos;s source is public so anyone can verify that it stays read-only and fail-closed.
            </p>
          </div>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2.5 rounded-sm bg-brand-dark px-6 font-mono text-[13px] tracking-widest text-white transition-colors hover:bg-brand-dark/90"
          >
            <GitHubIcon className="h-4 w-4" />
            VIEW ON GITHUB
          </a>
        </div>
      </Section>
    </>
  );
}
