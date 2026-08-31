const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "../../logs/activity.log");

if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

function normalizeCommand(command) {
  return String(command || "unknown").trim().split(/\s+/, 1)[0];
}

function logCommand(user, command) {
  const timestamp = new Date().toISOString();
  const userInfo = user.username
    ? `@${user.username} (${user.id})`
    : `ID: ${user.id}`;
  const commandName = normalizeCommand(command);
  const logEntry = `[${timestamp}] User: ${userInfo} | Command: ${commandName}\n`;

  fs.appendFile(LOG_FILE, logEntry, (error) => {
    if (error) console.error("Failed to write to log file:", error);
  });

  console.log(`[LOG] ${userInfo} executed: ${commandName}`);
}

module.exports = { logCommand, normalizeCommand };
