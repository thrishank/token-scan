import { Context } from "telegraf";
// import fetch from "node-fetch";

async function token_price(address: string) {
  try {
    const res = await fetch(`https://lite-api.jup.ag/price/v2?ids=${address}`);
    const json = await res.json();
    // @ts-ignore
    return json.data[address]?.price;
  } catch (err) {
    console.error("Error fetching price:", err);
  }
}

export async function token_info(address: string) {
  try {
    const res = await fetch(
      `https://lite-api.jup.ag/tokens/v1/token/${address}`,
    );
    const json = await res.json();
    return json;
  } catch (err) {
    console.error("Error fetching token info:", err);
    return null;
  }
}

export async function token_price_msg(address: string, ctx: Context) {
  const reply = await ctx.reply("⏳ fetching the current price ...");

  const [price, info] = await Promise.all([
    token_price(address),
    token_info(address),
  ]);

  if (!price || !info) {
    await ctx.deleteMessage(reply.message_id);
    return ctx.reply("❌ Failed to fetch token price.", { parse_mode: "HTML" });
  }

  const formattedPrice = formatPrice(price);
  const formattedVolume = formatVolume(info.daily_volume || 0);

  const message =
    `💰 <b>Token Info</b>\n\n` +
    `<b>Name:</b> ${info.name} (${info.symbol})\n` +
    `<b>Address:</b> <code>${address}</code>\n` +
    `<b>Price:</b> ${formattedPrice} \n` +
    `<b>Daily Volume:</b> ${formattedVolume}\n`;

  await ctx.deleteMessage(reply.message_id);

  const logoURL = info.logoURI;

  if (!logoURL) {
    return ctx.reply(message, { parse_mode: "HTML" });
  }

  try {
    const head = await fetch(logoURL, { method: "HEAD" });
    const contentType = head.headers.get("content-type");

    // Try sending URL directly if it's a valid image
    if (contentType?.startsWith("image/")) {
      try {
        return await ctx.replyWithPhoto(logoURL, {
          caption: message,
          parse_mode: "HTML",
        });
      } catch (err) {
        console.warn("Direct image URL failed, will fallback to buffer:", err);
      }
    }

    // Otherwise fetch and send as buffer
    const res = await fetch(logoURL);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const actualType = res.headers.get("content-type");

    if (!actualType?.startsWith("image/")) {
      throw new Error("Downloaded content is not an image");
    }

    return await ctx.replyWithPhoto(
      { source: buffer },
      {
        caption: message,
        parse_mode: "HTML",
      },
    );
  } catch (err) {
    console.error("Failed to send image, falling back to text:", err);
    return ctx.reply(message, { parse_mode: "HTML" });
  }
}

function formatPrice(raw: string | number): string {
  const num = typeof raw === "string" ? parseFloat(raw) : raw;

  const formatWithSuffix = (n: number) => {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
    if (n > 1) return n.toFixed(2);
    return n.toString();
  };

  return `$${formatWithSuffix(num)}`;
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000)
    return `$${(volume / 1_000_000_000).toFixed(2)}B`;
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(2)}M`;
  if (volume >= 1_000) return `$${(volume / 1_000).toFixed(2)}K`;
  return `$${volume.toFixed(2)}`;
}
