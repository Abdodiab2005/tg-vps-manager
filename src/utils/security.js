const fs = require("fs");
const path = require("path");

const BLOCKED_FILE = path.join(__dirname, "../../data/blocked_commands.json");

// Ensure file exists
if (!fs.existsSync(BLOCKED_FILE)) {
  fs.writeFileSync(BLOCKED_FILE, JSON.stringify([], null, 2));
}

function getBlockedCommands() {
  try {
    const data = fs.readFileSync(BLOCKED_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading blocked commands file:", error);
    return [];
  }
}

/**
 * Checks if a command string contains any blocked keywords/patterns.
 * @param {string} command - The command to check.
 * @returns {string|null} - Returns the blocked keyword if found, otherwise null.
 */
function isCommandBlocked(command) {
  if (!command) return null;
  const blocked = getBlockedCommands();
  const cmdLower = command.toLowerCase().trim();

  for (const blockPattern of blocked) {
    // Simple case: string includes pattern
    // We might want more sophisticated regex later, but string matching covers basic needs
    if (cmdLower.includes(blockPattern.toLowerCase())) {
      return blockPattern;
    }
  }
  return null;
}

function addBlockedCommand(command) {
  const blocked = getBlockedCommands();
  if (blocked.includes(command)) return false;
  blocked.push(command);
  fs.writeFileSync(BLOCKED_FILE, JSON.stringify(blocked, null, 2));
  return true;
}

function removeBlockedCommand(command) {
  const blocked = getBlockedCommands();
  const index = blocked.indexOf(command);
  if (index === -1) return false;
  blocked.splice(index, 1);
  fs.writeFileSync(BLOCKED_FILE, JSON.stringify(blocked, null, 2));
  return true;
}

module.exports = {
  getBlockedCommands,
  isCommandBlocked,
  addBlockedCommand,
  removeBlockedCommand,
};
