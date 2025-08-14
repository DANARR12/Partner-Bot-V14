# Discord Bot - Forever Setup 🚀

Your Discord Advertisement Bot is now configured to run **forever** with automatic restarts and monitoring!

## 🎯 Quick Start

```bash
# Start bot forever
npm run start:forever

# Or use the manager script
./bot-manager.sh start
```

## 📊 Dashboard Access

- **Web Dashboard**: http://localhost:3000
- **API Status**: http://localhost:3000/api/status

## 🛠️ Management Commands

### NPM Scripts
```bash
npm run start:forever   # Start with PM2 (auto-restart)
npm run stop           # Stop the bot
npm run restart        # Restart the bot
npm run reload         # Reload without downtime
npm run status         # Show bot status
npm run logs           # View bot logs
npm run monitor        # Open PM2 monitoring
npm run delete         # Remove from PM2
```

### Bot Manager Script
```bash
./bot-manager.sh start      # Start bot forever
./bot-manager.sh stop       # Stop bot
./bot-manager.sh restart    # Restart bot
./bot-manager.sh status     # Show status
./bot-manager.sh logs       # View logs
./bot-manager.sh monitor    # Open monitor
./bot-manager.sh dashboard  # Show URLs
./bot-manager.sh test       # Test connectivity
```

## 🔧 PM2 Features

### ✅ Auto-Restart
- Automatically restarts if the bot crashes
- Memory limit monitoring (1GB max)
- Minimum uptime checks (10 seconds)
- Maximum restart attempts (10 times)

### 📝 Logging
- Error logs: `./logs/err.log`
- Output logs: `./logs/out.log`
- Combined logs: `./logs/combined.log`

### 📊 Monitoring
```bash
pm2 monit              # Real-time monitoring
pm2 logs discord-ad-bot # Live logs
pm2 show discord-ad-bot # Detailed info
```

## 🌐 System Integration

### Auto-Start on Boot
The bot is configured to automatically start when the system reboots:

```bash
pm2 startup            # Setup auto-start
pm2 save              # Save current process list
```

### Process Management
```bash
pm2 list              # List all processes
pm2 restart all       # Restart all processes
pm2 stop all          # Stop all processes
pm2 delete all        # Remove all processes
```

## 🚨 Troubleshooting

### Check Status
```bash
./bot-manager.sh status
```

### View Logs
```bash
./bot-manager.sh logs
# Or directly
tail -f logs/combined.log
```

### Restart if Issues
```bash
./bot-manager.sh restart
```

### Test Connectivity
```bash
./bot-manager.sh test
```

## 📈 Performance Monitoring

### Real-time Stats
```bash
pm2 monit
```

### Memory Usage
```bash
pm2 show discord-ad-bot
```

### Process Information
- **Process ID**: Check with `pm2 list`
- **Memory Usage**: Monitored automatically
- **CPU Usage**: Real-time tracking
- **Uptime**: Continuous tracking

## 🔒 Security Notes

- Bot token is stored in `.env` file
- Logs contain sensitive information - keep secure
- Dashboard runs on localhost:3000 only
- PM2 daemon runs as current user

## 📞 Support Commands

```bash
# Quick health check
curl http://localhost:3000/api/status

# Full bot restart
npm run restart

# Emergency stop
npm run stop

# View real-time logs
npm run logs --lines 100
```

## 🎉 Success!

Your Discord Advertisement Bot is now running **forever** with:
- ✅ Auto-restart on crashes
- ✅ Memory monitoring
- ✅ Professional logging
- ✅ Web dashboard
- ✅ System integration
- ✅ Easy management tools

**Dashboard URL**: http://localhost:3000

The bot will automatically restart if it crashes and will start automatically when the system reboots!