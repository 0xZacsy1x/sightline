"use client";

import { useId, useState } from "react";

import { ApprovalsTable } from "@/components/approvals/approvals-table";
import { NetworkField } from "@/components/blueprint/network-field";
import { FieldError, FormCard, FormInput, MONO_LABEL, PrimaryButton, SecondaryButton } from "@/components/blueprint/primitives";
import { ResultSection } from "@/components/blueprint/result-section";
import { PageHero } from "@/components/layout/page-hero";
import { useApiPost } from "@/lib/client/use-api-post";
import { MOCK_APPROVALS } from "@/lib/mock-data";
import { ApprovalsResultSchema } from "@/lib/scan/types";
import { isEvmAddress, type Chain } from "@/lib/validations/scan";

const ERROR_INVALID = "Enter a valid EVM wallet address (0x + 40 hex characters).";

/** UI-REFERENCE.md §4.1–4.3 */
export function ApprovalsInspector() {
  const [chain, setChain] = useState<Chain>("base");
  const [wallet, setWallet] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const { state, run, retry, simulate } = useApiPost("/api/approvals", ApprovalsResultSchema);
  const loading = state.status === "loading";
  const inputId = useId();
  const errorId = useId();

  function inspect() {
    const value = wallet.trim();
    if (!isEvmAddress(value)) {
      setFieldError(ERROR_INVALID);
      return;
    }
    setFieldError(null);
    void run({ wallet: value, chain });
  }

  /** Sample button: fill the form and show the simulated approvals — no API call. */
  function showSample() {
    setFieldError(null);
    setChain(MOCK_APPROVALS.chain);
    setWallet(MOCK_APPROVALS.wallet);
    simulate(MOCK_APPROVALS);
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
            if (!loading) inspect();
          }}
        >
          <NetworkField value={chain} onChange={setChain} />

          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[130px_1fr]">
            <label htmlFor={inputId} className={`${MONO_LABEL} sm:pt-4`}>
              WALLET ADDRESS
            </label>
            <div className="flex flex-col gap-2">
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
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-brand-border-strong pt-5">
            <span className="text-sm text-[#3A4458]">Try a sample:</span>
            <SecondaryButton disabled={loading} onClick={showSample}>
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verdict-risk" />
              Sample Wallet
            </SecondaryButton>
          </div>
        </FormCard>
      </PageHero>

      <ResultSection
        label="APPROVALS"
        state={state}
        empty="No wallet inspected yet — paste an address above or try the sample."
        loading="FETCHING APPROVALS…"
        skeleton="table"
        onRetry={retry}
      >
        {(result, sample) => <ApprovalsTable result={result} sample={sample} />}
      </ResultSection>
    </>
  );
}
