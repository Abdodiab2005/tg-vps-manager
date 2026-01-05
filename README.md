# 🤖 TG VPS Manager

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![GrammY](https://img.shields.io/badge/built%20with-grammY-blue)

**TG VPS Manager** is a professional, modular, and secure Telegram bot designed to manage and monitor your Linux VPS. It supports multiple languages (Arabic/English), dynamic blocking rules, and interactive admin management.

---

## ✨ Features

- **🌍 Multi-language Support**: Switch between **English** and **Arabic** easily.
- **🖥️ Real-time Monitoring**: Instant access to CPU, RAM, Disk, and Network stats.
- **🛠️ Secure Shell Execution**:
  - Interactive mode (send `/run` then the command).
  - Direct mode (send `/run ls -la`).
  - **Block List**: Prevents dangerous commands (e.g., `rm -rf`, `mkfs`) from executing.
- **👥 Admin Management**: Add/Remove admins via a beautiful Interactve User Interface (Inline Buttons).
- **📜 Logging**: Comprehensive logging of executed commands for audit purposes.
- **📂 Persistent Settings**: User preferences and admin lists are saved locally.

---

## 🚀 Installation & Setup

### 1. Clone & Install

```bash
git clone https://github.com/Abdodiab2005/tg-vps-manager.git
cd tg-vps-manager
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
nano .env
```

**Variables:**

- `TOKEN`: Your Bot Token from @BotFather.
- `AUTHORIZED_CHAT_ID`: Your Telegram ID (Comma separated for multiple initial admins).
- `ALLOW_ADD_ADMINS`: Set to `true` to enable adding admins via the bot.

### 3. Run

```bash
npm start
```

_For development (auto-restart):_ `npm run dev`

---

## 📖 Usage

### Main Commands (Bot Menu)

| Command     | Description                                          |
| :---------- | :--------------------------------------------------- |
| `/start`    | Shows the main menu and help message.                |
| `/status`   | Displays full system statistics (CPU/RAM/Disk/Load). |
| `/run`      | Interactive mode to run shell commands.              |
| `/language` | Switch bot language (AR/EN).                         |
| `/admins`   | Admin control panel (Add/Remove admins).             |

### System Commands

| Command      | Description                        |
| :----------- | :--------------------------------- |
| `/processes` | Top 10 CPU consuming processes.    |
| `/network`   | Network interface details.         |
| `/disk`      | Disk usage details.                |
| `/logs`      | View last 50 lines of system logs. |
| `/restart`   | Reboot the VPS (Requires Sudo).    |

---

## 🛡️ Security Features

1.  **Block List**:
    - Commands are checked against `data/blocked_commands.json`.
    - Dangerous commands like `shutdown`, `rm -rf /` are blocked by default.
2.  **Auth Middleware**:
    - Only authorized IDs can interact with the bot.
3.  **Command Cancellation**:
    - If you are in an interactive flow (like `/run`) and send another command (e.g. `/start`), the previous flow cancels automatically.

---

## 🏗️ Project Structure

```
src/
├── commands/       # Logic for each command
├── config/         # Config loader
├── middlewares/    # Auth, Logging, i18n
├── utils/          # System stats, formatting, security, settings
├── bot.js          # Bot entry (middlewares & routing)
└── index.js        # Main entry point
locales/            # JSON translation files (en.json, ar.json)
data/               # Persistent data (admins.json, etc.)
```

---

## 📜 License

MIT License. Created by [Eng. Abdelrhman Diab](https://github.com/Abdodiab2005).
