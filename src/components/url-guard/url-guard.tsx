"use client";

import { useId, useState } from "react";

import { FieldError, FormCard, FormInput, MONO_LABEL, PrimaryButton, SecondaryButton } from "@/components/blueprint/primitives";
import { ResultSection } from "@/components/blueprint/result-section";
import { PageHero } from "@/components/layout/page-hero";
import { UrlResultCard } from "@/components/url-guard/url-result";
import { useApiPost } from "@/lib/client/use-api-post";
import { MOCK_URL_PHISHING, MOCK_URL_SAFE } from "@/lib/mock-data";
import { UrlCheckResultSchema, type UrlCheckResult } from "@/lib/scan/types";
import { MAX_INPUT_LENGTH, normalizeUrl } from "@/lib/validations/scan";

const ERROR_INVALID = "Enter a valid http(s) URL or domain, e.g. https://app.example.org.";

/** UI-REFERENCE.md §5.1–5.4 */
export function UrlGuard() {
  const [value, setValue] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const { state, run, retry, simulate } = useApiPost("/api/url-check", UrlCheckResultSchema);
  const loading = state.status === "loading";
  const inputId = useId();
  const errorId = useId();

  function check() {
    const url = normalizeUrl(value);
    if (!url) {
      setFieldError(ERROR_INVALID);
      return;
    }
    setFieldError(null);
    void run({ url });
  }

  /** Sample buttons: fill the form and show the simulated result — no API call. */
  function showSample(sample: UrlCheckResult) {
    setFieldError(null);
    setValue(sample.url);
    simulate(sample);
  }

  return (
    <>
      <PageHero
        label="URL PHISHING GUARD"
        title="Check links before you click."
        subtitle="Paste a dApp link to check it against known phishing and drainer domains. Scanned URLs are shown as plain text — never as clickable links."
        dotGrid="bottom-left"
      >
        <FormCard
          role="search"
          aria-label="Check a URL"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) check();
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor={inputId} className={MONO_LABEL}>
              URL TO CHECK
            </label>
            <div className="flex flex-wrap gap-3">
              <FormInput
                id={inputId}
                type="text"
                inputMode="url"
                maxLength={MAX_INPUT_LENGTH}
                placeholder="https://..."
                value={value}
                invalid={fieldError !== null}
                aria-describedby={fieldError ? errorId : undefined}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (fieldError) setFieldError(null);
                }}
              />
              <PrimaryButton type="submit" loading={loading} loadingLabel="CHECKING">
                CHECK URL
              </PrimaryButton>
            </div>
            {fieldError ? <FieldError id={errorId}>{fieldError}</FieldError> : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-brand-border-strong pt-5">
            <span className="text-sm text-[#3A4458]">Try a sample:</span>
            <SecondaryButton disabled={loading} onClick={() => showSample(MOCK_URL_SAFE)}>
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verdict-safe" />
              Safe URL
            </SecondaryButton>
            <SecondaryButton disabled={loading} onClick={() => showSample(MOCK_URL_PHISHING)}>
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verdict-risk" />
              Phishing URL
            </SecondaryButton>
          </div>
        </FormCard>
      </PageHero>

      <ResultSection
        label="RESULT"
        state={state}
        empty="No URL checked yet — paste one above or try a sample."
        loading="CHECKING URL…"
        skeleton="url"
        onRetry={retry}
      >
        {(result, sample) => <UrlResultCard result={result} sample={sample} />}
      </ResultSection>
    </>
  );
}
