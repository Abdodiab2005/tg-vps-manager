const fs = require("fs");
const path = require("path");

const SETTINGS_FILE = path.join(__dirname, "../../data/user_settings.json");

// Ensure data directory exists
if (!fs.existsSync(path.dirname(SETTINGS_FILE))) {
  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
}

// Ensure settings file exists
if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify({}, null, 2));
}

function getSettings() {
  try {
    const data = fs.readFileSync(SETTINGS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

function getUserLanguage(userId) {
  const settings = getSettings();
  // Default to 'ar' if not set, as per original bot behavior being arabic
  return settings[userId]?.language || "en";
}

function setUserLanguage(userId, lang) {
  const settings = getSettings();
  if (!settings[userId]) settings[userId] = {};

  settings[userId].language = lang;

  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

module.exports = {
  getUserLanguage,
  setUserLanguage,
};
