# Discord Voice Channel Request Bot

A Discord bot that allows users to request permission to join voice channels. Members in the target voice channel will receive a DM asking for permission to allow the requester to join.

## Features

- Request to join any voice channel in the server
- Members in the target channel receive DM requests for permission
- Automatic approval if the target channel is empty
- Beautiful embed messages with member counts
- Proper error handling and user feedback
- Secure token management using environment variables

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create a Discord Bot**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to the "Bot" section and create a bot
   - Copy the bot token

3. **Configure Environment Variables**
   - Rename `.env.example` to `.env`
   - Replace `your_bot_token_here` with your actual bot token

4. **Invite Bot to Server**
   - Go to OAuth2 > URL Generator in the Developer Portal
   - Select the following scopes:
     - `bot`
     - `applications.commands`
   - Select the following bot permissions:
     - `Send Messages`
     - `Use Slash Commands`
     - `Move Members`
     - `Read Message History`
     - `Embed Links`
   - Use the generated URL to invite the bot to your server

5. **Run the Bot**
   ```bash
   python discord_vc_bot.py
   ```

## Usage

- Use the command `!request_vc` to start the voice channel request process
- Select a voice channel from the buttons that appear
- Members in the selected channel will receive a DM with approval buttons
- If approved, the requester will be moved to the target channel

## Security Notes

- Never share your bot token publicly
- The `.env` file is included in `.gitignore` to prevent accidental commits
- The bot only responds to the user who initiated the request

## Permissions Required

The bot needs the following permissions in your Discord server:
- Send Messages
- Use Slash Commands
- Move Members
- Read Message History
- Embed Links

## Troubleshooting

- **Bot not responding**: Check if the bot has the required permissions
- **Cannot move users**: Ensure the bot has "Move Members" permission and is above the target role in the server hierarchy
- **DMs not working**: Users may have DMs disabled from server members
