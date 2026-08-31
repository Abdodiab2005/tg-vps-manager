const assert = require("node:assert/strict");
const test = require("node:test");

process.env.AUTHORIZED_CHAT_ID = "1001";

const { authMiddleware } = require("../src/middlewares/auth");

test("allows an authorized user in a private chat", async () => {
  let nextCalled = false;
  const ctx = {
    chat: { id: 1001, type: "private" },
    from: { id: 1001 },
    t: (key) => key,
    reply: async () => assert.fail("authorized user should not be rejected"),
  };

  await authMiddleware(ctx, async () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});

test("rejects an unauthorized user in a private chat", async () => {
  const replies = [];
  const ctx = {
    chat: { id: 2002, type: "private" },
    from: { id: 2002 },
    t: (key) => key,
    reply: async (message) => replies.push(message),
  };

  await authMiddleware(ctx, async () => assert.fail("next must not run"));
  assert.deepEqual(replies, ["unauthorized"]);
});

test("ignores group chats even when the sender is an admin", async () => {
  let replied = false;
  const ctx = {
    chat: { id: -100123, type: "supergroup" },
    from: { id: 1001 },
    t: (key) => key,
    reply: async () => {
      replied = true;
    },
  };

  await authMiddleware(ctx, async () => assert.fail("next must not run"));
  assert.equal(replied, false);
});
