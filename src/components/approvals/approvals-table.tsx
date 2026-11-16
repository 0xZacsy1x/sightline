"use client";

import { useState } from "react";

import { MockDataBanner } from "@/components/blueprint/mock-data-banner";
import { MONO_LABEL, ToggleButton } from "@/components/blueprint/primitives";
import { EmptyState } from "@/components/blueprint/states";
import { VERDICT_ICON, VERDICT_STYLES, VerdictBadge } from "@/components/blueprint/verdict-badge";
import { truncateHex } from "@/lib/format";
import type { ApprovalRow, ApprovalsResult } from "@/lib/scan/types";
import { cn } from "@/lib/utils";
import { CHAIN_LABEL } from "@/lib/validations/scan";

type Filter = "all" | "unlimited" | "high";

const FILTERS: Record<Filter, { label: string; match: (row: ApprovalRow) => boolean }> = {
  all: { label: "All", match: () => true },
  unlimited: { label: "Unlimited", match: (row) => row.allowance.unlimited },
  high: { label: "High Risk", match: (row) => row.verdict === "HIGH_RISK" },
};

const TH = "px-4 py-3 text-left font-mono text-[11px] font-medium tracking-widest text-brand-muted-2";

/** UI-REFERENCE.md §4.3 — filters + approvals table. Read-only: no revoke actions. */
export function ApprovalsTable({ result, sample = false }: { result: ApprovalsResult; sample?: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");

  if (result.status === "unknown") {
    const Icon = VERDICT_ICON.UNKNOWN;
    return (
      <div className="flex flex-col gap-4">
        {sample || result.mode === "mock" ? <MockDataBanner sample={sample} /> : null}
        <div className={cn("flex items-start gap-4 border border-brand-border p-6", VERDICT_STYLES.UNKNOWN.panel)}>
          <Icon aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-verdict-unknown" />
          <div className="flex flex-col gap-1.5">
            <p className="font-sans text-lg font-semibold tracking-tight text-verdict-unknown">
              Could not verify approvals
            </p>
            <p className="text-sm text-[#3A4458]">
              We couldn&apos;t load the approval list for this wallet. That does not mean it has none — treat its
              allowances as unknown.
            </p>
            {result.note ? <p className="text-sm text-[#3A4458]">{result.note}</p> : null}
          </div>
        </div>
      </div>
    );
  }

  const rows = result.approvals.filter(FILTERS[filter].match);
  const unlimitedCount = result.approvals.filter(FILTERS.unlimited.match).length;
  const highCount = result.approvals.filter(FILTERS.high.match).length;

  return (
    <div className="flex flex-col gap-4">
      {sample || result.mode === "mock" ? <MockDataBanner sample={sample} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Filter approvals" className="flex flex-wrap gap-2">
          {(Object.keys(FILTERS) as Filter[]).map((key) => (
            <ToggleButton
              key={key}
              active={filter === key}
              onClick={() => setFilter(key)}
              className={cn(key === "high" && filter !== key && "text-verdict-risk")}
            >
              {FILTERS[key].label}
            </ToggleButton>
          ))}
        </div>
        <p className={MONO_LABEL}>
          {result.approvals.length} APPROVALS · {unlimitedCount} UNLIMITED · {highCount} HIGH RISK ·{" "}
          {CHAIN_LABEL[result.chain].toUpperCase()}
        </p>
      </div>

      {result.approvals.length === 0 ? (
        <EmptyState>No open approvals found for this wallet on {CHAIN_LABEL[result.chain]}.</EmptyState>
      ) : rows.length === 0 ? (
        <EmptyState>No approvals match this filter.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse border border-brand-border bg-white">
            <caption className="sr-only">Token approvals granted by {result.wallet}</caption>
            <thead className="bg-brand-surface">
              <tr className="border-b border-brand-border">
                <th scope="col" className={TH}>
                  TOKEN
                </th>
                <th scope="col" className={TH}>
                  SPENDER
                </th>
                <th scope="col" className={TH}>
                  ALLOWANCE
                </th>
                <th scope="col" className={TH}>
                  RISK
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.tokenAddress}-${row.spenderAddress}`}
                  className="border-b border-dashed border-brand-border align-top last:border-b-0"
                >
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-brand-dark">{row.tokenSymbol}</p>
                    <p title={row.tokenAddress} className="font-mono text-xs text-brand-muted-2">
                      {truncateHex(row.tokenAddress)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-brand-dark">{row.spenderName ?? "Unlabeled contract"}</p>
                    <p title={row.spenderAddress} className="font-mono text-xs text-brand-muted-2">
                      {truncateHex(row.spenderAddress)}
                    </p>
                    {row.reasons.length > 0 ? (
                      <p className="mt-1.5 max-w-[320px] text-xs leading-relaxed text-[#3A4458]">
                        {row.reasons.join(" · ")}
                      </p>
                    ) : null}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4 font-mono text-[13px] whitespace-nowrap",
                      row.allowance.unlimited ? "tracking-widest text-verdict-risk" : "text-brand-dark",
                    )}
                  >
                    {row.allowance.display}
                  </td>
                  <td className="px-4 py-4">
                    <VerdictBadge verdict={row.verdict} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
