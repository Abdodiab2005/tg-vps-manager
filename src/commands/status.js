const { getSystemInfo } = require("../utils/system");

async function statusCommand(ctx) {
  try {
    const systemInfo = await getSystemInfo();

    const statusMessage = `
${ctx.t("status_title")}

${ctx.t("status_system")}
${ctx.t("status_hostname")} <pre>${systemInfo.hostname}</pre>
${ctx.t("status_platform")} <pre>${systemInfo.platform} ${systemInfo.arch}</pre>
${ctx.t("status_uptime")} <pre>${systemInfo.uptime}</pre>

${ctx.t("status_cpu_title")}
${ctx.t("status_cores")} <pre>${systemInfo.cpuCount}</pre>
${ctx.t("status_model")} <pre>${systemInfo.cpuModel}</pre>

${ctx.t("status_memory")}
${ctx.t("status_total")} <pre>${systemInfo.totalMemory}</pre>
${ctx.t("status_used")} <pre>${systemInfo.usedMemory}</pre>
${ctx.t("status_free")} <pre>${systemInfo.freeMemory}</pre>
${ctx.t("status_usage")} <pre>${systemInfo.memoryUsage}</pre>

${ctx.t("status_load")}
📊 1min: <pre>${systemInfo.loadAverage["1min"]}</pre>
📊 5min: <pre>${systemInfo.loadAverage["5min"]}</pre>
📊 15min: <pre>${systemInfo.loadAverage["15min"]}</pre>

${ctx.t("status_disk")}
${ctx.t("status_total")} <pre>${systemInfo.disk.total || "N/A"}</pre>
${ctx.t("status_used")} <pre>${systemInfo.disk.used || "N/A"}</pre>
${ctx.t("status_free")} <pre>${systemInfo.disk.available || "N/A"}</pre>
${ctx.t("status_usage")} <pre>${systemInfo.disk.percentage || "N/A"}</pre>

${ctx.t("status_network")}
${ctx.t("status_network_interfaces")} <pre>${systemInfo.networkInterfaces.join(
      ", "
    )}</pre>
        `;

    await ctx.reply(statusMessage, { parse_mode: "HTML" });
  } catch (error) {
    await ctx.reply(`❌ Error: ${error.message}`);
  }
}

module.exports = statusCommand;
