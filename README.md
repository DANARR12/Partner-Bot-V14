# Discord XP Bot

A Discord bot that tracks user activity and awards XP for text messages and voice chat participation.

## Features

- 📝 **Text XP**: Users earn XP for sending messages
- 🎙️ **Voice XP**: Users earn XP for being active in voice channels (anti-AFK measures included)
- 📊 **Leaderboards**: Daily, weekly, and all-time leaderboards
- 🔄 **Automatic Resets**: Daily stats reset at midnight UTC, weekly stats reset on Monday
- 💾 **Data Persistence**: XP data is saved to JSON file with automatic backups

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Bot Token**
   ```bash
   # Set environment variable
   export DISCORD_TOKEN='your_bot_token_here'
   
   # Or create .env file (copy from .env.example)
   cp .env.example .env
   # Edit .env and add your token
   ```

3. **Bot Permissions**
   Your bot needs these permissions:
   - Read Messages
   - Send Messages
   - Read Message History
   - Connect (for voice channels)
   - View Channels

4. **Run the Bot**
   ```bash
   python discord_xp_bot.py
   ```

## Usage

### Commands (Type in chat)
- `t` - Show all-time leaderboard
- `t day` - Show daily leaderboard  
- `t week` - Show weekly leaderboard

### XP System
- **Text Messages**: 10 XP per message
- **Voice Chat**: 5 XP every 60 seconds (only when not muted/deafened)

### Anti-AFK Measures
Users must be:
- Not muted or deafened (by themselves or by server)
- Not in the AFK channel
- Not a bot

## File Structure
- `discord_xp_bot.py` - Main bot code
- `xp_data.json` - XP data storage (auto-created)
- `requirements.txt` - Python dependencies
- `.env` - Environment variables (create from .env.example)

## Data Backup
The bot automatically creates timestamped backups if the data file becomes corrupted.
