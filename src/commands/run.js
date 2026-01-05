const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const { escapeHTML } = require("../utils/formatting");
const { sendLargeMessage } = require("../utils/messaging");

// Helper to execute command logic with Promise
async function executeShellCommand(command) {
  try {
    const { stdout, stderr } = await execPromise(command);
    return { stdout, stderr };
  } catch (error) {
    return { stdout: error.stdout, stderr: error.stderr, error: error };
  }
}

// Handler that sends replies based on execution result
async function handleExecutionResult(ctx, command, result) {
  const { stdout, stderr, error } = result;

  if (error) {
    await ctx.reply(
      `${ctx.t("exec_error")}\n<pre>${escapeHTML(error.message)}</pre>`,
      { parse_mode: "HTML" }
    );
  }

  if (stderr) {
    const safeStderr = escapeHTML(stderr);
    if (safeStderr.length > 3500) {
      await ctx.reply(
        `⚠️ stderr (truncated):\n<pre>${safeStderr.substring(
          0,
          3500
        )}...</pre>`,
        { parse_mode: "HTML" }
      );
    } else {
      await ctx.reply(`⚠️ stderr:\n<pre>${safeStderr}</pre>`, {
        parse_mode: "HTML",
      });
    }
  }

  if (stdout) {
    await sendLargeMessage(ctx, escapeHTML(stdout));
  } else if (!error && !stderr) {
    await ctx.reply(ctx.t("exec_success"));
  }
}

const { getUserLanguage } = require("../utils/userSettings");
const fs = require("fs");
const path = require("path");

// Load locales once
const locales = {
  en: JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../locales/en.json"), "utf-8")
  ),
  ar: JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../locales/ar.json"), "utf-8")
  ),
};

function getT(userId) {
  const lang = getUserLanguage(userId);
  return (key, params = {}) => {
    let text = locales[lang][key] || locales["en"][key] || key;
    if (params) {
      Object.keys(params).forEach((param) => {
        text = text.replace(`\${${param}}`, params[param]);
      });
    }
    return text;
  };
}

async function runConversation(conversation, ctx) {
  // Re-create translations helper because ctx.t is lost on replay/restart
  const t = getT(ctx.from.id);

  await ctx.reply(t("enter_command"), {
    parse_mode: "HTML",
  });

  const response = await conversation.wait();
  if (!response.message?.text) {
    await ctx.reply(t("invalid_text"));
    return;
  }

  const command = response.message.text;

  // Check cancellation
  if (command.startsWith("/")) {
    await ctx.reply(t("exec_cancel"));
    return;
  }

  // Security check (synchronous)
  const { isCommandBlocked } = require("../utils/security");
  const blockedTerm = isCommandBlocked(command);
  if (blockedTerm) {
    await ctx.reply(
      `${t("exec_blocked")} <code>${escapeHTML(blockedTerm)}</code>`,
      { parse_mode: "HTML" }
    );
    return;
  }

  await ctx.reply(`${t("executing")}<pre>${escapeHTML(command)}</pre>`, {
    parse_mode: "HTML",
  });

  const result = await conversation.external(() => {
    return executeShellCommand(command);
  });

  // Handle result manually to use 't'
  const { stdout, stderr, error } = result;

  if (error) {
    await ctx.reply(
      `${t("exec_error")}\n<pre>${escapeHTML(error.message)}</pre>`,
      { parse_mode: "HTML" }
    );
  }

  if (stderr) {
    const safeStderr = escapeHTML(stderr);
    if (safeStderr.length > 3500) {
      await ctx.reply(
        `⚠️ stderr (truncated):\n<pre>${safeStderr.substring(
          0,
          3500
        )}...</pre>`,
        { parse_mode: "HTML" }
      );
    } else {
      await ctx.reply(`⚠️ stderr:\n<pre>${safeStderr}</pre>`, {
        parse_mode: "HTML",
      });
    }
  }

  if (stdout) {
    await sendLargeMessage(ctx, escapeHTML(stdout));
  } else if (!error && !stderr) {
    await ctx.reply(t("exec_success"));
  }
}

// Logic for immediate /run command (not conversation)
async function runCommand(ctx) {
  const command = ctx.match;

  if (typeof command === "string" && command.trim().length > 0) {
    // Security Check
    const { isCommandBlocked } = require("../utils/security");
    const blockedTerm = isCommandBlocked(command);
    if (blockedTerm) {
      return ctx.reply(
        `${ctx.t("exec_blocked")} <code>${escapeHTML(blockedTerm)}</code>`,
        { parse_mode: "HTML" }
      );
    }

    await ctx.reply(`${ctx.t("executing")}<pre>${escapeHTML(command)}</pre>`, {
      parse_mode: "HTML",
    });

    const result = await executeShellCommand(command);
    await handleExecutionResult(ctx, command, result);
  } else {
    await ctx.conversation.enter("runConversation");
  }
}

module.exports = {
  runCommand,
  runConversation,
};
