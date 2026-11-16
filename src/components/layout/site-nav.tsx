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
      {/* Three columns: left and right are both flex-1, so they take equal widths and the nav
          (natural width) sits in the exact centre no matter how different their content is. */}
      <div className="mx-auto flex min-h-16 max-w-[1200px] flex-wrap items-center gap-3 gap-x-6 px-8">
        {/* Left: logo */}
        <div className="flex flex-1 items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5 rounded-sm" aria-label="Sightline — home">
            <SightlineMark variant="cobalt" size={24} className="h-6 w-6" />
            <span className="font-sans text-lg font-bold tracking-tight text-brand-dark">Sightline</span>
          </Link>
          <span className="border border-brand-cobalt px-2 py-0.5 font-mono text-[10px] tracking-widest whitespace-nowrap text-brand-cobalt">
            READ-ONLY
          </span>
        </div>

        {/* Center: nav. Below 840px the two sides no longer fit beside it at equal widths
            (which would push it off-centre), so it drops to its own centred row. */}
        <nav aria-label="Main" className="order-last w-full min-[840px]:order-none min-[840px]:w-auto">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
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
        <div className="flex flex-1 items-center justify-end gap-3">
          {mockMode ? (
            <span className="flex items-center gap-1.5 bg-brand-pill px-2.5 py-1 font-mono text-[11px] tracking-wide whitespace-nowrap text-brand-muted-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verdict-caution" />
              MOCK MODE
            </span>
          ) : null}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className="text-brand-dark hover:text-brand-cobalt transition-colors"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
