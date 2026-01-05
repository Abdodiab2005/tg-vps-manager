const { logCommand } = require("../utils/logger");

async function loggingMiddleware(ctx, next) {
  // Only log messages that contain commands or text
  if (ctx.message && ctx.message.text) {
    // Check if it's a command
    if (ctx.message.text.startsWith("/")) {
      logCommand(ctx.from, ctx.message.text);
    }
  }
  return next();
}

module.exports = { loggingMiddleware };
