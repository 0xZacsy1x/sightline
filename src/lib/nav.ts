/** One label per page, shared by the navbar and the footer. */
export type NavItem = { href: string; label: string };

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Scanner" },
  { href: "/approvals", label: "Approvals" },
  { href: "/url-guard", label: "URL Guard" },
  { href: "/guide", label: "Guide" },
];

export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
