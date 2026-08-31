<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,100:229ED9&height=190&section=header&text=TG%20VPS%20Manager&fontSize=42&fontColor=FFFFFF&animation=fadeIn&fontAlignY=38&desc=Control%20your%20Linux%20server%20from%20a%20private%20Telegram%20chat&descAlignY=60&descSize=15" width="100%" alt="TG VPS Manager" />
</p>

<p align="center">
  <a href="https://github.com/Abdodiab2005/tg-vps-manager/actions/workflows/ci.yml"><img src="https://github.com/Abdodiab2005/tg-vps-manager/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <img src="https://img.shields.io/badge/Node.js-22%2B-339933?logo=nodedotjs&logoColor=white" alt="Node.js 22+" />
  <img src="https://img.shields.io/badge/grammY-1.39-229ED9?logo=telegram&logoColor=white" alt="grammY" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-22C55E" alt="MIT license" /></a>
</p>

<p align="center">
  A self-hosted Telegram control plane for monitoring and administering a Linux VPS.<br />
  Arabic and English, private-chat access, no external database.
</p>

> [!CAUTION]
> This bot deliberately executes shell commands. The command blocklist is a guardrail, not a sandbox. Run it as a dedicated unprivileged user on a server you own, and treat the Telegram bot token as server access.

## What it does

| Area | Capability |
| --- | --- |
| Monitoring | CPU, RAM, load average, disk, uptime, and network interfaces |
| Administration | Run shell commands interactively or with `/run <command>` |
| Operations | View processes and system logs; optionally reboot the server |
| Access control | Numeric Telegram user allowlist, private chats only |
| Admin delegation | Optional runtime admin management with inline buttons |
| Localization | Complete Arabic and English interfaces |
| Local state | JSON-backed admin and language preferences; no database service |

## Quick start

### Requirements

- Linux VPS
- Node.js 22 or newer
- Telegram bot token from [@BotFather](https://t.me/BotFather)
- Your numeric Telegram user ID from [@userinfobot](https://t.me/userinfobot)

```bash
git clone https://github.com/Abdodiab2005/tg-vps-manager.git
cd tg-vps-manager
npm ci
cp .env.example .env
chmod 600 .env
nano .env
npm start
```

Open a **private chat** with the bot and send `/start`.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `TOKEN` | required | Bot token issued by BotFather |
| `AUTHORIZED_CHAT_ID` | required | Comma-separated numeric Telegram **user** IDs |
| `ALLOW_ADD_ADMINS` | `false` | Lets authorized admins add and remove runtime admins |
| `COMMAND_TIMEOUT_MS` | `60000` | Maximum runtime for `/run` before the process is terminated |
| `COMMAND_MAX_BUFFER_BYTES` | `1048576` | Maximum buffered stdout/stderr per command |

Environment admins cannot be removed from Telegram. Runtime admins and language preferences are generated locally under `data/` and are ignored by Git.

## Commands

| Command | Description |
| --- | --- |
| `/start` | Show the command overview |
| `/status` | CPU, memory, disk, load, uptime, and interfaces |
| `/run` | Ask for a command interactively |
| `/run <command>` | Execute a command directly |
| `/processes` | Show the top CPU-consuming processes |
| `/network` | Show network interface details |
| `/disk` | Show filesystem usage |
| `/logs` | Show the latest syslog or journal entries |
| `/restart` | Run `sudo reboot` |
| `/admins` | Manage runtime admins when enabled |
| `/language` | Switch between Arabic and English |

## Run with systemd

Install the project under `/opt/tg-vps-manager`, keep `.env` readable only by the service user, then create `/etc/systemd/system/tg-vps-manager.service`:

```ini
[Unit]
Description=TG VPS Manager
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=tg-vps-manager
Group=tg-vps-manager
WorkingDirectory=/opt/tg-vps-manager
EnvironmentFile=/opt/tg-vps-manager/.env
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now tg-vps-manager
sudo systemctl status tg-vps-manager
```

`/restart` requires a narrowly scoped `sudoers` rule for the service user. Do not grant unrestricted passwordless sudo.

## Security model

- Authorization uses `ctx.from.id`, not a group chat ID.
- Group and channel interactions are ignored.
- Logs keep the admin identity and command name, but omit `/run` arguments.
- Output is HTML-escaped before it is returned to Telegram.
- Shell commands have configurable timeout and output-buffer limits.
- `data/blocked_commands.json` blocks common dangerous patterns, but cannot make arbitrary shell execution safe.

Read [SECURITY.md](SECURITY.md) before deploying this on an internet-connected server.

## Development

```bash
npm ci
npm run check
npm test
npm run dev
```

CI runs syntax, JSON, and behavior checks on Node.js 22 and 24. Contributions are welcome—see [CONTRIBUTING.md](CONTRIBUTING.md).

## Project layout

```text
src/
├── commands/       # Telegram command handlers
├── config/         # Environment-backed configuration
├── middlewares/    # Authentication, localization, and audit logging
├── utils/          # System metrics, state, security, and message helpers
├── bot.js          # grammY middleware and routing
└── index.js        # Process entry point
locales/            # Arabic and English translations
data/               # Block rules and generated runtime state
test/               # Node.js behavior tests
```

## License

Released under the [MIT License](LICENSE). Built by [Abdelrhman Diab](https://github.com/Abdodiab2005).

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:229ED9,100:0F172A&height=110&section=footer" width="100%" alt="" />
</p>
