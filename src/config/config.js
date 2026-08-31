function readPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

module.exports = {
  TOKEN: process.env.TOKEN,
  ALLOW_ADD_ADMINS: process.env.ALLOW_ADD_ADMINS === "true",
  COMMAND_TIMEOUT_MS: readPositiveInteger(
    process.env.COMMAND_TIMEOUT_MS,
    60_000
  ),
  COMMAND_MAX_BUFFER_BYTES: readPositiveInteger(
    process.env.COMMAND_MAX_BUFFER_BYTES,
    1_048_576
  ),
};
