const { InlineKeyboard } = require("grammy");
const { setUserLanguage } = require("../utils/userSettings");

async function languageCommand(ctx) {
  const kb = new InlineKeyboard()
    .text("English 🇺🇸", "set_lang_en")
    .text("العربية 🇸🇦", "set_lang_ar");

  await ctx.reply(ctx.t("lang_select"), {
    reply_markup: kb,
    parse_mode: "HTML",
  });
}

async function handleLanguageCallback(ctx) {
  const data = ctx.callbackQuery.data;

  if (data === "set_lang_en") {
    setUserLanguage(ctx.from.id, "en");
    // Just for immediate feedback, we might want to reload context lang or just reply manually
    // Since middleware ran already, ctx.t is stale for THIS request.
    // We'll reply hardcoded or re-fetch logic for this specific reply.
    // Better: use the new lang instantly.
    await ctx.answerCallbackQuery();
    await ctx.editMessageText("✅ Language changed to English successfully.", {
      parse_mode: "HTML",
    });
  } else if (data === "set_lang_ar") {
    setUserLanguage(ctx.from.id, "ar");
    await ctx.answerCallbackQuery();
    await ctx.editMessageText("✅ تم تغيير اللغة إلى العربية بنجاح.", {
      parse_mode: "HTML",
    });
  }
}

module.exports = { languageCommand, handleLanguageCallback };
