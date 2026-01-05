const { exec } = require("child_process");
const { escapeHTML } = require("../utils/formatting");
const { sendLargeMessage } = require("../utils/messaging");

async function restart(ctx) {
  await ctx.reply(ctx.t("restarting"));
  setTimeout(() => {
    exec("sudo reboot", (error) => {
      if (error) {
        ctx.reply(`${ctx.t("restart_fail")} ${error.message}`);
      }
    });
  }, 2000);
}

async function processes(ctx) {
  const command = "ps aux --sort=-%cpu | head -10";
  exec(command, (error, stdout) => {
    if (error) return ctx.reply(`❌ Error: ${error.message}`);
    const title = ctx.t("processes_title");
    sendLargeMessage(ctx, escapeHTML(stdout), title);
  });
}

function network(ctx) {
  exec("ifconfig", (error, stdout) => {
    if (error) {
      exec("ip addr show", (error2, stdout2) => {
        if (error2) {
          ctx.reply(`❌ Error: ${error2.message}`);
        } else {
          const title = ctx.t("network_title");
          sendLargeMessage(ctx, escapeHTML(stdout2), title);
        }
      });
    } else {
      const title = ctx.t("network_title");
      sendLargeMessage(ctx, escapeHTML(stdout), title);
    }
  });
}

function disk(ctx) {
  exec("df -h", (err, stdout) => {
    if (err) return ctx.reply(`❌ Error: ${err.message}`);
    const title = ctx.t("disk_title");
    sendLargeMessage(ctx, escapeHTML(stdout), title);
  });
}

function logs(ctx) {
  exec("tail -50 /var/log/syslog", (error, stdout) => {
    if (error) {
      exec("journalctl -n 50", (error2, stdout2) => {
        if (error2) {
          ctx.reply(`${ctx.t("logs_error")} ${error2.message}`);
        } else {
          const title = ctx.t("logs_title");
          sendLargeMessage(ctx, escapeHTML(stdout2), title);
        }
      });
    } else {
      const title = ctx.t("logs_title");
      sendLargeMessage(ctx, escapeHTML(stdout), title);
    }
  });
}

module.exports = {
  restart,
  processes,
  network,
  disk,
  logs,
};
