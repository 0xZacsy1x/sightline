import { Monitor, Radar, Server, ShieldCheck, type LucideIcon } from "lucide-react";

import { MONO_LABEL } from "@/components/blueprint/primitives";
import { Reveal } from "@/components/blueprint/reveal";
import { cn } from "@/lib/utils";

type Step = { icon: LucideIcon; tag: string; title: string; body: string; box: string };

const STEPS: Step[] = [
  {
    icon: Monitor,
    tag: "CLIENT",
    title: "Browser",
    body: "You paste an address, tx hash, or URL. Input is validated in the browser — no wallet connection, no keys, no signatures.",
    box: "border-2 border-brand-cobalt bg-white text-brand-cobalt",
  },
  {
    icon: Server,
    tag: "/api/* ROUTE HANDLERS",
    title: "Next.js Server Proxy",
    body: "Re-validates the input with Zod and calls Webacy with the API key, which only ever lives on the server.",
    box: "bg-brand-dark text-white",
  },
  {
    icon: Radar,
    tag: "UPSTREAM",
    title: "Webacy Risk Engine",
    body: "Aggregates threat intelligence across sources and returns a 0–100 risk score with findings.",
    box: "bg-brand-cobalt text-white",
  },
  {
    icon: ShieldCheck,
    tag: "FAIL-CLOSED",
    title: "Verdict Card",
    body: "The score maps to SAFE, CAUTION, HIGH RISK, or UNKNOWN. Errors, timeouts, and stale data become UNKNOWN — never SAFE.",
    box: "border-2 border-verdict-safe bg-white text-verdict-safe",
  },
];

/** UI-REFERENCE.md §6.3 — vertical flow: Browser → Server Proxy → Webacy → Verdict Card. Reveals top → bottom. */
export function ArchitectureDiagram() {
  return (
    <Reveal as="ol" sequence y={24} start="top 80%" aria-label="Request flow" className="flex max-w-[720px] flex-col">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const last = i === STEPS.length - 1;
        return (
          <li key={step.title} data-reveal className="flex gap-6">
            {/* Rail: icon box, then connector line + chevron to the next step */}
            <div className="flex w-14 shrink-0 flex-col items-center">
              <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center", step.box)}>
                <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
              </div>
              {last ? null : (
                <div aria-hidden="true" data-reveal="line-y" className="flex flex-1 flex-col items-center">
                  <span className="min-h-8 w-px flex-1 bg-brand-border-strong" />
                  <svg viewBox="0 0 12 8" className="h-2 w-3 text-brand-border-strong" fill="none">
                    <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
            </div>
            <div className={cn("flex flex-col gap-1.5 pt-1", last ? "pb-0" : "pb-8")}>
              <span className={MONO_LABEL}>{step.tag}</span>
              <h3 className="font-sans text-lg font-semibold tracking-tight text-brand-dark">{step.title}</h3>
              <p className="max-w-[520px] text-sm leading-relaxed text-[#3A4458]">{step.body}</p>
            </div>
          </li>
        );
      })}
    </Reveal>
  );
}
