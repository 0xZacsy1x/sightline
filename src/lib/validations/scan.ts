import { z } from "zod";

/**
 * Shared input validation — used by the client (pre-flight check before hitting the API)
 * and by every `/api/*` Route Handler (authoritative check).
 */

export const CHAINS = ["base", "arb", "eth"] as const;
export const ChainSchema = z.enum(CHAINS);
export type Chain = z.infer<typeof ChainSchema>;

export const CHAIN_LABEL: Record<Chain, string> = { base: "Base", arb: "Arbitrum", eth: "Ethereum" };

export const INPUT_TYPES = ["address", "transaction", "url"] as const;
export type InputType = (typeof INPUT_TYPES)[number];

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const TX_HASH = /^0x[a-fA-F0-9]{64}$/;
const HOSTNAME = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

export const MAX_INPUT_LENGTH = 2048;

export type DetectedInput = { type: InputType; value: string };

export function isEvmAddress(value: string): boolean {
  return EVM_ADDRESS.test(value);
}

/** Accepts http(s) URLs or bare domains. Rejects every other scheme (javascript:, data:, …). */
export function normalizeUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value || value.length > MAX_INPUT_LENGTH) return null;
  const candidate = HAS_SCHEME.test(value) ? value : `https://${value}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (!HOSTNAME.test(url.hostname)) return null;
  return url.toString();
}

export function detectInput(raw: string): DetectedInput | null {
  const value = raw.trim();
  if (!value || value.length > MAX_INPUT_LENGTH) return null;
  if (EVM_ADDRESS.test(value)) return { type: "address", value: value.toLowerCase() };
  if (TX_HASH.test(value)) return { type: "transaction", value: value.toLowerCase() };
  if (value.startsWith("0x")) return null; // malformed hex — don't fall through to URL
  const url = normalizeUrl(value);
  return url ? { type: "url", value: url } : null;
}

const RawInput = z.string().trim().min(1).max(MAX_INPUT_LENGTH);

/** POST /api/scan — address, tx hash, or URL. */
export const ScanRequestSchema = z
  .object({ input: RawInput, chain: ChainSchema.default("eth") })
  .transform((data, ctx) => {
    const detected = detectInput(data.input);
    if (!detected) {
      ctx.addIssue({
        code: "custom",
        path: ["input"],
        message: "Input must be an EVM address, a transaction hash, or an http(s) URL.",
      });
      return z.NEVER;
    }
    return { ...detected, chain: data.chain };
  });
export type ScanRequest = z.infer<typeof ScanRequestSchema>;

/** POST /api/url-check */
export const UrlCheckRequestSchema = z.object({ url: RawInput }).transform((data, ctx) => {
  const url = normalizeUrl(data.url);
  if (!url) {
    ctx.addIssue({ code: "custom", path: ["url"], message: "Enter a valid http(s) URL or domain." });
    return z.NEVER;
  }
  return { url };
});
export type UrlCheckRequest = z.infer<typeof UrlCheckRequestSchema>;

/** POST /api/approvals */
export const ApprovalsRequestSchema = z
  .object({ wallet: RawInput, chain: ChainSchema.default("eth") })
  .transform((data, ctx) => {
    if (!isEvmAddress(data.wallet)) {
      ctx.addIssue({ code: "custom", path: ["wallet"], message: "Enter a valid EVM wallet address (0x + 40 hex)." });
      return z.NEVER;
    }
    return { wallet: data.wallet.toLowerCase(), chain: data.chain };
  });
export type ApprovalsRequest = z.infer<typeof ApprovalsRequestSchema>;
