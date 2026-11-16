"use client";

import { useId } from "react";

import { MONO_LABEL, ToggleButton } from "@/components/blueprint/primitives";
import { CHAINS, CHAIN_LABEL, type Chain } from "@/lib/validations/scan";

/** UI-REFERENCE.md §3.1 — NETWORK row: label + toggle buttons (active = dark fill). */
export function NetworkField({ value, onChange }: { value: Chain; onChange: (chain: Chain) => void }) {
  const labelId = useId();
  return (
    <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[130px_1fr]">
      <span id={labelId} className={MONO_LABEL}>
        NETWORK
      </span>
      <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
        {CHAINS.map((chain) => (
          <ToggleButton key={chain} active={value === chain} onClick={() => onChange(chain)}>
            {CHAIN_LABEL[chain]}
          </ToggleButton>
        ))}
      </div>
    </div>
  );
}
