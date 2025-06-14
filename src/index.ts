import { Context, Markup, Telegraf } from "telegraf";
import { isSolanaPublicKey, tokens } from "./utils";
import { commands, errorMessage, welcomeMessage } from "./text";
import { bubblemap_msg } from "./api/bubblemaps";
import { rug_check_msg } from "./api/rug_check";
import { token_price_msg } from "./api/token";

require("dotenv").config();
const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("BOT_TOKEN is not set in the environment variables.");
  process.exit(1);
}

const bot = new Telegraf(token);

bot.telegram.setMyCommands(commands);

bot.use((ctx, next) => {
  console.log(ctx.message);
  next();
});

bot.start((ctx: Context) => {
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

// TODO: set alerts

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
    token_price_msg(address, ctx);
    rug_check_msg(address, ctx);
    bubblemap_msg(address, ctx);
  }

  if (state === "price") {
    state = "none";
    token_price_msg(address, ctx);
  }
});

bot.launch();
