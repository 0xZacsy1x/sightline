import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Split S symbol, served from the ready-made files in /public/logo (DESIGN.md §2.3).
 * Do not redraw the mark here — swap the file instead.
 */
const SYMBOL_FILES = {
  cobalt: "/logo/symbol-cobalt.svg",
  dark: "/logo/symbol.svg",
  white: "/logo/symbol-white.svg",
  /** Small-size cut (wider gap, heavier stroke) for 16–32 px. Dark only. */
  small: "/logo/symbol-small.svg",
} as const;

type SightlineMarkProps = {
  variant?: keyof typeof SYMBOL_FILES;
  /** Rendered size in px. */
  size?: number;
  className?: string;
  /** Leave empty when the mark sits next to visible "Sightline" text (decorative). */
  alt?: string;
};

export function SightlineMark({ variant = "cobalt", size = 24, className, alt = "" }: SightlineMarkProps) {
  return (
    <Image
      src={SYMBOL_FILES[variant]}
      alt={alt}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      priority={variant === "cobalt"}
    />
  );
}
