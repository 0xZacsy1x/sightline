/**
 * Sample inputs behind the "Try a sample" buttons. Shared by client and server:
 * in mock mode these — and only these — get simulated results (see lib/server/mock.ts).
 */
export const SAMPLES = {
  /** vitalik.eth — a well-known, long-lived EOA. */
  safeEoa: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
  /**
   * Known flagged contract on Ethereum (Tornado.Cash router). In live mode Webacy scores
   * this as 100/100 (HIGH_RISK) with sanctioned and contract vulnerability flags.
   */
  riskyContract: "0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b",
  /** Wallet with simulated approvals in mock mode. */
  approvalsWallet: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
  safeUrl: "https://app.uniswap.org/",
  /** Fictional phishing domain from UI-REFERENCE.md §5.3 — never rendered as a link. */
  phishingUrl: "https://fr33-m1nt-op3nsea.xyz/claim",
} as const;
