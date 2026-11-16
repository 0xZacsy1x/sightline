export type NavItem = {
  href: string;
  label: string;
  /** Longer label used in the footer navigation column (UI-REFERENCE.md §7). */
  footerLabel: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Scanner", footerLabel: "Scanner" },
  { href: "/approvals", label: "Approvals", footerLabel: "Approvals" },
  { href: "/url-guard", label: "URL Guard", footerLabel: "URL Guard" },
  { href: "/guide", label: "Guide", footerLabel: "Security Guide" },
];

export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
