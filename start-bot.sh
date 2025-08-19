#!/bin/bash

# Discord Bot Forever Management Script
echo "🤖 Discord Advertisement Bot - Forever Manager"
echo "=============================================="

# Check if .env file exists and has a token
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Check if token is set (not the placeholder)
if grep -q "your_new_regenerated_token_here" .env; then
    echo "⚠️  WARNING: You need to update your Discord token in .env file!"
    echo ""
    echo "Steps to fix:"
    echo "1. Go to Discord Developer Portal"
    echo "2. Regenerate your bot token"
    echo "3. Edit .env file and replace 'your_new_regenerated_token_here' with your actual token"
    echo "4. Run this script again"
    echo ""
    echo "To edit .env file, run: nano .env"
    exit 1
fi

# Check if bot is already running
if forever list | grep -q "index.js"; then
    echo "🟡 Bot is already running with Forever"
    echo ""
    echo "Available commands:"
    echo "  forever list          - Show running processes"
    echo "  forever stop index.js - Stop the bot"
    echo "  forever restart index.js - Restart the bot"
    echo "  forever logs index.js - Show bot logs"
else
    echo "🚀 Starting Discord bot with Forever..."
    forever start index.js
    
    if [ $? -eq 0 ]; then
        echo "✅ Bot started successfully!"
        echo ""
        echo "Useful commands:"
        echo "  forever list          - Show running processes"
        echo "  forever stop index.js - Stop the bot"
        echo "  forever restart index.js - Restart the bot"
        echo "  forever logs index.js - Show bot logs"
        echo ""
        echo "📋 Current status:"
        forever list
    else
        echo "❌ Failed to start bot"
        exit 1
    fi
fi