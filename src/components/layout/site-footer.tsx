import Link from "next/link";

import { SightlineMark } from "@/components/brand/logo";
import { NAV_ITEMS } from "@/lib/nav";
import { RESOURCE_LINKS } from "@/lib/site";

const COLUMN_HEADER = "font-mono text-[11px] tracking-widest text-brand-muted-2";
const LINK = "text-[13px] text-[#3A4458] transition-colors hover:text-brand-cobalt";

/** UI-REFERENCE.md §7 */
export function SiteFooter() {
  return (
    <footer className="border-t border-brand-border bg-white">
      <div className="mx-auto max-w-[1200px] px-8">
        <div className="flex flex-wrap justify-between gap-x-16 gap-y-10 py-10">
          {/* Brand + read-only reassurance (always visible) */}
          <div className="flex max-w-[360px] flex-col gap-3">
            <div className="flex items-center gap-2">
              <SightlineMark variant="small" size={20} className="h-5 w-5" />
              <span className="font-sans text-base font-bold tracking-tight text-brand-dark">Sightline</span>
            </div>
            <p className="text-[13px] leading-relaxed text-[#3A4458]">
              100% Read-Only — Never asks for your seed phrase, private key, or a transaction signature.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-16 gap-y-8">
            <nav aria-label="Footer" className="flex flex-col gap-3">
              <h2 className={COLUMN_HEADER}>NAVIGATION</h2>
              <ul className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={LINK}>
                      {item.footerLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex flex-col gap-3">
              <h2 className={COLUMN_HEADER}>RESOURCES</h2>
              <ul className="flex flex-col gap-2">
                {RESOURCE_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-brand-border py-4 text-xs text-[#8A96AB]">
          Powered by Webacy (DD.xyz) Risk Engine
        </div>
      </div>
    </footer>
  );
}
