async function sendLargeMessage(ctx, content, header = "") {
  const MAX_LENGTH = 4000; // Leave some buffer for tags

  if (!content) {
    return ctx.reply(`${header}\n(Empty output)`, { parse_mode: "HTML" });
  }

  // If content fits in one message with header
  if (header.length + content.length + 20 <= MAX_LENGTH) {
    return ctx.reply(`${header}\n<pre>${content}</pre>`, {
      parse_mode: "HTML",
    });
  }

  // Split content
  const chunks = [];
  let currentChunk = "";

  // Try to split by newlines first to be clean
  const lines = content.split("\n");

  for (const line of lines) {
    if (currentChunk.length + line.length + 1 > MAX_LENGTH) {
      chunks.push(currentChunk);
      currentChunk = line + "\n";
    } else {
      currentChunk += line + "\n";
    }
  }
  if (currentChunk) chunks.push(currentChunk);

  // Send chunks
  for (let i = 0; i < chunks.length; i++) {
    let msg = chunks[i];
    // If it's the first chunk, maybe add the header?
    // Or send header separately. Let's send header in first chunk if possible.

    if (i === 0 && header) {
      await ctx.reply(`${header}\n<pre>${msg}</pre>`, { parse_mode: "HTML" });
    } else {
      await ctx.reply(`<pre>${msg}</pre>`, { parse_mode: "HTML" });
    }
  }
}

module.exports = { sendLargeMessage };
