# Discord XP Bot

A comprehensive Discord bot that tracks user activity through text messages and voice channel participation, featuring leaderboards and statistics.

## Features

- 📝 **Text XP**: Earn XP for sending messages (with anti-spam protection)
- 🎤 **Voice XP**: Earn XP for being active in voice channels
- 📊 **Leaderboards**: Daily, weekly, and all-time rankings
- 📈 **Statistics**: Personal XP stats and rankings
- 🔄 **Auto-Reset**: Automatic daily and weekly counter resets
- 🛡️ **Anti-Abuse**: Rate limiting and AFK channel exclusion

## Setup

### Prerequisites

- Python 3.8 or higher
- Discord bot token (from Discord Developer Portal)

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Discord bot token:
   ```env
   DISCORD_TOKEN=your_actual_bot_token_here
   ```

5. Run the bot:
   ```bash
   python discord_xp_bot.py
   ```

## Configuration

You can customize the bot behavior by setting these environment variables in your `.env` file:

- `DISCORD_TOKEN`: Your Discord bot token (required)
- `TEXT_XP_PER_MESSAGE`: XP gained per message (default: 10)
- `VOICE_XP_INTERVAL`: Seconds between voice XP awards (default: 60)
- `VOICE_XP_PER_INTERVAL`: XP gained per voice interval (default: 5)
- `DATA_FILE`: Path to XP data file (default: xp_data.json)

## Commands

### Text Commands (type in any channel)

- `t` - Show all-time leaderboards
- `t day` - Show daily leaderboards
- `t week` - Show weekly leaderboards

### Slash Commands

- `/stats` - View your detailed XP statistics and rankings

## How XP Works

### Text XP
- Earn XP for sending messages in any text channel
- Rate limited to prevent spam (5-second cooldown per user)
- Bots are excluded from earning XP

### Voice XP
- Earn XP for being in voice channels
- Must not be muted or deafened (self or server)
- AFK channels are excluded
- XP awarded every 60 seconds by default

### Resets
- **Daily**: Resets at midnight UTC every day
- **Weekly**: Resets at midnight UTC every Monday

## Bot Permissions

Your bot needs these Discord permissions:
- Read Messages
- Send Messages
- Use Slash Commands
- Connect to Voice Channels
- View Channels

## Data Storage

- XP data is stored in `xp_data.json` (configurable)
- Automatic backups created if data corruption is detected
- Atomic file writes prevent data loss

## Logging

- Logs are written to both console and `bot.log` file
- Different log levels for debugging and monitoring
- Error tracking for troubleshooting

## Security Features

- Token stored in environment variables (not in code)
- Rate limiting to prevent XP farming
- Input validation and error handling
- Atomic file operations to prevent data corruption

## Troubleshooting

### Bot won't start
- Check that your `DISCORD_TOKEN` is correctly set in `.env`
- Ensure the bot has proper permissions in your Discord server

### XP not being awarded
- Check bot permissions in the server
- Verify the user isn't muted/deafened (for voice XP)
- Check the console/log file for error messages

### Data corruption
- The bot automatically creates backups of corrupted files
- Look for `.backup` files in your directory

## Development

To contribute or modify the bot:

1. The main bot logic is in `discord_xp_bot.py`
2. XP management is handled by the `XPManager` class
3. All database operations use error handling and atomic writes
4. Add new features by extending the existing command structure

## License

This project is open source. Feel free to modify and distribute according to your needs.

## Support

If you encounter issues:
1. Check the log files for error messages
2. Ensure all prerequisites are met
3. Verify bot permissions in Discord
4. Check that environment variables are correctly set
