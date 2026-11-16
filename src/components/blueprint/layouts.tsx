/** Reusable section bodies: bento grid (§3.3, §6.2) and two-column explainer (§3.6, §4.4, §6.4). */
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function BentoGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-px border border-brand-border bg-brand-border md:grid-cols-2", className)}>
      {children}
    </div>
  );
}

export function BentoCell({
  index,
  icon: Icon,
  title,
  children,
}: {
  index: number;
  icon: LucideIcon;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="flex flex-col gap-4 bg-white p-8">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center border border-brand-border">
          <Icon aria-hidden="true" className="size-5 text-brand-cobalt" strokeWidth={1.75} />
        </div>
        <span className="font-mono text-[11px] tracking-widest text-brand-muted-2">
          {String(index).padStart(2, "0")}
        </span>
      </div>
      <h3 className="font-sans text-lg font-semibold tracking-tight text-brand-dark">{title}</h3>
      <div className="text-sm leading-relaxed text-[#3A4458]">{children}</div>
    </article>
  );
}

/** Left: heading + description. Right: numbered list (dashed separators). */
export function SplitExplainer({
  heading,
  description,
  children,
}: {
  heading: React.ReactNode;
  description: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap gap-x-16 gap-y-8">
      <div className="flex min-w-[260px] flex-1 basis-[320px] flex-col gap-4">
        <h2 className="font-sans text-[clamp(26px,3.2vw,36px)] leading-[1.1] font-medium tracking-[-0.025em] text-brand-dark">
          {heading}
        </h2>
        <div className="max-w-[440px] text-sm leading-relaxed text-[#3A4458]">{description}</div>
      </div>
      <ol className="flex min-w-[280px] flex-[1.4] basis-[420px] flex-col border-t border-brand-border">{children}</ol>
    </div>
  );
}

export function NumberedItem({
  index,
  title,
  titleClassName,
  children,
}: {
  index: number;
  title: React.ReactNode;
  titleClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-5 border-b border-dashed border-brand-border py-5">
      <span className="pt-0.5 font-mono text-[11px] tracking-widest text-brand-muted-2">
        {String(index).padStart(2, "0")}
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className={cn("font-sans text-base font-semibold tracking-tight text-brand-dark", titleClassName)}>
          {title}
        </h3>
        <div className="text-sm leading-relaxed text-[#3A4458]">{children}</div>
      </div>
    </li>
  );
}

/** Section heading used above bento grids and other section bodies. */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="max-w-[720px] font-sans text-[clamp(26px,3.2vw,36px)] leading-[1.1] font-medium tracking-[-0.025em] text-brand-dark">
      {children}
    </h2>
  );
}
