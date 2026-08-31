const { logCommand } = require("../utils/logger");

function getCommandName(text) {
  if (typeof text !== "string") return null;

  const firstToken = text.trim().split(/\s+/, 1)[0];
  if (!firstToken.startsWith("/")) return null;

  // Normalize commands addressed to a bot, such as /status@my_bot.
  return firstToken.split("@", 1)[0];
}

async function loggingMiddleware(ctx, next) {
  const command = getCommandName(ctx.message?.text);
  if (command && ctx.from) {
    logCommand(ctx.from, command);
  }

  return next();
}

module.exports = { loggingMiddleware, getCommandName };
