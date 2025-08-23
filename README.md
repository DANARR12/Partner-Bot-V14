# Discord AI Assistant Bot

A Discord bot that integrates with OpenAI's GPT models to provide AI-powered conversations with text-to-speech support in both Kurdish and English.

## Features

- 🤖 AI-powered conversations using OpenAI GPT-4o-mini
- 🌍 Bilingual support (Kurdish and English)
- 🔊 Text-to-speech functionality
- 💬 Conversation history per user
- 🎵 Voice channel integration
- 🔒 Secure credential management

## Setup

### 1. Prerequisites

- Python 3.8 or higher
- FFmpeg installed on your system
- Discord Bot Token
- OpenAI API Key

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

1. Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and add your credentials:
```env
DISCORD_TOKEN=your_discord_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section
4. Create a bot and copy the token
5. Enable the following bot permissions:
   - Send Messages
   - Use Slash Commands
   - Connect to Voice Channels
   - Speak in Voice Channels
6. Invite the bot to your server with appropriate permissions

### 5. OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get an API key
3. Add the API key to your `.env` file

## Usage

### Commands

- `/ask <question>` - Ask the AI assistant a question
- `/clear` - Clear your conversation history
- `/join` - Join your current voice channel
- `/leave` - Leave the voice channel

### Features

- **Language Detection**: Automatically detects if you're asking in Kurdish or English
- **Voice Response**: If you're in a voice channel, the bot will speak the AI's response
- **Conversation Memory**: The bot remembers your conversation history
- **Bilingual Support**: Responds in the same language you asked the question

## Security Notes

⚠️ **IMPORTANT**: Never commit your `.env` file or hardcode credentials in your code. The bot will now safely load credentials from environment variables.

## Troubleshooting

### Common Issues

1. **FFmpeg not found**: Install FFmpeg on your system
   - Ubuntu/Debian: `sudo apt install ffmpeg`
   - macOS: `brew install ffmpeg`
   - Windows: Download from [FFmpeg website](https://ffmpeg.org/download.html)

2. **Voice connection issues**: Make sure the bot has permission to join and speak in voice channels

3. **OpenAI API errors**: Check your API key and ensure you have sufficient credits

### Error Handling

The bot includes comprehensive error handling and will display helpful error messages when something goes wrong.

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.
