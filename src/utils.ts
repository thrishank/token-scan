export function escapeMarkdownV2(text: string) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

export function isSolanaPublicKey(address: string): boolean {
  const solanaPublicKeyRegex = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/;
  return solanaPublicKeyRegex.test(address);
}
