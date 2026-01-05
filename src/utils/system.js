const { exec } = require("child_process");
const os = require("os");
const { formatMemory } = require("./formatting");
const util = require("util");
const execPromise = util.promisify(exec);

async function getDiskUsage() {
  try {
    const { stdout } = await execPromise("df -h /");
    const lines = stdout.split("\n");
    const diskInfo = lines[1].split(/\s+/);
    return {
      total: diskInfo[1],
      used: diskInfo[2],
      available: diskInfo[3],
      percentage: diskInfo[4],
    };
  } catch (error) {
    return { error: "غير متوفر" };
  }
}

async function getSystemInfo() {
  const cpus = os.cpus();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const loadAvg = os.loadavg();
  const networkInterfaces = os.networkInterfaces();

  const diskInfo = await getDiskUsage();

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    uptime: Math.floor(os.uptime() / 3600) + " ساعة",
    cpuCount: cpus.length,
    cpuModel: cpus[0].model,
    totalMemory: formatMemory(totalMemory),
    usedMemory: formatMemory(usedMemory),
    freeMemory: formatMemory(freeMemory),
    memoryUsage: ((usedMemory / totalMemory) * 100).toFixed(2) + "%",
    loadAverage: {
      "1min": loadAvg[0].toFixed(2),
      "5min": loadAvg[1].toFixed(2),
      "15min": loadAvg[2].toFixed(2),
    },
    disk: diskInfo,
    networkInterfaces: Object.keys(networkInterfaces),
  };
}

module.exports = {
  getSystemInfo,
  execPromise,
};
