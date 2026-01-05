const {
  addAdmin,
  removeAdmin,
  getAllAdmins,
  ENV_ADMINS,
} = require("../utils/adminManager");
const { ALLOW_ADD_ADMINS } = require("../config/config");
const { InlineKeyboard } = require("grammy");

// Conversation for Adding Admin
async function addAdminConversation(conversation, ctx) {
  if (!ALLOW_ADD_ADMINS) {
    return ctx.reply("Feature disabled.");
  }

  await ctx.reply(ctx.t("admin_add_prompt"), { parse_mode: "HTML" });

  const response = await conversation.wait();
  let newAdminId;

  if (response.message?.forward_from) {
    newAdminId = response.message.forward_from.id.toString();
  } else if (response.message?.text) {
    newAdminId = response.message.text.trim();
  } else {
    return ctx.reply(ctx.t("invalid_text"));
  }

  if (!/^\d+$/.test(newAdminId)) {
    return ctx.reply(ctx.t("admin_invalid_id"));
  }

  if (addAdmin(newAdminId)) {
    await ctx.reply(
      `${ctx.t("admin_add_success")} <code>${newAdminId}</code>`,
      { parse_mode: "HTML" }
    );
  } else {
    await ctx.reply(ctx.t("admin_exists"));
  }
}

// Admin Panel Command
async function adminPanelCommand(ctx) {
  const admins = getAllAdmins();
  const envAdmins = ENV_ADMINS || [];

  let text = `${ctx.t("admin_panel")}\n\n`;
  const kb = new InlineKeyboard();

  for (const adminId of admins) {
    const isEnv = envAdmins.includes(adminId);
    const label = isEnv ? `🔒 ${adminId}` : `👤 ${adminId}`;

    kb.text(label, "noop");
    if (!isEnv && ALLOW_ADD_ADMINS) {
      kb.text(ctx.t("remove_btn"), `remove_admin:${adminId}`);
    }
    kb.row();
  }

  if (ALLOW_ADD_ADMINS) {
    kb.row().text(ctx.t("add_admin_btn"), "add_admin_flow");
  }

  await ctx.reply(text, { reply_markup: kb, parse_mode: "HTML" });
}

// Callback Handler
async function handleAdminActions(ctx) {
  const data = ctx.callbackQuery.data;

  if (data === "noop") return ctx.answerCallbackQuery();

  if (data === "add_admin_flow") {
    await ctx.answerCallbackQuery();
    return ctx.conversation.enter("addAdminConversation");
  }

  if (data.startsWith("remove_admin:")) {
    if (!ALLOW_ADD_ADMINS) {
      return ctx.answerCallbackQuery({ text: "❌ Disabled", show_alert: true });
    }

    const targetId = data.split(":")[1];

    if (targetId === ctx.from.id.toString()) {
      return ctx.answerCallbackQuery({
        text: ctx.t("admin_remove_self"),
        show_alert: true,
      });
    }

    if (removeAdmin(targetId)) {
      await ctx.answerCallbackQuery({ text: ctx.t("admin_remove_success") });
      // Refresh the panel
      const admins = getAllAdmins();
      const envAdmins = ENV_ADMINS || [];
      const kb = new InlineKeyboard();
      for (const adminId of admins) {
        const isEnv = envAdmins.includes(adminId);
        kb.text(isEnv ? `🔒 ${adminId}` : `👤 ${adminId}`, "noop");
        if (!isEnv) kb.text(ctx.t("remove_btn"), `remove_admin:${adminId}`);
        kb.row();
      }
      if (ALLOW_ADD_ADMINS)
        kb.row().text(ctx.t("add_admin_btn"), "add_admin_flow");

      await ctx.editMessageReplyMarkup({ reply_markup: kb });
    } else {
      await ctx.answerCallbackQuery({
        text: ctx.t("admin_remove_fail"),
        show_alert: true,
      });
    }
  }
}

module.exports = {
  adminPanelCommand,
  addAdminConversation,
  handleAdminActions,
};
