"use client";

import { useId, useState } from "react";

import { FieldError, FormCard, FormInput, MONO_LABEL, PrimaryButton, SecondaryButton } from "@/components/blueprint/primitives";
import { Section, SectionLabel } from "@/components/blueprint/section";
import { EmptyState, ErrorState, LoadingState } from "@/components/blueprint/states";
import { PageHero } from "@/components/layout/page-hero";
import { UrlResultCard } from "@/components/url-guard/url-result";
import { useApiPost } from "@/lib/client/use-api-post";
import { SAMPLES } from "@/lib/samples";
import { UrlCheckResultSchema } from "@/lib/scan/types";
import { MAX_INPUT_LENGTH, normalizeUrl } from "@/lib/validations/scan";

const ERROR_INVALID = "Enter a valid http(s) URL or domain, e.g. https://app.example.org.";

/** UI-REFERENCE.md §5.1–5.4 */
export function UrlGuard() {
  const [value, setValue] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const { state, run } = useApiPost("/api/url-check", UrlCheckResultSchema);
  const loading = state.status === "loading";
  const inputId = useId();
  const errorId = useId();

  function check(raw: string) {
    const url = normalizeUrl(raw);
    if (!url) {
      setFieldError(ERROR_INVALID);
      return;
    }
    setFieldError(null);
    void run({ url });
  }

  function checkSample(sample: string) {
    setValue(sample);
    check(sample);
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
            if (!loading) check(value);
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
            <SecondaryButton disabled={loading} onClick={() => checkSample(SAMPLES.safeUrl)}>
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verdict-safe" />
              Safe URL
            </SecondaryButton>
            <SecondaryButton disabled={loading} onClick={() => checkSample(SAMPLES.phishingUrl)}>
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verdict-risk" />
              Phishing URL
            </SecondaryButton>
          </div>
        </FormCard>
      </PageHero>

      <Section aria-labelledby="url-result-label">
        <div className="flex flex-col gap-6" aria-live="polite" aria-busy={loading}>
          <SectionLabel>
            <span id="url-result-label">RESULT</span>
          </SectionLabel>
          {state.status === "idle" ? <EmptyState>No URL checked yet — paste one above or try a sample.</EmptyState> : null}
          {state.status === "loading" ? <LoadingState>CHECKING URL…</LoadingState> : null}
          {state.status === "error" ? <ErrorState message={state.message} /> : null}
          {state.status === "success" ? <UrlResultCard result={state.data} /> : null}
        </div>
      </Section>
    </>
  );
}
