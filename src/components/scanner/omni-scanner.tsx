"use client";

import { useId, useState } from "react";

import { FieldError, FormCard, FormInput, MONO_LABEL, PrimaryButton, SecondaryButton, ToggleButton } from "@/components/blueprint/primitives";
import { Section, SectionLabel } from "@/components/blueprint/section";
import { EmptyState, ErrorState, LoadingState } from "@/components/blueprint/states";
import { PageHero } from "@/components/layout/page-hero";
import { ScanResultCard } from "@/components/scanner/scan-result";
import { useApiPost } from "@/lib/client/use-api-post";
import { SAMPLES } from "@/lib/samples";
import { ScanResultSchema } from "@/lib/scan/types";
import { CHAINS, CHAIN_LABEL, MAX_INPUT_LENGTH, detectInput, type Chain } from "@/lib/validations/scan";

const ERROR_INVALID = "Invalid format. Paste an EVM address (0x + 40 hex), a tx hash (0x + 64 hex), or an http(s) URL.";

/** Homepage hero + scanner form (§3.1) and the Scan Results section (§3.2). */
export function OmniScanner() {
  const [chain, setChain] = useState<Chain>("base");
  const [value, setValue] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const { state, run } = useApiPost("/api/scan", ScanResultSchema);
  const loading = state.status === "loading";
  const inputId = useId();
  const errorId = useId();
  const networkLabelId = useId();

  function scan(raw: string, overrideChain?: Chain) {
    const activeChain = overrideChain ?? chain;
    const detected = detectInput(raw);
    if (!detected) {
      setFieldError(ERROR_INVALID);
      return;
    }
    setFieldError(null);
    void run({ input: detected.value, chain: activeChain });
  }

  function scanSample(sample: string, targetChain?: Chain) {
    if (targetChain) {
      setChain(targetChain);
    }
    setValue(sample);
    scan(sample, targetChain);
  }

  return (
    <>
      <PageHero
        size="lg"
        label="PRE-FLIGHT CHECK · BASE · ARBITRUM · ETHEREUM"
        title={
          <>
            Check first,
            <br />
            <span className="text-[#4F7FE8]">then sign.</span>
          </>
        }
        subtitle="Paste a wallet, contract, transaction hash, or dApp URL. Sightline returns a clear verdict before you connect or sign — read-only, no keys, no signatures."
        dotGrid="bottom-right"
      >
        <FormCard
          role="search"
          aria-label="Scan an address, transaction, or URL"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) scan(value);
          }}
        >
          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[130px_1fr]">
            <span id={networkLabelId} className={MONO_LABEL}>
              NETWORK
            </span>
            <div role="group" aria-labelledby={networkLabelId} className="flex flex-wrap gap-2">
              {CHAINS.map((c) => (
                <ToggleButton key={c} active={chain === c} onClick={() => setChain(c)}>
                  {CHAIN_LABEL[c]}
                </ToggleButton>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[130px_1fr]">
            <label htmlFor={inputId} className={`${MONO_LABEL} sm:pt-4`}>
              ADDRESS / URL
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-3">
                <FormInput
                  id={inputId}
                  inputMode="url"
                  maxLength={MAX_INPUT_LENGTH}
                  placeholder="0x… or https://…"
                  value={value}
                  invalid={fieldError !== null}
                  aria-describedby={fieldError ? errorId : undefined}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (fieldError) setFieldError(null);
                  }}
                />
                <PrimaryButton type="submit" loading={loading} loadingLabel="SCANNING">
                  SCAN
                </PrimaryButton>
              </div>
              {fieldError ? <FieldError id={errorId}>{fieldError}</FieldError> : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-brand-border-strong pt-5">
            <span className="text-sm text-[#3A4458]">Try a sample:</span>
            <SecondaryButton disabled={loading} onClick={() => scanSample(SAMPLES.safeEoa, "eth")}>
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verdict-safe" />
              Safe EOA
            </SecondaryButton>
            <SecondaryButton disabled={loading} onClick={() => scanSample(SAMPLES.riskyContract, "eth")}>
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verdict-risk" />
              Risky Contract
            </SecondaryButton>
          </div>
        </FormCard>
      </PageHero>

      <Section aria-labelledby="scan-results-label">
        <div className="flex flex-col gap-6" aria-live="polite" aria-busy={loading}>
          <SectionLabel>
            <span id="scan-results-label">SCAN RESULTS</span>
          </SectionLabel>
          {state.status === "idle" ? <EmptyState>No results yet — run a scan or try a sample above.</EmptyState> : null}
          {state.status === "loading" ? <LoadingState>SCANNING…</LoadingState> : null}
          {state.status === "error" ? <ErrorState message={state.message} /> : null}
          {state.status === "success" ? <ScanResultCard result={state.data} /> : null}
        </div>
      </Section>
    </>
  );
}
