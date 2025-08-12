# Discord XP Bot

A Discord bot that tracks user experience points (XP) for both text and voice activity. Features include daily and weekly leaderboards, anti-AFK voice XP tracking, and persistent data storage.

## Features

- **Text XP**: Earn XP for each message sent
- **Voice XP**: Earn XP for time spent in voice channels (with anti-AFK protection)
- **Leaderboards**: View top users for all-time, daily, and weekly periods
- **Persistent Storage**: XP data is saved to a JSON file and persists between bot restarts
- **Automatic Resets**: Daily and weekly XP counters automatically reset

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section
4. Create a bot and copy the token
5. Enable the required intents:
   - Message Content Intent
   - Server Members Intent
   - Voice State Intent

### 3. Configure Environment

1. Copy `.env.example` to `.env`
2. Add your bot token to the `.env` file:
   ```
   DISCORD_TOKEN=your_actual_bot_token_here
   ```

### 4. Invite Bot to Server

Use this URL (replace `YOUR_BOT_CLIENT_ID` with your actual bot's client ID):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=8&scope=bot
```

### 5. Run the Bot

```bash
python discord_xp_bot.py
```

## Usage

### Commands

- `t` - Show all-time leaderboard
- `t day` - Show daily leaderboard  
- `t week` - Show weekly leaderboard

### XP System

- **Text XP**: 10 XP per message
- **Voice XP**: 5 XP every 60 seconds (when not muted/deafened)
- **Anti-AFK**: Voice XP only counts when actively participating (not muted/deafened)

## Configuration

You can modify these values in the bot code:

- `TEXT_XP_PER_MESSAGE`: XP gained per text message
- `VOICE_XP_INTERVAL`: How often voice XP is given (in seconds)
- `VOICE_XP_PER_INTERVAL`: XP given per voice interval

## Data Storage

XP data is stored in `xp_data.json` with the following structure:

```json
{
  "user_id": {
    "text_xp": 0,
    "voice_xp": 0,
    "daily_text_xp": 0,
    "daily_voice_xp": 0,
    "weekly_text_xp": 0,
    "weekly_voice_xp": 0
  }
}
```

## Security Notes

- **Never share your bot token publicly**
- The bot token in the original code has been compromised and should be regenerated
- Use environment variables to store sensitive information
- Keep your `.env` file private and never commit it to version control

## Troubleshooting

- **Bot not responding**: Check that all required intents are enabled in Discord Developer Portal
- **Voice XP not working**: Ensure the bot has permission to view voice channels and members
- **Permission errors**: Make sure the bot has appropriate permissions in your server

## License

This project is open source and available under the MIT License.
