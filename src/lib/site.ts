/** Site-wide constants and links shown in the navbar/footer. */

/** Public source repo — linked from the navbar, the footer, and the guide. */
export const GITHUB_URL = "https://github.com/0xZacsy1x/sightline";

/** Production origin: resolves relative metadata URLs (Open Graph / Twitter images). */
export const SITE_URL = "https://sightline-nine-pi.vercel.app";

export const RESOURCE_LINKS = [
  { label: "GitHub", href: GITHUB_URL },
  { label: "DD.xyz", href: "https://dd.xyz" },
  { label: "Webacy", href: "https://webacy.com" },
] as const satisfies readonly { label: string; href: string }[];

/**
 * Mock mode = no WEBACY_API_KEY configured. Server-only: call it from Server Components
 * or Route Handlers and pass the resulting boolean down. Never pass the key itself.
 */
export function isMockMode(): boolean {
  return !process.env.WEBACY_API_KEY;
}
