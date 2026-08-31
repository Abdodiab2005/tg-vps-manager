require("dotenv").config();

const { ENV_ADMINS } = require("./utils/adminManager");

if (ENV_ADMINS.length === 0) {
  throw new Error(
    "AUTHORIZED_CHAT_ID must contain at least one numeric Telegram user ID"
  );
}

const bot = require("./bot");

console.log("🤖 TG VPS Manager is running.");
console.log(`🔐 Authorized administrators: ${ENV_ADMINS.length}`);

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

bot.start();
