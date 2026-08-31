const { isAdmin } = require("../utils/adminManager");

async function authMiddleware(ctx, next) {
  const isPrivateChat = ctx.chat?.type === "private";
  const userId = ctx.from?.id;

  if (isPrivateChat && isAdmin(userId)) {
    return next();
  }

  // Do not advertise a privileged administration bot inside group chats.
  if (isPrivateChat && ctx.reply) {
    await ctx.reply(ctx.t("unauthorized"));
  }
}

module.exports = { authMiddleware };
