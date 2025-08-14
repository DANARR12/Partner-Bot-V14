# Discord Advertisement Bot

A Discord bot that handles server advertisements and automatically joins voice channels.

## Features

- **Advertisement Management**: Users can submit server invites via DM
- **Cooldown System**: 60-minute cooldown between advertisements per user
- **Auto Voice Connection**: Automatically joins specified voice channel on startup
- **Multi-language Support**: Supports both English and Kurdish responses
- **Partner Channel Integration**: Posts advertisements to designated partner channels

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configuration

1. **Create a Discord Bot**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to the "Bot" section and create a bot
   - Copy the bot token

2. **Configure Environment Variables**:
   - Rename `.env.example` to `.env`
   - Add your bot token: `DISCORD_TOKEN=your_token_here`

3. **Update config.json**:
   ```json
   {
     "partner": "YOUR_PARTNER_CHANNEL_ID",
     "link": "YOUR_SERVER_INVITE_LINK",
     "idvc": "YOUR_VOICE_CHANNEL_ID"
   }
   ```

### 3. Bot Permissions

Ensure your bot has the following permissions:
- Send Messages
- Read Message History
- Connect to Voice Channels
- Send Messages in Partner Channels

### 4. Run the Bot

```bash
# Production
npm start

# Development (with auto-restart)
npm run dev
```

## Usage

### Commands

- **`reklam`** or **`رێکلام`**: In any server channel, tells users to DM the bot for advertisements
- **Bot Mention**: When someone mentions the bot, it responds with "Dm Me For Ads"

### Advertisement Submission

1. Users DM the bot with a Discord server invite link
2. The bot validates the invite link
3. If valid, the advertisement is posted to the partner channel
4. A 60-minute cooldown is applied to prevent spam

## File Structure

```
├── bot.js          # Main bot file
├── config.json     # Configuration file
├── .env           # Environment variables
├── package.json   # Dependencies and scripts
└── README.md      # This file
```

## Dependencies

- `discord.js`: Discord API wrapper
- `@discordjs/voice`: Voice channel functionality
- `multiple.db`: Simple JSON database
- `ms`: Time parsing utility
- `dotenv`: Environment variable management

## Error Handling

The bot includes comprehensive error handling for:
- Invalid invite links
- Missing channels
- Voice connection failures
- Database errors
- Unhandled promise rejections

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - see LICENSE file for details
