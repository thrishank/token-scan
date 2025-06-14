import { Context } from "telegraf";

async function token_price(address: string) {
  try {
    const res = await fetch(`https://lite-api.jup.ag/price/v2?ids=${address}`);
    const json = await res.json();
    return json.data[address]?.price;
  } catch (err) {
    console.error(err);
  }
}

export async function token_price_msg(address: string, ctx: Context) {
  const price = await token_price(address);

  if (!price) {
    return ctx.reply("❌ Failed to fetch token price.", { parse_mode: "HTML" });
  }

  const formattedPrice = formatPrice(price);

  const message =
    `💰 <b>Token Price</b>\n\n` +
    `<b>Address:</b> <code>${address}</code>\n` +
    `<b>Price:</b> ${formattedPrice} USD`;
  return ctx.reply(message, { parse_mode: "HTML" });
}

function formatPrice(raw: string | number): string {
  const num = typeof raw === "string" ? parseFloat(raw) : raw;

  // Format large numbers with K/M/B
  const formatWithSuffix = (n: number) => {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
    if (n > 1) return n.toFixed(2);
    return n.toString();
  };

  if (num < 1) return `$${num.toFixed(2)}`;
  return `$${formatWithSuffix(num)}`;
}
