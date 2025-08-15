# Discord Advertisement Bot

A Discord bot that manages server advertisements with a cooldown system. Users can submit Discord server invites via DM, and the bot will post them to a designated channel with proper cooldown management.

## Features

- 📨 Advertisement submission via Direct Messages
- ⏰ 60-minute cooldown system per user
- 🔊 Automatic voice channel connection
- 🌐 Multilingual support (Kurdish/English)
- 🛡️ Invite link validation
- 📊 Database storage for cooldowns
- 🔄 Graceful error handling

## Setup

### Prerequisites

- Node.js 16.9.0 or higher
- A Discord application/bot token
- Discord server with appropriate permissions

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create configuration file:
   ```bash
   cp config.json.example config.json
   ```

4. Edit `config.json` with your settings:
   ```json
   {
       "partner": "PARTNER_CHANNEL_ID_HERE",
       "link": "YOUR_PROMOTIONAL_LINK_HERE", 
       "idvc": "VOICE_CHANNEL_ID_HERE"
   }
   ```

5. Set up environment variables:
   ```bash
   # Linux/Mac
   export DISCORD_TOKEN="your_discord_bot_token_here"
   
   # Windows
   set DISCORD_TOKEN=your_discord_bot_token_here
   ```

6. Run the bot:
   ```bash
   npm start
   ```

### Configuration

#### config.json Parameters

- `partner` - Channel ID where advertisements will be posted
- `link` - Optional promotional link to include in confirmation messages
- `idvc` - Voice channel ID for the bot to join (optional)

#### Environment Variables

- `DISCORD_TOKEN` - Your Discord bot token (required)

### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token and set it as `DISCORD_TOKEN` environment variable
5. Under "Privileged Gateway Intents", enable:
   - Message Content Intent
   - Server Members Intent
6. Invite the bot to your server with these permissions:
   - Send Messages
   - Read Message History
   - Connect (for voice)
   - Use Voice Activity

## Usage

### For Users

1. **Request Advertisement**: Type `reklam` or `Reklam` in any channel
2. **Submit Advertisement**: Send a Discord invite link via DM to the bot
3. **Cooldown**: Wait 60 minutes between submissions

### Bot Responses

- **Kurdish**: `رێکلام لە تایبەت بۆم بنێرە` (Send advertisement privately to me)
- **English**: `DM Me For Ads`

### Commands

- `reklam` / `Reklam` - Get instructions for advertisement submission
- `@Bot` - Get advertisement submission instructions
- Send invite link in DM - Submit advertisement

## File Structure

```
├── index.js              # Main bot file
├── config.json          # Bot configuration
├── config.json.example  # Configuration template
├── package.json         # Dependencies and scripts
├── README.md           # This file
└── database.json       # Auto-generated database file
```

## Database

The bot uses `multiple.db` with JSON storage. Cooldown data is automatically stored in `database.json`.

## Error Handling

- Invalid invite links are rejected with user feedback
- Missing configuration shows helpful error messages
- Voice channel connection failures are logged but don't stop the bot
- Network errors are caught and logged

## Development

### Scripts

- `npm start` - Run the bot
- `npm run dev` - Run with nodemon for development

### Adding Features

The code is modular with separate functions for:
- `handlePublicMessage()` - Public channel interactions
- `handleDirectMessage()` - Advertisement submission handling
- `connectToVoiceChannel()` - Voice channel management

## Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check if bot token is correct
   - Verify bot has necessary permissions
   - Check if config.json exists and is valid

2. **Voice connection fails**
   - Ensure bot has Connect permission
   - Verify voice channel ID is correct
   - Check if channel exists

3. **Database errors**
   - Ensure write permissions in bot directory
   - Check if multiple.db is properly installed

### Support

If you encounter issues:
1. Check the console for error messages
2. Verify all configuration values
3. Ensure all dependencies are installed
4. Check Discord permissions

## License

This project is licensed under the MIT License.
