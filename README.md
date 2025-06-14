# Solana Token Lens Bot

A Telegram bot that provides deep insights into any Solana token via commands like `/rug_check`, `/bubblemap`, and `/token`. Add it to your group or use it 1-on-1 to instantly get price, rug checks, and bubblemap screenshots.

## 📦 Setup

### 1. Clone the repo

```bash
git clone https://github.com/thrishank/token-scan
cd token-scan
```

### 2. Install dependencies and create a `img` dir to store screenshots

```bash
pnpm install
mkdir img
```

### Create .env file

```
BOT_TOKEN=your_telegram_bot_token
LOCATION=
```

### Build and start

```bash
pnpm build
pnpm start
```

## 🚀 Features

- 📈 **Token Price & Info**
  Get current price, symbol, volume, and logo of any Solana token.

- **Bubblemap**
  Explore a visual representation of token holder connections and how wallets are clustered.

- **Rug Check**  
  Analyze a token to identify potential red flags like unlocked LP tokens, high ownership concentration, etc.

- Token Price Alerts

- Token Ticker Support no need the token mint address

- Bot can be added to groups or used in 1-on-1 chats.

## 🧾 Available Commands

- `/start` – Displays a welcome message and a list of available commands.
- `/price` – Shows token price details.
- `/rug` – Gives rug analysis of the token.
- `/bubblemap` – Shares a visual bubble map of token holders.
- `/token` - above all
