"use client";

import { Fragment, useId, useState } from "react";

import { ApprovalsTable } from "@/components/approvals/approvals-table";
import { FieldError, FormCard, FormInput, MONO_LABEL, PrimaryButton } from "@/components/blueprint/primitives";
import { Section, SectionLabel } from "@/components/blueprint/section";
import { EmptyState, ErrorState, LoadingState } from "@/components/blueprint/states";
import { PageHero } from "@/components/layout/page-hero";
import { useApiPost } from "@/lib/client/use-api-post";
import { SAMPLES } from "@/lib/samples";
import { ApprovalsResultSchema } from "@/lib/scan/types";
import { cn } from "@/lib/utils";
import { CHAINS, CHAIN_LABEL, isEvmAddress, type Chain } from "@/lib/validations/scan";

const ERROR_INVALID = "Enter a valid EVM wallet address (0x + 40 hex characters).";

/** UI-REFERENCE.md §4.1–4.3 */
export function ApprovalsInspector() {
  const [chain, setChain] = useState<Chain>("base");
  const [wallet, setWallet] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const { state, run } = useApiPost("/api/approvals", ApprovalsResultSchema);
  const loading = state.status === "loading";
  const inputId = useId();
  const errorId = useId();
  const networkLabelId = useId();

  function inspect(raw: string) {
    const value = raw.trim();
    if (!isEvmAddress(value)) {
      setFieldError(ERROR_INVALID);
      return;
    }
    setFieldError(null);
    void run({ wallet: value, chain });
  }

  return (
    <>
      <PageHero
        label="APPROVAL INSPECTOR"
        title="Review token permissions you've granted."
        subtitle="Paste a wallet address to see which contracts can move your tokens — and which allowances are unlimited. Read-only: nothing is signed or revoked from here."
        dotGrid="top-right"
      >
        <FormCard
          aria-label="Inspect wallet approvals"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) inspect(wallet);
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor={inputId} className={MONO_LABEL}>
              WALLET ADDRESS
            </label>
            <div className="flex flex-wrap gap-3">
              <FormInput
                id={inputId}
                maxLength={42}
                placeholder="0x…"
                value={wallet}
                invalid={fieldError !== null}
                aria-describedby={fieldError ? errorId : undefined}
                onChange={(e) => {
                  setWallet(e.target.value);
                  if (fieldError) setFieldError(null);
                }}
              />
              <PrimaryButton type="submit" loading={loading} loadingLabel="INSPECTING">
                INSPECT
              </PrimaryButton>
            </div>
            {fieldError ? <FieldError id={errorId}>{fieldError}</FieldError> : null}
          </div>

          {/* §4.2 — network selector is inline text, not buttons-as-pills. */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-dashed border-brand-border-strong pt-4 text-sm">
            <span id={networkLabelId} className={cn(MONO_LABEL, "mr-1")}>
              NETWORK:
            </span>
            <span role="group" aria-labelledby={networkLabelId} className="flex flex-wrap items-center gap-x-2">
              {CHAINS.map((c, i) => (
                <Fragment key={c}>
                  {i > 0 ? (
                    <span aria-hidden="true" className="text-brand-border-strong">
                      /
                    </span>
                  ) : null}
                  <button
                    type="button"
                    aria-pressed={chain === c}
                    onClick={() => setChain(c)}
                    className={cn(
                      "rounded-sm py-1 underline-offset-4 transition-colors",
                      chain === c
                        ? "font-semibold text-brand-cobalt underline decoration-2"
                        : "text-[#3A4458] hover:text-brand-dark",
                    )}
                  >
                    {CHAIN_LABEL[c]}
                  </button>
                </Fragment>
              ))}
            </span>
            <span className="ml-auto">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setWallet(SAMPLES.approvalsWallet);
                  inspect(SAMPLES.approvalsWallet);
                }}
                className="rounded-sm py-1 font-mono text-[12px] tracking-widest text-brand-cobalt underline-offset-4 hover:underline disabled:opacity-60"
              >
                TRY A SAMPLE WALLET
              </button>
            </span>
          </div>
        </FormCard>
      </PageHero>

      <Section aria-labelledby="approvals-label">
        <div className="flex flex-col gap-6" aria-live="polite" aria-busy={loading}>
          <SectionLabel>
            <span id="approvals-label">APPROVALS</span>
          </SectionLabel>
          {state.status === "idle" ? (
            <EmptyState>No wallet inspected yet — paste an address above.</EmptyState>
          ) : null}
          {state.status === "loading" ? <LoadingState>FETCHING APPROVALS…</LoadingState> : null}
          {state.status === "error" ? <ErrorState message={state.message} /> : null}
          {state.status === "success" ? (
            // Keyed so the filter resets for each new wallet/network.
            <ApprovalsTable key={`${state.data.wallet}-${state.data.chain}`} result={state.data} />
          ) : null}
        </div>
      </Section>
    </>
  );
}
