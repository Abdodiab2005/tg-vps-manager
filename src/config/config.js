// Environment variables should be loaded by the entry point

module.exports = {
  TOKEN: process.env.TOKEN,
  AUTHORIZED_CHAT_ID: process.env.AUTHORIZED_CHAT_ID, // Kept for raw access if needed
  ALLOW_ADD_ADMINS: process.env.ALLOW_ADD_ADMINS === "true",
};
