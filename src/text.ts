export const welcomeMessage =
  "🔍 <b>Welcome to Lens Bot</b>\n\n" +
  "Your Solana token analysis companion. I help you see through the noise with deep token insights.\n\n" +
  "<b>Quick Start:</b>\n" +
  "🔸 Paste any Solana token address for instant analysis\n" +
  "🔸 Use commands below for specific features\n" +
  "🔸 Add me to groups to help your community\n\n" +
  "<b>What I can analyze:</b>\n" +
  "✅ Solana token security &amp; rug detection\n" +
  "✅ Holder distribution &amp; whale analysis\n" +
  "✅ Interactive bubble maps\n" +
  "✅ Real-time price &amp; market data";

export const commands = [
  { command: "help", description: "information about the bot" },
  { command: "token", description: "Analyze token details and metrics" },
  {
    command: "rug_check",
    description: "Get token detailed rug check analysis",
  },
  { command: "bubblemap", description: "Generate token holder visualization" },
  { command: "price", description: "Get current token price in USD" },
];
