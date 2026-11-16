import { LoaderCircle, RotateCw, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

/** Empty / default state — dashed box, mono uppercase copy. */
export function EmptyState({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "border border-dashed border-brand-border-strong bg-white px-4 py-10 text-center font-mono text-[13px] tracking-wide text-brand-muted-2 uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

function Bone({ className }: { className?: string }) {
  return <span className={cn("block rounded-sm bg-brand-pill", className)} />;
}

/** Placeholder shapes that mirror the result each page is about to show. */
const SKELETONS = {
  /** Scanner verdict card: verdict panel (left) + details and findings (right). */
  scan: (
    <div className="grid grid-cols-1 border border-brand-border bg-white md:grid-cols-[minmax(260px,1fr)_1.6fr]">
      <div className="flex flex-col gap-5 p-7">
        <Bone className="size-9" />
        <Bone className="h-7 w-36" />
        <Bone className="h-4 w-full" />
        <Bone className="mt-8 h-16 w-28" />
      </div>
      <div className="flex flex-col gap-4 border-t border-brand-border p-7 md:border-t-0 md:border-l">
        <Bone className="h-4 w-2/3" />
        <Bone className="h-4 w-1/2" />
        <Bone className="h-4 w-3/4" />
        <Bone className="mt-4 h-3 w-28" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-5/6" />
      </div>
    </div>
  ),
  /** URL result: verdict banner + detail rows. */
  url: (
    <div className="border border-brand-border bg-white">
      <div className="flex items-start gap-4 border-b border-brand-border p-7">
        <Bone className="size-7 shrink-0" />
        <div className="flex flex-1 flex-col gap-2.5">
          <Bone className="h-6 w-56 max-w-full" />
          <Bone className="h-4 w-80 max-w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-7">
        <Bone className="h-4 w-3/4" />
        <Bone className="h-4 w-1/2" />
        <Bone className="h-4 w-2/5" />
        <Bone className="mt-4 h-3 w-24" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-5/6" />
      </div>
    </div>
  ),
  /** Approvals table: header + rows. */
  table: (
    <div className="border border-brand-border bg-white">
      <div className="border-b border-brand-border bg-brand-surface px-4 py-3">
        <Bone className="h-3 w-48 max-w-full" />
      </div>
      {[0, 1, 2, 3].map((row) => (
        <div
          key={row}
          className="flex items-center gap-6 border-b border-dashed border-brand-border px-4 py-4 last:border-b-0"
        >
          <Bone className="h-9 w-24" />
          <Bone className="h-9 flex-1" />
          <Bone className="h-4 w-24" />
          <Bone className="h-6 w-20" />
        </div>
      ))}
    </div>
  ),
} as const;

export type SkeletonVariant = keyof typeof SKELETONS;

/** Loading: mono status line + a pulsing skeleton of the result that is on its way. */
export function LoadingState({
  children = "SCANNING…",
  skeleton = "scan",
}: {
  children?: React.ReactNode;
  skeleton?: SkeletonVariant;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-2 font-mono text-[13px] tracking-widest text-brand-muted-2 uppercase">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-brand-cobalt motion-reduce:animate-none" />
        {children}
      </p>
      <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
        {SKELETONS[skeleton]}
      </div>
    </div>
  );
}

/** Request-level error. Always reminds the user that unverified means unsafe (fail-closed). */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-4 border border-verdict-risk bg-verdict-risk-bg p-5"
    >
      <div className="flex items-start gap-3">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-verdict-risk" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-verdict-risk">{message}</p>
          <p className="text-sm text-[#3A4458]">Until it can be verified, treat this target as unsafe.</p>
        </div>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-sm border border-verdict-risk bg-white px-4 font-mono text-[12px] tracking-widest text-verdict-risk transition-colors hover:bg-verdict-risk hover:text-white"
        >
          <RotateCw aria-hidden="true" className="size-3.5" />
          TRY AGAIN
        </button>
      ) : null}
    </div>
  );
}
