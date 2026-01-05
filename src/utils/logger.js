const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "../../logs/activity.log");

// Ensure logs directory exists
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

function logCommand(user, command) {
  const timestamp = new Date().toISOString();
  const userInfo = user.username
    ? `@${user.username} (${user.id})`
    : `ID: ${user.id}`;
  const logEntry = `[${timestamp}] User: ${userInfo} | Command: ${command}\n`;

  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) console.error("Failed to write to log file:", err);
  });

  // Also log to console for realtime feedback
  console.log(`[LOG] ${userInfo} executed: ${command}`);
}

module.exports = { logCommand };
