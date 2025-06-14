import { Builder, By, until, WebDriver } from "selenium-webdriver";
import * as fs from "fs";
import { Options } from "selenium-webdriver/chrome";
import * as path from "path";
import { Context } from "telegraf";

require("dotenv").config();
const location = process.env.LOCATION;

const CHROME_OPTIONS = [
  "--headless",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--remote-debugging-port=9222",
];

const TIMEOUTS = {
  PAGE_LOAD: 5000,
  SVG_WAIT: 8000,
  SVG_RESIZE: 2000,
};

async function createDriver(): Promise<WebDriver> {
  const chromeOptions = new Options();
  CHROME_OPTIONS.forEach((option) => chromeOptions.addArguments(option));

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();

  await driver.manage().window().setRect({ width: 1920, height: 1080 });
  return driver;
}

async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.promises.access(dirPath);
  } catch {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }
}

export async function screenshot(address: string): Promise<string | null> {
  let driver: WebDriver | null = null;

  try {
    driver = await createDriver();

    await driver.get(`https://app.bubblemaps.io/sol/token/${address}`);
    await driver.sleep(TIMEOUTS.PAGE_LOAD);

    await driver.wait(until.elementLocated(By.id("svg")), TIMEOUTS.SVG_WAIT);
    const svgElement = await driver.findElement(By.id("svg"));

    await driver.executeScript(`
      const svg = document.getElementById("svg");
      if (svg) {
        svg.setAttribute("width", "2000px");
        svg.setAttribute("height", "2000px");
      }
    `);

    await driver.sleep(TIMEOUTS.SVG_RESIZE);

    const screenshot = await svgElement.takeScreenshot();
    const imgDir = path.resolve("img");
    await ensureDir(imgDir);

    const filePath = path.join(imgDir, `${address}.png`);
    await fs.promises.writeFile(filePath, screenshot, "base64");

    console.log(`✅ Screenshot saved at: ${filePath}`);
    return filePath;
  } catch (err) {
    console.error("❌ Error taking screenshot:", err);
    return null;
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

export async function bubblemap_msg(address: string, ctx: Context) {
  const message = await ctx.reply(
    "⏳ Generating the bubblemap, please wait...",
  );
  const photoSource = `${location}/${address}.png`;
  if (!fs.existsSync(photoSource)) {
    try {
      await screenshot(address);
    } catch {
      return ctx.reply(
        "❌ Error generating the bubblemap. Please ensure it's a valid mint address and try again.",
      );
    }
  }

  await ctx.deleteMessage(message.message_id);
  return ctx.replyWithPhoto({ source: photoSource });
}
