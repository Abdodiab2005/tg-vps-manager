async function startCommand(ctx) {
  await ctx.reply(ctx.t("welcome"), { parse_mode: "HTML" });
}

module.exports = startCommand;
