"use client";

import { Fragment } from "react";

import { DotGrid, type DotGridPosition } from "@/components/blueprint/dot-grid";
import { Section, SectionLabel } from "@/components/blueprint/section";
import { useHeroIntro } from "@/hooks/use-gsap";
import { cn } from "@/lib/utils";

/** One line of the heading; `className` colours the whole line. */
export type HeroTitleLine = string | { text: string; className?: string };

type PageHeroProps = {
  label: string;
  /** Plain text (one line) or explicit lines. Text only: each word animates in separately. */
  title: string | HeroTitleLine[];
  subtitle: React.ReactNode;
  action?: React.ReactNode;
  /** `lg` = Scanner homepage (§3.1), `md` = other pages (§4.1). */
  size?: "lg" | "md";
  dotGrid?: DotGridPosition;
  children?: React.ReactNode;
};

/** Each word in its own inline-block so it can slide up on its own; spaces stay real text. */
function HeroTitle({ lines }: { lines: HeroTitleLine[] }) {
  return lines.map((line, i) => {
    const { text, className } = typeof line === "string" ? { text: line, className: undefined } : line;
    return (
      <Fragment key={text}>
        {i > 0 ? <br /> : null}
        <span className={className}>
          {text.split(" ").map((word, j) => (
            <Fragment key={j}>
              {j > 0 ? " " : null}
              <span data-reveal data-hero-word className="inline-block">
                {word}
              </span>
            </Fragment>
          ))}
        </span>
      </Fragment>
    );
  });
}

/** Shared hero: section label + big sans heading + subtitle + dot-grid (UI-REFERENCE.md §3.1, §4.1). */
export function PageHero({ label, title, subtitle, action, size = "md", dotGrid = "bottom-right", children }: PageHeroProps) {
  const ref = useHeroIntro<HTMLDivElement>();

  return (
    <Section bordered={false} className="overflow-hidden">
      <div ref={ref}>
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
            <HeroTitle lines={typeof title === "string" ? [title] : title} />
          </h1>
          <p data-reveal data-hero-subtitle className="max-w-[520px] text-base leading-relaxed text-[#3A4458]">
            {subtitle}
          </p>
          {action ? (
            <div data-reveal data-hero-subtitle className="-mt-2">
              {action}
            </div>
          ) : null}
          {children ? (
            <div data-reveal data-hero-body>
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
