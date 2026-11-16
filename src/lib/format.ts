/** 0x1234…abcd — for addresses and hashes. Full value goes in a `title` attribute. */
export function truncateHex(value: string, head = 6, tail = 4): string {
  return value.length <= head + tail + 1 ? value : `${value.slice(0, head)}…${value.slice(-tail)}`;
}

const ACCOUNT_TYPE: Record<string, string> = {
  EOA: "EOA Wallet",
  CONTRACT: "Smart Contract",
  CONTRACT_WALLET: "Contract Wallet",
  TOKEN: "Token Contract",
};

export function accountTypeLabel(addressType: string | null): string {
  if (!addressType) return "Unknown";
  return ACCOUNT_TYPE[addressType] ?? addressType;
}
