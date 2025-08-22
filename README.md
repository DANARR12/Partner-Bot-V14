# Discord Kurdish AI Bot 🤖

An advanced Discord bot that provides AI-powered conversations in Kurdish (Kurmanji/Sorani) with intelligent language detection, persistent conversation memory, and comprehensive moderation features.

## Features ✨

- **🗣️ Kurdish-First AI**: Automatic dialect detection (Kurmanji/Sorani) with manual override
- **💾 Persistent Memory**: Per-user conversation history stored in SQLite database
- **⚡ Slash Commands**: Modern Discord slash commands with context menus
- **🛡️ Content Moderation**: OpenAI moderation API integration with safety fallbacks
- **🔄 Streaming Responses**: Real-time token streaming for faster response delivery
- **⚙️ Rate Limiting**: Built-in retry logic with exponential backoff
- **📊 Structured Logging**: Comprehensive logging for monitoring and debugging
- **🔧 Environment Config**: Easy configuration via environment variables

## Commands 📋

### Slash Commands
- `/chat <message>` - Chat with the Kurdish AI bot
- `/clear` - Clear your conversation memory in the current channel
- `/ping` - Health check command

### Context Menu
- **Ask Kurdish AI** - Right-click any message to ask the AI about it

### Legacy Commands
- `!chat <message>` - Traditional prefix command for chatting

## Setup Instructions 🚀

### 1. Prerequisites

- Python 3.8 or higher
- Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))
- OpenAI API Key ([OpenAI Platform](https://platform.openai.com/api-keys))

### 2. Installation

1. **Clone or download the project:**
   ```bash
   git clone <repository-url>
   cd discord-kurdish-ai-bot
   ```

2. **Install dependencies:**
   ```bash
   python -m pip install -U -r requirements.txt
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your actual values:
   ```env
   DISCORD_BOT_TOKEN=your_actual_discord_bot_token
   OPENAI_API_KEY=your_actual_openai_api_key
   OPENAI_MODEL=gpt-4o-mini
   KURDISH_DIALECT=auto
   MAX_HISTORY=10
   OPENAI_CONCURRENCY=3
   DB_PATH=memory.sqlite3
   OWNER_IDS=your_discord_user_id
   ```

### 3. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application and bot
3. Copy the bot token to your `.env` file
4. Enable the following bot permissions:
   - Send Messages
   - Use Slash Commands
   - Read Message History
   - Add Reactions
5. Enable these privileged gateway intents:
   - Message Content Intent
6. Invite the bot to your server with the generated OAuth2 URL

### 4. Running the Bot

```bash
python main.py
```

The bot will:
- Initialize the SQLite database
- Sync slash commands with Discord
- Start listening for interactions

## Configuration Options ⚙️

| Variable | Default | Description |
|----------|---------|-------------|
| `DISCORD_BOT_TOKEN` | Required | Your Discord bot token |
| `OPENAI_API_KEY` | Required | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model to use |
| `KURDISH_DIALECT` | `auto` | Language mode: `auto`, `kurmanji`, `sorani` |
| `MAX_HISTORY` | `10` | Messages per user per channel to remember |
| `OPENAI_CONCURRENCY` | `3` | Max concurrent OpenAI API calls |
| `DB_PATH` | `memory.sqlite3` | SQLite database file path |
| `OWNER_IDS` | Empty | Comma-separated Discord user IDs for owners |

## Kurdish Language Support 🗣️

### Dialect Detection
- **Auto Mode**: Automatically detects Kurmanji or Sorani from user input
- **Kurmanji Mode**: Forces responses in Kurmanji (Latin script)
- **Sorani Mode**: Forces responses in Sorani (Arabic script)

### Language Examples

**Kurmanji (Latin):**
```
User: Çawa ye heval?
Bot: Silav! Ez baş im, spas. Tu çawa yî?
```

**Sorani (Arabic):**
```
User: چۆنیت برا؟
Bot: سڵاو! من باشم، سوپاس. تۆ چۆنیت؟
```

## Database Schema 💾

The bot uses SQLite to store conversation history:

```sql
CREATE TABLE memory (
    guild_id    INTEGER,
    channel_id  INTEGER,
    user_id     INTEGER,
    messages    TEXT,  -- JSON array of message objects
    PRIMARY KEY (guild_id, channel_id, user_id)
);
```

## Error Handling & Safety 🛡️

- **Content Moderation**: All messages are screened using OpenAI's moderation API
- **Rate Limiting**: Exponential backoff prevents API abuse
- **Graceful Degradation**: Bot continues operating even if moderation fails
- **Message Sanitization**: Prevents @everyone/@here abuse
- **Length Limits**: Messages are truncated to Discord's limits

## Logging 📊

The bot provides structured logging with different levels:

- **INFO**: Bot startup, command sync, user interactions
- **WARNING**: Moderation failures, API issues
- **ERROR**: Critical failures, database errors
- **DEBUG**: Detailed operation information

## Deployment 🚀

### Local Development
```bash
python main.py
```

### Production Deployment
1. Use a process manager like `systemd` or `pm2`
2. Set up log rotation
3. Use environment variables for configuration
4. Consider using Docker for containerization

### Docker Example
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

## Troubleshooting 🔧

### Common Issues

1. **Bot not responding to slash commands:**
   - Check if commands are synced (restart bot)
   - Verify bot has necessary permissions
   - Check console for sync errors

2. **OpenAI API errors:**
   - Verify API key is correct and has credits
   - Check model availability
   - Review rate limits

3. **Database errors:**
   - Ensure write permissions for database file
   - Check disk space
   - Verify SQLite installation

4. **Memory issues:**
   - Adjust `MAX_HISTORY` to lower value
   - Monitor database size
   - Consider periodic cleanup

### Debug Mode
Set logging level to DEBUG for detailed information:
```python
logging.basicConfig(level=logging.DEBUG)
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Support 💬

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the logs for error details

## Acknowledgments 🙏

- OpenAI for the GPT API
- Discord.py community
- Kurdish language community
- Contributors and testers
