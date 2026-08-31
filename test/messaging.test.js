const assert = require("node:assert/strict");
const test = require("node:test");
const {
  sendLargeMessage,
  splitContent,
  MAX_CONTENT_LENGTH,
} = require("../src/utils/messaging");

test("splits a long single line into Telegram-safe chunks", () => {
  const chunks = splitContent("a".repeat(MAX_CONTENT_LENGTH * 2 + 10));
  assert.deepEqual(chunks.map((chunk) => chunk.length), [3500, 3500, 10]);
});

test("escapes output after splitting so HTML entities stay intact", async () => {
  const replies = [];
  const ctx = {
    reply: async (message, options) => replies.push({ message, options }),
  };

  await sendLargeMessage(ctx, `${"a".repeat(3600)}<tag>`, "<b>Output</b>");

  assert.equal(replies.length, 2);
  assert.match(replies[0].message, /^<b>Output<\/b>\n<pre>/);
  assert.match(replies[1].message, /&lt;tag&gt;<\/pre>$/);
  assert.equal(replies[0].options.parse_mode, "HTML");
});
