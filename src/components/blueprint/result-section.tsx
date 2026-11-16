"use client";

import { Fragment, useEffect, useRef } from "react";

import { Section, SectionLabel } from "@/components/blueprint/section";
import { EmptyState, ErrorState, LoadingState, type SkeletonVariant } from "@/components/blueprint/states";
import type { ApiState } from "@/lib/client/use-api-post";

type ResultSectionProps<T> = {
  /** Section label, e.g. "SCAN RESULTS". */
  label: string;
  state: ApiState<T>;
  empty: string;
  loading: string;
  skeleton: SkeletonVariant;
  onRetry: () => void;
  /** Renders a successful result. `sample` = simulated data shown without an API call. */
  children: (data: T, sample: boolean) => React.ReactNode;
};

/**
 * The result band under every form: empty → loading skeleton → error (with retry) → result.
 * Scrolls itself into view when something happens, so a result below the fold is never missed.
 */
export function ResultSection<T>({ label, state, empty, loading, skeleton, onRetry, children }: ResultSectionProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const labelId = `${label.toLowerCase().replace(/\s+/g, "-")}-label`;
  const stage = state.status === "success" ? state.id : state.status;

  useEffect(() => {
    if (stage === "idle") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = reduceMotion ? "auto" : "smooth";
    const timer = setTimeout(() => {
      ref.current?.scrollIntoView({ block: "start", behavior });
    }, 60);
    return () => clearTimeout(timer);
  }, [stage]);

  return (
    <Section aria-labelledby={labelId}>
      {/* Scroll margins: clear the sticky navbar above, leave a little air below. */}
      <div
        ref={ref}
        className="flex scroll-mt-20 scroll-mb-6 flex-col gap-6"
        aria-live="polite"
        aria-busy={state.status === "loading"}
      >
        <SectionLabel>
          <span id={labelId}>{label}</span>
        </SectionLabel>
        {state.status === "idle" ? <EmptyState>{empty}</EmptyState> : null}
        {state.status === "loading" ? <LoadingState skeleton={skeleton}>{loading}</LoadingState> : null}
        {state.status === "error" ? (
          // Retrying an input the server rejected as invalid would just fail again.
          <ErrorState message={state.message} onRetry={state.kind === "generic" ? onRetry : undefined} />
        ) : null}
        {state.status === "success" ? (
          // Keyed so every new result mounts fresh (resets filters, replays the enter animation).
          <Fragment key={state.id}>{children(state.data, state.sample)}</Fragment>
        ) : null}
      </div>
    </Section>
  );
}
