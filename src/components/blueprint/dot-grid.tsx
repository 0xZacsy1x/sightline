import { cn } from "@/lib/utils";

export type DotGridPosition = "bottom-right" | "top-right" | "bottom-left" | "top-left";

/** Placement + mask direction per corner. The mask fades the grid out towards the hero copy. */
const POSITIONS: Record<DotGridPosition, { className: string; mask: string }> = {
  "bottom-right": { className: "right-0 bottom-0 h-[78%]", mask: "linear-gradient(135deg, transparent 38%, #000 100%)" },
  "top-right": { className: "right-0 top-0 h-[78%]", mask: "linear-gradient(45deg, transparent 38%, #000 100%)" },
  // Left-side grids sit under the hero copy, so they stay short enough to clear the subtitle.
  "bottom-left": { className: "left-0 bottom-0 h-[42%]", mask: "linear-gradient(225deg, transparent 38%, #000 100%)" },
  "top-left": { className: "left-0 top-0 h-[42%]", mask: "linear-gradient(315deg, transparent 38%, #000 100%)" },
};

/**
 * UI-REFERENCE.md §1.4 — cobalt dot-grid used in every hero (§11 rule 8).
 * The parent must be `relative overflow-hidden`; hero content should sit above it (`relative`).
 */
export function DotGrid({ position = "bottom-right", className }: { position?: DotGridPosition; className?: string }) {
  const { className: placement, mask } = POSITIONS[position];
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute w-[62%] opacity-55", placement, className)}
      style={{
        backgroundImage: "radial-gradient(#1F4FD8 1.1px, transparent 1.6px)",
        backgroundSize: "10px 10px",
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}
