# VPS Management Telegram Bot 🤖

A powerful Telegram bot for managing your Linux VPS remotely. Execute commands, monitor system resources, and control your server directly from Telegram.

## Features ✨

- **🔐 Secure Access**: Only authorized users can control the bot
- **💻 Command Execution**: Run any Linux command without restrictions
- **📊 System Monitoring**: Real-time system stats and resource usage
- **🔄 System Control**: Restart, shutdown, and manage processes
- **📱 User-Friendly**: Arabic interface with emoji indicators
- **⚡ No Limitations**: No command blocking or timeouts

## Commands 📋

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and command list |
| `/status` | Detailed system information and resource usage |
| `/run <command>` | Execute any Linux command |
| `/restart` | Restart the system |
| `/processes` | Show top CPU-consuming processes |
| `/network` | Display network interface information |
| `/disk` | Show disk usage statistics |
| `/logs` | Display recent system logs |

## Installation 🚀

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Telegram Bot Token from [@BotFather](https://t.me/BotFather)
- Your Telegram Chat ID

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vps-telegram-bot.git
   cd vps-telegram-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the bot**
   
   Edit `bot.js` and update these variables:
   ```javascript
   const TOKEN = 'YOUR_BOT_TOKEN_HERE';
   const AUTHORIZED_CHAT_ID = YOUR_CHAT_ID_HERE;
   ```

4. **Run the bot**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## Configuration ⚙️

### Getting Your Bot Token

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the instructions
3. Copy the bot token provided

### Getting Your Chat ID

1. Message [@userinfobot](https://t.me/userinfobot) on Telegram
2. Copy your Chat ID from the response

### Security Configuration

The bot only responds to the authorized Chat ID specified in the configuration. Make sure to:

- Keep your bot token secure
- Only share your Chat ID with trusted individuals
- Run the bot on a secure server

## System Information Display 📊

The `/status` command provides comprehensive system information:

- **System Details**: Hostname, OS, architecture, uptime
- **CPU Information**: Core count, model, load averages
- **Memory Usage**: Total, used, free memory with percentages
- **Storage**: Disk usage, available space
- **Network**: Available network interfaces

## Usage Examples 💡

### Basic Commands
```
/run ls -la
/run ps aux
/run df -h
/run top -n 1
```

### System Administration
```
/run systemctl status nginx
/run tail -f /var/log/nginx/access.log
/run ufw status
/run netstat -tulpn
```

### File Operations
```
/run find /var/log -name "*.log" -type f
/run du -sh /home/*
/run wget https://example.com/file.zip
```

## Running as a Service 🔄

### Using systemd (Recommended)

1. Create a service file:
   ```bash
   sudo nano /etc/systemd/system/vps-bot.service
   ```

2. Add the following content:
   ```ini
   [Unit]
   Description=VPS Telegram Bot
   After=network.target

   [Service]
   Type=simple
   User=your-username
   WorkingDirectory=/path/to/vps-telegram-bot
   ExecStart=/usr/bin/node bot.js
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable vps-bot
   sudo systemctl start vps-bot
   ```

### Using PM2

```bash
npm install -g pm2
pm2 start bot.js --name "vps-bot"
pm2 startup
pm2 save
```

## Security Considerations ⚠️

- **Complete Control**: This bot has unrestricted access to your system
- **No Command Filtering**: All Linux commands are allowed without restrictions
- **No Timeouts**: Commands can run indefinitely
- **Authorized Access Only**: Only the specified Chat ID can control the bot

**⚠️ Warning**: Use this bot responsibly. It can execute destructive commands that may damage your system.

## Troubleshooting 🔧

### Common Issues

1. **Bot not responding**
   - Check if the bot token is correct
   - Verify your Chat ID matches the authorized ID
   - Ensure the bot process is running

2. **Permission denied errors**
   - Commands may require sudo privileges
   - Use `/run sudo your-command` for elevated permissions

3. **Long output truncation**
   - Large outputs are automatically split into multiple messages
   - For very long outputs, consider redirecting to a file

### Logs and Debugging

Check bot logs:
```bash
# If running directly
node bot.js

# If using systemd
sudo journalctl -u vps-bot -f

# If using PM2
pm2 logs vps-bot
```

## Dependencies 📦

- `node-telegram-bot-api`: Telegram Bot API wrapper
- `child_process`: For executing system commands
- `os`: System information utilities
- `fs`: File system operations

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer ⚖️

This bot provides unrestricted access to your Linux system. The authors are not responsible for any damage caused by misuse of this software. Use at your own risk.

## Support 💬

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/vps-telegram-bot/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your setup and the problem

---

**Made with ❤️ for system administrators who love automation**