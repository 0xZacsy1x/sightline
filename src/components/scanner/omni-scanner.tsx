"use client";

import { useId, useState } from "react";

import { NetworkField } from "@/components/blueprint/network-field";
import { FieldError, FormCard, FormInput, MONO_LABEL, PrimaryButton, SecondaryButton } from "@/components/blueprint/primitives";
import { ResultSection } from "@/components/blueprint/result-section";
import { PageHero } from "@/components/layout/page-hero";
import { ScanResultCard } from "@/components/scanner/scan-result";
import { useApiPost } from "@/lib/client/use-api-post";
import { MOCK_RISKY_CONTRACT, MOCK_SAFE_EOA } from "@/lib/mock-data";
import { ScanResultSchema, type ScanResult } from "@/lib/scan/types";
import { MAX_INPUT_LENGTH, detectInput, type Chain } from "@/lib/validations/scan";

const ERROR_INVALID = "Invalid format. Paste an EVM address (0x + 40 hex), a tx hash (0x + 64 hex), or an http(s) URL.";

/** Homepage hero + scanner form (§3.1) and the Scan Results section (§3.2). */
export function OmniScanner() {
  const [chain, setChain] = useState<Chain>("base");
  const [value, setValue] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const { state, run, retry, simulate } = useApiPost("/api/scan", ScanResultSchema);
  const loading = state.status === "loading";
  const inputId = useId();
  const errorId = useId();

  function scan() {
    const detected = detectInput(value);
    if (!detected) {
      setFieldError(ERROR_INVALID);
      return;
    }
    setFieldError(null);
    void run({ input: detected.value, chain });
  }

  /** Sample buttons: fill the form and show the simulated result — no API call. */
  function showSample(sample: ScanResult) {
    setFieldError(null);
    setChain(sample.chain);
    setValue(sample.input);
    simulate(sample);
  }

  return (
    <>
      <PageHero
        size="lg"
        label="PRE-FLIGHT CHECK · BASE · ARBITRUM · ETHEREUM"
        title={["Check first,", { text: "then sign.", className: "text-[#4F7FE8]" }]}
        subtitle="Paste a wallet, contract, transaction hash, or dApp URL. Sightline returns a clear verdict before you connect or sign — read-only, no keys, no signatures."
        dotGrid="bottom-right"
      >
        <FormCard
          role="search"
          aria-label="Scan an address, transaction, or URL"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) scan();
          }}
        >
          <NetworkField value={chain} onChange={setChain} />

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
            <SecondaryButton disabled={loading} onClick={() => showSample(MOCK_SAFE_EOA)}>
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verdict-safe" />
              Safe EOA
            </SecondaryButton>
            <SecondaryButton disabled={loading} onClick={() => showSample(MOCK_RISKY_CONTRACT)}>
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verdict-risk" />
              Risky Contract
            </SecondaryButton>
          </div>
        </FormCard>
      </PageHero>

      <ResultSection
        label="SCAN RESULTS"
        state={state}
        empty="No results yet — run a scan or try a sample above."
        loading="SCANNING…"
        skeleton="scan"
        onRetry={retry}
      >
        {(result, sample) => <ScanResultCard result={result} sample={sample} />}
      </ResultSection>
    </>
  );
}
