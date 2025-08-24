import { Context, Markup, Telegraf } from "telegraf";
import { isSolanaPublicKey } from "./utils";
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

const stateMap = new Map<number, string>();

bot.use((ctx, next) => {
  console.log(ctx.message);
  return next();
});

function replyWithMenu(ctx: Context) {
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
}

bot.start(replyWithMenu);
bot.command("help", replyWithMenu);

["rug_check", "bubblemap", "token", "price"].forEach((command) => {
  bot.command(command, (ctx) => {
    stateMap.set(ctx.chat.id, command);
    ctx.reply("📌 Enter the token address:", { parse_mode: "MarkdownV2" });
  });
});

bot.on("text", async (ctx) => {
  const isGroupChat = ctx.chat.type.includes("group");
  const botUsername = (await bot.telegram.getMe()).username;
  const messageText = ctx.message.text.trim();

  if (isGroupChat && !messageText.includes(`@${botUsername}`)) {
    return;
  }

  const address = messageText.replace(`@${botUsername}`, "").trim();
  if (!isSolanaPublicKey(address)) {
    return ctx.reply(errorMessage, { parse_mode: "HTML" });
  }

  const state = stateMap.get(ctx.chat.id) ?? "none";

  switch (state) {
    case "rug_check":
      stateMap.set(ctx.chat.id, "none");
      rug_check_msg(address, ctx);
      break;
    case "bubblemap":
      stateMap.set(ctx.chat.id, "none");
      bubblemap_msg(address, ctx);
      break;
    case "price":
      stateMap.set(ctx.chat.id, "none");
      token_price_msg(address, ctx);
      break;
    case "token":
    case "none":
    default:
      stateMap.set(ctx.chat.id, "none");
      token_price_msg(address, ctx);
      rug_check_msg(address, ctx);
      bubblemap_msg(address, ctx);
      break;
  }
});

bot.launch();
