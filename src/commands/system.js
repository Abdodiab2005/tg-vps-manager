const { exec } = require("child_process");
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
  exec("ps aux --sort=-%cpu | head -10", (error, stdout) => {
    if (error) return ctx.reply(`❌ Error: ${error.message}`);
    sendLargeMessage(ctx, stdout, ctx.t("processes_title"));
  });
}

function network(ctx) {
  exec("ifconfig", (error, stdout) => {
    if (error) {
      exec("ip addr show", (fallbackError, fallbackOutput) => {
        if (fallbackError) {
          ctx.reply(`❌ Error: ${fallbackError.message}`);
        } else {
          sendLargeMessage(ctx, fallbackOutput, ctx.t("network_title"));
        }
      });
    } else {
      sendLargeMessage(ctx, stdout, ctx.t("network_title"));
    }
  });
}

function disk(ctx) {
  exec("df -h", (error, stdout) => {
    if (error) return ctx.reply(`❌ Error: ${error.message}`);
    sendLargeMessage(ctx, stdout, ctx.t("disk_title"));
  });
}

function logs(ctx) {
  exec("tail -50 /var/log/syslog", (error, stdout) => {
    if (error) {
      exec("journalctl -n 50", (fallbackError, fallbackOutput) => {
        if (fallbackError) {
          ctx.reply(`${ctx.t("logs_error")} ${fallbackError.message}`);
        } else {
          sendLargeMessage(ctx, fallbackOutput, ctx.t("logs_title"));
        }
      });
    } else {
      sendLargeMessage(ctx, stdout, ctx.t("logs_title"));
    }
  });
}

module.exports = { restart, processes, network, disk, logs };
