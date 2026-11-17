"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GithubIcon } from "@/components/icons/github";
import { SightlineMark } from "@/components/brand/logo";
import { NAV_ITEMS, isActivePath } from "@/lib/nav";
import { GITHUB_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/** UI-REFERENCE.md §2. `mockMode` is computed on the server (layout) — never pass secrets here. */
export function SiteNav({ mockMode }: { mockMode: boolean }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-white/[0.92] backdrop-blur-sm">
      {/* On desktop (>=840px): three columns where left and right are both flex-1, centering the nav.
          On mobile (<840px): left and right stay on row 1 without squishing, and nav drops to row 2. */}
      <div className="mx-auto flex min-h-16 max-w-[1200px] flex-wrap items-center justify-between gap-y-2 px-4 sm:px-8">
        {/* Left: logo + brand + badge */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5 min-[840px]:flex-1">
          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-2.5 rounded-sm" aria-label="Sightline — home">
            <SightlineMark variant="cobalt" size={24} className="h-6 w-6 shrink-0" />
            <span className="font-sans text-lg font-bold tracking-tight text-brand-dark whitespace-nowrap">Sightline</span>
          </Link>
          <span className="shrink-0 border border-brand-cobalt px-1.5 py-0.5 sm:px-2 font-mono text-[10px] tracking-widest whitespace-nowrap text-brand-cobalt">
            READ-ONLY
          </span>
        </div>

        {/* Center: nav. Below 840px the two sides no longer fit beside it at equal widths
            (which would push it off-centre), so it drops to its own centred row. */}
        <nav aria-label="Main" className="order-last w-full min-[840px]:order-none min-[840px]:w-auto">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-1 text-sm font-medium">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block border-b-2 py-3 transition-colors",
                      active
                        ? "border-brand-cobalt text-brand-cobalt"
                        : "border-transparent text-brand-dark hover:text-brand-cobalt",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right: mode badge + GitHub */}
        <div className="flex shrink-0 items-center justify-end gap-2.5 sm:gap-3 min-[840px]:flex-1">
          {mockMode ? (
            <span className="flex items-center gap-1.5 bg-brand-pill px-2 py-0.5 sm:px-2.5 sm:py-1 font-mono text-[11px] tracking-wide whitespace-nowrap text-brand-muted-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verdict-caution" />
              MOCK MODE
            </span>
          ) : null}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className="shrink-0 text-brand-dark hover:text-brand-cobalt transition-colors"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
