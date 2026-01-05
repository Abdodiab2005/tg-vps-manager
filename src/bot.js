const { Bot, session, InlineKeyboard } = require("grammy");
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");
const { TOKEN } = require("./config/config");
const { authMiddleware } = require("./middlewares/auth");
const { loggingMiddleware } = require("./middlewares/logging");
const { i18nMiddleware } = require("./middlewares/i18n");

// Import commands
const startCommand = require("./commands/start");
const statusCommand = require("./commands/status");
const { runCommand, runConversation } = require("./commands/run");
const systemCommands = require("./commands/system");
const {
  adminPanelCommand,
  addAdminConversation,
  handleAdminActions,
} = require("./commands/admin");
const {
  languageCommand,
  handleLanguageCallback,
} = require("./commands/language");

if (!TOKEN) {
  throw new Error("TOKEN must be provided in environment variables");
}

const bot = new Bot(TOKEN);

// Middleware
bot.use(session({ initial: () => ({}) }));
bot.use(i18nMiddleware); // Add i18n logic early so context is enriched
bot.use(conversations());

bot.use(loggingMiddleware);
bot.use(authMiddleware);

// Register Conversations

// Register Conversations
bot.use(createConversation(runConversation));
bot.use(createConversation(addAdminConversation));

// Set Default Commands (for menu button)
bot.api
  .setMyCommands([
    { command: "start", description: "Main Menu" },
    { command: "status", description: "System Status" },
    { command: "run", description: "Execute Command" },
    { command: "language", description: "Change Language" },
    { command: "processes", description: "Top Processes" },
    { command: "network", description: "Network Info" },
    { command: "disk", description: "Disk Usage" },
    { command: "logs", description: "System Logs" },
    { command: "admins", description: "Manage Admins" },
  ])
  .catch((e) => console.error("Failed to set commands:", e));

// Commands
bot.command("start", startCommand);
bot.command("status", statusCommand);
bot.command("run", runCommand);
bot.command("language", languageCommand);

bot.command("restart", systemCommands.restart);
bot.command("processes", systemCommands.processes);
bot.command("network", systemCommands.network);
bot.command("disk", systemCommands.disk);
bot.command("logs", systemCommands.logs);

// Admin Management
bot.command("admins", adminPanelCommand);
bot.command("addadmin", async (ctx) =>
  ctx.conversation.enter("addAdminConversation")
);

// Callbacks
bot.on("callback_query:data", async (ctx, next) => {
  // We have different handlers for different callbacks
  const data = ctx.callbackQuery.data;
  if (data.startsWith("set_lang_")) {
    return handleLanguageCallback(ctx);
  }
  if (
    data === "noop" ||
    data === "add_admin_flow" ||
    data.startsWith("remove_admin:")
  ) {
    return handleAdminActions(ctx);
  }
  await next();
});

// Error handling
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof Error) {
    console.error(e.message);
  } else {
    console.error(e);
  }
  try {
    if (ctx.chat) {
      // Use fallback text if t() not available for some reason, or user t()
      const text = ctx.t ? ctx.t("exec_error") : "❌ Error";
      ctx.reply(text).catch(() => {});
    }
  } catch (_) {}
});

module.exports = bot;
