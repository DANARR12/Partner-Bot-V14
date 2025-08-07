# Discord Voice Channel Request Bot

A Discord bot that allows users to request joining voice channels with member approval.

## Features

- **Secure Voice Channel Requests**: Users can request to join voice channels and get approval from existing members
- **Interactive Buttons**: Clean UI with buttons for easy interaction
- **DM Notifications**: Members in target voice channels receive DM requests for approval
- **Permission Handling**: Proper error handling for missing permissions
- **Timeout Protection**: Requests expire after 5 minutes to prevent spam

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Create Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Copy the bot token

### 3. Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your bot token:
   ```
   DISCORD_TOKEN=your_actual_bot_token_here
   ```

### 4. Bot Permissions

Make sure your bot has these permissions:
- Send Messages
- Use Slash Commands
- Move Members
- Read Message History
- Send Messages in Threads
- Use External Emojis
- Add Reactions

### 5. Invite Bot to Server

Use this URL (replace `YOUR_BOT_CLIENT_ID` with your bot's client ID):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=3148800&scope=bot
```

## Usage

### Commands

- `!request_vc` - Request to join a voice channel

### How It Works

1. User types `!request_vc` while in a voice channel
2. Bot shows buttons for all available voice channels
3. User clicks a button to request joining that channel
4. Bot sends DM requests to all members in the target channel
5. Members can approve or deny the request
6. If approved, the user is moved to the target channel

## Security Features

- Bot token is stored in environment variables (not in code)
- Request timeouts prevent spam
- Proper permission checks
- Error handling for edge cases

## Troubleshooting

### Common Issues

1. **Bot can't move users**: Make sure the bot has "Move Members" permission and is above the user in the role hierarchy
2. **DMs not working**: Users may have DMs disabled from server members
3. **Token not found**: Make sure your `.env` file exists and contains the correct token

### Error Messages

- "You need to be in a voice channel first" - User must be in a VC to request joining another
- "No members in that voice channel" - Target channel is empty
- "I don't have permission to move users" - Bot lacks proper permissions

## Contributing

Feel free to submit issues and enhancement requests!
