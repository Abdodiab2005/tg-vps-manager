const { isAdmin } = require("../utils/adminManager");

async function authMiddleware(ctx, next) {
  const chatId = ctx.chat?.id;

  if (isAdmin(chatId)) {
    return next();
  }

  // If not authorized
  // We can add a small cooldown or simply reply
  await ctx.reply(ctx.t("unauthorized"));
}

module.exports = { authMiddleware };
