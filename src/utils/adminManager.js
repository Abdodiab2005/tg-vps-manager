const fs = require("fs");
const path = require("path");

const ADMINS_FILE = path.join(__dirname, "../../data/admins.json");
const ENV_ADMINS = (process.env.AUTHORIZED_CHAT_ID || "")
  .split(",")
  .map((id) => id.trim())
  .filter((id) => /^\d+$/.test(id));

if (!fs.existsSync(path.dirname(ADMINS_FILE))) {
  fs.mkdirSync(path.dirname(ADMINS_FILE), { recursive: true });
}

if (!fs.existsSync(ADMINS_FILE)) {
  fs.writeFileSync(ADMINS_FILE, JSON.stringify([], null, 2), { mode: 0o600 });
}

function getStoredAdmins() {
  try {
    const data = fs.readFileSync(ADMINS_FILE, "utf8");
    const admins = JSON.parse(data);
    return Array.isArray(admins) ? admins.map(String) : [];
  } catch (error) {
    console.error("Error reading admins file:", error);
    return [];
  }
}

function writeStoredAdmins(admins) {
  fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2), {
    mode: 0o600,
  });
}

function getAllAdmins() {
  return [...new Set([...ENV_ADMINS, ...getStoredAdmins()])];
}

function isAdmin(userId) {
  if (!userId) return false;
  return getAllAdmins().includes(userId.toString());
}

function addAdmin(userId) {
  const stored = getStoredAdmins();
  const normalizedId = userId.toString();
  if (stored.includes(normalizedId) || ENV_ADMINS.includes(normalizedId)) {
    return false;
  }

  stored.push(normalizedId);
  writeStoredAdmins(stored);
  return true;
}

function removeAdmin(userId) {
  const stored = getStoredAdmins();
  const index = stored.indexOf(userId.toString());
  if (index === -1) return false;

  stored.splice(index, 1);
  writeStoredAdmins(stored);
  return true;
}

module.exports = {
  getAllAdmins,
  isAdmin,
  addAdmin,
  removeAdmin,
  ENV_ADMINS,
};
