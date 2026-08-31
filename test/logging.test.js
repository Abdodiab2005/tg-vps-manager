const assert = require("node:assert/strict");
const test = require("node:test");
const { getCommandName } = require("../src/middlewares/logging");
const { normalizeCommand } = require("../src/utils/logger");

test("keeps only the command name", () => {
  assert.equal(getCommandName("/run echo SUPER_SECRET"), "/run");
  assert.equal(getCommandName("/status@my_bot"), "/status");
  assert.equal(getCommandName("hello"), null);
});

test("logger performs defense-in-depth argument redaction", () => {
  assert.equal(normalizeCommand("/run token=secret"), "/run");
});
