/** Site-wide constants and links shown in the navbar/footer. */

/** Public repo URL. Set this once the repo is pushed; the GitHub links stay hidden while it is null. */
export const GITHUB_URL: string | null = null;

export const RESOURCE_LINKS = [
  ...(GITHUB_URL ? [{ label: "GitHub", href: GITHUB_URL }] : []),
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
