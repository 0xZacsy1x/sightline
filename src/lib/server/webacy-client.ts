/**
 * Server-only Webacy transport. The API key is read here and nowhere else.
 * Imported only from `src/lib/server/*`, which is imported only by `src/app/api/*`.
 */
import { z } from "zod";

if (typeof window !== "undefined") {
  throw new Error("lib/server/* must never be imported on the client");
}

// v2 endpoints have no `/api/` prefix (ARCHITECTURE.md §3).
const WEBACY_BASE_URL = "https://api.webacy.com";
const TIMEOUT_MS = 8_000;
export const MAX_TEXT_LENGTH = 200;
export const MAX_ITEMS = 20;

export async function webacyFetch(path: string, init?: RequestInit): Promise<unknown> {
  const apiKey = process.env.WEBACY_API_KEY;
  if (!apiKey) throw new Error("WEBACY_API_KEY is not set");

  const res = await fetch(`${WEBACY_BASE_URL}${path}`, {
    ...init,
    headers: { accept: "application/json", "x-api-key": apiKey, ...init?.headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Webacy responded ${res.status}`);
  return res.json();
}

/** Logs the failure server-side and returns a user-facing note. Never includes upstream bodies. */
export function failureNote(route: string, error: unknown): string {
  const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
  console.error(`[api/${route}] Webacy request failed:`, error instanceof Error ? error.message : error);
  return timedOut ? "Webacy did not respond in time." : "Could not reach Webacy.";
}

/** Trim + cap an upstream string before it reaches the UI (rendered as text, never HTML). */
export function cleanText(value: string | null | undefined): string | null {
  const text = value?.trim().slice(0, MAX_TEXT_LENGTH);
  return text ? text : null;
}

export const TagSchema = z.object({
  name: z.string().nullish(),
  description: z.string().nullish(),
});
