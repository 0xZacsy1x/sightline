import { CircleHelp, ShieldAlert, ShieldCheck, TriangleAlert, type LucideIcon } from "lucide-react";

import type { Severity, Verdict } from "@/lib/scan/types";
import { cn } from "@/lib/utils";

/** UI-REFERENCE.md §3.2 / §9 — static class strings so Tailwind can see them. */
export const VERDICT_STYLES: Record<Verdict, { badge: string; panel: string; text: string; fill: string }> = {
  SAFE: {
    badge: "bg-verdict-safe-bg text-verdict-safe",
    panel: "bg-verdict-safe-bg",
    text: "text-verdict-safe",
    fill: "bg-verdict-safe",
  },
  CAUTION: {
    badge: "bg-verdict-caution-bg text-verdict-caution",
    panel: "bg-verdict-caution-bg",
    text: "text-verdict-caution",
    fill: "bg-verdict-caution",
  },
  HIGH_RISK: {
    badge: "bg-verdict-risk-bg text-verdict-risk",
    panel: "bg-verdict-risk-bg",
    text: "text-verdict-risk",
    fill: "bg-verdict-risk",
  },
  UNKNOWN: {
    badge: "bg-verdict-unknown-bg text-verdict-unknown",
    panel: "bg-verdict-unknown-bg",
    text: "text-verdict-unknown",
    fill: "bg-verdict-unknown",
  },
};

export const VERDICT_ICON: Record<Verdict, LucideIcon> = {
  SAFE: ShieldCheck,
  CAUTION: TriangleAlert,
  HIGH_RISK: ShieldAlert,
  UNKNOWN: CircleHelp,
};

export function verdictLabel(verdict: Verdict): string {
  return verdict.replace("_", " ");
}

const BADGE = "inline-block whitespace-nowrap px-2.5 py-1 font-mono text-[11px] tracking-widest uppercase";

/** §9 VerdictBadge — mono, uppercase, coloured bg per verdict. */
export function VerdictBadge({ verdict, className }: { verdict: Verdict; className?: string }) {
  return <span className={cn(BADGE, VERDICT_STYLES[verdict].badge, className)}>{verdictLabel(verdict)}</span>;
}

const SEVERITY_TO_VERDICT: Record<Severity, Verdict> = { HIGH: "HIGH_RISK", MEDIUM: "CAUTION", LOW: "SAFE" };

/** §3.2 severity badge for a single finding. */
export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span className={cn(BADGE, VERDICT_STYLES[SEVERITY_TO_VERDICT[severity]].badge, className)}>{severity}</span>
  );
}
