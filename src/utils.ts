export function escapeMarkdownV2(text: string) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

export function isSolanaPublicKey(address: string): boolean {
  const solanaPublicKeyRegex = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/;
  return solanaPublicKeyRegex.test(address);
}

export let tokens = new Map<string, string>();

async function token_tickers() {
  try {
    console.log("Fetching tokens from Jupiter API...");
    const response = await fetch("https://lite-api.jup.ag/tokens/v1/all");
    const data = await response.json();

    data.map((token: { symbol: string; address: string; tags: string[] }) => {
      if (token.tags.includes("verified") || token.tags.includes("strict"))
        tokens.set(token.symbol.replace(/\s+/g, ""), token.address);
    });
    console.log("Tokens fetched successfully.");
  } catch (error) {
    console.error("Error fetching or processing tokens:", error);
    throw error;
  }
}

token_tickers();
setInterval(token_tickers, 1000 * 60 * 60 * 24); // Fetch Day
