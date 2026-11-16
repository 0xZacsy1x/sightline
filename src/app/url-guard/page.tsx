import type { Metadata } from "next";

import { UrlGuard } from "@/components/url-guard/url-guard";

export const metadata: Metadata = {
  title: "URL Guard",
  description: "Check whether a link is safe before you click it.",
};

/** UI-REFERENCE.md §5 */
export default function UrlGuardPage() {
  return <UrlGuard />;
}
