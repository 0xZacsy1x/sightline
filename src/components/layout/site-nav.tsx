"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GitHubIcon } from "@/components/brand/github-icon";
import { SightlineMark } from "@/components/brand/logo";
import { NAV_ITEMS, isActivePath } from "@/lib/nav";
import { GITHUB_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/** UI-REFERENCE.md §2. `mockMode` is computed on the server (layout) — never pass secrets here. */
export function SiteNav({ mockMode }: { mockMode: boolean }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-white/[0.92] backdrop-blur-sm">
      <div className="mx-auto flex min-h-16 max-w-[1200px] flex-wrap items-center justify-between gap-3 gap-x-6 px-8">
        {/* Left: logo */}
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5 rounded-sm" aria-label="Sightline — home">
            <SightlineMark variant="cobalt" size={24} className="h-6 w-6" />
            <span className="font-sans text-lg font-bold tracking-tight text-brand-dark">Sightline</span>
          </Link>
          <span className="border border-brand-cobalt px-2 py-0.5 font-mono text-[10px] tracking-widest text-brand-cobalt">
            READ-ONLY
          </span>
        </div>

        {/* Center: nav */}
        <nav aria-label="Main">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
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
        <div className="flex items-center gap-3">
          {mockMode ? (
            <span className="flex items-center gap-1.5 bg-brand-pill px-2.5 py-1 font-mono text-[11px] tracking-wide text-brand-muted-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-verdict-caution" />
              MOCK MODE
            </span>
          ) : null}
          {GITHUB_URL ? (
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sightline on GitHub"
              className="rounded-sm text-brand-dark transition-colors hover:text-brand-cobalt"
            >
              <GitHubIcon />
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
