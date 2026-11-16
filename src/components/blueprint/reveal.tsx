"use client";

import { useScrollReveal, type RevealOptions } from "@/hooks/use-gsap";

type RevealProps = RevealOptions & {
  as?: "div" | "ol" | "ul";
  className?: string;
  "aria-label"?: string;
  children: React.ReactNode;
};

/**
 * Scroll-reveal group. Renders a plain element and animates its `data-reveal` descendants in
 * when it scrolls into view (see useScrollReveal). Children can stay server components.
 */
export function Reveal({ as: Tag = "div", className, "aria-label": ariaLabel, children, ...options }: RevealProps) {
  const ref = useScrollReveal<HTMLElement>(options);
  return (
    <Tag ref={ref as React.Ref<never>} className={className} aria-label={ariaLabel}>
      {children}
    </Tag>
  );
}
