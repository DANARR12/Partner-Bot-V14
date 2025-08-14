#!/bin/bash

echo "🚀 Starting Discord Partner Bot Forever..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Please create .env file with DISCORD_TOKEN=your_token_here"
    echo ""
    read -p "Do you want to create .env file now? (y/n): " create_env
    if [ "$create_env" = "y" ] || [ "$create_env" = "Y" ]; then
        echo "DISCORD_TOKEN=your_discord_bot_token_here" > .env
        echo "✅ .env file created. Please edit it with your Discord bot token."
        echo "Then run this script again."
        exit 0
    else
        echo "❌ Cannot start bot without Discord token."
        exit 1
    fi
fi

# Validate configuration
echo "🔍 Validating configuration..."
if npm run validate-config > /dev/null 2>&1; then
    echo "✅ Configuration is valid"
else
    echo "❌ Configuration validation failed"
    echo "Please check your config.json file"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 not found. Installing PM2..."
    npm install -g pm2
fi

# Stop any existing instances
echo "🛑 Stopping any existing instances..."
pm2 stop discord-partner-bot 2>/dev/null || true
pm2 delete discord-partner-bot 2>/dev/null || true

# Start the bot
echo "🚀 Starting bot with PM2..."
npm run forever

# Show status
echo ""
echo "📊 Bot Status:"
pm2 status

echo ""
echo "🎉 Bot is now running forever!"
echo ""
echo "📋 Useful commands:"
echo "  npm run status    - Check bot status"
echo "  npm run logs      - View bot logs"
echo "  npm run monitor   - Open PM2 monitor"
echo "  npm run restart   - Restart the bot"
echo "  npm run stop      - Stop the bot"
echo "  npm run delete    - Remove the bot from PM2"
echo ""
echo "📝 View logs: npm run logs"
echo "🔄 To restart: npm run restart"
echo "🛑 To stop: npm run stop"
echo ""