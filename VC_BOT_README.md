# 🎤 Discord Voice Channel Request Bot

A Discord bot that allows users to request permission to join voice channels by sending DMs to current channel members for approval.

## ✨ Features

- **Voice Channel Selection**: Browse and select from available voice channels
- **Permission-Based Requests**: Members in target channels receive DM requests with approve/deny buttons  
- **Smart Validation**: Prevents duplicate requests and validates user states
- **Timeout Handling**: Requests automatically expire after 5 minutes
- **Rich Embeds**: Beautiful, informative messages with user avatars and channel info
- **Error Handling**: Comprehensive error handling for various edge cases
- **Permission Checks**: Validates bot and user permissions before executing actions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
chmod +x setup_vc_bot.sh
./setup_vc_bot.sh
```

### 2. Set Bot Token
```bash
export DISCORD_TOKEN='your_bot_token_here'
```

### 3. Run the Bot
```bash
python3 discord_vc_request_bot.py
```

## 🔧 Setup Guide

### Creating a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section in the sidebar
4. Click "Reset Token" and copy the token
5. Enable these **Privileged Gateway Intents**:
   - Message Content Intent
   - Server Members Intent

### Bot Permissions

Your bot needs these permissions:
- **Send Messages** - To respond to commands
- **Move Members** - To move users between voice channels  
- **Read Message History** - To process commands
- **Use External Emojis** - For enhanced UI (optional)

### Invite URL

Use this URL to invite your bot (replace `YOUR_CLIENT_ID` with your bot's client ID):

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=16793600&scope=bot
```

## 📋 Commands

| Command | Aliases | Description |
|---------|---------|-------------|
| `!request_vc` | `!requestvc`, `!join_vc`, `!joinvc` | Request to join a voice channel |
| `!help_vc` | `!vchelp` | Show help information |

## 🎯 How It Works

1. **User Initiates Request**: User types `!request_vc` while in a voice channel
2. **Channel Selection**: Bot displays buttons for all available voice channels
3. **Request Sent**: Bot sends DMs to all non-bot members in the selected channel
4. **Member Decision**: Channel members can approve or deny the request via buttons
5. **User Moved**: If approved, the requesting user is moved to the target channel

## 🛡️ Security Features

- **Environment Variables**: Bot token stored securely as environment variable
- **Input Validation**: All user inputs and bot states are validated
- **Permission Checks**: Bot verifies permissions before attempting actions
- **Rate Limiting**: Built-in Discord.py rate limiting prevents spam
- **Error Isolation**: Errors in one request don't affect others

## 🔍 Requirements

- **User Requirements**:
  - Must be in a voice channel to make requests
  - Target channel must have non-bot members
  - Members must have DMs enabled to receive requests

- **Bot Requirements**:
  - "Move Members" permission in the server
  - Ability to send DMs to users

## ⚠️ Important Notes

- **DM Dependencies**: If target channel members have DMs disabled, they won't receive requests
- **Request Timeouts**: All requests expire after 5 minutes to prevent stale interactions
- **Single Approval**: Only one member needs to approve for the user to be moved
- **Bot Member Exclusion**: Bots are automatically excluded from approval processes

## 🐛 Troubleshooting

### Common Issues

**"I don't have permission to move members"**
- Ensure the bot has "Move Members" permission
- Check that the bot's role is higher than the user's highest role

**"Couldn't send messages to any members"**
- Target channel members may have DMs disabled
- Try requesting access through text chat instead

**"You must be in a voice channel"**
- Join any voice channel before using `!request_vc`
- Ensure you have permission to join voice channels

**"No other voice channels found"**
- Server only has one voice channel, or you're in the only available one
- Ask an admin to create more voice channels

## 📝 Code Structure

```
discord_vc_request_bot.py
├── VCConfirmationView     # Handles approve/deny buttons
├── VCSelectionView       # Handles VC selection interface  
├── request_vc()          # Main command function
├── help_vc()            # Help command
└── Error Handlers       # Comprehensive error handling
```

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## 📄 License

This project is open source and available under the MIT License.