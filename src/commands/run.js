const { exec } = require("child_process");
const util = require("util");
const fs = require("fs");
const path = require("path");
const { escapeHTML } = require("../utils/formatting");
const { sendLargeMessage } = require("../utils/messaging");
const { getUserLanguage } = require("../utils/userSettings");
const {
  COMMAND_TIMEOUT_MS,
  COMMAND_MAX_BUFFER_BYTES,
} = require("../config/config");

const execPromise = util.promisify(exec);

async function executeShellCommand(command) {
  try {
    const { stdout, stderr } = await execPromise(command, {
      timeout: COMMAND_TIMEOUT_MS,
      maxBuffer: COMMAND_MAX_BUFFER_BYTES,
      killSignal: "SIGTERM",
    });
    return { stdout, stderr };
  } catch (error) {
    return { stdout: error.stdout, stderr: error.stderr, error };
  }
}

async function handleExecutionResult(ctx, result) {
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
        `⚠️ stderr (truncated):\n<pre>${safeStderr.substring(0, 3500)}...</pre>`,
        { parse_mode: "HTML" }
      );
    } else {
      await ctx.reply(`⚠️ stderr:\n<pre>${safeStderr}</pre>`, {
        parse_mode: "HTML",
      });
    }
  }

  if (stdout) {
    await sendLargeMessage(ctx, stdout);
  } else if (!error && !stderr) {
    await ctx.reply(ctx.t("exec_success"));
  }
}

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
    let text = locales[lang][key] || locales.en[key] || key;
    Object.keys(params).forEach((param) => {
      text = text.replace(`\${${param}}`, params[param]);
    });
    return text;
  };
}

async function runConversation(conversation, ctx) {
  const t = getT(ctx.from.id);

  await ctx.reply(t("enter_command"), { parse_mode: "HTML" });

  const response = await conversation.wait();
  if (!response.message?.text) {
    await ctx.reply(t("invalid_text"));
    return;
  }

  const command = response.message.text;
  if (command.startsWith("/")) {
    await ctx.reply(t("exec_cancel"));
    return;
  }

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

  const result = await conversation.external(() => executeShellCommand(command));
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
        `⚠️ stderr (truncated):\n<pre>${safeStderr.substring(0, 3500)}...</pre>`,
        { parse_mode: "HTML" }
      );
    } else {
      await ctx.reply(`⚠️ stderr:\n<pre>${safeStderr}</pre>`, {
        parse_mode: "HTML",
      });
    }
  }

  if (stdout) {
    await sendLargeMessage(ctx, stdout);
  } else if (!error && !stderr) {
    await ctx.reply(t("exec_success"));
  }
}

async function runCommand(ctx) {
  const command = ctx.match;

  if (typeof command === "string" && command.trim().length > 0) {
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
    await handleExecutionResult(ctx, result);
  } else {
    await ctx.conversation.enter("runConversation");
  }
}

module.exports = {
  runCommand,
  runConversation,
  executeShellCommand,
};
