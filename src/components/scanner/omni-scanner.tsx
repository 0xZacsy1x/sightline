"use client";

import { useId, useState } from "react";
import { Play } from "lucide-react";

import { NetworkField } from "@/components/blueprint/network-field";
import { FieldError, FormCard, FormInput, MONO_LABEL, PrimaryButton, SecondaryButton } from "@/components/blueprint/primitives";
import { ResultSection } from "@/components/blueprint/result-section";
import { PageHero } from "@/components/layout/page-hero";
import { ScanResultCard } from "@/components/scanner/scan-result";
import { useDemo } from "@/hooks/use-gsap";
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
  const playDemoScript = useDemo();
  const [demoTyping, setDemoTyping] = useState(false);
  const loading = state.status === "loading";
  const busy = loading || demoTyping;
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

  /**
   * WATCH DEMO: types the sample address (0–1.2s), selects its network, shows the loading
   * state (1.5s), then the simulated HIGH RISK verdict (3s). No API call.
   */
  function playDemo() {
    const sample = MOCK_RISKY_CONTRACT;
    setFieldError(null);
    setValue("");
    setDemoTyping(true);
    playDemoScript({
      text: sample.input,
      typeDuration: 1.2,
      onType: setValue,
      cues: [
        { at: 1.3, run: () => setChain(sample.chain) },
        {
          at: 1.5,
          run: () => {
            setDemoTyping(false);
            simulate(sample, 1500);
          },
        },
      ],
    });
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
        <div className="flex flex-wrap items-end gap-4">
          <FormCard
            role="search"
            aria-label="Scan an address, transaction, or URL"
            className="min-w-0 flex-1 basis-[480px]"
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) scan();
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
                    readOnly={demoTyping}
                    invalid={fieldError !== null}
                    aria-describedby={fieldError ? errorId : undefined}
                    onChange={(e) => {
                      setValue(e.target.value);
                      if (fieldError) setFieldError(null);
                    }}
                  />
                  <PrimaryButton type="submit" loading={loading} disabled={demoTyping} loadingLabel="SCANNING">
                    SCAN
                  </PrimaryButton>
                </div>
                {fieldError ? <FieldError id={errorId}>{fieldError}</FieldError> : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-brand-border-strong pt-5">
              <span className="text-sm text-[#3A4458]">Try a sample:</span>
              <SecondaryButton disabled={busy} onClick={() => showSample(MOCK_SAFE_EOA)}>
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verdict-safe" />
                Safe EOA
              </SecondaryButton>
              <SecondaryButton disabled={busy} onClick={() => showSample(MOCK_RISKY_CONTRACT)}>
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verdict-risk" />
                Risky Contract
              </SecondaryButton>
            </div>
          </FormCard>
          <SecondaryButton
            disabled={busy}
            onClick={playDemo}
            className="min-h-12 gap-2.5 px-5 font-mono text-[13px] tracking-widest"
          >
            <Play aria-hidden="true" className="size-3.5 fill-current text-brand-cobalt" />
            {demoTyping ? "PLAYING…" : "WATCH DEMO"}
          </SecondaryButton>
        </div>
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
