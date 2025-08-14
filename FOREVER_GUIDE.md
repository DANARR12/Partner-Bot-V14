# 🚀 Running Discord Partner Bot Forever

This guide shows you multiple ways to run your Discord bot continuously (forever) without it stopping.

## 🎯 Quick Start - Run Forever

### Method 1: Using PM2 (Recommended)

```bash
# 1. Start the bot forever
npm run forever

# 2. Check status
npm run status

# 3. View logs
npm run logs
```

### Method 2: Using the Setup Script

```bash
# Run the automated setup script
./start_forever.sh
```

### Method 3: Manual PM2 Setup

```bash
# Install PM2 globally (if not installed)
npm install -g pm2

# Start the bot
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up auto-start on system reboot
pm2 startup
```

## 📋 Available Commands

### Basic Control
```bash
npm run forever         # Start bot forever
npm run stop           # Stop the bot
npm run restart        # Restart the bot
npm run delete         # Remove bot from PM2
npm run status         # Check bot status
```

### Monitoring & Logs
```bash
npm run logs           # View bot logs
npm run logs:all       # View all PM2 logs
npm run monitor        # Open PM2 monitor dashboard
```

### Development
```bash
npm run forever:dev    # Start in development mode (debug logs)
npm run forever:legacy # Start legacy version forever
```

### Advanced
```bash
npm run reload         # Zero-downtime reload
npm run save           # Save PM2 configuration
npm run startup        # Setup auto-start on boot
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:
```bash
DISCORD_TOKEN=your_discord_bot_token_here
LOG_LEVEL=info
NODE_ENV=production
```

### PM2 Configuration

The bot uses `ecosystem.config.js` for PM2 configuration:

- **Auto-restart**: Automatically restarts if crashes
- **Memory monitoring**: Restarts if memory usage exceeds 1GB
- **Log management**: Separate log files for different outputs
- **Process monitoring**: Tracks uptime and restart count

## 📊 Monitoring Your Bot

### Check Bot Status
```bash
npm run status
```

Output example:
```
┌─────┬────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name               │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0   │ discord-partner-bot│ default     │ 2.1.0   │ fork    │ 1234     │ 5m     │ 0    │ online    │ 0%       │ 45.2mb   │ user     │ disabled │
└─────┴────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

### View Live Logs
```bash
npm run logs
```

### Open PM2 Monitor
```bash
npm run monitor
```

## 🛠️ Troubleshooting

### Bot Won't Start
1. Check if Discord token is set in `.env`
2. Validate configuration: `npm run validate-config`
3. Check PM2 status: `npm run status`
4. View error logs: `npm run logs`

### Bot Keeps Restarting
1. Check error logs: `npm run logs`
2. Verify Discord token is valid
3. Check network connectivity
4. Ensure all required permissions are set

### High Memory Usage
The bot automatically restarts if memory exceeds 1GB. Check logs for memory leaks.

### Can't Connect to Voice Channel
1. Verify voice channel ID in `config.json`
2. Check bot permissions in Discord server
3. Ensure voice channel exists and bot has access

## 🔄 Auto-Start on System Reboot

To make the bot start automatically when your server reboots:

```bash
# 1. Setup PM2 startup script
npm run startup

# 2. Follow the instructions shown (usually run a sudo command)

# 3. Save current PM2 processes
npm run save
```

Now your bot will automatically start when the system boots!

## 📝 Log Files

Logs are stored in the `logs/` directory:

- `combined.log` - All logs (info, warnings, errors)
- `out.log` - Standard output logs
- `error.log` - Error logs only
- `log.txt` - Application logs from the bot itself

## 🚨 Emergency Commands

### Stop Everything
```bash
npm run stop:all        # Stop all PM2 processes
npm run delete:all      # Remove all PM2 processes
```

### Reset PM2
```bash
pm2 kill               # Kill PM2 daemon
pm2 resurrect          # Restore saved processes
```

## 💡 Tips

1. **Always check logs** if something goes wrong: `npm run logs`
2. **Use monitoring** to keep an eye on performance: `npm run monitor`
3. **Save your configuration** after making changes: `npm run save`
4. **Set up auto-start** for production servers: `npm run startup`
5. **Use development mode** when testing: `npm run forever:dev`

## 🎉 Success!

Once started with PM2, your Discord bot will:
- ✅ Run continuously (forever)
- ✅ Auto-restart if it crashes
- ✅ Auto-restart if memory usage is too high
- ✅ Maintain logs of all activity
- ✅ Survive system reboots (if configured)
- ✅ Provide monitoring and management tools

Your bot is now production-ready and will stay online 24/7! 🚀