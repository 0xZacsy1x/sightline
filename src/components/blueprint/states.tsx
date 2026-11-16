import { LoaderCircle, TriangleAlert } from "lucide-react";

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

export function LoadingState({ children = "SCANNING…" }: { children?: React.ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-2 border border-brand-border bg-white px-4 py-10 font-mono text-[13px] tracking-widest text-brand-muted-2 uppercase">
      <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-brand-cobalt" />
      {children}
    </p>
  );
}

/** Request-level error. Always reminds the user that unverified means unsafe (fail-closed). */
export function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 border border-brand-border bg-verdict-risk-bg p-4">
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-verdict-risk" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-verdict-risk">{message}</p>
        <p className="text-sm text-[#3A4458]">Until it can be verified, treat this target as unsafe.</p>
      </div>
    </div>
  );
}
