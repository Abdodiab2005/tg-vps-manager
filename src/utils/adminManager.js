const fs = require("fs");
const path = require("path");
// dotenv is already loaded by config/config.js which is required by bot.js -> adminManager somewhat indirectly or at root level.
// Actually, adminManager uses process.env which is populated by previous calls.
// Best practice: load dotenv ONCE in the entry point (index.js).

const ADMINS_FILE = path.join(__dirname, "../../data/admins.json");
const ENV_ADMINS = (process.env.AUTHORIZED_CHAT_ID || "")
  .split(",")
  .map((id) => id.trim())
  .filter((id) => id.length > 0);

// Ensure data directory exists
if (!fs.existsSync(path.dirname(ADMINS_FILE))) {
  fs.mkdirSync(path.dirname(ADMINS_FILE), { recursive: true });
}

// Ensure admins file exists
if (!fs.existsSync(ADMINS_FILE)) {
  fs.writeFileSync(ADMINS_FILE, JSON.stringify([], null, 2));
}

function getStoredAdmins() {
  try {
    const data = fs.readFileSync(ADMINS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading admins file:", error);
    return [];
  }
}

function getAllAdmins() {
  const stored = getStoredAdmins();
  // Combine env admins and stored admins, remove duplicates
  return [...new Set([...ENV_ADMINS, ...stored])];
}

function isAdmin(chatId) {
  if (!chatId) return false;
  const admins = getAllAdmins();
  return admins.includes(chatId.toString());
}

function addAdmin(chatId) {
  const stored = getStoredAdmins();
  if (stored.includes(chatId.toString())) return false;

  stored.push(chatId.toString());
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(stored, null, 2));
  return true;
}

function removeAdmin(chatId) {
  const stored = getStoredAdmins();
  const index = stored.indexOf(chatId.toString());

  if (index === -1) return false;

  stored.splice(index, 1);
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(stored, null, 2));
  return true;
}

module.exports = {
  getAllAdmins,
  isAdmin,
  addAdmin,
  removeAdmin,
  ENV_ADMINS, // Exporting for reference if needed
};
