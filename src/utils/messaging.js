const { escapeHTML } = require("./formatting");

const MAX_CONTENT_LENGTH = 3500;

function splitContent(content, maxLength = MAX_CONTENT_LENGTH) {
  const chunks = [];
  let chunk = "";
  let length = 0;

  for (const character of String(content)) {
    if (length >= maxLength) {
      chunks.push(chunk);
      chunk = "";
      length = 0;
    }

    chunk += character;
    length += 1;
  }

  if (chunk) chunks.push(chunk);
  return chunks;
}

async function sendLargeMessage(ctx, content, header = "") {
  if (!content) {
    return ctx.reply(`${header}\n(Empty output)`, { parse_mode: "HTML" });
  }

  const chunks = splitContent(content);

  for (let index = 0; index < chunks.length; index += 1) {
    const prefix = index === 0 && header ? `${header}\n` : "";
    await ctx.reply(`${prefix}<pre>${escapeHTML(chunks[index])}</pre>`, {
      parse_mode: "HTML",
    });
  }
}

module.exports = { sendLargeMessage, splitContent, MAX_CONTENT_LENGTH };
