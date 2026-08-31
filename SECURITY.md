# Security policy

TG VPS Manager is a deliberately privileged administration tool: an authorized Telegram user can execute shell commands with the permissions of the bot process. Treat access to the bot token and every authorized Telegram account as server access.

## Supported version

Security fixes are applied to the latest commit on `main`.

## Deployment baseline

- Use the bot only in private chats. Group updates are ignored by the application.
- Run the process as a dedicated, unprivileged Linux user.
- Keep `ALLOW_ADD_ADMINS=false` unless delegated access is required.
- Store `.env` with mode `0600`; never commit the real bot token.
- Grant only narrowly scoped `sudoers` permissions when a command such as `/restart` needs them.
- Rotate the BotFather token immediately if it is exposed.
- Review `logs/activity.log`. It records the admin identity and command name, but intentionally omits command arguments.

The patterns in `data/blocked_commands.json` are a guardrail against common mistakes. They are not a shell sandbox, an allowlist, or a substitute for least privilege.

## Reporting a vulnerability

Please do not publish tokens, server addresses, command output, or working exploit details in a public issue. Use the repository's private vulnerability reporting flow when available. If it is unavailable, open a minimal issue requesting a private contact channel without including sensitive details.

Include the affected commit, impact, reproduction conditions, and a suggested mitigation when possible.
