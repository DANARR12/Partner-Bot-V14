# Discord Partner Bot

A Discord bot designed to handle server partnerships and advertisements through direct messages.

## Features

- **Advertisement Handling**: Users can send server invites via DM to be posted in a partner channel
- **Cooldown System**: 1-hour cooldown between advertisement posts
- **Auto Voice Channel Join**: Bot automatically joins a specified voice channel
- **Multi-language Support**: Supports English and Kurdish responses
- **Error Handling**: Comprehensive error handling and logging

## Setup

### Prerequisites

- Node.js 18.0.0 or higher
- A Discord bot token
- Discord server with appropriate permissions

### Installation

1. Clone this repository:
```bash
git clone <your-repo-url>
cd discord-partner-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` file and add your Discord bot token:
```
DISCORD_TOKEN=your_discord_bot_token_here
```

5. Create config file:
```bash
cp config.example.json config.json
```

6. Edit `config.json` with your server settings:
```json
{
  "partner": "YOUR_PARTNER_CHANNEL_ID",
  "link": "https://discord.gg/YOUR_INVITE_LINK", 
  "idvc": "YOUR_VOICE_CHANNEL_ID"
}
```

### Running the Bot

Start the bot:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Configuration

### config.json

- `partner`: Channel ID where advertisements will be posted
- `link`: Your server's invite link to share with users
- `idvc`: Voice channel ID for the bot to auto-join

## Usage

### For Users

1. **Request Advertisement**: Send "Reklam" or "reklam" in any server channel
2. **Submit Advertisement**: DM the bot with a Discord server invite link
3. **Cooldown**: Wait 1 hour between advertisement submissions

### Bot Commands

- Responds to bot mentions with "Dm Me For Ads"
- Handles advertisement requests automatically
- Posts valid invites to the partner channel

## File Structure

```
├── src/
│   ├── bot.js              # Main bot file (organized version)
│   ├── events/
│   │   ├── ready.js        # Ready event handler
│   │   └── messageCreate.js # Message event handler
│   └── utils/
│       └── eventLoader.js  # Event loading utility
├── bot.js                  # Original monolithic version
├── config.json            # Bot configuration
├── .env                   # Environment variables
└── package.json           # Dependencies and scripts
```

## Features Breakdown

### Advertisement System
- Users DM the bot with Discord invite links
- Bot validates the invite and posts it to the partner channel
- Includes user attribution and server promotion link

### Cooldown Management
- 1-hour cooldown per user using `multiple.db`
- Prevents spam while allowing regular promotion
- Graceful error handling for cooldown messages

### Voice Channel Integration
- Automatically joins specified voice channel on startup
- Maintains persistent voice presence
- Handles voice connection errors gracefully

### Multi-language Support
- Kurdish language support for local users
- English fallbacks for international users
- Culturally appropriate responses

## Error Handling

The bot includes comprehensive error handling:
- Database connection errors
- Discord API failures
- Invalid invite links
- Missing channels/permissions
- Voice connection issues

## Dependencies

- **discord.js**: Discord API wrapper
- **@discordjs/voice**: Voice channel functionality  
- **multiple.db**: Simple JSON database
- **ms**: Time parsing utility
- **dotenv**: Environment variable management

## License

ISC License - See package.json for details.

## Author

SmSm

## Support

For issues or questions, please check the error logs and ensure all configuration values are correct.
