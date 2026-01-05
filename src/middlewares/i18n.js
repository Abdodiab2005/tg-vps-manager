const fs = require("fs");
const path = require("path");
const { getUserLanguage } = require("../utils/userSettings");

const locales = {
  en: JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../locales/en.json"), "utf-8")
  ),
  ar: JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../locales/ar.json"), "utf-8")
  ),
};

async function i18nMiddleware(ctx, next) {
  // Determine language
  const userId = ctx.from?.id;
  const lang = userId ? getUserLanguage(userId) : "en"; // Default fallback

  ctx.lang = lang;

  // Translation function attached to ctx
  ctx.t = (key, params = {}) => {
    let text = locales[lang][key] || locales["en"][key] || key;

    // Simple interpolation
    if (params) {
      Object.keys(params).forEach((param) => {
        text = text.replace(`\${${param}}`, params[param]);
      });
    }
    return text;
  };

  return next();
}

module.exports = { i18nMiddleware };
