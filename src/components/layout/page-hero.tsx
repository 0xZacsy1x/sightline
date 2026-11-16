import { DotGrid, type DotGridPosition } from "@/components/blueprint/dot-grid";
import { Section, SectionLabel } from "@/components/blueprint/section";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  label: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  /** `lg` = Scanner homepage (§3.1), `md` = other pages (§4.1). */
  size?: "lg" | "md";
  dotGrid?: DotGridPosition;
  children?: React.ReactNode;
};

/** Shared hero: section label + big sans heading + subtitle + dot-grid (UI-REFERENCE.md §3.1, §4.1). */
export function PageHero({ label, title, subtitle, size = "md", dotGrid = "bottom-right", children }: PageHeroProps) {
  return (
    <Section bordered={false} className="overflow-hidden">
      <DotGrid position={dotGrid} />
      <div className="relative flex flex-col gap-6">
        <SectionLabel>{label}</SectionLabel>
        <h1
          className={cn(
            "max-w-[900px] font-sans font-medium text-brand-dark",
            size === "lg"
              ? "text-[clamp(40px,7vw,84px)] leading-[1.02] tracking-[-0.035em]"
              : "text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-[-0.03em]",
          )}
        >
          {title}
        </h1>
        <p className="max-w-[520px] text-base leading-relaxed text-[#3A4458]">{subtitle}</p>
        {children}
      </div>
    </Section>
  );
}
