# Contributing

Thanks for improving TG VPS Manager.

## Local setup

```bash
git clone https://github.com/Abdodiab2005/tg-vps-manager.git
cd tg-vps-manager
npm ci
cp .env.example .env
npm run check
npm test
```

Use a test bot token and a non-production machine while developing command execution features.

## Pull requests

1. Create a focused branch from `main`.
2. Keep changes small and explain any security impact.
3. Update both `locales/en.json` and `locales/ar.json` for user-facing text.
4. Add or update tests for behavior changes.
5. Run `npm run check && npm test` before opening the PR.

Never commit `.env`, Telegram IDs, tokens, logs, or generated runtime state. Security reports should follow [SECURITY.md](SECURITY.md), not a public issue.
