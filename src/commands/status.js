const { getSystemInfo } = require("../utils/system");
const { escapeHTML } = require("../utils/formatting");

function safe(value) {
  return escapeHTML(String(value ?? "N/A"));
}

async function statusCommand(ctx) {
  try {
    const systemInfo = await getSystemInfo();
    const statusMessage = `
${ctx.t("status_title")}

${ctx.t("status_system")}
${ctx.t("status_hostname")} <pre>${safe(systemInfo.hostname)}</pre>
${ctx.t("status_platform")} <pre>${safe(systemInfo.platform)} ${safe(systemInfo.arch)}</pre>
${ctx.t("status_uptime")} <pre>${safe(systemInfo.uptime)}</pre>

${ctx.t("status_cpu_title")}
${ctx.t("status_cores")} <pre>${safe(systemInfo.cpuCount)}</pre>
${ctx.t("status_model")} <pre>${safe(systemInfo.cpuModel)}</pre>

${ctx.t("status_memory")}
${ctx.t("status_total")} <pre>${safe(systemInfo.totalMemory)}</pre>
${ctx.t("status_used")} <pre>${safe(systemInfo.usedMemory)}</pre>
${ctx.t("status_free")} <pre>${safe(systemInfo.freeMemory)}</pre>
${ctx.t("status_usage")} <pre>${safe(systemInfo.memoryUsage)}</pre>

${ctx.t("status_load")}
📊 1min: <pre>${safe(systemInfo.loadAverage["1min"])}</pre>
📊 5min: <pre>${safe(systemInfo.loadAverage["5min"])}</pre>
📊 15min: <pre>${safe(systemInfo.loadAverage["15min"])}</pre>

${ctx.t("status_disk")}
${ctx.t("status_total")} <pre>${safe(systemInfo.disk.total)}</pre>
${ctx.t("status_used")} <pre>${safe(systemInfo.disk.used)}</pre>
${ctx.t("status_free")} <pre>${safe(systemInfo.disk.available)}</pre>
${ctx.t("status_usage")} <pre>${safe(systemInfo.disk.percentage)}</pre>

${ctx.t("status_network")}
${ctx.t("status_network_interfaces")} <pre>${safe(systemInfo.networkInterfaces.join(", "))}</pre>
    `;

    await ctx.reply(statusMessage, { parse_mode: "HTML" });
  } catch (error) {
    await ctx.reply(`❌ Error: ${error.message}`);
  }
}

module.exports = statusCommand;
