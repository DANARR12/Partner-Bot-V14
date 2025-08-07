# Xbox News Discord Bot

A Discord bot that automatically posts the latest Xbox news from the official Xbox news feed to a specified Discord channel. The bot checks for new posts every 30 minutes and also provides manual commands to fetch the latest news.

## Features

- 📰 Automatically posts new Xbox news every 30 minutes
- 🕹️ Manual command to fetch latest Xbox Game Pass news
- 🏓 Ping command to check bot responsiveness
- 🔧 Environment variable configuration
- 🛡️ Error handling and logging

## Prerequisites

- Python 3.8 or higher
- A Discord application and bot token
- Access to a Discord server where you can add the bot

## Setup Instructions

### 1. Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section in the sidebar
4. Click "Add Bot"
5. Copy the bot token (you'll need this later)
6. Under "Privileged Gateway Intents", enable "Message Content Intent" if you want the bot to respond to commands

### 2. Invite the Bot to Your Server

1. In the Discord Developer Portal, go to "OAuth2" > "URL Generator"
2. Select "bot" scope
3. Select the following bot permissions:
   - Send Messages
   - Read Messages
   - Use Slash Commands (optional)
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

### 3. Get Channel ID

1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click on the channel where you want news posted
3. Select "Copy ID"
4. Save this ID for configuration

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your actual values:
```
DISCORD_BOT_TOKEN=your_actual_bot_token_here
CHANNEL_ID=your_actual_channel_id_here
```

### 6. Run the Bot

```bash
python bot.py
```

The bot should connect to Discord and start monitoring for Xbox news!

## Commands

- `!gamepassnews` - Manually fetch and display the latest Xbox news
- `!ping` - Check if the bot is responsive

## Configuration

The bot monitors the Xbox official news RSS feed: `https://news.xbox.com/en-us/feed/`

You can modify the following settings in `bot.py`:
- `RSS_FEED` - Change the RSS feed URL
- Check interval (currently 30 minutes) - Modify the `@tasks.loop(minutes=30)` decorator
- Command prefix (currently `!`) - Modify the `command_prefix` parameter

## Troubleshooting

### Bot doesn't respond to commands
- Make sure the bot has "Send Messages" permission in the channel
- Verify that "Message Content Intent" is enabled in the Discord Developer Portal

### No news posts automatically
- Check that the `CHANNEL_ID` is correct
- Verify the bot has permissions to send messages in that channel
- Check the console for error messages

### "Channel not found" error
- Double-check the channel ID in your `.env` file
- Make sure the bot is in the same server as the channel
- Verify the bot has access to view the channel

## File Structure

```
xbox-news-bot/
├── bot.py              # Main bot code
├── requirements.txt    # Python dependencies
├── .env.example       # Example environment variables
├── .env              # Your actual environment variables (create this)
└── README.md         # This file
```

## License

This project is open source and available under the MIT License.
