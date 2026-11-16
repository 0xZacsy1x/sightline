import { cn } from "@/lib/utils";

/**
 * UI-REFERENCE.md §8 — shown above every simulated result.
 * `sample` = a "Try a sample" / demo result, which is simulated even when live mode is on.
 */
export function MockDataBanner({ sample = false, className }: { sample?: boolean; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex flex-wrap items-center gap-x-3.5 gap-y-1.5 bg-brand-dark px-4 py-3 text-[13px] text-white",
        className,
      )}
    >
      <span className="border border-white px-2 py-0.5 font-mono text-[11px] tracking-widest">MOCK DATA</span>
      <span>
        This is a simulation, not a real scan result.
        {sample ? null : " Live mode activates after WEBACY_API_KEY is set."}
      </span>
    </div>
  );
}
