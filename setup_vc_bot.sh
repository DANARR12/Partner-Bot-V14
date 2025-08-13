#!/bin/bash

echo "🎤 Voice Channel Request Bot Setup"
echo "=================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check Python version
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "🐍 Python version: $python_version"

# Install dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Check if DISCORD_TOKEN is set
if [ -z "$DISCORD_TOKEN" ]; then
    echo ""
    echo "⚠️  DISCORD_TOKEN environment variable is not set!"
    echo "🔧 Please set your Discord bot token:"
    echo "   export DISCORD_TOKEN='your_bot_token_here'"
    echo ""
    echo "📋 To get a bot token:"
    echo "   1. Go to https://discord.com/developers/applications"
    echo "   2. Create a new application"
    echo "   3. Go to the 'Bot' section"
    echo "   4. Click 'Reset Token' and copy the token"
    echo "   5. Invite the bot to your server with the following permissions:"
    echo "      - Send Messages"
    echo "      - Use Slash Commands"
    echo "      - Move Members"
    echo "      - Read Message History"
    echo ""
    echo "🔗 Use this invite URL (replace YOUR_CLIENT_ID):"
    echo "   https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=16793600&scope=bot"
    echo ""
    exit 1
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 To run the Voice Channel Request Bot:"
echo "   python3 discord_vc_request_bot.py"
echo ""
echo "📋 Commands:"
echo "   !request_vc - Request to join a voice channel"
echo "   !help_vc    - Show help message"