require("dotenv").config(); // Load environment variables first
const bot = require("./bot");
const { AUTHORIZED_CHAT_ID } = require("./config/config");

console.log("🤖 تم تشغيل بوت إدارة VPS بنجاح (Grammy)!");
console.log(`📱 Chat ID المسموح: ${AUTHORIZED_CHAT_ID}`);

// Handle graceful shutdown
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

bot.start();
