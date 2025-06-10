import { Context } from "telegraf";

interface TokenCheck {
  tokenProgram: string;
  tokenType: string;
  risks: Array<{
    name: string;
    level: string;
    description: string;
    score: number;
    value: string | number;
  }>;
  score: number;
}

const BASE_URL = "https://api.rugcheck.xyz/v1";

async function rug_check(mint: string): Promise<TokenCheck | null> {
  try {
    const response = await fetch(`${BASE_URL}/tokens/${mint}/report/summary`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error: any) {
    console.error(
      `Error fetching report summary for token ${mint}:`,
      error.message,
    );
    return null;
  }
}

export async function rug_check_msg(address: string, ctx: Context) {
  const data = await rug_check(address);
  const rug_score = data?.score;
  const rugScoreDot = rug_score && rug_score > 300 ? "🔴" : "🟢";

  const rugCheckMessage =
    `🔍 <b>Rug Check Result</b>\n\n` +
    `Overall Score: ${rugScoreDot} ${data!.score}\n\n` +
    `⚠️ <b>Risks Identified:</b>\n` +
    (data!.risks.length > 0
      ? data!.risks
          .map(
            (risk, index) =>
              `${index + 1}. <b>${risk.name}</b>\n` +
              `• <b>Level:</b> ${risk.level === "warn" ? "⚠️ Warning" : risk.level}\n` +
              `• <b>Value:</b> ${risk.value || "N/A"}\n` +
              `• <b>Description:</b> ${risk.description}`,
          )
          .join("\n\n")
      : "✅ No major risks detected!");
  return ctx.reply(rugCheckMessage, { parse_mode: "HTML" });
}
