import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { isMockMode } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sightline — Check first, then sign.",
    template: "%s · Sightline",
  },
  description:
    "Read-only Web3 security scanner: check addresses, transactions, token approvals, and URLs before you interact. Powered by Webacy (DD.xyz).",
  applicationName: "Sightline",
  // DESIGN.md §2.4 <head> snippet
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0B1220",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Only the boolean crosses to the client — the key itself never leaves the server.
  const mockMode = isMockMode();

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-sm focus:bg-brand-cobalt focus:px-3 focus:py-2 focus:font-mono focus:text-[13px] focus:text-white"
        >
          Skip to content
        </a>
        <SiteNav mockMode={mockMode} />
        {/* UI-REFERENCE.md §1.4 — the ledger column: side borders on <main>.
            The 12px gutter below 1224px keeps the `+` corner marks on-screen. */}
        <main id="main" className="mx-auto w-[min(1200px,calc(100%-24px))] flex-1 border-x border-brand-border">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
