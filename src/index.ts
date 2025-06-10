import { Context, Markup, Telegraf } from "telegraf";
import { isSolanaPublicKey, tokens } from "./utils";
import { bubblemap_msg } from "./api/bubblemaps";
import { rug_check_msg } from "./api/rug_check";

require("dotenv").config();
const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("BOT_TOKEN is not set in the environment variables.");
  process.exit(1);
}

const bot = new Telegraf(token);

const commands = [
  { command: "help", description: "information about the bot" },
  { command: "token", description: "Analyze token details and metrics" },
  {
    command: "rug_check",
    description: "Get token detailed rug check analysis",
  },
  { command: "bubblemap", description: "Generate token holder visualization" },
  { command: "price", description: "Get current token price in USD" },
];

bot.telegram.setMyCommands(commands);

bot.use((ctx, next) => {
  console.log(ctx.message);
  next();
});

bot.start((ctx: Context) => {
  const welcomeMessage =
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

  return ctx.reply(welcomeMessage, {
    parse_mode: "HTML",
    ...Markup.keyboard([
      ["/rug_check"],
      ["/token", "/bubblemap"],
      ["➕ Add to Group"],
    ])
      .resize()
      .oneTime(),
    ...Markup.inlineKeyboard([
      Markup.button.url(
        "➕ Add to Group",
        `https://t.me/sol_token_lens_bot?startgroup=true`,
      ),
    ]),
  });
});

let state = "none";
["rug_check", "bubblemap", "token", "price"].forEach((command) => {
  bot.command(command, (ctx) => {
    state = command;
    ctx.reply("📌 Enter the token address:", {
      parse_mode: "MarkdownV2",
    });
  });
});

bot.on("text", async (ctx) => {
  const isGroupChat = ctx.chat.type.includes("group");
  const botUsername = (await bot.telegram.getMe()).username;
  const messageText = ctx.message.text.trim();

  if (isGroupChat && !messageText.includes(`@${botUsername}`)) {
    return;
  }

  let address = messageText.replace(`@${botUsername}`, "").trim();

  const isTicker = tokens.has(address.replace(/\s+/g, ""));
  if (isTicker) {
    address = tokens.get(address)!;
    console.log(address);
  }

  if (!isSolanaPublicKey(address)) {
    const errorMessage =
      "❌ Invalid address. Please enter a valid solana token address.\n\n" +
      "Example:\n" +
      "- Solana: <code>HvhG...w2FQ</code>\n";

    return ctx.reply(errorMessage, { parse_mode: "HTML" });
  }

  if (state === "rug_check") {
    state = "none";
    rug_check_msg(address, ctx);
  }

  if (state === "bubblemap") {
    state = "none";
    bubblemap_msg(address, ctx);
  }

  if (state === "token" || state === "none") {
    state = "none";
    rug_check_msg(address, ctx);
    bubblemap_msg(address, ctx);
  }
});

bot.launch();
