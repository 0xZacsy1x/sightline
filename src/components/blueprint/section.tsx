import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/** UI-REFERENCE.md §1.4 — the `+` marks where a section's top border meets <main>'s side borders. */
export function CornerMarks() {
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute -top-[11px] -left-1.5 bg-brand-surface px-0 py-0.5 font-mono text-base leading-none text-brand-dark"
      >
        +
      </span>
      <span
        aria-hidden="true"
        className="absolute -top-[11px] -right-1.5 bg-brand-surface px-0 py-0.5 font-mono text-base leading-none text-brand-dark"
      >
        +
      </span>
    </>
  );
}

/** UI-REFERENCE.md §1.4 — mono uppercase label with a square cobalt dot. */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 font-mono text-xs tracking-widest text-brand-muted-2 uppercase",
        className,
      )}
    >
      <span aria-hidden="true" className="inline-block h-1.5 w-1.5 shrink-0 bg-brand-cobalt" />
      <span>{children}</span>
    </div>
  );
}

type SectionProps = React.ComponentPropsWithoutRef<"section"> & {
  /** `major` = py-14, `minor` = py-10 (UI-REFERENCE.md §1.3). */
  size?: "major" | "minor";
  /** Draw the top border + corner marks. Off for the first section under the navbar. */
  bordered?: boolean;
};

/** A full-width band inside <main>, separated by a top border with `+` corner marks. */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { size = "major", bordered = true, className, children, ...props },
  ref,
) {
  return (
    <section
      ref={ref}
      className={cn("relative px-8", size === "major" ? "py-14" : "py-10", bordered && "border-t border-brand-border", className)}
      {...props}
    >
      {bordered ? <CornerMarks /> : null}
      {children}
    </section>
  );
});
